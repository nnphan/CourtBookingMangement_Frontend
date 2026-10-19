import { useState, useEffect, useId } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Calendar,
  Clock3,
  MapPin,
  Award,
  Users,
  ArrowDownWideNarrow,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlayerMatchingFilterStore } from '../store/player-matching-filter.store';
import type {
  PlayerMatchGenderPreference,
  PlayerMatchSkillLevel,
} from '../types/player-matching.types';

export const MatchFilters = () => {
  const {
    keyword,
    matchDate,
    startTime,
    endTime,
    skillLevel,
    genderPreference,
    city,
    district,
    sortBy,
    setKeyword,
    setMatchDate,
    setStartTime,
    setEndTime,
    setSkillLevel,
    setGenderPreference,
    setCity,
    setDistrict,
    setSortBy,
    resetFilters,
  } = usePlayerMatchingFilterStore();

  const { t } = useTranslation();
  const [localSearch, setLocalSearch] = useState(keyword);
  const searchId = useId();
  const dateId = useId();
  const startTimeId = useId();
  const endTimeId = useId();
  const skillId = useId();
  const genderId = useId();
  const cityId = useId();
  const districtId = useId();
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
      keyword ||
      matchDate ||
      startTime ||
      endTime ||
      skillLevel ||
      genderPreference ||
      city ||
      district,
    ) || sortBy !== 'latest';
  const hasInvalidTimeRange = Boolean(startTime && endTime && startTime >= endTime);

  const skillOptions: { value: PlayerMatchSkillLevel; label: string }[] = [
    { value: 'BEGINNER', label: t('playerMatch.skill.beginner') },
    { value: 'INTERMEDIATE', label: t('playerMatch.skill.intermediate') },
    { value: 'ADVANCED', label: t('playerMatch.skill.advanced') },
    { value: 'PROFESSIONAL', label: t('playerMatch.skill.professional') },
  ];
  const genderOptions: { value: PlayerMatchGenderPreference; label: string }[] = [
    { value: 'MALE', label: t('playerMatch.gender.male') },
    { value: 'FEMALE', label: t('playerMatch.gender.female') },
    { value: 'BOTH', label: t('playerMatch.gender.both') },
  ];

  return (
    <div className="border-line bg-surface w-full space-y-4 rounded-2xl border p-4 shadow-xs sm:p-6">
      <div className="relative">
        <label htmlFor={searchId} className="sr-only">
          {t('playerMatch.filters.keyword')}
        </label>
        <Search className="text-content-tertiary absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
        <input
          id={searchId}
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder={t('playerMatch.filters.keywordPlaceholder')}
          className="border-line bg-surface-muted/40 text-content-primary placeholder:text-content-tertiary focus:bg-surface focus:ring-brand-500 w-full rounded-xl border py-2.5 pr-4 pl-10 text-sm transition-all focus:ring-2 focus:outline-hidden"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1">
          <label
            htmlFor={dateId}
            className="text-content-secondary flex items-center gap-1.5 text-xs font-bold"
          >
            <Calendar className="text-brand-600 size-3" />
            <span>{t('playerMatch.filters.matchDate')}</span>
          </label>
          <input
            id={dateId}
            type="date"
            value={matchDate ?? ''}
            onChange={(e) => setMatchDate(e.target.value || undefined)}
            className="border-line bg-surface text-content-primary focus:ring-brand-500 w-full rounded-xl border px-3 py-2 text-xs font-medium focus:ring-2 focus:outline-hidden"
          />
        </div>

        <div className="space-y-1">
          <label
            htmlFor={startTimeId}
            className="text-content-secondary flex items-center gap-1.5 text-xs font-bold"
          >
            <Clock3 className="text-brand-600 size-3" />
            <span>{t('playerMatch.filters.startTime')}</span>
          </label>
          <input
            id={startTimeId}
            type="time"
            value={startTime ?? ''}
            onChange={(e) => setStartTime(e.target.value || undefined)}
            className="border-line bg-surface text-content-primary focus:ring-brand-500 w-full rounded-xl border px-3 py-2 text-xs font-medium focus:ring-2 focus:outline-hidden"
          />
        </div>

        <div className="space-y-1">
          <label
            htmlFor={endTimeId}
            className="text-content-secondary flex items-center gap-1.5 text-xs font-bold"
          >
            <Clock3 className="text-brand-600 size-3" />
            <span>{t('playerMatch.filters.endTime')}</span>
          </label>
          <input
            id={endTimeId}
            type="time"
            value={endTime ?? ''}
            onChange={(e) => setEndTime(e.target.value || undefined)}
            className="border-line bg-surface text-content-primary focus:ring-brand-500 w-full rounded-xl border px-3 py-2 text-xs font-medium focus:ring-2 focus:outline-hidden"
          />
        </div>

        <div className="space-y-1">
          <label
            htmlFor={genderId}
            className="text-content-secondary flex items-center gap-1.5 text-xs font-bold"
          >
            <Users className="size-3 text-purple-600" />
            <span>{t('playerMatch.filters.genderPreference')}</span>
          </label>
          <select
            id={genderId}
            value={genderPreference ?? ''}
            onChange={(e) =>
              setGenderPreference(
                (e.target.value || undefined) as PlayerMatchGenderPreference | undefined,
              )
            }
            className="border-line bg-surface text-content-primary focus:ring-brand-500 w-full rounded-xl border px-3 py-2 text-xs font-medium focus:ring-2 focus:outline-hidden"
          >
            <option value="">{t('playerMatch.filters.allGenders')}</option>
            {genderOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label
            htmlFor={skillId}
            className="text-content-secondary flex items-center gap-1.5 text-xs font-bold"
          >
            <Award className="size-3 text-amber-600" />
            <span>{t('playerMatch.filters.skillLevel')}</span>
          </label>
          <select
            id={skillId}
            value={skillLevel ?? ''}
            onChange={(e) =>
              setSkillLevel((e.target.value || undefined) as PlayerMatchSkillLevel | undefined)
            }
            className="border-line bg-surface text-content-primary focus:ring-brand-500 w-full rounded-xl border px-3 py-2 text-xs font-medium focus:ring-2 focus:outline-hidden"
          >
            <option value="">{t('playerMatch.filters.allSkillLevels')}</option>
            {skillOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label
            htmlFor={cityId}
            className="text-content-secondary flex items-center gap-1.5 text-xs font-bold"
          >
            <MapPin className="text-brand-600 size-3" />
            <span>{t('playerMatch.filters.city')}</span>
          </label>
          <input
            id={cityId}
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="border-line bg-surface text-content-primary focus:ring-brand-500 w-full rounded-xl border px-3 py-2 text-xs font-medium focus:ring-2 focus:outline-hidden"
          />
        </div>

        <div className="space-y-1">
          <label
            htmlFor={districtId}
            className="text-content-secondary flex items-center gap-1.5 text-xs font-bold"
          >
            <MapPin className="text-brand-600 size-3" />
            <span>{t('playerMatch.filters.district')}</span>
          </label>
          <input
            id={districtId}
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="border-line bg-surface text-content-primary focus:ring-brand-500 w-full rounded-xl border px-3 py-2 text-xs font-medium focus:ring-2 focus:outline-hidden"
          />
        </div>

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
  );
};
