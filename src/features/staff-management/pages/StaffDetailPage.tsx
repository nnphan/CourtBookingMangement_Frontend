import { useRef, useState } from 'react';
import { Link, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, UserRound } from 'lucide-react';
import { paths } from '@/app/router/paths';
import { RouteFallback } from '@/components/common/RouteFallback';
import { PageHeader, StatusBadge } from '@/components/management';
import { Button, buttonVariants } from '@/components/ui/button';
import { useLocaleFormatters } from '@/hooks/useLocaleFormatters';
import { ResendStaffActivationDialog } from '../components/ResendStaffActivationDialog';
import { useStaffBranches, useStaffDetail } from '../hooks/useStaffManagement';

const StaffDetailPage = () => {
  const { staffId = '' } = useParams();
  const { t } = useTranslation();
  const { formatDate } = useLocaleFormatters();
  const detail = useStaffDetail(staffId);
  const branches = useStaffBranches();
  const [resendOpen, setResendOpen] = useState(false);
  const resendButton = useRef<HTMLButtonElement>(null);
  const status = detail.error && 'status' in detail.error ? detail.error.status : undefined;
  const back = (
    <Link to={paths.staffManagement} className={`${buttonVariants({ variant: 'outline', size: 'sm' })} min-h-11`}>
      <ArrowLeft aria-hidden className="size-4" />{t('staffManagement.detail.back')}
    </Link>
  );

  if (!staffId || (detail.isFetching && !detail.isFetchedAfterMount)) {
    return staffId ? <RouteFallback /> : <div role="alert" className="space-y-4 p-8">{t('staffManagement.detail.notFound')}{back}</div>;
  }
  if (detail.isError || !detail.data) {
    return (
      <div role="alert" className="space-y-4 p-8">
        <p>{t(status === 403 ? 'staffManagement.forbidden' : status === 404 ? 'staffManagement.detail.notFound' : 'staffManagement.detail.loadError')}</p>
        <div className="flex flex-wrap gap-2">
          {back}
          {status !== 403 && status !== 404 && (
            <Button type="button" variant="outline" size="sm" className="min-h-11" onClick={() => void detail.refetch()}>
              {t('staffManagement.retry')}
            </Button>
          )}
        </div>
      </div>
    );
  }

  const person = detail.data;
  const canResend = branches.isSuccess && !branches.isFetching && !branches.isError &&
    branches.data.length > 0 && branches.data.every((branch) => branch.canCreateStaff === true);
  const pending = person.activationStatus === 'PENDING_ACTIVATION' || person.activationStatus === 'EXPIRED';
  const activationTone = person.activationStatus === 'ACTIVE' ? 'active'
    : person.activationStatus === 'PENDING_ACTIVATION' ? 'pending'
      : person.activationStatus === 'EXPIRED' ? 'blocked' : 'inactive';
  const deliveryTone = person.invitationDeliveryStatus === 'SENT' ? 'active'
    : person.invitationDeliveryStatus === 'FAILED' ? 'blocked' : 'pending';

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 py-4">
      <PageHeader leading={back} icon={UserRound} title={person.displayName} description={t('staffManagement.detail.title')} />
      <p className="text-sm text-slate-600">{t('staffManagement.actionsLater')}</p>
      <section aria-labelledby="staff-details-heading" className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 id="staff-details-heading" className="text-lg font-bold text-slate-900">{t('staffManagement.detail.account')}</h2>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={person.status === 'ACTIVE' ? 'active' : 'inactive'}>{t(`staffManagement.statusValues.${person.status}`)}</StatusBadge>
          <StatusBadge status={activationTone}>{t(`staffManagement.activationValues.${person.activationStatus}`)}</StatusBadge>
        </div>
        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          <div><dt className="font-semibold text-slate-700">{t('staffManagement.create.fields.email')}</dt><dd className="break-all text-slate-900">{person.email}</dd></div>
          <div><dt className="font-semibold text-slate-700">{t('staffManagement.create.fields.phoneNumber')}</dt><dd className="text-slate-900">{person.phoneNumber || '—'}</dd></div>
          {pending && person.invitationDeliveryStatus && (
            <div>
              <dt className="font-semibold text-slate-700">{t('staffManagement.detail.invitationDelivery')}</dt>
              <dd className="mt-1">
                <StatusBadge status={deliveryTone}>
                  {t(`staffManagement.deliveryValues.${person.invitationDeliveryStatus}`)}
                </StatusBadge>
              </dd>
            </div>
          )}
          <div><dt className="font-semibold text-slate-700">{t('staffManagement.columns.created')}</dt><dd className="text-slate-900">{formatDate(person.createdAt)}</dd></div>
          <div><dt className="font-semibold text-slate-700">{t('staffManagement.columns.lastLogin')}</dt><dd className="text-slate-900">{formatDate(person.lastLoginAt, { withTime: true })}</dd></div>
        </dl>
        {pending && person.invitationDeliveryStatus === 'FAILED' && (
          <p className="text-sm text-amber-800">{t('staffManagement.detail.deliveryFailed')}</p>
        )}
        {pending && (
          <div className="space-y-2 border-t border-slate-100 pt-4">
            <Button ref={resendButton} type="button" size="sm" className="min-h-11" disabled={!canResend} onClick={() => setResendOpen(true)}>
              {t('staffManagement.detail.resendAction')}
            </Button>
            {branches.isError ? (
              <p role="alert" className="text-sm text-red-700">{t('staffManagement.detail.permissionError')}{' '}
                <button type="button" className="min-h-11 font-semibold underline" onClick={() => void branches.refetch()}>{t('staffManagement.retry')}</button>
              </p>
            ) : branches.isSuccess && !branches.isFetching && !canResend ? (
              <p className="text-sm text-slate-600">{t('staffManagement.detail.resendNoPermission')}</p>
            ) : null}
          </div>
        )}
      </section>
      <section aria-labelledby="staff-branches-heading" className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 id="staff-branches-heading" className="text-lg font-bold text-slate-900">{t('staffManagement.detail.branches')}</h2>
        {person.branches.length === 0 ? <p className="text-sm text-slate-600">{t('staffManagement.detail.noBranches')}</p> : (
          <ul className="space-y-3">
            {person.branches.map((branch) => (
              <li key={branch.branchId} className="space-y-3 rounded-xl border border-slate-200 p-4">
                <h3 className="font-semibold text-slate-900">{branch.branchName}</h3>
                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                  <div><dt className="font-semibold text-slate-700">{t('staffManagement.create.fields.staffCode')}</dt><dd className="break-words">{branch.staffCode || '—'}</dd></div>
                  <div><dt className="font-semibold text-slate-700">{t('staffManagement.create.fields.jobTitle')}</dt><dd className="break-words">{branch.jobTitle || '—'}</dd></div>
                  <div><dt className="font-semibold text-slate-700">{t('staffManagement.create.fields.employmentStartDate')}</dt><dd>{formatDate(branch.employmentStartDate)}</dd></div>
                  <div className="sm:col-span-2"><dt className="font-semibold text-slate-700">{t('staffManagement.create.fields.notes')}</dt><dd className="whitespace-pre-wrap break-words">{branch.notes || '—'}</dd></div>
                </dl>
              </li>
            ))}
          </ul>
        )}
      </section>
      {resendOpen && <ResendStaffActivationDialog userId={person.userId} email={person.email} onClose={() => setResendOpen(false)} returnFocusRef={resendButton} />}
    </div>
  );
};

export default StaffDetailPage;
