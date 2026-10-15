import React from 'react';

interface CourtStatusSchedulerSkeletonProps {
  ariaLabel: string;
  rowCount?: number;
  columnCount?: number;
  courtColumnWidth?: number;
}

export const CourtStatusSchedulerSkeleton: React.FC<CourtStatusSchedulerSkeletonProps> = ({
  ariaLabel,
  rowCount = 12,
  columnCount = 18,
  courtColumnWidth = 140,
}) => (
  <div
    role="status"
    aria-busy="true"
    aria-label={ariaLabel}
    className="flex h-full w-full flex-1 flex-col overflow-hidden bg-white select-none"
  >
    <div className="flex h-11 border-b border-slate-200 bg-slate-50/80">
      <div
        style={{ width: `${courtColumnWidth}px` }}
        className="flex shrink-0 items-center border-r border-slate-200 px-3"
      >
        <div className="h-4 w-14 rounded bg-slate-200" />
      </div>
      <div className="flex flex-1 overflow-hidden">
        {Array.from({ length: columnCount }, (_, index) => (
          <div
            key={index}
            className="flex w-[100px] shrink-0 items-center justify-center border-r border-slate-200/60 px-2"
          >
            <div className="h-3 w-10 rounded bg-slate-200" />
          </div>
        ))}
      </div>
    </div>

    <div className="flex-1 divide-y divide-slate-100 overflow-hidden">
      {Array.from({ length: rowCount }, (_, rowIndex) => (
        <div key={rowIndex} className="flex h-12">
          <div
            style={{ width: `${courtColumnWidth}px` }}
            className="flex shrink-0 items-center gap-2 border-r border-slate-200 bg-slate-50/50 px-3"
          >
            <div className="h-3.5 w-12 rounded bg-slate-200" />
            <div className="size-2 shrink-0 rounded-full bg-slate-200" />
          </div>
          <div className="relative flex flex-1 items-center">
            {Array.from({ length: columnCount }, (_, columnIndex) => (
              <div
                key={columnIndex}
                className="h-full w-[100px] shrink-0 border-r border-slate-100"
              />
            ))}
            {rowIndex % 3 === 0 && (
              <div
                style={{ left: `${(rowIndex % 5) * 100 + 40}px`, width: '180px' }}
                className="absolute h-8 rounded-md border border-slate-300/60 bg-slate-200/70"
              />
            )}
            {rowIndex % 4 === 1 && (
              <div
                style={{ left: `${(rowIndex % 7) * 100 + 20}px`, width: '140px' }}
                className="absolute h-8 rounded-md border border-slate-300/60 bg-slate-200/70"
              />
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
);
