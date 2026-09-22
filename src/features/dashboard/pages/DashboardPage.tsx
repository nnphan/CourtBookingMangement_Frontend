import { useTranslation } from 'react-i18next';
import { RevenueChart } from '@/features/dashboard/components/RevenueChart';

export const DashboardPage = () => {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">{t('nav.dashboard')}</h2>
      <RevenueChart />
    </div>
  );
};

export default DashboardPage;
