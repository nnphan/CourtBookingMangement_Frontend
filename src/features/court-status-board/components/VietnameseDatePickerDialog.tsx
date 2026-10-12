import React, { memo, useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type dayjs from '@/lib/dayjs';
import { VietnameseDatePicker } from './VietnameseDatePicker';
import { normalizeDate } from '../utils/date-picker.utils';
import { cn } from '@/lib/utils';

export interface VietnameseDatePickerDialogProps {
  /** Controls dialog open / close visibility */
  isOpen: boolean;
  /** Callback to close dialog */
  onClose: () => void;
  /** Current selected value (string 'YYYY-MM-DD', Date object, or dayjs) */
  value?: string | Date | dayjs.Dayjs | null;
  /** Callback when user confirms date selection */
  onChange?: (date: string) => void;
  /** Backward-compatible alias for value */
  selectedDate?: string | Date | dayjs.Dayjs | null;
  /** Backward-compatible alias for onChange */
  onConfirmDate?: (date: string) => void;
  /** Optional minimum selectable date */
  minDate?: string | Date | dayjs.Dayjs;
  /** Optional maximum selectable date */
  maxDate?: string | Date | dayjs.Dayjs;
  /** Optional quick select shortcuts */
  showQuickPills?: boolean;
  /** Optional custom dialog title */
  title?: string;
  /** Optional additional CSS class for modal container */
  className?: string;
}

export const VietnameseDatePickerDialog: React.FC<VietnameseDatePickerDialogProps> = memo(
  ({
    isOpen,
    onClose,
    value,
    onChange,
    selectedDate,
    onConfirmDate,
    minDate,
    maxDate,
    showQuickPills = false,
    title,
    className,
  }) => {
    const { t } = useTranslation();

    // Resolve current selected date from Single Source of Truth
    const resolvedValue = useMemo(() => {
      const target = value ?? selectedDate;
      return normalizeDate(target);
    }, [value, selectedDate]);

    // Internal state: viewDate dictates the visible month/year; tempDate dictates pending selection
    const [viewDate, setViewDate] = useState<dayjs.Dayjs>(() => resolvedValue);
    const [tempDate, setTempDate] = useState<string>(() => resolvedValue.format('YYYY-MM-DD'));

    // Synchronize internal state whenever dialog opens or parent value changes
    useEffect(() => {
      if (isOpen) {
        const current = normalizeDate(value ?? selectedDate);
        setViewDate(current);
        setTempDate(current.format('YYYY-MM-DD'));

        if (import.meta.env.DEV) {
          console.log('Selected Date:', (value ?? selectedDate) || current.format('YYYY-MM-DD'));
          console.log('Calendar Date:', current.format('YYYY-MM-DD'));
        }
      }
    }, [isOpen, value, selectedDate]);

    // Confirm handler: notifies parent and closes
    const handleConfirm = useCallback(() => {
      onChange?.(tempDate);
      onConfirmDate?.(tempDate);
      onClose();
    }, [tempDate, onChange, onConfirmDate, onClose]);

    // Cancel handler: closes dialog without updating parent
    const handleCancel = useCallback(() => {
      // Revert internal state back to parent value
      const original = normalizeDate(value ?? selectedDate);
      setViewDate(original);
      setTempDate(original.format('YYYY-MM-DD'));
      onClose();
    }, [value, selectedDate, onClose]);

    // Keyboard support: Escape closes, Enter confirms
    useEffect(() => {
      if (!isOpen) return;

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          handleCancel();
        } else if (e.key === 'Enter') {
          handleConfirm();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, handleCancel, handleConfirm]);

    if (!isOpen) return null;

    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Chọn ngày xem lịch trạng thái sân'}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in-0 duration-200"
        onClick={handleCancel}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className={cn(
            'w-full max-w-[340px] rounded-2xl bg-white p-5 shadow-2xl transition-all border border-slate-100 animate-in zoom-in-95 duration-200 select-none',
            className,
          )}
        >
          {/* Vietnamese Calendar Grid */}
          <VietnameseDatePicker
            value={tempDate}
            onChange={setTempDate}
            viewDate={viewDate}
            onViewDateChange={setViewDate}
            minDate={minDate}
            maxDate={maxDate}
            showQuickPills={showQuickPills}
          />

          {/* Action Buttons: Hủy (Cancel) & Xác nhận (Confirm) */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 mt-3">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-lg px-3.5 py-1.5 text-xs font-bold text-[#0d6838] transition-colors hover:bg-emerald-50 active:scale-95 cursor-pointer"
            >
              {t('common.cancel', 'Hủy')}
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              className="rounded-lg bg-[#0d6838] px-4 py-1.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-[#0a522c] active:scale-95 cursor-pointer"
            >
              {t('common.confirm', 'Xác nhận')}
            </button>
          </div>
        </div>
      </div>
    );
  },
);

VietnameseDatePickerDialog.displayName = 'VietnameseDatePickerDialog';
