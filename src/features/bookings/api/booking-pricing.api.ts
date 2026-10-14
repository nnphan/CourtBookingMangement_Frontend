import { http } from '@/lib/axios';
import type {
  CalculateBookingPriceRequest,
  CalculateBookingPriceResponse,
} from '../types/booking.types';

export interface CalculateBookingPriceApiResponse {
  success: boolean;
  message?: string;
  data: CalculateBookingPriceResponse;
}

/**
 * Calculate Booking Price API
 * POST /api/bookings/calculate-price
 */
export const calculateBookingPrice = async (
  payload: CalculateBookingPriceRequest,
): Promise<CalculateBookingPriceResponse> => {
  const response = await http.post<
    CalculateBookingPriceApiResponse | CalculateBookingPriceResponse
  >('/api/bookings/calculate-price', payload);

  const body = response.data;
  if (body && typeof body === 'object' && 'data' in body && (body as { data: unknown }).data) {
    return (body as CalculateBookingPriceApiResponse).data;
  }

  return body as CalculateBookingPriceResponse;
};

export const bookingPricingApi = {
  calculateBookingPrice,
};
