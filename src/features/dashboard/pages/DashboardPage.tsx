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
import { useTranslation } from 'react-i18next';
import { useStaffAccess } from '@/features/staff-management/hooks/useStaffManagement';

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
    title: 'Quản lý nhân viên',
    translationKey: 'staffManagement.title',
    descriptionKey: 'staffManagement.dashboardDescription',
    icon: UserCog,
    gradient: 'bg-gradient-customer',
    path: paths.staffManagement,
    requiresStaffAccess: true,
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
  const { t } = useTranslation();
  const staffAccess = useStaffAccess();
  const staffAccessFailed =
    staffAccess.isError && !('status' in staffAccess.error && staffAccess.error.status === 403);
  return (
    <div className="h-full w-full pt-4 sm:pt-8">
      {staffAccessFailed && (
        <div role="alert" className="mb-4">
          <p>{t('staffManagement.accessError')}</p>
          <button
            type="button"
            className="font-semibold text-emerald-700 underline"
            onClick={() => void staffAccess.refetch()}
          >
            {t('staffManagement.retry')}
          </button>
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {cards
          .filter(
            (card) =>
              (!('adminOnly' in card) || !card.adminOnly || hasRole('ADMIN')) &&
              (!('permission' in card) || !card.permission || hasPermission(card.permission)) &&
              (!('requiresStaffAccess' in card) ||
                !card.requiresStaffAccess ||
                (staffAccess.isSuccess && !staffAccess.isFetching)),
          )
          .map((card, i) => (
            <DashboardCard
              key={i}
              title={
                'translationKey' in card && card.translationKey
                  ? t(card.translationKey)
                  : card.title
              }
              description={
                'descriptionKey' in card && card.descriptionKey ? t(card.descriptionKey) : undefined
              }
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
