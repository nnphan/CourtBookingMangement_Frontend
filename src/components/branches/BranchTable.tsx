import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MoreHorizontal,
  Eye,
  Edit2,
  Trash2,
  Phone,
  MapPin,
  AlertCircle,
  Plus,
  Building,
} from 'lucide-react';
import type { Branch } from '@/types/branch';
import type { PaginationMetadata } from '@/types/api';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ManagementEmptyState,
  StatusBadge,
  TablePagination,
  TableSkeleton,
  tableStyles,
} from '@/components/management';
import { useLocaleFormatters } from '@/hooks/useLocaleFormatters';

interface BranchTableProps {
  branches: Branch[];
  metadata: PaginationMetadata | null;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  canCreate: boolean;
  canDelete: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onView: (branch: Branch) => void;
  onEdit: (branch: Branch) => void;
  onDelete: (branch: Branch) => void;
  onCreate?: () => void;
  onRetry: () => void;
}

export const BranchTable: React.FC<BranchTableProps> = memo(
  ({
    branches,
    metadata,
    isLoading,
    isError,
    errorMessage,
    canCreate,
    canDelete,
    onPageChange,
    onPageSizeChange,
    onView,
    onEdit,
    onDelete,
    onCreate,
    onRetry,
  }) => {
    const { t } = useTranslation('branch');
    const { formatDate, formatNumber } = useLocaleFormatters();

    // 1. Error State
    if (isError) {
      return (
        <div className="w-full bg-white rounded-2xl border border-red-200 p-8 sm:p-12 text-center shadow-sm">
          <div className="size-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-100">
            <AlertCircle className="size-6 stroke-[2.2]" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">{t('errors.loadListTitle')}</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            {errorMessage || t('errors.loadListDescription')}
          </p>
          <Button type="button" variant="outline" size="sm" onClick={onRetry} className="mt-4">
            {t('actions.retry')}
          </Button>
        </div>
      );
    }

    // 2. Loading Skeleton State
    if (isLoading) return <TableSkeleton />;

    // 3. Empty State
    if (branches.length === 0) {
      return (
        <ManagementEmptyState
          icon="🏸"
          title={t('empty.title')}
          description={t('empty.description')}
          actions={
            canCreate && onCreate ? (
              <Button type="button" variant="primary" size="sm" onClick={onCreate}>
                <Plus className="size-4" />
                {t('actions.create')}
              </Button>
            ) : undefined
          }
        />
      );
    }

    // Metadata calculations for pagination
    const pageNumber = metadata?.pageNumber ?? 1;
    const pageSize = metadata?.pageSize ?? 10;
    const totalCount = metadata?.totalCount ?? branches.length;
    const totalPages = metadata?.totalPages ?? Math.max(1, Math.ceil(totalCount / pageSize));

    const renderStatus = (branch: Branch) => (
      <StatusBadge status={branch.status === 'active' ? 'active' : 'inactive'}>
        {branch.status === 'active' ? t('status.active') : t('status.inactive')}
      </StatusBadge>
    );

    return (
      <div className={tableStyles.container}>
        {/* Desktop and Tablet Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className={tableStyles.head}>
              <tr>
                <th scope="col" className={`${tableStyles.th} min-w-[260px]`}>
                  {t('table.branch')}
                </th>
                <th scope="col" className={tableStyles.th}>
                  {t('table.city')}
                </th>
                <th scope="col" className={tableStyles.th}>
                  {t('table.district')}
                </th>
                <th scope="col" className={`${tableStyles.th} hidden lg:table-cell`}>
                  {t('table.phone')}
                </th>
                <th scope="col" className={`${tableStyles.th} text-center`}>
                  {t('table.courts')}
                </th>
                <th scope="col" className={tableStyles.th}>
                  {t('table.status')}
                </th>
                <th scope="col" className={`${tableStyles.th} hidden xl:table-cell`}>
                  {t('table.createdDate')}
                </th>
                <th scope="col" className={`${tableStyles.th} text-right`}>
                  {t('table.actions')}
                </th>
              </tr>
            </thead>
            <tbody className={tableStyles.body}>
              {branches.map((branch) => {
                const courtsCount = branch.totalCourts || branch.courts?.length || 0;

                return (
                  <tr key={branch.id} className={`${tableStyles.row} group`}>
                    {/* Branch column */}
                    <td className={tableStyles.td}>
                      <div className="flex items-start gap-3">
                        <div className="size-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 font-bold shrink-0 mt-0.5 border border-slate-200/60">
                          <Building className="size-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={() => onView(branch)}
                            className="font-semibold text-slate-900 hover:text-primary transition-colors text-left block truncate max-w-[280px]"
                          >
                            {branch.branchName}
                          </button>
                          <p className="text-xs text-muted-foreground truncate max-w-[280px] flex items-center gap-1 mt-0.5">
                            <MapPin className="size-3 text-slate-400 shrink-0" />
                            <span>{branch.address}</span>
                          </p>
                          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 font-mono">
                            <Phone className="size-3 text-slate-400 shrink-0" />
                            <span>{branch.phone}</span>
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className={`${tableStyles.td} whitespace-nowrap font-medium text-slate-800`}>
                      {branch.city}
                    </td>

                    <td className={`${tableStyles.td} whitespace-nowrap text-slate-600`}>
                      {branch.district}
                    </td>

                    <td
                      className={`${tableStyles.td} whitespace-nowrap font-mono text-slate-600 hidden lg:table-cell`}
                    >
                      {branch.phone}
                    </td>

                    {/* Courts Badge */}
                    <td className={`${tableStyles.td} text-center whitespace-nowrap`}>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {t('table.courtsCount', {
                          count: courtsCount,
                          formatted: formatNumber(courtsCount),
                        })}
                      </span>
                    </td>

                    <td className={`${tableStyles.td} whitespace-nowrap`}>{renderStatus(branch)}</td>

                    <td
                      className={`${tableStyles.td} whitespace-nowrap text-muted-foreground hidden xl:table-cell`}
                    >
                      {formatDate(branch.createdAt)}
                    </td>

                    {/* Actions Dropdown */}
                    <td className={`${tableStyles.td} text-right whitespace-nowrap`}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            aria-label={t('table.rowActions', { name: branch.branchName })}
                            className="size-8 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center transition-colors outline-none focus:ring-2 focus:ring-primary/20"
                          >
                            <MoreHorizontal className="size-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44 rounded-xl">
                          <DropdownMenuItem onClick={() => onView(branch)}>
                            <Eye className="size-4 mr-2 text-slate-500" />
                            {t('actions.view')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit(branch)}>
                            <Edit2 className="size-4 mr-2 text-slate-500" />
                            {t('actions.edit')}
                          </DropdownMenuItem>
                          {canDelete && (
                            <DropdownMenuItem
                              destructive
                              onClick={() => onDelete(branch)}
                              className="text-red-600 focus:bg-red-50 focus:text-red-700"
                            >
                              <Trash2 className="size-4 mr-2" />
                              {t('actions.delete')}
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards (shown on screen < 640px) */}
        <div className={tableStyles.mobileList}>
          {branches.map((branch) => {
            const courtsCount = branch.totalCourts || branch.courts?.length || 0;

            return (
              <div key={branch.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4
                      onClick={() => onView(branch)}
                      className="font-semibold text-slate-900 text-sm hover:text-primary transition-colors"
                    >
                      {branch.branchName}
                    </h4>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="size-3 text-slate-400 shrink-0" />
                      <span>
                        {branch.address}, {branch.district}, {branch.city}
                      </span>
                    </p>
                  </div>
                  <div className="shrink-0">{renderStatus(branch)}</div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono flex items-center gap-1">
                      <Phone className="size-3 text-slate-400" />
                      {branch.phone}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      {t('table.courtsCount', {
                        count: courtsCount,
                        formatted: formatNumber(courtsCount),
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onView(branch)}
                      className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      {t('actions.viewShort')}
                    </button>
                    <button
                      type="button"
                      onClick={() => onEdit(branch)}
                      className="px-2.5 py-1 text-xs font-semibold text-primary hover:bg-brand-50 rounded-lg transition-colors"
                    >
                      {t('actions.edit')}
                    </button>
                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => onDelete(branch)}
                        className="px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        {t('actions.delete')}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <TablePagination
          pageNumber={pageNumber}
          pageSize={pageSize}
          totalCount={totalCount}
          totalPages={totalPages}
          itemsLabel={t('pagination.items')}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      </div>
    );
  },
);

BranchTable.displayName = 'BranchTable';
