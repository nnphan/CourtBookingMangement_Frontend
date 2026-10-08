import React from 'react';
import { cn } from '@/lib/utils';

export type StatusBadgeVariant =
  | 'active'
  | 'inactive'
  | 'available'
  | 'maintenance'
  | 'pending'
  | 'reserved'
  | 'blocked'
  | 'open'
  | 'closed';

type Tone = 'success' | 'neutral' | 'warning' | 'danger';

const VARIANT_TONE: Record<StatusBadgeVariant, Tone> = {
  active: 'success',
  available: 'success',
  open: 'success',
  inactive: 'neutral',
  closed: 'neutral',
  pending: 'warning',
  reserved: 'warning',
  maintenance: 'danger',
  blocked: 'danger',
};

const TONE_CLASS: Record<Tone, { badge: string; dot: string }> = {
  success: { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  neutral: { badge: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400' },
  warning: { badge: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  danger: { badge: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' },
};

interface StatusBadgeProps {
  status: StatusBadgeVariant;
  /** Already-translated label. */
  children: React.ReactNode;
  showDot?: boolean;
  className?: string;
}

/**
 * One badge for every status in the management modules:
 * green = active/available/open, gray = inactive/closed,
 * amber = pending/reserved, red = maintenance/blocked.
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  children,
  showDot = true,
  className,
}) => {
  const tone = TONE_CLASS[VARIANT_TONE[status]];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap',
        tone.badge,
        className,
      )}
    >
      {showDot && <span aria-hidden className={cn('size-1.5 rounded-full', tone.dot)} />}
      {children}
    </span>
  );
};
