import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import i18n from 'i18next';
import { bookingApi } from './booking.api';
import type { CreateBookingRequest, CreateBookingResponse } from '../types/booking.types';
import { toast } from '@/lib/toast';
import { useAuthStore } from '@/features/auth/store/auth.store';
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
    onSuccess: async (data, { payload }) => {
      const bookingDate = payload.details[0]?.bookingDate;
      const tasks: Promise<unknown>[] = [
        queryClient.invalidateQueries({
          queryKey: bookingDate
            ? [...BOOKING_QUERY_KEYS.courtStatus, payload.branchId, bookingDate]
            : BOOKING_QUERY_KEYS.courtStatus,
        }),
      ];
      if (useAuthStore.getState().isAuthenticated()) {
        tasks.push(queryClient.invalidateQueries({ queryKey: BOOKING_QUERY_KEYS.all }));
      }
      await Promise.all(tasks);
      toast.success(
        i18n.t('booking.multiCourt.success', {
          defaultValue: 'Đặt {{count}} sân thành công.',
          count: data.details.length,
        }),
        data.bookingCode
          ? i18n.t('booking.success.bookingCode', {
              defaultValue: 'Mã booking: {{code}}',
              code: data.bookingCode,
            })
          : undefined,
      );
      options?.onSuccess?.(data);
    },
    onError: async (err: unknown, { payload }) => {
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
        const date = payload.details[0]?.bookingDate;
        await queryClient.refetchQueries({
          queryKey: date
            ? [...BOOKING_QUERY_KEYS.courtStatus, payload.branchId, date]
            : BOOKING_QUERY_KEYS.courtStatus,
        });
        options?.onError?.(err as Error);
        return;
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
