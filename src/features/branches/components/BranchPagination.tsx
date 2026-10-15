import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PaginationMetadata } from '@/types/api';

export interface BranchPaginationProps {
  metadata: PaginationMetadata;
  onPageChange: (page: number) => void;
  className?: string;
}

/**
 * Enterprise Server-side Pagination Component for Branches
 * Displays Previous, Page numbers with smart ellipsis, and Next.
 * Example: < 1 2 3 4 5 >
 */
export const BranchPagination: React.FC<BranchPaginationProps> = ({
  metadata,
  onPageChange,
  className = '',
}) => {
  const { pageNumber, totalPages, totalCount, hasPreviousPage, hasNextPage } = metadata;

  if (totalPages <= 1) {
    return null;
  }

  // Generates page numbers with ellipsis algorithm
  const getPageNumbers = (): (number | 'ellipsis-start' | 'ellipsis-end')[] => {
    const pages: (number | 'ellipsis-start' | 'ellipsis-end')[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    // Always include page 1
    pages.push(1);

    const start = Math.max(2, pageNumber - 1);
    const end = Math.min(totalPages - 1, pageNumber + 1);

    if (start > 2) {
      pages.push('ellipsis-start');
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages - 1) {
      pages.push('ellipsis-end');
    }

    // Always include last page
    pages.push(totalPages);

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <nav
      role="navigation"
      aria-label="Phân trang chi nhánh"
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-line pt-6 ${className}`}
    >
      {/* Pagination Summary */}
      <p className="text-xs text-content-secondary">
        Hiển thị trang <span className="font-bold text-content-primary">{pageNumber}</span> trên tổng số{' '}
        <span className="font-bold text-content-primary">{totalPages}</span> trang
        {totalCount > 0 && (
          <>
            {' '}(tổng cộng <span className="font-bold text-content-primary">{totalCount}</span> chi nhánh)
          </>
        )}
      </p>

      {/* Pagination Controls */}
      <div className="flex items-center gap-1.5">
        {/* Previous Button */}
        <button
          type="button"
          disabled={!hasPreviousPage || pageNumber <= 1}
          onClick={() => onPageChange(pageNumber - 1)}
          className="inline-flex items-center justify-center gap-1 h-9 px-3 rounded-xl border border-line bg-surface text-xs font-semibold text-content-primary shadow-2xs transition-all hover:bg-surface-muted active:scale-95 disabled:pointer-events-none disabled:opacity-40 cursor-pointer"
          aria-label="Trang trước"
        >
          <ChevronLeft className="size-4" />
          <span className="hidden sm:inline">Trước</span>
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {pages.map((item, index) => {
            if (typeof item === 'string') {
              return (
                <span
                  key={`${item}-${index}`}
                  className="grid size-9 place-items-center text-xs font-medium text-content-secondary select-none"
                  aria-hidden="true"
                >
                  …
                </span>
              );
            }

            const isCurrent = item === pageNumber;

            return (
              <button
                key={item}
                type="button"
                onClick={() => onPageChange(item)}
                aria-current={isCurrent ? 'page' : undefined}
                className={`grid size-9 place-items-center rounded-xl text-xs font-bold transition-all cursor-pointer select-none ${
                  isCurrent
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'border border-line bg-surface text-content-primary hover:bg-surface-muted hover:border-brand-500/40 active:scale-95'
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          type="button"
          disabled={!hasNextPage || pageNumber >= totalPages}
          onClick={() => onPageChange(pageNumber + 1)}
          className="inline-flex items-center justify-center gap-1 h-9 px-3 rounded-xl border border-line bg-surface text-xs font-semibold text-content-primary shadow-2xs transition-all hover:bg-surface-muted active:scale-95 disabled:pointer-events-none disabled:opacity-40 cursor-pointer"
          aria-label="Trang tiếp theo"
        >
          <span className="hidden sm:inline">Sau</span>
          <ChevronRight className="size-4" />
        </button>
      </div>
    </nav>
  );
};
