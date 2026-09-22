import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { courtsApi } from '@/features/courts/api/courts.api';
import { queryKeys } from '@/lib/query-client';

export const CourtsPage = () => {
  const { t } = useTranslation();
  const clubId = 'default';
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.courts.list(clubId),
    queryFn: () => courtsApi.list(clubId),
  });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">{t('nav.courts')}</h2>
      {isLoading ? <p className="text-content-secondary">{t('common.loading')}</p> : null}
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(data ?? []).map((court) => (
          <li
            key={court.id}
            className="rounded-[var(--radius-card)] bg-surface p-4 shadow-[var(--shadow-card)]"
          >
            <p className="font-semibold">{court.name}</p>
            <p className="text-sm text-content-secondary">
              {court.pricePerHour.toLocaleString('vi-VN')} đ/giờ
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CourtsPage;
