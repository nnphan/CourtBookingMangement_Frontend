import React, { memo, useMemo } from 'react';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import type { TimeSlot } from '../types/common';
import { Menu } from 'lucide-react';
import { SCHEDULER_CONFIG, SLOT_WIDTH } from '../constants/scheduler';
import { cn } from '@/lib/utils';

dayjs.extend(customParseFormat);

interface TimeHeaderProps {
  timeSlots: TimeSlot[];
  slotWidth?: number;
  currentTimeOffsetPx?: number | null;
  currentTimeLabel?: string;
}

export const TimeHeader: React.FC<TimeHeaderProps> = memo(
  ({
    timeSlots,
    slotWidth = SLOT_WIDTH,
    currentTimeOffsetPx = null,
    currentTimeLabel,
  }) => {
    // Separate timeline header labels (60-minute major hours: minute === 0) from 30-minute scheduler slots
    const headerLabels = useMemo(
      () =>
        timeSlots.filter((slot) => {
          const minute = dayjs(slot.time, 'HH:mm').minute();
          return minute === 0 || slot.time.endsWith(':00');
        }),
      [timeSlots],
    );

    return (
      <div
        role="row"
        aria-label="Khung giờ"
        style={{ height: `${SCHEDULER_CONFIG.TIME_HEADER_HEIGHT}px` }}
        className="sticky top-0 z-30 flex w-full select-none border-b border-[#c8ded2] bg-[#ebf6f0] shadow-2xs"
      >
        {/* Top Left Corner Header (matches 140px court column width) */}
        <div
          style={{ width: `${SCHEDULER_CONFIG.TOTAL_LEFT_COLUMN_WIDTH}px` }}
          className="sticky left-0 z-40 flex shrink-0 items-center justify-between border-r border-[#c8ded2] bg-[#ebf6f0] px-3 text-slate-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)]"
        >
          <span className="text-xs font-bold text-slate-800">Sân</span>
          <button
            type="button"
            aria-label="Cài đặt bảng lịch"
            className="grid size-7 place-items-center rounded-sm hover:bg-black/5 text-slate-600 active:scale-95 cursor-pointer"
          >
            <Menu className="size-4 stroke-[2]" />
          </button>
        </div>

        {/* Time Slots Header */}
        <div
          className="relative flex shrink-0 h-full"
          style={{ width: `${timeSlots.length * slotWidth}px` }}
        >
          {/* Subtle boundary ticks for all grid boundaries */}
          {timeSlots.map((slot, index) => {
            const x = index * slotWidth;
            const isMajorHour = slot.time.endsWith(':00');

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
                    isMajorHour ? 'h-2.5 bg-[#8ab89f]' : 'h-1.5 bg-[#c8ded2]',
                  )}
                />
              </div>
            );
          })}

          {/* Hourly Time Labels (05:00, 06:00, 07:00...) positioned at exact Slot Boundaries */}
          {headerLabels.map((slot) => {
            const x = slot.slotIndex * slotWidth;
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
                <span className="text-xs font-bold text-slate-700 tracking-tight whitespace-nowrap bg-[#ebf6f0] px-1.5 pt-2 leading-none">
                  {slot.formattedTime}
                </span>
              </div>
            );
          })}

          {/* Closing END_TIME (23:00) boundary marker at final right grid line */}
          {timeSlots.length > 0 && (
            <div
              role="columnheader"
              style={{
                position: 'absolute',
                left: `${timeSlots.length * slotWidth}px`,
              }}
              className="top-0 bottom-0 z-20 flex flex-col items-center -translate-x-1/2 pointer-events-none select-none"
            >
              <span className="text-xs font-bold text-slate-700 tracking-tight whitespace-nowrap bg-[#ebf6f0] px-1.5 pt-2 leading-none">
                {SCHEDULER_CONFIG.END_TIME}
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

TimeHeader.displayName = 'TimeHeader';



