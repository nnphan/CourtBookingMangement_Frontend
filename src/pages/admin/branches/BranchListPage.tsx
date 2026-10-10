import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Plus, Building, RefreshCw } from 'lucide-react';
import {
  useBranches,
  useBranchSummary,
  useDeleteBranch,
  BranchSummaryCards,
  BranchFilter,
  BranchTable,
  mapFiltersToParams,
  type BranchFilterValues,
  type BranchListItemDto,
} from '@/features/admin-branches';
import { useBranchPermissions } from '@/hooks/branches';
import { BranchDeleteDialog } from '@/components/branches';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/management';
import { useLocaleFormatters } from '@/hooks/useLocaleFormatters';

export const BranchListPage: React.FC = () => {
  const { t } = useTranslation('branch');
  const { formatNumber } = useLocaleFormatters();
  const navigate = useNavigate();
  const permissions = useBranchPermissions();

  // Filter & Pagination States
  const [filterValues, setFilterValues] = useState<BranchFilterValues>({
    keyword: '',
    city: 'all',
    district: 'all',
    status: 'all',
  });

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Delete Dialog Target
  const [deleteTarget, setDeleteTarget] = useState<BranchListItemDto | null>(null);

  // API Query Params
  const queryParams = useMemo(
    () => mapFiltersToParams(filterValues, pageNumber, pageSize),
    [filterValues, pageNumber, pageSize],
  );

  // TanStack Query Hooks
  const {
    data: branchData,
    isLoading: isBranchesLoading,
    isFetching: isBranchesFetching,
    isError: isBranchesError,
    error: branchesError,
    refetch: refetchBranches,
  } = useBranches(queryParams);

  const {
    data: summaryData,
    isLoading: isSummaryLoading,
    isFetching: isSummaryFetching,
    refetch: refetchSummary,
  } = useBranchSummary();

  const { mutateAsync: deleteBranchMutation, isPending: isDeleting } = useDeleteBranch();

  const isRefreshing = isBranchesFetching || isSummaryFetching;

  const handleRefresh = useCallback(() => {
    refetchBranches();
    refetchSummary();
  }, [refetchBranches, refetchSummary]);

  // Filter Handlers
  const handleFilterChange = useCallback((changed: Partial<BranchFilterValues>) => {
    setFilterValues((prev) => ({ ...prev, ...changed }));
    setPageNumber(1);
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilterValues({
      keyword: '',
      city: 'all',
      district: 'all',
      status: 'all',
    });
    setPageNumber(1);
  }, []);

  // Navigation Handlers
  const handleView = useCallback(
    (branch: BranchListItemDto) => {
      navigate(`/admin/branches/${branch.id}`);
    },
    [navigate],
  );

  const handleEdit = useCallback(
    (branch: BranchListItemDto) => {
      navigate(`/admin/branches/${branch.id}/edit`);
    },
    [navigate],
  );

  const handleCreate = useCallback(() => {
    navigate('/admin/branches/create');
  }, [navigate]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deleteBranchMutation(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      // Error handled by hook toast
    }
  }, [deleteTarget, deleteBranchMutation]);

  const branches = branchData?.items ?? [];
  const metadata = branchData
    ? {
        pageNumber: branchData.pageNumber,
        pageSize: branchData.pageSize,
        totalCount: branchData.totalCount,
        totalPages: branchData.totalPages,
        hasPreviousPage: branchData.hasPreviousPage,
        hasNextPage: branchData.hasNextPage,
      }
    : null;

  return (
    <div className="w-full space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        icon={Building}
        title={t('page.title', 'Quản lý chi nhánh')}
        badge={
          metadata
            ? t('page.totalBadge', {
                count: metadata.totalCount,
                formatted: formatNumber(metadata.totalCount),
                defaultValue: `${formatNumber(metadata.totalCount)} chi nhánh`,
              })
            : undefined
        }
        description={t('page.description', 'Quản lý các chi nhánh và cơ sở cầu lông')}
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`size-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {t('actions.refresh', 'Làm mới')}
            </Button>

            {/* Show button ONLY when Role = ADMIN */}
            {permissions.canCreate && (
              <Button type="button" variant="primary" size="sm" onClick={handleCreate}>
                <Plus className="size-4" strokeWidth={2.5} />
                {t('actions.create', 'Tạo chi nhánh')}
              </Button>
            )}
          </>
        }
      />

      {/* 2. Dashboard Summary Cards */}
      <BranchSummaryCards summary={summaryData} isLoading={isSummaryLoading} />

      {/* 3. Search & Filters */}
      <BranchFilter
        values={filterValues}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* 4. Branch Table */}
      <BranchTable
        branches={branches}
        metadata={metadata}
        isLoading={isBranchesLoading}
        isError={isBranchesError}
        errorMessage={branchesError?.message}
        canEdit={permissions.canEdit}
        canDelete={permissions.canDelete}
        onPageChange={setPageNumber}
        onPageSizeChange={(sz) => {
          setPageSize(sz);
          setPageNumber(1);
        }}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={setDeleteTarget}
        onRetry={refetchBranches}
        onResetFilters={handleResetFilters}
      />

      {/* 5. Delete Confirmation Dialog */}
      <BranchDeleteDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        branchName={deleteTarget?.name}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default BranchListPage;
