import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courtStatusApi } from '../api/court-status.api';
import type { CourtStatusFilterParams, CourtStatusResponse } from '../types/common';
import type { BookingItem } from '../types/booking';

export const COURT_STATUS_QUERY_KEY = 'court-status';

export const courtStatusKeys = {
  all: [COURT_STATUS_QUERY_KEY] as const,
  list: (params: CourtStatusFilterParams) =>
    [COURT_STATUS_QUERY_KEY, params.branchId, params.date, params.courtGroupId ?? 'all'] as const,
};

export const useCourtStatus = (params: CourtStatusFilterParams) => {
  const queryClient = useQueryClient();

  const query = useQuery<CourtStatusResponse>({
    queryKey: courtStatusKeys.list(params),
    queryFn: () => courtStatusApi.getCourtStatus(params),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

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
    courts: query.data?.courts ?? [],
    bookings: query.data?.bookings ?? [],
    branches: query.data?.branches ?? [],
    groups: query.data?.groups ?? [],
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
