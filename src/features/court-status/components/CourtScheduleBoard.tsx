import React, { memo, useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Lock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  generateTimelineHours,
  calculateBookingDimensions,
  calculateCurrentTimeIndicator,
} from '../utils/timeline.utils';
import { isPastSlot, isBookedSlot } from '../utils/time-selection.utils';
import { getCourtStatusInfo } from '../types/court-status.types';
import { CourtStatusTimelineHeader } from '../shared/components/CourtStatusTimelineHeader';
import { CourtStatusCourtNameCell } from '../shared/components/CourtStatusCourtNameCell';
import { CourtStatusBookingFrame } from '../shared/components/CourtStatusBookingFrame';
import { useSchedulerDimensions } from '@/features/customer-court-status/hooks/useSchedulerDimensions';
import { getStatusConfig } from '@/features/court-status-board/constants/booking-status';
import { BookingContextMenu } from '@/features/court-status-board/components/BookingContextMenu';
import { BookingTooltip } from '@/features/court-status-board/components/BookingTooltip';
import type { BookingItem } from '@/features/court-status-board/types/booking';

export interface CourtScheduleBoardCourt {
  id: string;
  name: string;
  status?: string;
  courtType?: string;
  pricePerHour?: number;
}

export interface CourtScheduleBoardBooking {
  id: string;
  courtId: string;
  courtName?: string;
  customerName?: string;
  phoneNumber?: string;
  bookingDate?: string;
  startTime: string;
  endTime: string;
  bookingType?: any;
  bookingStatus?: string;
  paymentStatus?: any;
  title?: string;
  color?: string;
  notes?: string;
  checkedIn?: boolean;
  checkedOut?: boolean;
}

export interface CourtScheduleBoardProps {
  courts: CourtScheduleBoardCourt[];
  bookings: CourtScheduleBoardBooking[];
  selectedDate: string;
  openTime?: string;
  closeTime?: string;
  slotInterval?: number;
  zoomLevel?: number;
  onZoomChange?: (zoom: number) => void;
  // Multi-court, independent multi-slot selection
  selectedSlotKeys: Set<string>;
  onToggleSlot: (court: CourtScheduleBoardCourt, slotTime: string) => void;
  // Staff / management actions (optional - passed only by staff/admin pages)
  onSelectBooking?: (booking: CourtScheduleBoardBooking) => void;
  onEditBooking?: (booking: CourtScheduleBoardBooking) => void;
  onCheckIn?: (booking: CourtScheduleBoardBooking) => void;
  onCheckOut?: (booking: CourtScheduleBoardBooking) => void;
  onCreateInvoice?: (booking: CourtScheduleBoardBooking) => void;
  onCancelBooking?: (booking: CourtScheduleBoardBooking) => void;
  // Custom extra controls / slot
  children?: React.ReactNode;
  emptyMessage?: string;
  className?: string;
}

const COURT_COLUMN_WIDTH = 136;
const ROW_HEIGHT = 48;

/**
 * Shared Badminton Court Schedule Board
 *
 * Implements:
 * 1. Timeline grid visualization with sticky court column and sticky time header.
 * 2. Independent multi-court, multi-slot selection via atomic toggle clicks.
 * 3. Overlaid booking intervals with automatic customer/management presentation separation.
 * 4. Past time protection & hatched styling.
 * 5. Current-time vertical indicator line.
 * 6. Keyboard accessibility: Enter/Space toggles slots with visible focus ring.
 */
export const CourtScheduleBoard: React.FC<CourtScheduleBoardProps> = memo(
  ({
    courts,
    bookings,
    selectedDate,
    openTime = '05:00:00',
    closeTime = '23:00:00',
    slotInterval = 60,
    zoomLevel = 1.0,
    onZoomChange,
    selectedSlotKeys,
    onToggleSlot,
    onSelectBooking,
    onEditBooking,
    onCheckIn,
    onCheckOut,
    onCreateInvoice,
    onCancelBooking,
    children,
    emptyMessage,
    className,
  }) => {
    const { t } = useTranslation();
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [showLeftShadow, setShowLeftShadow] = useState(false);
    const [showRightShadow, setShowRightShadow] = useState(false);
    const [tick, setTick] = useState<number>(() => Date.now());

    // Update current time indicator every 60 seconds
    useEffect(() => {
      const interval = window.setInterval(() => setTick(Date.now()), 60_000);
      return () => window.clearInterval(interval);
    }, []);

    // Responsive dimensions
    const {
      slotWidth: hourWidth,
      timelineWidth,
      openTime: normalizedOpenTime,
      closeTime: normalizedCloseTime,
    } = useSchedulerDimensions({
      containerRef: scrollContainerRef,
      openTime,
      closeTime,
      slotInterval,
      courtColumnWidth: COURT_COLUMN_WIDTH,
      zoomLevel,
    });

    const timelineHours = useMemo(
      () => generateTimelineHours(normalizedOpenTime, normalizedCloseTime),
      [normalizedOpenTime, normalizedCloseTime],
    );

    const totalGridWidth = Math.round(timelineHours.length * hourWidth);

    // Current time indicator calculation
    const { offsetPx: currentTimeOffsetPx, label: currentTimeLabel } = useMemo(() => {
      void tick;
      return calculateCurrentTimeIndicator(
        normalizedOpenTime,
        normalizedCloseTime,
        hourWidth,
        selectedDate,
      );
    }, [normalizedOpenTime, normalizedCloseTime, hourWidth, selectedDate, tick]);

    // Check if viewing a past date
    const isPastDate = useMemo(() => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const target = new Date(selectedDate);
      target.setHours(0, 0, 0, 0);
      return target.getTime() < today.getTime();
    }, [selectedDate]);

    // Update scroll shadows
    const updateScrollShadows = useCallback(() => {
      const el = scrollContainerRef.current;
      if (!el) return;
      setShowLeftShadow(el.scrollLeft > 6);
      setShowRightShadow(el.scrollLeft + el.clientWidth < el.scrollWidth - 6);
    }, []);

    useEffect(() => {
      updateScrollShadows();
    }, [hourWidth, timelineWidth, updateScrollShadows]);

    const hasManagementActions = Boolean(
      onSelectBooking || onEditBooking || onCheckIn || onCheckOut || onCancelBooking,
    );

    // Map bookings to CourtScheduleItemDto format for collision/booked checking
    const scheduleItemsForCollision = useMemo(
      () =>
        bookings.map((b) => ({
          bookingId: b.id,
          courtId: b.courtId,
          courtNumber: 0,
          courtName: b.courtName || '',
          bookingDate: b.bookingDate || selectedDate,
          startTime: b.startTime,
          endTime: b.endTime,
          bookingType: String(b.bookingType || 'FLEXIBLE'),
          bookingStatus: b.bookingStatus || 'CONFIRMED',
          paymentStatus: String(b.paymentStatus || 'PAID'),
          customerName: b.customerName || '',
          phoneNumber: b.phoneNumber || '',
          title: b.title || 'Đã được đặt',
          color: b.color || '#3b82f6',
        })),
      [bookings, selectedDate],
    );

    return (
      <div
        className={cn(
          'relative flex h-full w-full flex-1 flex-col overflow-hidden bg-white select-none',
          className,
        )}
      >
        {/* Past Date Banner */}
        {isPastDate && (
          <div
            role="alert"
            className="z-30 flex items-center justify-between border-b border-amber-300 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-900 shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-4 shrink-0 text-amber-600" />
              <span>{t('courtStatus.pastDateAlert', 'Không thể đặt lịch cho các ngày trong quá khứ.')}</span>
            </div>
            <span className="rounded bg-amber-200/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800">
              Chỉ xem
            </span>
          </div>
        )}

        {/* Scroll Shadows */}
        {showLeftShadow && (
          <div
            aria-hidden="true"
            style={{ left: `${COURT_COLUMN_WIDTH}px` }}
            className="pointer-events-none absolute top-0 bottom-0 z-25 w-5 bg-gradient-to-r from-slate-900/10 to-transparent transition-opacity duration-200"
          />
        )}
        {showRightShadow && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-0 right-0 bottom-0 z-25 w-6 bg-gradient-to-l from-slate-900/10 to-transparent transition-opacity duration-200"
          />
        )}

        {/* Scrollable Timeline Grid Container */}
        <div
          ref={scrollContainerRef}
          onScroll={updateScrollShadows}
          role="grid"
          aria-label="Lịch trạng thái sân cầu lông"
          className="relative flex-1 w-full overflow-x-auto overflow-y-auto scroll-smooth outline-none scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100"
        >
          <div
            style={{
              width: `${COURT_COLUMN_WIDTH + Math.max(timelineWidth, totalGridWidth)}px`,
              minWidth: '100%',
            }}
          >
            {/* Sticky Time Header */}
            <CourtStatusTimelineHeader
              courtColumnWidth={COURT_COLUMN_WIDTH}
              timelineWidth={Math.max(timelineWidth, totalGridWidth)}
              gridWidth={totalGridWidth}
              boundaries={timelineHours.map((hour, index) => ({
                key: hour,
                offsetPx: index * hourWidth,
                isMajor: true,
              }))}
              labels={timelineHours.map((hour, index) => ({
                key: hour,
                offsetPx: index * hourWidth,
                label: hour,
              }))}
              closeTime={normalizedCloseTime}
              currentTimeOffsetPx={currentTimeOffsetPx}
              currentTimeLabel={currentTimeLabel || 'Hiện tại'}
              cornerContent={
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-800">Sân</span>
                  <span className="rounded-full bg-white/70 px-1.5 py-0.2 text-[10px] font-semibold text-slate-600">
                    {courts.length}
                  </span>
                </div>
              }
            />

            {/* Grid Rows */}
            <div className="flex flex-col divide-y divide-slate-100">
              {courts.map((court) => {
                const statusInfo = getCourtStatusInfo(court.status);
                const normalizedStatus = (court.status || 'active').trim().toLowerCase();
                const isMaintenanceOrInactive =
                  normalizedStatus === 'maintenance' || normalizedStatus === 'inactive';

                const courtBookings = bookings.filter((b) => b.courtId === court.id);

                return (
                  <div
                    key={court.id}
                    role="row"
                    style={{ height: `${ROW_HEIGHT}px`, minHeight: '48px' }}
                    className="group/row relative flex bg-white transition-colors hover:bg-slate-50/40"
                  >
                    {/* Left Sticky Court Cell */}
                    <CourtStatusCourtNameCell
                      style={{ width: `${COURT_COLUMN_WIDTH}px` }}
                      className={cn(
                        'sticky left-0 z-20 flex shrink-0 items-center justify-between border-r border-slate-200 bg-[#f7faf8] px-3 py-2 text-xs shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)] backdrop-blur-xs select-none',
                        normalizedStatus === 'maintenance' && 'bg-amber-50/80',
                        normalizedStatus === 'inactive' && 'bg-slate-100 opacity-60',
                      )}
                    >
                      <div className="flex flex-col truncate pr-1">
                        <span className="truncate text-xs font-bold text-slate-800 sm:text-sm">
                          {court.name}
                        </span>
                        <span className="truncate text-[10px] font-medium text-slate-500">
                          {court.courtType || statusInfo.label}
                        </span>
                      </div>
                      <span
                        className={cn('size-2 shrink-0 rounded-full shadow-2xs', statusInfo.dotClass)}
                        title={`${court.name}: ${statusInfo.label}`}
                      />
                    </CourtStatusCourtNameCell>

                    {/* Timeline Grid Cells Container with Bookings Layer */}
                    <div
                      className="relative flex flex-1 shrink-0 touch-none"
                      style={{ width: `${Math.max(timelineWidth, totalGridWidth)}px` }}
                    >
                      {/* Background Hourly Grid Cells */}
                      {timelineHours.map((hour) => {
                        const isPast =
                          isPastDate ||
                          isMaintenanceOrInactive ||
                          isPastSlot(selectedDate, hour);
                        const isBooked = isBookedSlot(
                          court.id,
                          hour,
                          scheduleItemsForCollision,
                        );

                        // O(1) set lookup for selection
                        const slotKey = `${court.id}:${selectedDate}:${hour}:00`;
                        const shortKey = `${court.id}:${selectedDate}:${hour}`;
                        const isSelected =
                          selectedSlotKeys.has(slotKey) ||
                          selectedSlotKeys.has(shortKey) ||
                          selectedSlotKeys.has(`${court.id}:${selectedDate}:${hour}:00:00`);

                        // 1. Booked Slot
                        if (isBooked) {
                          return (
                            <div
                              key={hour}
                              role="gridcell"
                              aria-disabled="true"
                              style={{ width: `${hourWidth}px` }}
                              className="pointer-events-none relative h-full shrink-0 cursor-not-allowed border-r border-slate-100/80 bg-slate-50/20 select-none"
                            />
                          );
                        }

                        // 2. Disabled / Past Slot
                        if (isPast) {
                          return (
                            <div
                              key={hour}
                              role="gridcell"
                              aria-disabled="true"
                              title={`Khung giờ ${hour} không thể đặt lịch.`}
                              style={{ width: `${hourWidth}px` }}
                              className="group/cell pointer-events-none relative h-full shrink-0 cursor-not-allowed border-r border-slate-200/60 opacity-50 select-none bg-[repeating-linear-gradient(45deg,#f8fafc,#f8fafc_6px,#e2e8f0_6px,#e2e8f0_10px)]"
                            >
                              <div className="absolute inset-0 flex items-center justify-center opacity-40">
                                <Lock className="size-3 text-slate-400" />
                              </div>
                            </div>
                          );
                        }

                        // 3. Selected Slot
                        if (isSelected) {
                          return (
                            <button
                              key={hour}
                              type="button"
                              role="gridcell"
                              aria-selected="true"
                              aria-pressed="true"
                              aria-label={`Bỏ chọn ${court.name} lúc ${hour}`}
                              style={{ width: `${hourWidth}px` }}
                              onClick={() => onToggleSlot(court, hour)}
                              className="group/cell relative z-10 flex h-full shrink-0 cursor-pointer items-center justify-center border-r border-emerald-500 bg-emerald-600 font-bold text-white shadow-xs transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                              title={`Bấm để bỏ chọn ${court.name} lúc ${hour}`}
                            >
                              <div className="flex items-center gap-1 text-[11px] font-bold tracking-tight text-white drop-shadow-xs">
                                <span>{hour}</span>
                                <Check className="size-3.5 stroke-[3]" />
                              </div>
                            </button>
                          );
                        }

                        // 4. Available Slot
                        return (
                          <button
                            key={hour}
                            type="button"
                            role="gridcell"
                            aria-selected="false"
                            aria-pressed="false"
                            aria-label={`Chọn ${court.name} lúc ${hour}`}
                            style={{ width: `${hourWidth}px` }}
                            onClick={() => onToggleSlot(court, hour)}
                            className="group/cell relative h-full shrink-0 cursor-pointer border-r border-slate-100/90 bg-white transition-colors hover:bg-emerald-50 active:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                            title={`Bấm để chọn ${court.name} lúc ${hour}`}
                          >
                            <div className="pointer-events-none absolute inset-0 hidden items-center justify-center group-hover/cell:flex">
                              <span className="rounded border border-emerald-200 bg-white/95 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 shadow-2xs">
                                + {hour}
                              </span>
                            </div>
                          </button>
                        );
                      })}

                      {/* Overlaid Bookings Layer */}
                      <div className="pointer-events-none absolute inset-0 z-15">
                        {courtBookings.map((b) => {
                          const { left, width } = calculateBookingDimensions(
                            b.startTime,
                            b.endTime,
                            normalizedOpenTime,
                            hourWidth,
                          );

                          // Staff View with Context Menu & Details
                          if (hasManagementActions) {
                            const fullBooking: BookingItem = {
                              id: b.id,
                              bookingNumber: b.id.slice(0, 8),
                              courtId: b.courtId,
                              courtName: b.courtName || court.name,
                              customerName: b.customerName || 'Khách hàng',
                              phoneNumber: b.phoneNumber || '',
                              date: b.bookingDate || selectedDate,
                              startTime: b.startTime,
                              endTime: b.endTime,
                              bookingType: b.bookingType || 'FLEXIBLE',
                              bookingStatus: b.bookingStatus || 'CONFIRMED',
                              paymentStatus: b.paymentStatus || 'paid',
                              notes: b.notes,
                              checkedIn: b.checkedIn,
                              checkedOut: b.checkedOut,
                            };

                            const statusCfg = getStatusConfig(b.bookingType);
                            const bookingColor = b.color || statusCfg.color;
                            const bookingTextColor = b.color ? '#ffffff' : statusCfg.textColor;

                            // Read unpaid status from paymentStatus for Staff View
                            const normalizedPayment = String(b.paymentStatus || '').toLowerCase();
                            const isUnpaid =
                              normalizedPayment === 'unpaid' ||
                              normalizedPayment === 'ticket_unpaid' ||
                              normalizedPayment === 'service_unpaid' ||
                              normalizedPayment === 'deposit_pending' ||
                              normalizedPayment === 'partially_paid' ||
                              normalizedPayment.includes('unpaid');

                            return (
                              <div
                                key={b.id}
                                className="pointer-events-auto absolute"
                                style={{ left: `${left}px`, width: `${width}px`, height: '42px', top: '3px' }}
                              >
                                <BookingContextMenu
                                  booking={fullBooking}
                                  onViewDetails={onSelectBooking ? () => onSelectBooking(b) : undefined}
                                  onEdit={onEditBooking ? () => onEditBooking(b) : undefined}
                                  onCheckIn={onCheckIn ? () => onCheckIn(b) : undefined}
                                  onCheckOut={onCheckOut ? () => onCheckOut(b) : undefined}
                                  onCreateInvoice={onCreateInvoice ? () => onCreateInvoice(b) : undefined}
                                  onCancel={onCancelBooking ? () => onCancelBooking(b) : undefined}
                                >
                                  <div>
                                    <BookingTooltip booking={fullBooking}>
                                      <CourtStatusBookingFrame
                                        left={0}
                                        width={width}
                                        height={42}
                                        backgroundColor={bookingColor}
                                        color={bookingTextColor}
                                        role="button"
                                        tabIndex={0}
                                        ariaLabel={`Lịch đặt: ${b.customerName || 'Khách'}, ${b.startTime} - ${b.endTime}`}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onSelectBooking?.(b);
                                        }}
                                        className="cursor-pointer hover:brightness-95 relative"
                                      >
                                        {/* Unpaid Ticket / Flag Badge (Staff View Only) */}
                                        {isUnpaid && (
                                          <div
                                            className="absolute top-0 left-0 z-20 flex items-center"
                                            title="Chưa thanh toán"
                                          >
                                            <span className="rounded-br-xs bg-[#e53935] px-1 py-0.5 text-[8.5px] font-extrabold tracking-tight leading-none text-white uppercase shadow-xs">
                                              Chưa T.T
                                            </span>
                                          </div>
                                        )}

                                        <div className="flex flex-col items-center justify-center truncate text-[11px] leading-tight">
                                          <span className="font-bold truncate max-w-full">
                                            {b.customerName || 'Đã đặt'}
                                          </span>
                                          <span className="text-[10px] opacity-80">
                                            {b.startTime.slice(0, 5)} - {b.endTime.slice(0, 5)}
                                          </span>
                                        </div>
                                      </CourtStatusBookingFrame>
                                    </BookingTooltip>
                                  </div>
                                </BookingContextMenu>
                              </div>
                            );
                          }

                          // Customer View: Sanitized (No PII)
                          return (
                            <div
                              key={b.id}
                              className="pointer-events-auto absolute"
                              style={{ left: `${left}px`, width: `${width}px`, height: '42px', top: '3px' }}
                            >
                              <CourtStatusBookingFrame
                                left={0}
                                width={width}
                                height={42}
                                backgroundColor={b.color || '#FF6666'}
                                color="#ffffff"
                                ariaLabel={`Khung giờ đã được đặt: ${b.startTime} - ${b.endTime}`}
                                className="cursor-default text-white font-medium shadow-xs"
                              >
                                <div className="flex flex-col items-center justify-center truncate text-[11px] leading-tight">
                                  <span className="font-semibold">{b.title || 'Đã được đặt'}</span>
                                  <span className="text-[10px] text-blue-100">
                                    {b.startTime.slice(0, 5)} - {b.endTime.slice(0, 5)}
                                  </span>
                                </div>
                              </CourtStatusBookingFrame>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Current Time Indicator Red Line */}
            {currentTimeOffsetPx !== null && (
              <div
                style={{
                  position: 'absolute',
                  left: `${COURT_COLUMN_WIDTH + currentTimeOffsetPx}px`,
                  top: 0,
                  bottom: 0,
                }}
                className="pointer-events-none z-25 w-[2px] -translate-x-1/2 bg-rose-500 shadow-[0_0_4px_rgba(244,63,94,0.6)]"
              />
            )}
          </div>
        </div>

        {/* Children (e.g. bottom summary or extra controls) */}
        {children}
      </div>
    );
  },
);

CourtScheduleBoard.displayName = 'CourtScheduleBoard';
export default CourtScheduleBoard;

