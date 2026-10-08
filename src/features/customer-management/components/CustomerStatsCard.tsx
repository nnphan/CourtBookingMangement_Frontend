import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, DollarSign, Clock, MapPin, Activity } from 'lucide-react';
import type { Customer } from '../types/customer';
import { StatCard, StatCardGrid } from '@/components/management';
import dayjs from '@/lib/dayjs';

interface CustomerStatsCardProps {
  customer: Customer;
}

export const CustomerStatsCard: React.FC<CustomerStatsCardProps> = memo(({ customer }) => {
  const { t } = useTranslation();

  const formattedRevenue = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(customer.totalRevenue);

  const formattedLastDate = customer.lastBookingDate
    ? dayjs(customer.lastBookingDate).format('DD/MM/YYYY')
    : 'Chưa có';

  return (
    <StatCardGrid className="lg:grid-cols-5">
      <StatCard
        compact
        icon={Calendar}
        tone="primary"
        label={t('customer.stats.totalBookings', 'Tổng số lượt đặt')}
        value={`${customer.totalBookings} lượt`}
      />
      <StatCard
        compact
        icon={DollarSign}
        tone="success"
        label={t('customer.stats.totalRevenue', 'Tổng chi tiêu')}
        value={formattedRevenue}
      />
      <StatCard
        compact
        icon={Clock}
        tone="warning"
        label={t('customer.stats.lastBookingDate', 'Lần đặt gần nhất')}
        value={formattedLastDate}
      />
      <StatCard
        compact
        icon={MapPin}
        tone="neutral"
        label={t('customer.stats.favoriteCourt', 'Sân yêu thích')}
        value={customer.favoriteCourt || 'Sân 1'}
      />
      <StatCard
        compact
        icon={Activity}
        tone="neutral"
        label={t('customer.stats.frequency', 'Tần suất chơi')}
        value={customer.bookingFrequency || 'Chưa xác định'}
      />
    </StatCardGrid>
  );
});

CustomerStatsCard.displayName = 'CustomerStatsCard';
