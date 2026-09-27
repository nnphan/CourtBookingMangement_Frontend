import React, { memo } from 'react';

export const CustomerTableSkeleton: React.FC = memo(() => {
  return (
    <div className="w-full space-y-3 p-4 animate-pulse">
      {/* Header skeleton */}
      <div className="h-10 bg-slate-100 rounded-lg w-full" />
      {/* Row skeletons */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-3 border-b border-slate-100">
          <div className="h-4 bg-slate-100 rounded w-16" />
          <div className="h-4 bg-slate-100 rounded w-36" />
          <div className="h-4 bg-slate-100 rounded w-28" />
          <div className="h-4 bg-slate-100 rounded w-32 hidden md:block" />
          <div className="h-6 bg-slate-100 rounded-full w-20" />
          <div className="h-4 bg-slate-100 rounded w-12 hidden lg:block" />
          <div className="h-6 bg-slate-100 rounded-full w-24" />
          <div className="h-4 bg-slate-100 rounded w-20 hidden lg:block" />
          <div className="h-8 bg-slate-100 rounded-lg w-24 ml-auto" />
        </div>
      ))}
    </div>
  );
});

CustomerTableSkeleton.displayName = 'CustomerTableSkeleton';

export const CustomerDetailSkeleton: React.FC = memo(() => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 bg-slate-200 rounded w-48" />
          <div className="h-4 bg-slate-100 rounded w-32" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 bg-slate-200 rounded-lg w-24" />
          <div className="h-9 bg-slate-200 rounded-lg w-28" />
        </div>
      </div>

      {/* Grid of cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="h-72 bg-slate-100 rounded-2xl md:col-span-2" />
        <div className="h-72 bg-slate-100 rounded-2xl" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-24 bg-slate-100 rounded-xl" />
        ))}
      </div>

      {/* Booking history table */}
      <div className="h-80 bg-slate-100 rounded-2xl" />
    </div>
  );
});

CustomerDetailSkeleton.displayName = 'CustomerDetailSkeleton';

export const BookingHistorySkeleton: React.FC = memo(() => {
  return (
    <div className="space-y-3 p-4 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-12 bg-slate-100 rounded-xl w-full" />
      ))}
    </div>
  );
});

BookingHistorySkeleton.displayName = 'BookingHistorySkeleton';
