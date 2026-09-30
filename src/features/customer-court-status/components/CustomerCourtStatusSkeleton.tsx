import React from 'react';
import { COURT_COLUMN_WIDTH } from '../constants/customer-scheduler.config';

export const CustomerCourtStatusSkeleton: React.FC = () => {
  return (
    <div className="w-full flex-1 flex flex-col bg-white animate-pulse overflow-hidden">
      {/* Timeline header skeleton */}
      <div className="flex h-11 border-b border-slate-200 bg-emerald-50/50">
        <div
          style={{ width: `${COURT_COLUMN_WIDTH}px` }}
          className="shrink-0 border-r border-slate-200 p-3 flex items-center"
        >
          <div className="h-3.5 w-20 bg-slate-200 rounded" />
        </div>
        <div className="flex-1 flex items-center gap-6 px-4 overflow-hidden">
          {Array.from({ length: 12 }).map((_, idx) => (
            <div key={idx} className="h-3 w-12 bg-slate-200 rounded shrink-0" />
          ))}
        </div>
      </div>

      {/* Court rows skeleton */}
      <div className="flex-1 flex flex-col divide-y divide-slate-100">
        {Array.from({ length: 8 }).map((_, rowIdx) => (
          <div key={rowIdx} className="flex h-12 items-center">
            <div
              style={{ width: `${COURT_COLUMN_WIDTH}px` }}
              className="shrink-0 h-full border-r border-slate-200 bg-emerald-50/30 px-3 flex items-center gap-2"
            >
              <div className="size-2 rounded-full bg-slate-300" />
              <div className="h-3.5 w-20 bg-slate-200 rounded" />
            </div>
            <div className="flex-1 flex items-center gap-3 px-3">
              <div className="h-7 w-32 bg-slate-100 rounded" />
              <div className="h-7 w-48 bg-slate-200/70 rounded" />
              <div className="h-7 w-24 bg-slate-100 rounded" />
              <div className="h-7 w-40 bg-slate-200/60 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

