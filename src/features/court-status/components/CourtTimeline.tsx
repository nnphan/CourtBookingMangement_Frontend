import React, { memo } from 'react';
import { CourtStatusTimelineHeader } from '@/features/court-status/shared/components/CourtStatusTimelineHeader';

export interface CourtTimelineProps {
  timelineHours: string[];
  hourWidth: number;
  courtColumnWidth: number;
  courtCount: number;
  closeTime: string;
  timelineWidth: number;
  currentTimeOffsetPx?: number | null;
  currentTimeLabel?: string;
}

export const CourtTimeline: React.FC<CourtTimelineProps> = memo(
  ({
    timelineHours,
    hourWidth,
    courtColumnWidth,
    courtCount,
    closeTime,
    timelineWidth,
    currentTimeOffsetPx = null,
    currentTimeLabel = '',
  }) => {
    const gridWidth = Math.round(timelineHours.length * hourWidth);
    return (
      <CourtStatusTimelineHeader
        courtColumnWidth={courtColumnWidth}
        timelineWidth={timelineWidth}
        gridWidth={gridWidth}
        boundaries={timelineHours.map((hour, index) => ({
          key: hour,
          offsetPx: index * hourWidth,
          isMajor: true,
        }))}
        labels={timelineHours.map((hour, index) => ({
          key: hour,
          offsetPx: index * hourWidth,
          label: hour,
        }))}
        closeTime={closeTime}
        currentTimeOffsetPx={currentTimeOffsetPx}
        currentTimeLabel={currentTimeLabel || 'Hiện tại'}
        cornerContent={
          <>
            <span className="text-xs font-bold text-slate-800">Sân</span>
            <span className="rounded-full bg-white/60 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
              {courtCount}
            </span>
          </>
        }
      />
    );
  },
);

CourtTimeline.displayName = 'CourtTimeline';
export default CourtTimeline;
