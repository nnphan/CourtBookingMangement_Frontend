import React from 'react';
import { NavLink } from 'react-router';
import { cn } from '@/lib/utils';
import type { ResolvedManagementNavigationItem } from '@/hooks/useManagementNavigation';

interface NavigationItemProps {
  item: ResolvedManagementNavigationItem;
}

export const NavigationItem: React.FC<NavigationItemProps> = ({ item }) => {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.path}
      aria-current={item.isActive ? 'page' : undefined}
      className={cn(
        'px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap',
        item.isActive
          ? 'bg-white text-emerald-900 shadow-sm font-semibold'
          : 'text-white/90 hover:bg-white/10 hover:text-white',
      )}
    >
      {Icon && <Icon aria-hidden className="size-3.5" />}
      <span>{item.title}</span>
    </NavLink>
  );
};
