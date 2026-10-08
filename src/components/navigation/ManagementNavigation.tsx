import React from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useManagementNavigation } from '@/hooks/useManagementNavigation';
import { NavigationItem } from './NavigationItem';

interface ManagementNavigationProps {
  className?: string;
}

/** Desktop-only navigation shared by the management pages. */
export const ManagementNavigation: React.FC<ManagementNavigationProps> = ({ className }) => {
  const { t } = useTranslation();
  const items = useManagementNavigation();

  if (items.length === 0) return null;

  return (
    <nav
      aria-label={t('navigation.label', { defaultValue: 'Management navigation' })}
      className={cn(
        'hidden lg:flex items-center gap-1 bg-white/10 p-1 rounded-xl text-xs font-bold text-white/90',
        className,
      )}
    >
      {items.map((item) => (
        <NavigationItem key={item.key} item={item} />
      ))}
    </nav>
  );
};
