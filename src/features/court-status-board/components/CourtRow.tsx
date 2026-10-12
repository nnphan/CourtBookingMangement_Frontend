import React, { memo } from 'react';
import type { CourtStatusCourt, CourtScheduleItem } from '@/types/court-status';
import { BookingSlot } from './BookingSlot';
import { cn } from '@/lib/utils';

export interface CourtRowProps {
  court: CourtStatusCourt;
  scheduleItems: CourtScheduleItem[];
  timelineHours: string[];
  openTime: string;
  hourWidth: number;
  rowHeight?: number;
  courtColumnWidth?: number;
  onSelectBooking?: (booking: CourtScheduleItem) => void;
  onSlotClick?: (court: CourtStatusCourt, timeSlot: string) => void;
}

export const CourtRow: React.FC<CourtRowProps> = memo(
  ({
    court,
    scheduleItems,
    timelineHours,
    openTime,
    hourWidth,
    rowHeight = 44,
    courtColumnWidth = 100,
    onSelectBooking,
    onSlotClick,
  }) => {
    const isMaintenance =
      (court.status || '').toLowerCase() === 'maintenance' ||
      (court.status || '').toLowerCase() === 'inactive';

    return (
      <div
        role="row"
        style={{ height: `${rowHeight}px`, minHeight: '44px' }}
        className="flex border-b border-slate-200 bg-white transition-colors hover:bg-slate-50/40"
      >
        {/* Left Sticky Court Cell */}
        <div
          role="rowheader"
          style={{ width: `${courtColumnWidth}px` }}
          className={cn(
            'sticky left-0 z-20 flex shrink-0 items-center justify-between border-r border-slate-200 bg-slate-50/95 px-3 py-2 text-xs backdrop-blur-xs select-none shadow-xs',
            isMaintenance && 'opacity-60 bg-slate-100',
          )}
        >
          <div className="flex flex-col truncate">
            <span className="font-bold text-slate-800 text-[12px] truncate">
              {court.courtName}
            </span>
            <span className="text-[10px] text-slate-500 truncate">
              {court.status || 'Active'}
            </span>
          </div>
          <span
            className={cn(
              'size-2 rounded-full shrink-0',
              isMaintenance ? 'bg-amber-400' : 'bg-emerald-500',
            )}
            title={court.status || 'Active'}
          />
        </div>

        {/* Timeline Grid Cells Container with Bookings Layer */}
        <div className="relative flex-1 flex" style={{ width: `${timelineHours.length * hourWidth}px` }}>
          {/* Background Hourly Grid Cells */}
          {timelineHours.map((hour) => (
            <div
              key={hour}
              role="gridcell"
              style={{ width: `${hourWidth}px` }}
              onClick={() => onSlotClick?.(court, hour)}
              className="group relative h-full shrink-0 border-r border-slate-100/80 cursor-pointer transition-colors hover:bg-emerald-50/50 active:bg-emerald-100/70"
              title={`Chọn ${court.courtName} lúc ${hour}`}
            >
              <div className="absolute inset-0 hidden group-hover:flex items-center justify-center pointer-events-none">
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50/90 px-1 py-0.5 rounded shadow-2xs">
                  + {hour}
                </span>
              </div>
            </div>
          ))}

          {/* Render Booking Blocks */}
          <div className="pointer-events-none absolute inset-0 z-10">
            {scheduleItems.map((booking) => (
              <div key={booking.bookingId} className="pointer-events-auto">
                <BookingSlot
                  booking={booking}
                  openTime={openTime}
                  hourWidth={hourWidth}
                  rowHeight={rowHeight}
                  onClick={onSelectBooking}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  },
);

CourtRow.displayName = 'CourtRow';
export default CourtRow;
