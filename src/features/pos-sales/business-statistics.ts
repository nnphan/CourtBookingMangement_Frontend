import { http } from '@/lib/axios';

export interface StatisticsBranch {
  id: string;
  name: string;
  timeZone: string;
  isOwner: boolean;
}

export interface DateRange {
  from: string;
  to: string;
}

export interface BusinessStatistics {
  bookingDays: Array<{
    branchId: string;
    date: string;
    bookingCount: number;
    completedCount: number;
    cancelledCount: number;
    bookedHours: number;
    usedHours: number;
    revenue: number;
  }>;
  salesDays: Array<{ branchId: string; date: string; orderCount: number; revenue: number }>;
  courts: Array<{ branchId: string; courtName: string; usedHours: number; availableHours: number }>;
  peakSlots: Array<{ slot: string; bookingCount: number; revenue: number }>;
  products: Array<{ productName: string; category: string; quantity: number; revenue: number; cost: number | null }>;
}

export const statisticsApi = {
  async branches() {
    const response = await http.get<{ data: StatisticsBranch[] }>('/business-statistics/branches');
    return response.data.data;
  },
  async report(branchId: string | undefined, range: DateRange) {
    const response = await http.get<{ data: BusinessStatistics }>('/business-statistics', {
      params: { ...range, branchId },
    });
    return response.data.data;
  },
};

export const datePresets = {
  today: 'Hôm nay',
  week: '7 ngày gần nhất',
  month: 'Tháng này',
  previous: 'Tháng trước',
  custom: 'Tùy chọn',
} as const;

export type DatePreset = keyof typeof datePresets;

const dateKey = (date: Date) => date.toISOString().slice(0, 10);

export const getPresetRange = (preset: Exclude<DatePreset, 'custom'>, timeZone: string): DateRange => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts();
  const year = Number(parts.find(({ type }) => type === 'year')?.value);
  const month = Number(parts.find(({ type }) => type === 'month')?.value) - 1;
  const day = Number(parts.find(({ type }) => type === 'day')?.value);
  const today = dateKey(new Date(Date.UTC(year, month, day)));
  switch (preset) {
    case 'today': return { from: today, to: today };
    case 'week': return { from: dateKey(new Date(Date.UTC(year, month, day - 6))), to: today };
    case 'month': return { from: dateKey(new Date(Date.UTC(year, month, 1))), to: today };
    case 'previous': return {
      from: dateKey(new Date(Date.UTC(year, month - 1, 1))),
      to: dateKey(new Date(Date.UTC(year, month, 0))),
    };
  }
};

export const sum = <T>(rows: readonly T[], select: (row: T) => number) =>
  rows.reduce((total, row) => total + select(row), 0);

export const formatNumber = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 }).format;
export const formatMoney = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format;
export const percent = (part: number, total: number) => total > 0 ? part / total * 100 : null;
export const formatPercent = (value: number | null) => value === null ? '—' : `${formatNumber(value)}%`;
export const formatDate = (date: string) => date.split('-').reverse().join('/');

export const buildDailySeries = ({ bookingDays, salesDays }: BusinessStatistics, range: DateRange) => {
  const dates = new Map<string, {
    date: string; bookingRevenue: number; salesRevenue: number; bookingCount: number; orderCount: number;
  }>();
  for (const cursor = new Date(range.from); dateKey(cursor) <= range.to; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
    const date = dateKey(cursor);
    dates.set(date, { date, bookingRevenue: 0, salesRevenue: 0, bookingCount: 0, orderCount: 0 });
  }

  for (const day of bookingDays) {
    const row = dates.get(day.date);
    if (!row) continue;
    row.bookingRevenue += day.revenue;
    row.bookingCount += day.bookingCount;
  }
  for (const day of salesDays) {
    const row = dates.get(day.date);
    if (!row) continue;
    row.salesRevenue += day.revenue;
    row.orderCount += day.orderCount;
  }
  return [...dates.values()].map((day) => ({ ...day, total: day.bookingRevenue + day.salesRevenue }));
};
