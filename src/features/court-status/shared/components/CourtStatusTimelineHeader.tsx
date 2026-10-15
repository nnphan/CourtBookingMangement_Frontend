import React, { memo } from 'react';
import { cn } from '@/lib/utils';

export interface CourtStatusTimelineMarker {
  key: string;
  offsetPx: number;
  label?: string;
  isMajor?: boolean;
}

interface CourtStatusTimelineHeaderProps {
  courtColumnWidth: number;
  timelineWidth: number;
  gridWidth: number;
  boundaries: CourtStatusTimelineMarker[];
  labels: CourtStatusTimelineMarker[];
  closeTime: string;
  currentTimeOffsetPx?: number | null;
  currentTimeLabel?: string;
  cornerContent?: React.ReactNode;
}

export const CourtStatusTimelineHeader: React.FC<CourtStatusTimelineHeaderProps> = memo(
  ({
    courtColumnWidth,
    timelineWidth,
    gridWidth,
    boundaries,
    labels,
    closeTime,
    currentTimeOffsetPx = null,
    currentTimeLabel,
    cornerContent = 'Sân',
  }) => (
    <div
      role="row"
      aria-label="Khung giờ"
      className="sticky top-0 z-30 flex h-11 w-full border-b border-[#c8ded2] bg-[#ebf6f0] shadow-2xs select-none"
    >
      <div
        style={{ width: `${courtColumnWidth}px` }}
        className="sticky left-0 z-40 flex shrink-0 items-center justify-between border-r border-[#c8ded2] bg-[#ebf6f0] px-3 text-slate-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)]"
      >
        {cornerContent}
      </div>

      <div className="relative h-full shrink-0" style={{ width: `${timelineWidth}px` }}>
        {boundaries.map((boundary) => (
          <div
            key={boundary.key}
            aria-hidden="true"
            style={{ left: `${boundary.offsetPx}px` }}
            className="pointer-events-none absolute bottom-0 -translate-x-1/2"
          >
            <div
              className={cn('w-px', boundary.isMajor ? 'h-2.5 bg-[#8ab89f]' : 'h-1.5 bg-[#c8ded2]')}
            />
          </div>
        ))}

        {labels.map((marker, index) => (
          <div
            key={marker.key}
            role="columnheader"
            style={{ left: `${marker.offsetPx}px` }}
            className={cn(
              'pointer-events-none absolute top-0 bottom-0 flex -translate-x-1/2 flex-col items-center select-none',
              index === 0 ? 'z-50' : 'z-20',
            )}
          >
            <span className="bg-[#ebf6f0] px-1.5 pt-2 text-xs leading-none font-bold whitespace-nowrap text-slate-700">
              {marker.label}
            </span>
          </div>
        ))}

        <div
          role="columnheader"
          style={{ left: `${gridWidth}px` }}
          className="pointer-events-none absolute top-0 bottom-0 z-20 flex -translate-x-1/2 flex-col items-center select-none"
        >
          <span className="bg-[#ebf6f0] px-1.5 pt-2 text-xs leading-none font-bold whitespace-nowrap text-slate-700">
            {closeTime}
          </span>
          <div className="mt-auto h-2.5 w-px bg-[#8ab89f]" />
        </div>

        {currentTimeOffsetPx !== null && (
          <div
            style={{ left: `${currentTimeOffsetPx}px` }}
            className="pointer-events-none absolute top-0 bottom-0 z-35 flex -translate-x-1/2 flex-col items-center"
          >
            {currentTimeLabel && (
              <span className="mt-1 rounded-full bg-rose-600 px-1.5 py-0.5 text-[10px] leading-none font-bold whitespace-nowrap text-white shadow-xs">
                {currentTimeLabel}
              </span>
            )}
            <div className="mt-auto size-2 rounded-full bg-rose-600 ring-2 ring-white" />
          </div>
        )}
      </div>
    </div>
  ),
);

CourtStatusTimelineHeader.displayName = 'CourtStatusTimelineHeader';
