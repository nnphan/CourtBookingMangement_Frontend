import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useMyBookings } from '@/features/bookings/api/booking.query';
import { formatBookingDateToApi, formatTimeToApi } from '@/features/bookings/utils/booking.mapper';
import type { MyBookingListItemDto } from '@/features/bookings/types/booking.types';
import { normalizeBookingStatus } from '@/features/bookings/utils/booking-status.utils';
import dayjs from '@/lib/dayjs';
import { useGetBranches } from '@/hooks/branches/useBranches';
import { useApiErrorMessage } from '@/hooks/useApiErrorMessage';
import type { ApiErrorShape } from '@/types/api';
import { toast } from '@/lib/toast';
import {
  useCreatePlayerMatchDraft,
  usePlayerMatchDraftDetails,
  usePublishPlayerMatchDraft,
  useUpdatePlayerMatchDraft,
} from '../hooks/usePlayerMatching';
import type {
  PlayerMatchDraftRequest,
  PlayerMatchGameType,
  PlayerMatchGenderPolicy,
  PlayerMatchingGender,
} from '../types/player-matching.types';

interface PlayerMatchDraftDialogProps {
  booking?: MyBookingListItemDto | null;
  matchId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormValues {
  bookingId: string;
  branchId: string;
  title: string;
  description: string;
  matchDate: string;
  startTime: string;
  endTime: string;
  gameType: PlayerMatchGameType;
  minimumRating: number;
  maximumRating: number;
  requiredPlayerCount: number;
  genderPolicy: PlayerMatchGenderPolicy;
  requiredGender: PlayerMatchingGender | '';
  participationFee: number;
}

type FormField = keyof FormValues;
type FieldErrors = Partial<Record<FormField, string>>;
type SubmitAction = 'save' | 'publish';

const TIME_ZONE = 'Asia/Ho_Chi_Minh';
const INPUT_CLASS =
  'border-line bg-surface text-content-primary focus-visible:outline-brand-600 min-h-11 w-full rounded-lg border px-3 text-sm focus-visible:outline-2';

const INITIAL_VALUES: FormValues = {
  bookingId: '',
  branchId: '',
  title: '',
  description: '',
  matchDate: '',
  startTime: '',
  endTime: '',
  gameType: 'DOUBLES',
  minimumRating: 0,
  maximumRating: 1000,
  requiredPlayerCount: 4,
  genderPolicy: 'ANY',
  requiredGender: '',
  participationFee: 0,
};

const isBookingInFuture = (booking: MyBookingListItemDto): boolean => {
  if (normalizeBookingStatus(booking.status) !== 'CONFIRMED') return false;
  const endTime = formatTimeToApi(booking.endTime).slice(0, 5);
  const end = dayjs.tz(`${booking.bookingDate} ${endTime}`, 'YYYY-MM-DD HH:mm', TIME_ZONE);
  return end.isValid() && end.isAfter(dayjs().tz(TIME_ZONE));
};

const valuesFromBooking = (booking?: MyBookingListItemDto | null): FormValues => ({
  ...INITIAL_VALUES,
  bookingId: booking?.bookingId ?? '',
  branchId: booking?.branchId ?? '',
  matchDate: booking ? formatBookingDateToApi(booking.bookingDate) : '',
  startTime: booking ? formatTimeToApi(booking.startTime).slice(0, 5) : '',
  endTime: booking ? formatTimeToApi(booking.endTime).slice(0, 5) : '',
});

const getApiFieldErrors = (error: unknown): FieldErrors => {
  if (typeof error !== 'object' || error === null) return {};
  const fields = (error as Partial<ApiErrorShape>).fields;
  if (!fields) return {};

  const fieldMap: Record<string, FormField> = {
    bookingid: 'bookingId',
    branchid: 'branchId',
    title: 'title',
    description: 'description',
    matchdate: 'matchDate',
    starttime: 'startTime',
    endtime: 'endTime',
    gametype: 'gameType',
    minimumrating: 'minimumRating',
    maximumrating: 'maximumRating',
    requiredplayercount: 'requiredPlayerCount',
    genderpolicy: 'genderPolicy',
    requiredgender: 'requiredGender',
    participationfee: 'participationFee',
  };
  const mapped: FieldErrors = {};

  for (const [name, message] of Object.entries(fields)) {
    const field = fieldMap[name.replace(/[_\s]/g, '').toLowerCase()];
    if (field) mapped[field] = message;
  }

  return mapped;
};

export const PlayerMatchDraftDialog = ({
  booking = null,
  matchId,
  open,
  onOpenChange,
}: PlayerMatchDraftDialogProps) => {
  const { t } = useTranslation();
  const getErrorMessage = useApiErrorMessage();
  const bookingsQuery = useMyBookings(open);
  const branchesQuery = useGetBranches(
    {
      status: 'active',
      pageNumber: 1,
      pageSize: 100,
    },
    open,
  );
  const draftQuery = usePlayerMatchDraftDetails(matchId, open);
  const createDraft = useCreatePlayerMatchDraft();
  const updateDraft = useUpdatePlayerMatchDraft();
  const publishDraft = usePublishPlayerMatchDraft();
  const submitLock = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const actionRef = useRef<SubmitAction>('save');
  const focusErrorSummary = useRef(false);
  const populatedDraftId = useRef<string | null>(null);
  const idPrefix = useId();
  const [values, setValues] = useState<FormValues>(() => valuesFromBooking(booking));
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!open || matchId) return;
    setValues(valuesFromBooking(booking));
    setFieldErrors({});
    setFormError('');
  }, [booking, matchId, open]);

  useEffect(() => {
    const draft = draftQuery.data;
    if (!open || !matchId || !draft || populatedDraftId.current === draft.id) return;

    setValues({
      ...INITIAL_VALUES,
      bookingId: draft.bookingId ?? '',
      branchId: draft.branchId,
      title: draft.title,
      description: draft.description ?? '',
      matchDate: draft.matchDate ? formatBookingDateToApi(draft.matchDate) : '',
      startTime: draft.startTime ? formatTimeToApi(draft.startTime).slice(0, 5) : '',
      endTime: draft.endTime ? formatTimeToApi(draft.endTime).slice(0, 5) : '',
      gameType: draft.gameType === 'SINGLES' ? 'SINGLES' : 'DOUBLES',
      minimumRating: draft.minimumRating ?? 0,
      maximumRating: draft.maximumRating ?? 1000,
      requiredPlayerCount: draft.maxPlayers,
      genderPolicy: draft.genderPolicy === 'SPECIFIC' ? 'SPECIFIC' : 'ANY',
      requiredGender: draft.requiredGender ?? '',
      participationFee: draft.feePerPlayer,
    });
    setFieldErrors({});
    setFormError('');
    populatedDraftId.current = draft.id;
  }, [draftQuery.data, matchId, open]);

  const isPending = createDraft.isPending || updateDraft.isPending || publishDraft.isPending;
  const bookingItems = bookingsQuery.data ?? [];
  const eligibleBookings = bookingItems.filter(isBookingInFuture);
  const selectedBooking = bookingItems.find((item) => item.bookingId === values.bookingId) ?? null;
  const canPublish = Boolean(
    selectedBooking && eligibleBookings.some((item) => item.bookingId === values.bookingId),
  );
  const bookingForPayload = canPublish ? selectedBooking : null;
  const titleId = `${idPrefix}-title`;
  const descriptionId = `${idPrefix}-description`;
  const bookingId = `${idPrefix}-booking`;
  const branchId = `${idPrefix}-branch`;
  const dateId = `${idPrefix}-date`;
  const startId = `${idPrefix}-start`;
  const endId = `${idPrefix}-end`;
  const gameTypeId = `${idPrefix}-game-type`;
  const minimumRatingId = `${idPrefix}-minimum-rating`;
  const maximumRatingId = `${idPrefix}-maximum-rating`;
  const capacityId = `${idPrefix}-capacity`;
  const genderPolicyId = `${idPrefix}-gender-policy`;
  const requiredGenderId = `${idPrefix}-required-gender`;
  const feeId = `${idPrefix}-fee`;
  const fieldIds: Record<FormField, string> = {
    bookingId,
    branchId,
    title: titleId,
    description: descriptionId,
    matchDate: dateId,
    startTime: startId,
    endTime: endId,
    gameType: gameTypeId,
    minimumRating: minimumRatingId,
    maximumRating: maximumRatingId,
    requiredPlayerCount: capacityId,
    genderPolicy: genderPolicyId,
    requiredGender: requiredGenderId,
    participationFee: feeId,
  };
  const fieldErrorItems: Array<{ field: FormField; message: string }> = [];
  for (const field of Object.keys(fieldErrors) as FormField[]) {
    const message = fieldErrors[field];
    if (message) fieldErrorItems.push({ field, message });
  }

  useEffect(() => {
    if (!focusErrorSummary.current) return;
    focusErrorSummary.current = false;
    errorSummaryRef.current?.focus();
  }, [fieldErrors]);

  const updateField = <K extends FormField>(field: K, value: FormValues[K]) => {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
    setFormError('');
  };

  const setBooking = (bookingIdValue: string) => {
    const selected = bookingItems.find((item) => item.bookingId === bookingIdValue);
    setValues((current) => ({
      ...current,
      bookingId: bookingIdValue,
      ...(selected
        ? {
            branchId: selected.branchId,
            matchDate: formatBookingDateToApi(selected.bookingDate),
            startTime: formatTimeToApi(selected.startTime).slice(0, 5),
            endTime: formatTimeToApi(selected.endTime).slice(0, 5),
          }
        : {}),
    }));
    setFieldErrors((current) => {
      const next = { ...current };
      delete next.bookingId;
      return next;
    });
    setFormError('');
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isPending) return;
    if (!nextOpen) {
      setValues(valuesFromBooking(null));
      setFieldErrors({});
      setFormError('');
      populatedDraftId.current = null;
    }
    onOpenChange(nextOpen);
  };

  const submit = (action: SubmitAction) => {
    actionRef.current = action;
    formRef.current?.requestSubmit();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitLock.current || isPending) return;
    submitLock.current = true;
    setFieldErrors({});
    setFormError('');

    const nextErrors: FieldErrors = {};
    if (values.title.trim().length < 5 || values.title.trim().length > 200) {
      nextErrors.title = t('playerMatch.drafts.validation.title');
    }
    if (!values.branchId) nextErrors.branchId = t('playerMatch.drafts.validation.branch');
    if (
      !Number.isInteger(values.minimumRating) ||
      values.minimumRating < 0 ||
      values.minimumRating > 1000
    ) {
      nextErrors.minimumRating = t('playerMatch.drafts.validation.rating');
    }
    if (
      !Number.isInteger(values.maximumRating) ||
      values.maximumRating < 0 ||
      values.maximumRating > 1000
    ) {
      nextErrors.maximumRating = t('playerMatch.drafts.validation.rating');
    } else if (values.minimumRating > values.maximumRating) {
      nextErrors.maximumRating = t('playerMatch.drafts.validation.ratingRange');
    }
    if (
      !Number.isInteger(values.requiredPlayerCount) ||
      values.requiredPlayerCount < 2 ||
      values.requiredPlayerCount > 20
    ) {
      nextErrors.requiredPlayerCount = t('playerMatch.drafts.validation.capacity');
    }
    if (values.genderPolicy === 'SPECIFIC' && !values.requiredGender) {
      nextErrors.requiredGender = t('playerMatch.drafts.validation.gender');
    }
    if (!Number.isFinite(values.participationFee) || values.participationFee < 0) {
      nextErrors.participationFee = t('playerMatch.drafts.validation.fee');
    }

    const hasSchedule = Boolean(values.matchDate || values.startTime || values.endTime);
    if (hasSchedule && (!values.matchDate || !values.startTime || !values.endTime)) {
      if (!values.matchDate) {
        nextErrors.matchDate = t('playerMatch.drafts.validation.completeSchedule');
      }
      if (!values.startTime) {
        nextErrors.startTime = t('playerMatch.drafts.validation.completeSchedule');
      }
      if (!values.endTime) {
        nextErrors.endTime = t('playerMatch.drafts.validation.completeSchedule');
      }
    } else if (hasSchedule && values.startTime >= values.endTime) {
      nextErrors.endTime = t('playerMatch.drafts.validation.timeOrder');
    }

    const action = actionRef.current;
    actionRef.current = 'save';
    if (action === 'publish' && !canPublish) {
      nextErrors.bookingId = t('playerMatch.drafts.validation.publishBooking');
    }
    if (Object.keys(nextErrors).length > 0) {
      focusErrorSummary.current = true;
      setFieldErrors(nextErrors);
      submitLock.current = false;
      return;
    }

    const request: PlayerMatchDraftRequest = {
      bookingId: bookingForPayload?.bookingId ?? null,
      branchId: bookingForPayload?.branchId ?? values.branchId,
      courtId: bookingForPayload?.courtId ?? null,
      title: values.title.trim(),
      description: values.description.trim() || null,
      matchDate: bookingForPayload
        ? formatBookingDateToApi(bookingForPayload.bookingDate)
        : values.matchDate || null,
      startTime: bookingForPayload
        ? formatTimeToApi(bookingForPayload.startTime)
        : values.startTime
          ? formatTimeToApi(values.startTime)
          : null,
      endTime: bookingForPayload
        ? formatTimeToApi(bookingForPayload.endTime)
        : values.endTime
          ? formatTimeToApi(values.endTime)
          : null,
      gameType: values.gameType,
      minimumRating: values.minimumRating,
      maximumRating: values.maximumRating,
      requiredPlayerCount: values.requiredPlayerCount,
      genderPolicy: values.genderPolicy,
      requiredGender:
        values.genderPolicy === 'SPECIFIC' && values.requiredGender
          ? values.requiredGender
          : null,
      participationFee: values.participationFee,
    };

    try {
      const result = matchId
        ? await updateDraft.mutateAsync({ id: matchId, payload: request })
        : await createDraft.mutateAsync(request);
      if (action === 'publish') {
        await publishDraft.mutateAsync(result.id);
        toast.success(t('playerMatch.drafts.publishSuccess'));
      } else {
        toast.success(t('playerMatch.drafts.saveSuccess'));
      }
      onOpenChange(false);
    } catch (error) {
      const apiError = error as Partial<ApiErrorShape>;
      const mappedErrors = getApiFieldErrors(error);
      if (Object.values(mappedErrors).some(Boolean)) focusErrorSummary.current = true;
      setFieldErrors(mappedErrors);
      setFormError(getErrorMessage(error) ?? t('playerMatch.drafts.errors.generic'));
      if (apiError.status === 401 || apiError.status === 403) {
        setFormError(t('playerMatch.drafts.errors.permission'));
      }
    } finally {
      submitLock.current = false;
    }
  };

  const fieldError = (field: FormField, id: string) =>
    fieldErrors[field] ? (
      <p id={`${id}-error`} role="alert" className="text-danger text-xs">
        {fieldErrors[field]}
      </p>
    ) : null;

  const renderDateTimeFields = () => (
    <>
      <div className="space-y-1.5">
        <label htmlFor={dateId} className="text-content-primary text-sm font-medium">
          {t('playerMatch.drafts.matchDate')}
        </label>
        <input
          id={dateId}
          type="date"
          value={values.matchDate}
          disabled={Boolean(selectedBooking)}
          onChange={(event) => updateField('matchDate', event.target.value)}
          aria-invalid={Boolean(fieldErrors.matchDate)}
          aria-describedby={fieldErrors.matchDate ? `${dateId}-error` : undefined}
          className={INPUT_CLASS}
        />
        {fieldError('matchDate', dateId)}
      </div>
      <div className="space-y-1.5">
        <label htmlFor={startId} className="text-content-primary text-sm font-medium">
          {t('playerMatch.drafts.startTime')}
        </label>
        <input
          id={startId}
          type="time"
          value={values.startTime}
          disabled={Boolean(selectedBooking)}
          onChange={(event) => updateField('startTime', event.target.value)}
          aria-invalid={Boolean(fieldErrors.startTime)}
          aria-describedby={fieldErrors.startTime ? `${startId}-error` : undefined}
          className={INPUT_CLASS}
        />
        {fieldError('startTime', startId)}
      </div>
      <div className="space-y-1.5">
        <label htmlFor={endId} className="text-content-primary text-sm font-medium">
          {t('playerMatch.drafts.endTime')}
        </label>
        <input
          id={endId}
          type="time"
          value={values.endTime}
          disabled={Boolean(selectedBooking)}
          onChange={(event) => updateField('endTime', event.target.value)}
          aria-invalid={Boolean(fieldErrors.endTime)}
          aria-describedby={fieldErrors.endTime ? `${endId}-error` : undefined}
          className={INPUT_CLASS}
        />
        {fieldError('endTime', endId)}
      </div>
    </>
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="border-line bg-surface max-h-[90dvh] overflow-y-auto sm:max-w-2xl"
        closeDisabled={isPending}
      >
        <DialogHeader>
          <DialogTitle>
            {matchId ? t('playerMatch.drafts.editTitle') : t('playerMatch.drafts.createTitle')}
          </DialogTitle>
          <DialogDescription>{t('playerMatch.drafts.description')}</DialogDescription>
        </DialogHeader>

        {matchId && draftQuery.isLoading ? (
          <div
            role="status"
            className="text-content-secondary flex items-center gap-2 py-6 text-sm"
          >
            <Loader2 aria-hidden="true" className="size-4 animate-spin" />
            {t('playerMatch.drafts.loading')}
          </div>
        ) : matchId && draftQuery.isError ? (
          <div role="alert" className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-danger text-sm">{t('playerMatch.drafts.errors.load')}</p>
            <Button type="button" variant="outline" onClick={() => void draftQuery.refetch()}>
              {t('playerMatch.discovery.retry')}
            </Button>
          </div>
        ) : matchId && draftQuery.data && draftQuery.data.status.toUpperCase() !== 'DRAFT' ? (
          <p role="alert" className="text-danger rounded-lg bg-red-50 p-4 text-sm">
            {t('playerMatch.drafts.errors.notDraft')}
          </p>
        ) : (
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
            <p className="text-content-secondary text-xs">
              {t('playerMatch.drafts.requiredFields')}
            </p>
            {fieldErrorItems.length > 0 && (
              <div
                ref={errorSummaryRef}
                tabIndex={-1}
                role="alert"
                aria-labelledby={`${idPrefix}-error-summary-title`}
                className="focus-visible:outline-brand-600 rounded-lg border border-red-200 bg-red-50 p-4 focus-visible:outline-2"
              >
                <h3
                  id={`${idPrefix}-error-summary-title`}
                  className="text-danger text-sm font-semibold"
                >
                  {t('playerMatch.drafts.validation.summary')}
                </h3>
                <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
                  {fieldErrorItems.map(({ field, message }) => (
                    <li key={field}>
                      <a className="text-content-link underline" href={`#${fieldIds[field]}`}>
                        {message}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <h3 className="text-content-primary text-sm font-bold">
                  {t('playerMatch.drafts.bookingSchedule')}
                </h3>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label htmlFor={bookingId} className="text-content-primary text-sm font-medium">
                  {t('playerMatch.drafts.booking')}
                </label>
                <select
                  id={bookingId}
                  value={values.bookingId}
                  disabled={bookingsQuery.isLoading}
                  onChange={(event) => setBooking(event.target.value)}
                  aria-invalid={Boolean(fieldErrors.bookingId)}
                  aria-describedby={fieldErrors.bookingId ? `${bookingId}-error` : undefined}
                  className={INPUT_CLASS}
                >
                  <option value="">{t('playerMatch.drafts.noBooking')}</option>
                  {selectedBooking &&
                    !eligibleBookings.some(
                      (item) => item.bookingId === selectedBooking.bookingId,
                    ) && (
                      <option value={selectedBooking.bookingId}>
                        {t('playerMatch.drafts.unavailableBooking', {
                          code: selectedBooking.bookingCode,
                        })}
                      </option>
                    )}
                  {values.bookingId && !selectedBooking && (
                    <option value={values.bookingId}>
                      {t('playerMatch.drafts.unavailableBooking', {
                        code: values.bookingId,
                      })}
                    </option>
                  )}
                  {eligibleBookings.map((item) => (
                    <option key={item.bookingId} value={item.bookingId}>
                      {item.bookingCode} · {item.branchName} · {item.courtName} · {item.bookingDate}{' '}
                      · {item.startTime}
                    </option>
                  ))}
                </select>
                {fieldError('bookingId', bookingId)}
                <p className="text-content-secondary text-xs">
                  {t('playerMatch.drafts.bookingHelp')}
                </p>
                {bookingsQuery.isError && (
                  <div role="alert" className="flex flex-wrap items-center gap-2">
                    <p className="text-danger text-xs">{t('playerMatch.drafts.errors.bookings')}</p>
                    <Button
                      type="button"
                      variant="outline"
                      className="min-h-9"
                      onClick={() => void bookingsQuery.refetch()}
                    >
                      {t('playerMatch.discovery.retry')}
                    </Button>
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <label htmlFor={branchId} className="text-content-primary text-sm font-medium">
                  {t('playerMatch.drafts.branch')} <span aria-hidden="true">*</span>
                </label>
                <select
                  id={branchId}
                  value={values.branchId}
                  disabled={Boolean(selectedBooking)}
                  aria-required="true"
                  onChange={(event) => updateField('branchId', event.target.value)}
                  aria-invalid={Boolean(fieldErrors.branchId)}
                  aria-describedby={fieldErrors.branchId ? `${branchId}-error` : undefined}
                  className={INPUT_CLASS}
                >
                  <option value="">{t('playerMatch.drafts.selectBranch')}</option>
                  {values.branchId &&
                    !branchesQuery.branches.some((branch) => branch.id === values.branchId) && (
                      <option value={values.branchId}>
                        {draftQuery.data?.branchName ?? t('playerMatch.drafts.inactiveBranch')}
                      </option>
                    )}
                  {branchesQuery.branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.branchName}
                    </option>
                  ))}
                </select>
                {fieldError('branchId', branchId)}
                {branchesQuery.isError && (
                  <div role="alert" className="flex flex-wrap items-center gap-2">
                    <p className="text-danger text-xs">{t('playerMatch.drafts.errors.branches')}</p>
                    <Button
                      type="button"
                      variant="outline"
                      className="min-h-9"
                      onClick={() => branchesQuery.refetch()}
                    >
                      {t('playerMatch.discovery.retry')}
                    </Button>
                  </div>
                )}
              </div>
              {renderDateTimeFields()}

              <div className="sm:col-span-2">
                <h3 className="text-content-primary text-sm font-bold">
                  {t('playerMatch.drafts.roomDetails')}
                </h3>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label htmlFor={titleId} className="text-content-primary text-sm font-medium">
                  {t('playerMatch.drafts.title')} <span aria-hidden="true">*</span>
                </label>
                <input
                  id={titleId}
                  value={values.title}
                  maxLength={200}
                  aria-required="true"
                  onChange={(event) => updateField('title', event.target.value)}
                  aria-invalid={Boolean(fieldErrors.title)}
                  aria-describedby={fieldErrors.title ? `${titleId}-error` : undefined}
                  className={INPUT_CLASS}
                />
                {fieldError('title', titleId)}
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label htmlFor={descriptionId} className="text-content-primary text-sm font-medium">
                  {t('playerMatch.drafts.descriptionLabel')}
                </label>
                <textarea
                  id={descriptionId}
                  rows={3}
                  value={values.description}
                  onChange={(event) => updateField('description', event.target.value)}
                  aria-invalid={Boolean(fieldErrors.description)}
                  aria-describedby={fieldErrors.description ? `${descriptionId}-error` : undefined}
                  className="border-line bg-surface text-content-primary focus-visible:outline-brand-600 w-full resize-y rounded-lg border px-3 py-2.5 text-sm focus-visible:outline-2"
                />
                {fieldError('description', descriptionId)}
              </div>

              <div className="space-y-1.5">
                <label htmlFor={gameTypeId} className="text-content-primary text-sm font-medium">
                  {t('playerMatch.drafts.gameType')} <span aria-hidden="true">*</span>
                </label>
                <select
                  id={gameTypeId}
                  value={values.gameType}
                  aria-required="true"
                  onChange={(event) =>
                    updateField('gameType', event.target.value as PlayerMatchGameType)
                  }
                  aria-invalid={Boolean(fieldErrors.gameType)}
                  aria-describedby={fieldErrors.gameType ? `${gameTypeId}-error` : undefined}
                  className={INPUT_CLASS}
                >
                  <option value="SINGLES">{t('playerMatch.drafts.singles')}</option>
                  <option value="DOUBLES">{t('playerMatch.drafts.doubles')}</option>
                </select>
                {fieldError('gameType', gameTypeId)}
              </div>

              <div className="space-y-1.5">
                <label htmlFor={capacityId} className="text-content-primary text-sm font-medium">
                  {t('playerMatch.drafts.capacity')} <span aria-hidden="true">*</span>
                </label>
                <input
                  id={capacityId}
                  type="number"
                  min={2}
                  max={20}
                  step={1}
                  value={values.requiredPlayerCount}
                  aria-required="true"
                  onChange={(event) =>
                    updateField('requiredPlayerCount', Number(event.target.value))
                  }
                  aria-invalid={Boolean(fieldErrors.requiredPlayerCount)}
                  aria-describedby={
                    fieldErrors.requiredPlayerCount ? `${capacityId}-error` : undefined
                  }
                  className={INPUT_CLASS}
                />
                {fieldError('requiredPlayerCount', capacityId)}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor={minimumRatingId}
                  className="text-content-primary text-sm font-medium"
                >
                  {t('playerMatch.drafts.minimumRating')} <span aria-hidden="true">*</span>
                </label>
                <input
                  id={minimumRatingId}
                  type="number"
                  min={0}
                  max={1000}
                  step={1}
                  value={values.minimumRating}
                  aria-required="true"
                  onChange={(event) => updateField('minimumRating', Number(event.target.value))}
                  aria-invalid={Boolean(fieldErrors.minimumRating)}
                  aria-describedby={
                    fieldErrors.minimumRating ? `${minimumRatingId}-error` : undefined
                  }
                  className={INPUT_CLASS}
                />
                {fieldError('minimumRating', minimumRatingId)}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor={maximumRatingId}
                  className="text-content-primary text-sm font-medium"
                >
                  {t('playerMatch.drafts.maximumRating')} <span aria-hidden="true">*</span>
                </label>
                <input
                  id={maximumRatingId}
                  type="number"
                  min={0}
                  max={1000}
                  step={1}
                  value={values.maximumRating}
                  aria-required="true"
                  onChange={(event) => updateField('maximumRating', Number(event.target.value))}
                  aria-invalid={Boolean(fieldErrors.maximumRating)}
                  aria-describedby={
                    fieldErrors.maximumRating ? `${maximumRatingId}-error` : undefined
                  }
                  className={INPUT_CLASS}
                />
                {fieldError('maximumRating', maximumRatingId)}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor={genderPolicyId}
                  className="text-content-primary text-sm font-medium"
                >
                  {t('playerMatch.drafts.genderPolicy')} <span aria-hidden="true">*</span>
                </label>
                <select
                  id={genderPolicyId}
                  value={values.genderPolicy}
                  aria-required="true"
                  onChange={(event) =>
                    updateField('genderPolicy', event.target.value as PlayerMatchGenderPolicy)
                  }
                  aria-invalid={Boolean(fieldErrors.genderPolicy)}
                  aria-describedby={
                    fieldErrors.genderPolicy ? `${genderPolicyId}-error` : undefined
                  }
                  className={INPUT_CLASS}
                >
                  <option value="ANY">{t('playerMatch.drafts.anyGender')}</option>
                  <option value="SPECIFIC">{t('playerMatch.drafts.specificGender')}</option>
                </select>
                {fieldError('genderPolicy', genderPolicyId)}
              </div>

              {values.genderPolicy === 'SPECIFIC' && (
                <div className="space-y-1.5">
                  <label
                    htmlFor={requiredGenderId}
                    className="text-content-primary text-sm font-medium"
                  >
                    {t('playerMatch.drafts.requiredGender')} <span aria-hidden="true">*</span>
                  </label>
                  <select
                    id={requiredGenderId}
                    value={values.requiredGender}
                    aria-required="true"
                    onChange={(event) =>
                      updateField('requiredGender', event.target.value as PlayerMatchingGender | '')
                    }
                    aria-invalid={Boolean(fieldErrors.requiredGender)}
                    aria-describedby={
                      fieldErrors.requiredGender ? `${requiredGenderId}-error` : undefined
                    }
                    className={INPUT_CLASS}
                  >
                    <option value="">{t('playerMatch.drafts.selectGender')}</option>
                    <option value="MALE">{t('playerMatch.create.genders.male')}</option>
                    <option value="FEMALE">{t('playerMatch.create.genders.female')}</option>
                    <option value="OTHER">{t('playerMatch.drafts.otherGender')}</option>
                  </select>
                  {fieldError('requiredGender', requiredGenderId)}
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor={feeId} className="text-content-primary text-sm font-medium">
                  {t('playerMatch.drafts.fee')} <span aria-hidden="true">*</span>
                </label>
                <input
                  id={feeId}
                  type="number"
                  min={0}
                  step="any"
                  value={values.participationFee}
                  aria-required="true"
                  onChange={(event) => updateField('participationFee', Number(event.target.value))}
                  aria-invalid={Boolean(fieldErrors.participationFee)}
                  aria-describedby={fieldErrors.participationFee ? `${feeId}-error` : undefined}
                  className={INPUT_CLASS}
                />
                {fieldError('participationFee', feeId)}
              </div>
            </div>

            {formError && (
              <p role="alert" className="text-danger rounded-lg bg-red-50 p-3 text-sm">
                {formError}
              </p>
            )}
            {!canPublish && (
              <p id={`${idPrefix}-publish-help`} className="text-content-secondary text-xs">
                {t('playerMatch.drafts.publishBookingHelp')}
              </p>
            )}
            <DialogFooter className="flex-col-reverse sm:flex-row">
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => handleOpenChange(false)}
              >
                {t('playerMatch.create.cancel')}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => submit('save')}
              >
                {isPending && <Loader2 aria-hidden="true" className="size-4 animate-spin" />}
                {t('playerMatch.drafts.saveDraft')}
              </Button>
              <Button
                type="button"
                disabled={isPending || !canPublish}
                aria-describedby={!canPublish ? `${idPrefix}-publish-help` : undefined}
                onClick={() => submit('publish')}
              >
                {isPending && <Loader2 aria-hidden="true" className="size-4 animate-spin" />}
                {t('playerMatch.drafts.publish')}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
