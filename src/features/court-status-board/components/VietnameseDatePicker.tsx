import React, { memo, useMemo, useCallback } from 'react';
import dayjs from '@/lib/dayjs';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { normalizeDate } from '../utils/date-picker.utils';

export interface VietnameseDatePickerProps {
  /** Currently selected date (YYYY-MM-DD string, Date object, or dayjs) */
  value?: string | Date | dayjs.Dayjs | null;
  /** Callback when user clicks/selects a date */
  onChange?: (date: string) => void;
  /** Backward-compatible alias for value */
  selectedDate?: string | Date | dayjs.Dayjs | null;
  /** Backward-compatible alias for onChange */
  onSelectDate?: (date: string) => void;
  /** Current active month view date */
  viewDate: dayjs.Dayjs;
  /** Handler to change active month view date */
  onViewDateChange: (newViewDate: dayjs.Dayjs) => void;
  /** Optional minimum selectable date */
  minDate?: string | Date | dayjs.Dayjs;
  /** Optional maximum selectable date */
  maxDate?: string | Date | dayjs.Dayjs;
  /** Whether to show quick select pills (Hôm nay, Ngày mai, Ngày kia) */
  showQuickPills?: boolean;
  /** Additional container CSS class */
  className?: string;
}

const WEEKDAY_HEADERS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'] as const;

export const VietnameseDatePicker: React.FC<VietnameseDatePickerProps> = memo(
  ({
    value,
    onChange,
    selectedDate,
    onSelectDate,
    viewDate,
    onViewDateChange,
    minDate,
    maxDate,
    showQuickPills = false,
    className,
  }) => {
    const activeSelectedDate = useMemo(() => {
      const target = value ?? selectedDate;
      return target ? normalizeDate(target) : null;
    }, [value, selectedDate]);

    const minDayjs = useMemo(() => (minDate ? normalizeDate(minDate).startOf('day') : null), [minDate]);
    const maxDayjs = useMemo(() => (maxDate ? normalizeDate(maxDate).endOf('day') : null), [maxDate]);

    const handlePrevMonth = useCallback(() => {
      onViewDateChange(viewDate.subtract(1, 'month'));
    }, [viewDate, onViewDateChange]);

    const handleNextMonth = useCallback(() => {
      onViewDateChange(viewDate.add(1, 'month'));
    }, [viewDate, onViewDateChange]);

    const handleSelectDay = useCallback(
      (dateString: string) => {
        onChange?.(dateString);
        onSelectDate?.(dateString);
      },
      [onChange, onSelectDate],
    );

    // Month label e.g. "tháng 10 năm 2026"
    const monthHeaderLabel = useMemo(() => {
      return `tháng ${viewDate.month() + 1} năm ${viewDate.year()}`;
    }, [viewDate]);

    // Calendar matrix calculation (Monday first)
    const calendarDays = useMemo(() => {
      const daysInMonth = viewDate.daysInMonth();
      const firstDayOfMonth = viewDate.startOf('month');

      // Monday = 0, Tuesday = 1, ..., Sunday = 6
      const leadingEmptyCount = (firstDayOfMonth.day() + 6) % 7;

      const days: { dayNumber: number; dateString: string; isOutOfRange: boolean }[] = [];
      for (let day = 1; day <= daysInMonth; day++) {
        const d = viewDate.date(day);
        const dateString = d.format('YYYY-MM-DD');
        const isBeforeMin = minDayjs ? d.isBefore(minDayjs, 'day') : false;
        const isAfterMax = maxDayjs ? d.isAfter(maxDayjs, 'day') : false;

        days.push({
          dayNumber: day,
          dateString,
          isOutOfRange: isBeforeMin || isAfterMax,
        });
      }

      return { leadingEmptyCount, days };
    }, [viewDate, minDayjs, maxDayjs]);

    return (
      <div className={cn('w-full select-none', className)}>
        {/* Quick select pills */}
        {showQuickPills && (
          <div className="grid grid-cols-3 gap-1.5 mb-3 pb-3 border-b border-slate-100">
            {[
              { label: 'Hôm nay', offset: 0 },
              { label: 'Ngày mai', offset: 1 },
              { label: 'Ngày kia', offset: 2 },
            ].map(({ label, offset }) => {
              const target = dayjs().add(offset, 'day');
              const targetStr = target.format('YYYY-MM-DD');
              const isSelected = activeSelectedDate?.isSame(target, 'day');

              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    onViewDateChange(target);
                    handleSelectDay(targetStr);
                  }}
                  className={cn(
                    'rounded-lg border py-1.5 text-xs font-semibold transition-colors cursor-pointer',
                    isSelected
                      ? 'border-[#0d6838] bg-emerald-50 text-[#0d6838]'
                      : 'border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-[#0d6838]',
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}

        {/* Month / Year Navigation */}
        <div className="flex items-center justify-between pb-3">
          <button
            type="button"
            onClick={handlePrevMonth}
            aria-label="Tháng trước"
            className="grid size-8 place-items-center rounded-full text-[#0d6838] transition-colors hover:bg-emerald-50 active:scale-95 cursor-pointer"
          >
            <ChevronLeft className="size-5 stroke-[2.5]" />
          </button>

          <span className="text-sm font-bold text-slate-800 tracking-tight lowercase">
            {monthHeaderLabel}
          </span>

          <button
            type="button"
            onClick={handleNextMonth}
            aria-label="Tháng tiếp theo"
            className="grid size-8 place-items-center rounded-full text-[#0d6838] transition-colors hover:bg-emerald-50 active:scale-95 cursor-pointer"
          >
            <ChevronRight className="size-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Weekday Labels Header: T2, T3, T4, T5, T6, T7, CN */}
        <div className="grid grid-cols-7 gap-1 pb-2 pt-1 text-center text-xs font-semibold text-slate-400">
          {WEEKDAY_HEADERS.map((dayLabel) => (
            <div key={dayLabel} className="h-6 flex items-center justify-center">
              {dayLabel}
            </div>
          ))}
        </div>

        {/* Calendar Days Grid */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {Array.from({ length: calendarDays.leadingEmptyCount }).map((_, i) => (
            <div key={`empty-${i}`} className="size-9" />
          ))}

          {calendarDays.days.map(({ dayNumber, dateString, isOutOfRange }) => {
            const isSelected = activeSelectedDate ? dayjs(dateString).isSame(activeSelectedDate, 'day') : false;
            const isToday = dayjs(dateString).isSame(dayjs(), 'day');

            return (
              <button
                key={dateString}
                type="button"
                disabled={isOutOfRange}
                onClick={() => handleSelectDay(dateString)}
                aria-label={`Ngày ${dayNumber}`}
                aria-pressed={isSelected}
                className={cn(
                  'grid size-9 place-items-center rounded-lg text-xs font-medium transition-all select-none cursor-pointer',
                  isOutOfRange && 'opacity-30 cursor-not-allowed hover:bg-transparent text-slate-300',
                  !isOutOfRange &&
                    (isSelected
                      ? 'bg-[#0d6838] text-white font-bold shadow-xs ring-1 ring-[#0d6838]'
                      : isToday
                        ? 'text-[#0d6838] font-bold hover:bg-emerald-50'
                        : 'text-slate-800 hover:bg-emerald-50'),
                )}
              >
                {dayNumber}
              </button>
            );
          })}
        </div>
      </div>
    );
  },
);

VietnameseDatePicker.displayName = 'VietnameseDatePicker';
