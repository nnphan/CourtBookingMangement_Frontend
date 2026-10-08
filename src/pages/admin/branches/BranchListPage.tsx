import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Plus, Building, RefreshCw } from 'lucide-react';
import {
  useGetBranches,
  useGetBranchStats,
  useDeleteBranch,
  useBranchPermissions,
} from '@/hooks/branches';
import {
  BranchStats,
  BranchFilters,
  BranchTable,
  BranchDeleteDialog,
  type BranchFilterValues,
} from '@/components/branches';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/management';
import { useLocaleFormatters } from '@/hooks/useLocaleFormatters';
import type { Branch } from '@/types/branch';

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

  // Delete Dialog States
  const [deleteTarget, setDeleteTarget] = useState<Branch | null>(null);

  // API Hooks
  const queryParams = useMemo(
    () => ({
      pageNumber,
      pageSize,
      keyword: filterValues.keyword,
      city: filterValues.city === 'all' ? undefined : filterValues.city,
      district: filterValues.district === 'all' ? undefined : filterValues.district,
      status: filterValues.status,
    }),
    [pageNumber, pageSize, filterValues],
  );

  const {
    branches,
    metadata,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetBranches(queryParams);

  const { data: stats, isLoading: isStatsLoading } = useGetBranchStats();
  const { mutateAsync: deleteBranchMutation, isPending: isDeleting } = useDeleteBranch();

  // Filter Change Handler
  const handleFilterChange = useCallback((changed: Partial<BranchFilterValues>) => {
    setFilterValues((prev) => ({ ...prev, ...changed }));
    setPageNumber(1); // Reset to page 1 on filter modification
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
    (branch: Branch) => {
      navigate(`/admin/branches/${branch.id}`);
    },
    [navigate],
  );

  const handleEdit = useCallback(
    (branch: Branch) => {
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

  return (
    <div className="w-full space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        icon={Building}
        title={t('page.title')}
        badge={
          metadata
            ? t('page.totalBadge', {
                count: metadata.totalCount,
                formatted: formatNumber(metadata.totalCount),
              })
            : undefined
        }
        description={t('page.description')}
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RefreshCw className={`size-4 ${isFetching ? 'animate-spin' : ''}`} />
              {t('actions.refresh')}
            </Button>

            {/* Show button ONLY when Role = ADMIN */}
            {permissions.canCreate && (
              <Button type="button" variant="primary" size="sm" onClick={handleCreate}>
                <Plus className="size-4" strokeWidth={2.5} />
                {t('actions.create')}
              </Button>
            )}
          </>
        }
      />

      {/* 2. Statistics Cards */}
      <BranchStats stats={stats} isLoading={isStatsLoading} />

      {/* 3. Search & Filters */}
      <BranchFilters
        values={filterValues}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* 4. Branch Table */}
      <BranchTable
        branches={branches}
        metadata={metadata}
        isLoading={isLoading}
        isError={isError}
        errorMessage={error?.message}
        canCreate={permissions.canCreate}
        canDelete={permissions.canDelete}
        onPageChange={setPageNumber}
        onPageSizeChange={(sz) => {
          setPageSize(sz);
          setPageNumber(1);
        }}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={setDeleteTarget}
        onCreate={handleCreate}
        onRetry={refetch}
      />

      {/* 5. Delete Confirmation Dialog */}
      <BranchDeleteDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        branchName={deleteTarget?.branchName}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default BranchListPage;
