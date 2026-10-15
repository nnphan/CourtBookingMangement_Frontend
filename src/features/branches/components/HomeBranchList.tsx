import React from 'react';
import { Layers } from 'lucide-react';
import type { BranchListItemDto } from '../types/branch.types';
import type { PaginationMetadata } from '@/types/api';
import { BranchGrid } from './BranchGrid';
import { BranchPagination } from './BranchPagination';

export interface HomeBranchListProps {
  branches: BranchListItemDto[];
  metadata: PaginationMetadata;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onPageChange: (page: number) => void;
  onRetry?: () => void;
  onClearFilters?: () => void;
  onQuickView?: (branchId: string) => void;
}

export const HomeBranchList: React.FC<HomeBranchListProps> = ({
  branches,
  metadata,
  isLoading,
  isError,
  errorMessage,
  onPageChange,
  onRetry,
  onClearFilters,
  onQuickView,
}) => {
  const { pageNumber, totalPages, totalCount } = metadata;

  return (
    <section className="space-y-6">
      {/* List Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2.5">
          <div className="grid size-9 place-items-center rounded-xl bg-brand-50 text-brand-600">
            <Layers className="size-4.5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-content-primary">
              Danh sách chi nhánh sân cầu lông
            </h2>
            <p className="text-xs text-content-secondary">
              Hiển thị các câu lạc bộ đang hoạt động và sẵn sàng đón khách
            </p>
          </div>
        </div>

        {!isLoading && !isError && (
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
              {totalCount} chi nhánh
            </span>
            {totalPages > 1 && (
              <span className="text-xs font-medium text-content-secondary">
                Trang {pageNumber} / {totalPages}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Branch Grid (Handles Loading, Error, Empty, and Success states) */}
      <BranchGrid
        branches={branches}
        isLoading={isLoading}
        isError={isError}
        errorMessage={errorMessage}
        onRetry={onRetry}
        onClearFilters={onClearFilters}
        onQuickView={onQuickView}
      />

      {/* Pagination Controls */}
      {!isLoading && !isError && (
        <BranchPagination
          metadata={metadata}
          onPageChange={onPageChange}
        />
      )}
    </section>
  );
};
