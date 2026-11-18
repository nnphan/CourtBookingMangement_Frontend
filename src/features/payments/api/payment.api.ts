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

export interface CreateSePayPaymentResponse {
  paymentId: string;
  bookingId: string;
  bookingCode: string;
  paymentCode: string;
  amount: number;
  status: string;
  qrUrl: string;
  bankCode: string;
  bankAccountNumber: string;
  accountHolderName: string;
  expiresAt: string;
  serverTime: string;
  remainingSeconds: number;
}

export interface BookingPaymentStatus {
  paymentId: string;
  bookingId: string;
  status: string;
  amount: number;
  payUrl: string | null;
  paidAt: string | null;
  bookingStatus?: string | null;
  bookingCode?: string | null;
  paymentCode?: string | null;
  qrCodeUrl?: string | null;
  bankCode?: string | null;
  bankAccountNumber?: string | null;
  accountHolderName?: string | null;
  receivedAmount?: number | null;
  expiresAt?: string | null;
  serverTime?: string | null;
  remainingSeconds?: number | null;
}

export const paymentApi = {
  createSePayPayment: async (
    bookingId: string,
    holdToken: string | null,
  ): Promise<CreateSePayPaymentResponse> => {
    const response = await http.post<ApiSuccessResponse<CreateSePayPaymentResponse>>(
      '/api/payments/sepay',
      { bookingId },
      { headers: holdToken ? { 'X-Booking-Hold-Token': holdToken } : undefined },
    );
    return response.data.data;
  },

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
