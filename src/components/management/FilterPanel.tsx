import React from 'react';
import { useTranslation } from 'react-i18next';
import { Filter, RotateCcw, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FilterPanelProps {
  title?: string;
  /** Provide to show the reset button (typically only while filters are active). */
  onReset?: () => void;
  resetLabel?: string;
  children: React.ReactNode;
  className?: string;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  title,
  onReset,
  resetLabel,
  children,
  className,
}) => {
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        'w-full bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-3.5',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3 min-h-10">
        <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
          <Filter aria-hidden className="size-4 text-primary" />
          <span>{title ?? t('management.filters.title')}</span>
        </div>
        {onReset && (
          <Button type="button" variant="outline" size="sm" onClick={onReset} className="h-9 rounded-lg">
            <RotateCcw aria-hidden className="size-3.5" />
            <span>{resetLabel ?? t('management.filters.reset')}</span>
          </Button>
        )}
      </div>
      {children}
    </div>
  );
};

interface FilterSearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
}

/** Standard search field: h-10, full width, capped at max-w-sm. */
export const FilterSearchInput: React.FC<FilterSearchInputProps> = ({
  value,
  onChange,
  className,
  ...props
}) => (
  <div className={cn('relative w-full max-w-sm', className)}>
    <Search
      aria-hidden
      className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none"
    />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-10 pl-10 pr-4 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 placeholder:text-slate-400"
      {...props}
    />
  </div>
);
