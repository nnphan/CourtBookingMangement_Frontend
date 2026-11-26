import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Calendar, Clock3, MapPin, Award, Users } from 'lucide-react';
import { useBranches } from '@/features/branches/api/branch.query';
import type {
  PlayerMatchSearchParams,
  PlayerMatchGenderPreference,
  PlayerMatchSkillLevel,
} from '../types/player-matching.types';

export type MatchFilterValues = Pick<
  PlayerMatchSearchParams,
  'keyword' | 'matchDate' | 'startTime' | 'endTime' | 'branchId' | 'skillLevel' | 'genderPreference'
>;

interface MatchSearchFieldsProps {
  values: MatchFilterValues;
  onChange: (patch: MatchFilterValues) => void;
}

export const MatchSearchFields = ({ values, onChange }: MatchSearchFieldsProps) => {
  const { t } = useTranslation();
  const { keyword, matchDate, startTime, endTime, branchId, skillLevel, genderPreference } = values;
  const searchId = useId();
  const dateId = useId();
  const startTimeId = useId();
  const endTimeId = useId();
  const skillId = useId();
  const genderId = useId();
  const branchInputId = useId();
  const branchesQuery = useBranches({ pageNumber: 1, pageSize: 100, isActive: true });
  const skillOptions = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'PROFESSIONAL'] as const;
  const genderOptions = ['MALE', 'FEMALE', 'BOTH'] as const;

  return (
    <div className="space-y-4">
      <div className="relative">
        <label htmlFor={searchId} className="sr-only">
          {t('playerMatch.filters.keyword')}
        </label>
        <Search className="text-content-tertiary absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
        <input
          id={searchId}
          type="text"
          maxLength={150}
          value={keyword ?? ''}
          onChange={(e) => onChange({ keyword: e.target.value })}
          placeholder={t('playerMatch.filters.keywordPlaceholder')}
          className="border-line bg-surface-muted/40 text-content-primary placeholder:text-content-tertiary focus:bg-surface focus:ring-brand-500 w-full rounded-xl border py-2.5 pr-4 pl-10 text-sm transition-all focus:ring-2 focus:outline-hidden"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
            onChange={(e) => onChange({ matchDate: e.target.value || undefined })}
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
            onChange={(e) => onChange({ startTime: e.target.value || undefined })}
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
            onChange={(e) => onChange({ endTime: e.target.value || undefined })}
            className="border-line bg-surface text-content-primary focus:ring-brand-500 w-full rounded-xl border px-3 py-2 text-xs font-medium focus:ring-2 focus:outline-hidden"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="space-y-1">
          <label
            htmlFor={branchInputId}
            className="text-content-secondary flex items-center gap-1.5 text-xs font-bold"
          >
            <MapPin className="text-brand-600 size-3" />
            <span>{t('playerMatch.filters.branch')}</span>
          </label>
          <select
            id={branchInputId}
            value={branchId ?? ''}
            onChange={(event) => onChange({ branchId: event.target.value || undefined })}
            disabled={branchesQuery.isLoading || branchesQuery.isError}
            className="border-line bg-surface text-content-primary focus:ring-brand-500 w-full rounded-xl border px-3 py-2 text-xs font-medium focus:ring-2 focus:outline-hidden"
          >
            <option value="">{t('playerMatch.filters.allBranches')}</option>
            {branchesQuery.data?.branches
              .filter((branch) => branch.isActive)
              .map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
          </select>
          {branchesQuery.isError && (
            <button
              type="button"
              className="text-danger text-xs underline"
              onClick={() => void branchesQuery.refetch()}
            >
              {t('playerMatch.filters.retryBranches')}
            </button>
          )}
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
              onChange({
                skillLevel: (e.target.value || undefined) as PlayerMatchSkillLevel | undefined,
              })
            }
            className="border-line bg-surface text-content-primary focus:ring-brand-500 w-full rounded-xl border px-3 py-2 text-xs font-medium focus:ring-2 focus:outline-hidden"
          >
            <option value="">{t('playerMatch.filters.allSkillLevels')}</option>
            {skillOptions.map((option) => (
              <option key={option} value={option}>
                {t(`playerMatch.skill.${option.toLowerCase()}`)}
              </option>
            ))}
          </select>
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
              onChange({
                genderPreference: (e.target.value || undefined) as
                  PlayerMatchGenderPreference | undefined,
              })
            }
            className="border-line bg-surface text-content-primary focus:ring-brand-500 w-full rounded-xl border px-3 py-2 text-xs font-medium focus:ring-2 focus:outline-hidden"
          >
            <option value="">{t('playerMatch.filters.allGenders')}</option>
            {genderOptions.map((option) => (
              <option key={option} value={option}>
                {t(`playerMatch.gender.${option.toLowerCase()}`)}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
