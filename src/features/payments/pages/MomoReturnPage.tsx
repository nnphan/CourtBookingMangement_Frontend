import { AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { paths } from '@/app/router/paths';
import { Link } from 'react-router';
import { useBookingPaymentStatus, useQueryMomoPayment } from '../api/payment.query';

const MomoReturnPage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('bookingId') ?? '';
  const holdToken = bookingId ? sessionStorage.getItem(`booking-hold:${bookingId}`) : null;
  const paymentStatus = useBookingPaymentStatus(bookingId, holdToken, Boolean(bookingId));
  const { mutate: queryMomo, isPending: isQuerying } = useQueryMomoPayment();
  const queriedPaymentId = useRef<string | null>(null);
  const status = paymentStatus.data?.status.toUpperCase();

  useEffect(() => {
    const currentPaymentId = paymentStatus.data?.paymentId;
    if (
      !currentPaymentId ||
      !holdToken ||
      status === 'PAID' ||
      status === 'FAILED' ||
      status === 'EXPIRED' ||
      status === 'PAYMENT_REVIEW' ||
      queriedPaymentId.current === currentPaymentId ||
      isQuerying
    ) {
      return;
    }

    queriedPaymentId.current = currentPaymentId;
    queryMomo({ paymentId: currentPaymentId, holdToken });
  }, [holdToken, isQuerying, paymentStatus.data?.paymentId, queryMomo, status]);

  useEffect(() => {
    if (
      bookingId &&
      status &&
      ['PAID', 'FAILED', 'EXPIRED', 'PAYMENT_REVIEW'].includes(status)
    ) {
      sessionStorage.removeItem(`booking-hold:${bookingId}`);
    }
  }, [bookingId, status]);

  return (
    <main className="mx-auto flex min-h-screen max-w-xl items-center px-4 py-10">
      <section className="w-full space-y-4 rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        {status === 'PAID' ? (
          <>
            <CheckCircle2 className="mx-auto size-10 text-emerald-600" aria-hidden />
            <h1 className="text-xl font-semibold text-slate-900">
              {t('booking.payment.confirmed', 'Payment confirmed')}
            </h1>
            <p className="text-sm text-slate-600">
              {t('booking.payment.bookingConfirmed', 'Your booking is confirmed.')}
            </p>
          </>
        ) : status === 'EXPIRED' || status === 'FAILED' ? (
          <>
            <AlertTriangle className="mx-auto size-10 text-amber-600" aria-hidden />
            <h1 className="text-xl font-semibold text-slate-900">
              {t('booking.payment.notCompleted', 'Payment not completed')}
            </h1>
            <p className="text-sm text-slate-600">
              {t(
                'booking.payment.notCompletedDescription',
                'The booking hold is no longer available. Check with the branch if payment was debited.',
              )}
            </p>
          </>
        ) : status === 'PAYMENT_REVIEW' ? (
          <>
            <AlertTriangle className="mx-auto size-10 text-amber-600" aria-hidden />
            <h1 className="text-xl font-semibold text-slate-900">
              {t('booking.payment.review', 'Payment under review')}
            </h1>
            <p className="text-sm text-slate-600">
              {t(
                'booking.payment.reviewDescription',
                'Do not retry payment. Contact the branch if you need assistance.',
              )}
            </p>
          </>
        ) : paymentStatus.isError || !bookingId || !holdToken ? (
          <>
            <AlertTriangle className="mx-auto size-10 text-red-600" aria-hidden />
            <h1 className="text-xl font-semibold text-slate-900">
              {t('booking.payment.verifyFailed', 'Unable to verify payment')}
            </h1>
            <p className="text-sm text-slate-600">
              {t(
                'booking.payment.verifyFailedDescription',
                'The payment status could not be verified. Do not retry payment until you check with the branch.',
              )}
            </p>
          </>
        ) : (
          <>
            <Loader2 className="mx-auto size-10 animate-spin text-emerald-600" aria-hidden />
            <h1 className="text-xl font-semibold text-slate-900">
              {t('booking.payment.verifying', 'Verifying payment')}
            </h1>
            <p className="text-sm text-slate-600">
              {t(
                'booking.payment.verifyingDescription',
                'We are checking the payment with the server. This page will update automatically.',
              )}
            </p>
          </>
        )}

        {paymentStatus.data?.amount !== undefined && (
          <p className="font-mono text-sm font-semibold text-slate-800">
            {paymentStatus.data.amount.toLocaleString('vi-VN')} VND
          </p>
        )}
        <Button asChild variant="outline">
          <Link to={paths.root}>{t('booking.payment.returnToCourts', 'Return to courts')}</Link>
        </Button>
      </section>
    </main>
  );
};

export default MomoReturnPage;
