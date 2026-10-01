import { useState, useEffect, useId } from 'react';
import { Search, Calendar, MapPin, Award, Users, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlayerMatchingFilterStore } from '../store/player-matching-filter.store';
import { useBranches } from '@/features/branch-discovery/hooks/useBranches';
import type { SkillLevel, MatchGender } from '../types/player-matching.types';

const SKILL_LEVELS: SkillLevel[] = [
  'All',
  'Beginner',
  'Beginner+',
  'Intermediate',
  'Advanced',
  'Professional',
];

const GENDER_OPTIONS: MatchGender[] = ['All', 'Male', 'Female', 'Mixed', 'Any'];

const SLOT_OPTIONS = [
  { label: 'Tất cả số chỗ', value: 0 },
  { label: '1+ chỗ trống', value: 1 },
  { label: '2+ chỗ trống', value: 2 },
  { label: '3+ chỗ trống', value: 3 },
];

export const MatchFilters = () => {
  const {
    search,
    date,
    branchId,
    skillLevel,
    gender,
    availableSlots,
    setSearch,
    setDate,
    setBranch,
    setSkillLevel,
    setGender,
    setAvailableSlots,
    resetFilters,
  } = usePlayerMatchingFilterStore();

  const [localSearch, setLocalSearch] = useState(search);
  const searchId = useId();
  const dateId = useId();
  const branchIdInput = useId();
  const skillId = useId();
  const genderId = useId();
  const slotId = useId();

  // 500ms debounce for search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(localSearch);
    }, 500);

    return () => clearTimeout(timer);
  }, [localSearch, setSearch]);

  // Keep localSearch in sync if store is reset
  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  // Fetch branches for branch dropdown
  const { data: branchesResponse } = useBranches();
  const branches = branchesResponse?.data ?? [];

  const hasActiveFilters =
    Boolean(search) ||
    Boolean(date) ||
    (Boolean(branchId) && branchId !== 'all') ||
    (Boolean(skillLevel) && skillLevel !== 'All') ||
    (Boolean(gender) && gender !== 'All') ||
    Boolean(availableSlots && availableSlots > 0);

  return (
    <div className="w-full rounded-2xl border border-line bg-surface p-4 sm:p-6 shadow-xs space-y-4">
      {/* Search Input */}
      <div className="relative">
        <label htmlFor={searchId} className="sr-only">
          Tìm kiếm trận đấu theo chi nhánh, sân, chủ trận
        </label>
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-content-tertiary" />
        <input
          id={searchId}
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Search by branch, court, host..."
          className="w-full rounded-xl border border-line bg-surface-muted/40 pl-10 pr-4 py-2.5 text-sm text-content-primary placeholder:text-content-tertiary focus:bg-surface focus:outline-hidden focus:ring-2 focus:ring-brand-500 transition-all"
        />
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {/* Date Filter */}
        <div className="space-y-1">
          <label htmlFor={dateId} className="flex items-center gap-1.5 text-xs font-bold text-content-secondary">
            <Calendar className="size-3 text-brand-600" />
            <span>Ngày đấu</span>
          </label>
          <input
            id={dateId}
            type="date"
            value={date ?? ''}
            onChange={(e) => setDate(e.target.value || undefined)}
            className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-xs font-medium text-content-primary focus:outline-hidden focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Branch Filter */}
        <div className="space-y-1">
          <label htmlFor={branchIdInput} className="flex items-center gap-1.5 text-xs font-bold text-content-secondary">
            <MapPin className="size-3 text-brand-600" />
            <span>Chi nhánh</span>
          </label>
          <select
            id={branchIdInput}
            value={branchId ?? 'all'}
            onChange={(e) => setBranch(e.target.value === 'all' ? undefined : e.target.value)}
            className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-xs font-medium text-content-primary focus:outline-hidden focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">Tất cả chi nhánh</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* Skill Level Filter */}
        <div className="space-y-1">
          <label htmlFor={skillId} className="flex items-center gap-1.5 text-xs font-bold text-content-secondary">
            <Award className="size-3 text-amber-600" />
            <span>Trình độ</span>
          </label>
          <select
            id={skillId}
            value={skillLevel ?? 'All'}
            onChange={(e) => setSkillLevel(e.target.value)}
            className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-xs font-medium text-content-primary focus:outline-hidden focus:ring-2 focus:ring-brand-500"
          >
            {SKILL_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level === 'All' ? 'Tất cả trình độ' : level}
              </option>
            ))}
          </select>
        </div>

        {/* Gender Filter */}
        <div className="space-y-1">
          <label htmlFor={genderId} className="flex items-center gap-1.5 text-xs font-bold text-content-secondary">
            <Users className="size-3 text-purple-600" />
            <span>Giới tính</span>
          </label>
          <select
            id={genderId}
            value={gender ?? 'All'}
            onChange={(e) => setGender(e.target.value)}
            className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-xs font-medium text-content-primary focus:outline-hidden focus:ring-2 focus:ring-brand-500"
          >
            {GENDER_OPTIONS.map((g) => (
              <option key={g} value={g}>
                {g === 'All' ? 'Tất cả giới tính' : g}
              </option>
            ))}
          </select>
        </div>

        {/* Available Slots Filter */}
        <div className="space-y-1">
          <label htmlFor={slotId} className="flex items-center gap-1.5 text-xs font-bold text-content-secondary">
            <Users className="size-3 text-emerald-600" />
            <span>Chỗ trống</span>
          </label>
          <select
            id={slotId}
            value={availableSlots ?? 0}
            onChange={(e) => {
              const val = Number(e.target.value);
              setAvailableSlots(val > 0 ? val : undefined);
            }}
            className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-xs font-medium text-content-primary focus:outline-hidden focus:ring-2 focus:ring-brand-500"
          >
            {SLOT_OPTIONS.map((slot) => (
              <option key={slot.value} value={slot.value}>
                {slot.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Clear Filters indicator */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between pt-2 border-t border-line text-xs">
          <span className="text-content-secondary">Đang áp dụng bộ lọc tùy chỉnh</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="h-8 rounded-lg text-xs font-semibold text-danger hover:bg-red-50 hover:text-danger flex items-center gap-1.5"
          >
            <RotateCcw className="size-3" />
            <span>Xóa bộ lọc</span>
          </Button>
        </div>
      )}
    </div>
  );
};
