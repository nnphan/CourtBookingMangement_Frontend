import React, { memo } from 'react';

export interface CourtTimelineProps {
  timelineHours: string[];
  hourWidth: number;
  courtColumnWidth: number;
  courtCount: number;
  currentTimeOffsetPx?: number | null;
  currentTimeLabel?: string;
}

export const CourtTimeline: React.FC<CourtTimelineProps> = memo(
  ({
    timelineHours,
    hourWidth,
    courtColumnWidth,
    courtCount,
    currentTimeOffsetPx = null,
    currentTimeLabel = '',
  }) => {
    return (
      <div className="sticky top-0 z-30 flex h-11 border-b border-slate-200 bg-slate-100/95 backdrop-blur-md shadow-2xs select-none">
        {/* Sticky Court Column Header */}
        <div
          style={{ width: `${courtColumnWidth}px` }}
          className="sticky left-0 z-40 flex shrink-0 items-center justify-between border-r border-slate-200 bg-slate-200/95 px-3 font-bold text-xs text-slate-800 backdrop-blur-md shadow-xs"
        >
          <span>Sân</span>
          <span className="text-[10px] text-slate-500 font-semibold bg-white/60 px-1.5 py-0.5 rounded-full">
            {courtCount}
          </span>
        </div>

        {/* Dynamic Timeline Columns */}
        <div className="relative flex flex-1">
          {timelineHours.map((hour) => (
            <div
              key={hour}
              style={{ width: `${hourWidth}px` }}
              className="flex shrink-0 items-center justify-center border-r border-slate-200/70 text-xs font-semibold text-slate-700"
            >
              <span>{hour}</span>
            </div>
          ))}

          {/* Current Time Indicator Pointer in Header */}
          {currentTimeOffsetPx !== null && (
            <div
              style={{ left: `${currentTimeOffsetPx}px` }}
              className="absolute top-0 bottom-0 z-50 flex -translate-x-1/2 flex-col items-center pointer-events-none"
            >
              <span className="rounded bg-rose-600 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
                {currentTimeLabel || 'Hiện tại'}
              </span>
              <div className="size-1.5 rotate-45 bg-rose-600 -mt-0.5" />
            </div>
          )}
        </div>
      </div>
    );
  },
);

CourtTimeline.displayName = 'CourtTimeline';
export default CourtTimeline;
