import React, { memo } from 'react';

export const CourtStatusSkeleton: React.FC = memo(() => {
  return (
    <div
      role="status"
      aria-label="Đang tải dữ liệu trạng thái sân"
      className="flex flex-col h-full w-full bg-slate-50 animate-pulse overflow-hidden"
    >
      {/* Top Filter Bar Skeleton */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[#0d6838]/80">
        <div className="h-9 w-36 rounded-lg bg-white/30" />
        <div className="h-9 w-60 rounded-lg bg-white/30" />
        <div className="h-9 w-24 rounded-lg bg-white/30" />
        <div className="h-9 w-36 rounded-lg bg-white/30" />
      </div>

      {/* Legend Skeleton */}
      <div className="flex gap-4 px-4 py-2 bg-[#0d6838]/90">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="size-3.5 rounded-xs bg-white/40" />
            <div className="h-3 w-14 rounded bg-white/40" />
          </div>
        ))}
      </div>

      {/* Grid Header */}
      <div className="flex border-b border-slate-200 bg-slate-100">
        <div className="w-28 h-10 border-r border-slate-200 bg-slate-200" />
        <div className="flex flex-1 gap-2 p-2">
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} className="h-6 w-16 rounded bg-slate-200" />
          ))}
        </div>
      </div>

      {/* Grid Rows */}
      <div className="flex-1 space-y-2 p-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-10 w-28 rounded bg-slate-200 shrink-0" />
            <div className="flex flex-1 items-center gap-3">
              <div className="h-10 w-32 rounded bg-slate-200" />
              <div className="h-10 w-48 rounded bg-slate-200" />
              <div className="h-10 w-24 rounded bg-slate-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

CourtStatusSkeleton.displayName = 'CourtStatusSkeleton';
