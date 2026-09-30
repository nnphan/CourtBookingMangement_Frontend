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
      <div className="flex border-b border-slate-200 bg-slate-100 h-11">
        <div className="w-[140px] shrink-0 border-r border-slate-200 bg-slate-200/70" />
        <div className="flex flex-1 items-center gap-6 px-4 overflow-hidden">
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} className="h-4 w-12 shrink-0 rounded bg-slate-200" />
          ))}
        </div>
      </div>

      {/* Grid Rows */}
      <div className="flex-1 divide-y divide-slate-100 overflow-hidden bg-white">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex items-center h-12">
            <div className="h-full w-[140px] shrink-0 border-r border-slate-200 bg-slate-100/80 flex items-center px-3">
              <div className="h-3.5 w-20 rounded bg-slate-200" />
            </div>
            <div className="flex flex-1 items-center gap-4 px-4 overflow-hidden">
              <div className="h-8 w-[200px] shrink-0 rounded-md bg-emerald-100/70" />
              <div className="h-8 w-[100px] shrink-0 rounded-md bg-slate-100" />
              <div className="h-8 w-[300px] shrink-0 rounded-md bg-rose-100/60" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

CourtStatusSkeleton.displayName = 'CourtStatusSkeleton';
