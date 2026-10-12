import React, { memo, useState, useMemo } from 'react';
import { Calendar } from 'lucide-react';
import type dayjs from '@/lib/dayjs';
import { VietnameseDatePickerDialog } from './VietnameseDatePickerDialog';
import { normalizeDate } from '../utils/date-picker.utils';
import { cn } from '@/lib/utils';

export interface DatePickerFieldProps {
  /** Current date value (YYYY-MM-DD string, Date object, or dayjs) */
  value?: string | Date | dayjs.Dayjs | null;
  /** Callback when date is confirmed */
  onChange?: (date: string) => void;
  /** Optional label */
  label?: string;
  /** Optional placeholder text */
  placeholder?: string;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Optional error message */
  error?: string;
  /** Whether to show quick select pills in the dialog */
  showQuickPills?: boolean;
  /** Additional container class */
  className?: string;
  /** Additional trigger button class */
  buttonClassName?: string;
}

export const DatePickerField: React.FC<DatePickerFieldProps> = memo(
  ({
    value,
    onChange,
    label,
    placeholder = 'Chọn ngày',
    disabled = false,
    error,
    showQuickPills = false,
    className,
    buttonClassName,
  }) => {
    const [isOpen, setIsOpen] = useState(false);

    const formattedDisplay = useMemo(() => {
      if (!value) return placeholder;
      const d = normalizeDate(value);
      return d.isValid() ? d.format('DD/MM/YYYY') : placeholder;
    }, [value, placeholder]);

    return (
      <div className={cn('flex flex-col gap-1.5 w-full', className)}>
        {label && (
          <label className="text-xs font-semibold text-slate-700">
            {label}
          </label>
        )}

        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(true)}
          className={cn(
            'flex h-10 w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 transition-colors hover:bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-[#0d6838]/20 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer',
            error && 'border-red-500 focus:ring-red-200',
            buttonClassName,
          )}
        >
          <span className={cn(!value && 'text-slate-400')}>{formattedDisplay}</span>
          <Calendar className="size-4 shrink-0 text-slate-400" />
        </button>

        {error && <span className="text-xs text-red-500 font-medium">{error}</span>}

        <VietnameseDatePickerDialog
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          value={value}
          onChange={onChange}
          showQuickPills={showQuickPills}
        />
      </div>
    );
  },
);

DatePickerField.displayName = 'DatePickerField';
