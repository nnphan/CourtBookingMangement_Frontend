import React from 'react';

export interface CourtStatusBoardSkeletonProps {
  rowCount?: number;
  columnCount?: number;
}

export const CourtStatusBoardSkeleton: React.FC<CourtStatusBoardSkeletonProps> = ({
  rowCount = 12,
  columnCount = 18,
}) => {
  return (
    <div
      role="status"
      aria-label="Loading court status board..."
      className="flex flex-col flex-1 h-full w-full bg-white animate-pulse overflow-hidden select-none"
    >
      {/* Top Header Skeleton */}
      <div className="flex h-11 border-b border-slate-200 bg-slate-50/80">
        {/* Top-left Court Column Header */}
        <div className="w-[100px] shrink-0 border-r border-slate-200 px-3 flex items-center">
          <div className="h-4 w-14 bg-slate-200 rounded" />
        </div>

        {/* Top Hours Cells */}
        <div className="flex flex-1 overflow-hidden">
          {Array.from({ length: columnCount }).map((_, i) => (
            <div
              key={i}
              className="w-[100px] shrink-0 border-r border-slate-200/60 px-2 flex items-center justify-center"
            >
              <div className="h-3 w-10 bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Rows Skeleton */}
      <div className="flex-1 overflow-hidden divide-y divide-slate-100">
        {Array.from({ length: rowCount }).map((_, rowIdx) => (
          <div key={rowIdx} className="flex h-11">
            {/* Court Name Skeleton */}
            <div className="w-[100px] shrink-0 border-r border-slate-200 px-3 flex items-center gap-2 bg-slate-50/50">
              <div className="h-3.5 w-12 bg-slate-200 rounded" />
              <div className="size-2 rounded-full bg-slate-200 shrink-0" />
            </div>

            {/* Grid Cells with occasional booking block skeleton */}
            <div className="flex flex-1 relative items-center">
              {Array.from({ length: columnCount }).map((_, colIdx) => (
                <div
                  key={colIdx}
                  className="w-[100px] h-full shrink-0 border-r border-slate-100"
                />
              ))}

              {/* Sample simulated booking block skeletons */}
              {rowIdx % 3 === 0 && (
                <div
                  style={{ left: `${(rowIdx % 5) * 100 + 40}px`, width: '180px' }}
                  className="absolute h-8 rounded-md bg-slate-200/70 border border-slate-300/60"
                />
              )}
              {rowIdx % 4 === 1 && (
                <div
                  style={{ left: `${(rowIdx % 7) * 100 + 20}px`, width: '140px' }}
                  className="absolute h-8 rounded-md bg-slate-200/70 border border-slate-300/60"
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourtStatusBoardSkeleton;
