import { useMemo } from 'react';
import { useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useBranchPermissions } from '@/hooks/branches';
import { MANAGEMENT_NAVIGATION_ITEMS } from '@/constants/management-navigation';
import type { ManagementNavigationItem } from '@/types/management-navigation';

export interface ResolvedManagementNavigationItem extends ManagementNavigationItem {
  title: string;
  isActive: boolean;
}

/** Matches the path itself and any nested route, without matching siblings like /customer/... */
const isPathActive = (pathname: string, path: string) =>
  pathname === path || pathname.startsWith(`${path}/`);

/**
 * Resolves the management navigation for the current user and route:
 * filters items by role, translates labels and flags the active item.
 */
export const useManagementNavigation = (): ResolvedManagementNavigationItem[] => {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const { role } = useBranchPermissions();

  return useMemo(
    () =>
      MANAGEMENT_NAVIGATION_ITEMS.filter(
        (item) => !item.roles || (role !== 'OTHER' && item.roles.includes(role)),
      ).map((item) => ({
        ...item,
        title: t(item.translationKey, { defaultValue: item.label }),
        isActive: isPathActive(pathname, item.path),
      })),
    [pathname, role, t],
  );
};
