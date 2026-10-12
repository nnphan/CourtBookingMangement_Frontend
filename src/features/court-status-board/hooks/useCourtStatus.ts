import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courtStatusService } from '@/services/court-status.service';
import { courtStatusApi } from '../api/court-status.api';
import type { CourtStatusResponse, CourtStatusCourt, CourtScheduleItem } from '@/types/court-status';
import type { CourtStatusFilterParams } from '../types/common';
import type { BookingItem, PaymentStatus } from '../types/booking';
import { BookingType } from '@/types/booking-type.enum';
import type { CourtItem } from '../types/court';

export const COURT_STATUS_QUERY_KEY = 'court-status';

export const QUERY_KEYS = {
  COURT_STATUS: (branchId: string, date: string) => [COURT_STATUS_QUERY_KEY, branchId, date] as const,
};

export const courtStatusKeys = {
  all: [COURT_STATUS_QUERY_KEY] as const,
  list: (branchId: string, date: string) => QUERY_KEYS.COURT_STATUS(branchId, date),
};

export type CourtStatusParams =
  | { branchId: string; date: string; courtGroupId?: string; slotInterval?: number }
  | CourtStatusFilterParams;

/**
 * Maps CourtScheduleItem to existing BookingItem for backward compatibility with existing drawers/modals.
 */
function mapScheduleItemToBooking(item: CourtScheduleItem): BookingItem {
  const normTime = (t: string) => (t && t.length >= 5 ? t.slice(0, 5) : t);
  const paymentMap: Record<string, PaymentStatus> = {
    paid: 'paid',
    unpaid: 'unpaid',
    deposit_pending: 'deposit_pending',
    service_unpaid: 'service_unpaid',
    ticket_unpaid: 'ticket_unpaid',
    partially_paid: 'partially_paid',
  };

  const rawBookingType = (item.bookingType || '').trim().toUpperCase();
  const bookingType =
    rawBookingType === BookingType.FIXED || rawBookingType === 'RECURRING'
      ? BookingType.FIXED
      : BookingType.FLEXIBLE;
  const paymentStatusLower = (item.paymentStatus || '').toLowerCase();

  return {
    id: item.bookingId,
    bookingNumber: item.bookingId,
    courtId: item.courtId,
    courtName: item.courtName,
    customerName: item.customerName,
    phoneNumber: item.phoneNumber,
    date: item.bookingDate,
    startTime: normTime(item.startTime),
    endTime: normTime(item.endTime),
    bookingType,
    bookingStatus: item.bookingStatus || 'Pending',
    paymentStatus: paymentMap[paymentStatusLower] ?? 'paid',
    notes: item.title,
  };
}

/**
 * React Query hook to fetch court status board data from GET /api/court-status.
 * Automatically invalidates and refetches when branchId or date changes.
 */
export const useCourtStatus = (
  paramsOrBranchId: CourtStatusParams | string,
  maybeDate?: string,
) => {
  const queryClient = useQueryClient();

  const branchId =
    typeof paramsOrBranchId === 'string'
      ? paramsOrBranchId
      : paramsOrBranchId?.branchId || '';

  const date =
    typeof paramsOrBranchId === 'string'
      ? maybeDate || ''
      : paramsOrBranchId?.date || '';

  const courtGroupId =
    typeof paramsOrBranchId === 'object' ? paramsOrBranchId.courtGroupId : undefined;

  const isEnabled = Boolean(branchId && date);

  const query = useQuery<CourtStatusResponse>({
    queryKey: QUERY_KEYS.COURT_STATUS(branchId, date),
    queryFn: () => courtStatusService.getCourtStatus(branchId, date),
    enabled: isEnabled,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const rawCourts = query.data?.courts ?? [];
  const scheduleItems = query.data?.scheduleItems ?? [];

  // Filter courts by courtGroupId if selected
  const filteredCourts =
    courtGroupId && courtGroupId !== 'all'
      ? rawCourts.filter(
          (c) =>
            (c as unknown as { courtGroupId?: string }).courtGroupId === courtGroupId,
        )
      : rawCourts;

  // Enrich courts so they provide both courtId/courtName and id/name
  const courts: (CourtStatusCourt & CourtItem)[] = filteredCourts.map((c) => ({
    ...c,
    id: c.courtId,
    name: c.courtName,
    courtNumber: c.courtNumber,
    isActive: c.status?.toLowerCase() !== 'inactive' && c.status?.toLowerCase() !== 'maintenance',
    pricePerHour: 100000,
    branchId: branchId,
  }));

  // Mapped bookings for backward compatibility
  const bookings: BookingItem[] = scheduleItems.map(mapScheduleItemToBooking);

  // Mutations to preserve booking actions without breaking functionality
  const createBookingMutation = useMutation({
    mutationFn: (data: Partial<BookingItem>) => courtStatusApi.createBooking(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: courtStatusKeys.all });
    },
  });

  const updateBookingMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BookingItem> }) =>
      courtStatusApi.updateBooking(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: courtStatusKeys.all });
    },
  });

  const cancelBookingMutation = useMutation({
    mutationFn: (id: string) => courtStatusApi.cancelBooking(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: courtStatusKeys.all });
    },
  });

  const checkInMutation = useMutation({
    mutationFn: (id: string) => courtStatusApi.checkIn(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: courtStatusKeys.all });
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: (id: string) => courtStatusApi.checkOut(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: courtStatusKeys.all });
    },
  });

  return {
    ...query,
    data: query.data,
    courts,
    rawCourts,
    scheduleItems,
    bookings,
    openTime: query.data?.openTime || '05:00:00',
    closeTime: query.data?.closeTime || '23:00:00',
    branchName: query.data?.branchName || '',
    branchId: query.data?.branchId || branchId,
    groups: [],
    createBooking: createBookingMutation.mutateAsync,
    isCreating: createBookingMutation.isPending,
    updateBooking: updateBookingMutation.mutateAsync,
    isUpdating: updateBookingMutation.isPending,
    cancelBooking: cancelBookingMutation.mutateAsync,
    isCancelling: cancelBookingMutation.isPending,
    checkIn: checkInMutation.mutateAsync,
    checkOut: checkOutMutation.mutateAsync,
  };
};

export default useCourtStatus;
