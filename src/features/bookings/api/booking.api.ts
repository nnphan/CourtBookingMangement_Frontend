import { http } from '@/lib/axios';
import type { CreateBookingRequest, CreateBookingResponse } from '../types/booking.types';
import { calculateBookingPrice } from './booking-pricing.api';

export { calculateBookingPrice } from './booking-pricing.api';

export const bookingApi = {
  /**
   * Submit new court booking to Backend API
   * POST /api/bookings
   */
  createBooking: async (payload: CreateBookingRequest): Promise<CreateBookingResponse> => {
    const response = await http.post<CreateBookingResponse | { success: boolean; data: CreateBookingResponse }>(
      '/api/bookings',
      payload,
    );

    const body = response.data;
    if (body && typeof body === 'object' && 'data' in body && (body as { data: unknown }).data) {
      return (body as { data: CreateBookingResponse }).data;
    }

    return body as CreateBookingResponse;
  },

  /**
   * Calculate Booking Price from Backend API
   * POST /api/bookings/calculate-price
   */
  calculateBookingPrice,
};

