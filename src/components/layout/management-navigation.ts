import {
  Building2, FileBarChart, KeyRound, LayoutGrid, PackageOpen, Shield, ShoppingBag, Tags, UserCog, UsersRound,
  type LucideIcon,
} from 'lucide-react';
import { paths } from '@/app/router/paths';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { getCurrentUserRole, type CurrentUserRole } from '@/shared/utils/current-user';

export const productCatalogTitle = 'Danh mục sản phẩm';
export const inventoryWorkspaceTitle = 'Quản lý kho hàng';
export const businessStatisticsTitle = 'Thống kê Kinh doanh';

interface ManagementItem {
  icon: LucideIcon;
  label: string;
  path: string;
  translationKey?: string;
  gradient: string;
  roles: readonly CurrentUserRole[];
}

const admin = ['admin'] as const;
const owner = ['branchOwner'] as const;
const branchOperators = ['branchOwner', 'branchManager'] as const;

const items: ManagementItem[] = [
  { icon: Building2, label: 'Quản lý chủ sân', path: paths.adminOwners, gradient: 'bg-gradient-social', roles: admin },
  { icon: KeyRound, label: 'Quản lý quyền', translationKey: 'navigation.permissions', path: paths.adminPermissions, gradient: 'bg-gradient-branch', roles: admin },
  { icon: Shield, label: 'Quản lý vai trò', translationKey: 'navigation.roles', path: paths.adminRoles, gradient: 'bg-gradient-member', roles: admin },
  { icon: UserCog, label: 'Quản lý người dùng', translationKey: 'userManagement.title', path: paths.adminUsers, gradient: 'bg-gradient-customer', roles: admin },
  { icon: LayoutGrid, label: 'Trạng thái sân', path: paths.courtStatus, gradient: 'bg-gradient-status', roles: branchOperators },
  { icon: Building2, label: 'Quản lý chi nhánh', path: paths.adminBranches, gradient: 'bg-gradient-social', roles: owner },
  { icon: ShoppingBag, label: 'POS / Bán hàng', path: paths.posSales, gradient: 'bg-gradient-sales', roles: branchOperators },
  { icon: Tags, label: productCatalogTitle, path: paths.posCategories, gradient: 'bg-gradient-branch', roles: owner },
  { icon: PackageOpen, label: inventoryWorkspaceTitle, path: paths.posInventory, gradient: 'bg-gradient-inventory', roles: branchOperators },
  { icon: FileBarChart, label: businessStatisticsTitle, path: paths.posDashboard, gradient: 'bg-gradient-revenue', roles: branchOperators },
  { icon: UsersRound, label: 'Hồ sơ ghép trận', translationKey: 'playerMatchingProfile.nav', path: paths.playerMatchingProfile, gradient: 'bg-gradient-member', roles: owner },
  { icon: UserCog, label: 'Quản lý nhân viên', translationKey: 'staffManagement.title', path: paths.staffManagement, gradient: 'bg-gradient-customer', roles: owner },
];

export const useManagementNavigation = () => {
  const user = useAuthStore((state) => state.user);
  const ready = useAuthStore((state) => state.hasHydrated && state.isAuthenticated());
  const role = getCurrentUserRole(user);
  return ready ? items.filter((item) => item.roles.includes(role)) : [];
};
