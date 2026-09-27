import React, { memo, useMemo } from 'react';
import type { CourtItem } from '../types/court';
import type { TimeSlot, SlotSelectionRange } from '../types/common';
import type { BookingItem } from '../types/booking';
import { BookingLayer } from './BookingLayer';
import { SlotSelectionOverlay } from './SlotSelectionOverlay';
import { SCHEDULER_CONFIG } from '../constants/scheduler';
import { SchedulerService } from '../services/scheduler.service';
import { useCourtStatusStore } from '../store/court-status.store';
import { cn } from '@/lib/utils';

interface SchedulerGridProps {
  courts: CourtItem[];
  timeSlots: TimeSlot[];
  bookings: BookingItem[];
  slotWidth: number;
  slotInterval: number;
  virtualRows: { index: number; start: number; size: number }[];
  totalHeight: number;
  totalWidth: number;
  activeSelection: SlotSelectionRange | null;
  onSlotClick: (court: CourtItem, slot: TimeSlot) => void;
  isSlotSelected: (courtId: string, slotTime: string) => boolean;
  onConfirmSelection: (selection: SlotSelectionRange) => void;
  onClearSelection: () => void;
  onSelectBooking: (booking: BookingItem) => void;
  onEditBooking: (booking: BookingItem) => void;
  onCheckIn: (booking: BookingItem) => void;
  onCheckOut: (booking: BookingItem) => void;
  onCreateInvoice: (booking: BookingItem) => void;
  onCancelBooking: (booking: BookingItem) => void;
}

export const SchedulerGrid: React.FC<SchedulerGridProps> = memo(
  ({
    courts,
    timeSlots,
    bookings,
    slotWidth,
    slotInterval,
    virtualRows,
    totalHeight,
    totalWidth,
    activeSelection,
    onSlotClick,
    isSlotSelected,
    onConfirmSelection,
    onClearSelection,
    onSelectBooking,
    onEditBooking,
    onCheckIn,
    onCheckOut,
    onCreateInvoice,
    onCancelBooking,
  }) => {
    const selectedDate = useCourtStatusStore((s) => s.selectedDate);

    // Performance: Memoize disabled slot calculation for all slots on the current date
    const disabledSlotMap = useMemo(() => {
      const map = new Map<string, boolean>();
      for (const slot of timeSlots) {
        map.set(slot.time, SchedulerService.isPastSlot(selectedDate, slot.time));
      }
      return map;
    }, [selectedDate, timeSlots]);

    return (
      <div
        style={{
          width: `${totalWidth}px`,
          height: `${totalHeight}px`,
          position: 'relative',
        }}
        className="bg-white"
      >
        {virtualRows.map((virtualRow) => {
          const court = courts[virtualRow.index];
          if (!court) return null;

          const isCurrentCourtSelected = activeSelection?.courtId === court.id;

          return (
            <div
              key={court.id}
              role="row"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: `${totalWidth}px`,
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
              className="flex border-b border-[#e2e8f0]"
            >
              {/* Background grid cells with past slot protection & click-to-select support */}
              {timeSlots.map((slot) => {
                const isPast = disabledSlotMap.get(slot.time) ?? false;
                const isSelected = !isPast && isSlotSelected(court.id, slot.time);

                const cellTitle = isPast
                  ? 'Past time slots cannot be booked.'
                  : isSelected
                    ? `Bấm để bỏ chọn sân ${court.name} lúc ${slot.formattedTime}`
                    : `Bấm để chọn sân ${court.name} lúc ${slot.formattedTime}`;

                return (
                  <div
                    key={slot.time}
                    role="gridcell"
                    aria-selected={isSelected}
                    aria-disabled={isPast ? 'true' : undefined}
                    style={{ width: `${slotWidth}px` }}
                    onClick={isPast ? undefined : () => onSlotClick(court, slot)}
                    title={cellTitle}
                    className={cn(
                      'relative h-full shrink-0 border-r border-[#e2e8f0] select-none transition-colors',
                      isPast
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : isSelected
                          ? 'bg-emerald-500/25 border-t-2 border-b-2 border-emerald-600 cursor-pointer'
                          : 'cursor-pointer hover:bg-emerald-50/60 active:bg-emerald-100/70',
                    )}
                  >
                    {isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="size-2 rounded-full bg-emerald-600 ring-2 ring-white shadow-xs" />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Active Multi Time Slot Selection Range Bounding Box Overlay */}
              {isCurrentCourtSelected && activeSelection && (
                <SlotSelectionOverlay
                  courtId={court.id}
                  selection={activeSelection}
                  slotWidth={slotWidth}
                  slotInterval={slotInterval}
                  rowHeight={virtualRow.size || SCHEDULER_CONFIG.ROW_HEIGHT}
                  onConfirm={onConfirmSelection}
                  onClear={onClearSelection}
                />
              )}

              {/* Positioned Booking Layer on top of the cells */}
              <BookingLayer
                courtId={court.id}
                courtName={court.name}
                bookings={bookings}
                slotWidth={slotWidth}
                slotInterval={slotInterval}
                rowHeight={virtualRow.size || SCHEDULER_CONFIG.ROW_HEIGHT}
                onSelectBooking={onSelectBooking}
                onEditBooking={onEditBooking}
                onCheckIn={onCheckIn}
                onCheckOut={onCheckOut}
                onCreateInvoice={onCreateInvoice}
                onCancelBooking={onCancelBooking}
              />
            </div>
          );
        })}
      </div>
    );
  },
);

SchedulerGrid.displayName = 'SchedulerGrid';
