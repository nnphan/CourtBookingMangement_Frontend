import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StatisticsMetrics, StatisticsPanel, StatisticsTable } from './BusinessStatisticsLayout';
import { ExpensePanel } from './BusinessExpensePanel';
import {
  buildDailySeries, expenseCategories, formatDate, formatMoney, formatNumber, formatPercent, percent,
  statisticsApi, sum, summarizeFinance, type BusinessStatistics, type DateRange, type StatisticsBranch,
} from '../business-statistics';
import { downloadStatistics } from '../business-statistics-export';
import type { StatisticsTab } from '../pages/BusinessStatisticsPage';

const hours = (value: number) => formatNumber(value) + ' giờ';
const money = (value: number | null) => value === null ? 'Chưa đủ dữ liệu' : formatMoney(value);
const time = (value: string) => value.slice(0, 5);
const bookingStatuses: Record<string, string> = {
  COMPLETED: 'Hoàn thành', CANCELLED: 'Đã hủy', CONFIRMED: 'Đã xác nhận',
  CHECKED_IN: 'Đã nhận sân', PENDING: 'Đang chờ', HELD: 'Đang giữ chỗ',
  PENDING_PAYMENT: 'Chờ thanh toán', PAYMENT_PENDING: 'Chờ thanh toán',
};
const paymentMethods: Record<string, string> = {
  CASH: 'Tiền mặt', BANK_TRANSFER: 'Chuyển khoản', ONLINE: 'Trực tuyến', QR: 'Mã QR',
};

const Bars = ({ rows }: { rows: Array<{ label: string; value: number | null; detail: string }> }) => (
  <ul className="space-y-3">
    {rows.map(({ label, value, detail }) => (
      <li key={label}>
        <div className="mb-1 flex justify-between gap-2 text-sm"><span>{label}</span><strong>{detail}</strong></div>
        <div className="h-2 rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-emerald-600" style={{ width: Math.max(0, Math.min(100, value ?? 0)) + '%' }} />
        </div>
      </li>
    ))}
  </ul>
);

type Detail = { date: string; type: 'booking' } | { date: string; type: 'sales'; productId: string; name: string };

const DetailDialog = ({ detail, branchId, onClose }: { detail: Detail; branchId?: string; onClose: () => void }) => {
  const [keyword, setKeyword] = useState('');
  const booking = useQuery({
    queryKey: ['business-statistics', 'booking-details', branchId, detail.date],
    queryFn: () => statisticsApi.bookingDetails(detail.date, branchId),
    enabled: detail.type === 'booking',
  });
  const sale = useQuery({
    queryKey: ['business-statistics', 'sales-details', branchId, detail.date, detail.type === 'sales' ? detail.productId : ''],
    queryFn: () => statisticsApi.salesDetails(detail.date, detail.type === 'sales' ? detail.productId : '', branchId),
    enabled: detail.type === 'sales',
  });
  const request = detail.type === 'booking' ? booking : sale;
  const normalize = (value: string) => value.toLocaleLowerCase('vi').normalize('NFD').replace(/\p{M}/gu, '').replace(/đ/g, 'd');
  const search = normalize(keyword.trim());
  const bookings = (booking.data ?? []).filter((row) =>
    [row.bookingCode, row.customer, row.court, bookingStatuses[row.status] ?? row.status]
      .some((value) => normalize(value).includes(search)));

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-h-[90vh] w-[96vw] max-w-6xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{detail.type === 'booking' ? 'Chi tiết đặt sân' : 'Chi tiết bán hàng'}</DialogTitle>
          <DialogDescription>
            {formatDate(detail.date)}{detail.type === 'sales' && (' · ' + detail.name + ' · Thành tiền theo đơn giá và số lượng.')}
          </DialogDescription>
        </DialogHeader>
        {detail.type === 'booking' && (
          <input aria-label="Tìm lượt đặt sân" placeholder="Tìm theo mã đặt sân, khách hàng, sân hoặc trạng thái"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" value={keyword}
            onChange={(event) => setKeyword(event.target.value)} />
        )}
        {request.isPending && <p role="status" className="text-sm text-slate-600">Đang tải chi tiết…</p>}
        {request.isError && <div role="alert" className="flex items-center justify-between gap-3 text-sm text-red-700">
          Không tải được chi tiết. <Button variant="outline" onClick={() => void request.refetch()}>Thử lại</Button>
        </div>}
        {request.isSuccess && (detail.type === 'booking' ? (
          <StatisticsTable columns={['Ngày', 'Mã đặt sân', 'Sân', 'Khách hàng', 'Khung giờ', 'Tổng tiền', 'Phương thức thanh toán', 'Trạng thái']}
            empty={search ? 'Không tìm thấy lượt đặt sân phù hợp.' : undefined}
            rows={bookings.map((row) => ({ key: row.id, cells: [formatDate(row.date), row.bookingCode, row.court, row.customer || '—',
              time(row.startTime) + ' – ' + time(row.endTime), money(row.amount),
              (paymentMethods[row.paymentMethod] ?? row.paymentMethod) || '—', bookingStatuses[row.status] ?? row.status] }))} />
        ) : (
          <StatisticsTable columns={['Ngày', 'Mã đơn hàng', 'Danh mục', 'Sản phẩm', 'Đơn vị', 'Số lượng', 'Đơn giá', 'Thành tiền']}
            rows={(sale.data ?? []).map((row) => ({ key: row.id, cells: [formatDate(row.date), row.orderCode, row.category,
              row.productName, row.unit, formatNumber(row.quantity), money(row.unitPrice), money(row.amount)] }))} />
        ))}
      </DialogContent>
    </Dialog>
  );
};

const financeColumns = ['Tổng doanh thu', 'Doanh thu đặt sân', 'Doanh thu bán hàng', 'Giá vốn',
  'Chi phí vận hành', 'Tổng chi phí', 'Lợi nhuận', 'Biên lợi nhuận'];

const financeValues = (finance: ReturnType<typeof summarizeFinance>) => [
  finance.revenue, finance.bookingRevenue, finance.salesRevenue, finance.cogs, finance.operating, finance.costs, finance.profit, finance.margin,
];
const financeCells = (finance: ReturnType<typeof summarizeFinance>) =>
  financeValues(finance).map((value, index) => index === 7 ? formatPercent(value) : money(value));

export const BusinessStatisticsContent = ({ data, range, tab, branches, scopeLabel, branchId, compareBranches }: {
  data: BusinessStatistics; range: DateRange; tab: StatisticsTab; branches: StatisticsBranch[];
  scopeLabel: string; branchId?: string; compareBranches: boolean;
}) => {
  const [detail, setDetail] = useState<Detail | null>(null);
  const daily = buildDailySeries(data, range);
  const finance = summarizeFinance(data);
  const comparison = compareBranches ? branches.map((branch) => ({ branch, totals: summarizeFinance(data, branch.id) })) : [];
  const bookedHours = sum(data.bookingDays, (row) => row.bookedHours);
  const usedHours = sum(data.bookingDays, (row) => row.usedHours);
  const bookingCount = sum(data.bookingDays, (row) => row.bookingCount);
  const completed = sum(data.bookingDays, (row) => row.completedCount);
  const orderCount = sum(data.salesDays, (row) => row.orderCount);
  const usage = percent(usedHours, sum(data.courts, (row) => row.availableHours));
  const financeNotes = <p className="mt-3 text-sm text-slate-600">
    Giá vốn ước tính theo giá nhập gần nhất tại thời điểm bán. Lợi nhuận dùng chi phí vận hành đã ghi nhận trong kỳ.
    Các chỉ số phụ thuộc vào giá vốn chỉ hiển thị khi có đủ dữ liệu.
  </p>;
  const branchNames = new Map(branches.map(({ id, name }) => [id, name]));
  const dailyProducts = new Map<string, BusinessStatistics['products'][number]>();
  const products = new Map<string, { key: string; name: string; quantity: number; revenue: number }>();
  for (const row of data.products) {
    const key = row.date + ':' + row.productId;
    const dailyProduct = dailyProducts.get(key);
    if (dailyProduct) {
      dailyProduct.quantity += row.quantity;
      dailyProduct.revenue += row.revenue;
    } else dailyProducts.set(key, { ...row });
    const product = products.get(row.productId);
    if (product) {
      product.quantity += row.quantity;
      product.revenue += row.revenue;
    } else products.set(row.productId, { key: row.productId, name: row.productName, quantity: row.quantity, revenue: row.revenue });
  }
  const totalProductQuantity = sum(data.products, (row) => row.quantity);
  const bestProducts = [...products.values()].sort((first, second) => second.quantity - first.quantity).slice(0, 5);
  const bestCourts = data.courts.map((row) => ({ ...row, usage: percent(row.usedHours, row.availableHours) }))
    .filter((row) => row.usage !== null)
    .sort((first, second) => (second.usage ?? 0) - (first.usage ?? 0)).slice(0, 5);

  const exportReport = (format: 'excel' | 'csv') => downloadStatistics({
    'Tổng hợp theo kỳ': [['Phạm vi', 'Từ ngày', 'Đến ngày', ...financeColumns],
      [scopeLabel, range.from, range.to, ...financeValues(finance)]],
    'Doanh thu theo ngày': [['Ngày', 'Đặt sân', 'Bán hàng', 'Tổng doanh thu'],
      ...daily.map((row) => [row.date, row.bookingRevenue, row.salesRevenue, row.total])],
    'Đặt sân theo ngày': [['Ngày', 'Số lượt đặt', 'Giờ đặt', 'Doanh thu'],
      ...daily.filter((row) => row.bookingCount > 0).map((row) => [row.date, row.bookingCount, row.bookedHours, row.bookingRevenue])],
    'Sản phẩm theo ngày': [['Ngày', 'Danh mục', 'Sản phẩm', 'Đơn vị', 'Số lượng', 'Doanh thu'],
      ...[...dailyProducts.values()].map((row) => [row.date, row.category, row.productName, row.unit, row.quantity, row.revenue])],
    'Chi phí vận hành': [['Ngày', 'Loại chi phí', 'Nội dung', 'Số tiền', 'Chi nhánh', 'Ghi chú'],
      ...data.expenses.map((row) => [row.date, expenseCategories[row.category], row.title, row.amount,
        branchNames.get(row.branchId) ?? '', row.notes])],
    ...(compareBranches ? { 'So sánh chi nhánh': [['Chi nhánh', ...financeColumns],
      ...comparison.map(({ branch, totals }) => [branch.name, ...financeValues(totals)])] } : {}),
  }, format, 'thong-ke-kinh-doanh-' + range.from + '-' + range.to);

  return (
    <div className="space-y-4">
      {(tab === 'overview' || tab === 'revenue') && <div className="flex flex-wrap justify-end gap-2">
        <Button size="sm" variant="outline" onClick={() => exportReport('excel')}>Xuất Excel</Button>
        <Button size="sm" variant="outline" onClick={() => exportReport('csv')}>Xuất CSV</Button>
      </div>}

      {tab === 'overview' && <>
        <StatisticsMetrics items={[
          ['Tổng doanh thu', money(finance.revenue)], ['Doanh thu đặt sân', money(finance.bookingRevenue)],
          ['Doanh thu bán hàng', money(finance.salesRevenue)], ['Lợi nhuận', money(finance.profit)],
          ['Lượt đặt sân hoàn thành', formatNumber(completed)], ['Số giờ sân đã sử dụng', hours(usedHours)],
          ['Số đơn bán hàng', formatNumber(orderCount)], ['Tỷ lệ sử dụng sân', formatPercent(usage)],
        ]} />
        <StatisticsPanel title="Doanh thu theo thời gian">
          <div className="h-64 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={daily} margin={{ top: 10, right: 15, bottom: 5, left: 12 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tickFormatter={(date: string) => formatDate(date).slice(0, 5)} minTickGap={24} />
                <YAxis width={72} tickFormatter={formatNumber} />
                <Tooltip formatter={(value) => money(Number(value))} labelFormatter={(date) => formatDate(String(date))} />
                <Line type="monotone" dataKey="total" name="Tổng doanh thu" stroke="#047857" strokeWidth={2} dot={daily.length === 1} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </StatisticsPanel>
        <div className="grid gap-4 lg:grid-cols-2">
          <StatisticsPanel title="Cơ cấu doanh thu">
            <Bars rows={[
              { label: 'Đặt sân', value: percent(finance.bookingRevenue, finance.revenue), detail: money(finance.bookingRevenue) },
              { label: 'Bán hàng', value: percent(finance.salesRevenue, finance.revenue), detail: money(finance.salesRevenue) },
            ]} />
          </StatisticsPanel>
          <StatisticsPanel title="Tỷ lệ sử dụng sân">
            <Bars rows={[{ label: 'Giờ sân đã sử dụng', value: usage, detail: formatPercent(usage) }]} />
          </StatisticsPanel>
          <StatisticsPanel title="Sân có tỷ lệ sử dụng cao">
            <StatisticsTable columns={['Sân', 'Chi nhánh', 'Giờ sử dụng', 'Tỷ lệ sử dụng']} rows={bestCourts.map((row, index) => ({
              key: String(index), cells: [row.courtName, branchNames.get(row.branchId), hours(row.usedHours), formatPercent(row.usage)],
            }))} />
          </StatisticsPanel>
          <StatisticsPanel title="Sản phẩm bán chạy">
            <StatisticsTable columns={['Sản phẩm', 'Số lượng', 'Doanh thu']} rows={bestProducts.map((row) => ({
              key: row.key, cells: [row.name, formatNumber(row.quantity), money(row.revenue)],
            }))} />
          </StatisticsPanel>
          <StatisticsPanel title="Khung giờ cao điểm">
            <StatisticsTable columns={['Khung giờ', 'Lượt đặt', 'Doanh thu']} rows={data.peakSlots.map((row) => ({
              key: row.slot, cells: [row.slot, formatNumber(row.bookingCount), money(row.revenue)],
            }))} />
          </StatisticsPanel>
          {compareBranches && <StatisticsPanel title="So sánh chi nhánh">
            <StatisticsTable columns={['Chi nhánh', 'Đặt sân', 'Bán hàng', 'Tổng doanh thu']} rows={comparison.map(({ branch, totals }) => ({
              key: branch.id, cells: [branch.name, money(totals.bookingRevenue), money(totals.salesRevenue), money(totals.revenue)],
            }))} />
          </StatisticsPanel>}
        </div>
        {financeNotes}
      </>}

      {tab === 'bookings' && <>
        <StatisticsMetrics items={[
          ['Tổng số lượt đặt sân', formatNumber(bookingCount)], ['Lượt hoàn thành', formatNumber(completed)],
          ['Lượt đã hủy', formatNumber(sum(data.bookingDays, (row) => row.cancelledCount))],
          ['Số giờ đã đặt', hours(bookedHours)], ['Doanh thu đặt sân', money(finance.bookingRevenue)],
          ['Tỷ lệ sử dụng sân', formatPercent(usage)],
        ]} />
        <StatisticsPanel title="Đặt sân theo ngày">
          <StatisticsTable columns={['Ngày', 'Số lượt đặt sân', 'Số giờ đặt', 'Doanh thu', 'Thao tác']}
            rows={daily.filter((row) => row.bookingCount > 0).map((row) => ({ key: row.date,
              cells: [formatDate(row.date), formatNumber(row.bookingCount), hours(row.bookedHours), money(row.bookingRevenue),
                <Button size="sm" variant="outline" aria-label={'Xem chi tiết đặt sân ngày ' + formatDate(row.date)}
                  onClick={() => setDetail({ type: 'booking', date: row.date })}>Xem chi tiết</Button>] }))} />
        </StatisticsPanel>
      </>}

      {tab === 'sales' && <>
        <StatisticsMetrics items={[
          ['Số đơn bán hàng', formatNumber(orderCount)], ['Doanh thu bán hàng', money(finance.salesRevenue)],
          ['Số lượng sản phẩm bán ra', formatNumber(totalProductQuantity)],
          ['Giá trị đơn hàng trung bình', money(orderCount ? finance.salesRevenue / orderCount : 0)],
        ]} />
        <StatisticsPanel title="Bán hàng theo ngày và sản phẩm">
          <p className="mb-3 text-sm text-slate-600">Doanh thu theo sản phẩm tính từ số lượng và đơn giá. KPI doanh thu lấy số tiền POS thực thu sau hoàn tiền.</p>
          <StatisticsTable columns={['Ngày', 'Danh mục', 'Sản phẩm', 'Đơn vị', 'Số lượng bán', 'Doanh thu', 'Thao tác']}
            rows={[...dailyProducts].map(([key, row]) => ({ key, cells: [formatDate(row.date), row.category, row.productName, row.unit,
              formatNumber(row.quantity), money(row.revenue),
              <Button size="sm" variant="outline" aria-label={'Xem chi tiết bán ' + row.productName + ' ngày ' + formatDate(row.date)}
                onClick={() => setDetail({ type: 'sales', date: row.date, productId: row.productId, name: row.productName })}>Xem chi tiết</Button>] }))} />
        </StatisticsPanel>
      </>}

      {tab === 'expenses' && <ExpensePanel expenses={data.expenses} branches={branches} branchId={branchId} range={range} />}

      {tab === 'revenue' && <>
        <StatisticsMetrics items={financeColumns.map((label, index) => [label, financeCells(finance)[index]])} />
        <StatisticsPanel title="Doanh thu theo ngày">
          <StatisticsTable columns={['Ngày', 'Doanh thu đặt sân', 'Doanh thu bán hàng', 'Tổng doanh thu']}
            rows={daily.map((row) => ({ key: row.date, cells: [formatDate(row.date), money(row.bookingRevenue), money(row.salesRevenue), money(row.total)] }))} />
        </StatisticsPanel>
        <StatisticsPanel title="Tổng hợp tài chính theo kỳ">
          <StatisticsTable columns={['Chỉ tiêu', 'Giá trị']} rows={financeCells(finance).map((value, index) => ({
            key: financeColumns[index], cells: [financeColumns[index], value],
          }))} />
          {financeNotes}
        </StatisticsPanel>
        {compareBranches && <StatisticsPanel title="So sánh hiệu quả kinh doanh theo chi nhánh">
          <StatisticsTable columns={['Chi nhánh', 'Doanh thu', ...financeColumns.slice(3)]}
            rows={comparison.map(({ branch, totals }) => ({ key: branch.id,
              cells: [branch.name, money(totals.revenue), ...financeCells(totals).slice(3)] }))} />
        </StatisticsPanel>}
      </>}

      {detail && <DetailDialog detail={detail} branchId={branchId} onClose={() => setDetail(null)} />}
    </div>
  );
};
