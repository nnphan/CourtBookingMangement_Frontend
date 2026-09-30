import React, { memo, useMemo } from 'react';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import type { CustomerGeneratedTimeSlot } from '../services/customer-court-status.service';
import {
  BOUNDARY_PADDING_PX,
  COURT_COLUMN_WIDTH,
  CUSTOMER_SCHEDULER_CONFIG,
  SCHEDULER_CONFIG,
  SLOT_WIDTH,
} from '../constants/customer-scheduler.config';
import { cn } from '@/lib/utils';

dayjs.extend(customParseFormat);

interface CustomerTimeHeaderProps {
  timeSlots: CustomerGeneratedTimeSlot[];
  slotWidth?: number;
  timelineWidth?: number;
  closeTime?: string;
  currentTimeOffsetPx?: number | null;
  currentTimeLabel?: string;
}

export const CustomerTimeHeader: React.FC<CustomerTimeHeaderProps> = memo(
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

    // Filter only hourly labels (minute === 0 or minutesFromStart % 60 === 0)
    const headerLabels = useMemo(
      () =>
        timeSlots.filter((slot) => {
          const minute = dayjs(slot.time, 'HH:mm').minute();
          return minute === 0 || slot.minutesFromStart % 60 === 0;
        }),
      [timeSlots],
    );

    return (
      <div
        role="row"
        aria-label="Khung giờ"
        style={{ height: CUSTOMER_SCHEDULER_CONFIG.TIME_HEADER_HEIGHT }}
        className="sticky top-0 z-30 flex w-full select-none border-b border-[#c8ded2] bg-[#ebf7f0] shadow-2xs"
      >
        {/* Sticky top-left corner above Court column */}
        <div
          style={{ width: `${COURT_COLUMN_WIDTH}px` }}
          className="sticky left-0 z-40 shrink-0 bg-[#ebf7f0] border-r border-[#c8ded2] font-bold text-xs text-slate-800 flex items-center justify-between px-3 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)]"
        >
          <span>Sân</span>
        </div>

        {/* Time Slots Header Track (reserves space for closing boundary label) */}
        <div
          className="relative flex shrink-0 h-full"
          style={{ width: `${effectiveTimelineWidth}px` }}
        >
          {/* Boundary ticks for all grid boundaries */}
          {timeSlots.map((slot, index) => {
            const x = Math.round(index * slotWidth);

            return (
              <div
                key={`tick-${slot.time}`}
                style={{
                  position: 'absolute',
                  left: `${x}px`,
                }}
                className="bottom-0 -translate-x-1/2 pointer-events-none select-none"
              >
                <div
                  className={cn(
                    'w-px',
                    slot.isMajorHour ? 'h-2.5 bg-[#8ab89f]' : 'h-1.5 bg-[#c8ded2]',
                  )}
                />
              </div>
            );
          })}

          {/* Hourly Time Labels (05:00, 06:00, 07:00...) positioned on exact Slot Boundaries */}
          {headerLabels.map((slot) => {
            const x = Math.round(slot.slotIndex * slotWidth);
            const isFirst = slot.slotIndex === 0;

            return (
              <div
                key={`marker-${slot.time}`}
                role="columnheader"
                style={{
                  position: 'absolute',
                  left: `${x}px`,
                }}
                className={cn(
                  'top-0 bottom-0 flex flex-col items-center -translate-x-1/2 pointer-events-none select-none',
                  isFirst ? 'z-50' : 'z-20',
                )}
              >
                <span className="text-xs font-bold text-slate-700 tracking-tight whitespace-nowrap bg-[#ebf7f0] px-1.5 pt-2 leading-none">
                  {slot.formattedTime}
                </span>
              </div>
            );
          })}

          {/* Closing END_TIME (e.g. 23:00) boundary marker at final right grid line */}
          {timeSlots.length > 0 && (
            <div
              role="columnheader"
              style={{
                position: 'absolute',
                left: `${totalGridWidth}px`,
              }}
              className="top-0 bottom-0 z-20 flex flex-col items-center -translate-x-1/2 pointer-events-none select-none"
            >
              <span className="text-xs font-bold text-slate-700 tracking-tight whitespace-nowrap bg-[#ebf7f0] px-1.5 pt-2 leading-none">
                {closeTime}
              </span>
              <div className="mt-auto w-px h-2.5 bg-[#8ab89f]" />
            </div>
          )}

          {/* Current Time Indicator Badge in Header */}
          {currentTimeOffsetPx !== null && (
            <div
              style={{
                position: 'absolute',
                left: `${currentTimeOffsetPx}px`,
              }}
              className="top-0 bottom-0 z-35 flex flex-col items-center -translate-x-1/2 pointer-events-none"
            >
              {currentTimeLabel && (
                <span className="mt-1 rounded-full bg-rose-600 px-1.5 py-0.5 text-[10px] font-bold text-white leading-none shadow-xs whitespace-nowrap">
                  {currentTimeLabel}
                </span>
              )}
              <div className="mt-auto size-2 rounded-full bg-rose-600 ring-2 ring-white" />
            </div>
          )}
        </div>
      </div>
    );
  },
);

CustomerTimeHeader.displayName = 'CustomerTimeHeader';




