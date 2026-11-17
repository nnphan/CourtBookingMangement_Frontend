import { http } from '@/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';

export interface CreateMomoPaymentResponse {
  paymentId: string;
  bookingId: string;
  status: string;
  amount: number;
  payUrl: string | null;
  deeplink: string | null;
  qrCodeUrl: string | null;
}

export interface BookingPaymentStatus {
  paymentId: string;
  bookingId: string;
  status: string;
  amount: number;
  payUrl: string | null;
  paidAt: string | null;
}

export const paymentApi = {
  createMomoPayment: async (
    bookingId: string,
    holdToken: string,
  ): Promise<CreateMomoPaymentResponse> => {
    const response = await http.post<ApiSuccessResponse<CreateMomoPaymentResponse>>(
      '/api/payments/momo',
      { bookingId },
      { headers: { 'X-Booking-Hold-Token': holdToken } },
    );
    return response.data.data;
  },

  getBookingPaymentStatus: async (
    bookingId: string,
    holdToken: string | null,
  ): Promise<BookingPaymentStatus> => {
    const response = await http.get<ApiSuccessResponse<BookingPaymentStatus>>(
      `/api/bookings/${bookingId}/payment-status`,
      { headers: holdToken ? { 'X-Booking-Hold-Token': holdToken } : undefined },
    );
    return response.data.data;
  },

  queryMomoPayment: async (
    paymentId: string,
    holdToken: string | null,
  ): Promise<BookingPaymentStatus> => {
    const response = await http.post<ApiSuccessResponse<BookingPaymentStatus>>(
      `/api/payments/momo/${paymentId}/query`,
      {},
      { headers: holdToken ? { 'X-Booking-Hold-Token': holdToken } : undefined },
    );
    return response.data.data;
  },
};
