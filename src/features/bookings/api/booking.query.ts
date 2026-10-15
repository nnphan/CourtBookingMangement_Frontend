import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingApi } from './booking.api';
import type { CreateBookingRequest, CreateBookingResponse } from '../types/booking.types';
import { toast } from '@/lib/toast';
interface BookingApiError {
  status?: number;
  code?: string;
  message?: string;
  fields?: Record<string, string>;
}

export const BOOKING_QUERY_KEYS = {
  all: ['bookings'] as const,
  courtStatus: ['court-status'] as const,
};

export interface UseCreateBookingOptions {
  onSuccess?: (data: CreateBookingResponse) => void;
  onError?: (error: Error) => void;
}

export const useCreateBooking = (options?: UseCreateBookingOptions) => {
  const queryClient = useQueryClient();

  return useMutation<CreateBookingResponse, Error, CreateBookingRequest>({
    mutationFn: (payload: CreateBookingRequest) => bookingApi.createBooking(payload),
    onSuccess: (data) => {
      toast.success('Đặt sân thành công.');
      // Invalidate Court Status Board query to immediately refresh without page reload
      void queryClient.invalidateQueries({ queryKey: BOOKING_QUERY_KEYS.courtStatus });
      void queryClient.invalidateQueries({ queryKey: BOOKING_QUERY_KEYS.all });
      options?.onSuccess?.(data);
    },
    onError: (err: unknown) => {
      const errorObj = err && typeof err === 'object' ? (err as BookingApiError) : undefined;
      const errorCode = errorObj?.code?.toUpperCase();
      let message = 'Không thể tạo đặt sân. Vui lòng thử lại.';

      if (errorCode === 'BOOKING_CONFLICT') {
        message = 'Khung giờ vừa chọn không còn khả dụng. Vui lòng chọn khung giờ khác.';
        void queryClient.invalidateQueries({ queryKey: BOOKING_QUERY_KEYS.courtStatus });
      } else if (errorObj?.status === 401 || errorCode === 'UNAUTHORIZED') {
        message = 'Vui lòng đăng nhập để đặt sân.';
      } else if (errorObj?.fields && Object.values(errorObj.fields).length > 0) {
        message = Object.values(errorObj.fields)[0] || message;
      } else if (errorObj?.message && errorObj.message !== 'error.network') {
        message = errorObj.message;
      }

      toast.error('Lỗi đặt sân', message);
      options?.onError?.(err as Error);
    },
  });
};
