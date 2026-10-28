import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { CourtStatusCourtDto } from '../types/court-status.types';
import type { CourtScheduleBlockViewModel } from '../types/court-schedule-block';
import { getCourtStatusInfo } from '../types/court-status.types';
import { isPastSlot, isBookedSlot } from '../utils/time-selection.utils';
import { TimeSlotCell } from './TimeSlotCell';
import { cn } from '@/lib/utils';
import { CourtStatusCourtNameCell } from '@/features/court-status/shared/components/CourtStatusCourtNameCell';
import { CourtStatusBookingFrame } from '@/features/court-status/shared/components/CourtStatusBookingFrame';
import { calculateBookingDimensions } from '../utils/timeline.utils';
import { COURT_SCHEDULE_STATUS_CLASSES } from '../types/court-schedule-status';

export interface CourtRowProps {
  court: CourtStatusCourtDto;
  bookings: CourtScheduleBlockViewModel[];
  timelineHours: string[];
  openTime: string;
  hourWidth: number;
  rowHeight?: number;
  courtColumnWidth: number;
  selectedDate: string;
  timezone: string;
  isBranchClosed: boolean;
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
    timezone,
    isBranchClosed,
    onMouseDown,
    onMouseEnter,
    onMouseUp,
    onTouchStart,
    onTouchEnd,
    onClickSlot,
  }) => {
    const { t } = useTranslation();
    const statusInfo = useMemo(() => getCourtStatusInfo(court.status), [court.status]);
    const totalTimelineWidth = timelineHours.length * hourWidth;
    const normalizedCourtStatus = (court.status || 'active').trim().toLowerCase();
    const isUnavailableCourt = normalizedCourtStatus !== 'active';

    return (
      <div
        role="row"
        style={{ height: `${rowHeight}px`, minHeight: '48px' }}
        className="group/row relative flex border-b border-slate-200/90 bg-white transition-colors select-none hover:bg-slate-50/50"
      >
        {/* Left Sticky Court Cell */}
        <CourtStatusCourtNameCell
          style={{ width: `${courtColumnWidth}px` }}
          className={cn(
            'sticky left-0 z-20 flex shrink-0 items-center justify-between border-r border-slate-200 bg-[#f7faf8] px-3 py-2 text-xs shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)] backdrop-blur-xs select-none',
            normalizedCourtStatus === 'maintenance' && 'bg-amber-50/80',
            isUnavailableCourt && 'bg-slate-100 opacity-60',
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
        </CourtStatusCourtNameCell>

        {/* Timeline Grid Cells Container with Bookings Layer */}
        <div
          className="relative flex flex-1 shrink-0 touch-none"
          style={{ width: `${totalTimelineWidth}px` }}
        >
          {/* Background Hourly Grid Cells */}
          {timelineHours.map((hour) => {
            const isPast =
              isPastSlot(selectedDate, hour, undefined, timezone) ||
              isUnavailableCourt ||
              isBranchClosed;
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
                isBranchClosed={isBranchClosed}
                disabledTitle={
                  isBranchClosed
                    ? t('courtStatus.closed.description')
                    : t('courtStatus.slot.past', { time: hour })
                }
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
            {bookings.map((booking) => {
              const { left, width } = calculateBookingDimensions(
                booking.startTime,
                booking.endTime,
                openTime,
                hourWidth,
              );
              const statusKey = booking.displayStatus
                .toLowerCase()
                .replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
              const statusLabel = t(`courtStatus.status.${statusKey}`);
              const timeRange = `${booking.startTime.slice(0, 5)} - ${booking.endTime.slice(0, 5)}`;
              const courtCount = t('courtStatus.booking.courtCount', {
                count: booking.bookingCourtCount,
              });
              const accessibleLabel = t('courtStatus.schedule.accessibleLabel', {
                courtName: court.courtName,
                startTime: booking.startTime.slice(0, 5),
                endTime: booking.endTime.slice(0, 5),
                status: statusLabel,
                bookingCode: booking.bookingCode,
                bookingType: booking.bookingType,
                courtCount,
              });

              return (
                <CourtStatusBookingFrame
                  key={booking.bookingDetailId}
                  left={left + 2}
                  width={Math.max(32, width - 4)}
                  height={rowHeight - 6}
                  role="gridcell"
                  ariaLabel={accessibleLabel}
                  className={cn(
                    'pointer-events-auto cursor-default rounded-md border px-1.5 text-[11px] sm:text-xs',
                    COURT_SCHEDULE_STATUS_CLASSES[booking.displayStatus],
                  )}
                  title={`${booking.bookingCode} · ${timeRange} · ${court.courtName} · ${booking.bookingType} · ${statusLabel} · ${courtCount}`}
                >
                  <span className="truncate">{statusLabel}</span>
                  {booking.bookingCourtCount > 1 && (
                    <span className="ml-1 shrink-0 text-[9px] font-semibold">
                      {t('courtStatus.booking.multiCourtBadge', {
                        count: booking.bookingCourtCount,
                      })}
                    </span>
                  )}
                </CourtStatusBookingFrame>
              );
            })}
          </div>
        </div>
      </div>
    );
  },
);

CourtRow.displayName = 'CourtRow';
export default CourtRow;
