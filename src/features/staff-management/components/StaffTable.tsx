import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { paths } from '@/app/router/paths';
import { StatusBadge, tableStyles } from '@/components/management';
import { useLocaleFormatters } from '@/hooks/useLocaleFormatters';
import type { StaffListItem } from '../types/staff.types';

const StaffAssignments = ({ staff }: { staff: StaffListItem }) => (
  <ul className="space-y-1">
    {staff.branches.map((branch) => (
      <li key={branch.branchId}>
        <span className="font-medium">{branch.branchName}</span>
        {(branch.staffCode || branch.jobTitle) && (
          <span className="text-slate-600"> — {[branch.staffCode, branch.jobTitle].filter(Boolean).join(' · ')}</span>
        )}
      </li>
    ))}
  </ul>
);

const StaffStatuses = ({ staff }: { staff: StaffListItem }) => {
  const { t } = useTranslation();
  const activationTone =
    staff.activationStatus === 'ACTIVE' ? 'active'
      : staff.activationStatus === 'PENDING_ACTIVATION' ? 'pending'
        : staff.activationStatus === 'EXPIRED' ? 'blocked' : 'inactive';

  return (
    <div className="flex flex-wrap gap-2">
      <StatusBadge status={staff.status === 'ACTIVE' ? 'active' : 'inactive'}>
        {t(`staffManagement.statusValues.${staff.status}`)}
      </StatusBadge>
      <StatusBadge status={activationTone}>
        {t(`staffManagement.activationValues.${staff.activationStatus}`)}
      </StatusBadge>
    </div>
  );
};

export const StaffTable = ({ staff }: { staff: StaffListItem[] }) => {
  const { t } = useTranslation();
  const { formatDate } = useLocaleFormatters();

  return (
    <>
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full border-collapse text-left">
          <thead className={tableStyles.head}>
            <tr>
              <th scope="col" className={tableStyles.th}>{t('staffManagement.columns.staff')}</th>
              <th scope="col" className={tableStyles.th}>{t('staffManagement.columns.contact')}</th>
              <th scope="col" className={tableStyles.th}>{t('staffManagement.columns.assignments')}</th>
              <th scope="col" className={tableStyles.th}>{t('staffManagement.columns.status')}</th>
              <th scope="col" className={tableStyles.th}>{t('staffManagement.columns.lastLogin')}</th>
              <th scope="col" className={tableStyles.th}>{t('staffManagement.columns.created')}</th>
            </tr>
          </thead>
          <tbody className={tableStyles.body}>
            {staff.map((person) => (
              <tr key={person.userId} className={tableStyles.row}>
                <th scope="row" className={`${tableStyles.td} font-semibold text-slate-900`}>
                  <Link to={paths.staffDetail(encodeURIComponent(person.userId))} className="inline-flex min-h-11 items-center text-emerald-700 underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2">
                    {person.displayName}
                  </Link>
                </th>
                <td className={tableStyles.td}>
                  <div className="break-all">{person.email}</div>
                  <div>{person.phoneNumber || '—'}</div>
                </td>
                <td className={tableStyles.td}><StaffAssignments staff={person} /></td>
                <td className={tableStyles.td}><StaffStatuses staff={person} /></td>
                <td className={`${tableStyles.td} whitespace-nowrap`}>{formatDate(person.lastLoginAt, { withTime: true })}</td>
                <td className={`${tableStyles.td} whitespace-nowrap`}>{formatDate(person.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="divide-y divide-slate-100 lg:hidden">
        {staff.map((person) => (
          <li key={person.userId} className="space-y-3 p-4">
            <div>
              <h2 className="font-semibold text-slate-900">
                <Link to={paths.staffDetail(encodeURIComponent(person.userId))} className="inline-flex min-h-11 items-center text-emerald-700 underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2">
                  {person.displayName}
                </Link>
              </h2>
              <p className="break-all text-sm text-slate-600">{person.email}</p>
              <p className="text-sm text-slate-600">{person.phoneNumber || '—'}</p>
            </div>
            <StaffStatuses staff={person} />
            <dl className="space-y-2 text-sm text-slate-700">
              <div><dt className="font-semibold">{t('staffManagement.columns.assignments')}</dt><dd><StaffAssignments staff={person} /></dd></div>
              <div><dt className="font-semibold">{t('staffManagement.columns.lastLogin')}</dt><dd>{formatDate(person.lastLoginAt, { withTime: true })}</dd></div>
              <div><dt className="font-semibold">{t('staffManagement.columns.created')}</dt><dd>{formatDate(person.createdAt)}</dd></div>
            </dl>
          </li>
        ))}
      </ul>
    </>
  );
};
