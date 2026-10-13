import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const BookingDetailSkeleton: React.FC = () => {
  return (
    <div className="space-y-5 py-4 animate-pulse" aria-busy="true" aria-label="Đang tải chi tiết đặt sân">
      {/* Header Skeleton */}
      <div className="space-y-2 pb-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-4 w-36 rounded" />
        </div>
      </div>

      {/* Customer Info Card Skeleton */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
        <Skeleton className="h-3.5 w-28 rounded" />
        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-2.5">
            <Skeleton className="size-4 rounded-full" />
            <Skeleton className="h-4 w-40 rounded" />
          </div>
          <div className="flex items-center gap-2.5">
            <Skeleton className="size-4 rounded-full" />
            <Skeleton className="h-3.5 w-32 rounded" />
          </div>
        </div>
      </div>

      {/* Booking Details Card Skeleton */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
        <Skeleton className="h-3.5 w-32 rounded" />
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="space-y-1">
            <Skeleton className="h-3 w-16 rounded" />
            <Skeleton className="h-4 w-24 rounded" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-3 w-16 rounded" />
            <Skeleton className="h-4 w-24 rounded" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-3 w-16 rounded" />
            <Skeleton className="h-4 w-28 rounded" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-3 w-16 rounded" />
            <Skeleton className="h-4 w-20 rounded" />
          </div>
        </div>
      </div>

      {/* Booking Type Card Skeleton */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-2">
        <Skeleton className="h-3.5 w-28 rounded" />
        <Skeleton className="h-4 w-20 rounded" />
      </div>

      {/* Payment Details Card Skeleton */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
        <Skeleton className="h-3.5 w-36 rounded" />
        <div className="space-y-2 pt-1">
          <div className="flex justify-between items-center">
            <Skeleton className="h-3.5 w-28 rounded" />
            <Skeleton className="h-4 w-24 rounded" />
          </div>
          <div className="flex justify-between items-center">
            <Skeleton className="h-3.5 w-28 rounded" />
            <Skeleton className="h-5 w-28 rounded-full" />
          </div>
          <div className="h-px bg-slate-200 my-1.5" />
          <div className="flex justify-between items-center">
            <Skeleton className="h-3.5 w-20 rounded" />
            <Skeleton className="h-4 w-24 rounded" />
          </div>
          <div className="flex justify-between items-center">
            <Skeleton className="h-3.5 w-24 rounded" />
            <Skeleton className="h-4 w-24 rounded" />
          </div>
          <div className="flex justify-between items-center">
            <Skeleton className="h-3.5 w-20 rounded" />
            <Skeleton className="h-4 w-24 rounded" />
          </div>
        </div>
      </div>

      {/* Notes Card Skeleton */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-2">
        <Skeleton className="h-3.5 w-20 rounded" />
        <Skeleton className="h-4 w-full rounded" />
      </div>
    </div>
  );
};
