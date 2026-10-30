import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  Clock,
  X,
  ArrowRight,
  RotateCcw,
  Layers,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { NormalizedBookingRange } from '../utils/court-slot-selection.utils';
import { displayTime } from '../utils/court-slot-selection.utils';

export interface SelectedScheduleSummaryProps {
  ranges: NormalizedBookingRange[];
  totalDurationHours: number;
  totalCourtCount: number;
  onRemoveRange: (range: NormalizedBookingRange) => void;
  onClearAll: () => void;
  onConfirm: () => void;
  confirmLabel?: string;
  isSubmitting?: boolean;
  disabled?: boolean;
  className?: string;
}

export const SelectedScheduleSummary: React.FC<SelectedScheduleSummaryProps> = memo(
  ({
    ranges,
    totalDurationHours,
    totalCourtCount,
    onRemoveRange,
    onClearAll,
    onConfirm,
    confirmLabel,
    isSubmitting = false,
    disabled = false,
    className,
  }) => {
    const { t } = useTranslation();
    const [isExpanded, setIsExpanded] = React.useState(false);

    if (ranges.length === 0) return null;

    const visibleRanges = isExpanded ? ranges : ranges.slice(0, 3);
    const hiddenCount = ranges.length - visibleRanges.length;

    return (
      <aside
        role="region"
        aria-label={t('booking.multiCourt.selectionSummary', 'Tóm tắt khung giờ đã chọn')}
        className={cn(
          'fixed bottom-4 left-1/2 z-50 w-[95%] max-w-4xl -translate-x-1/2 transition-all duration-300 ease-out',
          className,
        )}
      >
        <div className="relative overflow-hidden rounded-2xl border border-emerald-600/40 bg-slate-900/95 p-4 text-white shadow-2xl backdrop-blur-md">
          {/* Subtle top accent gradient */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Left section: Metrics & list of selected ranges */}
            <div className="flex-1 space-y-2">
              {/* Top stats line */}
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <span className="flex items-center gap-1">
                  <Layers className="size-3.5" aria-hidden />
                  {t('booking.multiCourt.courtCount', '{{count}} sân', {
                    count: totalCourtCount,
                  })}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="size-3.5" aria-hidden />
                  {t('booking.multiCourt.rangeCount', '{{count}} khung giờ', {
                    count: ranges.length,
                  })}
                </span>
                <span>•</span>
                <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-emerald-300">
                  {totalDurationHours} {t('common.hours', 'giờ')}
                </span>
              </div>

              {/* Badges of normalized ranges */}
              <div
                className="flex flex-wrap items-center gap-2"
                aria-live="polite"
              >
                {visibleRanges.map((range) => {
                  const key = `${range.courtId}:${range.bookingDate}:${range.startTime}:${range.endTime}`;
                  const start = displayTime(range.startTime);
                  const end = displayTime(range.endTime);

                  return (
                    <div
                      key={key}
                      className="group inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/90 py-1 pl-2.5 pr-1.5 text-xs text-slate-100 shadow-xs transition-colors hover:border-emerald-500/50 hover:bg-slate-800"
                    >
                      <span className="font-bold text-emerald-400">
                        {range.courtName}
                      </span>
                      <span className="text-slate-400">|</span>
                      <span className="font-medium text-slate-200">
                        {start} - {end}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        ({range.durationHours}h)
                      </span>
                      <button
                        type="button"
                        onClick={() => onRemoveRange(range)}
                        aria-label={t(
                          'booking.multiCourt.removeRange',
                          'Xóa khoảng thời gian {{court}} {{start}} - {{end}}',
                          {
                            court: range.courtName,
                            start,
                            end,
                          },
                        )}
                        className="ml-0.5 grid size-5 place-items-center rounded-md text-slate-400 transition-colors hover:bg-rose-500/20 hover:text-rose-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rose-400 active:scale-95"
                      >
                        <X className="size-3" strokeWidth={2.5} />
                      </button>
                    </div>
                  );
                })}

                {/* Show more/less toggle button for many ranges */}
                {ranges.length > 3 && (
                  <button
                    type="button"
                    onClick={() => setIsExpanded((prev) => !prev)}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
                  >
                    {isExpanded ? (
                      <>
                        <span>{t('common.showLess', 'Thu gọn')}</span>
                        <ChevronUp className="size-3" />
                      </>
                    ) : (
                      <>
                        <span>+{hiddenCount} {t('common.more', 'khác')}</span>
                        <ChevronDown className="size-3" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Right section: Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800 lg:border-t-0 lg:pt-0">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClearAll}
                className="text-slate-300 hover:bg-slate-800 hover:text-white active:scale-95"
              >
                <RotateCcw className="mr-1.5 size-3.5" aria-hidden />
                {t('courtStatus.bottom.clearSelection', 'Bỏ chọn')}
              </Button>

              <Button
                type="button"
                size="sm"
                onClick={onConfirm}
                disabled={disabled || isSubmitting}
                className="bg-emerald-600 font-bold text-white shadow-md hover:bg-emerald-500 active:scale-95 focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                <span>
                  {confirmLabel ?? t('courtStatus.bottom.book', 'Đặt lịch')}
                </span>
                <ArrowRight className="ml-1.5 size-3.5 stroke-[2.5]" aria-hidden />
              </Button>
            </div>
          </div>
        </div>
      </aside>
    );
  },
);

SelectedScheduleSummary.displayName = 'SelectedScheduleSummary';
export default SelectedScheduleSummary;

