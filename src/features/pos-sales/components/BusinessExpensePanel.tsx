import { useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StatisticsMetrics, StatisticsPanel, StatisticsTable } from './BusinessStatisticsLayout';
import {
  expenseCategories, formatDate, formatMoney, getPresetRange, statisticsApi, sum,
  type BusinessExpense, type DateRange, type ExpenseCategory, type StatisticsBranch,
} from '../business-statistics';

const fieldClass = 'mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900';
type ExpenseAction = { mode: 'create' } | { mode: 'view' | 'edit' | 'delete'; expense: BusinessExpense };

export const ExpensePanel = ({ expenses, branches, branchId, range }: {
  expenses: BusinessExpense[]; branches: StatisticsBranch[]; branchId?: string; range: DateRange;
}) => {
  const [action, setAction] = useState<ExpenseAction | null>(null);
  const names = new Map(branches.map(({ id, name }) => [id, name]));
  const operating = sum(expenses, (expense) => expense.amount);
  const payroll = sum(expenses, (expense) => expense.category === 'payroll' ? expense.amount : 0);
  const utilities = sum(expenses, (expense) => ['electricity', 'water'].includes(expense.category) ? expense.amount : 0);
  return <>
    <StatisticsMetrics items={[
      ['Tổng chi phí vận hành', formatMoney(operating)], ['Chi phí nhân sự', formatMoney(payroll)],
      ['Chi phí điện, nước', formatMoney(utilities)], ['Chi phí khác', formatMoney(operating - payroll - utilities)],
    ]} />
    <StatisticsPanel title="Chi phí vận hành" action={
      <Button onClick={() => setAction({ mode: 'create' })}><Plus className="size-4" aria-hidden /> Thêm chi phí</Button>
    }>
      <StatisticsTable columns={['Ngày phát sinh', 'Loại chi phí', 'Nội dung', 'Số tiền', ...(!branchId ? ['Chi nhánh'] : []), 'Ghi chú', 'Thao tác']}
        rows={expenses.map((expense) => ({ key: expense.id, cells: [
          formatDate(expense.date), expenseCategories[expense.category], expense.title, formatMoney(expense.amount),
          ...(!branchId ? [names.get(expense.branchId)] : []), expense.notes || '—',
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setAction({ mode: 'view', expense })}>Xem</Button>
            <Button variant="outline" size="sm" onClick={() => setAction({ mode: 'edit', expense })}>Sửa</Button>
            <Button variant="outline" size="sm" onClick={() => setAction({ mode: 'delete', expense })}>Xóa</Button>
          </div>,
        ] }))} />
    </StatisticsPanel>
    {action && <ExpenseDialog action={action} branches={branches} range={range} onClose={() => setAction(null)} />}
  </>;
};

const ExpenseDialog = ({ action, branches, range, onClose }: {
  action: ExpenseAction; branches: StatisticsBranch[]; range: DateRange; onClose: () => void;
}) => {
  const current = 'expense' in action ? action.expense : undefined;
  const initialBranch = branches[0];
  const today = getPresetRange('today', initialBranch?.timeZone ?? 'Asia/Bangkok').from;
  const [date, setDate] = useState(current?.date ?? (today < range.from ? range.from : today > range.to ? range.to : today));
  const [branchId, setBranchId] = useState(current?.branchId ?? initialBranch?.id ?? '');
  const [category, setCategory] = useState<ExpenseCategory>(current?.category ?? 'electricity');
  const [title, setTitle] = useState(current?.title ?? '');
  const [amount, setAmount] = useState(current ? String(current.amount) : '');
  const [notes, setNotes] = useState(current?.notes ?? '');
  const cache = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => action.mode === 'delete'
      ? statisticsApi.deleteExpense(action.expense.id)
      : statisticsApi.saveExpense(current?.id, { branchId, date, category, title: title.trim(), amount: Number(amount), notes: notes.trim() || null }),
    onSuccess: async () => {
      await cache.invalidateQueries({ queryKey: ['business-statistics', 'report'] });
      onClose();
    },
  });
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!mutation.isPending && (action.mode === 'delete' || title.trim())) mutation.mutate();
  };
  const readOnly = action.mode === 'view';
  const labels = { create: 'Thêm chi phí', view: 'Chi tiết chi phí', edit: 'Sửa chi phí', delete: 'Xóa chi phí' };

  return <Dialog open onOpenChange={(open) => { if (!open && !mutation.isPending) onClose(); }}>
    <DialogContent className="max-h-[90vh] w-[96vw] max-w-xl overflow-y-auto" closeDisabled={mutation.isPending}>
      <DialogHeader>
        <DialogTitle>{labels[action.mode]}</DialogTitle>
        <DialogDescription>{action.mode === 'delete'
          ? 'Xóa khoản chi “' + action.expense.title + '” khỏi báo cáo kinh doanh?'
          : 'Chi phí vận hành được ghi nhận theo ngày phát sinh và chi nhánh.'}</DialogDescription>
      </DialogHeader>
      <form className="space-y-4" onSubmit={submit}>
        {action.mode !== 'delete' && <fieldset disabled={mutation.isPending || readOnly}
          className="grid gap-3 text-sm font-medium text-slate-700 sm:grid-cols-2">
          <label>Ngày phát sinh
            <input className={fieldClass} type="date" min="0001-01-02" max="9998-12-31" required value={date} onChange={(event) => setDate(event.target.value)} />
          </label>
          <label>Chi nhánh
            <select className={fieldClass} required value={branchId} onChange={(event) => setBranchId(event.target.value)}>
              {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
            </select>
          </label>
          <label>Loại chi phí
            <select className={fieldClass} value={category} onChange={(event) => setCategory(event.target.value as ExpenseCategory)}>
              {Object.entries(expenseCategories).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
            </select>
          </label>
          <label>Số tiền (VND)
            <input className={fieldClass} type="number" min="0.01" max="999999999999.99" step="0.01" required
              value={amount} onChange={(event) => setAmount(event.target.value)} />
          </label>
          <label className="sm:col-span-2">Nội dung
            <input className={fieldClass} required maxLength={200} value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>
          <label className="sm:col-span-2">Ghi chú
            <textarea className={fieldClass} maxLength={1000} rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} />
          </label>
        </fieldset>}
        {mutation.isError && <p role="alert" className="text-sm text-red-700">
          {action.mode === 'delete' ? 'Không xóa được khoản chi.' : 'Không lưu được khoản chi. Hãy kiểm tra dữ liệu và quyền truy cập chi nhánh.'}
        </p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" disabled={mutation.isPending} onClick={onClose}>{readOnly ? 'Đóng' : 'Hủy'}</Button>
          {!readOnly && <Button type="submit" variant={action.mode === 'delete' ? 'danger' : 'primary'}
            disabled={mutation.isPending || (action.mode !== 'delete' && (!title.trim() || !branchId))}>
            {action.mode === 'delete' ? 'Xóa chi phí' : 'Lưu chi phí'}
          </Button>}
        </div>
      </form>
    </DialogContent>
  </Dialog>;
};

