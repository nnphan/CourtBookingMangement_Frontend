import { useCallback, useEffect, useMemo, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Eye, KeyRound, Pencil, Plus, Search, ShieldCheck, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  FilterPanel,
  FilterSearchInput,
  ManagementEmptyState,
  PageHeader,
  TablePagination,
  TableSkeleton,
  tableStyles,
} from '@/components/management';
import { useLocaleFormatters } from '@/hooks/useLocaleFormatters';
import type { ApiErrorShape, PaginationMetadata } from '@/types/api';
import { getPermissions } from '../api/permission.api';
import { PERMISSION_QUERY_KEYS } from '../api/permission.query';
import type { Permission, PermissionSearchRequest } from '../types/permission.types';
import {
  DeletePermissionDialog,
  PermissionDetailDialog,
  PermissionFormDialog,
} from '../components/PermissionDialogs';

type PermissionDialogState =
  | { type: 'create' }
  | { type: 'detail' | 'edit' | 'delete'; permission: Permission }
  | null;

const DEFAULT_PAGE_SIZE = 12;
const SEARCH_DEBOUNCE_MS = 400;
const EMPTY_PERMISSIONS: Permission[] = [];

const getTraceId = (error: unknown) =>
  typeof error === 'object' &&
  error !== null &&
  'traceId' in error &&
  typeof error.traceId === 'string'
    ? error.traceId
    : undefined;

export const PermissionListPage = () => {
  const { t } = useTranslation();
  const { formatDate } = useLocaleFormatters();
  const [searchInput, setSearchInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [dialog, setDialog] = useState<PermissionDialogState>(null);

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

  const request = useMemo<PermissionSearchRequest>(
    () => ({
      keyword: keyword || undefined,
      pageNumber: Math.max(1, pageNumber),
      pageSize,
    }),
    [keyword, pageNumber, pageSize],
  );
  const permissionsQuery = useQuery({
    queryKey: PERMISSION_QUERY_KEYS.list(request),
    queryFn: ({ signal }) => getPermissions(request, signal),
    placeholderData: keepPreviousData,
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });

  const permissions = permissionsQuery.data?.data ?? EMPTY_PERMISSIONS;
  const metadata = permissionsQuery.data?.metadata ?? null;
  const hasSearch = Boolean(searchInput.trim());
  const isSearchPending = searchInput.trim() !== keyword;
  const closeDialog = useCallback(() => setDialog(null), []);

  useEffect(() => {
    if (metadata && metadata.totalPages > 0 && pageNumber > metadata.totalPages) {
      setPageNumber(metadata.totalPages);
    }
  }, [metadata, pageNumber]);

  const clearSearch = () => {
    setSearchInput('');
    setKeyword('');
    setPageNumber(1);
  };
  const changePageSize = (size: number) => {
    setPageSize(size);
    setPageNumber(1);
  };
  const handleDeleteSuccess = () => {
    if (permissions.length === 1 && pageNumber > 1) {
      setPageNumber((current) => Math.max(1, current - 1));
    }
  };
  const queryError = permissionsQuery.error as Partial<ApiErrorShape> | null;
  const traceId = getTraceId(queryError);

  return (
    <div className="w-full space-y-6">
      <PageHeader
        icon={ShieldCheck}
        title={t('permission.title')}
        description={t('permission.description')}
        badge={
          metadata
            ? t('permission.permissionCount', { count: metadata.totalCount })
            : undefined
        }
        actions={
          <Button
            type="button"
            onClick={() => setDialog({ type: 'create' })}
            className="w-full sm:w-auto"
          >
            <Plus aria-hidden className="size-4" />
            {t('permission.actions.create')}
          </Button>
        }
      />

      <FilterPanel
        title={t('permission.filters')}
        resetLabel={t('permission.actions.clearSearch')}
        onReset={hasSearch ? clearSearch : undefined}
      >
        <FilterSearchInput
          value={searchInput}
          onChange={setSearchInput}
          aria-label={t('permission.search.aria')}
          placeholder={t('permission.search.placeholder')}
        />
      </FilterPanel>

      {permissionsQuery.isFetching && !permissionsQuery.isLoading && (
        <p className="text-sm text-slate-500" role="status" aria-live="polite">
          {t('permission.loading.refreshing')}
        </p>
      )}

      {permissionsQuery.isLoading ? (
        <TableSkeleton />
      ) : isSearchPending && permissions.length === 0 ? (
        <TableSkeleton />
      ) : permissionsQuery.isError ? (
        <ManagementEmptyState
          icon={<KeyRound aria-hidden className="size-7" />}
          title={t('permission.error.load')}
          description={t('permission.error.tryAgain')}
          actions={
            <div className="flex flex-col items-center gap-2">
              <Button type="button" variant="outline" onClick={() => permissionsQuery.refetch()}>
                {t('permission.actions.retry')}
              </Button>
              {traceId && (
                <p className="text-xs text-slate-500">
                  {t('permission.error.traceId', { traceId })}
                </p>
              )}
            </div>
          }
        />
      ) : permissions.length === 0 && !keyword ? (
        <ManagementEmptyState
          icon={<KeyRound aria-hidden className="size-7" />}
          title={t('permission.empty.title')}
          description={t('permission.empty.description')}
          actions={
            <Button type="button" onClick={() => setDialog({ type: 'create' })}>
              <Plus aria-hidden className="size-4" />
              {t('permission.actions.create')}
            </Button>
          }
        />
      ) : permissions.length === 0 ? (
        <ManagementEmptyState
          icon={<Search aria-hidden className="size-7" />}
          title={t('permission.empty.filteredTitle')}
          description={t('permission.empty.filteredDescription')}
          actions={
            <Button type="button" variant="outline" onClick={clearSearch}>
              {t('permission.actions.clearSearch')}
            </Button>
          }
        />
      ) : (
        <PermissionTable
          permissions={permissions}
          metadata={metadata}
          pageNumber={pageNumber}
          pageSize={pageSize}
          onDetail={(permission) => setDialog({ type: 'detail', permission })}
          onEdit={(permission) => setDialog({ type: 'edit', permission })}
          onDelete={(permission) => setDialog({ type: 'delete', permission })}
          onPageChange={setPageNumber}
          onPageSizeChange={changePageSize}
          formatDate={formatDate}
        />
      )}

      {dialog?.type === 'create' && (
        <PermissionFormDialog
          key="create-permission"
          mode="create"
          onClose={closeDialog}
          onCreated={() => setPageNumber(1)}
        />
      )}
      {dialog?.type === 'edit' && (
        <PermissionFormDialog
          key={dialog.permission.id}
          mode="edit"
          permission={dialog.permission}
          onClose={closeDialog}
        />
      )}
      {dialog?.type === 'detail' && (
        <PermissionDetailDialog
          key={dialog.permission.id}
          permission={dialog.permission}
          onClose={closeDialog}
        />
      )}
      {dialog?.type === 'delete' && (
        <DeletePermissionDialog
          key={dialog.permission.id}
          permission={dialog.permission}
          onClose={closeDialog}
          onDeleted={handleDeleteSuccess}
        />
      )}
    </div>
  );
};

interface PermissionTableProps {
  permissions: Permission[];
  metadata: PaginationMetadata | null;
  pageNumber: number;
  pageSize: number;
  onDetail: (permission: Permission) => void;
  onEdit: (permission: Permission) => void;
  onDelete: (permission: Permission) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  formatDate: (value: string | number | Date | null | undefined, options?: { withTime?: boolean }) => string;
}

interface PermissionActionsProps extends Pick<
  PermissionTableProps,
  'onDetail' | 'onEdit' | 'onDelete'
> {
  permission: Permission;
}

const PermissionActions = ({
  permission,
  onDetail,
  onEdit,
  onDelete,
}: PermissionActionsProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onDetail(permission)}
        aria-label={t('permission.actions.viewLabel', { name: permission.name })}
      >
        <Eye aria-hidden className="size-4" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onEdit(permission)}
        aria-label={t('permission.actions.editLabel', { name: permission.name })}
      >
        <Pencil aria-hidden className="size-4" />
      </Button>
      <Button
        type="button"
        variant="danger"
        size="sm"
        onClick={() => onDelete(permission)}
        aria-label={t('permission.actions.deleteLabel', { name: permission.name })}
      >
        <Trash2 aria-hidden className="size-4" />
      </Button>
    </div>
  );
};

const PermissionTable = ({
  permissions,
  metadata,
  pageNumber,
  pageSize,
  onDetail,
  onEdit,
  onDelete,
  onPageChange,
  onPageSizeChange,
  formatDate,
}: PermissionTableProps) => {
  const { t } = useTranslation();
  const missing = t('permission.missing');
  const currentPage = metadata?.pageNumber ?? pageNumber;
  const currentPageSize = metadata?.pageSize ?? pageSize;

  return (
    <div className={`${tableStyles.container} flex flex-col`}>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[980px] border-collapse text-left">
          <thead className={tableStyles.head}>
            <tr>
              <th scope="col" className={`${tableStyles.th} w-16`}>
                {t('permission.columns.number')}
              </th>
              <th scope="col" className={`${tableStyles.th} min-w-48`}>
                {t('permission.fields.code')}
              </th>
              <th scope="col" className={`${tableStyles.th} min-w-48`}>
                {t('permission.fields.name')}
              </th>
              <th scope="col" className={`${tableStyles.th} min-w-60`}>
                {t('permission.fields.description')}
              </th>
              <th scope="col" className={`${tableStyles.th} whitespace-nowrap`}>
                {t('permission.fields.roleCount')}
              </th>
              <th scope="col" className={`${tableStyles.th} whitespace-nowrap`}>
                {t('permission.fields.updatedAt')}
              </th>
              <th scope="col" className={`${tableStyles.th} text-right`}>
                {t('permission.columns.actions')}
              </th>
            </tr>
          </thead>
          <tbody className={tableStyles.body}>
            {permissions.map((permission, index) => (
              <tr key={permission.id} className={tableStyles.row}>
                <td className={tableStyles.td}>
                  {(currentPage - 1) * currentPageSize + index + 1}
                </td>
                <td className={`${tableStyles.td} max-w-56`}>
                  <code
                    className="block truncate rounded bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700"
                    title={permission.code}
                  >
                    {permission.code || missing}
                  </code>
                </td>
                <td className={`${tableStyles.td} font-semibold text-slate-900`}>
                  {permission.name || missing}
                </td>
                <td
                  className={`${tableStyles.td} max-w-72 truncate`}
                  title={permission.description || undefined}
                >
                  {permission.description || missing}
                </td>
                <td className={tableStyles.td}>
                  <span className="inline-flex whitespace-nowrap rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                    {t('permission.roleCount', { count: permission.roleCount })}
                  </span>
                </td>
                <td className={`${tableStyles.td} whitespace-nowrap text-slate-600`}>
                  {formatDate(permission.updatedAt, { withTime: true })}
                </td>
                <td className={`${tableStyles.td} text-right`}>
                  <PermissionActions
                    permission={permission}
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
        {permissions.map((permission, index) => (
          <li key={permission.id} className="space-y-3 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-slate-500">
                  {t('permission.columns.number')} {(currentPage - 1) * currentPageSize + index + 1}
                </p>
                <p className="truncate font-semibold text-slate-900">{permission.name || missing}</p>
                <code className="block truncate font-mono text-xs text-slate-600" title={permission.code}>
                  {permission.code || missing}
                </code>
              </div>
              <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                {t('permission.roleCount', { count: permission.roleCount })}
              </span>
            </div>
            <p className="line-clamp-2 text-sm text-slate-600">
              {permission.description || missing}
            </p>
            <p className="text-xs text-slate-500">
              {t('permission.fields.updatedAt')}: {formatDate(permission.updatedAt, { withTime: true })}
            </p>
            <PermissionActions
              permission={permission}
              onDetail={onDetail}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </li>
        ))}
      </ul>
      <TablePagination
        pageNumber={currentPage}
        pageSize={currentPageSize}
        totalCount={metadata?.totalCount ?? 0}
        totalPages={metadata?.totalPages ?? 0}
        hasPreviousPage={metadata?.hasPreviousPage}
        hasNextPage={metadata?.hasNextPage}
        itemsLabel={t('permission.paginationItems')}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
};

export default PermissionListPage;
