import type { ReactNode } from 'react';
import { Download } from 'lucide-react';
import { Link } from 'react-router';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { paths } from '@/app/router/paths';
import { useAuthorization } from '@/features/auth/authorization';
import { PERMISSIONS } from '@/shared/constants/permissions';
import { downloadStatistics } from '../business-statistics-export';
import {
  buildDailySeries, formatDate, formatMoney, formatNumber, formatPercent, percent, sum,
  type BusinessStatistics, type DateRange, type StatisticsBranch,
} from '../business-statistics';
import type { StatisticsTab } from '../pages/BusinessStatisticsPage';

type Metric = [label: string, value: string];

const panel = 'border-line bg-surface min-w-0 rounded-xl border p-4 sm:p-5';
const muted = 'text-sm text-slate-600';
const noData = <p className={muted}>Chưa có dữ liệu trong khoảng thời gian này.</p>;
const hours = (value: number) => `${formatNumber(value)} giờ`;

const Panel = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className={panel}>
    <h2 className="mb-4 text-lg font-bold text-slate-900">{title}</h2>
    {children}
  </section>
);

const Metrics = ({ items }: { items: Metric[] }) => (
  <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
    {items.map(([label, value]) => (
      <div key={label} className="border-line bg-surface rounded-xl border p-4">
        <dt className="text-sm font-semibold text-slate-600">{label}</dt>
        <dd className="mt-2 text-lg font-black text-emerald-800 sm:text-2xl">{value}</dd>
      </div>
    ))}
  </dl>
);

const DataTable = ({ columns, rows }: { columns: string[]; rows: ReactNode[][] }) => (
  rows.length ? (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-slate-50 text-slate-700">
          <tr>{columns.map((column) => <th key={column} scope="col" className="px-3 py-2.5">{column}</th>)}</tr>
        </thead>
        <tbody>{rows.map((row, rowIndex) => (
          <tr key={rowIndex}>{row.map((value, index) => (
            <td key={columns[index]} className="border-t border-slate-100 px-3 py-2.5 text-slate-800">{value}</td>
          ))}</tr>
        ))}</tbody>
      </table>
    </div>
  ) : noData
);

const Bars = ({ rows }: { rows: Array<{ label: string; value: number | null; detail?: string }> }) => (
  rows.length ? (
    <ul className="space-y-3">
      {rows.map(({ label, value, detail }, index) => (
        <li key={`${label}-${index}`}>
          <div className="mb-1 flex flex-wrap justify-between gap-1 text-sm">
            <span className="font-semibold text-slate-800">{label}</span>
            <span className="text-slate-600">{detail ? `${detail} · ` : ''}{formatPercent(value)}</span>
          </div>
          <div aria-hidden="true" className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-emerald-600" style={{ width: `${Math.min(value ?? 0, 100)}%` }} />
          </div>
        </li>
      ))}
    </ul>
  ) : noData
);

const DailyChart = ({ series, bookingsOnly }: {
  series: ReturnType<typeof buildDailySeries>; bookingsOnly: boolean;
}) => (
  <Panel title={bookingsOnly ? 'Doanh thu đặt sân theo thời gian' : 'Doanh thu theo thời gian'}>
    {series.some((day) => (bookingsOnly ? day.bookingRevenue : day.total) > 0) ? (
      <div className="h-64 w-full sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series} margin={{ left: 8, right: 12, top: 10 }}>
            <CartesianGrid stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="date" minTickGap={26} tick={{ fontSize: 11 }} tickFormatter={(date: string) => formatDate(date).slice(0, 5)} />
            <YAxis width={76} tick={{ fontSize: 11 }} tickFormatter={formatNumber} />
            <Tooltip labelFormatter={(date: string) => formatDate(date)} formatter={(value: number) => formatMoney(value)} />
            <Legend />
            <Line type="linear" dataKey="bookingRevenue" name="Đặt sân" stroke="#047857" strokeWidth={2} dot={series.length < 32} />
            {!bookingsOnly && <Line type="linear" dataKey="salesRevenue" name="Bán hàng" stroke="#2563eb" strokeWidth={2} dot={series.length < 32} />}
            {!bookingsOnly && <Line type="linear" dataKey="total" name="Tổng doanh thu" stroke="#7c3aed" strokeWidth={2} dot={false} />}
          </LineChart>
        </ResponsiveContainer>
      </div>
    ) : <p className={muted}>Chưa phát sinh doanh thu trong khoảng thời gian này.</p>}
  </Panel>
);

export const BusinessStatisticsContent = ({ data, range, tab, branches, scopeLabel, orderBranch }: {
  data: BusinessStatistics;
  range: DateRange;
  tab: StatisticsTab;
  branches: StatisticsBranch[];
  scopeLabel: string;
  orderBranch?: string;
}) => {
  const { hasPermission } = useAuthorization();
  const bookingRevenue = sum(data.bookingDays, (day) => day.revenue);
  const salesRevenue = sum(data.salesDays, (day) => day.revenue);
  const totalRevenue = bookingRevenue + salesRevenue;
  const completedBookings = sum(data.bookingDays, (day) => day.completedCount);
  const bookings = sum(data.bookingDays, (day) => day.bookingCount);
  const cancelled = sum(data.bookingDays, (day) => day.cancelledCount);
  const usedHours = sum(data.bookingDays, (day) => day.usedHours);
  const bookedHours = sum(data.bookingDays, (day) => day.bookedHours);
  const occupancy = percent(usedHours, sum(data.courts, (court) => court.availableHours));
  const orders = sum(data.salesDays, (day) => day.orderCount);
  const units = sum(data.products, (product) => product.quantity);
  const cost = (orders > 0 && data.products.length === 0) || data.products.some((product) => product.cost === null)
    ? null : sum(data.products, (product) => product.cost ?? 0);
  const profit = cost === null ? null : salesRevenue - cost;
  const margin = profit === null ? null : percent(profit, salesRevenue);
  const daily = buildDailySeries(data, range);
  const revenueMetrics: Metric[] = [
    ['Tổng doanh thu', formatMoney(totalRevenue)], ['Doanh thu đặt sân', formatMoney(bookingRevenue)],
    ['Doanh thu bán hàng', formatMoney(salesRevenue)], ['Lợi nhuận bán hàng ước tính', profit === null ? '—' : formatMoney(profit)],
  ];
  const branchName = (id: string) => branches.find((branch) => branch.id === id)?.name ?? '';
  const sourceRows = [
    { label: 'Đặt sân', value: percent(bookingRevenue, totalRevenue), detail: formatMoney(bookingRevenue) },
    { label: 'Bán hàng', value: percent(salesRevenue, totalRevenue), detail: formatMoney(salesRevenue) },
  ];
  const courtRows = data.courts.map((court) => ({
    label: branches.length > 1 ? `${branchName(court.branchId)} · ${court.courtName}` : court.courtName,
    value: percent(court.usedHours, court.availableHours),
    detail: hours(court.usedHours),
  }));
  const categoryRevenue = new Map<string, number>();
  for (const product of data.products) {
    categoryRevenue.set(product.category, (categoryRevenue.get(product.category) ?? 0) + product.revenue);
  }
  const categoryRows = [...categoryRevenue.entries()].sort((a, b) => b[1] - a[1]).map(([category, revenue]) => ({
    label: category, value: percent(revenue, salesRevenue), detail: formatMoney(revenue),
  }));
  const branchRows = branches.map((branch) => {
    const booking = sum(data.bookingDays.filter((row) => row.branchId === branch.id), (row) => row.revenue);
    const sales = sum(data.salesDays.filter((row) => row.branchId === branch.id), (row) => row.revenue);
    return { name: branch.name, booking, sales, total: booking + sales };
  }).sort((a, b) => b.total - a.total);

  const exportReport = (format: 'excel' | 'csv') => downloadStatistics({
    'Tổng quan': [
      ['Chi nhánh', scopeLabel], ['Từ ngày', formatDate(range.from)], ['Đến ngày', formatDate(range.to)],
      ['Tổng doanh thu', totalRevenue], ['Doanh thu đặt sân', bookingRevenue], ['Doanh thu bán hàng', salesRevenue],
      ['Giá vốn hàng bán ước tính', cost], ['Lợi nhuận bán hàng ước tính', profit], ['Biên lợi nhuận bán hàng', formatPercent(margin)],
      ['Số lượt đặt sân', bookings], ['Lượt hoàn thành', completedBookings], ['Lượt hủy', cancelled],
      ['Giờ đã đặt', bookedHours], ['Giờ sử dụng', usedHours], ['Số đơn bán hàng', orders],
      ['Số sản phẩm đã bán', units], ['Tỷ lệ sử dụng sân', formatPercent(occupancy)],
    ],
    'Theo ngày': [
      ['Ngày', 'Lượt đặt', 'Đơn bán hàng', 'Doanh thu đặt sân', 'Doanh thu bán hàng', 'Tổng doanh thu'],
      ...daily.map((day) => [formatDate(day.date), day.bookingCount, day.orderCount, day.bookingRevenue, day.salesRevenue, day.total]),
    ],
    'Theo chi nhánh': [
      ['Chi nhánh', 'Doanh thu đặt sân', 'Doanh thu bán hàng', 'Tổng doanh thu'],
      ...branchRows.map((branch) => [branch.name, branch.booking, branch.sales, branch.total]),
    ],
    'Sử dụng sân': [
      ['Chi nhánh', 'Sân', 'Giờ sử dụng', 'Giờ hoạt động', 'Tỷ lệ sử dụng'],
      ...data.courts.map((court) => [branchName(court.branchId), court.courtName, court.usedHours, court.availableHours,
        formatPercent(percent(court.usedHours, court.availableHours))]),
    ],
    'Khung giờ cao điểm': [
      ['Khung giờ', 'Lượt đặt', 'Doanh thu'],
      ...data.peakSlots.map((slot) => [slot.slot, slot.bookingCount, slot.revenue]),
    ],
    'Sản phẩm': [
      ['Sản phẩm', 'Danh mục', 'Số lượng bán', 'Doanh thu', 'Giá vốn ước tính'],
      ...data.products.map((product) => [product.productName, product.category, product.quantity, product.revenue, product.cost]),
    ],
  }, format, `thong-ke-kinh-doanh-${range.from}-${range.to}`);

  const productsTable = (limit: number) => (
    <DataTable columns={['Sản phẩm', 'Danh mục', 'Số lượng bán', 'Doanh thu']}
      rows={data.products.slice(0, limit).map((product) => [
        product.productName, product.category, formatNumber(product.quantity), formatMoney(product.revenue),
      ])} />
  );
  const peakTable = (
    <DataTable columns={['Khung giờ', 'Lượt đặt', 'Doanh thu']}
      rows={data.peakSlots.map((slot) => [slot.slot, formatNumber(slot.bookingCount), formatMoney(slot.revenue)])} />
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-end gap-2">
        <details className="relative">
          <summary className="border-line bg-surface flex cursor-pointer list-none items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold text-slate-700">
            <Download className="size-4" /> Xuất báo cáo
          </summary>
          <div className="border-line bg-surface absolute right-0 z-10 mt-1 grid min-w-36 rounded-lg border p-1 shadow-md">
            <button type="button" onClick={() => exportReport('excel')} className="rounded px-3 py-2 text-left text-sm hover:bg-emerald-50">Xuất Excel</button>
            <button type="button" onClick={() => exportReport('csv')} className="rounded px-3 py-2 text-left text-sm hover:bg-emerald-50">Xuất CSV</button>
          </div>
        </details>
      </div>

      {tab === 'overview' && <>
        <Metrics items={[...revenueMetrics, ['Lượt đặt sân hoàn thành', formatNumber(completedBookings)],
          ['Giờ sử dụng sân', hours(usedHours)], ['Đơn bán hàng', formatNumber(orders)], ['Tỷ lệ sử dụng sân', formatPercent(occupancy)]]} />
        <DailyChart series={daily} bookingsOnly={false} />
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Doanh thu theo nguồn"><Bars rows={sourceRows} /></Panel>
          <Panel title="Tình hình sử dụng sân"><Bars rows={courtRows} /></Panel>
          <Panel title="Sản phẩm bán chạy">{productsTable(5)}</Panel>
          <Panel title="Khung giờ cao điểm">{peakTable}</Panel>
        </div>
      </>}

      {tab === 'bookings' && <>
        <Metrics items={[
          ['Số lượt đặt sân', formatNumber(bookings)], ['Số lượt hoàn thành', formatNumber(completedBookings)],
          ['Số lượt hủy', formatNumber(cancelled)], ['Tổng giờ đã đặt', hours(bookedHours)],
          ['Doanh thu đặt sân', formatMoney(bookingRevenue)], ['Tỷ lệ sử dụng sân', formatPercent(occupancy)],
        ]} />
        <DailyChart series={daily} bookingsOnly />
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Tỷ lệ sử dụng từng sân">
            <Bars rows={courtRows} />
            <p className="mt-3 text-xs text-slate-600">Tỷ lệ tính theo giờ sân đã sử dụng trên giờ mở cửa đã qua, dựa vào lịch mở cửa đang cấu hình.</p>
          </Panel>
          <Panel title="Khung giờ được đặt nhiều nhất">{peakTable}</Panel>
        </div>
      </>}

      {tab === 'sales' && <>
        <Metrics items={[
          ['Số đơn bán hàng', formatNumber(orders)], ['Doanh thu bán hàng', formatMoney(salesRevenue)],
          ['Số sản phẩm đã bán', formatNumber(units)], ['Giá trị đơn trung bình', orders ? formatMoney(salesRevenue / orders) : '—'],
        ]} />
        {hasPermission(PERMISSIONS.SALES_VIEW) && (
          <Link to={orderBranch ? `${paths.posOrders}?branchId=${orderBranch}` : paths.posOrders} className="inline-flex font-semibold text-emerald-800 underline">
            Xem chi tiết đơn bán hàng
          </Link>
        )}
        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <Panel title="Sản phẩm bán chạy">{productsTable(10)}</Panel>
          <Panel title="Doanh thu theo danh mục"><Bars rows={categoryRows} /></Panel>
        </div>
      </>}

      {tab === 'revenue' && <>
        <Metrics items={[...revenueMetrics, ['Giá vốn hàng bán ước tính', cost === null ? '—' : formatMoney(cost)],
          ['Biên lợi nhuận bán hàng', formatPercent(margin)]]} />
        <Panel title="Doanh thu theo nguồn">
          <Bars rows={sourceRows} />
          <p className="mt-4 text-sm text-slate-600">
            {cost === null
              ? 'Chưa đủ dữ liệu giá vốn hoặc chi tiết hoàn trả để tính lợi nhuận bán hàng.'
              : 'Giá vốn ước tính theo giá nhập gần nhất đã ghi sổ trước khi bán.'}
            {' '}Doanh thu đặt sân được ghi riêng. Báo cáo chưa có dữ liệu chi phí vận hành sân để tính lợi nhuận ròng.
          </p>
        </Panel>
      </>}

      {branches.length > 1 && (tab === 'overview' || tab === 'revenue') && (
        <Panel title="So sánh chi nhánh">
          <DataTable columns={['Chi nhánh', 'Doanh thu đặt sân', 'Doanh thu bán hàng', 'Tổng doanh thu']}
            rows={branchRows.map((row) => [row.name, formatMoney(row.booking), formatMoney(row.sales), formatMoney(row.total)])} />
        </Panel>
      )}

      <details className={panel}>
        <summary className="cursor-pointer font-bold text-slate-900">Chi tiết theo ngày</summary>
        <div className="mt-3">
          <DataTable columns={['Ngày', 'Lượt đặt', 'Đơn bán hàng', 'Doanh thu đặt sân', 'Doanh thu bán hàng', 'Tổng doanh thu']}
            rows={daily.map((day) => [formatDate(day.date), formatNumber(day.bookingCount), formatNumber(day.orderCount),
              formatMoney(day.bookingRevenue), formatMoney(day.salesRevenue), formatMoney(day.total)])} />
        </div>
      </details>
    </div>
  );
};
