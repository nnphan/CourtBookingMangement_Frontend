import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const BranchOverviewSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
    <div className="space-y-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs sm:p-6 lg:col-span-2">
      <Skeleton className="h-6 w-48" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full sm:col-span-2" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-20 w-full sm:col-span-2" />
      </div>
    </div>
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-10 w-full rounded-xl mt-4" />
      </div>
    </div>
  </div>
);

export const CourtTabSkeleton: React.FC = () => (
  <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
    <Skeleton className="h-6 w-36" />
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-xl" />
      ))}
    </div>
  </div>
);

export const PricingTabSkeleton: React.FC = () => (
  <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
    <Skeleton className="h-6 w-36" />
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-32 w-full rounded-2xl" />
      ))}
    </div>
  </div>
);

export const BranchDetailSkeleton: React.FC = () => (
  <div className="w-full space-y-6 max-w-6xl mx-auto">
    <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-4 w-36" />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-9 w-20 rounded-xl" />
        <Skeleton className="h-9 w-20 rounded-xl" />
      </div>
    </div>
    <Skeleton className="h-12 w-full rounded-2xl" />
    <BranchOverviewSkeleton />
  </div>
);
