import React, { memo } from 'react';
import type { BookingItem } from '../types/booking';
import { BookingBlock } from './BookingBlock';
import { SchedulerService } from '../services/scheduler.service';

interface BookingLayerProps {
  courtId: string;
  courtName: string;
  bookings: BookingItem[];
  slotWidth: number;
  slotInterval: number;
  rowHeight?: number;
  onSelectBooking: (booking: BookingItem) => void;
  onEditBooking: (booking: BookingItem) => void;
  onCheckIn: (booking: BookingItem) => void;
  onCheckOut: (booking: BookingItem) => void;
  onCreateInvoice: (booking: BookingItem) => void;
  onCancelBooking: (booking: BookingItem) => void;
}

export const BookingLayer: React.FC<BookingLayerProps> = memo(
  ({
    courtId,
    courtName,
    bookings,
    slotWidth,
    slotInterval,
    rowHeight = 44,
    onSelectBooking,
    onEditBooking,
    onCheckIn,
    onCheckOut,
    onCreateInvoice,
    onCancelBooking,
  }) => {
    const courtBookings = bookings.filter((b) => b.courtId === courtId);

    return (
      <div className="pointer-events-none absolute inset-0 z-10">
        {courtBookings.map((b) => {
          const { left, width } = SchedulerService.calculateBookingDimensions(
            b.startTime,
            b.endTime,
            slotWidth,
            slotInterval,
          );

          return (
            <div key={b.id} className="pointer-events-auto">
              <BookingBlock
                bookingId={b.id}
                courtId={courtId}
                courtName={courtName}
                customerName={b.customerName}
                phoneNumber={b.phoneNumber}
                startTime={b.startTime}
                endTime={b.endTime}
                bookingType={b.bookingType}
                paymentStatus={b.paymentStatus}
                bookingStatus={b.bookingStatus}
                fullBooking={b}
                left={left}
                width={width}
                height={rowHeight}
                onSelect={onSelectBooking}
                onEdit={onEditBooking}
                onCheckIn={onCheckIn}
                onCheckOut={onCheckOut}
                onCreateInvoice={onCreateInvoice}
                onCancel={onCancelBooking}
              />
            </div>
          );
        })}
      </div>
    );
  },
);

BookingLayer.displayName = 'BookingLayer';
