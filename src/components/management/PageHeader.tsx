import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: LucideIcon;
  /** Small pill next to the title, e.g. a record count. */
  badge?: React.ReactNode;
  /** Leading element, e.g. a back button. */
  leading?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  icon: Icon,
  badge,
  leading,
  actions,
  className,
}) => (
  <div
    className={cn(
      'flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-sm',
      className,
    )}
  >
    <div className="flex items-center gap-3.5 min-w-0">
      {leading}
      {Icon && (
        <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary text-white shadow-xs">
          <Icon aria-hidden className="size-6 stroke-[2.2]" />
        </div>
      )}
      <div className="min-w-0">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
          {badge && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-primary border border-brand-100">
              {badge}
            </span>
          )}
        </div>
        {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
      </div>
    </div>

    {actions && <div className="flex items-center gap-2.5 w-full sm:w-auto">{actions}</div>}
  </div>
);
