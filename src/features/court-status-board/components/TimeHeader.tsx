import React, { memo, useMemo } from 'react';
import type { TimeSlot } from '../types/common';
import { Menu } from 'lucide-react';
import { BOUNDARY_PADDING_PX, SCHEDULER_CONFIG, SLOT_WIDTH } from '../constants/scheduler';
import { CourtStatusTimelineHeader } from '@/features/court-status/shared/components/CourtStatusTimelineHeader';

interface TimeHeaderProps {
  timeSlots: TimeSlot[];
  slotWidth?: number;
  timelineWidth?: number;
  closeTime?: string;
  currentTimeOffsetPx?: number | null;
  currentTimeLabel?: string;
}

export const TimeHeader: React.FC<TimeHeaderProps> = memo(
  ({
    timeSlots,
    slotWidth = SLOT_WIDTH,
    timelineWidth,
    closeTime = SCHEDULER_CONFIG.END_TIME,
    currentTimeOffsetPx = null,
    currentTimeLabel,
  }) => {
    const totalGridWidth = Math.round(timeSlots.length * slotWidth);
    const effectiveTimelineWidth = timelineWidth ?? totalGridWidth + BOUNDARY_PADDING_PX;
    const boundaries = useMemo(
      () =>
        timeSlots.map((slot) => ({
          key: slot.time,
          offsetPx: Math.round(slot.slotIndex * slotWidth),
          isMajor: slot.time.endsWith(':00'),
        })),
      [timeSlots, slotWidth],
    );
    const labels = useMemo(
      () =>
        timeSlots
          .filter((slot) => slot.time.endsWith(':00') || slot.minutesFromStart % 60 === 0)
          .map((slot) => ({
            key: slot.time,
            offsetPx: Math.round(slot.slotIndex * slotWidth),
            label: slot.formattedTime,
          })),
      [timeSlots, slotWidth],
    );

    return (
      <CourtStatusTimelineHeader
        courtColumnWidth={SCHEDULER_CONFIG.TOTAL_LEFT_COLUMN_WIDTH}
        timelineWidth={effectiveTimelineWidth}
        gridWidth={totalGridWidth}
        boundaries={boundaries}
        labels={labels}
        closeTime={closeTime}
        currentTimeOffsetPx={currentTimeOffsetPx}
        currentTimeLabel={currentTimeLabel}
        cornerContent={
          <>
            <span className="text-xs font-bold text-slate-800">Sân</span>
            <button
              type="button"
              aria-label="Cài đặt bảng lịch"
              className="grid size-7 place-items-center rounded-sm text-slate-600 hover:bg-black/5 active:scale-95"
            >
              <Menu className="size-4 stroke-[2]" />
            </button>
          </>
        }
      />
    );
  },
);

TimeHeader.displayName = 'TimeHeader';
