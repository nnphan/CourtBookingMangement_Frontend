import React, { memo, useMemo, useCallback } from 'react';
import type { CourtScheduleItemDto } from '../types/court-status.types';
import {
  getBookingStatusInfo,
  getPaymentStatusInfo,
} from '../types/court-status.types';
import { calculateBookingDimensions } from '../utils/timeline.utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Clock, Phone, User } from 'lucide-react';

export interface BookingCardProps {
  item: CourtScheduleItemDto;
  openTime: string;
  hourWidth: number;
  rowHeight?: number;
  onClick?: (bookingId: string, item: CourtScheduleItemDto) => void;
}

export const BookingCard: React.FC<BookingCardProps> = memo(
  ({ item, openTime, hourWidth, rowHeight = 48, onClick }) => {
    // Dynamic width & offset calculation relative to openTime
    const { left, width } = useMemo(
      () =>
        calculateBookingDimensions(item.startTime, item.endTime, openTime, hourWidth),
      [item.startTime, item.endTime, openTime, hourWidth],
    );

    const formattedStart = useMemo(
      () => (item.startTime?.length >= 5 ? item.startTime.slice(0, 5) : item.startTime),
      [item.startTime],
    );
    const formattedEnd = useMemo(
      () => (item.endTime?.length >= 5 ? item.endTime.slice(0, 5) : item.endTime),
      [item.endTime],
    );

    const bookingStatusInfo = useMemo(
      () => getBookingStatusInfo(item.bookingStatus),
      [item.bookingStatus],
    );

    const paymentStatusInfo = useMemo(
      () => getPaymentStatusInfo(item.paymentStatus),
      [item.paymentStatus],
    );

    const handleClick = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onClick?.(item.bookingId, item);
      },
      [item, onClick],
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          onClick?.(item.bookingId, item);
        }
      },
      [item, onClick],
    );

    return (
      <TooltipProvider delayDuration={150}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              role="button"
              tabIndex={0}
              onClick={handleClick}
              onKeyDown={handleKeyDown}
              aria-label={`Đặt sân: ${item.customerName || 'Khách'}, ${formattedStart} - ${formattedEnd}, ${bookingStatusInfo.label}`}
              style={{
                position: 'absolute',
                left: `${left + 2}px`,
                width: `${Math.max(32, width - 4)}px`,
                height: `${rowHeight - 6}px`,
                top: '3px',
                backgroundColor: item.color || '#F59E0B',
              }}
              className={cn(
                'group z-15 flex cursor-pointer select-none items-center justify-between gap-1 overflow-hidden rounded-md px-2 py-1 shadow-xs transition-all duration-150',
                'hover:brightness-95 hover:shadow-md hover:ring-2 hover:ring-emerald-500/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600',
                'border border-black/15 text-slate-950',
              )}
            >
              {/* Left Details: Customer Name, Phone Number, Time Range */}
              <div className="flex flex-col min-w-0 flex-1 justify-center leading-tight">
                {/* Customer Name */}
                <span className="truncate font-bold text-[11px] sm:text-xs text-slate-950 drop-shadow-2xs">
                  {item.customerName || item.title || 'Đặt sân'}
                </span>

                {/* Phone Number & Time Range */}
                <div className="flex items-center gap-1.5 text-[10px] text-slate-900/90 font-medium truncate">
                  {item.phoneNumber && (
                    <span className="truncate font-semibold opacity-95">
                      {item.phoneNumber}
                    </span>
                  )}
                  {item.phoneNumber && <span>•</span>}
                  <span className="truncate whitespace-nowrap">
                    {formattedStart} - {formattedEnd}
                  </span>
                </div>
              </div>

              {/* Right Badges: Payment Status Badge & Booking Status Badge */}
              {width > 120 && (
                <div className="hidden sm:flex shrink-0 flex-col items-end gap-1">
                  {/* Payment Status Badge */}
                  <span
                    className={cn(
                      'px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider shadow-2xs border',
                      paymentStatusInfo.badgeClass,
                    )}
                  >
                    {paymentStatusInfo.label}
                  </span>

                  {/* Booking Status Badge */}
                  {width > 160 && (
                    <span
                      className={cn(
                        'px-1.5 py-0.5 rounded text-[9px] font-bold shadow-2xs border whitespace-nowrap',
                        bookingStatusInfo.badgeClass,
                      )}
                    >
                      {bookingStatusInfo.label}
                    </span>
                  )}
                </div>
              )}
            </div>
          </TooltipTrigger>

          {/* Tooltip Content for Rich Hover Details */}
          <TooltipContent
            side="top"
            align="center"
            className="z-50 w-72 p-3 text-xs bg-slate-900/95 text-white backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/60"
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
              <span className="font-bold text-sm text-emerald-400 truncate">
                {item.courtName}
              </span>
              <div className="flex items-center gap-1">
                <span
                  className={cn(
                    'px-1.5 py-0.5 rounded text-[10px] font-bold border shadow-xs',
                    paymentStatusInfo.badgeClass,
                  )}
                >
                  {paymentStatusInfo.label}
                </span>
                <span
                  className={cn(
                    'px-1.5 py-0.5 rounded text-[10px] font-bold border shadow-xs',
                    bookingStatusInfo.badgeClass,
                  )}
                >
                  {bookingStatusInfo.label}
                </span>
              </div>
            </div>

            <div className="space-y-1.5 text-slate-200">
              <div className="flex items-center gap-2">
                <User className="size-3.5 text-slate-400 shrink-0" />
                <span className="font-semibold text-white">
                  {item.customerName || 'Chưa có tên khách'}
                </span>
              </div>

              {item.phoneNumber && (
                <div className="flex items-center gap-2">
                  <Phone className="size-3.5 text-slate-400 shrink-0" />
                  <span>{item.phoneNumber}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1 border-t border-white/10">
                <Clock className="size-3.5 text-slate-400 shrink-0" />
                <span className="font-semibold text-white">
                  {formattedStart} - {formattedEnd}
                </span>
                <span className="ml-auto text-[10px] text-slate-400">
                  {item.bookingDate}
                </span>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  },
);

BookingCard.displayName = 'BookingCard';
export default BookingCard;
