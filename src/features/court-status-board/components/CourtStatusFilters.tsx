import React, { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  RotateCw,
} from 'lucide-react';
import type { CourtGroup } from '../types/court';
import type { BranchLookupResponse } from '@/types/branch';
import { SchedulerService } from '../services/scheduler.service';
import { BranchSelector } from '@/components/branches/BranchSelector';
import { VietnameseDatePickerDialog } from './VietnameseDatePickerDialog';

interface CourtStatusFiltersProps {
  branches: BranchLookupResponse[];
  groups?: CourtGroup[];
  selectedBranch: string;
  selectedGroup: string;
  selectedDate: string;
  slotInterval: number;
  isLoading?: boolean;
  isBranchesLoading?: boolean;
  isBranchesError?: boolean;
  onRetryBranches?: () => void;
  onBranchChange: (branchId: string) => void;
  onGroupChange: (groupId: string) => void;
  onDateChange: (date: string) => void;
  onIntervalChange: (interval: number) => void;
  onRefresh: () => void;
}

export const CourtStatusFilters: React.FC<CourtStatusFiltersProps> = memo(
  ({
    branches,
    selectedBranch,
    selectedDate,
    isLoading = false,
    isBranchesLoading = false,
    isBranchesError = false,
    onRetryBranches,
    onBranchChange,
    onDateChange,
    onRefresh,
  }) => {
    const { t } = useTranslation();
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

    // Format YYYY-MM-DD to DD/MM/YYYY for Vietnamese display
    const formattedDateForDisplay = SchedulerService.formatDisplayDate(selectedDate);
    const hasNoBranches = !isBranchesLoading && branches.length === 0;
    const isDateDisabled = isLoading || isBranchesLoading || hasNoBranches;

    return (
      <div className="flex flex-wrap items-center gap-2.5 px-3 py-2 text-white">

        {/* Branch Dropdown */}
        <div className="flex-2 min-w-[200px] max-w-[340px]">
          <BranchSelector
            value={selectedBranch}
            onChange={onBranchChange}
            branches={branches}
            isLoading={isBranchesLoading}
            isError={isBranchesError}
            onRetry={onRetryBranches}
            variant="contrast"
          />
        </div>

        {/* Date Selector Pill & Vietnamese Calendar Dialog */}
        <div className="relative flex-1 min-w-[140px] max-w-[200px]">
          <button
            type="button"
            disabled={isDateDisabled}
            onClick={() => !isDateDisabled && setIsDatePickerOpen(true)}
            aria-label={t('courtStatus.filters.dateLabel', 'Chọn ngày')}
            className="flex h-10 w-full items-center justify-between gap-2 rounded-xl bg-white/20 px-3 text-xs font-semibold text-white backdrop-blur-xs transition-colors hover:bg-white/25 border border-white/25 cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{formattedDateForDisplay}</span>
            <Calendar className="size-3.5 shrink-0 opacity-80" />
          </button>

          <VietnameseDatePickerDialog
            isOpen={isDatePickerOpen && !isDateDisabled}
            onClose={() => setIsDatePickerOpen(false)}
            value={selectedDate}
            onChange={onDateChange}
          />
        </div>

        {/* Refresh Button */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading || isBranchesLoading || hasNoBranches}
          title={t('courtStatus.filters.refresh', 'Làm mới dữ liệu')}
          aria-label={t('courtStatus.filters.refresh', 'Làm mới dữ liệu')}
          className="grid size-10 place-items-center rounded-lg bg-white/20 text-white backdrop-blur-xs transition-all hover:bg-white/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed border border-white/25 cursor-pointer"
        >
          <RotateCw className={`size-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>
    );
  },
);

CourtStatusFilters.displayName = 'CourtStatusFilters';
