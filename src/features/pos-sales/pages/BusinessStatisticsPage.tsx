import { useState, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, CalendarDays, LayoutGrid, ShoppingBag } from 'lucide-react';
import { useSearchParams } from 'react-router';
import { paths } from '@/app/router/paths';
import { BranchSelector } from '@/components/branches/BranchSelector';
import { businessStatisticsTitle } from '@/components/layout/management-navigation';
import { Button } from '@/components/ui/button';
import { PosWorkspaceTabs } from '../components/PosWorkspaceShell';
import { BusinessStatisticsContent } from '../components/BusinessStatisticsContent';
import { datePresets, formatDate, getPresetRange, statisticsApi, type DatePreset, type DateRange } from '../business-statistics';

const allBranches = 'all';
const localTimeZone = 'Asia/Bangkok';

const tabs = [
  { id: 'overview', label: 'Tổng quan', icon: LayoutGrid },
  { id: 'bookings', label: 'Đặt sân', icon: CalendarDays },
  { id: 'sales', label: 'Bán hàng', icon: ShoppingBag },
  { id: 'revenue', label: 'Doanh thu & lợi nhuận', icon: BarChart3 },
] as const;

export type StatisticsTab = (typeof tabs)[number]['id'];

const BusinessStatisticsPage = () => {
  const [params] = useSearchParams();
  const tab = tabs.find(({ id }) => id === params.get('tab'))?.id ?? 'overview';
  const [choice, setChoice] = useState('');
  const [preset, setPreset] = useState<DatePreset>('month');
  const [applied, setApplied] = useState<DateRange | null>(null);
  const [draft, setDraft] = useState<DateRange>({ from: '', to: '' });
  const [rangeError, setRangeError] = useState('');
  const branches = useQuery({ queryKey: ['business-statistics', 'branches'], queryFn: statisticsApi.branches });
  const available = branches.data ?? [];
  const owned = available.filter((branch) => branch.isOwner);
  const canSeeAll = owned.length > 0;
  const selectedBranch = available.find((branch) => branch.id === choice);
  const selected = selectedBranch?.id ?? (canSeeAll ? allBranches : available[0]?.id ?? '');
  const selectedDetails = available.find((branch) => branch.id === selected);
  const range = (preset === 'custom' && applied) || getPresetRange(
    preset === 'custom' ? 'month' : preset, selectedDetails?.timeZone ?? localTimeZone,
  );
  const report = useQuery({
    queryKey: ['business-statistics', 'report', selected, range.from, range.to],
    queryFn: () => statisticsApi.report(selected === allBranches ? undefined : selected, range),
    enabled: !!selected,
  });

  const selectPreset = (value: DatePreset) => {
    if (value === 'custom' && preset !== 'custom') {
      setDraft(range);
      setApplied(range);
    }
    setRangeError('');
    setPreset(value);
  };

  const applyRange = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const days = (Date.parse(draft.to) - Date.parse(draft.from)) / 86_400_000;
    if (!Number.isFinite(days) || days < 0 || days > 365) {
      setRangeError('Chọn khoảng thời gian hợp lệ và tối đa 366 ngày.');
      return;
    }
    setRangeError('');
    setApplied(draft);
  };

  return (
    <div className="pos-workspace min-w-0 space-y-4 py-4 sm:py-5">
      <header className="border-line bg-surface flex flex-wrap items-end justify-between gap-4 rounded-xl border p-4 lg:px-6">
        <h1 className="text-2xl font-black text-slate-950 sm:text-3xl">{businessStatisticsTitle}</h1>
        <div className="w-full sm:w-80">
          <p className="mb-1.5 text-sm font-semibold text-slate-700">{canSeeAll ? 'Chi nhánh' : 'Chi nhánh đang quản lý'}</p>
          <BranchSelector
            aria-label="Chi nhánh thống kê"
            branches={canSeeAll ? [{ id: allBranches, name: 'Tất cả chi nhánh' }, ...available] : available}
            value={selected}
            onChange={setChoice}
            disabled={!canSeeAll && available.length <= 1}
            isLoading={branches.isPending}
            isError={branches.isError}
            onRetry={() => void branches.refetch()}
          />
        </div>
      </header>

      <PosWorkspaceTabs
        ariaLabel={businessStatisticsTitle}
        tabs={tabs.map((item) => ({ ...item, active: tab === item.id, to: `${paths.posDashboard}?tab=${item.id}` }))}
        stretch
      />

      <section className="border-line bg-surface rounded-xl border p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-slate-900">Khoảng thời gian</h2>
            <p className="mt-1 text-sm text-slate-600">{formatDate(range.from)} – {formatDate(range.to)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(Object.entries(datePresets) as Array<[DatePreset, string]>).map(([id, label]) => (
              <Button key={id} size="sm" variant={preset === id ? 'primary' : 'outline'}
                aria-pressed={preset === id} onClick={() => selectPreset(id)}>{label}</Button>
            ))}
          </div>
        </div>
        {preset === 'custom' && (
          <form onSubmit={applyRange} className="mt-4 flex flex-wrap items-end gap-3">
            <label className="text-sm font-semibold text-slate-700">
              Từ ngày
              <input className="mt-1 block rounded-lg border border-slate-300 bg-white px-3 py-2" type="date" required
                value={draft.from} onChange={(event) => setDraft({ ...draft, from: event.target.value })} />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              Đến ngày
              <input className="mt-1 block rounded-lg border border-slate-300 bg-white px-3 py-2" type="date" required
                value={draft.to} onChange={(event) => setDraft({ ...draft, to: event.target.value })} />
            </label>
            <Button type="submit">Áp dụng</Button>
            {rangeError && <p role="alert" className="w-full text-sm text-red-700">{rangeError}</p>}
          </form>
        )}
      </section>

      {selected && report.isPending && <p role="status" className="p-6 text-center text-slate-600">Đang tải thống kê…</p>}
      {report.isError && (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
          Không tải được dữ liệu thống kê.
          <Button variant="outline" onClick={() => void report.refetch()}>Thử lại</Button>
        </div>
      )}
      {branches.isSuccess && !selected && <p className="p-6 text-center text-slate-600">Bạn chưa có chi nhánh được cấp quyền xem thống kê.</p>}
      {report.data && !report.isError && (
        <BusinessStatisticsContent
          data={report.data}
          range={range}
          tab={tab}
          branches={selected === allBranches ? owned : selectedDetails ? [selectedDetails] : []}
          scopeLabel={selectedDetails?.name ?? 'Tất cả chi nhánh'}
          orderBranch={selectedDetails?.id ?? (owned.length === 1 ? owned[0].id : undefined)}
        />
      )}
    </div>
  );
};

export default BusinessStatisticsPage;
