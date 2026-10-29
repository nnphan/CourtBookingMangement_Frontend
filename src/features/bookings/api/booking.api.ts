import { http } from '@/lib/axios';
import type { CreateBookingRequest, CreateBookingResponse } from '../types/booking.types';
import type { MyBookingListItemDto } from '../types/booking.types';
import type { ApiSuccessResponse } from '@/types/api';
import { calculateBookingPrice } from './booking-pricing.api';

export { calculateBookingPrice } from './booking-pricing.api';

export const bookingApi = {
  getMyBookings: async (): Promise<MyBookingListItemDto[]> => {
    const response = await http.get<ApiSuccessResponse<MyBookingListItemDto[]>>(
      '/api/bookings/my-bookings',
    );
    return response.data.data;
  },

  /**
   * Submit new court booking to Backend API
   * POST /api/bookings
   */
  createBooking: async (
    payload: CreateBookingRequest,
    providedDebugId?: string,
  ): Promise<CreateBookingResponse> => {
    const requestDebugId = providedDebugId ?? crypto.randomUUID();
    const startedAt = performance.now();

    if (import.meta.env.DEV) {
      console.debug('[booking:create] request started', { requestDebugId });
    }

    try {
      const response = await http.post<ApiSuccessResponse<CreateBookingResponse>>(
        '/api/bookings',
        payload,
      );

      if (import.meta.env.DEV) {
        console.debug('[booking:create] response received', {
          requestDebugId,
          durationMs: Math.round(performance.now() - startedAt),
          status: response.status,
        });
      }

      return response.data.data;
    } catch (error: unknown) {
      const details =
        error && typeof error === 'object'
          ? (error as {
              code?: unknown;
              status?: unknown;
              name?: unknown;
              config?: { signal?: AbortSignal | null };
            })
          : {};
      const errorCode = typeof details.code === 'string' ? details.code : undefined;
      const errorName = error instanceof Error ? error.name : undefined;

      if (import.meta.env.DEV) {
        console.warn('[booking:create] request failed', {
          requestDebugId,
          durationMs: Math.round(performance.now() - startedAt),
          errorCode,
          status: typeof details.status === 'number' ? details.status : undefined,
          isCancellation: errorCode === 'ERR_CANCELED' || errorName === 'AbortError',
          isTimeout: errorCode === 'ECONNABORTED' || errorCode === 'ETIMEDOUT',
          signalAborted: details.config?.signal?.aborted ?? false,
        });
      }

      throw error;
    }
  },

  /**
   * Calculate Booking Price from Backend API
   * POST /api/bookings/calculate-price
   */
  calculateBookingPrice,
};
