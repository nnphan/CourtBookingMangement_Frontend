import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export type StatTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger';

const TONES: Record<StatTone, { value: string; icon: string }> = {
  neutral: { value: 'text-slate-900', icon: 'bg-slate-100 text-slate-600 border-slate-200' },
  primary: { value: 'text-primary', icon: 'bg-brand-50 text-primary border-brand-100' },
  success: { value: 'text-emerald-600', icon: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  warning: { value: 'text-amber-600', icon: 'bg-amber-50 text-amber-600 border-amber-100' },
  danger: { value: 'text-red-600', icon: 'bg-red-50 text-red-600 border-red-100' },
};

const CARD_CLASS =
  'flex min-h-[92px] items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm';

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon: LucideIcon;
  tone?: StatTone;
  /** Smaller value text for long values such as currency or names. */
  compact?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  tone = 'neutral',
  compact = false,
}) => (
  <div className={cn(CARD_CLASS, 'hover:shadow-md hover:border-slate-300 transition-all duration-200')}>
    <div className="min-w-0">
      <p className="text-sm font-medium text-muted-foreground truncate">{label}</p>
      <p
        className={cn(
          'font-bold tracking-tight mt-1',
          compact ? 'text-lg sm:text-xl truncate' : 'text-2xl sm:text-3xl',
          TONES[tone].value,
        )}
      >
        {value}
      </p>
    </div>
    <div className={cn('grid size-11 shrink-0 place-items-center rounded-xl border', TONES[tone].icon)}>
      <Icon aria-hidden className="size-5" />
    </div>
  </div>
);

export const StatCardSkeleton: React.FC = () => (
  <div className={CARD_CLASS}>
    <div className="space-y-2">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-7 w-16" />
    </div>
    <Skeleton className="size-11 rounded-xl" />
  </div>
);

/** Standard responsive grid for a row of StatCards. */
export const StatCardGrid: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
    {children}
  </div>
);
