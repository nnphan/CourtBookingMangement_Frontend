import { useCallback, useEffect, useMemo, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Eye, Pencil, Plus, Search, Shield, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { useLocaleFormatters } from '@/hooks/useLocaleFormatters';
import type { ApiErrorShape, PaginationMetadata } from '@/types/api';
import { getRoles } from '../api/role.api';
import { ROLE_QUERY_KEYS } from '../api/role.query';
import type { Role, RoleSearchRequest } from '../types/role.types';
import { DeleteRoleDialog, RoleDetailDialog, RoleFormDialog } from '../components/RoleDialogs';

type RoleDialogState =
  | { type: 'create' }
  | { type: 'detail' | 'edit' | 'delete'; role: Role }
  | null;

const DEFAULT_PAGE_SIZE = 12;
const SEARCH_DEBOUNCE_MS = 400;
const PERMISSION_PREVIEW_LIMIT = 3;
const EMPTY_ROLES: Role[] = [];

const getTraceId = (error: unknown) =>
  typeof error === 'object' &&
  error !== null &&
  'traceId' in error &&
  typeof error.traceId === 'string'
    ? error.traceId
    : undefined;

export const RoleListPage = () => {
  const { t } = useTranslation();
  const { formatDate } = useLocaleFormatters();
  const [searchInput, setSearchInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [dialog, setDialog] = useState<RoleDialogState>(null);

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

  const request = useMemo<RoleSearchRequest>(
    () => ({
      keyword: keyword || undefined,
      pageNumber: Math.max(1, pageNumber),
      pageSize,
    }),
    [keyword, pageNumber, pageSize],
  );
  const rolesQuery = useQuery({
    queryKey: ROLE_QUERY_KEYS.list(request),
    queryFn: ({ signal }) => getRoles(request, signal),
    placeholderData: keepPreviousData,
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });

  const roles = rolesQuery.data?.data ?? EMPTY_ROLES;
  const metadata = rolesQuery.data?.metadata ?? null;
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
    if (roles.length === 1 && pageNumber > 1) {
      setPageNumber((current) => Math.max(1, current - 1));
    }
  };
  const traceId = getTraceId(rolesQuery.error as Partial<ApiErrorShape> | null);

  return (
    <div className="w-full space-y-6">
      <PageHeader
        icon={Shield}
        title={t('role.title')}
        description={t('role.description')}
        badge={metadata ? t('role.roleCount', { count: metadata.totalCount }) : undefined}
        actions={
          <Button
            type="button"
            onClick={() => setDialog({ type: 'create' })}
            className="w-full sm:w-auto"
          >
            <Plus aria-hidden className="size-4" />
            {t('role.actions.create')}
          </Button>
        }
      />

      <FilterPanel
        title={t('role.filters')}
        resetLabel={t('role.actions.clearSearch')}
        onReset={hasSearch ? clearSearch : undefined}
      >
        <FilterSearchInput
          value={searchInput}
          onChange={setSearchInput}
          aria-label={t('role.search.aria')}
          placeholder={t('role.search.placeholder')}
        />
      </FilterPanel>

      {rolesQuery.isFetching && !rolesQuery.isLoading && (
        <p className="text-sm text-slate-500" role="status" aria-live="polite">
          {t('role.loading.refreshing')}
        </p>
      )}

      {rolesQuery.isLoading ? (
        <TableSkeleton />
      ) : isSearchPending && roles.length === 0 ? (
        <TableSkeleton />
      ) : rolesQuery.isError ? (
        <ManagementEmptyState
          icon={<Shield aria-hidden className="size-7" />}
          title={t('role.error.load')}
          description={t('role.error.tryAgain')}
          actions={
            <div className="flex flex-col items-center gap-2">
              <Button type="button" variant="outline" onClick={() => rolesQuery.refetch()}>
                {t('role.actions.retry')}
              </Button>
              {traceId && (
                <p className="text-xs text-slate-500">{t('role.error.traceId', { traceId })}</p>
              )}
            </div>
          }
        />
      ) : roles.length === 0 && !keyword ? (
        <ManagementEmptyState
          icon={<Shield aria-hidden className="size-7" />}
          title={t('role.empty.title')}
          description={t('role.empty.description')}
          actions={
            <Button type="button" onClick={() => setDialog({ type: 'create' })}>
              <Plus aria-hidden className="size-4" />
              {t('role.actions.create')}
            </Button>
          }
        />
      ) : roles.length === 0 ? (
        <ManagementEmptyState
          icon={<Search aria-hidden className="size-7" />}
          title={t('role.empty.filteredTitle')}
          description={t('role.empty.filteredDescription')}
          actions={
            <Button type="button" variant="outline" onClick={clearSearch}>
              {t('role.actions.clearSearch')}
            </Button>
          }
        />
      ) : (
        <RoleTable
          roles={roles}
          metadata={metadata}
          pageNumber={pageNumber}
          pageSize={pageSize}
          onDetail={(role) => setDialog({ type: 'detail', role })}
          onEdit={(role) => setDialog({ type: 'edit', role })}
          onDelete={(role) => setDialog({ type: 'delete', role })}
          onPageChange={setPageNumber}
          onPageSizeChange={changePageSize}
          formatDate={formatDate}
        />
      )}

      {dialog?.type === 'create' && (
        <RoleFormDialog
          key="create-role"
          mode="create"
          onClose={closeDialog}
          onCreated={() => setPageNumber(1)}
        />
      )}
      {dialog?.type === 'edit' && (
        <RoleFormDialog
          key={dialog.role.id}
          mode="edit"
          role={dialog.role}
          onClose={closeDialog}
        />
      )}
      {dialog?.type === 'detail' && (
        <RoleDetailDialog key={dialog.role.id} role={dialog.role} onClose={closeDialog} />
      )}
      {dialog?.type === 'delete' && (
        <DeleteRoleDialog
          key={dialog.role.id}
          role={dialog.role}
          onClose={closeDialog}
          onDeleted={handleDeleteSuccess}
        />
      )}
    </div>
  );
};

interface RoleTableProps {
  roles: Role[];
  metadata: PaginationMetadata | null;
  pageNumber: number;
  pageSize: number;
  onDetail: (role: Role) => void;
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  formatDate: (
    value: string | number | Date | null | undefined,
    options?: { withTime?: boolean },
  ) => string;
}

const RoleActions = ({
  role,
  onDetail,
  onEdit,
  onDelete,
}: Pick<RoleTableProps, 'onDetail' | 'onEdit' | 'onDelete'> & { role: Role }) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onDetail(role)}
        aria-label={t('role.actions.viewLabel', { name: role.name })}
      >
        <Eye aria-hidden className="size-4" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onEdit(role)}
        aria-label={t('role.actions.editLabel', { name: role.name })}
      >
        <Pencil aria-hidden className="size-4" />
      </Button>
      <Button
        type="button"
        variant="danger"
        size="sm"
        onClick={() => onDelete(role)}
        aria-label={t('role.actions.deleteLabel', { name: role.name })}
      >
        <Trash2 aria-hidden className="size-4" />
      </Button>
    </div>
  );
};

const PermissionPreview = ({ role }: { role: Role }) => {
  const { t } = useTranslation();
  const preview = role.permissions.slice(0, PERMISSION_PREVIEW_LIMIT);
  const remaining = Math.max(0, role.permissionCount - preview.length);

  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-slate-700">
        {t('role.permissionCount', { count: role.permissionCount })}
      </p>
      {preview.length === 0 ? (
        <p className="text-xs text-slate-500">{t('role.noPermissions')}</p>
      ) : (
        <div className="flex flex-wrap gap-1">
          {preview.map((permission) => (
            <code
              key={permission.id}
              title={permission.name}
              className="max-w-36 truncate rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-700"
            >
              {permission.code}
            </code>
          ))}
          {remaining > 0 && (
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-700">
              +{remaining}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

const RoleStatus = ({ role }: { role: Role }) => {
  const { t } = useTranslation();
  return (
    <StatusBadge status={role.isActive ? 'active' : 'inactive'}>
      {t(role.isActive ? 'role.status.active' : 'role.status.inactive')}
    </StatusBadge>
  );
};

const RoleTable = ({
  roles,
  metadata,
  pageNumber,
  pageSize,
  onDetail,
  onEdit,
  onDelete,
  onPageChange,
  onPageSizeChange,
  formatDate,
}: RoleTableProps) => {
  const { t } = useTranslation();
  const missing = t('role.missing');
  const currentPage = metadata?.pageNumber ?? pageNumber;
  const currentPageSize = metadata?.pageSize ?? pageSize;

  return (
    <div className={`${tableStyles.container} flex flex-col`}>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[1100px] border-collapse text-left">
          <thead className={tableStyles.head}>
            <tr>
              <th scope="col" className={`${tableStyles.th} w-16`}>
                {t('role.columns.number')}
              </th>
              <th scope="col" className={`${tableStyles.th} min-w-48`}>
                {t('role.columns.role')}
              </th>
              <th scope="col" className={`${tableStyles.th} min-w-60`}>
                {t('role.fields.description')}
              </th>
              <th scope="col" className={`${tableStyles.th} whitespace-nowrap`}>
                {t('role.fields.userCount')}
              </th>
              <th scope="col" className={`${tableStyles.th} min-w-56`}>
                {t('role.fields.permissions')}
              </th>
              <th scope="col" className={`${tableStyles.th} whitespace-nowrap`}>
                {t('role.fields.isActive')}
              </th>
              <th scope="col" className={`${tableStyles.th} whitespace-nowrap`}>
                {t('role.fields.updatedAt')}
              </th>
              <th scope="col" className={`${tableStyles.th} text-right`}>
                {t('role.columns.actions')}
              </th>
            </tr>
          </thead>
          <tbody className={tableStyles.body}>
            {roles.map((role, index) => (
              <tr key={role.id} className={tableStyles.row}>
                <td className={tableStyles.td}>
                  {(currentPage - 1) * currentPageSize + index + 1}
                </td>
                <td className={`${tableStyles.td} max-w-56`}>
                  <p className="truncate font-semibold text-slate-900" title={role.name}>
                    {role.name || missing}
                  </p>
                  <code
                    className="mt-1 block truncate font-mono text-xs text-slate-600"
                    title={role.code}
                  >
                    {role.code || missing}
                  </code>
                </td>
                <td
                  className={`${tableStyles.td} max-w-72 truncate`}
                  title={role.description || undefined}
                >
                  {role.description || missing}
                </td>
                <td className={`${tableStyles.td} whitespace-nowrap`}>
                  {t('role.userCount', { count: role.userCount })}
                </td>
                <td className={tableStyles.td}>
                  <PermissionPreview role={role} />
                </td>
                <td className={tableStyles.td}>
                  <RoleStatus role={role} />
                </td>
                <td className={`${tableStyles.td} whitespace-nowrap text-slate-600`}>
                  {formatDate(role.updatedAt, { withTime: true })}
                </td>
                <td className={`${tableStyles.td} text-right`}>
                  <RoleActions role={role} onDetail={onDetail} onEdit={onEdit} onDelete={onDelete} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="divide-y divide-slate-100 md:hidden">
        {roles.map((role, index) => (
          <li key={role.id} className="space-y-3 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-slate-500">
                  {t('role.columns.number')} {(currentPage - 1) * currentPageSize + index + 1}
                </p>
                <p className="truncate font-semibold text-slate-900">{role.name || missing}</p>
                <code className="block truncate font-mono text-xs text-slate-600" title={role.code}>
                  {role.code || missing}
                </code>
              </div>
              <RoleStatus role={role} />
            </div>
            <p className="line-clamp-2 text-sm text-slate-600">{role.description || missing}</p>
            <p className="text-xs text-slate-500">
              {t('role.userCount', { count: role.userCount })}
            </p>
            <PermissionPreview role={role} />
            <p className="text-xs text-slate-500">
              {t('role.fields.updatedAt')}: {formatDate(role.updatedAt, { withTime: true })}
            </p>
            <RoleActions role={role} onDetail={onDetail} onEdit={onEdit} onDelete={onDelete} />
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
        itemsLabel={t('role.paginationItems')}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
};

export default RoleListPage;
