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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { LanguageSwitcher } from '@/shared/components/LanguageSwitcher';

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
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between px-3 sm:px-6 bg-[#0d6838] border-b border-white/10 shadow-xs">
          {/* Left: Back Button */}
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Quay lại"
              className="grid size-9 place-items-center rounded-full text-white/90 transition-colors hover:bg-white/15 active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="size-5 stroke-[2.5]" />
            </button>
          )}

          {/* Center Title */}
          <div className="flex flex-col items-center px-2">
            <h1 className="text-sm sm:text-base md:text-lg font-black tracking-tight text-white drop-shadow-xs uppercase text-center truncate">
              {branchName || activeBranch.branchName || 'TMT BADMINTON CENTER'}
            </h1>
            <span className="text-[11px] text-emerald-200/90 font-semibold tracking-wide">
              {formattedDisplayDate}
            </span>
          </div>

          {/* Right Controls: Branch Dropdown & Date Navigation */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <LanguageSwitcher variant="contrast" className="hidden sm:inline-flex" />

            {/* Branch Selector (if multiple branches exist) */}
            {branches.length > 1 && onBranchChange && (
              <Select value={selectedBranchId} onValueChange={onBranchChange}>
                <SelectTrigger
                  hideChevron
                  aria-label="Chọn chi nhánh"
                  className="h-8 px-2.5 rounded-lg border border-white/25 bg-white/12 hover:bg-white/20 active:bg-white/25 text-white font-semibold text-xs shadow-xs transition-all duration-150 flex items-center gap-1.5 cursor-pointer focus:ring-2 focus:ring-emerald-300"
                >
                  <Building2 className="size-3.5 text-emerald-200 shrink-0" />
                  <span className="truncate max-w-[120px] sm:max-w-[180px]">
                    {activeBranch.branchName}
                  </span>
                  <ChevronDown className="size-3.5 text-white/80 shrink-0 ml-0.5" />
                </SelectTrigger>
                <SelectContent align="end" className="w-64 bg-slate-900 border-slate-700 text-white">
                  {branches.map((b) => (
                    <SelectItem
                      key={b.id}
                      value={b.id}
                      className="cursor-pointer text-xs font-medium focus:bg-emerald-700 focus:text-white"
                    >
                      <div className="flex flex-col">
                        <span className="font-bold">{b.branchName}</span>
                        {b.address && (
                          <span className="text-[10px] text-slate-300 truncate">
                            {b.address}
                          </span>
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
                className="p-1 rounded-md text-white/80 hover:text-white hover:bg-white/15 transition-colors cursor-pointer hidden sm:grid place-items-center"
              >
                <ChevronLeft className="size-3.5" />
              </button>

              <button
                type="button"
                onClick={onOpenDatePicker}
                aria-label="Chọn ngày xem lịch trạng thái sân"
                className="flex items-center gap-2 bg-white/15 hover:bg-white/25 active:bg-white/30 border border-white/30 rounded-lg px-3 py-1.5 text-xs font-bold text-white shadow-xs transition-all duration-150 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-emerald-300"
              >
                <span>{formattedDisplayDate}</span>
                <Calendar className="size-3.5 text-white/95" />
              </button>

              <button
                type="button"
                onClick={onNextDay}
                title="Ngày sau"
                aria-label="Ngày sau"
                className="p-1 rounded-md text-white/80 hover:text-white hover:bg-white/15 transition-colors cursor-pointer hidden sm:grid place-items-center"
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
