import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingApi } from '../api/booking.api';
import { bookingDetailKeys } from '../api/booking-detail.query';
import { BOOKING_QUERY_KEYS } from '../api/booking.query';
import type {
  BookingStatusUpdate,
  UpdateBookingStatusResponse,
} from '../types/booking.types';

export interface UseUpdateBookingStatusOptions {
  onSuccess?: (
    data: UpdateBookingStatusResponse,
    variables: { bookingId: string; status: BookingStatusUpdate | string },
  ) => void;
  onError?: (
    error: Error,
    variables: { bookingId: string; status: BookingStatusUpdate | string },
  ) => void;
}

/**
 * Mutation hook to update booking status (e.g. CHECKED_IN, CANCELLED)
 * Calls PATCH /api/bookings/{id}
 */
export const useUpdateBookingStatus = (options?: UseUpdateBookingStatusOptions) => {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateBookingStatusResponse,
    Error,
    { bookingId: string; status: BookingStatusUpdate | string }
  >({
    mutationFn: ({ bookingId, status }) => bookingApi.updateBookingStatus(bookingId, status),
    onSuccess: (data, variables) => {
      // Invalidate specific booking detail query so drawer receives fresh status immediately
      void queryClient.invalidateQueries({
        queryKey: bookingDetailKeys.detail(variables.bookingId),
      });
      // Invalidate court-status schedule timeline query
      void queryClient.invalidateQueries({
        queryKey: BOOKING_QUERY_KEYS.courtStatus,
      });
      void queryClient.invalidateQueries({
        queryKey: ['court-status'],
      });
      void queryClient.invalidateQueries({
        queryKey: BOOKING_QUERY_KEYS.all,
      });

      options?.onSuccess?.(data, variables);
    },
    onError: (error, variables) => {
      options?.onError?.(error, variables);
    },
  });
};

export default useUpdateBookingStatus;

