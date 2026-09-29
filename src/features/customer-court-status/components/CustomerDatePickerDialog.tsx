import React, { memo, useState, useEffect, useMemo, useCallback } from 'react';
import dayjs from '@/lib/dayjs';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CustomerCourtStatusService } from '../services/customer-court-status.service';
import { cn } from '@/lib/utils';

interface CustomerDatePickerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string; // YYYY-MM-DD
  onConfirmDate: (date: string) => void;
}

const WEEKDAY_HEADERS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'] as const;

export const CustomerDatePickerDialog: React.FC<CustomerDatePickerDialogProps> = memo(
  ({ isOpen, onClose, selectedDate, onConfirmDate }) => {
    const [viewDate, setViewDate] = useState(() =>
      selectedDate && dayjs(selectedDate).isValid() ? dayjs(selectedDate) : dayjs(),
    );
    const [tempDate, setTempDate] = useState(selectedDate);

    // Sync view date and temporary selected date when dialog opens
    useEffect(() => {
      if (isOpen) {
        const d = selectedDate && dayjs(selectedDate).isValid() ? dayjs(selectedDate) : dayjs();
        setViewDate(d);
        setTempDate(selectedDate);
      }
    }, [isOpen, selectedDate]);

    // Keyboard support: Escape closes, Enter confirms
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (!isOpen) return;
        if (e.key === 'Escape') {
          onClose();
        } else if (e.key === 'Enter') {
          onConfirmDate(tempDate);
          onClose();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, tempDate, onConfirmDate, onClose]);

    const handlePrevMonth = useCallback(() => {
      setViewDate((prev) => prev.subtract(1, 'month'));
    }, []);

    const handleNextMonth = useCallback(() => {
      setViewDate((prev) => prev.add(1, 'month'));
    }, []);

    // Formatted label matching screenshot: "tháng 9 năm 2026"
    const monthHeaderLabel = useMemo(
      () => CustomerCourtStatusService.formatVietnameseMonthHeader(viewDate),
      [viewDate],
    );

    // Generate calendar days for the current view month (Monday first)
    const calendarDays = useMemo(() => {
      const daysInMonth = viewDate.daysInMonth();
      const firstDayOfMonth = viewDate.startOf('month');

      // Monday is 0, Tuesday is 1, ..., Sunday is 6
      const leadingEmptyCount = (firstDayOfMonth.day() + 6) % 7;

      const days: { dayNumber: number; dateString: string }[] = [];
      for (let day = 1; day <= daysInMonth; day++) {
        const d = viewDate.date(day);
        days.push({
          dayNumber: day,
          dateString: d.format('YYYY-MM-DD'),
        });
      }

      return { leadingEmptyCount, days };
    }, [viewDate]);

    if (!isOpen) return null;

    const handleConfirm = () => {
      onConfirmDate(tempDate);
      onClose();
    };

    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Chọn ngày xem lịch trạng thái sân"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in-0 duration-200"
        onClick={onClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-[340px] rounded-2xl bg-white p-5 shadow-2xl transition-all border border-slate-100 animate-in zoom-in-95 duration-200 select-none"
        >
          {/* 1. Header Month / Year Navigation */}
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

          {/* 2. Weekday Labels Header: T2, T3, T4, T5, T6, T7, CN */}
          <div className="grid grid-cols-7 gap-1 pb-2 pt-1 text-center text-xs font-semibold text-slate-400">
            {WEEKDAY_HEADERS.map((dayLabel) => (
              <div key={dayLabel} className="h-6 flex items-center justify-center">
                {dayLabel}
              </div>
            ))}
          </div>

          {/* 3. Calendar Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {/* Leading empty spaces before 1st day of month */}
            {Array.from({ length: calendarDays.leadingEmptyCount }).map((_, i) => (
              <div key={`empty-${i}`} className="size-9" />
            ))}

            {/* Days in Month */}
            {calendarDays.days.map(({ dayNumber, dateString }) => {
              const isSelected = dateString === tempDate;
              const isToday = dateString === dayjs().format('YYYY-MM-DD');

              return (
                <button
                  key={dateString}
                  type="button"
                  onClick={() => setTempDate(dateString)}
                  className={cn(
                    'grid size-9 place-items-center rounded-lg text-xs font-medium transition-all select-none cursor-pointer',
                    isSelected
                      ? 'bg-[#0d6838] text-white font-bold shadow-xs ring-1 ring-[#0d6838]'
                      : isToday
                        ? 'text-[#0d6838] font-bold hover:bg-emerald-50'
                        : 'text-slate-800 hover:bg-emerald-50',
                  )}
                >
                  {dayNumber}
                </button>
              );
            })}
          </div>

          {/* 4. Action Buttons: Hủy (Cancel) & Xác nhận (Confirm) */}
          <div className="flex items-center justify-end gap-2 pt-5 border-t border-slate-100 mt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3.5 py-1.5 text-xs font-bold text-[#0d6838] transition-colors hover:bg-emerald-50 active:scale-95 cursor-pointer"
            >
              Hủy
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              className="rounded-lg bg-[#0d6838] px-4 py-1.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-[#0a522c] active:scale-95 cursor-pointer"
            >
              Xác nhận
            </button>
          </div>
        </div>
      </div>
    );
  },
);

CustomerDatePickerDialog.displayName = 'CustomerDatePickerDialog';
