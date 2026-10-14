import React from 'react';
import { ChevronLeft, ChevronRight, Layers } from 'lucide-react';
import type { BranchListItemDto } from '../types/branch.types';
import type { PaginationMetadata } from '@/types/api';
import { BranchGrid } from './BranchGrid';

export interface HomeBranchListProps {
  branches: BranchListItemDto[];
  metadata: PaginationMetadata;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onPageChange: (page: number) => void;
  onRetry?: () => void;
  onClearFilters?: () => void;
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
}) => {
  const { pageNumber, totalPages, totalCount, hasPreviousPage, hasNextPage } = metadata;

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
      />

      {/* Pagination Controls */}
      {!isLoading && !isError && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-line pt-6">
          <p className="text-xs text-content-secondary">
            Hiển thị <span className="font-bold text-content-primary">{branches.length}</span> trên tổng số{' '}
            <span className="font-bold text-content-primary">{totalCount}</span> chi nhánh
          </p>

          <div className="flex items-center gap-2">
            {/* Previous Page */}
            <button
              type="button"
              disabled={!hasPreviousPage || pageNumber <= 1}
              onClick={() => onPageChange(pageNumber - 1)}
              className="inline-flex items-center gap-1 rounded-xl border border-line bg-surface px-3 py-2 text-xs font-semibold text-content-primary shadow-2xs transition-colors hover:bg-surface-muted disabled:pointer-events-none disabled:opacity-40 cursor-pointer"
              aria-label="Trang trước"
            >
              <ChevronLeft className="size-4" />
              <span>Trước</span>
            </button>

            {/* Page number buttons */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, idx) => {
                const page = idx + 1;
                const isCurrent = page === pageNumber;

                // Show first, last, current, and adjacent pages
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= pageNumber - 1 && page <= pageNumber + 1)
                ) {
                  return (
                    <button
                      key={page}
                      type="button"
                      onClick={() => onPageChange(page)}
                      className={`grid size-9 place-items-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-brand-600 text-white shadow-xs'
                          : 'border border-line bg-surface text-content-primary hover:bg-surface-muted'
                      }`}
                      aria-current={isCurrent ? 'page' : undefined}
                    >
                      {page}
                    </button>
                  );
                }

                // Ellipsis for omitted ranges
                if (page === pageNumber - 2 || page === pageNumber + 2) {
                  return (
                    <span key={page} className="px-1 text-xs text-content-secondary">
                      ...
                    </span>
                  );
                }

                return null;
              })}
            </div>

            {/* Next Page */}
            <button
              type="button"
              disabled={!hasNextPage || pageNumber >= totalPages}
              onClick={() => onPageChange(pageNumber + 1)}
              className="inline-flex items-center gap-1 rounded-xl border border-line bg-surface px-3 py-2 text-xs font-semibold text-content-primary shadow-2xs transition-colors hover:bg-surface-muted disabled:pointer-events-none disabled:opacity-40 cursor-pointer"
              aria-label="Trang tiếp theo"
            >
              <span>Sau</span>
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
