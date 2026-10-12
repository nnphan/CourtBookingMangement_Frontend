import React, { memo, useMemo, useCallback } from 'react';
import type { CourtScheduleItem } from '@/types/court-status';
import { calculateBookingPosition } from '../utils/calculateBookingPosition';
import { getBookingTypeLabel } from '../utils/booking.utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Clock, MapPin, Phone, User, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

export interface BookingSlotProps {
  booking: CourtScheduleItem;
  openTime: string;
  hourWidth?: number;
  rowHeight?: number;
  onClick?: (booking: CourtScheduleItem) => void;
  onDoubleClick?: (booking: CourtScheduleItem) => void;
}

/**
 * Returns Tailwind class styling for booking status badge
 * Pending: Amber
 * Confirmed: Blue
 * Completed: Green
 * Cancelled: Red
 */
function getStatusBadgeStyle(status: string) {
  const normalized = (status || '').toLowerCase().replace(/[\s_-]+/g, '');
  if (normalized.includes('pending') || normalized.includes('cho')) {
    return 'bg-amber-500/90 text-white border-amber-400';
  }
  if (normalized.includes('confirmed') || normalized.includes('xacnhan')) {
    return 'bg-blue-600/90 text-white border-blue-400';
  }
  if (normalized.includes('completed') || normalized.includes('hoanthanh')) {
    return 'bg-emerald-600/90 text-white border-emerald-400';
  }
  if (normalized.includes('cancel') || normalized.includes('huy')) {
    return 'bg-rose-600/90 text-white border-rose-400';
  }
  return 'bg-slate-700/90 text-white border-slate-500';
}

function getStatusIcon(status: string) {
  const normalized = (status || '').toLowerCase().replace(/[\s_-]+/g, '');
  if (normalized.includes('pending') || normalized.includes('cho')) {
    return <AlertCircle className="size-3 shrink-0" />;
  }
  if (normalized.includes('confirmed') || normalized.includes('xacnhan')) {
    return <CheckCircle2 className="size-3 shrink-0" />;
  }
  if (normalized.includes('completed') || normalized.includes('hoanthanh')) {
    return <CheckCircle2 className="size-3 shrink-0" />;
  }
  if (normalized.includes('cancel') || normalized.includes('huy')) {
    return <XCircle className="size-3 shrink-0" />;
  }
  return null;
}

export const BookingSlot: React.FC<BookingSlotProps> = memo(
  ({
    booking,
    openTime,
    hourWidth = 100,
    rowHeight = 44,
    onClick,
    onDoubleClick,
  }) => {
    // Dynamic position relative to openTime
    const { left, width } = useMemo(
      () =>
        calculateBookingPosition(
          { startTime: booking.startTime, endTime: booking.endTime },
          openTime,
          { hourWidth },
        ),
      [booking.startTime, booking.endTime, openTime, hourWidth],
    );

    const formattedStart = useMemo(
      () => (booking.startTime.length >= 5 ? booking.startTime.slice(0, 5) : booking.startTime),
      [booking.startTime],
    );
    const formattedEnd = useMemo(
      () => (booking.endTime.length >= 5 ? booking.endTime.slice(0, 5) : booking.endTime),
      [booking.endTime],
    );

    // Priority: title if available, fallback: customerName - phoneNumber
    const displayTitle = useMemo(() => {
      if (booking.title && booking.title.trim()) {
        return booking.title.trim();
      }
      if (booking.customerName && booking.phoneNumber) {
        return `${booking.customerName} - ${booking.phoneNumber}`;
      }
      return booking.customerName || 'Booking';
    }, [booking.title, booking.customerName, booking.phoneNumber]);

    const handleClick = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onClick?.(booking);
      },
      [booking, onClick],
    );

    const handleDoubleClick = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onDoubleClick?.(booking);
      },
      [booking, onDoubleClick],
    );

    const statusBadgeClass = getStatusBadgeStyle(booking.bookingStatus);
    const statusIcon = getStatusIcon(booking.bookingStatus);

    return (
      <TooltipProvider delayDuration={150}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              role="button"
              tabIndex={0}
              onClick={handleClick}
              onDoubleClick={handleDoubleClick}
              style={{
                position: 'absolute',
                left: `${left + 1}px`,
                width: `${Math.max(20, width - 2)}px`,
                height: `${rowHeight - 4}px`,
                top: '2px',
                backgroundColor: booking.color || '#E2B93B',
              }}
              className={cn(
                'group z-10 flex cursor-pointer select-none items-center justify-between gap-1 overflow-hidden rounded-md px-2 text-xs font-semibold shadow-xs transition-all',
                'hover:brightness-95 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80',
                'border border-black/10 text-slate-900',
              )}
            >
              {/* Main content: Title & Time Range */}
              <div className="flex flex-col min-w-0 flex-1 justify-center leading-tight">
                <span className="truncate font-bold text-[11px] text-slate-950">
                  {displayTitle}
                </span>
                <span className="truncate text-[10px] font-medium text-slate-800/90 opacity-90">
                  {formattedStart} - {formattedEnd}
                </span>
              </div>

              {/* Status Badge in block if space allows */}
              {width > 90 && (
                <div
                  className={cn(
                    'hidden sm:flex shrink-0 items-center gap-0.5 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase shadow-2xs border',
                    statusBadgeClass,
                  )}
                >
                  {statusIcon}
                  <span className="truncate max-w-[60px]">{booking.bookingStatus}</span>
                </div>
              )}
            </div>
          </TooltipTrigger>

          {/* Shadcn Tooltip with full metadata */}
          <TooltipContent
            side="top"
            align="center"
            className="z-50 w-72 p-3 text-xs bg-slate-900/95 text-white backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/60"
          >
            {/* Header: Court Name & Status Badge */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
              <div className="flex items-center gap-1.5 font-bold text-sm text-emerald-400">
                <MapPin className="size-4 shrink-0" />
                <span>{booking.courtName}</span>
              </div>
              <span
                className={cn(
                  'flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border shadow-xs',
                  statusBadgeClass,
                )}
              >
                {statusIcon}
                <span>{booking.bookingStatus}</span>
              </span>
            </div>

            {/* Tooltip Details List */}
            <div className="space-y-1.5 text-slate-200">
              {/* Customer Name */}
              <div className="flex items-center gap-2">
                <User className="size-3.5 text-slate-400 shrink-0" />
                <span className="font-semibold text-white">{booking.customerName}</span>
              </div>

              {/* Phone Number */}
              {booking.phoneNumber && (
                <div className="flex items-center gap-2">
                  <Phone className="size-3.5 text-slate-400 shrink-0" />
                  <span>{booking.phoneNumber}</span>
                </div>
              )}

              {/* Booking Type */}
              {booking.bookingType && (
                <div className="flex items-center justify-between text-[11px] pt-0.5">
                  <span className="text-slate-400">Loại đặt sân:</span>
                  <span className="font-medium text-emerald-300">
                    {getBookingTypeLabel(booking.bookingType)}
                  </span>
                </div>
              )}

              {/* Payment Status */}
              {booking.paymentStatus && (
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Thanh toán:</span>
                  <span className="font-medium text-amber-300">{booking.paymentStatus}</span>
                </div>
              )}

              {/* Time Range */}
              <div className="flex items-center gap-2 pt-1 border-t border-white/10">
                <Clock className="size-3.5 text-slate-400 shrink-0" />
                <span className="font-semibold text-white">
                  {formattedStart} - {formattedEnd}
                </span>
                <span className="ml-auto text-[10px] text-slate-400">
                  {booking.bookingDate}
                </span>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  },
);

BookingSlot.displayName = 'BookingSlot';
export default BookingSlot;
