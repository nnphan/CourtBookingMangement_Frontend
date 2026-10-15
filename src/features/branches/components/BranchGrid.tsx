import React from 'react';
import { AlertCircle, RotateCcw, SearchX } from 'lucide-react';
import type { BranchListItemDto } from '../types/branch.types';
import { HomeBranchCard } from './HomeBranchCard';
import { HomeBranchCardSkeleton } from './HomeBranchCardSkeleton';

export { HomeBranchCardSkeleton as BranchCardSkeleton } from './HomeBranchCardSkeleton';

export interface BranchGridProps {
  branches: BranchListItemDto[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  onClearFilters?: () => void;
  onQuickView?: (branchId: string) => void;
}

export const BranchGrid: React.FC<BranchGridProps> = ({
  branches,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  onClearFilters,
  onQuickView,
}) => {
  // Loading State: 9 Skeleton Cards (3 rows of 3 columns)
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 9 }).map((_, idx) => (
          <HomeBranchCardSkeleton key={idx} />
        ))}
      </div>
    );
  }

  // Error State: "Không thể tải danh sách sân." with "Thử lại" button
  if (isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50/70 p-8 text-center sm:p-12">
        <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-red-100 text-red-600 mb-3">
          <AlertCircle className="size-6" />
        </div>
        <h3 className="text-base font-bold text-red-900">Không thể tải danh sách sân.</h3>
        <p className="mt-1 text-xs text-red-700 max-w-md mx-auto">
          {errorMessage || 'Đã xảy ra sự cố khi kết nối với máy chủ. Vui lòng kiểm tra lại kết nối mạng.'}
        </p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition-all hover:bg-red-700 active:scale-95 cursor-pointer"
          >
            <RotateCcw className="size-3.5" />
            <span>Thử lại</span>
          </button>
        )}
      </div>
    );
  }

  // Empty State: "Không tìm thấy sân cầu lông phù hợp." with "Xóa bộ lọc" button
  if (branches.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-8 text-center sm:p-12 shadow-xs">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-surface-muted text-content-secondary mb-3">
          <SearchX className="size-7" />
        </div>
        <h3 className="text-base font-bold text-content-primary">
          Không tìm thấy sân cầu lông phù hợp.
        </h3>
        <p className="mt-1 text-xs text-content-secondary max-w-md mx-auto">
          Hãy thử tìm kiếm với từ khóa khác, thay đổi quận/huyện hoặc đặt lại bộ lọc tìm kiếm.
        </p>
        {onClearFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition-all hover:bg-brand-700 active:scale-95 cursor-pointer"
          >
            <RotateCcw className="size-3.5" />
            <span>Xóa bộ lọc</span>
          </button>
        )}
      </div>
    );
  }

  // Responsive Grid: Desktop 3 cols (xl:grid-cols-3), Tablet 2 cols (md:grid-cols-2), Mobile 1 col (grid-cols-1)
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {branches.map((branch) => (
        <HomeBranchCard
          key={branch.id}
          branch={branch}
          onQuickView={onQuickView}
        />
      ))}
    </div>
  );
};
