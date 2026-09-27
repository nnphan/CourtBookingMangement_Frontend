import React, { memo } from 'react';
import type { TimeSlot } from '../types/common';
import { Menu } from 'lucide-react';
import { SCHEDULER_CONFIG, SLOT_WIDTH } from '../constants/scheduler';
import { cn } from '@/lib/utils';

interface TimeHeaderProps {
  timeSlots: TimeSlot[];
  slotWidth?: number;
}

export const TimeHeader: React.FC<TimeHeaderProps> = memo(
  ({ timeSlots, slotWidth = SLOT_WIDTH }) => {
    return (
      <div
        role="row"
        aria-label="Khung giờ"
        className="sticky top-0 z-30 flex h-[42px] select-none border-b border-[#c8ded2] bg-[#ebf6f0]"
      >
        {/* Top Left Corner Header (matches court column width) */}
        <div
          style={{ width: `${SCHEDULER_CONFIG.TOTAL_LEFT_COLUMN_WIDTH}px` }}
          className="sticky left-0 z-40 flex shrink-0 items-center justify-center border-r border-[#c8ded2] bg-[#ebf6f0] px-2 text-slate-700 shadow-2xs"
        >
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
          {/* Slot Column Boundaries (Vertical Guide Lines in Header) */}
          {timeSlots.map((slot, index) => {
            const x = index * slotWidth;

            return (
              <div
                key={`col-${slot.time}`}
                role="columnheader"
                style={{
                  position: 'absolute',
                  left: `${x}px`,
                  width: `${slotWidth}px`,
                  height: '100%',
                }}
                className="border-r border-[#c8ded2] pointer-events-none"
              />
            );
          })}

          {/* Time Labels positioned exactly at Slot Boundaries */}
          {timeSlots.map((slot, index) => {
            const x = index * slotWidth;
            const isFirst = index === 0;

            return (
              <div
                key={`marker-${slot.time}`}
                style={{
                  position: 'absolute',
                  left: `${x}px`,
                }}
                className={cn(
                  'top-0 bottom-0 flex flex-col items-center -translate-x-1/2 pointer-events-none select-none',
                  isFirst ? 'z-50' : 'z-20',
                )}
              >
                {/* Time Label (5:00, 5:30, 6:00...) */}
                <span className="text-[11px] font-semibold text-slate-700 tracking-tight whitespace-nowrap bg-[#ebf6f0] px-1 pt-1.5 leading-none">
                  {slot.formattedTime}
                </span>

                {/* Vertical Tick Mark directly connecting to slot boundary line */}
                <div className="mt-auto w-px h-2 bg-[#9fc4af]" />
              </div>
            );
          })}
        </div>
      </div>
    );
  },
);

TimeHeader.displayName = 'TimeHeader';
