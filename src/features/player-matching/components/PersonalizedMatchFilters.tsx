import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { ArrowDown, ArrowUp, Loader2, Search, X } from 'lucide-react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { paths } from '@/app/router/paths';
import { Button } from '@/components/ui/button';
import { useBranches } from '@/features/branches/api/branch.query';
import type { ApiErrorShape } from '@/types/api';
import { usePlayerMatchPreferences, usePlayerMatchingProfile } from '../hooks/usePlayerMatching';
import type {
  PlayerMatchGameType,
  PlayerMatchPreferenceWeights,
  PlayerMatchPreferences,
  PersonalizedPlayerMatchSearchRequest,
} from '../types/player-matching.types';

interface PersonalizedMatchFiltersProps {
  isAuthenticated: boolean;
  isSearching: boolean;
  onSearch: (request: PersonalizedPlayerMatchSearchRequest) => void;
}

interface SearchFormValues {
  branchIds: string[];
  matchDate: string;
  preferredStartTime: string;
  preferredEndTime: string;
  minimumTimeOverlapMinutes: number;
  gameTypes: PlayerMatchGameType[];
  maximumParticipationFee: number | null;
  preferences: PlayerMatchPreferenceWeights;
}

const INITIAL_WEIGHTS: PlayerMatchPreferenceWeights = {
  skillWeight: 50,
  timeWeight: 20,
  branchWeight: 20,
  genderWeight: 10,
};

const INITIAL_VALUES: SearchFormValues = {
  branchIds: [],
  matchDate: '',
  preferredStartTime: '',
  preferredEndTime: '',
  minimumTimeOverlapMinutes: 60,
  gameTypes: ['SINGLES', 'DOUBLES'],
  maximumParticipationFee: null,
  preferences: INITIAL_WEIGHTS,
};

const isProfileRequiredError = (error: unknown) => {
  if (typeof error !== 'object' || error === null) return false;
  const apiError = error as Partial<ApiErrorShape>;
  return apiError.status === 404 && apiError.code === 'PLAYER_MATCHING_PROFILE_REQUIRED';
};

const getTimeMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const getInitialValues = (preferences: PlayerMatchPreferences | undefined): SearchFormValues => ({
  ...INITIAL_VALUES,
  branchIds: preferences ? [...preferences.branchIds] : [],
  preferredStartTime: preferences?.preferredStartTime?.slice(0, 5) ?? '',
  preferredEndTime: preferences?.preferredEndTime?.slice(0, 5) ?? '',
  minimumTimeOverlapMinutes: preferences?.minimumTimeOverlapMinutes ?? 60,
  maximumParticipationFee: preferences?.maximumParticipationFee ?? null,
  preferences: preferences?.preferences ?? INITIAL_WEIGHTS,
});

export const PersonalizedMatchFilters = ({
  isAuthenticated,
  isSearching,
  onSearch,
}: PersonalizedMatchFiltersProps) => {
  const { t } = useTranslation();
  const profileQuery = usePlayerMatchingProfile(isAuthenticated);
  const preferencesQuery = usePlayerMatchPreferences(isAuthenticated);
  const branchesQuery = useBranches({ pageNumber: 1, pageSize: 100 });
  const initialized = useRef(false);
  const validationSummaryRef = useRef<HTMLUListElement>(null);
  const [values, setValues] = useState<SearchFormValues>(INITIAL_VALUES);
  const [saveAsDefault, setSaveAsDefault] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [shouldFocusValidationSummary, setShouldFocusValidationSummary] = useState(false);
  const idPrefix = useId();

  useEffect(() => {
    if (!isAuthenticated) {
      initialized.current = false;
      return;
    }
    if (initialized.current) return;
    if (profileQuery.isLoading || preferencesQuery.isLoading) return;
    setValues(getInitialValues(preferencesQuery.data));
    initialized.current = true;
  }, [isAuthenticated, preferencesQuery.data, preferencesQuery.isLoading, profileQuery.isLoading]);

  const branches = branchesQuery.data?.branches ?? [];
  const availableBranches = [...branches].sort((first, second) =>
    first.name.localeCompare(second.name),
  );
  const weightValues = Object.values(values.preferences);
  const weightTotalTenths = weightValues.reduce(
    (total, weight) => total + Math.round(weight * 10),
    0,
  );
  const weightTotal = weightTotalTenths / 10;
  const weightsAreValid = weightValues.every(
    (weight) =>
      Number.isFinite(weight) &&
      weight >= 0 &&
      weight <= 100 &&
      Math.abs(weight * 10 - Math.round(weight * 10)) < 0.000001,
  );
  const startMinutes = values.preferredStartTime
    ? getTimeMinutes(values.preferredStartTime)
    : undefined;
  const endMinutes = values.preferredEndTime ? getTimeMinutes(values.preferredEndTime) : undefined;
  const timeRangeIsValid =
    startMinutes !== undefined &&
    endMinutes !== undefined &&
    startMinutes < endMinutes &&
    Number.isInteger(values.minimumTimeOverlapMinutes) &&
    values.minimumTimeOverlapMinutes > 0 &&
    values.minimumTimeOverlapMinutes <= endMinutes - startMinutes;
  const branchesAreValid =
    values.branchIds.length > 0 &&
    values.branchIds.every((branchId) =>
      branches.some((branch) => branch.id === branchId && branch.isActive),
    );
  const maximumFeeIsValid =
    values.maximumParticipationFee === null ||
    (Number.isFinite(values.maximumParticipationFee) && values.maximumParticipationFee >= 0);
  const profileMissing = isProfileRequiredError(profileQuery.error);
  const preferencesMissing = isProfileRequiredError(preferencesQuery.error);
  const matchingEnabled = profileQuery.data?.isMatchingEnabled === true;
  const settingsAreLoading =
    isAuthenticated && (profileQuery.isLoading || preferencesQuery.isLoading);
  const hasValidSearch =
    branchesAreValid &&
    timeRangeIsValid &&
    values.gameTypes.length > 0 &&
    weightsAreValid &&
    weightTotalTenths === 1000 &&
    maximumFeeIsValid;
  const canAttemptSearch =
    isAuthenticated &&
    matchingEnabled &&
    !settingsAreLoading &&
    !branchesQuery.isLoading &&
    !branchesQuery.isError;

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

  const toggleGameType = (gameType: PlayerMatchGameType) => {
    setValues((current) => ({
      ...current,
      gameTypes: current.gameTypes.includes(gameType)
        ? current.gameTypes.filter((value) => value !== gameType)
        : [...current.gameTypes, gameType],
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    if (!canAttemptSearch) return;
    if (!hasValidSearch) {
      setShouldFocusValidationSummary(true);
      return;
    }

    onSearch({
      branchIds: values.branchIds,
      ...(values.matchDate ? { matchDate: values.matchDate } : {}),
      preferredStartTime: values.preferredStartTime,
      preferredEndTime: values.preferredEndTime,
      minimumTimeOverlapMinutes: values.minimumTimeOverlapMinutes,
      gameTypes: values.gameTypes,
      maximumParticipationFee: values.maximumParticipationFee,
      preferences: values.preferences,
      saveAsDefault,
      page: 1,
      pageSize: 9,
    });
  };

  const validationMessages = submitted
    ? [
        !branchesAreValid ? t('playerMatch.scoring.validation.branches') : '',
        !timeRangeIsValid ? t('playerMatch.scoring.validation.timeRange') : '',
        values.gameTypes.length === 0 ? t('playerMatch.scoring.validation.gameTypes') : '',
        !weightsAreValid ? t('playerMatch.scoring.validation.weightRange') : '',
        weightTotalTenths !== 1000 ? t('playerMatch.scoring.validation.weightTotal') : '',
        !maximumFeeIsValid ? t('playerMatch.scoring.validation.maximumFee') : '',
      ].filter(Boolean)
    : [];
  useEffect(() => {
    if (shouldFocusValidationSummary && validationMessages.length > 0) {
      validationSummaryRef.current?.focus();
      setShouldFocusValidationSummary(false);
    }
  }, [shouldFocusValidationSummary, validationMessages.length]);
  const profileNeedsSetup = !matchingEnabled && !profileQuery.isLoading && isAuthenticated;

  return (
    <form
      onSubmit={handleSubmit}
      className="border-line bg-surface space-y-6 rounded-2xl border p-4 shadow-xs sm:p-6"
    >
      <div>
        <h2 className="text-content-primary text-lg font-bold">
          {t('playerMatch.scoring.filtersTitle')}
        </h2>
        <p className="text-content-secondary mt-1 text-sm leading-6">
          {t('playerMatch.scoring.filtersDescription')}
        </p>
      </div>

      {!isAuthenticated && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-content-primary text-sm">{t('playerMatch.scoring.signInRequired')}</p>
          <Link
            to={paths.login}
            className="text-brand-700 focus-visible:ring-brand-500 mt-3 inline-flex min-h-11 items-center rounded-lg font-semibold underline underline-offset-4 focus-visible:ring-2 focus-visible:outline-none"
          >
            {t('playerMatch.scoring.signIn')}
          </Link>
        </div>
      )}

      {profileNeedsSetup && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-content-primary text-sm">
            {profileMissing
              ? t('playerMatch.scoring.profileRequired')
              : profileQuery.isError
                ? t('playerMatch.scoring.profileLoadError')
                : profileQuery.data?.isMatchingEnabled
                  ? ''
                  : t('playerMatch.scoring.matchingDisabled')}
          </p>
          {profileQuery.isError && !profileMissing ? (
            <Button
              type="button"
              variant="outline"
              className="mt-3 min-h-11"
              onClick={() => void profileQuery.refetch()}
            >
              {t('playerMatch.discovery.retry')}
            </Button>
          ) : (
            <Link
              to={paths.playerMatchingProfile}
              className="text-brand-700 focus-visible:ring-brand-500 mt-3 inline-flex min-h-11 items-center rounded-lg font-semibold underline underline-offset-4 focus-visible:ring-2 focus-visible:outline-none"
            >
              {t('playerMatch.scoring.profileLink')}
            </Link>
          )}
        </div>
      )}

      {isAuthenticated && preferencesQuery.isError && !preferencesMissing && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
        >
          <p className="text-danger text-sm">{t('playerMatch.scoring.preferencesLoadError')}</p>
          <Button
            type="button"
            variant="outline"
            onClick={() => void preferencesQuery.refetch()}
            className="min-h-11"
          >
            {t('playerMatch.discovery.retry')}
          </Button>
        </div>
      )}

      {branchesQuery.isError && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
        >
          <p className="text-danger text-sm">{t('playerMatch.scoring.branchesLoadError')}</p>
          <Button type="button" variant="outline" onClick={() => branchesQuery.refetch()}>
            {t('playerMatch.discovery.retry')}
          </Button>
        </div>
      )}
      {!branchesQuery.isError && !branchesQuery.isLoading && branches.length === 0 && (
        <p className="text-content-secondary rounded-xl border border-dashed p-4 text-sm">
          {t('playerMatch.scoring.noBranches')}
        </p>
      )}

      <fieldset disabled={settingsAreLoading || branchesQuery.isLoading} className="space-y-6">
        <div className="space-y-3">
          <legend className="text-content-primary text-sm font-bold">
            {t('playerMatch.scoring.branches')}
          </legend>
          <p className="text-content-secondary text-xs leading-5">
            {t('playerMatch.scoring.branchesHelp')}
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {availableBranches.map((branch) => {
              const isSelected = values.branchIds.includes(branch.id);
              const isUnavailable = !branch.isActive;
              const checkboxId = `${idPrefix}-branch-${branch.id}`;
              return (
                <li key={branch.id}>
                  <label
                    htmlFor={checkboxId}
                    className={`border-line flex min-h-11 items-center gap-3 rounded-xl border p-3 text-sm ${
                      isUnavailable && !isSelected
                        ? 'cursor-not-allowed opacity-60'
                        : 'cursor-pointer'
                    }`}
                  >
                    <input
                      id={checkboxId}
                      type="checkbox"
                      checked={isSelected}
                      aria-invalid={submitted && !branchesAreValid}
                      disabled={isUnavailable && !isSelected}
                      onChange={() => toggleBranch(branch.id)}
                      className="accent-brand-600 size-4 shrink-0"
                    />
                    <span className="min-w-0 flex-1 truncate font-medium">{branch.name}</span>
                    {isUnavailable && (
                      <span className="text-content-secondary text-xs">
                        {t('playerMatch.scoring.branchUnavailable')}
                      </span>
                    )}
                  </label>
                </li>
              );
            })}
          </ul>

          {values.branchIds.length > 0 && (
            <div className="bg-surface-muted/50 border-line rounded-xl border p-3">
              <p className="text-content-primary mb-2 text-xs font-bold">
                {t('playerMatch.scoring.branchOrder')}
              </p>
              <ol className="space-y-2">
                {values.branchIds.map((branchId, index) => {
                  const branch = branches.find((item) => item.id === branchId);
                  return (
                    <li key={branchId} className="flex min-h-11 items-center gap-2 text-sm">
                      <span className="bg-surface text-content-secondary grid size-6 shrink-0 place-items-center rounded-full text-xs font-bold">
                        {index + 1}
                      </span>
                      <span className="min-w-0 flex-1 truncate">
                        {branch?.name ?? branchId}
                      </span>
                      {index === 0 && (
                        <span className="text-brand-700 text-xs font-semibold">
                          {t('playerMatch.scoring.primaryBranch')}
                        </span>
                      )}
                      {(!branch || !branch.isActive) && (
                        <span className="text-danger text-xs">
                          {t('playerMatch.scoring.branchUnavailable')}
                        </span>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-11 shrink-0"
                        disabled={index === 0}
                        aria-label={t('playerMatch.scoring.moveBranchUp', {
                          name: branch?.name ?? branchId,
                        })}
                        onClick={() => moveBranch(branchId, -1)}
                      >
                        <ArrowUp aria-hidden="true" className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-11 shrink-0"
                        disabled={index === values.branchIds.length - 1}
                        aria-label={t('playerMatch.scoring.moveBranchDown', {
                          name: branch?.name ?? branchId,
                        })}
                        onClick={() => moveBranch(branchId, 1)}
                      >
                        <ArrowDown aria-hidden="true" className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-11 shrink-0"
                        aria-label={t('playerMatch.scoring.removeBranch', {
                          name: branch?.name ?? branchId,
                        })}
                        onClick={() => toggleBranch(branchId)}
                      >
                        <X aria-hidden="true" className="size-4" />
                      </Button>
                    </li>
                  );
                })}
              </ol>
            </div>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="text-content-primary grid gap-2 text-sm font-semibold">
            {t('playerMatch.scoring.matchDate')}
            <input
              type="date"
              value={values.matchDate}
              onChange={(event) =>
                setValues((current) => ({ ...current, matchDate: event.target.value }))
              }
              className="border-line bg-surface focus-visible:ring-brand-500 h-11 min-w-0 rounded-xl border px-3 text-base focus-visible:ring-2 focus-visible:outline-none"
            />
          </label>
          <label className="text-content-primary grid gap-2 text-sm font-semibold">
            {t('playerMatch.scoring.preferredStartTime')}
            <input
              type="time"
              value={values.preferredStartTime}
              aria-invalid={submitted && !timeRangeIsValid}
              onChange={(event) =>
                setValues((current) => ({ ...current, preferredStartTime: event.target.value }))
              }
              className="border-line bg-surface focus-visible:ring-brand-500 h-11 min-w-0 rounded-xl border px-3 text-base focus-visible:ring-2 focus-visible:outline-none"
            />
          </label>
          <label className="text-content-primary grid gap-2 text-sm font-semibold">
            {t('playerMatch.scoring.preferredEndTime')}
            <input
              type="time"
              value={values.preferredEndTime}
              aria-invalid={submitted && !timeRangeIsValid}
              onChange={(event) =>
                setValues((current) => ({ ...current, preferredEndTime: event.target.value }))
              }
              className="border-line bg-surface focus-visible:ring-brand-500 h-11 min-w-0 rounded-xl border px-3 text-base focus-visible:ring-2 focus-visible:outline-none"
            />
          </label>
          <label className="text-content-primary grid gap-2 text-sm font-semibold">
            {t('playerMatch.scoring.minimumOverlap')}
            <input
              type="number"
              min={1}
              step={1}
              value={values.minimumTimeOverlapMinutes}
              aria-invalid={submitted && !timeRangeIsValid}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  minimumTimeOverlapMinutes:
                    event.target.value === '' ? 0 : Number(event.target.value),
                }))
              }
              className="border-line bg-surface focus-visible:ring-brand-500 h-11 min-w-0 rounded-xl border px-3 text-base focus-visible:ring-2 focus-visible:outline-none"
            />
          </label>
          <label className="text-content-primary grid gap-2 text-sm font-semibold">
            {t('playerMatch.scoring.maximumFee')}
            <input
              type="number"
              min={0}
              step={1000}
              value={values.maximumParticipationFee ?? ''}
              aria-invalid={submitted && !maximumFeeIsValid}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  maximumParticipationFee:
                    event.target.value === '' ? null : Number(event.target.value),
                }))
              }
              className="border-line bg-surface focus-visible:ring-brand-500 h-11 min-w-0 rounded-xl border px-3 text-base focus-visible:ring-2 focus-visible:outline-none"
            />
          </label>
        </div>

        <fieldset className="space-y-2">
          <legend className="text-content-primary mb-2 text-sm font-bold">
            {t('playerMatch.scoring.gameTypes')}
          </legend>
          <div className="flex flex-wrap gap-3">
            {(['SINGLES', 'DOUBLES'] as const).map((gameType) => {
              const checkboxId = `${idPrefix}-game-${gameType.toLowerCase()}`;
              return (
                <label
                  key={gameType}
                  htmlFor={checkboxId}
                  className="border-line flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-4 py-2 text-sm font-medium"
                >
                  <input
                    id={checkboxId}
                    type="checkbox"
                    checked={values.gameTypes.includes(gameType)}
                    aria-invalid={submitted && values.gameTypes.length === 0}
                    onChange={() => toggleGameType(gameType)}
                    className="accent-brand-600 size-4"
                  />
                  {t(`playerMatch.drafts.${gameType.toLowerCase()}`)}
                </label>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-content-primary text-sm font-bold">
            {t('playerMatch.scoring.weightsTitle')}
          </legend>
          <p className="text-content-secondary text-xs leading-5">
            {t('playerMatch.scoring.weightsDescription')}
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {(
              [
                ['skillWeight', 'skill'],
                ['timeWeight', 'time'],
                ['branchWeight', 'branch'],
                ['genderWeight', 'gender'],
              ] as const
            ).map(([key, label]) => {
              const inputId = `${idPrefix}-${key}`;
              return (
                <label
                  key={key}
                  htmlFor={inputId}
                  className="text-content-primary grid gap-2 text-sm font-semibold"
                >
                  {t(`playerMatch.scoring.weights.${label}`)}
                  <span className="border-line bg-surface flex h-11 items-center rounded-xl border px-3">
                    <input
                      id={inputId}
                      type="number"
                      min={0}
                      max={100}
                      step={0.1}
                      value={values.preferences[key]}
                      aria-invalid={submitted && (!weightsAreValid || weightTotalTenths !== 1000)}
                      onChange={(event) =>
                        updateWeight(
                          key,
                          event.target.value === '' ? 0 : Number(event.target.value),
                        )
                      }
                      className="min-w-0 flex-1 bg-transparent text-base outline-none"
                    />
                    <span className="text-content-secondary ml-2">%</span>
                  </span>
                </label>
              );
            })}
          </div>
          <p
            role="status"
            aria-atomic="true"
            className={`text-sm font-semibold ${
              weightTotal === 100 && weightsAreValid ? 'text-emerald-700' : 'text-danger'
            }`}
          >
            {t('playerMatch.scoring.weightTotal', { total: weightTotal })}
          </p>
        </fieldset>
      </fieldset>

      <label className="text-content-primary flex min-h-11 cursor-pointer items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={saveAsDefault}
          onChange={(event) => setSaveAsDefault(event.target.checked)}
          className="accent-brand-600 size-4"
        />
        {t('playerMatch.scoring.saveDefaults')}
      </label>

      {validationMessages.length > 0 && (
        <ul
          ref={validationSummaryRef}
          role="alert"
          tabIndex={-1}
          aria-label={t('playerMatch.scoring.validationSummary')}
          className="text-danger list-inside list-disc space-y-1 text-sm focus-visible:outline-none"
        >
          {validationMessages.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="submit"
          disabled={!canAttemptSearch || isSearching}
          className="min-h-11 gap-2"
        >
          {isSearching ? (
            <Loader2 aria-hidden="true" className="size-4 animate-spin" />
          ) : (
            <Search aria-hidden="true" className="size-4" />
          )}
          {isSearching ? t('playerMatch.scoring.searching') : t('playerMatch.scoring.search')}
        </Button>
        {settingsAreLoading && (
          <span role="status" className="text-content-secondary text-sm">
            {t('playerMatch.scoring.loadingPreferences')}
          </span>
        )}
      </div>
    </form>
  );
};
