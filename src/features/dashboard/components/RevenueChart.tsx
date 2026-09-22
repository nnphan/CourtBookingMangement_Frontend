import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import dayjs from '@/lib/dayjs';

const sample = Array.from({ length: 7 }, (_, i) => ({
  day: dayjs().subtract(6 - i, 'day').format('DD/MM'),
  revenue: 1_200_000 + i * 340_000,
}));

export const RevenueChart = () => (
  <div className="rounded-[var(--radius-card)] bg-surface p-4 shadow-[var(--shadow-card)]">
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={sample}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" vertical={false} />
        <XAxis dataKey="day" tickLine={false} axisLine={false} />
        <YAxis
          tickFormatter={(v: number) => `${Math.round(v / 1_000_000)}tr`}
          tickLine={false}
          axisLine={false}
          width={44}
        />
        <Tooltip formatter={(v: number) => v.toLocaleString('vi-VN') + ' đ'} />
        <Bar dataKey="revenue" fill="var(--color-brand-600)" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);
