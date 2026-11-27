import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle2, Copy, QrCode, RefreshCw } from 'lucide-react';
import { Link, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { paths } from '@/app/router/paths';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { BOOKING_QUERY_KEYS } from '@/features/bookings/api/booking.query';
import { formatCurrency } from '@/features/bookings/utils/booking.mapper';
import { useBookingPaymentStatus, useCreateSePayPayment } from '../api/payment.query';

const statusMessages: Record<string, string> = {
  EXPIRED: 'booking.payment.expired',
  PAYMENT_REVIEW: 'booking.payment.review',
  UNDERPAID: 'booking.payment.underpaid',
  OVERPAID: 'booking.payment.overpaid',
  REFUNDED: 'booking.payment.refunded',
};

const SePayPaymentPage = () => {
  const { t } = useTranslation();
  const { bookingId = '' } = useParams();
  const authenticated = useAuthStore((state) => state.isAuthenticated());
  const holdToken = sessionStorage.getItem('booking-hold:' + bookingId);
  const query = useBookingPaymentStatus(bookingId, holdToken, Boolean(holdToken) || authenticated);
  const create = useCreateSePayPayment();
  const cache = useQueryClient();
  const [now, setNow] = useState(Date.now);
  const [copyState, setCopyState] = useState<'copied' | 'failed' | null>(null);
  const payment = query.data?.provider?.toUpperCase() === 'SEPAY' ? query.data : undefined;
  const status = payment?.status.toUpperCase();
  const paid = status === 'PAID';
  const confirmed = paid && ['CONFIRMED', 'CHECKED_IN', 'COMPLETED'].includes(payment?.bookingStatus?.toUpperCase() ?? '');
  const pending = status === 'PENDING' || status === 'PROCESSING';
  const elapsed = Math.max(0, Math.floor((now - query.dataUpdatedAt) / 1000));
  const remaining = Math.max(0, (payment?.remainingSeconds ?? 0) - elapsed);
  const missingAttempt = query.isError && !query.data && 'status' in query.error && query.error.status === 404;

  useEffect(() => {
    if (!pending) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [pending]);

  useEffect(() => {
    if (confirmed) {
      void cache.invalidateQueries({ queryKey: BOOKING_QUERY_KEYS.all });
      void cache.invalidateQueries({ queryKey: BOOKING_QUERY_KEYS.courtStatus });
    }
  }, [cache, confirmed]);

  const startPayment = () => create.mutate({ bookingId, holdToken }, {
    onSuccess: () => { void query.refetch(); },
    onError: () => { void query.refetch(); },
  });

  const copyCode = async () => {
    if (!payment?.paymentCode) return;
    try {
      await navigator.clipboard.writeText(payment.paymentCode);
      setCopyState('copied');
    } catch {
      setCopyState('failed');
    }
  };

  return (
    <main className="mx-auto max-w-xl space-y-4 px-4 py-8">
      <Button asChild variant="outline">
        <Link to={authenticated ? paths.myBooking : paths.root}>
          <ArrowLeft aria-hidden className="size-4" />
          {authenticated ? t('booking.success.viewMyBookings') : t('booking.payment.backToBranches')}
        </Link>
      </Button>
      <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <header className="flex items-start gap-3">
          {confirmed ? <CheckCircle2 aria-hidden className="size-6 shrink-0 text-emerald-700" /> :
            <QrCode aria-hidden className="size-6 shrink-0 text-emerald-700" />}
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {t(confirmed ? 'booking.payment.bookingConfirmed' : 'booking.payment.sepayTitle')}
            </h1>
            {payment?.bookingCode && <p className="mt-1 text-sm text-slate-600">
              {t('booking.success.bookingCode', { code: payment.bookingCode })}
            </p>}
          </div>
        </header>

        {!holdToken && !authenticated && <p role="status">{t('booking.payment.accessRequired')}</p>}
        {query.isLoading && <p role="status">{t('booking.payment.statusPolling')}</p>}
        {query.data && !payment && <p role="alert">{t('booking.payment.unavailable')}</p>}
        {query.isError && !missingAttempt && <p role="alert">{t('booking.payment.unavailable')}</p>}
        {missingAttempt && (
          <Button onClick={startPayment} disabled={create.isPending}>
            {t(create.isPending ? 'booking.payment.starting' : 'booking.payment.pay')}
          </Button>
        )}
        {create.isError && !payment && <p role="alert">{t('booking.payment.resumeFailed')}</p>}

        {payment && <>
          <p className="rounded-lg bg-emerald-50 p-3 font-semibold text-emerald-900">
            {t('booking.success.total')} {formatCurrency(payment.amount)}
          </p>
          {paid && <p role="status">{t(confirmed ? 'booking.payment.confirmed' : 'booking.payment.needsAttention')}</p>}
          {pending && remaining > 0 && <>
            <p role="status">{t('booking.payment.awaitingPayment')}</p>
            <p className="text-sm text-slate-600">
              {t('booking.payment.timeRemaining')}{' '}
              <span className="tabular-nums">{Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')}</span>
            </p>
            {payment.qrCodeUrl && <img src={payment.qrCodeUrl} alt={t('booking.payment.qrAlt')} className="mx-auto size-52 rounded-lg border border-slate-200 p-2" />}
            <dl className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 p-3 text-sm">
              <div><dt>{t('booking.payment.bank')}</dt><dd className="font-semibold">{payment.bankCode}</dd></div>
              <div><dt>{t('booking.payment.bankAccountNumber')}</dt><dd className="font-semibold">{payment.bankAccountNumber}</dd></div>
              <div className="col-span-2"><dt>{t('booking.payment.accountHolder')}</dt><dd className="font-semibold">{payment.accountHolderName}</dd></div>
              <div className="col-span-2">
                <dt>{t('booking.payment.transferContent')}</dt>
                <dd className="mt-1 flex flex-wrap items-center gap-2">
                  <strong className="font-mono">{payment.paymentCode}</strong>
                  <Button size="sm" variant="outline" onClick={() => void copyCode()} disabled={!payment.paymentCode}>
                    <Copy aria-hidden className="size-4" />
                    {t(copyState === 'copied' ? 'booking.payment.copied' : 'booking.payment.copyContent')}
                  </Button>
                </dd>
              </div>
            </dl>
            {copyState === 'failed' && <p role="alert">{t('booking.payment.copyFailed')}</p>}
          </>}
          {pending && remaining === 0 && <p role="status">{t('booking.payment.awaitingFinalStatus')}</p>}
          {!pending && !paid && status && (
            <div className="space-y-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
              <p role="status">{t(statusMessages[status] ?? 'booking.payment.needsAttention')}</p>
              {(payment.receivedAmount ?? 0) > 0 && <p>{t('booking.payment.received', { amount: formatCurrency(payment.receivedAmount ?? 0) })}</p>}
            </div>
          )}
        </>}

        {(holdToken || authenticated) && !confirmed && (
          <Button variant="outline" onClick={() => void query.refetch()} disabled={query.isFetching || create.isPending}>
            <RefreshCw aria-hidden className="size-4" />
            {t('booking.payment.refreshStatus')}
          </Button>
        )}
      </section>
    </main>
  );
};

export default SePayPaymentPage;

