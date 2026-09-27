import React, { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Clock,
  GitBranch,
  SlidersHorizontal,
  Calendar,
  RotateCw,
} from 'lucide-react';
import type { CourtBranch, CourtGroup } from '../types/court';
import { SCHEDULER_CONFIG } from '../constants/scheduler';
import { SchedulerService } from '../services/scheduler.service';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { VietnameseDatePickerDialog } from './VietnameseDatePickerDialog';

interface CourtStatusFiltersProps {
  branches: CourtBranch[];
  groups: CourtGroup[];
  selectedBranch: string;
  selectedGroup: string;
  selectedDate: string;
  slotInterval: number;
  isLoading?: boolean;
  onBranchChange: (branchId: string) => void;
  onGroupChange: (groupId: string) => void;
  onDateChange: (date: string) => void;
  onIntervalChange: (interval: number) => void;
  onRefresh: () => void;
}

export const CourtStatusFilters: React.FC<CourtStatusFiltersProps> = memo(
  ({
    branches,
    groups,
    selectedBranch,
    selectedGroup,
    selectedDate,
    slotInterval,
    isLoading = false,
    onBranchChange,
    onGroupChange,
    onDateChange,
    onIntervalChange,
    onRefresh,
  }) => {
    const { t } = useTranslation();
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

    // Format YYYY-MM-DD to DD/MM/YYYY for Vietnamese display
    const formattedDateForDisplay = SchedulerService.formatDisplayDate(selectedDate);

    return (
      <div className="flex flex-wrap items-center gap-2.5 px-3 py-2 text-white">
        {/* Court Group Dropdown */}
        <div className="flex-1 min-w-[140px] max-w-[200px]">
          <Select value={selectedGroup} onValueChange={onGroupChange}>
            <SelectTrigger
              aria-label={t('courtStatus.filters.groupLabel', 'Nhóm sân')}
              rightIcon={<Clock className="size-3.5 text-white/80" />}
              className="h-9 border-white/25 bg-white/20 px-3 text-xs font-semibold text-white shadow-none backdrop-blur-xs transition-colors hover:bg-white/25 focus:ring-white/40"
            >
              <SelectValue placeholder={t('courtStatus.filters.allCourts', 'Tất cả')} />
            </SelectTrigger>
            <SelectContent align="start" className="min-w-[180px]">
              <SelectItem value="all">
                {t('courtStatus.filters.allCourts', 'Tất cả')}
              </SelectItem>
              {groups
                .filter((g) => g.id !== 'all')
                .map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        {/* Branch Dropdown */}
        <div className="flex-2 min-w-[200px] max-w-[340px]">
          <Select value={selectedBranch} onValueChange={onBranchChange}>
            <SelectTrigger
              aria-label={t('courtStatus.filters.branchLabel', 'Chi nhánh')}
              rightIcon={<GitBranch className="size-3.5 text-white/80" />}
              className="h-9 border-white/25 bg-white/20 px-3 text-xs font-semibold text-white shadow-none backdrop-blur-xs transition-colors hover:bg-white/25 focus:ring-white/40"
            >
              <SelectValue placeholder="Chọn chi nhánh" />
            </SelectTrigger>
            <SelectContent align="start" className="min-w-[260px]">
              {branches.map((branch) => (
                <SelectItem key={branch.id} value={branch.id}>
                  {branch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Slot Interval Dropdown (15, 30, 60 minutes) */}
        <div className="flex-1 min-w-[90px] max-w-[130px]">
          <Select
            value={String(slotInterval)}
            onValueChange={(val) => onIntervalChange(Number(val))}
          >
            <SelectTrigger
              aria-label={t('courtStatus.filters.intervalLabel', 'Khoảng thời gian (phút)')}
              rightIcon={<SlidersHorizontal className="size-3.5 text-white/80" />}
              className="h-9 border-white/25 bg-white/20 px-3 text-xs font-semibold text-white shadow-none backdrop-blur-xs transition-colors hover:bg-white/25 focus:ring-white/40"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="start" className="min-w-[120px]">
              {SCHEDULER_CONFIG.SUPPORTED_INTERVALS.map((intv) => (
                <SelectItem key={intv} value={String(intv)}>
                  {intv} {t('courtStatus.filters.minutes', 'phút')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Selector Pill & Vietnamese Calendar Dialog */}
        <div className="relative flex-1 min-w-[140px] max-w-[200px]">
          <button
            type="button"
            onClick={() => setIsDatePickerOpen(true)}
            aria-label={t('courtStatus.filters.dateLabel', 'Chọn ngày')}
            className="flex h-9 w-full items-center justify-between gap-2 rounded-lg bg-white/20 px-3 text-xs font-semibold text-white backdrop-blur-xs transition-colors hover:bg-white/25 border border-white/25 cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            <span>{formattedDateForDisplay}</span>
            <Calendar className="size-3.5 shrink-0 opacity-80" />
          </button>

          <VietnameseDatePickerDialog
            isOpen={isDatePickerOpen}
            onClose={() => setIsDatePickerOpen(false)}
            selectedDate={selectedDate}
            onConfirmDate={onDateChange}
          />
        </div>

        {/* Refresh Button */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          title={t('courtStatus.filters.refresh', 'Làm mới dữ liệu')}
          aria-label={t('courtStatus.filters.refresh', 'Làm mới dữ liệu')}
          className="grid size-9 place-items-center rounded-lg bg-white/20 text-white backdrop-blur-xs transition-all hover:bg-white/30 active:scale-95 disabled:opacity-50 border border-white/25 cursor-pointer"
        >
          <RotateCw className={`size-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>
    );
  },
);

CourtStatusFilters.displayName = 'CourtStatusFilters';
