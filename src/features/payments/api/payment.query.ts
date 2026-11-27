import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { paymentApi } from './payment.api';

const TERMINAL_PAYMENT_STATUSES = new Set([
  'PAID',
  'FAILED',
  'EXPIRED',
  'PAYMENT_REVIEW',
  'UNDERPAID',
  'OVERPAID',
  'REFUNDED',
]);

export const useCreateSePayPayment = () =>
  useMutation({
    mutationFn: ({ bookingId, holdToken }: { bookingId: string; holdToken: string | null }) =>
      paymentApi.createSePayPayment(bookingId, holdToken),
    retry: false,
  });

export const useCreateMomoPayment = () =>
  useMutation({
    mutationFn: ({ bookingId, holdToken }: { bookingId: string; holdToken: string }) =>
      paymentApi.createMomoPayment(bookingId, holdToken),
    retry: false,
  });

export const useQueryMomoPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ paymentId, holdToken }: { paymentId: string; holdToken: string | null }) =>
      paymentApi.queryMomoPayment(paymentId, holdToken),
    onSuccess: (data) =>
      queryClient.setQueryData(['payments', 'booking-status', data.bookingId], data),
    retry: false,
  });
};

export const useBookingPaymentStatus = (
  bookingId: string,
  holdToken: string | null,
  enabled: boolean,
) =>
  useQuery({
    queryKey: ['payments', 'booking-status', bookingId],
    queryFn: () => paymentApi.getBookingPaymentStatus(bookingId, holdToken),
    enabled: enabled && Boolean(bookingId),
    refetchInterval: (query) =>
      (query.state.data && TERMINAL_PAYMENT_STATUSES.has(query.state.data.status.toUpperCase()))
        || (query.state.error && 'status' in query.state.error && [401, 403, 404].includes(Number(query.state.error.status)))
        ? false
        : 3000,
    retry: 1,
  });
