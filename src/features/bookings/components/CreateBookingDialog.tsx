import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock,
  Loader2,
  LogIn,
  MapPin,
  User,
  UserCheck,
  X,
} from 'lucide-react';
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
  SelectedBookingCourt,
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

const selectionKeyOf = (selection: MultiCourtBookingSelection | null): string => {
  if (!selection) return '';
  if (selection.details && selection.details.length > 0) {
    return [
      selection.branchId,
      selection.details
        .map((d) => `${d.courtId}:${d.bookingDate}:${d.startTime}:${d.endTime}`)
        .join(','),
    ].join('|');
  }
  return [
    selection.branchId,
    selection.bookingDate,
    selection.startTime,
    selection.endTime,
    (selection.courts ?? []).map((c) => c.courtId).join(','),
  ].join('|');
};

/**
 * Shared create dialog: supports both Authenticated Users and Anonymous Guests.
 * Calls POST /api/bookings with one aggregate Booking and details[].
 */
export const CreateBookingDialog: React.FC<CreateBookingDialogProps> = memo(
  ({
    isOpen,
    onClose,
    mode = 'CUSTOMER',
    selection,
    onRemoveCourt,
    onBookingCreated,
    onBookingConflict,
  }) => {
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

    const courts = useMemo(() => {
      if (selection?.details && selection.details.length > 0) {
        const list: SelectedBookingCourt[] = selection.details.map((d) => ({
          courtId: d.courtId,
          courtName: d.courtName || d.courtId,
        }));
        return dedupeCourts(list);
      }
      return dedupeCourts(selection?.courts ?? []);
    }, [selection?.courts, selection?.details]);

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

    // Fill authenticated contact automatically
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
        bookingDate: selection?.bookingDate ? formatBookingDateToApi(selection.bookingDate) : null,
        startTime: selection?.startTime ? formatTimeToApi(selection.startTime) : null,
        endTime: selection?.endTime ? formatTimeToApi(selection.endTime) : null,
      },
      {
        enabled:
          isOpen &&
          Boolean(selection?.branchId) &&
          Boolean(selection?.startTime) &&
          Boolean(selection?.endTime) &&
          courts.length > 0 &&
          !result,
      },
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
            ? t('booking.multiCourt.atLeastOneCourt', 'Vui lòng chọn ít nhất một sân.')
            : t('booking.multiCourt.sameTimeRequired', 'Khung giờ không hợp lệ.'),
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
          setAlertMessage(
            t(
              'booking.multiCourt.conflictNoPartial',
              'Một hoặc nhiều sân vừa được người khác đặt. Vui lòng chọn lại.',
            ),
          );
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
        if (!handled) {
          setAlertMessage(apiError.message || t('common.error', 'Không thể tạo đặt sân.'));
        }
      } finally {
        inFlightRef.current = false;
      }
    };

    const dateLabel = selection?.bookingDate
      ? dayjs(selection.bookingDate).format('DD/MM/YYYY')
      : '';
    const rangeLabel =
      selection?.startTime && selection?.endTime
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
        <DialogContent
          aria-describedby="booking-dialog-description"
          className="h-[calc(100dvh-1rem)] max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] overflow-y-auto p-4 sm:h-auto sm:max-h-[90vh] sm:max-w-lg sm:p-6"
        >
          {result ? (
            <div className="space-y-4" data-testid="booking-success">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-emerald-700">
                  <CheckCircle2 className="size-5" aria-hidden />
                  {t('booking.multiCourt.success', { count: result.details.length })}
                </DialogTitle>
                <DialogDescription id="booking-dialog-description">
                  {t('booking.success.bookingCode', { code: result.bookingCode })}
                </DialogDescription>
              </DialogHeader>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
                <p className="font-semibold text-slate-800">{result.customerName}</p>
                <p className="text-slate-600 font-mono text-xs">{result.phoneNumber}</p>
              </div>

              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-slate-700">
                  {t('booking.multiCourt.selectedCourts', 'Sân đã đặt')}:
                </p>
                <ul className="space-y-1.5 text-sm">
                  {result.details.map((detail) => (
                    <li
                      key={`${detail.courtId}-${detail.startTime}`}
                      className="flex items-center justify-between gap-2 rounded-md border border-slate-200 bg-white p-2.5 shadow-2xs"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900">{detail.courtName}</span>
                        <span className="text-xs text-slate-500">
                          {dayjs(detail.bookingDate).format('DD/MM/YYYY')} ·{' '}
                          {formatBookingTime(detail.startTime)} - {formatBookingTime(detail.endTime)}
                        </span>
                      </div>
                      <span className="font-mono font-semibold text-slate-900">
                        {formatCurrency(detail.price)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50/70 p-3 font-semibold text-emerald-950">
                <span>{t('booking.success.total', 'Tổng tiền')}</span>
                <span className="font-mono text-base font-bold text-emerald-800">
                  {formatCurrency(result.totalAmount)}
                </span>
              </div>

              <DialogFooter className="mt-4 gap-2">
                {isAuthenticatedMode && (
                  <Button asChild variant="outline" size="sm">
                    <Link to={paths.myBooking}>
                      {t('booking.success.viewMyBookings', 'Lịch đặt của tôi')}
                    </Link>
                  </Button>
                )}
                <Button type="button" size="sm" onClick={onClose}>
                  {t('booking.actions.close', 'Đóng')}
                </Button>
              </DialogFooter>
            </div>
          ) : (
            selection && (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4.5" noValidate>
                <DialogHeader>
                  <DialogTitle>{t('booking.multiCourt.title', 'Đặt sân')}</DialogTitle>
                  <DialogDescription id="booking-dialog-description">
                    {t(
                      'booking.guest.reviewDescription',
                      'Kiểm tra thông tin và xác nhận đặt sân.',
                    )}
                  </DialogDescription>
                </DialogHeader>

                {/* 1. Branch and Schedule Summary Card */}
                <section
                  aria-label={t('booking.multiCourt.selectedCourts', 'Sân đã chọn')}
                  className="space-y-2.5 rounded-lg border border-emerald-200 bg-emerald-50/80 p-3.5 text-xs text-emerald-950"
                >
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-emerald-700" aria-hidden />
                    <span className="font-semibold text-emerald-900">
                      {selection.branchName || t('common.unknownBranch', 'Chi nhánh')}
                    </span>
                  </div>

                  {dateLabel && (
                    <div className="flex items-center gap-2">
                      <CalendarDays className="size-4 shrink-0 text-emerald-700" aria-hidden />
                      <span>{dateLabel}</span>
                    </div>
                  )}

                  {rangeLabel && (
                    <div className="flex items-center gap-2">
                      <Clock className="size-4 shrink-0 text-emerald-700" aria-hidden />
                      <span>{rangeLabel}</span>
                    </div>
                  )}

                  {/* Independent detail ranges if available */}
                  {selection.details && selection.details.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <p className="font-semibold text-emerald-900">
                        {t('booking.multiCourt.scheduleDetails', 'Lịch chi tiết theo sân')}:
                      </p>
                      <ul className="space-y-1">
                        {selection.details.map((detail, idx) => (
                          <li
                            key={`${detail.courtId}-${detail.bookingDate}-${detail.startTime}-${idx}`}
                            className="flex items-center justify-between rounded border border-emerald-300/80 bg-white px-2 py-1 shadow-2xs"
                          >
                            <span className="font-medium text-slate-800">
                              {detail.courtName || detail.courtId}
                            </span>
                            <span className="text-slate-600 font-mono text-[11px]">
                              {formatBookingTime(detail.startTime)} -{' '}
                              {formatBookingTime(detail.endTime)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="pt-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-emerald-900" aria-live="polite">
                        {t('booking.multiCourt.selectedCount', { count: courts.length })}
                      </p>
                    </div>

                    <ul className="mt-1.5 flex flex-wrap gap-1.5">
                      {courts.map((court) => (
                        <li
                          key={court.courtId}
                          className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-white px-2.5 py-0.5 text-xs font-medium text-emerald-900 shadow-2xs"
                        >
                          {court.courtName}
                          {onRemoveCourt && (
                            <button
                              type="button"
                              disabled={isPending}
                              aria-label={t('booking.multiCourt.removeCourt', {
                                name: court.courtName,
                              })}
                              onClick={() => onRemoveCourt(court.courtId)}
                              className="rounded-full p-0.5 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                            >
                              <X className="size-3" aria-hidden />
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {selectionError && (
                    <p role="alert" className="text-xs font-semibold text-red-700">
                      {selectionError}
                    </p>
                  )}
                </section>

                {/* Conflict or Server Alert */}
                {alertMessage && (
                  <div
                    ref={alertRef}
                    role="alert"
                    tabIndex={-1}
                    className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700 shadow-2xs"
                  >
                    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-600" aria-hidden />
                    <span>
                      {alertMessage}
                      {needsReview && ` ${t('booking.multiCourt.reviewRequired')}`}
                    </span>
                  </div>
                )}

                {/* 2. Contact Information Section (Guest vs Authenticated) */}
                <fieldset className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/50 p-3.5">
                  <legend className="px-1 text-xs font-bold text-slate-800">
                    {isAuthenticatedMode
                      ? t('booking.customer.accountContact', 'Thông tin từ tài khoản của bạn')
                      : t('booking.customer.guestContact', 'Thông tin liên hệ (khách)')}
                  </legend>

                  {/* Guest Notice Callout */}
                  {!isAuthenticatedMode && (
                    <div className="flex items-start justify-between gap-2.5 rounded-md border border-blue-200 bg-blue-50/80 p-2.5 text-xs text-blue-900">
                      <div className="flex items-start gap-2">
                        <UserCheck className="mt-0.5 size-4 shrink-0 text-blue-600" aria-hidden />
                        <div className="space-y-0.5">
                          <p className="font-semibold">
                            {t('booking.guest.guestNoticeTitle', 'Đặt sân không cần tài khoản')}
                          </p>
                          <p className="text-[11px] leading-relaxed text-blue-800/90">
                            {t(
                              'booking.guest.guestNoticeDesc',
                              'Bạn đang đặt sân với tư cách khách vãng lai. Vui lòng cung cấp họ tên và số điện thoại để sân liên hệ xác nhận lịch.',
                            )}
                          </p>
                        </div>
                      </div>
                      <Link
                        to={paths.login}
                        className="inline-flex shrink-0 items-center gap-1 rounded border border-blue-300 bg-white px-2 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-100"
                        title={t('booking.guest.guestLoginAction', 'Đăng nhập')}
                      >
                        <LogIn className="size-3" aria-hidden />
                        <span>{t('booking.guest.guestLoginAction', 'Đăng nhập')}</span>
                      </Link>
                    </div>
                  )}

                  {/* Authenticated summary banner */}
                  {isAuthenticatedMode && (
                    <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50/70 p-2 text-xs text-emerald-950">
                      <User className="size-4 shrink-0 text-emerald-600" aria-hidden />
                      <div>
                        <span className="font-semibold">{caller.customerName}</span>
                        <span className="mx-1.5 text-slate-400">·</span>
                        <span className="font-mono text-emerald-800">{caller.phoneNumber}</span>
                      </div>
                    </div>
                  )}

                  {isAuthenticatedMode && caller.profileIncomplete && (
                    <p role="alert" className="text-xs font-semibold text-red-700">
                      {t('account.missingPhone', 'Tài khoản của bạn chưa có số điện thoại.')}
                    </p>
                  )}

                  <div className="space-y-2.5">
                    <div>
                      <TextInput
                        id="booking-customer-name"
                        label={`${t('booking.fields.customerName', 'Họ và tên')} *`}
                        autoComplete="name"
                        readOnly={isAuthenticatedMode}
                        disabled={isPending}
                        error={
                          errors.customerName?.message ? t(errors.customerName.message) : undefined
                        }
                        {...register('customerName')}
                      />
                    </div>

                    <div>
                      <TextInput
                        id="booking-phone-number"
                        label={`${t('booking.fields.phoneNumber', 'Số điện thoại')} *`}
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        readOnly={isAuthenticatedMode}
                        disabled={isPending}
                        error={
                          errors.phoneNumber?.message ? t(errors.phoneNumber.message) : undefined
                        }
                        {...register('phoneNumber')}
                      />
                    </div>
                  </div>
                </fieldset>

                {/* 3. Booking Options Section */}
                <div className="space-y-2.5">
                  <div className="space-y-1">
                    <label htmlFor="booking-payment-method" className="text-xs font-semibold text-slate-700">
                      {t('booking.fields.paymentMethod', 'Phương thức thanh toán')}
                    </label>
                    <select
                      id="booking-payment-method"
                      disabled={isPending}
                      className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-xs shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                      {...register('paymentMethod')}
                    >
                      <option value="CASH">{t('booking.paymentMethods.CASH', 'Tiền mặt tại sân')}</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="booking-notes" className="text-xs font-semibold text-slate-700">
                      {t('booking.fields.notes', 'Ghi chú cho sân (tùy chọn)')}
                    </label>
                    <textarea
                      id="booking-notes"
                      rows={2}
                      disabled={isPending}
                      placeholder={t('booking.placeholders.notes', 'Ví dụ: Cần mượn vợt, nước uống...')}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs shadow-2xs placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                      {...register('notes')}
                    />
                  </div>
                </div>

                {/* 4. Price Estimation Box */}
                {estimatedTotal !== undefined && (
                  <div
                    data-testid="booking-estimate"
                    className="rounded-lg border border-green-200 bg-green-50/80 p-3 text-xs text-green-900"
                  >
                    <div className="flex items-center justify-between font-semibold">
                      <span>{t('booking.multiCourt.estimate', { count: courts.length })}</span>
                      <span className="font-mono text-sm font-bold text-emerald-800">
                        {formatCurrency(estimatedTotal)}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-green-700/90">
                      {t('booking.multiCourt.estimateNote')}
                    </p>
                  </div>
                )}

                {/* Sticky Action Footer */}
                <DialogFooter className="sticky bottom-0 -mx-4 -mb-4 mt-6 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-xs sm:-mx-6 sm:-mb-6 sm:px-6">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onClose}
                    disabled={isPending}
                  >
                    {t('common.cancel', 'Hủy')}
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={submitDisabled}
                    aria-busy={isPending}
                    className="bg-emerald-600 text-white shadow-xs hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                        <span role="status">{t('booking.actions.submitting', 'Đang đặt sân...')}</span>
                      </>
                    ) : (
                      t('booking.actions.confirm', 'Xác nhận đặt sân')
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
