import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { paths } from '@/app/router/paths';
import { StatusBadge, tableStyles } from '@/components/management';
import { useLocaleFormatters } from '@/hooks/useLocaleFormatters';
import type { StaffListItem } from '../types/staff.types';

const columns = ['staffCode', 'staff', 'email', 'phoneNumber', 'assignments', 'lastLogin', 'status', 'created'] as const;

export const StaffTable = ({ staff }: { staff: StaffListItem[] }) => {
  const { t } = useTranslation();
  const { formatDate } = useLocaleFormatters();
  const labels = columns.map((column) => t(`staffManagement.columns.${column}`));
  const rows = staff.map((person) => {
    const codes = [...new Set(person.branches.map((branch) => branch.staffCode).filter(Boolean))];
    const values: Record<(typeof columns)[number], ReactNode> = {
      staffCode: codes.join(', ') || person.staffCode || '—',
      staff: (
        <Link to={paths.staffDetail(encodeURIComponent(person.userId))} className="inline-flex min-h-11 items-center font-semibold text-emerald-700 underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2">
          {person.displayName}
        </Link>
      ),
      email: <span className="break-all">{person.email}</span>,
      phoneNumber: <span className="whitespace-nowrap">{person.phoneNumber || '—'}</span>,
      assignments: person.branches.length === 0 ? '—' : (
        <ul className="space-y-1">
          {person.branches.map((branch) => <li key={branch.branchId}>{branch.branchName}</li>)}
        </ul>
      ),
      lastLogin: <span className="whitespace-nowrap">{formatDate(person.lastLoginAt, { withTime: true })}</span>,
      status: (
        <StatusBadge status={person.status === 'ACTIVE' ? 'active' : 'inactive'}>
          {t(`staffManagement.statusValues.${person.status}`)}
        </StatusBadge>
      ),
      created: <span className="whitespace-nowrap">{formatDate(person.createdAt)}</span>,
    };
    return { id: person.userId, values };
  });

  return (
    <>
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full border-collapse text-left">
          <thead className={tableStyles.head}>
            <tr>{columns.map((column, index) => (
              <th key={column} scope="col" className={tableStyles.th}>{labels[index]}</th>
            ))}</tr>
          </thead>
          <tbody className={tableStyles.body}>
            {rows.map(({ id, values }) => (
              <tr key={id} className={tableStyles.row}>
                {columns.map((column) => column === 'staff' ? (
                  <th key={column} scope="row" className={tableStyles.td}>{values[column]}</th>
                ) : (
                  <td key={column} className={tableStyles.td}>{values[column]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="divide-y divide-slate-100 lg:hidden">
        {rows.map(({ id, values }) => (
          <li key={id} className="p-4">
            <dl className="grid grid-cols-2 gap-3 text-sm text-slate-700">
              {columns.map((column, index) => (
                <div key={column} className="min-w-0">
                  <dt className="font-semibold">{labels[index]}</dt>
                  <dd>{values[column]}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </>
  );
};
