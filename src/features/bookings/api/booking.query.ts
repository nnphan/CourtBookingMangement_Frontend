import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import i18n from 'i18next';
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
  myBookings: () => ['bookings', 'my-bookings'] as const,
  courtStatus: ['court-status'] as const,
};

export const useMyBookings = () =>
  useQuery({
    queryKey: BOOKING_QUERY_KEYS.myBookings(),
    queryFn: bookingApi.getMyBookings,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });

export interface UseCreateBookingOptions {
  onSuccess?: (data: CreateBookingResponse) => void;
  onError?: (error: Error) => void;
}

export interface CreateBookingMutationVariables {
  payload: CreateBookingRequest;
  requestDebugId?: string;
}

export const useCreateBooking = (options?: UseCreateBookingOptions) => {
  const queryClient = useQueryClient();

  return useMutation<CreateBookingResponse, Error, CreateBookingMutationVariables>({
    mutationFn: ({ payload, requestDebugId }) => bookingApi.createBooking(payload, requestDebugId),
    retry: false,
    onSuccess: async (data) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: BOOKING_QUERY_KEYS.courtStatus }),
        queryClient.invalidateQueries({ queryKey: BOOKING_QUERY_KEYS.all }),
        queryClient.invalidateQueries({ queryKey: BOOKING_QUERY_KEYS.myBookings() }),
      ]);
      toast.success(
        data.bookingCode
          ? i18n.t('booking.guest.successWithCode', {
              defaultValue: 'Đặt sân thành công. Mã đặt sân: {{code}}',
              code: data.bookingCode,
            })
          : i18n.t('booking.guest.success', 'Đặt sân thành công.'),
      );
      options?.onSuccess?.(data);
    },
    onError: async (err: unknown) => {
      const errorObj = err && typeof err === 'object' ? (err as BookingApiError) : undefined;
      const errorCode = errorObj?.code?.toUpperCase();
      let message = 'Không thể tạo đặt sân. Vui lòng thử lại.';

      if (errorCode === 'ERR_CANCELED' || errorCode === 'ABORT_ERR') {
        message = 'Yêu cầu đặt sân đã bị gián đoạn. Vui lòng thử lại.';
      } else if (errorCode === 'ECONNABORTED' || errorCode === 'ETIMEDOUT') {
        message =
          'Yêu cầu đặt sân đã hết thời gian chờ. Vui lòng kiểm tra trạng thái sân trước khi thử lại.';
        await queryClient.invalidateQueries({ queryKey: BOOKING_QUERY_KEYS.courtStatus });
      } else if (errorCode === 'BOOKING_CONFLICT') {
        message = i18n.t(
          'booking.multiCourt.conflictNoPartial',
          'Một hoặc nhiều sân vừa được người khác đặt. Không có sân nào trong yêu cầu này được tạo. Vui lòng kiểm tra và chọn lại.',
        );
        void queryClient.invalidateQueries({ queryKey: BOOKING_QUERY_KEYS.courtStatus });
      } else if (
        errorObj?.status === 401 ||
        errorObj?.status === 403 ||
        errorCode === 'UNAUTHORIZED'
      ) {
        message = i18n.t(
          'booking.guest.unexpectedUnauthorized',
          'Hệ thống từ chối yêu cầu đặt sân. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.',
        );
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
