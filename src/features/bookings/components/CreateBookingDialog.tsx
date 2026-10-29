import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, CalendarDays, CheckCircle2, Clock, Loader2, MapPin, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TextInput } from '@/components/ui/text-input';
import dayjs from '@/lib/dayjs';
import { paths } from '@/app/router/paths';
import { Link } from 'react-router';
import type {
  BookingDialogMode,
  CreateBookingFormValues,
  CreateBookingResponse,
  MultiCourtBookingSelection,
} from '../types/booking.types';
import { buildCreateBookingFormSchema } from '../schemas/create-booking.schema';
import { useCreateBooking } from '../hooks/useCreateBooking';
import { useCalculateBookingPrice } from '../hooks/useCalculateBookingPrice';
import { useBookingCaller } from '../hooks/useBookingCaller';
import {
  formatBookingTime,
  formatCurrency,
  formatTimeToApi,
  formatBookingDateToApi,
  toCreateBookingRequest,
} from '../utils/booking.mapper';
import { dedupeCourts, validateSelection } from '../utils/multi-court.utils';

export interface CreateBookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: BookingDialogMode;
  selection: MultiCourtBookingSelection | null;
  onRemoveCourt?: (courtId: string) => void;
  onBookingCreated?: (result: CreateBookingResponse) => void;
  onBookingConflict?: () => void;
}

const DEFAULT_VALUES: CreateBookingFormValues = {
  customerName: '',
  phoneNumber: '',
  paymentMethod: 'CASH',
  notes: '',
};

const FIELD_MAP: Record<string, keyof CreateBookingFormValues> = {
  customername: 'customerName',
  phonenumber: 'phoneNumber',
  paymentmethod: 'paymentMethod',
  notes: 'notes',
};

const selectionKeyOf = (selection: MultiCourtBookingSelection | null) =>
  selection
    ? [
        selection.branchId,
        selection.bookingDate,
        selection.startTime,
        selection.endTime,
        selection.courts.map((c) => c.courtId).join(','),
      ].join('|')
    : '';

/** Shared create dialog: one POST /api/bookings with details[] for authenticated users and Guests. */
export const CreateBookingDialog: React.FC<CreateBookingDialogProps> = memo(
  ({ isOpen, onClose, mode = 'CUSTOMER', selection, onRemoveCourt, onBookingCreated, onBookingConflict }) => {
    const { t } = useTranslation();
    const caller = useBookingCaller();
    const isAuthenticatedMode = mode === 'CUSTOMER' && caller.mode === 'authenticated';
    const requireContact = !isAuthenticatedMode;

    const inFlightRef = useRef(false);
    const alertRef = useRef<HTMLDivElement | null>(null);
    const [result, setResult] = useState<CreateBookingResponse | null>(null);
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [conflictKey, setConflictKey] = useState<string | null>(null);
    const [selectionError, setSelectionError] = useState<string | null>(null);

    const { mutateAsync, isPending } = useCreateBooking();

    const schema = useMemo(() => buildCreateBookingFormSchema(requireContact), [requireContact]);
    const {
      register,
      handleSubmit,
      reset,
      setValue,
      setError,
      formState: { errors },
    } = useForm<CreateBookingFormValues>({
      resolver: zodResolver(schema),
      defaultValues: DEFAULT_VALUES,
    });

    const courts = useMemo(() => dedupeCourts(selection?.courts ?? []), [selection?.courts]);
    const selectionKey = selectionKeyOf(selection);
    const needsReview = conflictKey !== null && conflictKey === selectionKey;

    useEffect(() => {
      if (!isOpen) return;
      reset(DEFAULT_VALUES);
      setResult(null);
      setAlertMessage(null);
      setConflictKey(null);
      setSelectionError(null);
    }, [isOpen, reset]);

    // Fill authenticated contact without touching payment method or notes.
    useEffect(() => {
      if (!isOpen || !isAuthenticatedMode) return;
      setValue('customerName', caller.customerName);
      setValue('phoneNumber', caller.phoneNumber);
    }, [isOpen, isAuthenticatedMode, caller.customerName, caller.phoneNumber, setValue]);

    useEffect(() => {
      if (alertMessage) alertRef.current?.focus();
    }, [alertMessage]);

    const pricing = useCalculateBookingPrice(
      {
        branchId: selection?.branchId,
        bookingDate: selection ? formatBookingDateToApi(selection.bookingDate) : null,
        startTime: selection ? formatTimeToApi(selection.startTime) : null,
        endTime: selection ? formatTimeToApi(selection.endTime) : null,
      },
      { enabled: isOpen && Boolean(selection) && courts.length > 0 && !result },
    );
    const unitTotal = pricing.data?.totalAmount;
    const estimatedTotal = unitTotal !== undefined ? unitTotal * courts.length : undefined;

    const onSubmit = async (values: CreateBookingFormValues) => {
      if (inFlightRef.current || !selection) return;
      setAlertMessage(null);
      setSelectionError(null);

      const invalid = validateSelection({ ...selection, courts });
      if (invalid) {
        setSelectionError(
          invalid === 'atLeastOneCourt'
            ? t('booking.multiCourt.atLeastOneCourt')
            : t('booking.multiCourt.sameTimeRequired'),
        );
        return;
      }

      const contact = isAuthenticatedMode
        ? { customerName: caller.customerName, phoneNumber: caller.phoneNumber }
        : values;
      const payload = toCreateBookingRequest({ ...selection, courts }, values, contact);

      inFlightRef.current = true;
      try {
        const data = await mutateAsync({ payload });
        setResult(data);
        reset(DEFAULT_VALUES);
        onBookingCreated?.(data);
      } catch (error: unknown) {
        const apiError = (error ?? {}) as {
          code?: string;
          fields?: Record<string, string>;
          message?: string;
        };
        if (apiError.code?.toUpperCase() === 'BOOKING_CONFLICT') {
          setConflictKey(selectionKey);
          setAlertMessage(t('booking.multiCourt.conflictNoPartial'));
          onBookingConflict?.();
          return;
        }
        let handled = false;
        for (const [rawField, message] of Object.entries(apiError.fields ?? {})) {
          const key = rawField.toLowerCase();
          const field = FIELD_MAP[key];
          if (field && typeof message === 'string') {
            setError(field, { type: 'server', message });
            handled = true;
          } else if (key.startsWith('details') && typeof message === 'string') {
            setSelectionError(message);
            handled = true;
          }
        }
        if (!handled) setAlertMessage(apiError.message || t('common.error', 'Không thể tạo đặt sân.'));
      } finally {
        inFlightRef.current = false;
      }
    };

    const dateLabel = selection ? dayjs(selection.bookingDate).format('DD/MM/YYYY') : '';
    const rangeLabel = selection
      ? `${formatBookingTime(selection.startTime)}-${formatBookingTime(selection.endTime)}`
      : '';
    const submitDisabled =
      isPending ||
      caller.mode === 'loading' ||
      (isAuthenticatedMode && caller.profileIncomplete) ||
      courts.length === 0 ||
      needsReview;

    if (!selection && !result) return null;

    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && !isPending && onClose()}>
        <DialogContent className="h-[calc(100dvh-1rem)] max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] overflow-y-auto p-4 sm:h-auto sm:max-h-[90vh] sm:max-w-md sm:p-6">
          {result ? (
            <div className="space-y-4" data-testid="booking-success">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-emerald-700">
                  <CheckCircle2 className="size-5" aria-hidden />
                  {t('booking.multiCourt.success', { count: result.details.length })}
                </DialogTitle>
                <DialogDescription>
                  {t('booking.success.bookingCode', { code: result.bookingCode })}
                </DialogDescription>
              </DialogHeader>
              <p className="text-sm">
                {result.customerName} · {result.phoneNumber}
              </p>
              <ul className="space-y-1 text-sm">
                {result.details.map((detail) => (
                  <li
                    key={`${detail.courtId}-${detail.startTime}`}
                    className="flex justify-between gap-2 rounded border p-2"
                  >
                    <span>
                      {detail.courtName} · {dayjs(detail.bookingDate).format('DD/MM/YYYY')}{' '}
                      {formatBookingTime(detail.startTime)}-{formatBookingTime(detail.endTime)}
                    </span>
                    <span className="font-mono">{formatCurrency(detail.price)}</span>
                  </li>
                ))}
              </ul>
              <p className="flex justify-between font-semibold">
                <span>{t('booking.success.total')}</span>
                <span className="font-mono">{formatCurrency(result.totalAmount)}</span>
              </p>
              <DialogFooter>
                {isAuthenticatedMode && (
                  <Button asChild variant="outline" size="sm">
                    <Link to={paths.myBooking}>{t('booking.success.viewMyBookings', 'Lịch đặt của tôi')}</Link>
                  </Button>
                )}
                <Button type="button" size="sm" onClick={onClose}>
                  {t('booking.actions.close')}
                </Button>
              </DialogFooter>
            </div>
          ) : (
            selection && (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <DialogHeader>
                  <DialogTitle>{t('booking.multiCourt.title')}</DialogTitle>
                  <DialogDescription>
                    {t('booking.guest.reviewDescription')}
                  </DialogDescription>
                </DialogHeader>

                <section
                  aria-label={t('booking.multiCourt.selectedCourts')}
                  className="space-y-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-950"
                >
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
                    <span>{selection.branchName || ''}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="size-4 shrink-0" aria-hidden />
                    <span>{dateLabel}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="size-4 shrink-0" aria-hidden />
                    <span>{rangeLabel}</span>
                  </div>
                  <p className="font-semibold" aria-live="polite">
                    {t('booking.multiCourt.selectedCount', { count: courts.length })}
                  </p>
                  <ul className="flex flex-wrap gap-1.5">
                    {courts.map((court) => (
                      <li
                        key={court.courtId}
                        className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-white px-2 py-0.5 text-xs font-medium"
                      >
                        {court.courtName}
                        {onRemoveCourt && (
                          <button
                            type="button"
                            disabled={isPending}
                            aria-label={t('booking.multiCourt.removeCourt', { name: court.courtName })}
                            onClick={() => onRemoveCourt(court.courtId)}
                            className="rounded-full p-0.5 hover:bg-emerald-100 disabled:opacity-50"
                          >
                            <X className="size-3" aria-hidden />
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                  {selectionError && (
                    <p role="alert" className="text-xs font-semibold text-red-700">
                      {selectionError}
                    </p>
                  )}
                </section>

                {alertMessage && (
                  <div
                    ref={alertRef}
                    role="alert"
                    tabIndex={-1}
                    className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs font-semibold text-red-700"
                  >
                    <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
                    <span>
                      {alertMessage}
                      {needsReview && ` ${t('booking.multiCourt.reviewRequired')}`}
                    </span>
                  </div>
                )}

                {isAuthenticatedMode && caller.profileIncomplete && (
                  <p role="alert" className="text-xs font-semibold text-red-700">
                    {t('account.missingPhone')}
                  </p>
                )}

                <fieldset className="space-y-3">
                  <legend className="mb-1 text-sm font-semibold">
                    {isAuthenticatedMode
                      ? t('booking.customer.accountContact')
                      : t('booking.customer.guestContact')}
                  </legend>
                  <TextInput
                    id="booking-customer-name"
                    label={t('booking.fields.customerName')}
                    autoComplete="name"
                    readOnly={isAuthenticatedMode}
                    disabled={isPending}
                    error={errors.customerName?.message ? t(errors.customerName.message) : undefined}
                    {...register('customerName')}
                  />
                  <TextInput
                    id="booking-phone-number"
                    label={t('booking.fields.phoneNumber')}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    readOnly={isAuthenticatedMode}
                    disabled={isPending}
                    error={errors.phoneNumber?.message ? t(errors.phoneNumber.message) : undefined}
                    {...register('phoneNumber')}
                  />
                </fieldset>

                <div className="space-y-1">
                  <label htmlFor="booking-payment-method" className="text-sm font-medium">
                    {t('booking.fields.paymentMethod')}
                  </label>
                  <select
                    id="booking-payment-method"
                    disabled={isPending}
                    className="h-10 w-full rounded-md border bg-white px-3 text-sm"
                    {...register('paymentMethod')}
                  >
                    <option value="CASH">{t('booking.paymentMethods.CASH')}</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="booking-notes" className="text-sm font-medium">
                    {t('booking.fields.notes')}
                  </label>
                  <textarea
                    id="booking-notes"
                    rows={2}
                    disabled={isPending}
                    className="w-full rounded-md border bg-white px-3 py-2 text-sm"
                    {...register('notes')}
                  />
                </div>

                {estimatedTotal !== undefined && (
                  <div
                    data-testid="booking-estimate"
                    className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800"
                  >
                    <p className="flex justify-between font-semibold">
                      <span>{t('booking.multiCourt.estimate', { count: courts.length })}</span>
                      <span className="font-mono">{formatCurrency(estimatedTotal)}</span>
                    </p>
                    <p className="mt-1 text-[11px]">{t('booking.multiCourt.estimateNote')}</p>
                  </div>
                )}

                <DialogFooter className="bg-background/95 sticky bottom-0 mt-4 border-t py-3">
                  <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isPending}>
                    {t('common.cancel', 'Hủy')}
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={submitDisabled}
                    aria-busy={isPending}
                    className="bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                        <span role="status">{t('booking.actions.submitting')}</span>
                      </>
                    ) : (
                      t('booking.actions.confirm')
                    )}
                  </Button>
                </DialogFooter>
              </form>
            )
          )}
        </DialogContent>
      </Dialog>
    );
  },
);

CreateBookingDialog.displayName = 'CreateBookingDialog';
