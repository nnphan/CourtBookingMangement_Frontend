import React, { memo, useMemo } from 'react';
import dayjs from '@/lib/dayjs';
import {
  ArrowLeft,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Building2,
  ChevronDown,
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { LanguageSwitcher } from '@/shared/components/LanguageSwitcher';
import { CurrentUserMenu } from '@/shared/components/current-user';
import { useAuthStore } from '@/features/auth/store/auth.store';

export interface BranchOption {
  id: string;
  branchName: string;
  branchCode?: string;
  address?: string;
}

export interface CourtStatusHeaderProps {
  branchName: string;
  selectedDate: string;
  branches?: BranchOption[];
  selectedBranchId: string;
  onBranchChange?: (branchId: string) => void;
  onPrevDay: () => void;
  onNextDay: () => void;
  onOpenDatePicker: () => void;
  onBack?: () => void;
}

export const CourtStatusHeader: React.FC<CourtStatusHeaderProps> = memo(
  ({
    branchName,
    selectedDate,
    branches = [],
    selectedBranchId,
    onBranchChange,
    onPrevDay,
    onNextDay,
    onOpenDatePicker,
    onBack,
  }) => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
    const formattedDisplayDate = useMemo(() => {
      return dayjs(selectedDate).format('DD/MM/YYYY');
    }, [selectedDate]);

    const activeBranch = useMemo(() => {
      return (
        branches.find((b) => b.id === selectedBranchId) || {
          id: selectedBranchId,
          branchName: branchName || 'TMT Badminton Center',
        }
      );
    }, [branches, selectedBranchId, branchName]);

    return (
      <div className="w-full">
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-white/10 bg-[#0d6838] px-3 shadow-xs sm:px-6">
          {/* Left: Back Button */}
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Quay lại"
              className="grid size-9 cursor-pointer place-items-center rounded-full text-white/90 transition-colors hover:bg-white/15 active:scale-95"
            >
              <ArrowLeft className="size-5 stroke-[2.5]" />
            </button>
          )}

          {/* Center Title */}
          <div className="flex flex-col items-center px-2">
            <h1 className="truncate text-center text-sm font-black tracking-tight text-white uppercase drop-shadow-xs sm:text-base md:text-lg">
              {branchName || activeBranch.branchName || 'TMT BADMINTON CENTER'}
            </h1>
            <span className="text-[11px] font-semibold tracking-wide text-emerald-200/90">
              {formattedDisplayDate}
            </span>
          </div>

          {/* Right Controls: Branch Dropdown & Date Navigation */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <LanguageSwitcher variant="contrast" className="hidden sm:inline-flex" />
            {isAuthenticated && <CurrentUserMenu />}

            {/* Branch Selector (if multiple branches exist) */}
            {branches.length > 1 && onBranchChange && (
              <Select value={selectedBranchId} onValueChange={onBranchChange}>
                <SelectTrigger
                  hideChevron
                  aria-label="Chọn chi nhánh"
                  className="flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-white/25 bg-white/12 px-2.5 text-xs font-semibold text-white shadow-xs transition-all duration-150 hover:bg-white/20 focus:ring-2 focus:ring-emerald-300 active:bg-white/25"
                >
                  <Building2 className="size-3.5 shrink-0 text-emerald-200" />
                  <span className="max-w-[120px] truncate sm:max-w-[180px]">
                    {activeBranch.branchName}
                  </span>
                  <ChevronDown className="ml-0.5 size-3.5 shrink-0 text-white/80" />
                </SelectTrigger>
                <SelectContent
                  align="end"
                  className="w-64 border-slate-700 bg-slate-900 text-white"
                >
                  {branches.map((b) => (
                    <SelectItem
                      key={b.id}
                      value={b.id}
                      className="cursor-pointer text-xs font-medium focus:bg-emerald-700 focus:text-white"
                    >
                      <div className="flex flex-col">
                        <span className="font-bold">{b.branchName}</span>
                        {b.address && (
                          <span className="truncate text-[10px] text-slate-300">{b.address}</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Date Navigation Pill [ < DD/MM/YYYY 📅 > ] */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onPrevDay}
                title="Ngày trước"
                aria-label="Ngày trước"
                className="hidden cursor-pointer place-items-center rounded-md p-1 text-white/80 transition-colors hover:bg-white/15 hover:text-white sm:grid"
              >
                <ChevronLeft className="size-3.5" />
              </button>

              <button
                type="button"
                onClick={onOpenDatePicker}
                aria-label="Chọn ngày xem lịch trạng thái sân"
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/30 bg-white/15 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition-all duration-150 hover:bg-white/25 focus:ring-2 focus:ring-emerald-300 focus:outline-hidden active:bg-white/30"
              >
                <span>{formattedDisplayDate}</span>
                <Calendar className="size-3.5 text-white/95" />
              </button>

              <button
                type="button"
                onClick={onNextDay}
                title="Ngày sau"
                aria-label="Ngày sau"
                className="hidden cursor-pointer place-items-center rounded-md p-1 text-white/80 transition-colors hover:bg-white/15 hover:text-white sm:grid"
              >
                <ChevronRight className="size-3.5" />
              </button>
            </div>
          </div>
        </header>
      </div>
    );
  },
);

CourtStatusHeader.displayName = 'CourtStatusHeader';
export default CourtStatusHeader;
