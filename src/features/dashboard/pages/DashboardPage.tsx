import {
  Building2,
  LayoutGrid,
  ShoppingBag,
  PackageOpen,
  BarChart3,
  GitBranch,
  KeyRound,
  Shield,
  UserCog,
  Users,
  Award,
} from 'lucide-react';
import { DashboardCard } from '@/features/dashboard/components/DashboardCard';
import { paths } from '@/app/router/paths';
import { useAuthorization } from '@/features/auth/authorization';
import { PERMISSIONS as P } from '@/shared/constants/permissions';

const cards = [
  {
    title: 'Trạng thái sân',
    icon: LayoutGrid,
    gradient: 'bg-gradient-status',
    path: paths.courtStatus,
    permission: P.COURT_VIEW,
  },
  {
    title: 'Quản lý chi nhánh',
    icon: Building2,
    gradient: 'bg-gradient-social',
    path: paths.adminBranches,
    permission: P.BRANCH_VIEW,
    adminOnly: true,
  },
  {
    title: 'Quản lý chủ sân',
    icon: Building2,
    gradient: 'bg-gradient-social',
    path: paths.adminOwners,
    adminOnly: true,
  },
  {
    title: 'Quản lý quyền',
    icon: KeyRound,
    gradient: 'bg-gradient-branch',
    path: paths.adminPermissions,
    adminOnly: true,
  },
  {
    title: 'Quản lý vai trò',
    icon: Shield,
    gradient: 'bg-gradient-member',
    path: paths.adminRoles,
    adminOnly: true,
  },
  {
    title: 'Quản lý User',
    icon: UserCog,
    gradient: 'bg-gradient-customer',
    path: paths.adminUsers,
    adminOnly: true,
  },
  {
    title: 'Bán hàng',
    icon: ShoppingBag,
    gradient: 'bg-gradient-sales',
    path: paths.posSales,
    permission: P.SALES_VIEW,
  },
  {
    title: 'Quản lý kho và dịch vụ',
    icon: PackageOpen,
    gradient: 'bg-gradient-inventory',
    path: paths.posInventory,
    permission: P.INVENTORY_VIEW,
  },
  {
    title: 'Doanh thu & lợi nhuận',
    icon: BarChart3,
    gradient: 'bg-gradient-revenue',
    path: paths.dashboard,
    permission: P.SALES_VIEW,
  },
  {
    title: 'Sản phẩm & danh mục',
    icon: GitBranch,
    gradient: 'bg-gradient-branch',
    path: paths.posProducts,
    permission: P.SALES_VIEW,
  },
  {
    title: 'Quản lý khách hàng',
    icon: Users,
    gradient: 'bg-gradient-customer',
    path: paths.customers,
    permission: P.CUSTOMER_VIEW,
  },
];

export const DashboardPage = () => {
  const { hasPermission, hasRole } = useAuthorization();
  return (
    <div className="h-full w-full pt-4 sm:pt-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {cards
          .filter(
            (card) =>
              (!('adminOnly' in card) || !card.adminOnly || hasRole('ADMIN')) &&
              (!('permission' in card) || !card.permission || hasPermission(card.permission)),
          )
          .map((card, i) => (
            <DashboardCard
              key={i}
              title={card.title}
              icon={card.icon}
              gradientClass={card.gradient}
              to={card.path}
            />
          ))}
      </div>
    </div>
  );
};

export default DashboardPage;
