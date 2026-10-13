import { useQuery } from '@tanstack/react-query';
import { getBookingDetail } from './booking-detail.api';
import type { BookingDetailDto } from '../types/booking.types';

export const BOOKING_DETAIL_QUERY_KEY = 'booking-detail';

export const bookingDetailKeys = {
  all: [BOOKING_DETAIL_QUERY_KEY] as const,
  detail: (bookingId?: string | null) => [BOOKING_DETAIL_QUERY_KEY, bookingId] as const,
};

export interface UseBookingDetailOptions {
  enabled?: boolean;
}

export const useBookingDetail = (
  bookingId?: string | null,
  options?: UseBookingDetailOptions,
) => {
  return useQuery<BookingDetailDto, Error>({
    queryKey: bookingDetailKeys.detail(bookingId),
    queryFn: () => {
      if (!bookingId) {
        throw new Error('Booking ID is required');
      }
      return getBookingDetail(bookingId);
    },
    enabled: Boolean(bookingId) && (options?.enabled ?? true),
    staleTime: 0,
    refetchOnWindowFocus: false,
    retry: 1,
  });
};
