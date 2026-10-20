import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { CalendarDays, Clock3, LoaderCircle, MapPin, UsersRound } from 'lucide-react';
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
import {
  formatBookingDateToApi,
  formatCurrency,
  formatTimeToApi,
} from '@/features/bookings/utils/booking.mapper';
import type { MyBookingListItemDto } from '@/features/bookings/types/booking.types';
import dayjs from '@/lib/dayjs';
import { toast } from '@/lib/toast';
import { useCreatePlayerMatch } from '../hooks/usePlayerMatching';
import type {
  CreatePlayerMatchRequest,
  PlayerMatchGenderPreference,
  PlayerMatchSkillLevel,
} from '../types/player-matching.types';

interface CreatePlayerMatchDialogProps {
  booking: MyBookingListItemDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormValues {
  title: string;
  description: string;
  skillLevel: PlayerMatchSkillLevel;
  genderPreference: PlayerMatchGenderPreference;
  maxPlayers: number;
  currentPlayers: number;
  feePerPlayer: number;
}

type FormField = keyof FormValues;
type FieldErrors = Partial<Record<FormField, string>>;
type PlayerMatchApiError = Error & {
  status?: number;
  code?: string;
  fields?: Record<string, string>;
};

const TIME_ZONE = 'Asia/Ho_Chi_Minh';

const createInitialValues = (): FormValues => ({
  title: '',
  description: '',
  skillLevel: 'INTERMEDIATE',
  genderPreference: 'BOTH',
  maxPlayers: 4,
  currentPlayers: 1,
  feePerPlayer: 0,
});

const isBookingInFuture = (booking: MyBookingListItemDto): boolean => {
  const time = booking.endTime.split(':').slice(0, 2).join(':');
  const end = dayjs.tz(`${booking.bookingDate} ${time}`, 'YYYY-MM-DD HH:mm', TIME_ZONE);
  return end.isValid() && end.isAfter(dayjs().tz(TIME_ZONE));
};

export const CreatePlayerMatchDialog = ({
  booking,
  open,
  onOpenChange,
}: CreatePlayerMatchDialogProps) => {
  const { t } = useTranslation();
  const mutation = useCreatePlayerMatch();
  const submitLock = useRef(false);
  const titleId = useId();
  const descriptionId = useId();
  const skillId = useId();
  const genderId = useId();
  const playersId = useId();
  const currentPlayersId = useId();
  const feeId = useId();
  const [values, setValues] = useState<FormValues>(createInitialValues);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (open) {
      setValues(createInitialValues());
      setFieldErrors({});
      setFormError('');
    }
  }, [booking?.bookingId, open]);

  if (!booking) return null;

  const validateCurrentPlayers = (currentPlayers: number, maxPlayers: number) => {
    if (!Number.isInteger(currentPlayers)) {
      return t('playerMatch.create.validation.currentPlayersInvalid');
    }
    if (currentPlayers < 0) {
      return t('playerMatch.create.validation.currentPlayersNegative');
    }
    if (currentPlayers < 1) {
      return t('playerMatch.create.validation.currentPlayersRequired');
    }
    if (currentPlayers > maxPlayers) {
      return t('playerMatch.create.validation.currentPlayersExceedsMax');
    }
    return undefined;
  };

  const updateField = <K extends FormField>(field: K, value: FormValues[K]) => {
    const nextValues = { ...values, [field]: value };
    setValues(nextValues);
    setFieldErrors((current) => {
      const nextErrors = { ...current, [field]: undefined };
      if (field === 'maxPlayers' || field === 'currentPlayers') {
        nextErrors.currentPlayers = validateCurrentPlayers(
          nextValues.currentPlayers,
          nextValues.maxPlayers,
        );
      }
      return nextErrors;
    });
    setFormError('');
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && mutation.isPending) return;
    if (!nextOpen) {
      setValues(createInitialValues());
      setFieldErrors({});
      setFormError('');
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitLock.current || mutation.isPending) return;
    submitLock.current = true;
    setFieldErrors({});
    setFormError('');

    const nextErrors: FieldErrors = {};
    if (!values.title.trim()) nextErrors.title = t('playerMatch.create.validation.titleRequired');
    if (!Number.isInteger(values.maxPlayers) || values.maxPlayers < 1) {
      nextErrors.maxPlayers = t('playerMatch.create.validation.playersInvalid');
    }
    const currentPlayersError = validateCurrentPlayers(values.currentPlayers, values.maxPlayers);
    if (currentPlayersError) nextErrors.currentPlayers = currentPlayersError;
    if (!Number.isFinite(values.feePerPlayer) || values.feePerPlayer < 0) {
      nextErrors.feePerPlayer = t('playerMatch.create.validation.feeInvalid');
    }
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      submitLock.current = false;
      return;
    }
    if (!isBookingInFuture(booking)) {
      setFormError(t('playerMatch.create.errors.bookingPast'));
      submitLock.current = false;
      return;
    }

    const request: CreatePlayerMatchRequest = {
      bookingId: booking.bookingId,
      branchId: booking.branchId,
      courtId: booking.courtId,
      title: values.title.trim(),
      description: values.description.trim() || undefined,
      matchDate: formatBookingDateToApi(booking.bookingDate),
      startTime: formatTimeToApi(booking.startTime),
      endTime: formatTimeToApi(booking.endTime),
      skillLevel: values.skillLevel,
      genderPreference: values.genderPreference,
      maxPlayers: values.maxPlayers,
      currentPlayers: Number(values.currentPlayers),
      feePerPlayer: values.feePerPlayer,
    };

    try {
      await mutation.mutateAsync(request);
      toast.success(t('playerMatch.create.success'));
      setValues(createInitialValues());
      onOpenChange(false);
    } catch (error) {
      const apiError = error as PlayerMatchApiError;
      const mappedErrors: FieldErrors = {};
      for (const field of [
        'title',
        'description',
        'skillLevel',
        'genderPreference',
        'maxPlayers',
        'currentPlayers',
        'feePerPlayer',
      ] as const) {
        const message =
          apiError.fields?.[field] ??
          (field === 'currentPlayers' ? apiError.fields?.CurrentPlayers : undefined);
        if (message) mappedErrors[field] = message;
      }
      setFieldErrors(mappedErrors);

      if (
        apiError.status === 409 ||
        /conflict|already.exists|duplicate/i.test(apiError.code ?? '')
      ) {
        setFormError(t('playerMatch.create.errors.conflict'));
      } else if (apiError.status === 401) {
        setFormError(t('playerMatch.create.errors.unauthorized'));
      } else if (apiError.status === 403) {
        setFormError(t('playerMatch.create.errors.forbidden'));
      } else if (apiError.status === 404) {
        setFormError(t('playerMatch.create.errors.bookingChanged'));
      } else if (apiError.status === 0 || !apiError.status) {
        setFormError(t('playerMatch.create.errors.network'));
      } else if (Object.keys(mappedErrors).length === 0) {
        setFormError(t('playerMatch.create.errors.generic'));
      }
    } finally {
      submitLock.current = false;
    }
  };

  const date = dayjs.tz(booking.bookingDate, 'YYYY-MM-DD', TIME_ZONE);
  const formattedDate = date.isValid()
    ? date.locale('vi').format('DD/MM/YYYY')
    : booking.bookingDate;
  const formattedStartTime = formatTimeToApi(booking.startTime).slice(0, 5);
  const formattedEndTime = formatTimeToApi(booking.endTime).slice(0, 5);
  const remainingPlayers = Math.max(values.maxPlayers - values.currentPlayers, 0);
  const canShowRemainingPlayers =
    Number.isInteger(values.maxPlayers) &&
    values.maxPlayers >= 1 &&
    Number.isInteger(values.currentPlayers) &&
    values.currentPlayers >= 1 &&
    values.currentPlayers <= values.maxPlayers;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="border-line bg-surface max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('playerMatch.create.title')}</DialogTitle>
          <DialogDescription>{t('playerMatch.create.description')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <section aria-labelledby="booking-summary-title" className="space-y-3">
            <h3 id="booking-summary-title" className="text-content-primary text-sm font-bold">
              {t('playerMatch.create.bookingInfo')}
            </h3>
            <div className="bg-surface-muted border-line grid gap-3 rounded-lg border p-4 sm:grid-cols-2">
              <div className="flex min-w-0 items-start gap-2.5">
                <MapPin aria-hidden="true" className="text-brand-600 mt-0.5 size-4 shrink-0" />
                <div className="min-w-0">
                  <p className="text-content-secondary text-xs">{t('playerMatch.create.branch')}</p>
                  <p className="text-content-primary text-sm font-semibold wrap-break-word">
                    {booking.branchName}
                  </p>
                </div>
              </div>
              <div className="flex min-w-0 items-start gap-2.5">
                <UsersRound aria-hidden="true" className="text-brand-600 mt-0.5 size-4 shrink-0" />
                <div className="min-w-0">
                  <p className="text-content-secondary text-xs">{t('playerMatch.create.court')}</p>
                  <p className="text-content-primary text-sm font-semibold wrap-break-word">
                    {booking.courtName}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CalendarDays
                  aria-hidden="true"
                  className="text-brand-600 mt-0.5 size-4 shrink-0"
                />
                <div>
                  <p className="text-content-secondary text-xs">{t('playerMatch.create.date')}</p>
                  <p className="text-content-primary text-sm font-semibold">{formattedDate}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock3 aria-hidden="true" className="text-brand-600 mt-0.5 size-4 shrink-0" />
                <div>
                  <p className="text-content-secondary text-xs">{t('playerMatch.create.time')}</p>
                  <p className="text-content-primary text-sm font-semibold tabular-nums">
                    {formattedStartTime} - {formattedEndTime}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-content-primary text-sm font-bold">
              {t('playerMatch.create.matchInfo')}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <label htmlFor={titleId} className="text-content-primary text-sm font-medium">
                  {t('playerMatch.create.titleLabel')} <span aria-hidden="true">*</span>
                </label>
                <input
                  id={titleId}
                  required
                  value={values.title}
                  onChange={(event) => updateField('title', event.target.value)}
                  aria-invalid={Boolean(fieldErrors.title)}
                  aria-describedby={fieldErrors.title ? `${titleId}-error` : undefined}
                  placeholder={t('playerMatch.create.titlePlaceholder')}
                  className="border-line bg-surface text-content-primary placeholder:text-content-placeholder focus-visible:outline-brand-600 min-h-11 w-full rounded-lg border px-3 text-sm focus-visible:outline-2"
                />
                {fieldErrors.title && (
                  <p id={`${titleId}-error`} role="alert" className="text-danger text-xs">
                    {fieldErrors.title}
                  </p>
                )}
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label htmlFor={descriptionId} className="text-content-primary text-sm font-medium">
                  {t('playerMatch.create.descriptionLabel')}
                </label>
                <textarea
                  id={descriptionId}
                  rows={3}
                  value={values.description}
                  onChange={(event) => updateField('description', event.target.value)}
                  aria-invalid={Boolean(fieldErrors.description)}
                  aria-describedby={fieldErrors.description ? `${descriptionId}-error` : undefined}
                  className="border-line bg-surface text-content-primary placeholder:text-content-placeholder focus-visible:outline-brand-600 w-full resize-y rounded-lg border px-3 py-2.5 text-sm focus-visible:outline-2"
                />
                {fieldErrors.description && (
                  <p id={`${descriptionId}-error`} role="alert" className="text-danger text-xs">
                    {fieldErrors.description}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor={skillId} className="text-content-primary text-sm font-medium">
                  {t('playerMatch.create.skillLevel')}
                </label>
                <select
                  id={skillId}
                  value={values.skillLevel}
                  onChange={(event) =>
                    updateField('skillLevel', event.target.value as PlayerMatchSkillLevel)
                  }
                  aria-invalid={Boolean(fieldErrors.skillLevel)}
                  aria-describedby={fieldErrors.skillLevel ? `${skillId}-error` : undefined}
                  className="border-line bg-surface text-content-primary focus-visible:outline-brand-600 min-h-11 w-full rounded-lg border px-3 text-sm focus-visible:outline-2"
                >
                  <option value="BEGINNER">{t('playerMatch.create.skills.beginner')}</option>
                  <option value="INTERMEDIATE">
                    {t('playerMatch.create.skills.intermediate')}
                  </option>
                  <option value="ADVANCED">{t('playerMatch.create.skills.advanced')}</option>
                  <option value="PROFESSIONAL">
                    {t('playerMatch.create.skills.professional')}
                  </option>
                </select>
                {fieldErrors.skillLevel && (
                  <p id={`${skillId}-error`} role="alert" className="text-danger text-xs">
                    {fieldErrors.skillLevel}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor={genderId} className="text-content-primary text-sm font-medium">
                  {t('playerMatch.create.genderPreference')}
                </label>
                <select
                  id={genderId}
                  value={values.genderPreference}
                  onChange={(event) =>
                    updateField(
                      'genderPreference',
                      event.target.value as PlayerMatchGenderPreference,
                    )
                  }
                  aria-invalid={Boolean(fieldErrors.genderPreference)}
                  aria-describedby={fieldErrors.genderPreference ? `${genderId}-error` : undefined}
                  className="border-line bg-surface text-content-primary focus-visible:outline-brand-600 min-h-11 w-full rounded-lg border px-3 text-sm focus-visible:outline-2"
                >
                  <option value="MALE">{t('playerMatch.create.genders.male')}</option>
                  <option value="FEMALE">{t('playerMatch.create.genders.female')}</option>
                  <option value="BOTH">{t('playerMatch.create.genders.both')}</option>
                </select>
                {fieldErrors.genderPreference && (
                  <p id={`${genderId}-error`} role="alert" className="text-danger text-xs">
                    {fieldErrors.genderPreference}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor={playersId} className="text-content-primary text-sm font-medium">
                  {t('playerMatch.create.maxPlayers')}
                </label>
                <input
                  id={playersId}
                  type="number"
                  min={1}
                  step={1}
                  value={values.maxPlayers}
                  onChange={(event) => updateField('maxPlayers', Number(event.target.value))}
                  aria-invalid={Boolean(fieldErrors.maxPlayers)}
                  aria-describedby={fieldErrors.maxPlayers ? `${playersId}-error` : undefined}
                  className="border-line bg-surface text-content-primary focus-visible:outline-brand-600 min-h-11 w-full rounded-lg border px-3 text-sm focus-visible:outline-2"
                />
                {fieldErrors.maxPlayers && (
                  <p id={`${playersId}-error`} role="alert" className="text-danger text-xs">
                    {fieldErrors.maxPlayers}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor={currentPlayersId}
                  className="text-content-primary text-sm font-medium"
                >
                  {t('playerMatch.create.currentPlayers')}
                </label>
                <input
                  id={currentPlayersId}
                  type="number"
                  min={1}
                  max={values.maxPlayers}
                  step={1}
                  value={values.currentPlayers}
                  onChange={(event) => updateField('currentPlayers', Number(event.target.value))}
                  aria-invalid={Boolean(fieldErrors.currentPlayers)}
                  aria-describedby={
                    fieldErrors.currentPlayers
                      ? `${currentPlayersId}-error ${currentPlayersId}-help`
                      : `${currentPlayersId}-help`
                  }
                  className="border-line bg-surface text-content-primary focus-visible:outline-brand-600 min-h-11 w-full rounded-lg border px-3 text-sm focus-visible:outline-2"
                />
                {fieldErrors.currentPlayers && (
                  <p id={`${currentPlayersId}-error`} role="alert" className="text-danger text-xs">
                    {fieldErrors.currentPlayers}
                  </p>
                )}
                <p id={`${currentPlayersId}-help`} className="text-content-secondary text-xs">
                  {t('playerMatch.create.currentPlayersHelp')}
                </p>
                {canShowRemainingPlayers && (
                  <p className="text-content-secondary text-xs" aria-live="off">
                    {remainingPlayers === 0
                      ? t('playerMatch.create.full')
                      : t('playerMatch.create.remainingPlayers', { count: remainingPlayers })}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor={feeId} className="text-content-primary text-sm font-medium">
                  {t('playerMatch.create.feePerPlayer')}
                </label>
                <div className="relative">
                  <input
                    id={feeId}
                    type="number"
                    min={0}
                    step={1000}
                    value={values.feePerPlayer}
                    onChange={(event) => updateField('feePerPlayer', Number(event.target.value))}
                    aria-invalid={Boolean(fieldErrors.feePerPlayer)}
                    aria-describedby={
                      fieldErrors.feePerPlayer ? `${feeId}-error` : `${feeId}-value`
                    }
                    className="border-line bg-surface text-content-primary focus-visible:outline-brand-600 min-h-11 w-full rounded-lg border px-3 pr-12 text-sm focus-visible:outline-2"
                  />
                  <span
                    aria-hidden="true"
                    className="text-content-secondary absolute top-1/2 right-3 -translate-y-1/2 text-sm"
                  >
                    ₫
                  </span>
                </div>
                {fieldErrors.feePerPlayer ? (
                  <p id={`${feeId}-error`} role="alert" className="text-danger text-xs">
                    {fieldErrors.feePerPlayer}
                  </p>
                ) : (
                  <p id={`${feeId}-value`} className="text-content-secondary text-xs">
                    {formatCurrency(values.feePerPlayer)}
                  </p>
                )}
              </div>
            </div>
          </section>

          {formError && (
            <p role="alert" className="bg-danger/5 text-danger rounded-md px-3 py-2 text-sm">
              {formError}
            </p>
          )}

          <DialogFooter className="border-line gap-2 border-t pt-4 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              disabled={mutation.isPending}
              onClick={() => handleOpenChange(false)}
            >
              {t('playerMatch.create.cancel')}
            </Button>
            <Button type="submit" disabled={mutation.isPending} aria-busy={mutation.isPending}>
              {mutation.isPending && (
                <LoaderCircle aria-hidden="true" className="size-4 motion-safe:animate-spin" />
              )}
              {mutation.isPending
                ? t('playerMatch.create.submitting')
                : t('playerMatch.create.submit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
