import React, { memo, useMemo } from 'react';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import type { CustomerGeneratedTimeSlot } from '../services/customer-court-status.service';
import {
  CUSTOMER_SCHEDULER_CONFIG,
  SCHEDULER_CONFIG,
  SLOT_WIDTH,
} from '../constants/customer-scheduler.config';
import { cn } from '@/lib/utils';

dayjs.extend(customParseFormat);

interface CustomerTimeHeaderProps {
  timeSlots: CustomerGeneratedTimeSlot[];
  slotWidth?: number;
}

export const CustomerTimeHeader: React.FC<CustomerTimeHeaderProps> = memo(
  ({ timeSlots, slotWidth = SLOT_WIDTH }) => {
    const totalGridWidth = timeSlots.length * slotWidth;

    // Filter only hourly labels (minute === 0)
    const headerLabels = useMemo(
      () =>
        timeSlots.filter((slot) => {
          const minute = dayjs(slot.time, 'HH:mm').minute();
          return minute === 0;
        }),
      [timeSlots],
    );

    return (
      <div
        role="row"
        aria-label="Khung giờ"
        style={{ height: CUSTOMER_SCHEDULER_CONFIG.TIME_HEADER_HEIGHT }}
        className="sticky top-0 z-30 flex select-none border-b border-[#c8ded2] bg-[#ebf7f0]"
      >
        {/* Sticky top-left corner above Court column */}
        <div
          style={{ width: `${CUSTOMER_SCHEDULER_CONFIG.COURT_COL_WIDTH}px` }}
          className="sticky left-0 z-40 shrink-0 bg-[#ebf7f0] border-r border-[#c8ded2] font-semibold text-[11px] text-slate-700 flex items-center justify-center"
        >
          Sân
        </div>

        {/* Time Slots Header Track */}
        <div
          className="relative flex shrink-0 h-full"
          style={{ width: `${totalGridWidth}px` }}
        >
          {/* Boundary ticks for all grid boundaries */}
          {timeSlots.map((slot, index) => {
            const x = index * slotWidth;

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
                    slot.isMajorHour ? 'h-2.5 bg-[#9fc4af]' : 'h-1.5 bg-[#c8ded2]',
                  )}
                />
              </div>
            );
          })}

          {/* Hourly Time Labels (05:00, 06:00, 07:00...) positioned on exact Slot Boundaries */}
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
                <span className="text-[11px] font-semibold text-slate-700 tracking-tight whitespace-nowrap bg-[#ebf7f0] px-1 pt-1.5 leading-none">
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
                left: `${totalGridWidth}px`,
              }}
              className="top-0 bottom-0 z-20 flex flex-col items-center -translate-x-1/2 pointer-events-none select-none"
            >
              <span className="text-[11px] font-semibold text-slate-700 tracking-tight whitespace-nowrap bg-[#ebf7f0] px-1 pt-1.5 leading-none">
                {SCHEDULER_CONFIG.END_TIME}
              </span>
              <div className="mt-auto w-px h-2.5 bg-[#9fc4af]" />
            </div>
          )}
        </div>
      </div>
    );
  },
);

CustomerTimeHeader.displayName = 'CustomerTimeHeader';



