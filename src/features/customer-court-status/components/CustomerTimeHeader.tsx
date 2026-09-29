import React, { memo } from 'react';
import type { CustomerGeneratedTimeSlot } from '../services/customer-court-status.service';
import { CUSTOMER_SCHEDULER_CONFIG } from '../constants/customer-scheduler.config';

interface CustomerTimeHeaderProps {
  timeSlots: CustomerGeneratedTimeSlot[];
  slotWidth: number;
}

export const CustomerTimeHeader: React.FC<CustomerTimeHeaderProps> = memo(
  ({ timeSlots, slotWidth }) => {
    return (
      <div className="sticky top-0 z-30 flex h-7 bg-[#ebf7f0] border-b border-slate-300 select-none">
        {/* Sticky top-left empty corner above Court column */}
        <div
          style={{ width: CUSTOMER_SCHEDULER_CONFIG.COURT_COL_WIDTH }}
          className="sticky left-0 z-40 shrink-0 bg-[#ebf7f0] border-r border-slate-300 font-semibold text-[11px] text-slate-700 flex items-center justify-center"
        >
          Sân
        </div>

        {/* Time ticks track */}
        <div className="flex relative">
          {timeSlots.map((slot) => {
            return (
              <div
                key={slot.time}
                style={{ width: slotWidth }}
                className="shrink-0 h-full border-r border-slate-200 flex flex-col justify-end items-start px-0.5 text-[11px] font-medium text-slate-600 overflow-visible relative"
              >
                {slot.isMajorHour && (
                  <span className="absolute -top-0.5 left-1 text-[11px] font-semibold text-slate-700 whitespace-nowrap">
                    {slot.formattedHour}
                  </span>
                )}
                {/* Tick mark */}
                <div
                  className={`w-px ${
                    slot.isMajorHour ? 'h-2 bg-slate-400' : 'h-1 bg-slate-300'
                  }`}
                />
              </div>
            );
          })}
          {/* Final 24:00 label tick at the right end */}
          <div className="absolute right-0 top-0 h-full flex flex-col justify-end items-end px-0.5 text-[11px] font-semibold text-slate-700">
            <span className="absolute -top-0.5 right-1 whitespace-nowrap">24:00</span>
            <div className="w-px h-2 bg-slate-400" />
          </div>
        </div>
      </div>
    );
  },
);

CustomerTimeHeader.displayName = 'CustomerTimeHeader';
