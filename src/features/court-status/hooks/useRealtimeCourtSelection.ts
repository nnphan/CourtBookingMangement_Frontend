import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { HubConnectionBuilder } from '@microsoft/signalr';
import { useAuthStore } from '@/features/auth/store/auth.store';
import {
  courtSelectionGuestHeaders,
  ensureCourtSelectionGuest,
  reserveCourtSelectionSession,
} from '@/lib/court-selection-session';
import { http } from '@/lib/axios';
import { getUsableAccessToken } from '@/lib/token-storage';
import { env } from '@/lib/env';
import dayjs from '@/lib/dayjs';
import { toast } from '@/lib/toast';
import type { ApiEnvelope, ApiErrorShape } from '@/types/api';
import {
  computeSlotEndTime,
  getSlotKey,
  mergeContiguousSlotsByCourtAndDate,
  normalizeTime,
  rangesOverlap,
  type NormalizedBookingRange,
} from '../utils/court-slot-selection.utils';

type Scope = { branchId: string; businessDate: string };
type HeldSlot = {
  slotId: string;
  courtId: string;
  startTime: string;
  endTime: string;
  expiresAt: string;
  holdId: string | null;
};
type Snapshot = Scope & {
  serverTime: string;
  timeZone: string;
  operatingWindows: { startTime: string; endTime: string }[];
  slots: HeldSlot[];
};
export type RealtimeSlotState =
  'HOLDING' | 'RELEASING' | 'HELD_BY_ME' | 'HELD_BY_OTHER' | 'BLOCKED' | 'PAST';

export function useRealtimeCourtSelection(
  branchId: string | undefined,
  businessDate: string,
  courts: readonly { id: string; name: string }[],
  refreshBookings: () => void,
  duration = 60,
  allowClaim = true,
) {
  const profileId = useAuthStore((s) => s.user?.id);
  const hasAccessToken = Boolean(getUsableAccessToken());
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const [ownerSessionId, setOwnerSessionId] = useState<string>();
  const [connected, setConnected] = useState(false);
  const [initializedBoard, setInitializedBoard] = useState<string>();
  const [clock, setClock] = useState(Date.now);
  const pending = useRef(new Map<string, RealtimeSlotState>());
  const [pendingStates, setPendingStates] = useState<ReadonlyMap<string, RealtimeSlotState>>(
    () => new Map(),
  );
  const client = useQueryClient();
  const subscription = `${branchId}:${businessDate}:${ownerSessionId}`;
  useEffect(() => {
    let mounted = true;
    void reserveCourtSelectionSession().then((id) => {
      if (mounted) setOwnerSessionId(id);
    });
    return () => {
      mounted = false;
    };
  }, []);
  const path = '/court-selections';
  const guest = useQuery({
    queryKey: ['court-selection-guest', ownerSessionId],
    queryFn: () => (ownerSessionId ? ensureCourtSelectionGuest(ownerSessionId) : null),
    enabled: Boolean(branchId && ownerSessionId && hasHydrated && !hasAccessToken && allowClaim),
    staleTime: 60_000,
    refetchInterval: 5 * 60_000,
  });
  const ownerKey = hasAccessToken ? (profileId ?? 'authenticated') : 'guest';
  const guestHeaders = hasAccessToken ? {} : courtSelectionGuestHeaders(ownerSessionId);
  const hasOwner =
    hasHydrated && (hasAccessToken || Boolean(guest.data && guestHeaders['X-Court-Selection-Guest']));
  const boardKey = useMemo(
    () => ['court-selections', branchId, businessDate, ownerSessionId, ownerKey] as const,
    [branchId, businessDate, ownerSessionId, ownerKey],
  );
  const snapshot = useQuery({
    queryKey: boardKey,
    enabled: Boolean(
      branchId &&
      ownerSessionId &&
      hasHydrated &&
      initializedBoard === subscription &&
      (hasOwner || !allowClaim),
    ),
    queryFn: async ({ signal }) =>
      (
        await http.get<ApiEnvelope<Snapshot>>(`${path}/${branchId}/${businessDate}`, {
          signal,
          params: { ownerSessionId },
          headers: hasAccessToken ? {} : courtSelectionGuestHeaders(ownerSessionId),
        })
      ).data.data,
    refetchInterval: connected ? 10_000 : 3_000,
  });

  useEffect(() => {
    if (!branchId || !ownerSessionId) return;
    const scopedBranch = branchId.toLowerCase();
    setConnected(false);
    const connection = new HubConnectionBuilder()
      .withUrl(env.apiBaseUrl.replace(/\/api\/?$/, '') + '/hubs/court-status')
      .withAutomaticReconnect()
      .build();
    let active = true;
    let retry: number | undefined;
    // Load a snapshot even if the realtime handshake is slow or unavailable.
    const fallbackTimer = window.setTimeout(() => {
      if (active) setInitializedBoard(subscription);
    }, 2500);
    function reconcile() {
      if (!active) return;
      void client
        .cancelQueries({ queryKey: boardKey, exact: true })
        .then(() => client.invalidateQueries({ queryKey: boardKey, exact: true }));
      refreshBookings();
    }
    async function join() {
      await connection.invoke('JoinCourtStatus', branchId, businessDate);
      if (!active) return;
      window.clearTimeout(fallbackTimer);
      setConnected(true);
      setInitializedBoard(subscription);
      reconcile();
    }
    function scheduleRetry() {
      if (!active || retry !== undefined) return;
      retry = window.setTimeout(() => {
        retry = undefined;
        void start();
      }, 3000);
    }
    async function start() {
      try {
        await connection.start();
        await join();
      } catch {
        await connection.stop();
        if (active) setInitializedBoard(subscription);
        scheduleRetry();
      }
    }
    function onBoardChanged(event: Scope) {
      if (event.branchId.toLowerCase() === scopedBranch && event.businessDate === businessDate)
        reconcile();
    }
    for (const event of ['SlotHeld', 'SlotReleased', 'SlotsBooked', 'CourtStatusInvalidated']) {
      connection.on(event, onBoardChanged);
    }
    connection.onreconnecting(() => {
      if (active) setConnected(false);
    });
    connection.onreconnected(() => {
      void join().catch(() => connection.stop());
    });
    connection.onclose(() => {
      if (!active) return;
      setConnected(false);
      scheduleRetry();
    });
    const refreshTimer = window.setInterval(refreshBookings, 10_000);
    void start();
    return () => {
      active = false;
      window.clearTimeout(fallbackTimer);
      if (retry !== undefined) window.clearTimeout(retry);
      window.clearInterval(refreshTimer);
      // Stopping the connection removes its group membership on the server.
      void connection.stop();
    };
  }, [branchId, businessDate, boardKey, client, ownerSessionId, refreshBookings, subscription]);

  const held = snapshot.data?.slots ?? [];
  const mine = held.filter((slot) => slot.holdId);
  const first = mine[0];
  const remaining =
    first && snapshot.data
      ? Math.max(
          0,
          Math.ceil(
            (Date.parse(first.expiresAt) -
              Date.parse(snapshot.data.serverTime) -
              Math.max(0, clock - snapshot.dataUpdatedAt)) /
              1000,
          ),
        )
      : undefined;

  useEffect(() => {
    if (!first?.expiresAt) return;
    const timer = window.setInterval(() => setClock(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [first?.expiresAt]);
  useEffect(() => {
    if (remaining === 0) void client.invalidateQueries({ queryKey: boardKey });
  }, [remaining, boardKey, client]);

  const scope = `${branchId}:${businessDate}:${ownerSessionId}:${ownerKey}:`;
  function headers(key: string) {
    const guestHeaders = hasAccessToken ? {} : courtSelectionGuestHeaders(ownerSessionId);
    if (
      hasAccessToken !== Boolean(getUsableAccessToken()) ||
      (!hasAccessToken && !guestHeaders['X-Court-Selection-Guest'])
    ) {
      throw { status: 401 };
    }
    return { 'Idempotency-Key': key, ...guestHeaders };
  }
  const slotKey = (courtId: string, startTime: string) =>
    scope + getSlotKey({ courtId, bookingDate: businessDate, startTime });
  const slotRange = (startTime: string) => ({
    startTime: normalizeTime(startTime),
    endTime: computeSlotEndTime(startTime, duration),
  });
  const branchNow = snapshot.data?.timeZone
    ? dayjs(Date.parse(snapshot.data.serverTime) + Math.max(0, clock - snapshot.dataUpdatedAt)).tz(
        snapshot.data.timeZone,
      )
    : undefined;
  const branchToday = branchNow?.format('YYYY-MM-DD');
  const getState = (courtId: string, startTime: string): RealtimeSlotState | undefined => {
    const pendingState = pendingStates.get(slotKey(courtId, startTime));
    if (pendingState) return pendingState;
    const range = slotRange(startTime);
    const match = held.find((slot) => slot.courtId === courtId && rangesOverlap(slot, range));
    if (match)
      return match.holdId && match.startTime === range.startTime && match.endTime === range.endTime
        ? 'HELD_BY_ME'
        : 'HELD_BY_OTHER';
    if (
      branchNow &&
      branchToday &&
      (businessDate < branchToday ||
        (businessDate === branchToday && range.startTime <= branchNow.format('HH:mm:ss')))
    )
      return 'PAST';
    if (
      snapshot.data?.operatingWindows &&
      !snapshot.data.operatingWindows.some(
        (window) => range.startTime >= window.startTime && range.endTime <= window.endTime,
      )
    )
      return 'BLOCKED';
    return undefined;
  };

  async function mutate(
    keys: string[],
    state: RealtimeSlotState,
    run: (key: string) => Promise<unknown>,
  ) {
    if (!branchId || keys.some((key) => pending.current.has(key))) return;
    for (const key of keys) pending.current.set(key, state);
    setPendingStates(new Map(pending.current));
    const key = crypto.randomUUID();
    try {
      try {
        await run(key);
      } catch (error) {
        const status = (error as ApiErrorShape).status;
        if (status && status < 500) throw error;
        await run(key);
      }
    } catch (error) {
      const failure = error as ApiErrorShape;
      toast.error(
        failure.code === 'SLOT_NOT_AVAILABLE'
          ? 'Sân vừa được người khác chọn.'
          : failure.status === 409 || failure.status === 429
            ? failure.message
            : 'Không thể cập nhật khung giờ. Vui lòng thử lại.',
      );
      refreshBookings();
    } finally {
      await client.cancelQueries({ queryKey: boardKey, exact: true });
      await client.invalidateQueries({ queryKey: boardKey, exact: true });
      for (const key of keys) pending.current.delete(key);
      setPendingStates(new Map(pending.current));
    }
  }

  function release(slots: HeldSlot[], all = false) {
    if (!first?.holdId || slots.length === 0) return;
    const url = `${path}/${first.holdId}`;
    const params = { branchId, businessDate, ownerSessionId };
    if (all) {
      void mutate(
        slots.map((s) => slotKey(s.courtId, s.startTime)),
        'RELEASING',
        (key) => http.delete(url, { params, headers: headers(key) }),
      );
      return;
    }
    for (const slot of slots) {
      void mutate([slotKey(slot.courtId, slot.startTime)], 'RELEASING', (key) =>
        http.delete(`${url}/slots/${slot.slotId}`, { params, headers: headers(key) }),
      );
    }
  }

  function toggleSlot(courtId: string, startTime: string) {
    if (!allowClaim || !hasOwner || !snapshot.isSuccess) return;
    const state = getState(courtId, startTime);
    const range = slotRange(startTime);
    if (state === 'HELD_BY_ME') {
      release(
        mine.filter((slot) => slot.courtId === courtId && slot.startTime === range.startTime),
      );
    } else if (!state) {
      void mutate([slotKey(courtId, startTime)], 'HOLDING', (key) =>
        http.post(
          `${path}/slots`,
          { branchId, businessDate, ownerSessionId, courtId, ...range },
          { headers: headers(key) },
        ),
      );
    }
  }

  const normalizedRanges = mergeContiguousSlotsByCourtAndDate(
    mine.map((slot) => ({
      ...slot,
      bookingDate: businessDate,
      courtName: courts.find((court) => court.id === slot.courtId)?.name ?? slot.courtId,
    })),
  );
  return {
    connected,
    ready: Boolean(snapshot.isSuccess && hasOwner),
    remaining,
    branchToday,
    getState,
    toggleSlot,
    holdId: first?.holdId,
    ownerSessionId,
    busy:
      [...pendingStates.keys()].some((key) => key.startsWith(scope)) ||
      remaining === 0 ||
      snapshot.isError,
    normalizedRanges,
    totalDurationHours: normalizedRanges.reduce((sum, range) => sum + range.durationHours, 0),
    totalCourtCount: new Set(mine.map((slot) => slot.courtId)).size,
    removeRange: (range: NormalizedBookingRange) =>
      release(mine.filter((slot) => slot.courtId === range.courtId && rangesOverlap(slot, range))),
    removeCourt: (courtId: string) => release(mine.filter((slot) => slot.courtId === courtId)),
    clearSelection: () => release(mine, true),
  };
}
