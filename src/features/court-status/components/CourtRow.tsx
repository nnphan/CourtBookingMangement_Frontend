import React, { memo, useMemo } from 'react';
import type { CourtStatusCourtDto, CourtScheduleItemDto } from '../types/court-status.types';
import { getCourtStatusInfo } from '../types/court-status.types';
import { isPastSlot, isBookedSlot } from '../utils/time-selection.utils';
import { BookingCard } from './BookingCard';
import { TimeSlotCell } from './TimeSlotCell';
import { cn } from '@/lib/utils';

export interface CourtRowProps {
  court: CourtStatusCourtDto;
  bookings: CourtScheduleItemDto[];
  timelineHours: string[];
  openTime: string;
  hourWidth: number;
  rowHeight?: number;
  courtColumnWidth: number;
  selectedDate: string;
  onSelectBooking?: (bookingId: string, item: CourtScheduleItemDto) => void;
  onMouseDown?: (court: CourtStatusCourtDto, hour: string, e: React.MouseEvent) => void;
  onMouseEnter?: (court: CourtStatusCourtDto, hour: string) => void;
  onMouseUp?: () => void;
  onTouchStart?: (court: CourtStatusCourtDto, hour: string, e: React.TouchEvent) => void;
  onTouchEnd?: () => void;
  onClickSlot?: (court: CourtStatusCourtDto, hour: string) => void;
}

export const CourtRow: React.FC<CourtRowProps> = memo(
  ({
    court,
    bookings,
    timelineHours,
    openTime,
    hourWidth,
    rowHeight = 48,
    courtColumnWidth,
    selectedDate,
    onSelectBooking,
    onMouseDown,
    onMouseEnter,
    onMouseUp,
    onTouchStart,
    onTouchEnd,
    onClickSlot,
  }) => {
    const statusInfo = useMemo(() => getCourtStatusInfo(court.status), [court.status]);
    const totalTimelineWidth = timelineHours.length * hourWidth;
    const normalizedCourtStatus = (court.status || 'active').trim().toLowerCase();
    const isMaintenanceOrInactive =
      normalizedCourtStatus === 'maintenance' || normalizedCourtStatus === 'inactive';

    return (
      <div
        role="row"
        style={{ height: `${rowHeight}px`, minHeight: '48px' }}
        className="group/row relative flex border-b border-slate-200/90 bg-white transition-colors select-none hover:bg-slate-50/50"
      >
        {/* Left Sticky Court Cell */}
        <div
          role="rowheader"
          style={{ width: `${courtColumnWidth}px` }}
          className={cn(
            'sticky left-0 z-20 flex shrink-0 items-center justify-between border-r border-slate-200 bg-[#f7faf8] px-3 py-2 text-xs shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)] backdrop-blur-xs select-none',
            normalizedCourtStatus === 'maintenance' && 'bg-amber-50/80',
            normalizedCourtStatus === 'inactive' && 'bg-slate-100 opacity-60',
          )}
        >
          <div className="flex flex-col truncate pr-1">
            <span className="truncate text-xs font-bold text-slate-800 sm:text-sm">
              {court.courtName}
            </span>
            <span className="truncate text-[10px] font-medium text-slate-500">
              {statusInfo.label}
            </span>
          </div>

          {/* Court Status Indicator Dot */}
          <span
            className={cn('size-2 shrink-0 rounded-full shadow-2xs', statusInfo.dotClass)}
            title={`${court.courtName}: ${statusInfo.label}`}
          />
        </div>

        {/* Timeline Grid Cells Container with Bookings Layer */}
        <div
          className="relative flex flex-1 shrink-0 touch-none"
          style={{ width: `${totalTimelineWidth}px` }}
        >
          {/* Background Hourly Grid Cells */}
          {timelineHours.map((hour) => {
            const isPast = isPastSlot(selectedDate, hour) || isMaintenanceOrInactive;
            const isBooked = isBookedSlot(court.courtId, hour, bookings);

            return (
              <TimeSlotCell
                key={hour}
                courtId={court.courtId}
                courtName={court.courtName}
                slotTime={hour}
                hourWidth={hourWidth}
                isPast={isPast}
                isBooked={isBooked}
                onMouseDown={(e) => onMouseDown?.(court, hour, e)}
                onMouseEnter={() => onMouseEnter?.(court, hour)}
                onMouseUp={onMouseUp}
                onTouchStart={(e) => onTouchStart?.(court, hour, e)}
                onTouchEnd={onTouchEnd}
                onClick={() => onClickSlot?.(court, hour)}
              />
            );
          })}

          {/* Render Booking Cards Layer */}
          <div className="pointer-events-none absolute inset-0 z-10">
            {bookings.map((booking) => (
              <div key={booking.bookingId} className="pointer-events-auto">
                <BookingCard
                  item={booking}
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
