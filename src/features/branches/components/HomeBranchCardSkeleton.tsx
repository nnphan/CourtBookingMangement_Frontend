import React from 'react';

export const HomeBranchCardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-xs animate-pulse">
      {/* Thumbnail Skeleton */}
      <div className="aspect-16/10 w-full bg-surface-muted" />

      {/* Body Skeleton */}
      <div className="flex flex-1 flex-col p-4 sm:p-5 space-y-4">
        {/* Title & Address */}
        <div className="space-y-2">
          <div className="h-5 w-3/4 rounded bg-surface-muted" />
          <div className="h-3 w-1/2 rounded bg-surface-muted" />
        </div>

        {/* Meta items */}
        <div className="space-y-2.5 pt-2 border-t border-line/60">
          <div className="h-3.5 w-2/5 rounded bg-surface-muted" />
          <div className="h-3.5 w-1/3 rounded bg-surface-muted" />
          <div className="h-3.5 w-3/5 rounded bg-surface-muted" />
        </div>

        {/* Amenities chips */}
        <div className="space-y-1.5 pt-2">
          <div className="h-2.5 w-16 rounded bg-surface-muted" />
          <div className="flex gap-1.5">
            <div className="h-5 w-16 rounded-md bg-surface-muted" />
            <div className="h-5 w-20 rounded-md bg-surface-muted" />
            <div className="h-5 w-14 rounded-md bg-surface-muted" />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-line flex items-center justify-between">
          <div className="space-y-1">
            <div className="h-2.5 w-14 rounded bg-surface-muted" />
            <div className="h-4 w-28 rounded bg-surface-muted" />
          </div>
          <div className="h-8 w-24 rounded-xl bg-surface-muted" />
        </div>
      </div>
    </div>
  );
};
