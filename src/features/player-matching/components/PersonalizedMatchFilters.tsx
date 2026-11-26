import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { Loader2, Search } from 'lucide-react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { paths } from '@/app/router/paths';
import { Button } from '@/components/ui/button';
import type { ApiErrorShape } from '@/types/api';
import { usePlayerMatchPreferences, usePlayerMatchingProfile } from '../hooks/usePlayerMatching';
import { MatchSearchFields, type MatchFilterValues } from './MatchSearchFields';
import type {
  PlayerMatchPreferenceWeights,
  PersonalizedPlayerMatchSearchRequest,
} from '../types/player-matching.types';

interface PersonalizedMatchFiltersProps {
  isAuthenticated: boolean;
  isSearching: boolean;
  onSearch: (request: PersonalizedPlayerMatchSearchRequest) => void;
}

const INITIAL_WEIGHTS: PlayerMatchPreferenceWeights = {
  skillWeight: 40,
  timeWeight: 30,
  branchWeight: 20,
  genderWeight: 10,
};

const isProfileRequiredError = (error: unknown) => {
  if (typeof error !== 'object' || error === null) return false;
  const apiError = error as Partial<ApiErrorShape>;
  return apiError.status === 404 && apiError.code === 'PLAYER_MATCHING_PROFILE_REQUIRED';
};

const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

export const PersonalizedMatchFilters = ({
  isAuthenticated,
  isSearching,
  onSearch,
}: PersonalizedMatchFiltersProps) => {
  const { t } = useTranslation();
  const profileQuery = usePlayerMatchingProfile(isAuthenticated);
  const preferencesQuery = usePlayerMatchPreferences(isAuthenticated);
  const initialized = useRef(false);
  const validationSummaryRef = useRef<HTMLUListElement>(null);
  const [filters, setFilters] = useState<MatchFilterValues>({});
  const [weights, setWeights] = useState(INITIAL_WEIGHTS);
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
    setWeights(preferencesQuery.data?.preferences ?? INITIAL_WEIGHTS);
    setFilters({
      branchId: preferencesQuery.data?.branchIds[0],
      startTime: preferencesQuery.data?.preferredStartTime?.slice(0, 5),
      endTime: preferencesQuery.data?.preferredEndTime?.slice(0, 5),
    });
    initialized.current = true;
  }, [isAuthenticated, preferencesQuery.data, preferencesQuery.isLoading, profileQuery.isLoading]);

  const weightValues = Object.values(weights);
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
  const timeRangeIsValid =
    (!filters.startTime && !filters.endTime) ||
    (Boolean(filters.startTime && filters.endTime) &&
      toMinutes(filters.startTime ?? '') < toMinutes(filters.endTime ?? ''));
  const profileUnavailable = profileQuery.isError && !isProfileRequiredError(profileQuery.error);
  const matchingDisabled = profileQuery.data?.isMatchingEnabled === false;
  const settingsAreLoading =
    isAuthenticated && (profileQuery.isLoading || preferencesQuery.isLoading);
  const canAttemptSearch =
    isAuthenticated && !matchingDisabled && !profileUnavailable && !settingsAreLoading;

  const updateWeight = (key: keyof PlayerMatchPreferenceWeights, value: number) => {
    setWeights((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    if (!canAttemptSearch) return;
    if (!timeRangeIsValid || !weightsAreValid || weightTotalTenths !== 1000) {
      setShouldFocusValidationSummary(true);
      return;
    }

    const { branchId, keyword, ...criteria } = filters;
    onSearch({
      ...criteria,
      keyword: keyword?.trim() || undefined,
      branchIds: branchId ? [branchId] : [],
      preferences: weights,
      saveAsDefault: !!profileQuery.data && saveAsDefault,
      page: 1,
      pageSize: 9,
    });
  };

  const validationMessages = submitted
    ? [
        !timeRangeIsValid ? t('playerMatch.scoring.validation.timeRange') : '',
        !weightsAreValid ? t('playerMatch.scoring.validation.weightRange') : '',
        weightTotalTenths !== 1000 ? t('playerMatch.scoring.validation.weightTotal') : '',
      ].filter(Boolean)
    : [];
  useEffect(() => {
    if (shouldFocusValidationSummary && validationMessages.length > 0) {
      validationSummaryRef.current?.focus();
      setShouldFocusValidationSummary(false);
    }
  }, [shouldFocusValidationSummary, validationMessages.length]);
  const profileNeedsSetup = matchingDisabled || profileUnavailable;

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
        <div role="alert" className="border-line space-y-2 rounded-xl border p-4 text-sm">
          <p>
            {t(
              profileUnavailable
                ? 'playerMatch.scoring.profileLoadError'
                : 'playerMatch.scoring.matchingDisabled',
            )}
          </p>
          {profileUnavailable ? (
            <Button type="button" variant="outline" onClick={() => void profileQuery.refetch()}>
              {t('playerMatch.scoring.retry')}
            </Button>
          ) : (
            <Link to={paths.playerMatchingProfile} className="text-brand-700 underline">
              {t('playerMatch.scoring.profileLink')}
            </Link>
          )}
        </div>
      )}

      {isAuthenticated && isProfileRequiredError(profileQuery.error) && (
        <p className="text-content-secondary text-sm">
          {t('playerMatch.scoring.searchWithoutProfile')}{' '}
          <Link to={paths.playerMatchingProfile} className="text-brand-700 underline">
            {t('playerMatch.scoring.profileLink')}
          </Link>
        </p>
      )}

      <MatchSearchFields
        values={filters}
        onChange={(patch) => setFilters((current) => ({ ...current, ...patch }))}
      />

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
              <div key={key} className="text-content-primary grid gap-2 text-sm font-semibold">
                <label htmlFor={inputId}>{t(`playerMatch.scoring.weights.${label}`)}</label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={0.1}
                  value={weights[key]}
                  aria-label={t(`playerMatch.scoring.weights.${label}`)}
                  aria-valuenow={weights[key]}
                  onChange={(event) => updateWeight(key, Number(event.target.value))}
                  className="accent-brand-600 w-full"
                />
                <span className="border-line bg-surface flex h-11 items-center rounded-xl border px-3">
                  <input
                    id={inputId}
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    value={weights[key]}
                    aria-invalid={submitted && (!weightsAreValid || weightTotalTenths !== 1000)}
                    onChange={(event) =>
                      updateWeight(key, event.target.value === '' ? 0 : Number(event.target.value))
                    }
                    className="min-w-0 flex-1 bg-transparent text-base outline-none"
                  />
                  <span className="text-content-secondary ml-2">%</span>
                </span>
              </div>
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
        <Button type="button" variant="outline" onClick={() => setWeights(INITIAL_WEIGHTS)}>
          {t('playerMatch.scoring.resetWeights')}
        </Button>
      </fieldset>

      {profileQuery.data && (
        <label className="text-content-primary flex min-h-11 cursor-pointer items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={saveAsDefault}
            onChange={(event) => setSaveAsDefault(event.target.checked)}
            className="accent-brand-600 size-4"
          />
          {t('playerMatch.scoring.saveDefaults')}
        </label>
      )}

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
          disabled={
            !canAttemptSearch || isSearching || !weightsAreValid || weightTotalTenths !== 1000
          }
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
