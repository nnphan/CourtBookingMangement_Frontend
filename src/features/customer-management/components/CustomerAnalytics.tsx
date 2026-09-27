import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { TrendingUp, Award, PieChart as PieIcon } from 'lucide-react';
import type { CustomerStatsOverview } from '../types/customer';
import { MEMBER_TYPE_CONFIG } from '../constants/customer-status';

interface CustomerAnalyticsProps {
  stats: CustomerStatsOverview;
}

export const CustomerAnalytics: React.FC<CustomerAnalyticsProps> = memo(({ stats }) => {
  const { t } = useTranslation();

  const pieColors: Record<string, string> = {
    bronze: '#b45309',
    silver: '#64748b',
    gold: '#eab308',
    platinum: '#9333ea',
    standard: '#10b981',
  };

  const topCustomersData = stats.topRevenueCustomers.map((c) => ({
    name: c.fullName.length > 12 ? `${c.fullName.slice(0, 12)}...` : c.fullName,
    fullName: c.fullName,
    revenue: c.totalRevenue,
    revenueFormatted: new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(c.totalRevenue),
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* 1. New Customer Trend (AreaChart) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="size-4" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-800">
                {t('customer.analytics.trendTitle', 'Tăng trưởng khách hàng mới')}
              </h4>
              <p className="text-[11px] text-slate-400">Số lượng đăng ký theo tháng</p>
            </div>
          </div>
        </div>

        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.monthlyTrend} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(val) => [`${val} khách hàng`, 'Khách mới']}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  fontSize: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#0d6838"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#trendGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Top Revenue Customers (BarChart) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Award className="size-4" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-800">
                {t('customer.analytics.topTitle', 'Top khách hàng chi tiêu')}
              </h4>
              <p className="text-[11px] text-slate-400">Doanh thu tích lũy cao nhất</p>
            </div>
          </div>
        </div>

        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topCustomersData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `${val / 1000000}tr`}
              />
              <Tooltip
                formatter={(val) => [
                  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(val)),
                  'Chi tiêu',
                ]}
                labelFormatter={(_, payload) => payload[0]?.payload?.fullName || ''}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  fontSize: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Member Distribution (Donut PieChart) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <PieIcon className="size-4" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-800">
                {t('customer.analytics.distributionTitle', 'Phân bổ hạng thành viên')}
              </h4>
              <p className="text-[11px] text-slate-400">Tỷ lệ theo từng hạng thẻ</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between h-48">
          <div className="size-40 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.memberDistribution}
                  dataKey="count"
                  nameKey="type"
                  innerRadius={36}
                  outerRadius={58}
                  paddingAngle={4}
                >
                  {stats.memberDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={pieColors[entry.type] || '#10b981'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, name) => [
                    `${val} khách`,
                    MEMBER_TYPE_CONFIG[name as CustomerStatsOverview['memberDistribution'][0]['type']]?.labelVi || name,
                  ]}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex-1 pl-2 space-y-1 text-xs">
            {stats.memberDistribution.map((item) => (
              <div key={item.type} className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-600 truncate">
                  <span
                    className="size-2 rounded-full shrink-0"
                    style={{ backgroundColor: pieColors[item.type] }}
                  />
                  <span className="truncate">{MEMBER_TYPE_CONFIG[item.type]?.labelVi || item.type}</span>
                </span>
                <span className="font-bold text-slate-800">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

CustomerAnalytics.displayName = 'CustomerAnalytics';
