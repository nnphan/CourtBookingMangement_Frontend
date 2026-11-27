import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowDown, ArrowLeft, ArrowUp, Loader2, Save, UsersRound } from 'lucide-react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { paths } from '@/app/router/paths';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/management';
import { Card, CardBody } from '@/components/ui/card';
import { useGetBranches } from '@/hooks/branches/useBranches';
import { useApiErrorMessage } from '@/hooks/useApiErrorMessage';
import { toast } from '@/lib/toast';
import type { ApiErrorShape } from '@/types/api';
import {
  usePlayerMatchPreferences,
  usePlayerMatchingProfile,
  useUpdatePlayerMatchPreferences,
  useUpdatePlayerMatchingProfile,
} from '../hooks/usePlayerMatching';
import type {
  PlayerMatchPreferenceWeights,
  PlayerMatchingGender,
  PlayerMatchPreferences,
  PlayerMatchingProfile,
} from '../types/player-matching.types';

interface ProfileFormValues {
  currentRating: number;
  gender: PlayerMatchingGender | '';
  isProfilePublic: boolean;
  isMatchingEnabled: boolean;
  preferences: PlayerMatchPreferenceWeights;
  branchIds: string[];
  preferredStartTime: string;
  preferredEndTime: string;
  minimumTimeOverlapMinutes: number;
  maximumParticipationFee: number | null;
}

const INITIAL_VALUES: ProfileFormValues = {
  currentRating: 500,
  gender: '',
  isProfilePublic: false,
  isMatchingEnabled: false,
  preferences: {
    skillWeight: 40,
    timeWeight: 30,
    branchWeight: 20,
    genderWeight: 10,
  },
  branchIds: [],
  preferredStartTime: '',
  preferredEndTime: '',
  minimumTimeOverlapMinutes: 60,
  maximumParticipationFee: null,
};

const isProfileRequiredError = (error: unknown): boolean => {
  if (typeof error !== 'object' || error === null) return false;
  const apiError = error as Partial<ApiErrorShape>;
  return apiError.status === 404 && apiError.code === 'PLAYER_MATCHING_PROFILE_REQUIRED';
};

const getWeightTotal = (weights: PlayerMatchPreferenceWeights) =>
  Math.round(
    (weights.skillWeight + weights.timeWeight + weights.branchWeight + weights.genderWeight) * 10,
  ) / 10;

const areWeightsValid = (weights: PlayerMatchPreferenceWeights) => {
  const values = [
    weights.skillWeight,
    weights.timeWeight,
    weights.branchWeight,
    weights.genderWeight,
  ];
  return values.every(
    (value) => Number.isFinite(value) && value >= 0 && value <= 100 && (value * 10) % 1 === 0,
  );
};

const isValidTimeRange = (start: string, end: string, minimumOverlap: number) => {
  if (!start && !end) return true;
  if (!start || !end || start >= end) return false;
  const [startHour, startMinute] = start.split(':').map(Number);
  const [endHour, endMinute] = end.split(':').map(Number);
  return endHour * 60 + endMinute - (startHour * 60 + startMinute) >= minimumOverlap;
};

const formatProfileValues = (
  profile: PlayerMatchingProfile | undefined,
  preferences: PlayerMatchPreferences | undefined,
): ProfileFormValues => ({
  ...INITIAL_VALUES,
  currentRating: profile?.currentRating ?? INITIAL_VALUES.currentRating,
  gender: profile?.gender ?? '',
  isProfilePublic: profile?.isProfilePublic ?? INITIAL_VALUES.isProfilePublic,
  isMatchingEnabled: profile?.isMatchingEnabled ?? INITIAL_VALUES.isMatchingEnabled,
  preferences: preferences?.preferences ?? INITIAL_VALUES.preferences,
  branchIds: preferences?.branchIds ? [...preferences.branchIds] : INITIAL_VALUES.branchIds,
  preferredStartTime: preferences?.preferredStartTime?.slice(0, 5) ?? '',
  preferredEndTime: preferences?.preferredEndTime?.slice(0, 5) ?? '',
  minimumTimeOverlapMinutes:
    preferences?.minimumTimeOverlapMinutes ?? INITIAL_VALUES.minimumTimeOverlapMinutes,
  maximumParticipationFee: preferences?.maximumParticipationFee ?? null,
});

const SectionHeading = ({ title, help }: { title: string; help?: string }) => (
  <div className="mb-5">
    <h2 className="text-content-primary text-lg font-bold">{title}</h2>
    {help ? <p className="text-content-secondary mt-1 text-sm leading-6">{help}</p> : null}
  </div>
);

const NumberField = ({
  id,
  label,
  value,
  min,
  max,
  step,
  onChange,
  suffix,
}: {
  id: string;
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  suffix?: string;
}) => (
  <label htmlFor={id} className="text-content-primary grid gap-2 text-sm font-semibold">
    {label}
    <span className="border-line bg-surface focus-within:border-brand-600 flex h-12 items-center rounded-xl border px-3">
      <input
        id={id}
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(event.target.value === '' ? 0 : Number(event.target.value))}
        className="min-w-0 flex-1 bg-transparent text-base outline-none"
      />
      {suffix ? <span className="text-content-secondary ml-2">{suffix}</span> : null}
    </span>
  </label>
);

const PlayerMatchingProfilePage = () => {
  const { t } = useTranslation();
  const getErrorMessage = useApiErrorMessage();
  const profileQuery = usePlayerMatchingProfile();
  const preferencesQuery = usePlayerMatchPreferences();
  const profileMutation = useUpdatePlayerMatchingProfile();
  const preferencesMutation = useUpdatePlayerMatchPreferences();
  const branchesQuery = useGetBranches({ status: 'all', pageNumber: 1, pageSize: 100 });
  const initialized = useRef(false);
  const [values, setValues] = useState<ProfileFormValues>(INITIAL_VALUES);
  const [saveError, setSaveError] = useState('');
  const [ready, setReady] = useState(false);

  const profileMissing = isProfileRequiredError(profileQuery.error);
  const preferencesMissing = isProfileRequiredError(preferencesQuery.error);
  const profileReady = profileQuery.isSuccess || profileMissing;
  const preferencesReady = preferencesQuery.isSuccess || preferencesMissing;
  const loadError =
    (profileQuery.isError && !profileMissing) || (preferencesQuery.isError && !preferencesMissing);
  const isSaving = profileMutation.isPending || preferencesMutation.isPending;

  useEffect(() => {
    if (!profileReady || !preferencesReady || initialized.current) return;
    setValues(formatProfileValues(profileQuery.data, preferencesQuery.data));
    initialized.current = true;
    setReady(true);
  }, [profileQuery.data, preferencesQuery.data, profileReady, preferencesReady]);

  const updateWeight = (key: keyof PlayerMatchPreferenceWeights, value: number) => {
    setValues((current) => ({
      ...current,
      preferences: { ...current.preferences, [key]: value },
    }));
  };

  const toggleBranch = (branchId: string) => {
    setValues((current) => ({
      ...current,
      branchIds: current.branchIds.includes(branchId)
        ? current.branchIds.filter((id) => id !== branchId)
        : [...current.branchIds, branchId],
    }));
  };

  const moveBranch = (branchId: string, offset: -1 | 1) => {
    setValues((current) => {
      const currentIndex = current.branchIds.indexOf(branchId);
      const nextIndex = currentIndex + offset;
      if (currentIndex < 0 || nextIndex < 0 || nextIndex >= current.branchIds.length) {
        return current;
      }
      const branchIds = [...current.branchIds];
      [branchIds[currentIndex], branchIds[nextIndex]] = [
        branchIds[nextIndex],
        branchIds[currentIndex],
      ];
      return { ...current, branchIds };
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaveError('');

    if (
      !Number.isInteger(values.currentRating) ||
      values.currentRating < 0 ||
      values.currentRating > 1000
    ) {
      setSaveError(t('playerMatchingProfile.validation.rating'));
      return;
    }
    if (values.branchIds.length === 0) {
      setSaveError(t('playerMatchingProfile.validation.branches'));
      return;
    }
    if (!areWeightsValid(values.preferences) || getWeightTotal(values.preferences) !== 100) {
      setSaveError(t('playerMatchingProfile.validation.weights'));
      return;
    }
    if (
      !Number.isInteger(values.minimumTimeOverlapMinutes) ||
      values.minimumTimeOverlapMinutes <= 0
    ) {
      setSaveError(t('playerMatchingProfile.validation.overlapPositive'));
      return;
    }
    if (
      !isValidTimeRange(
        values.preferredStartTime,
        values.preferredEndTime,
        values.minimumTimeOverlapMinutes,
      )
    ) {
      setSaveError(
        values.preferredStartTime && values.preferredEndTime
          ? values.preferredStartTime >= values.preferredEndTime
            ? t('playerMatchingProfile.validation.timeRange')
            : t('playerMatchingProfile.validation.overlap')
          : t('playerMatchingProfile.validation.timesTogether'),
      );
      return;
    }
    if (
      values.maximumParticipationFee !== null &&
      (!Number.isFinite(values.maximumParticipationFee) || values.maximumParticipationFee < 0)
    ) {
      setSaveError(t('playerMatchingProfile.validation.fee'));
      return;
    }

    try {
      await profileMutation.mutateAsync({
        currentRating: values.currentRating,
        gender: values.gender || null,
        isProfilePublic: values.isProfilePublic,
        isMatchingEnabled: values.isMatchingEnabled,
      });
      await preferencesMutation.mutateAsync({
        preferences: values.preferences,
        branchIds: values.branchIds,
        preferredStartTime: values.preferredStartTime || null,
        preferredEndTime: values.preferredEndTime || null,
        minimumTimeOverlapMinutes: values.minimumTimeOverlapMinutes,
        maximumParticipationFee: values.maximumParticipationFee,
      });
      toast.success(t('playerMatchingProfile.saved'));
    } catch (error) {
      setSaveError(getErrorMessage(error) ?? t('playerMatchingProfile.saveError'));
    }
  };

  const isLoading = profileQuery.isLoading || preferencesQuery.isLoading || (!ready && !loadError);
  const branchList = branchesQuery.branches;
  const orderedBranches = [...branchList].sort((first, second) => {
    const firstPriority = values.branchIds.indexOf(first.id);
    const secondPriority = values.branchIds.indexOf(second.id);
    if (firstPriority < 0) return secondPriority < 0 ? 0 : 1;
    if (secondPriority < 0) return -1;
    return firstPriority - secondPriority;
  });
  const weightTotal = getWeightTotal(values.preferences);

  if (isLoading) {
    return (
      <div className="text-content-secondary flex min-h-[50vh] items-center justify-center gap-3">
        <Loader2 aria-hidden className="size-5 animate-spin" />
        <p>{t('playerMatchingProfile.loading')}</p>
      </div>
    );
  }

  if (loadError || !ready) {
    const error = profileQuery.error ?? preferencesQuery.error;
    return (
      <div className="space-y-4 py-8">
        <p role="alert" className="bg-danger/10 text-danger rounded-xl p-4 text-sm">
          {getErrorMessage(error) ?? t('playerMatchingProfile.loadError')}
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            void profileQuery.refetch();
            void preferencesQuery.refetch();
          }}
        >
          {t('playerMatch.discovery.retry')}
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-6 sm:py-10">
      <PageHeader
        title={t('playerMatchingProfile.title')}
        description={t('playerMatchingProfile.description')}
        icon={UsersRound}
        leading={
          <Link
            to={paths.playerMatching}
            className="text-content-link inline-flex min-h-11 items-center gap-2 text-sm font-semibold hover:underline"
          >
            <ArrowLeft aria-hidden className="size-4 shrink-0" />
            {t('playerMatch.discovery.pageTitle')}
          </Link>
        }
      />

      {!profileQuery.data ? (
        <p className="border-line bg-surface-muted text-content-secondary rounded-xl border p-4 text-sm">
          {t('playerMatchingProfile.firstProfile')}
        </p>
      ) : null}

      <form className="space-y-5" noValidate onSubmit={handleSubmit}>
        <Card>
          <CardBody>
            <SectionHeading
              title={t('playerMatchingProfile.sections.profile')}
              help={t('playerMatchingProfile.rating.help')}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <NumberField
                id="matching-rating"
                label={t('playerMatchingProfile.rating.label')}
                value={values.currentRating}
                min={0}
                max={1000}
                step={1}
                onChange={(currentRating) =>
                  setValues((current) => ({ ...current, currentRating }))
                }
              />
              {profileQuery.data ? (
                <div className="bg-surface-muted grid grid-cols-2 gap-3 rounded-xl p-4 sm:col-span-2 sm:grid-cols-3">
                  <div>
                    <p className="text-content-secondary text-xs">
                      {t('playerMatchingProfile.rating.band')}
                    </p>
                    <p className="text-content-primary mt-1 font-bold">
                      {t(
                        `playerMatchingProfile.rating.bands.${profileQuery.data.ratingBand.toUpperCase()}`,
                        { defaultValue: profileQuery.data.ratingBand },
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-content-secondary text-xs">
                      {t('playerMatchingProfile.rating.confidence')}
                    </p>
                    <p className="text-content-primary mt-1 font-bold">
                      {t('playerMatchingProfile.rating.confidenceValue', {
                        value: Math.round(profileQuery.data.ratingConfidence * 100),
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-content-secondary text-xs">
                      {t('playerMatchingProfile.rating.matches')}
                    </p>
                    <p className="text-content-primary mt-1 font-bold">
                      {profileQuery.data.matchesPlayed}
                    </p>
                  </div>
                  <div className="col-span-2 sm:col-span-3">
                    <p className="text-content-secondary text-xs">
                      {t('playerMatchingProfile.rating.source')}
                    </p>
                    <p className="text-content-primary mt-1 font-bold">
                      {t(
                        `playerMatchingProfile.rating.sources.${profileQuery.data.ratingSource.toLowerCase()}`,
                        { defaultValue: profileQuery.data.ratingSource },
                      )}
                    </p>
                  </div>
                </div>
              ) : null}
              <label
                htmlFor="matching-gender"
                className="text-content-primary grid gap-2 text-sm font-semibold"
              >
                {t('playerMatchingProfile.gender.label')}
                <select
                  id="matching-gender"
                  value={values.gender}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      gender: event.target.value as PlayerMatchingGender | '',
                    }))
                  }
                  className="border-line bg-surface focus-visible:ring-brand-500 h-12 w-full rounded-xl border px-3 text-base focus-visible:ring-2 focus-visible:outline-none"
                >
                  <option value="">{t('playerMatchingProfile.gender.undisclosed')}</option>
                  <option value="MALE">{t('playerMatchingProfile.gender.male')}</option>
                  <option value="FEMALE">{t('playerMatchingProfile.gender.female')}</option>
                  <option value="OTHER">{t('playerMatchingProfile.gender.other')}</option>
                </select>
                <span className="text-content-secondary leading-5 font-normal">
                  {t('playerMatchingProfile.gender.help')}
                </span>
              </label>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <SectionHeading title={t('playerMatchingProfile.sections.privacy')} />
            <div className="space-y-4">
              {(
                [
                  ['isProfilePublic', 'public', 'publicHelp'],
                  ['isMatchingEnabled', 'enabled', 'enabledHelp'],
                ] as const
              ).map(([field, label, help]) => (
                <label key={field} className="flex min-h-12 cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={values[field]}
                    onChange={(event) =>
                      setValues((current) => ({ ...current, [field]: event.target.checked }))
                    }
                    className="accent-brand-600 focus-visible:outline-brand-600 mt-1 size-5 focus-visible:outline-2 focus-visible:outline-offset-2"
                  />
                  <span>
                    <span className="text-content-primary block font-semibold">
                      {t(`playerMatchingProfile.privacy.${label}`)}
                    </span>
                    <span className="text-content-secondary mt-1 block text-sm leading-5">
                      {t(`playerMatchingProfile.privacy.${help}`)}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <SectionHeading
              title={t('playerMatchingProfile.sections.branches')}
              help={t('playerMatchingProfile.branches.help')}
            />
            <p className="text-content-secondary mb-3 text-sm">
              {t('playerMatchingProfile.branches.selected', { count: values.branchIds.length })}
            </p>
            {branchesQuery.isError ? (
              <p role="alert" className="text-danger mb-3 text-sm">
                {t('playerMatchingProfile.branches.loadError')}
              </p>
            ) : null}
            {branchesQuery.isLoading ? (
              <p className="text-content-secondary text-sm">{t('playerMatchingProfile.loading')}</p>
            ) : branchList.length ? (
              <ul className="space-y-2">
                {orderedBranches.map((branch) => {
                  const selectedIndex = values.branchIds.indexOf(branch.id);
                  return (
                    <li
                      key={branch.id}
                      className="border-line flex min-h-14 items-center gap-3 rounded-xl border px-3 py-2"
                    >
                      <input
                        id={`branch-${branch.id}`}
                        type="checkbox"
                        checked={selectedIndex >= 0}
                        onChange={() => toggleBranch(branch.id)}
                        className="accent-brand-600 focus-visible:outline-brand-600 size-5 focus-visible:outline-2 focus-visible:outline-offset-2"
                      />
                      <label
                        htmlFor={`branch-${branch.id}`}
                        className="text-content-primary min-w-0 flex-1 cursor-pointer font-medium"
                      >
                        {branch.branchName}
                      </label>
                      {selectedIndex >= 0 ? (
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            disabled={selectedIndex === 0}
                            aria-label={t('playerMatchingProfile.branches.moveUp', {
                              name: branch.branchName,
                            })}
                            onClick={() => moveBranch(branch.id, -1)}
                          >
                            <ArrowUp aria-hidden className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            disabled={selectedIndex === values.branchIds.length - 1}
                            aria-label={t('playerMatchingProfile.branches.moveDown', {
                              name: branch.branchName,
                            })}
                            onClick={() => moveBranch(branch.id, 1)}
                          >
                            <ArrowDown aria-hidden className="size-4" />
                          </Button>
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-content-secondary text-sm">
                {t('playerMatchingProfile.branches.empty')}
              </p>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <SectionHeading title={t('playerMatchingProfile.sections.availability')} />
            <div className="grid gap-4 sm:grid-cols-2">
              <label
                htmlFor="preferred-start"
                className="text-content-primary grid gap-2 text-sm font-semibold"
              >
                {t('playerMatchingProfile.availability.start')}
                <input
                  id="preferred-start"
                  type="time"
                  value={values.preferredStartTime}
                  onChange={(event) =>
                    setValues((current) => ({ ...current, preferredStartTime: event.target.value }))
                  }
                  className="border-line bg-surface focus-visible:ring-brand-500 h-12 rounded-xl border px-3 text-base focus-visible:ring-2 focus-visible:outline-none"
                />
              </label>
              <label
                htmlFor="preferred-end"
                className="text-content-primary grid gap-2 text-sm font-semibold"
              >
                {t('playerMatchingProfile.availability.end')}
                <input
                  id="preferred-end"
                  type="time"
                  value={values.preferredEndTime}
                  onChange={(event) =>
                    setValues((current) => ({ ...current, preferredEndTime: event.target.value }))
                  }
                  className="border-line bg-surface focus-visible:ring-brand-500 h-12 rounded-xl border px-3 text-base focus-visible:ring-2 focus-visible:outline-none"
                />
              </label>
              <NumberField
                id="minimum-time-overlap"
                label={t('playerMatchingProfile.availability.overlap')}
                value={values.minimumTimeOverlapMinutes}
                min={1}
                step={1}
                onChange={(minimumTimeOverlapMinutes) =>
                  setValues((current) => ({ ...current, minimumTimeOverlapMinutes }))
                }
              />
              <label
                htmlFor="maximum-fee"
                className="text-content-primary grid gap-2 text-sm font-semibold"
              >
                {t('playerMatchingProfile.availability.fee')}
                <input
                  id="maximum-fee"
                  type="number"
                  min={0}
                  value={values.maximumParticipationFee ?? ''}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      maximumParticipationFee:
                        event.target.value === '' ? null : Number(event.target.value),
                    }))
                  }
                  className="border-line bg-surface focus-visible:ring-brand-500 h-12 rounded-xl border px-3 text-base focus-visible:ring-2 focus-visible:outline-none"
                />
                <span className="text-content-secondary font-normal">
                  {t('playerMatchingProfile.availability.feeHelp')}
                </span>
              </label>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <SectionHeading
              title={t('playerMatchingProfile.sections.weights')}
              help={t('playerMatchingProfile.weights.help')}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              {(
                [
                  ['skillWeight', 'skill'],
                  ['timeWeight', 'time'],
                  ['branchWeight', 'branch'],
                  ['genderWeight', 'gender'],
                ] as const
              ).map(([key, label]) => (
                <NumberField
                  key={key}
                  id={`weight-${key}`}
                  label={t(`playerMatchingProfile.weights.${label}`)}
                  value={values.preferences[key]}
                  min={0}
                  max={100}
                  step={0.1}
                  suffix="%"
                  onChange={(value) => updateWeight(key, value)}
                />
              ))}
            </div>
            <p
              role="status"
              className={`mt-4 text-sm font-semibold ${weightTotal === 100 ? 'text-emerald-700' : 'text-danger'}`}
            >
              {t('playerMatchingProfile.weights.total')}: {weightTotal}%.{' '}
              {t(
                weightTotal === 100
                  ? 'playerMatchingProfile.weights.totalValid'
                  : 'playerMatchingProfile.weights.totalInvalid',
              )}
            </p>
          </CardBody>
        </Card>

        {saveError ? (
          <p role="alert" className="bg-danger/10 text-danger rounded-xl p-4 text-sm">
            {saveError}
          </p>
        ) : null}
        <div className="flex justify-end">
          <Button type="submit" loading={isSaving}>
            {!isSaving ? <Save aria-hidden className="size-4" /> : null}
            {t(isSaving ? 'playerMatchingProfile.saving' : 'playerMatchingProfile.save')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PlayerMatchingProfilePage;
