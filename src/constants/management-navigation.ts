import { Building2, CalendarCheck, Users } from 'lucide-react';
import { paths } from '@/app/router/paths';
import type { ManagementNavigationItem } from '@/types/management-navigation';

export const MANAGEMENT_NAVIGATION_ITEMS: readonly ManagementNavigationItem[] = [
  {
    key: 'branches',
    label: 'Branch Management',
    translationKey: 'navigation.branches',
    path: paths.adminBranches,
    icon: Building2,
    roles: ['ADMIN', 'BRANCH_MANAGER'],
  },
  {
    key: 'customers',
    label: 'Customer Management',
    translationKey: 'navigation.customers',
    path: paths.customers,
    icon: Users,
    roles: ['ADMIN', 'BRANCH_MANAGER'],
  },
  {
    key: 'court-status',
    label: 'Court Status',
    translationKey: 'navigation.courtStatus',
    path: paths.courtStatus,
    icon: CalendarCheck,
    roles: ['ADMIN', 'BRANCH_MANAGER'],
  },
];
