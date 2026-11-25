// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { tokenStorage } from '@/lib/token-storage';
import { useRealtimeCourtSelection } from './useRealtimeCourtSelection';

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  delete: vi.fn(),
  toast: vi.fn(),
  invoke: vi.fn(),
  events: new Map<string, (...args: never[]) => void>(),
}));

vi.mock('@/lib/axios', () => ({ http: mocks }));
vi.mock('@/lib/toast', () => ({ toast: { error: mocks.toast } }));
vi.mock('@/features/auth/store/auth.store', () => ({
  useAuthStore: (select: (state: { user: { id: string }; hasHydrated: boolean }) => unknown) =>
    select({ user: { id: 'user-a' }, hasHydrated: true }),
}));
vi.mock('@/lib/court-selection-session', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/court-selection-session')>()),
  reserveCourtSelectionSession: () => Promise.resolve('session-a'),
}));
vi.mock('@microsoft/signalr', () => ({
  HubConnectionBuilder: class {
    withUrl() {
      return this;
    }
    withAutomaticReconnect() {
      return this;
    }
    build() {
      return {
        start: async () => undefined,
        stop: async () => undefined,
        invoke: mocks.invoke,
        on: (name: string, fn: (...args: never[]) => void) => mocks.events.set(name, fn),
        onreconnecting: (fn: () => void) => mocks.events.set('reconnecting', fn),
        onreconnected: (fn: () => void) => mocks.events.set('reconnected', fn),
        onclose: (fn: () => void) => mocks.events.set('close', fn),
      };
    }
  },
}));

const branchId = 'branch-a';
const businessDate = '2026-11-27';
const courts = [{ id: 'court-a', name: 'Sân 1' }];
const own = {
  slotId: 'slot-a',
  holdId: 'hold-a',
  courtId: 'court-a',
  startTime: '07:00:00',
  endTime: '08:00:00',
  expiresAt: '2026-11-27T00:05:00Z',
};
let slots: (Omit<typeof own, 'holdId'> & { holdId?: string })[];
let serverTime: string;

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

async function setup() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  const refreshBookings = vi.fn();
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  const hook = renderHook(
    () => useRealtimeCourtSelection(branchId, businessDate, courts, refreshBookings),
    { wrapper },
  );
  await waitFor(() =>
    expect(hook.result.current.ready && hook.result.current.connected).toBe(true),
  );
  return { ...hook, refreshBookings };
}

function notify() {
  const callback = mocks.events.get('CourtStatusInvalidated') as
    ((event: object) => void) | undefined;
  callback?.({ branchId, businessDate });
}

beforeEach(() => {
  vi.clearAllMocks();
  sessionStorage.clear();
  const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }));
  tokenStorage.write({ accessToken: `e30.${payload}.signature`, refreshToken: 'refresh' });
  mocks.events.clear();
  slots = [];
  serverTime = '2026-11-27T00:00:00Z';
  mocks.get.mockImplementation(async () => ({
    data: { data: { branchId, businessDate, serverTime, slots } },
  }));
});
afterEach(cleanup);

describe('realtime court selection', () => {
  it('claims as a guest when the stored user profile outlives the access token', async () => {
    const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) - 60 }));
    tokenStorage.write({ accessToken: `e30.${payload}.signature`, refreshToken: 'refresh' });
    mocks.post.mockResolvedValueOnce({
      data: { data: { token: 'guest-token', expiresAt: new Date(Date.now() + 3600_000).toISOString() } },
    });
    const { result } = await setup();
    expect(mocks.post).toHaveBeenCalledWith('/court-selections/guest-session', null, {
      params: { ownerSessionId: 'session-a' },
    });

    act(() => result.current.toggleSlot('court-a', '07:00'));
    expect(mocks.post).toHaveBeenLastCalledWith(
      '/court-selections/slots',
      expect.objectContaining({ ownerSessionId: 'session-a' }),
      { headers: { 'Idempotency-Key': expect.any(String), 'X-Court-Selection-Guest': 'guest-token' } },
    );
    await waitFor(() => expect(result.current.busy).toBe(false));
  });

  it('shows pending claim and release, and processes only one click while each is pending', async () => {
    const { result } = await setup();
    const claim = deferred();
    mocks.post.mockReturnValueOnce(claim.promise);
    act(() => {
      result.current.toggleSlot('court-a', '07:00');
      result.current.toggleSlot('court-a', '07:00');
    });
    expect(mocks.post).toHaveBeenCalledTimes(1);
    expect(result.current.getState('court-a', '07:00')).toBe('HOLDING');
    slots = [own];
    claim.resolve();
    await waitFor(() => expect(result.current.getState('court-a', '07:00')).toBe('HELD_BY_ME'));

    const release = deferred();
    mocks.delete.mockReturnValueOnce(release.promise);
    act(() => result.current.toggleSlot('court-a', '07:00'));
    expect(result.current.getState('court-a', '07:00')).toBe('RELEASING');
    slots = [];
    release.resolve();
    await waitFor(() => expect(result.current.getState('court-a', '07:00')).toBeUndefined());
  });

  it('reconciles a 409 and blocks another click on a remote hold', async () => {
    const { result } = await setup();
    mocks.post.mockImplementationOnce(async () => {
      slots = [{ ...own, holdId: undefined }];
      throw { status: 409, code: 'SLOT_NOT_AVAILABLE' };
    });
    act(() => result.current.toggleSlot('court-a', '07:00'));
    await waitFor(() => expect(result.current.getState('court-a', '07:00')).toBe('HELD_BY_OTHER'));
    expect(mocks.toast).toHaveBeenCalledOnce();
    act(() => result.current.toggleSlot('court-a', '07:00'));
    expect(mocks.post).toHaveBeenCalledOnce();
  });

  it('applies current snapshots on invalidation and rejoins on reconnect', async () => {
    const { result, refreshBookings } = await setup();
    slots = [{ ...own, holdId: undefined }];
    act(notify);
    await waitFor(() => expect(result.current.getState('court-a', '07:00')).toBe('HELD_BY_OTHER'));
    act(() => mocks.events.get('reconnecting')?.());
    expect(result.current.connected).toBe(false);
    slots = [own];
    act(() => mocks.events.get('reconnected')?.());
    await waitFor(() => expect(result.current.getState('court-a', '07:00')).toBe('HELD_BY_ME'));
    expect(mocks.invoke).toHaveBeenCalledTimes(2);
    expect(mocks.invoke).toHaveBeenLastCalledWith('JoinCourtStatus', branchId, businessDate);
    expect(refreshBookings).toHaveBeenCalled();
    slots = [];
    // Even a late notification only causes a read of current server state.
    act(notify);
    await waitFor(() => expect(result.current.getState('court-a', '07:00')).toBeUndefined());
  });

  it('keeps a slot held when the countdown reaches zero until the snapshot confirms release', async () => {
    const { result } = await setup();
    serverTime = own.expiresAt;
    slots = [own];
    act(notify);
    await waitFor(() => expect(result.current.remaining).toBe(0));
    expect(result.current.getState('court-a', '07:00')).toBe('HELD_BY_ME');
    expect(result.current.busy).toBe(true);
    slots = [];
    act(notify);
    await waitFor(() => expect(result.current.getState('court-a', '07:00')).toBeUndefined());
  });
});
