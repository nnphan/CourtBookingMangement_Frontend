import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, DollarSign, Clock, MapPin, Activity } from 'lucide-react';
import type { Customer } from '../types/customer';
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

  const stats = [
    {
      icon: Calendar,
      label: t('customer.stats.totalBookings', 'Tổng số lượt đặt'),
      value: `${customer.totalBookings} lượt`,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      icon: DollarSign,
      label: t('customer.stats.totalRevenue', 'Tổng chi tiêu'),
      value: formattedRevenue,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      icon: Clock,
      label: t('customer.stats.lastBookingDate', 'Lần đặt gần nhất'),
      value: formattedLastDate,
      color: 'text-amber-600 bg-amber-50',
    },
    {
      icon: MapPin,
      label: t('customer.stats.favoriteCourt', 'Sân yêu thích'),
      value: customer.favoriteCourt || 'Sân 1',
      color: 'text-purple-600 bg-purple-50',
    },
    {
      icon: Activity,
      label: t('customer.stats.frequency', 'Tần suất chơi'),
      value: customer.bookingFrequency || 'Chưa xác định',
      color: 'text-rose-600 bg-rose-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
      {stats.map((item, index) => {
        const Icon = item.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-500 truncate">
                {item.label}
              </span>
              <div className={`p-2 rounded-xl ${item.color}`}>
                <Icon className="size-4" />
              </div>
            </div>
            <p className="font-extrabold text-base sm:text-lg text-slate-900 truncate">
              {item.value}
            </p>
          </div>
        );
      })}
    </div>
  );
});

CustomerStatsCard.displayName = 'CustomerStatsCard';
