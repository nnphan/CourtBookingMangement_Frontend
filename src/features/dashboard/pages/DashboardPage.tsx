import {
  Building2,
  LayoutGrid,
  ShoppingBag,
  PackageOpen,
  BarChart3,
  GitBranch,
  Users,
  Award,
} from 'lucide-react';
import { DashboardCard } from '@/features/dashboard/components/DashboardCard';
import { paths } from '@/app/router/paths';

const cards = [
  {
    title: 'Trạng thái sân',
    icon: LayoutGrid,
    gradient: 'bg-gradient-status',
    path: paths.courtStatus,
  },
  {
    title: 'Quản lý chi nhánh',
    icon: Building2,
    gradient: 'bg-gradient-social',
    path: paths.root,
  },
  { title: 'Bán hàng', icon: ShoppingBag, gradient: 'bg-gradient-sales', path: '#' },
  {
    title: 'Quản lý kho và dịch vụ',
    icon: PackageOpen,
    gradient: 'bg-gradient-inventory',
    path: '#',
  },
  {
    title: 'Doanh thu & lợi nhuận',
    icon: BarChart3,
    gradient: 'bg-gradient-revenue',
    path: paths.dashboard,
  },
  { title: 'Quản lý chi nhánh', icon: GitBranch, gradient: 'bg-gradient-branch', path: '#' },
  {
    title: 'Quản lý khách hàng',
    icon: Users,
    gradient: 'bg-gradient-customer',
    path: paths.customers,
  },
  { title: 'Hạng thành viên', icon: Award, gradient: 'bg-gradient-member', path: '#' },
];

export const DashboardPage = () => {
  return (
    <div className="h-full w-full pt-4 sm:pt-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {cards.map((card, i) => (
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
