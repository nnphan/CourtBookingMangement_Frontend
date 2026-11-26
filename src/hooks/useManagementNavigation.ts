import { useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useManagementNavigation as useManagementItems } from '@/components/layout/management-navigation';

export const useManagementNavigation = () => {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  return useManagementItems().map((item) => ({
    ...item,
    title: item.translationKey ? t(item.translationKey) : item.label,
    isActive: pathname === item.path || pathname.startsWith(`${item.path}/`),
  }));
};

export type ResolvedManagementNavigationItem = ReturnType<typeof useManagementNavigation>[number];
