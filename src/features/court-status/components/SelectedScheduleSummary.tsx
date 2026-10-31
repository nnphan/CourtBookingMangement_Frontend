import React, { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Clock,
  X,
  ArrowRight,
  RotateCcw,
  Layers,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { NormalizedBookingRange } from '../utils/court-slot-selection.utils';
import { displayTime } from '../utils/court-slot-selection.utils';
import { formatCurrency } from '@/features/bookings/utils/booking.mapper';

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
    const [isExpanded, setIsExpanded] = useState(false);

    if (ranges.length === 0) return null;

    // Optional price calculation if price exists on slots
    const totalPrice = ranges.reduce((acc, r) => {
      const rangePrice = r.slots.reduce((sum, s) => sum + (s.price ?? 0), 0);
      return acc + rangePrice;
    }, 0);

    const visibleRanges = isExpanded ? ranges : ranges.slice(0, 3);
    const hiddenCount = ranges.length - visibleRanges.length;

    return (
      <aside
        role="region"
        aria-label={t('booking.multiCourt.selectionSummary', 'Tóm tắt khung giờ đã chọn')}
        className={cn(
          'fixed bottom-4 inset-x-3 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-50 w-auto sm:w-[95%] sm:max-w-4xl transition-all duration-300 ease-out',
          className,
        )}
      >
        <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-slate-900/95 p-3.5 sm:p-4 text-white shadow-2xl shadow-emerald-950/40 backdrop-blur-xl ring-1 ring-white/10">
          {/* Top accent gradient bar */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />

          <div className="flex flex-col gap-3.5 lg:flex-row lg:items-center lg:justify-between">
            {/* Left section: Metrics & selected range chips */}
            <div className="flex-1 space-y-2.5">
              {/* Metrics row */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                {/* Court count pill */}
                <span className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-1 text-emerald-300 shadow-2xs">
                  <Layers className="size-3.5 text-emerald-400" aria-hidden />
                  <span>
                    {t('booking.multiCourt.courtCount', '{{count}} sân', {
                      count: totalCourtCount,
                    })}
                  </span>
                </span>

                {/* Range count pill */}
                <span className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-slate-200 shadow-2xs">
                  <Clock className="size-3.5 text-slate-400" aria-hidden />
                  <span>
                    {t('booking.multiCourt.rangeCount', '{{count}} khung giờ', {
                      count: ranges.length,
                    })}
                  </span>
                </span>

                {/* Duration pill */}
                <span className="flex items-center gap-1.5 rounded-lg border border-teal-500/30 bg-teal-500/15 px-2.5 py-1 text-teal-300 shadow-2xs">
                  <span>
                    {totalDurationHours} {t('common.hours', 'giờ chơi')}
                  </span>
                </span>

                {/* Estimated Price Pill (when available) */}
                {totalPrice > 0 && (
                  <span className="flex items-center gap-1.5 rounded-lg border border-amber-400/30 bg-amber-400/15 px-2.5 py-1 text-amber-300 font-bold shadow-2xs">
                    <Sparkles className="size-3 text-amber-400" aria-hidden />
                    <span>Tạm tính: {formatCurrency(totalPrice)}</span>
                  </span>
                )}
              </div>

              {/* Selected ranges list with responsive wrap / expand */}
              <div
                className={cn(
                  'flex flex-wrap items-center gap-2',
                  isExpanded && 'max-h-48 overflow-y-auto pr-1',
                )}
                aria-live="polite"
              >
                {visibleRanges.map((range) => {
                  const key = `${range.courtId}:${range.bookingDate}:${range.startTime}:${range.endTime}`;
                  const start = displayTime(range.startTime);
                  const end = displayTime(range.endTime);
                  const rangePrice = range.slots.reduce((sum, s) => sum + (s.price ?? 0), 0);

                  return (
                    <div
                      key={key}
                      className="group inline-flex items-center gap-2 rounded-xl border border-slate-700/80 bg-slate-800/90 py-1.5 pl-3 pr-1.5 text-xs text-slate-100 shadow-xs transition-all hover:border-emerald-500/50 hover:bg-slate-800 focus-within:ring-2 focus-within:ring-emerald-500/40"
                    >
                      <span className="font-bold text-emerald-400">
                        {range.courtName}
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className="font-medium text-slate-200">
                        {start} - {end}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        ({range.durationHours}h)
                      </span>

                      {rangePrice > 0 && (
                        <>
                          <span className="text-slate-500">•</span>
                          <span className="font-semibold text-emerald-300 text-[11px]">
                            {formatCurrency(rangePrice)}
                          </span>
                        </>
                      )}

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
                        className="ml-0.5 flex size-6 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-500/20 hover:text-rose-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 active:scale-90 cursor-pointer"
                        title={t('common.remove', 'Xóa')}
                      >
                        <X className="size-3.5" strokeWidth={2.5} />
                      </button>
                    </div>
                  );
                })}

                {/* Show more/less toggle button for 4+ ranges */}
                {ranges.length > 3 && (
                  <button
                    type="button"
                    onClick={() => setIsExpanded((prev) => !prev)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/70 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer active:scale-95"
                  >
                    {isExpanded ? (
                      <>
                        <span>{t('common.showLess', 'Thu gọn')}</span>
                        <ChevronUp className="size-3.5" />
                      </>
                    ) : (
                      <>
                        <span>+{hiddenCount} {t('common.more', 'khung giờ khác')}</span>
                        <ChevronDown className="size-3.5" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Right section: Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800/80 lg:border-t-0 lg:pt-0 shrink-0">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClearAll}
                className="text-slate-300 hover:bg-slate-800 hover:text-white active:scale-95 cursor-pointer text-xs font-semibold px-3 py-2 min-h-[40px]"
              >
                <RotateCcw className="mr-1.5 size-3.5 text-slate-400" aria-hidden />
                <span>{t('courtStatus.bottom.clearSelection', 'Bỏ chọn')}</span>
              </Button>

              <Button
                type="button"
                size="sm"
                onClick={onConfirm}
                disabled={disabled || isSubmitting}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 font-bold text-white shadow-lg shadow-emerald-950/40 hover:shadow-emerald-900/60 active:scale-[0.98] transition-all focus-visible:ring-2 focus-visible:ring-emerald-400 cursor-pointer text-xs px-5 py-2 min-h-[40px] rounded-xl"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-1.5 size-4 animate-spin" aria-hidden />
                    <span>{t('common.processing', 'Đang xử lý...')}</span>
                  </>
                ) : (
                  <>
                    <span>
                      {confirmLabel ?? t('courtStatus.bottom.book', 'Đặt lịch')}
                    </span>
                    <ArrowRight className="ml-1.5 size-4 stroke-[2.5]" aria-hidden />
                  </>
                )}
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
