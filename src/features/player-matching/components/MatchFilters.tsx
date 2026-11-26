import { useState, useEffect, useId } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowDownWideNarrow, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlayerMatchingFilterStore } from '../store/player-matching-filter.store';
import { MatchSearchFields } from './MatchSearchFields';

export const MatchFilters = () => {
  const {
    keyword,
    matchDate,
    startTime,
    endTime,
    skillLevel,
    genderPreference,
    branchId,
    sortBy,
    setKeyword,
    setSortBy,
    resetFilters,
  } = usePlayerMatchingFilterStore();

  const { t } = useTranslation();
  const [localSearch, setLocalSearch] = useState(keyword);
  const sortId = useId();

  useEffect(() => {
    const timer = setTimeout(() => {
      setKeyword(localSearch);
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearch, setKeyword]);

  useEffect(() => {
    setLocalSearch(keyword);
  }, [keyword]);

  const hasActiveFilters =
    Boolean(
      keyword || matchDate || startTime || endTime || skillLevel || genderPreference || branchId,
    ) || sortBy !== 'latest';
  const hasInvalidTimeRange = Boolean(startTime && endTime && startTime >= endTime);

  return (
    <>
      <div className="border-line bg-surface w-full space-y-4 rounded-2xl border p-4 shadow-xs sm:p-6">
        <MatchSearchFields
          values={{
            keyword: localSearch,
            matchDate,
            startTime,
            endTime,
            branchId,
            skillLevel,
            genderPreference,
          }}
          onChange={({ keyword: nextKeyword, ...patch }) => {
            if (nextKeyword !== undefined) {
              setLocalSearch(nextKeyword);
            } else {
              usePlayerMatchingFilterStore.setState({ ...patch, page: 1 });
            }
          }}
        />

        {hasInvalidTimeRange && (
          <p role="alert" className="text-danger text-xs">
            {t('playerMatch.filters.invalidTimeRange')}
          </p>
        )}

        {hasActiveFilters && (
          <div className="border-line flex items-center justify-between border-t pt-2 text-xs">
            <span className="text-content-secondary">{t('playerMatch.filters.active')}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-danger hover:text-danger flex h-8 items-center gap-1.5 rounded-lg text-xs font-semibold hover:bg-red-50"
            >
              <RotateCcw className="size-3" />
              <span>{t('playerMatch.filters.reset')}</span>
            </Button>
          </div>
        )}
      </div>
      <div className="mt-3 flex justify-end">
        <div className="space-y-1">
          <label
            htmlFor={sortId}
            className="text-content-secondary flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowDownWideNarrow className="text-brand-600 size-3" />
            <span>{t('playerMatch.filters.sort')}</span>
          </label>
          <select
            id={sortId}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="border-line bg-surface text-content-primary focus:ring-brand-500 w-full rounded-xl border px-3 py-2 text-xs font-medium focus:ring-2 focus:outline-hidden"
          >
            <option value="latest">{t('playerMatch.filters.sortLatest')}</option>
            <option value="oldest">{t('playerMatch.filters.sortOldest')}</option>
            <option value="match_date_asc">{t('playerMatch.filters.sortDateAscending')}</option>
            <option value="match_date_desc">{t('playerMatch.filters.sortDateDescending')}</option>
          </select>
        </div>
      </div>
    </>
  );
};
