import { useTranslation } from 'react-i18next';
import { useSocket } from '@/hooks/useSocket';
import { queryClient, queryKeys } from '@/lib/query-client';

export const BookingsPage = () => {
  const { t } = useTranslation();

  useSocket({
    'booking:updated': () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
    },
  });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">{t('nav.bookings')}</h2>
      <p className="text-content-secondary">
        Lịch đặt sân cập nhật theo thời gian thực qua Socket.IO.
      </p>
    </div>
  );
};

export default BookingsPage;
