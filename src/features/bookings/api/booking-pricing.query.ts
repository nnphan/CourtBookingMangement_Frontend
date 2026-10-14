import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { calculateBookingPrice } from './booking-pricing.api';
import type {
  CalculateBookingPriceRequest,
  CalculateBookingPriceResponse,
} from '../types/booking.types';

export const BOOKING_PRICING_QUERY_KEY = 'calculate-booking-price';

export const bookingPricingKeys = {
  all: [BOOKING_PRICING_QUERY_KEY] as const,
  price: (
    branchId?: string | null,
    bookingDate?: string | null,
    startTime?: string | null,
    endTime?: string | null,
    courtId?: string | null,
  ) =>
    courtId
      ? ([BOOKING_PRICING_QUERY_KEY, branchId, bookingDate, startTime, endTime, courtId] as const)
      : ([BOOKING_PRICING_QUERY_KEY, branchId, bookingDate, startTime, endTime] as const),
};

export interface UseCalculateBookingPriceParams {
  branchId?: string | null;
  bookingDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  courtId?: string | null;
}

export interface UseCalculateBookingPriceOptions {
  enabled?: boolean;
}

/**
 * TanStack Query Hook to automatically calculate booking price
 * Calls POST /api/bookings/calculate-price when parameters change
 */
export const useCalculateBookingPrice = (
  params?: UseCalculateBookingPriceParams,
  options?: UseCalculateBookingPriceOptions,
) => {
  const branchId = params?.branchId;
  const bookingDate = params?.bookingDate;
  const startTime = params?.startTime;
  const endTime = params?.endTime;
  const courtId = params?.courtId;

  const isEnabled =
    Boolean(branchId) &&
    Boolean(bookingDate) &&
    Boolean(startTime) &&
    Boolean(endTime) &&
    (options?.enabled ?? true);

  return useQuery<CalculateBookingPriceResponse, Error>({
    queryKey: bookingPricingKeys.price(branchId, bookingDate, startTime, endTime, courtId),
    queryFn: async () => {
      if (!branchId || !bookingDate || !startTime || !endTime) {
        throw new Error('Missing required booking parameters for price calculation');
      }

      const payload: CalculateBookingPriceRequest = {
        branchId,
        bookingDate,
        startTime,
        endTime,
      };

      return calculateBookingPrice(payload);
    },
    enabled: isEnabled,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};
