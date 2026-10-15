import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

export interface CourtStatusSkeletonProps {
  rowCount?: number;
  courtColumnWidth?: number;
}

export const CourtStatusSkeleton: React.FC<CourtStatusSkeletonProps> = ({
  rowCount = 6,
  courtColumnWidth = 110,
}) => {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading Timeline"
      className="relative flex flex-col flex-1 h-full w-full bg-white overflow-hidden animate-in fade-in duration-200"
    >
      {/* Loading Timeline Banner */}
      <div className="flex items-center justify-center gap-2 bg-emerald-50/80 border-b border-emerald-100 py-2.5 px-4 text-xs font-semibold text-emerald-800">
        <Loader2 className="size-4 animate-spin text-emerald-600" />
        <span>Loading Timeline... (Đang tải dữ liệu trạng thái sân)</span>
      </div>

      {/* Header Skeleton */}
      <div className="flex h-11 border-b border-slate-200 bg-slate-100/90">
        <div
          style={{ width: `${courtColumnWidth}px` }}
          className="shrink-0 border-r border-slate-200 p-2.5 flex items-center"
        >
          <Skeleton className="h-4 w-14 rounded" />
        </div>
        <div className="flex flex-1 gap-2 p-2.5 overflow-hidden">
          {Array.from({ length: 14 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-16 shrink-0 rounded" />
          ))}
        </div>
      </div>

      {/* Rows Skeleton */}
      <div className="flex flex-col divide-y divide-slate-100 overflow-hidden">
        {Array.from({ length: rowCount }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex h-12 items-center">
            {/* Court cell */}
            <div
              style={{ width: `${courtColumnWidth}px` }}
              className="shrink-0 border-r border-slate-200 px-3 flex items-center justify-between"
            >
              <div className="space-y-1">
                <Skeleton className="h-3.5 w-12 rounded" />
                <Skeleton className="h-2.5 w-16 rounded" />
              </div>
              <Skeleton className="size-2 rounded-full" />
            </div>

            {/* Timeline slots & simulated booking blocks */}
            <div className="flex flex-1 items-center gap-4 px-4 overflow-hidden">
              {rowIndex % 2 === 0 ? (
                <>
                  <div className="w-24 shrink-0" />
                  <Skeleton className="h-8 w-44 rounded-md shadow-2xs" />
                  <div className="w-16 shrink-0" />
                  <Skeleton className="h-8 w-36 rounded-md shadow-2xs" />
                </>
              ) : (
                <>
                  <div className="w-48 shrink-0" />
                  <Skeleton className="h-8 w-56 rounded-md shadow-2xs" />
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourtStatusSkeleton;
