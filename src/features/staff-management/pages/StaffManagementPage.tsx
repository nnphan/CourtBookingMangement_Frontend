import { useState } from 'react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshCw, Users } from 'lucide-react';
import { RouteFallback } from '@/components/common/RouteFallback';
import {
  FilterPanel,
  FilterSearchInput,
  ManagementEmptyState,
  PageHeader,
  TablePagination,
  TableSkeleton,
  tableStyles,
} from '@/components/management';
import { Button } from '@/components/ui/button';
import type { ApiErrorShape } from '@/types/api';
import { StaffTable } from '../components/StaffTable';
import { StaffCreateDialog } from '../components/StaffCreateDialog';
import { useStaffAccess, useStaffBranches, useStaffList } from '../hooks/useStaffManagement';
import type { StaffActivationStatus, StaffListParams, StaffSortField, StaffStatus } from '../types/staff.types';

const SORT_FIELDS: StaffSortField[] = ['displayName', 'email', 'staffCode', 'status', 'createdAt', 'lastLoginAt'];
const STATUSES: StaffStatus[] = ['ACTIVE', 'INACTIVE'];
const ACTIVATION_STATUSES: StaffActivationStatus[] = ['PENDING_ACTIVATION', 'ACTIVE', 'INACTIVE', 'EXPIRED'];
const DEFAULT_FILTERS: StaffListParams = { page: 1, pageSize: 20, sortBy: 'createdAt', sortDirection: 'DESC' };
const controlClass = 'h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary';
const isForbidden = (error: ApiErrorShape | Error | null) =>
  error !== null && 'status' in error && error.status === 403;

const StaffList = () => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<StaffListParams>(DEFAULT_FILTERS);
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const list = useStaffList(filters);
  const branches = useStaffBranches();
  const creatableBranches = branches.data?.filter((branch) => branch.canCreateStaff === true) ?? [];
  const hasFilters = Boolean(filters.search || filters.branchId || filters.status || filters.activationStatus);

  const updateFilters = (changes: Partial<StaffListParams>) =>
    setFilters((current) => ({ ...current, ...changes, page: 1 }));

  const resetFilters = () => {
    setSearch('');
    setFilters(DEFAULT_FILTERS);
  };

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateFilters({ search: search.trim() || undefined });
  };

  if (branches.isError && isForbidden(branches.error)) {
    return <div role="alert" className="p-8 text-center">{t('staffManagement.forbidden')}</div>;
  }
  if (list.isError && isForbidden(list.error)) {
    return (
      <div role="alert" className="p-8 text-center">
        <p>{t('staffManagement.forbidden')}</p>
        {filters.branchId && (
          <Button type="button" variant="outline" size="sm" className="mt-4 min-h-11" onClick={resetFilters}>
            {t('management.filters.reset')}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 py-4">
      <PageHeader
        icon={Users}
        title={t('staffManagement.title')}
        description={t('staffManagement.description')}
        actions={(
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" className="min-h-11" onClick={() => void list.refetch()} disabled={list.isFetching}>
              <RefreshCw aria-hidden className="size-4" />{t('staffManagement.refresh')}
            </Button>
            <Button type="button" size="sm" className="min-h-11" disabled={branches.isFetching || branches.isError || creatableBranches.length === 0} onClick={() => setCreateOpen(true)}>
              {t('staffManagement.add')}
            </Button>
          </div>
        )}
      />
      <p id="staff-actions-later" className="text-sm text-slate-600">{t('staffManagement.actionsLater')}</p>
      {branches.isSuccess && !branches.isFetching && creatableBranches.length === 0 && (
        <p className="text-sm text-slate-600">{t('staffManagement.create.noPermission')}</p>
      )}
      {createOpen && (
        <StaffCreateDialog
          branches={creatableBranches}
          open={createOpen}
          onOpenChange={setCreateOpen}
        />
      )}

      <FilterPanel className="[&_button]:min-h-11" onReset={hasFilters || search ? resetFilters : undefined}>
        <form onSubmit={submitSearch} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="sm:col-span-2 lg:col-span-3">
            <label htmlFor="staff-search" className="mb-1 block text-sm font-medium">{t('staffManagement.search')}</label>
            <div className="flex flex-wrap items-center gap-2">
              <FilterSearchInput id="staff-search" value={search} onChange={setSearch} maxLength={100} placeholder={t('staffManagement.searchPlaceholder')} className="max-w-none flex-1 min-w-48 [&_input]:h-11" />
              <Button type="submit" size="sm" className="min-h-11">{t('staffManagement.search')}</Button>
            </div>
          </div>
          <div>
            <label htmlFor="staff-branch" className="mb-1 block text-sm font-medium">{t('staffManagement.branch')}</label>
            <select id="staff-branch" className={controlClass} value={filters.branchId ?? ''} disabled={branches.isPending || branches.isError}
              onChange={(event) => updateFilters({ branchId: event.target.value || undefined })}>
              <option value="">{t('staffManagement.allBranches')}</option>
              {branches.data?.map((branch) => <option key={branch.branchId} value={branch.branchId}>{branch.branchName}</option>)}
            </select>
            {branches.isError && (
              <div role="alert" className="mt-1 text-sm text-red-700">
                {t('staffManagement.branchError')}{' '}
                <button type="button" className="inline-flex min-h-11 items-center font-semibold underline" onClick={() => void branches.refetch()}>{t('staffManagement.retry')}</button>
              </div>
            )}
          </div>
          <div>
            <label htmlFor="staff-status" className="mb-1 block text-sm font-medium">{t('staffManagement.status')}</label>
            <select id="staff-status" className={controlClass} value={filters.status ?? ''}
              onChange={(event) => updateFilters({ status: STATUSES.find((status) => status === event.target.value) })}>
              <option value="">{t('staffManagement.all')}</option>
              {STATUSES.map((status) => <option key={status} value={status}>{t(`staffManagement.statusValues.${status}`)}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="staff-activation" className="mb-1 block text-sm font-medium">{t('staffManagement.activation')}</label>
            <select id="staff-activation" className={controlClass} value={filters.activationStatus ?? ''}
              onChange={(event) => updateFilters({ activationStatus: ACTIVATION_STATUSES.find((status) => status === event.target.value) })}>
              <option value="">{t('staffManagement.all')}</option>
              {ACTIVATION_STATUSES.map((status) => <option key={status} value={status}>{t(`staffManagement.activationValues.${status}`)}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="staff-sort" className="mb-1 block text-sm font-medium">{t('staffManagement.sortBy')}</label>
            <select id="staff-sort" className={controlClass} value={filters.sortBy}
              onChange={(event) => updateFilters({ sortBy: SORT_FIELDS.find((field) => field === event.target.value) })}>
              {SORT_FIELDS.map((field) => <option key={field} value={field}>{t(`staffManagement.sortFields.${field}`)}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="staff-direction" className="mb-1 block text-sm font-medium">{t('staffManagement.sortDirection')}</label>
            <select id="staff-direction" className={controlClass} value={filters.sortDirection}
              onChange={(event) => updateFilters({ sortDirection: event.target.value === 'ASC' ? 'ASC' : 'DESC' })}>
              <option value="ASC">{t('staffManagement.ascending')}</option>
              <option value="DESC">{t('staffManagement.descending')}</option>
            </select>
          </div>
        </form>
      </FilterPanel>

      {list.isFetching && <p role="status" className="text-sm text-slate-600">{t(list.data ? 'staffManagement.refreshing' : 'staffManagement.loading')}</p>}
      {list.isError && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
          {t('staffManagement.loadError')}{' '}
          <button type="button" className="inline-flex min-h-11 items-center font-semibold underline" onClick={() => void list.refetch()}>{t('staffManagement.retry')}</button>
        </div>
      )}
      {list.isPending && !list.isError && <TableSkeleton />}
      {list.data && (
        list.data.data.length === 0 && (filters.page ?? 1) === 1 ? (
          <ManagementEmptyState
            icon={<Users aria-hidden className="size-8" />}
            title={t(hasFilters ? 'staffManagement.noResults' : 'staffManagement.empty')}
            description={t(hasFilters ? 'staffManagement.noResultsDescription' : 'staffManagement.emptyDescription')}
            actions={hasFilters ? <Button type="button" variant="outline" size="sm" className="min-h-11" onClick={resetFilters}>{t('management.filters.reset')}</Button> : undefined}
          />
        ) : (
          <div className={tableStyles.container}>
            {list.data.data.length > 0 ? <StaffTable staff={list.data.data} /> : (
              <div className="p-6 text-center">
                <p>{t('staffManagement.outOfRange')}</p>
                <Button type="button" variant="outline" size="sm" className="mt-3 min-h-11" onClick={() => setFilters((current) => ({ ...current, page: 1 }))}>{t('staffManagement.firstPage')}</Button>
              </div>
            )}
            {list.data.data.length > 0 && (
              <TablePagination
                {...list.data.metadata}
                itemsLabel={t('staffManagement.items')}
                onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
                onPageSizeChange={(pageSize) => setFilters((current) => ({ ...current, pageSize, page: 1 }))}
              />
            )}
          </div>
        )
      )}
    </div>
  );
};

const StaffManagementPage = () => {
  const { t } = useTranslation();
  const access = useStaffAccess();

  if (access.isFetching && !access.isFetchedAfterMount) return <RouteFallback />;
  if (access.isError && isForbidden(access.error)) {
    return <div role="alert" className="p-8 text-center">{t('staffManagement.forbidden')}</div>;
  }
  if (access.isError || !access.data) {
    return (
      <div role="alert" className="p-8 text-center">
        <p>{t('staffManagement.accessError')}</p>
        <button type="button" className="mt-4 min-h-11 font-semibold text-emerald-700 underline" onClick={() => void access.refetch()}>
          {t('staffManagement.retry')}
        </button>
      </div>
    );
  }
  return <StaffList />;
};

export default StaffManagementPage;
