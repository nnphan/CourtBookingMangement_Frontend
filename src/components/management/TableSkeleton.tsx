import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { tableStyles } from './table-styles';

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className={tableStyles.container} aria-busy="true">
    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
      <Skeleton className="h-5 w-36" />
      <Skeleton className="h-5 w-24" />
    </div>
    <div className="divide-y divide-slate-100">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 flex items-center justify-between gap-4">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-64" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      ))}
    </div>
    <div className="p-4 border-t border-slate-100 flex items-center justify-between">
      <Skeleton className="h-4 w-44" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
    </div>
  </div>
);
