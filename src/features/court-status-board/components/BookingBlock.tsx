import React, { memo, useCallback } from 'react';
import type { BookingBlockProps, BookingItem } from '../types/booking';
import { getStatusConfig } from '../constants/booking-status';
import { BookingTooltip } from './BookingTooltip';
import { BookingContextMenu } from './BookingContextMenu';
import { cn } from '@/lib/utils';
import { CourtStatusBookingFrame } from '@/features/court-status/shared/components/CourtStatusBookingFrame';

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
            <CourtStatusBookingFrame
              role="button"
              tabIndex={0}
              ariaLabel={`Lịch đặt sân: ${customerName}, ${phoneNumber}, ${fullBooking.startTime} đến ${fullBooking.endTime}`}
              onClick={handleClick}
              onDoubleClick={handleDoubleClick}
              onKeyDown={handleKeyDown}
              left={left + 1}
              width={width - 2}
              height={height - 2}
              backgroundColor={
                (fullBooking as unknown as { color?: string })?.color || statusCfg.color
              }
              color={
                (fullBooking as unknown as { color?: string })?.color
                  ? '#1e293b'
                  : statusCfg.textColor
              }
              className={cn(
                'cursor-pointer overflow-visible',
                'hover:shadow-md hover:brightness-95 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-1',
              )}
            >
              {/* Unpaid Red Ribbon Badge on Top-Left (Exact match to screenshot) */}
              {isUnpaid && (
                <div
                  className="absolute -top-0.5 left-0 z-20 flex items-center shadow-xs"
                  title="Chưa thanh toán"
                >
                  <span className="py-0.2 relative top-[1px] rounded-xs bg-[#e53935] px-1 text-[9px] font-bold tracking-tighter whitespace-nowrap text-white uppercase">
                    {unpaidBadgeText}
                  </span>
                </div>
              )}

              {/* Block text: Priority title if available, fallback customerName - phoneNumber */}
              <div className="truncate px-1 text-center font-medium drop-shadow-xs">
                {(fullBooking as unknown as { title?: string })?.title ? (
                  <span>{(fullBooking as unknown as { title?: string }).title}</span>
                ) : (
                  <>
                    <span>{customerName}</span>
                    {phoneNumber && <span className="opacity-90"> - {phoneNumber}</span>}
                  </>
                )}
              </div>
            </CourtStatusBookingFrame>
          </BookingTooltip>
        </div>
      </BookingContextMenu>
    );
  },
);

BookingBlock.displayName = 'BookingBlock';
