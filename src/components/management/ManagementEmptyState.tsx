import React from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface ManagementEmptyStateProps {
  title?: string;
  description?: string;
  /** Icon or emoji shown in the tile. */
  icon: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const ManagementEmptyState: React.FC<ManagementEmptyStateProps> = ({
  title,
  description,
  icon,
  actions,
  className,
}) => {
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        'w-full bg-white rounded-2xl border border-slate-200/90 p-10 sm:p-16 text-center shadow-sm',
        className,
      )}
    >
      <div className="size-16 rounded-2xl bg-brand-50 text-primary flex items-center justify-center mx-auto mb-4 border border-brand-100 text-3xl">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-slate-900">
        {title ?? t('management.empty.title')}
      </h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
        {description ?? t('management.empty.description')}
      </p>
      {actions && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">{actions}</div>
      )}
    </div>
  );
};
