import type { ReactNode } from 'react';
const panel = 'border-line bg-surface min-w-0 rounded-xl border p-4 sm:p-5';
type Metric = [label: string, value: ReactNode];

export const StatisticsPanel = ({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) => (
  <section className={panel}>
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h2 className="font-bold text-slate-900">{title}</h2>
      {action}
    </div>
    {children}
  </section>
);

export const StatisticsMetrics = ({ items }: { items: Metric[] }) => (
  <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
    {items.map(([label, value]) => (
      <div key={label} className={panel}>
        <dt className="text-sm text-slate-600">{label}</dt>
        <dd className="mt-2 text-xl font-bold tabular-nums text-slate-900">{value}</dd>
      </div>
    ))}
  </dl>
);

export const StatisticsTable = ({ columns, rows, empty = 'Chưa có dữ liệu trong khoảng thời gian này.' }: {
  columns: string[]; rows: Array<{ key: string; cells: ReactNode[] }>; empty?: string;
}) => rows.length === 0 ? <p className="text-sm text-slate-600">{empty}</p> : (
  <div className="overflow-x-auto rounded-lg border border-slate-200">
    <table className="w-full text-left text-sm">
      <thead className="bg-slate-50 text-slate-700">
        <tr>{columns.map((column) => <th key={column} scope="col" className="whitespace-nowrap px-3 py-3 font-semibold">{column}</th>)}</tr>
      </thead>
      <tbody className="divide-y divide-slate-100 text-slate-700">
        {rows.map(({ key, cells }) => <tr key={key}>
          {cells.map((cell, index) => <td key={columns[index]} className="min-w-24 px-3 py-3">{cell}</td>)}
        </tr>)}
      </tbody>
    </table>
  </div>
);
