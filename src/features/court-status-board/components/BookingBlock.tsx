import React, { memo, useCallback } from 'react';
import type { BookingBlockProps, BookingItem } from '../types/booking';
import { getStatusConfig } from '../constants/booking-status';
import { BookingTooltip } from './BookingTooltip';
import { BookingContextMenu } from './BookingContextMenu';
import { cn } from '@/lib/utils';

interface ExtendedBookingBlockProps extends BookingBlockProps {
  fullBooking: BookingItem;
  left: number;
  width: number;
  height?: number;
  onSelect: (booking: BookingItem) => void;
  onEdit: (booking: BookingItem) => void;
  onCheckIn: (booking: BookingItem) => void;
  onCheckOut: (booking: BookingItem) => void;
  onCreateInvoice: (booking: BookingItem) => void;
  onCancel: (booking: BookingItem) => void;
}

export const BookingBlock: React.FC<ExtendedBookingBlockProps> = memo(
  ({
    customerName,
    phoneNumber,
    bookingType,
    paymentStatus,
    fullBooking,
    left,
    width,
    height = 42,
    onSelect,
    onEdit,
    onCheckIn,
    onCheckOut,
    onCreateInvoice,
    onCancel,
  }) => {
    const statusCfg = getStatusConfig(bookingType);

    // Is unpaid badge shown? (matches the "Chưa T.Toán" red ribbon in screenshot)
    const isUnpaid =
      paymentStatus === 'unpaid' ||
      paymentStatus === 'ticket_unpaid' ||
      paymentStatus === 'service_unpaid' ||
      paymentStatus === 'deposit_pending';

    const unpaidBadgeText =
      paymentStatus === 'deposit_pending'
        ? 'Chờ cọc'
        : paymentStatus === 'service_unpaid'
          ? 'Chưa T.T DV'
          : 'Chưa T.Toán';

    const handleClick = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onSelect(fullBooking);
      },
      [fullBooking, onSelect],
    );

    const handleDoubleClick = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onEdit(fullBooking);
      },
      [fullBooking, onEdit],
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(fullBooking);
        } else if (e.key === 'e' || e.key === 'E') {
          e.preventDefault();
          onEdit(fullBooking);
        }
      },
      [fullBooking, onSelect, onEdit],
    );

    return (
      <BookingContextMenu
        booking={fullBooking}
        onViewDetails={onSelect}
        onEdit={onEdit}
        onCheckIn={onCheckIn}
        onCheckOut={onCheckOut}
        onCreateInvoice={onCreateInvoice}
        onCancel={onCancel}
      >
        <div>
          <BookingTooltip booking={fullBooking}>
            <div
              role="button"
              tabIndex={0}
              aria-label={`Lịch đặt sân: ${customerName}, ${phoneNumber}, ${fullBooking.startTime} đến ${fullBooking.endTime}`}
              onClick={handleClick}
              onDoubleClick={handleDoubleClick}
              onKeyDown={handleKeyDown}
              style={{
                position: 'absolute',
                left: `${left + 1}px`,
                width: `${width - 2}px`,
                height: `${height - 2}px`,
                top: '1px',
                backgroundColor: statusCfg.color,
                color: statusCfg.textColor,
              }}
              className={cn(
                'group z-10 flex cursor-pointer select-none items-center justify-center overflow-visible rounded-xs px-2 text-center text-xs font-semibold shadow-xs transition-all',
                'hover:brightness-95 hover:shadow-md focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-1',
              )}
            >
              {/* Unpaid Red Ribbon Badge on Top-Left (Exact match to screenshot) */}
              {isUnpaid && (
                <div
                  className="absolute -top-1.5 left-0 z-20 flex items-center shadow-xs"
                  title="Chưa thanh toán"
                >
                  <span className="rounded-xs bg-[#e53935] px-1 py-0.2 text-[9px] font-bold text-white tracking-tighter uppercase whitespace-nowrap">
                    {unpaidBadgeText}
                  </span>
                </div>
              )}

              {/* Block text: Customer Name - Phone */}
              <div className="truncate px-1 text-center font-medium drop-shadow-xs">
                <span>{customerName}</span>
                {phoneNumber && <span className="opacity-90"> - {phoneNumber}</span>}
              </div>
            </div>
          </BookingTooltip>
        </div>
      </BookingContextMenu>
    );
  },
);

BookingBlock.displayName = 'BookingBlock';
