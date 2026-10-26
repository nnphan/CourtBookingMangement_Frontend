import { Building2, CalendarCheck, UserCog, Users } from 'lucide-react';
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
    key: 'users',
    label: 'Quản lý người dùng',
    translationKey: 'navigation.users',
    path: paths.adminUsers,
    icon: UserCog,
    roles: ['ADMIN'],
  },
  {
    key: 'owners',
    label: 'Quản lý chủ sân',
    translationKey: 'navigation.owners',
    path: paths.adminOwners,
    icon: Building2,
    roles: ['ADMIN'],
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
