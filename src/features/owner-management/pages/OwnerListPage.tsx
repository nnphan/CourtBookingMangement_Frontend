import { useEffect, useMemo, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Building2, Eye, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FilterPanel,
  FilterSearchInput,
  ManagementEmptyState,
  PageHeader,
  StatusBadge,
  TablePagination,
  TableSkeleton,
  tableStyles,
} from '@/components/management';
import { getOwners } from '../api/owner.api';
import { OWNER_QUERY_KEYS } from '../api/owner.query';
import type { PaginationMetadata } from '@/types/api';
import type { Owner, OwnerSearchParams } from '../types/owner.types';
import {
  DeleteOwnerDialog,
  OwnerDetailDialog,
  OwnerFormDialog,
} from '../components/OwnerDialogs';

type OwnerStatusFilter = 'all' | 'active' | 'inactive';
type OwnerDialogState =
  | { type: 'create' }
  | { type: 'detail' | 'edit' | 'delete'; owner: Owner }
  | null;

const EMPTY_OWNERS: Owner[] = [];
const DEFAULT_PAGE_SIZE = 12;
const SEARCH_DEBOUNCE_MS = 400;

export const OwnerListPage = () => {
  const { t } = useTranslation();
  const [searchInput, setSearchInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [status, setStatus] = useState<OwnerStatusFilter>('all');
  const [sortBy, setSortBy] = useState<OwnerSearchParams['sortBy']>();
  const [dialog, setDialog] = useState<OwnerDialogState>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const next = searchInput.trim();
      setKeyword((previous) => {
        if (previous === next) return previous;
        setPageNumber(1);
        return next;
      });
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const queryParams = useMemo<OwnerSearchParams>(
    () => ({
      keyword: keyword || undefined,
      isActive: status === 'all' ? undefined : status === 'active',
      sortBy,
      pageNumber,
      pageSize,
    }),
    [keyword, pageNumber, pageSize, sortBy, status],
  );
  const ownersQuery = useQuery({
    queryKey: OWNER_QUERY_KEYS.list(queryParams),
    queryFn: () => getOwners(queryParams),
    placeholderData: keepPreviousData,
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });

  const owners = ownersQuery.data?.data ?? EMPTY_OWNERS;
  const metadata = ownersQuery.data?.metadata ?? null;
  const hasFilters = Boolean(searchInput.trim()) || status !== 'all' || Boolean(sortBy);

  useEffect(() => {
    if (metadata && metadata.totalPages > 0 && pageNumber > metadata.totalPages) {
      setPageNumber(metadata.totalPages);
    }
  }, [metadata, pageNumber]);

  const clearFilters = () => {
    setSearchInput('');
    setKeyword('');
    setPageNumber(1);
    setStatus('all');
    setSortBy(undefined);
  };

  const changeStatus = (value: OwnerStatusFilter) => {
    setStatus(value);
    setPageNumber(1);
  };

  const changeSort = (value: string) => {
    setSortBy(value === 'createdAt_desc' ? value : undefined);
    setPageNumber(1);
  };

  const changePageSize = (size: number) => {
    setPageSize(size);
    setPageNumber(1);
  };

  const openCreateDialog = () => setDialog({ type: 'create' });

  return (
    <div className="w-full space-y-6">
      <PageHeader
        icon={Building2}
        title={t('ownerManagement.title')}
        description={t('ownerManagement.description')}
        badge={metadata ? t('ownerManagement.ownerCount', { count: metadata.totalCount }) : undefined}
        actions={
          <Button type="button" onClick={openCreateDialog} className="w-full sm:w-auto">
            <Plus aria-hidden className="size-4" />
            {t('ownerManagement.addOwner')}
          </Button>
        }
      />

      <FilterPanel
        title={t('ownerManagement.filters')}
        resetLabel={t('ownerManagement.clearFilters')}
        onReset={hasFilters ? clearFilters : undefined}
      >
        <div className="grid gap-3 lg:grid-cols-[minmax(16rem,1fr)_auto_auto]">
          <FilterSearchInput
            value={searchInput}
            onChange={setSearchInput}
            aria-label={t('ownerManagement.searchAria')}
            placeholder={t('ownerManagement.searchPlaceholder')}
          />
          <Select value={status} onValueChange={(value) => changeStatus(value as OwnerStatusFilter)}>
            <SelectTrigger aria-label={t('ownerManagement.statusFilter')} className="min-w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('ownerManagement.allStatuses')}</SelectItem>
              <SelectItem value="active">{t('ownerManagement.active')}</SelectItem>
              <SelectItem value="inactive">{t('ownerManagement.inactive')}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy ?? 'none'} onValueChange={changeSort}>
            <SelectTrigger aria-label={t('ownerManagement.sort')} className="min-w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">{t('ownerManagement.defaultSort')}</SelectItem>
              <SelectItem value="createdAt_desc">{t('ownerManagement.newestFirst')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </FilterPanel>

      {ownersQuery.isLoading ? (
        <TableSkeleton />
      ) : ownersQuery.isError ? (
        <ManagementEmptyState
          icon={<Building2 aria-hidden className="size-7" />}
          title={t('ownerManagement.ownersLoadError')}
          description={t('ownerManagement.tryAgainLater')}
          actions={
            <Button type="button" variant="outline" onClick={() => ownersQuery.refetch()}>
              {t('ownerManagement.retry')}
            </Button>
          }
        />
      ) : owners.length === 0 && !hasFilters ? (
        <ManagementEmptyState
          icon={<Building2 aria-hidden className="size-7" />}
          title={t('ownerManagement.noOwners')}
          description={t('ownerManagement.emptyOwners')}
          actions={
            <Button type="button" onClick={openCreateDialog}>
              <Plus aria-hidden className="size-4" />
              {t('ownerManagement.addOwner')}
            </Button>
          }
        />
      ) : owners.length === 0 ? (
        <ManagementEmptyState
          icon={<Search aria-hidden className="size-7" />}
          title={t('ownerManagement.noMatches')}
          description={t('ownerManagement.noMatchesDescription')}
          actions={
            <Button type="button" variant="outline" onClick={clearFilters}>
              {t('ownerManagement.clearFilters')}
            </Button>
          }
        />
      ) : (
        <OwnerTable
          owners={owners}
          metadata={metadata}
          onDetail={(owner) => setDialog({ type: 'detail', owner })}
          onEdit={(owner) => setDialog({ type: 'edit', owner })}
          onDelete={(owner) => setDialog({ type: 'delete', owner })}
          onPageChange={setPageNumber}
          onPageSizeChange={changePageSize}
        />
      )}

      {dialog?.type === 'create' && (
        <OwnerFormDialog key="create-owner" owner={null} onClose={() => setDialog(null)} />
      )}
      {dialog?.type === 'detail' && (
        <OwnerDetailDialog
          key={dialog.owner.id}
          owner={dialog.owner}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog?.type === 'edit' && (
        <OwnerFormDialog
          key={dialog.owner.id}
          owner={dialog.owner}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog?.type === 'delete' && (
        <DeleteOwnerDialog
          key={dialog.owner.id}
          owner={dialog.owner}
          onClose={() => setDialog(null)}
        />
      )}
    </div>
  );
};

interface OwnerTableProps {
  owners: Owner[];
  metadata: PaginationMetadata | null;
  onDetail: (owner: Owner) => void;
  onEdit: (owner: Owner) => void;
  onDelete: (owner: Owner) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const OwnerActions = ({
  owner,
  onDetail,
  onEdit,
  onDelete,
}: Pick<OwnerTableProps, 'onDetail' | 'onEdit' | 'onDelete'> & { owner: Owner }) => {
  const { t } = useTranslation();
  const displayName = owner.fullName || owner.email;

  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onDetail(owner)}
        aria-label={t('ownerManagement.viewOwner', { owner: displayName })}
      >
        <Eye aria-hidden className="size-4" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onEdit(owner)}
        aria-label={t('ownerManagement.editOwner', { owner: displayName })}
      >
        <Pencil aria-hidden className="size-4" />
      </Button>
      <Button
        type="button"
        variant="danger"
        size="sm"
        onClick={() => onDelete(owner)}
        aria-label={t('ownerManagement.deleteOwner', { owner: displayName })}
      >
        <Trash2 aria-hidden className="size-4" />
      </Button>
    </div>
  );
};

const OwnerTable = ({
  owners,
  metadata,
  onDetail,
  onEdit,
  onDelete,
  onPageChange,
  onPageSizeChange,
}: OwnerTableProps) => {
  const { t } = useTranslation();
  const missing = t('ownerManagement.missing');

  return (
    <div className={`${tableStyles.container} flex flex-col`}>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[940px] border-collapse text-left">
          <thead className={tableStyles.head}>
            <tr>
              <th scope="col" className={`${tableStyles.th} min-w-40`}>
                {t('ownerManagement.fullName')}
              </th>
              <th scope="col" className={`${tableStyles.th} min-w-52`}>
                {t('ownerManagement.contact')}
              </th>
              <th scope="col" className={`${tableStyles.th} min-w-44`}>
                {t('ownerManagement.businessName')}
              </th>
              <th scope="col" className={`${tableStyles.th} whitespace-nowrap`}>
                {t('ownerManagement.taxId')}
              </th>
              <th scope="col" className={`${tableStyles.th} whitespace-nowrap`}>
                {t('ownerManagement.status')}
              </th>
              <th scope="col" className={`${tableStyles.th} text-right`}>
                {t('ownerManagement.actions')}
              </th>
            </tr>
          </thead>
          <tbody className={tableStyles.body}>
            {owners.map((owner) => (
              <tr key={owner.id} className={tableStyles.row}>
                <td className={tableStyles.td}>
                  <span className="font-semibold text-slate-900">
                    {owner.fullName || owner.email || missing}
                  </span>
                </td>
                <td className={tableStyles.td}>
                  <p className="truncate text-slate-700">{owner.email || missing}</p>
                  <p className="text-xs text-slate-500">{owner.phoneNumber || missing}</p>
                </td>
                <td className={`${tableStyles.td} max-w-56 truncate`} title={owner.businessName}>
                  {owner.businessName || missing}
                </td>
                <td className={`${tableStyles.td} font-mono whitespace-nowrap text-slate-600`}>
                  {owner.taxId || missing}
                </td>
                <td className={tableStyles.td}>
                  <StatusBadge status={owner.isActive ? 'active' : 'inactive'}>
                    {t(owner.isActive ? 'ownerManagement.active' : 'ownerManagement.inactive')}
                  </StatusBadge>
                </td>
                <td className={`${tableStyles.td} text-right`}>
                  <OwnerActions
                    owner={owner}
                    onDetail={onDetail}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="divide-y divide-slate-100 md:hidden">
        {owners.map((owner) => (
          <li key={owner.id} className="space-y-3 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-900">
                  {owner.fullName || owner.email || missing}
                </p>
                <p className="truncate text-sm text-slate-600">{owner.email || missing}</p>
                <p className="text-sm text-slate-500">{owner.phoneNumber || missing}</p>
              </div>
              <StatusBadge status={owner.isActive ? 'active' : 'inactive'}>
                {t(owner.isActive ? 'ownerManagement.active' : 'ownerManagement.inactive')}
              </StatusBadge>
            </div>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <div className="min-w-0">
                <dt className="text-xs text-slate-500">{t('ownerManagement.businessName')}</dt>
                <dd className="truncate text-slate-800">{owner.businessName || missing}</dd>
              </div>
              <div className="min-w-0">
                <dt className="text-xs text-slate-500">{t('ownerManagement.taxId')}</dt>
                <dd className="truncate font-mono text-slate-800">{owner.taxId || missing}</dd>
              </div>
            </dl>
            <OwnerActions
              owner={owner}
              onDetail={onDetail}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </li>
        ))}
      </ul>
      <TablePagination
        pageNumber={metadata?.pageNumber ?? 1}
        pageSize={metadata?.pageSize ?? DEFAULT_PAGE_SIZE}
        totalCount={metadata?.totalCount ?? owners.length}
        totalPages={metadata?.totalPages ?? 1}
        itemsLabel={t('ownerManagement.paginationItems')}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
};

export default OwnerListPage;
