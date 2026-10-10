import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MoreHorizontal,
  Eye,
  Edit2,
  Trash2,
  Phone,
  AlertCircle,
  Building,
  RotateCcw,
  RefreshCw,
} from 'lucide-react';
import type { BranchListItemDto } from '../types/branch-admin.types';
import type { PaginationMetadata } from '@/types/api';
import { formatBranchDate, formatNullableText } from '../utils/branch.mapper';
import { BranchCard } from './BranchCard';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  TablePagination,
  TableSkeleton,
  tableStyles,
} from '@/components/management';
import { useLocaleFormatters } from '@/hooks/useLocaleFormatters';

export interface BranchTableProps {
  branches: BranchListItemDto[];
  metadata: PaginationMetadata | null;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onView: (branch: BranchListItemDto) => void;
  onEdit: (branch: BranchListItemDto) => void;
  onDelete: (branch: BranchListItemDto) => void;
  onRetry: () => void;
  onResetFilters?: () => void;
}

export const BranchTableSkeleton: React.FC = () => <TableSkeleton />;

export const BranchTable: React.FC<BranchTableProps> = memo(
  ({
    branches,
    metadata,
    isLoading,
    isError,
    errorMessage,
    canEdit = true,
    canDelete = false,
    onPageChange,
    onPageSizeChange,
    onView,
    onEdit,
    onDelete,
    onRetry,
    onResetFilters,
  }) => {
    const { t } = useTranslation('branch');
    const { formatNumber } = useLocaleFormatters();

    // 1. Error State
    if (isError) {
      return (
        <div className="w-full bg-white rounded-2xl border border-red-200 p-8 sm:p-12 text-center shadow-xs">
          <div className="size-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-100">
            <AlertCircle className="size-6 stroke-[2.2]" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">
            {t('errors.loadListTitle', 'Không thể tải dữ liệu chi nhánh.')}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            {errorMessage || t('errors.loadListDescription', 'Tải danh sách chi nhánh thất bại. Vui lòng thử lại.')}
          </p>
          <div className="flex items-center justify-center gap-2 mt-5">
            <Button type="button" variant="primary" size="sm" onClick={onRetry}>
              <RefreshCw className="size-4 mr-1.5" />
              {t('actions.retry', 'Thử lại')}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
            >
              {t('actions.reload', 'Tải lại trang')}
            </Button>
          </div>
        </div>
      );
    }

    // 2. Loading State
    if (isLoading) {
      return <BranchTableSkeleton />;
    }

    // 3. Empty State
    if (branches.length === 0) {
      return (
        <div className="w-full bg-white rounded-2xl border border-slate-200/80 p-8 sm:p-12 text-center shadow-xs">
          <div className="size-14 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto mb-4 border border-slate-200/60">
            <Building className="size-7" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">
            {t('empty.title', 'Không tìm thấy chi nhánh nào.')}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            {t('empty.description', 'Vui lòng thử thay đổi từ khóa hoặc điều kiện bộ lọc.')}
          </p>
          {onResetFilters && (
            <div className="mt-5">
              <Button type="button" variant="outline" size="sm" onClick={onResetFilters}>
                <RotateCcw className="size-4 mr-1.5" />
                {t('filters.reset', 'Xóa bộ lọc')}
              </Button>
            </div>
          )}
        </div>
      );
    }

    // Pagination calculations
    const pageNumber = metadata?.pageNumber ?? 1;
    const pageSize = metadata?.pageSize ?? 10;
    const totalCount = metadata?.totalCount ?? branches.length;
    const totalPages = metadata?.totalPages ?? Math.max(1, Math.ceil(totalCount / pageSize));

    const renderStatusBadge = (isActive: boolean) => {
      if (isActive) {
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap bg-emerald-50 text-emerald-700 border-emerald-200">
            <span aria-hidden className="size-1.5 rounded-full bg-emerald-500" />
            {t('status.active', 'Hoạt động')}
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap bg-red-50 text-red-700 border-red-200">
          <span aria-hidden className="size-1.5 rounded-full bg-red-500" />
          {t('status.inactive', 'Ngưng hoạt động')}
        </span>
      );
    };

    return (
      <div className={tableStyles.container}>
        {/* Desktop & Tablet Table (Scrollable on tablet) */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className={tableStyles.head}>
              <tr>
                <th scope="col" className={`${tableStyles.th} min-w-[260px]`}>
                  {t('table.branch', 'Chi nhánh')}
                </th>
                <th scope="col" className={tableStyles.th}>
                  {t('table.city', 'Thành phố')}
                </th>
                <th scope="col" className={tableStyles.th}>
                  {t('table.district', 'Quận/Huyện')}
                </th>
                <th scope="col" className={`${tableStyles.th} hidden lg:table-cell`}>
                  {t('table.phone', 'Số điện thoại')}
                </th>
                <th scope="col" className={`${tableStyles.th} text-center`}>
                  {t('table.courts', 'Tổng số sân')}
                </th>
                <th scope="col" className={tableStyles.th}>
                  {t('table.status', 'Trạng thái')}
                </th>
                <th scope="col" className={`${tableStyles.th} hidden xl:table-cell`}>
                  {t('table.createdDate', 'Ngày tạo')}
                </th>
                <th scope="col" className={`${tableStyles.th} text-right`}>
                  {t('table.actions', 'Thao tác')}
                </th>
              </tr>
            </thead>
            <tbody className={tableStyles.body}>
              {branches.map((branch) => {
                const courtsCount = branch.totalCourts ?? 0;

                return (
                  <tr key={branch.id} className={`${tableStyles.row} group`}>
                    {/* Branch Name Column */}
                    <td className={tableStyles.td}>
                      <div className="flex items-start gap-3">
                        <div className="size-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 font-bold shrink-0 mt-0.5 border border-slate-200/60">
                          <Building className="size-4 text-emerald-700" />
                        </div>
                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={() => onView(branch)}
                            className="font-semibold text-slate-900 hover:text-emerald-700 transition-colors text-left block truncate max-w-[280px]"
                          >
                            {branch.name}
                          </button>
                          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 font-mono">
                            <Phone className="size-3 text-slate-400 shrink-0" />
                            <span>{formatNullableText(branch.phoneNumber)}</span>
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* City Column */}
                    <td className={`${tableStyles.td} whitespace-nowrap font-medium text-slate-800`}>
                      {formatNullableText(branch.city)}
                    </td>

                    {/* District Column */}
                    <td className={`${tableStyles.td} whitespace-nowrap text-slate-600`}>
                      {formatNullableText(branch.district)}
                    </td>

                    {/* Phone Column */}
                    <td
                      className={`${tableStyles.td} whitespace-nowrap font-mono text-slate-600 hidden lg:table-cell`}
                    >
                      {formatNullableText(branch.phoneNumber)}
                    </td>

                    {/* Courts Badge Column */}
                    <td className={`${tableStyles.td} text-center whitespace-nowrap`}>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {t('table.courtsCount', {
                          count: courtsCount,
                          formatted: formatNumber(courtsCount),
                          defaultValue: `${courtsCount} sân`,
                        })}
                      </span>
                    </td>

                    {/* Status Column */}
                    <td className={`${tableStyles.td} whitespace-nowrap`}>
                      {renderStatusBadge(branch.isActive)}
                    </td>

                    {/* Created Date Column */}
                    <td
                      className={`${tableStyles.td} whitespace-nowrap text-muted-foreground hidden xl:table-cell`}
                    >
                      {formatBranchDate(branch.createdAt)}
                    </td>

                    {/* Actions Column */}
                    <td className={`${tableStyles.td} text-right whitespace-nowrap`}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            aria-label={t('table.rowActions', {
                              name: branch.name,
                              defaultValue: `Thao tác cho ${branch.name}`,
                            })}
                            className="size-8 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center transition-colors outline-none focus:ring-2 focus:ring-emerald-700/20"
                          >
                            <MoreHorizontal className="size-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44 rounded-xl">
                          <DropdownMenuItem onClick={() => onView(branch)}>
                            <Eye className="size-4 mr-2 text-slate-500" />
                            {t('actions.view', 'Xem chi tiết')}
                          </DropdownMenuItem>
                          {canEdit && (
                            <DropdownMenuItem onClick={() => onEdit(branch)}>
                              <Edit2 className="size-4 mr-2 text-slate-500" />
                              {t('actions.edit', 'Chỉnh sửa')}
                            </DropdownMenuItem>
                          )}
                          {canDelete && (
                            <DropdownMenuItem
                              destructive
                              onClick={() => onDelete(branch)}
                              className="text-red-600 focus:bg-red-50 focus:text-red-700"
                            >
                              <Trash2 className="size-4 mr-2" />
                              {t('actions.delete', 'Xóa')}
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

        {/* Mobile View: Card View */}
        <div className="sm:hidden divide-y divide-slate-100">
          {branches.map((branch) => (
            <BranchCard
              key={branch.id}
              branch={branch}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              canEdit={canEdit}
              canDelete={canDelete}
            />
          ))}
        </div>

        {/* Pagination */}
        <TablePagination
          pageNumber={pageNumber}
          pageSize={pageSize}
          totalCount={totalCount}
          totalPages={totalPages}
          itemsLabel={t('pagination.items', 'chi nhánh')}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      </div>
    );
  },
);

BranchTable.displayName = 'BranchTable';
