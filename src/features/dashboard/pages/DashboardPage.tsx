import { useTranslation } from 'react-i18next';
import { useManagementNavigation } from '@/components/layout/management-navigation';
import { DashboardCard } from '@/features/dashboard/components/DashboardCard';

export const DashboardPage = () => {
  const { t } = useTranslation();
  const items = useManagementNavigation();

  return (
    <div className="grid w-full grid-cols-1 gap-4 pt-4 sm:grid-cols-2 sm:pt-8 md:grid-cols-3 lg:grid-cols-4">
      {items.map(({ path, label, translationKey, icon, gradient }) => (
        <DashboardCard
          key={path}
          title={translationKey ? t(translationKey) : label}
          icon={icon}
          gradientClass={gradient}
          to={path}
        />
      ))}
    </div>
  );
};

export default DashboardPage;
