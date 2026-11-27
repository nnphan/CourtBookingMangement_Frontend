import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from '@/lib/toast';
import type { BookingPaymentStatus } from '../api/payment.api';

const unsuccessfulMessages: Record<string, string> = {
  FAILED: 'booking.payment.failed',
  EXPIRED: 'booking.payment.expired',
  PAYMENT_REVIEW: 'booking.payment.review',
  UNDERPAID: 'booking.payment.underpaid',
  OVERPAID: 'booking.payment.overpaid',
  REFUNDED: 'booking.payment.refunded',
};

export function useSePayBookingAlert(payment: BookingPaymentStatus | undefined, bookingCode?: string) {
  const { t } = useTranslation();
  const status = payment?.status.toUpperCase();
  const bookingStatus = payment?.bookingStatus?.toUpperCase() ?? '';
  const confirmed = status === 'PAID' &&
    ['CONFIRMED', 'CHECKED_IN', 'COMPLETED'].includes(bookingStatus);
  const issueMessage = status && (unsuccessfulMessages[status] ??
    (bookingStatus === 'EXPIRED' ? 'booking.payment.expired' : undefined) ??
    (status === 'PAID' && !confirmed ? 'booking.payment.needsAttention' : undefined));

  useEffect(() => {
    if (!payment || (!confirmed && !issueMessage)) return;

    const key = 'sepay-booking-alert:' + payment.bookingId;
    const outcome = payment.paymentId + ':' + (confirmed ? 'confirmed' : issueMessage);
    if (sessionStorage.getItem(key) === outcome) return;
    sessionStorage.setItem(key, outcome);

    if (confirmed) {
      const code = payment.bookingCode ?? bookingCode;
      toast.success(
        t('booking.payment.bookingConfirmed'),
        code ? t('booking.success.bookingCode', { code }) : t('booking.payment.confirmed'),
      );
    } else if (issueMessage) {
      toast.error(t('booking.payment.bookingNotConfirmed'), t(issueMessage));
    }
  }, [bookingCode, confirmed, issueMessage, payment, t]);

  return { confirmed, issueMessage };
}
