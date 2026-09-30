import React, { memo, useRef, useMemo, useCallback, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import type { CourtItem } from '../types/court';
import type { BookingItem } from '../types/booking';
import type { SlotSelectionRange } from '../types/common';
import { SchedulerService } from '../services/scheduler.service';
import { SCHEDULER_CONFIG } from '../constants/scheduler';
import { useCourtStatusStore } from '../store/court-status.store';
import { useSchedulerVirtualization } from '../hooks/useSchedulerVirtualization';
import { useSlotSelection } from '../hooks/useSlotSelection';
import { useSchedulerDimensions } from '../hooks/useSchedulerDimensions';
import { TimeHeader } from './TimeHeader';
import { CourtColumn } from './CourtColumn';
import { SchedulerGrid } from './SchedulerGrid';
import { RotateCcw, Calendar, Target, Layers, AlertTriangle } from 'lucide-react';
import { toast } from '@/lib/toast';

interface CourtSchedulerProps {
  courts: CourtItem[];
  bookings: BookingItem[];
  openTime?: string;
  closeTime?: string;
  slotInterval: number;
  dateLabel: { dayOfWeek: string; formattedDate: string };
  zoomLevel: number;
  onZoomChange: (zoom: number) => void;
  onResetFilters: () => void;
  onOpenCreateBooking: (initialValues?: {
    courtId?: string;
    courtName?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
  }) => void;
  onOpenCreateEvent: () => void;
  onSelectBooking: (booking: BookingItem) => void;
  onEditBooking: (booking: BookingItem) => void;
  onCheckIn: (booking: BookingItem) => void;
  onCheckOut: (booking: BookingItem) => void;
  onCreateInvoice: (booking: BookingItem) => void;
  onCancelBooking: (booking: BookingItem) => void;
}

export const CourtScheduler: React.FC<CourtSchedulerProps> = memo(
  ({
    courts,
    bookings,
    openTime = SCHEDULER_CONFIG.START_TIME,
    closeTime = SCHEDULER_CONFIG.END_TIME,
    slotInterval,
    dateLabel,
    zoomLevel,
    onZoomChange,
    onResetFilters,
    onOpenCreateBooking,
    onOpenCreateEvent,
    onSelectBooking,
    onEditBooking,
    onCheckIn,
    onCheckOut,
    onCreateInvoice,
    onCancelBooking,
  }) => {
    const { t } = useTranslation();
    const containerRef = useRef<HTMLDivElement>(null);
    const hasAutoScrolledRef = useRef<string | null>(null);

    const [showLeftShadow, setShowLeftShadow] = useState(false);
    const [showRightShadow, setShowRightShadow] = useState(false);
    const [nowTick, setNowTick] = useState<number>(() => Date.now());

    const selectedDate = useCourtStatusStore((s) => s.selectedDate);
    const isPastDate = useMemo(() => SchedulerService.isPastDate(selectedDate), [selectedDate]);

    // Dynamic responsive dimensions derived from branch operating hours and container width
    const {
      slotWidth,
      gridWidth: totalGridWidth,
      timelineWidth,
      openTime: normalizedOpenTime,
      closeTime: normalizedCloseTime,
    } = useSchedulerDimensions({
      containerRef,
      openTime,
      closeTime,
      slotInterval,
      courtColumnWidth: SCHEDULER_CONFIG.TOTAL_LEFT_COLUMN_WIDTH,
      zoomLevel,
    });

    // Generate time slots based on branch operating hours and interval
    const timeSlots = useMemo(
      () =>
        SchedulerService.generateTimeSlots(
          normalizedOpenTime,
          normalizedCloseTime,
          slotInterval,
        ),
      [normalizedOpenTime, normalizedCloseTime, slotInterval],
    );

    // Refresh current time indicator every 60 seconds
    useEffect(() => {
      const interval = window.setInterval(() => {
        setNowTick(Date.now());
      }, 60_000);
      return () => window.clearInterval(interval);
    }, []);

    // Multi time slot click-to-select hook
    const {
      activeSelection,
      handleSlotClick,
      isSlotSelected,
      clearSelection,
    } = useSlotSelection({ bookings, slotInterval });

    // Virtualization for court rows
    const { virtualRows, totalVirtualHeight } = useSchedulerVirtualization({
      count: courts.length,
      parentRef: containerRef,
      estimateRowHeight: SCHEDULER_CONFIG.ROW_HEIGHT,
      overscan: SCHEDULER_CONFIG.OVERSCAN_ROWS,
    });

    // Current time indicator offset & label (when selectedDate is today)
    const { currentTimeOffsetPx, currentTimeLabel } = useMemo(() => {
      void nowTick;
      if (!SchedulerService.isToday(selectedDate)) {
        return { currentTimeOffsetPx: null, currentTimeLabel: undefined };
      }
      const now = dayjs();
      const currentMinutes = now.hour() * 60 + now.minute();
      const startMinutes = SchedulerService.parseTimeToMinutes(normalizedOpenTime);
      const endMinutes = SchedulerService.parseTimeToMinutes(normalizedCloseTime);

      if (currentMinutes < startMinutes || currentMinutes > endMinutes) {
        return { currentTimeOffsetPx: null, currentTimeLabel: undefined };
      }

      const safeInterval = slotInterval > 0 ? slotInterval : SCHEDULER_CONFIG.SLOT_DURATION;
      const offsetPx = Math.round(((currentMinutes - startMinutes) / safeInterval) * slotWidth);
      return {
        currentTimeOffsetPx: offsetPx,
        currentTimeLabel: now.format('HH:mm'),
      };
    }, [selectedDate, normalizedOpenTime, normalizedCloseTime, slotInterval, slotWidth, nowTick]);

    // Update horizontal scroll shadow state
    const updateScrollShadows = useCallback(() => {
      const el = containerRef.current;
      if (!el) return;
      const { scrollLeft, scrollWidth, clientWidth } = el;
      setShowLeftShadow(scrollLeft > 8);
      setShowRightShadow(scrollLeft + clientWidth < scrollWidth - 8);
    }, []);

    useEffect(() => {
      updateScrollShadows();
    }, [slotWidth, timelineWidth, updateScrollShadows]);

    // Auto-scroll to current time when viewing today's schedule (only if horizontally scrollable)
    useEffect(() => {
      const el = containerRef.current;
      if (!el) return;
      if (hasAutoScrolledRef.current === selectedDate) return;

      const isOverflowing = el.scrollWidth > el.clientWidth + 8;
      if (isOverflowing && currentTimeOffsetPx !== null && currentTimeOffsetPx > 0) {
        const targetScroll = Math.max(0, currentTimeOffsetPx - slotWidth * 1.5);
        el.scrollTo({ left: targetScroll, behavior: 'smooth' });
        hasAutoScrolledRef.current = selectedDate;
      } else {
        hasAutoScrolledRef.current = selectedDate;
      }
    }, [selectedDate, currentTimeOffsetPx, slotWidth]);

    const handleConfirmSelection = useCallback(
      (selection: SlotSelectionRange) => {
        if (isPastDate || SchedulerService.isPastSlot(selectedDate, selection.startTime)) {
          toast.error(
            t('courtStatus.pastDateAlert', 'Cannot create bookings for past dates.'),
            'Không thể tạo lịch đặt sân cho ngày hoặc khung giờ trong quá khứ.',
          );
          return;
        }

        onOpenCreateBooking({
          courtId: selection.courtId,
          courtName: selection.courtName,
          startTime: selection.startTime,
          endTime: selection.endTime,
        });
        clearSelection();
      },
      [onOpenCreateBooking, clearSelection, isPastDate, selectedDate, t],
    );

    const handleBottomReset = useCallback(() => {
      if (activeSelection) {
        clearSelection();
      } else {
        onResetFilters();
      }
    }, [activeSelection, clearSelection, onResetFilters]);

    const handleBottomBook = useCallback(() => {
      if (isPastDate) {
        toast.error(
          t('courtStatus.pastDateAlert', 'Cannot create bookings for past dates.'),
          'Không thể tạo lịch đặt sân cho ngày trong quá khứ.',
        );
        return;
      }

      if (activeSelection && activeSelection.isConsecutive && !activeSelection.hasOverlap) {
        handleConfirmSelection(activeSelection);
      } else {
        onOpenCreateBooking();
      }
    }, [activeSelection, handleConfirmSelection, onOpenCreateBooking, isPastDate, t]);

    const isSelectionInvalid = Boolean(
      activeSelection && (!activeSelection.isConsecutive || activeSelection.hasOverlap),
    );

    return (
      <div className="relative flex flex-col flex-1 h-full w-full bg-white select-none overflow-hidden">
        {/* Past Date Protection Alert Banner */}
        {isPastDate && (
          <div
            role="alert"
            className="z-30 flex items-center justify-between border-b border-amber-300 bg-amber-50 px-4 py-2.5 text-xs font-semibold text-amber-900 shadow-xs"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-4 shrink-0 text-amber-600" />
              <span>{t('courtStatus.pastDateAlert', 'Cannot create bookings for past dates.')}</span>
              <span className="hidden sm:inline font-normal text-amber-700">
                ({t('courtStatus.pastDateAlertVi', 'Không thể tạo lịch đặt sân cho các ngày trong quá khứ.')})
              </span>
            </div>
            <span className="rounded bg-amber-200/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800">
              Chỉ xem (Read-only)
            </span>
          </div>
        )}

        {/* Mobile / Tablet Scroll Shadow Indicators */}
        {showLeftShadow && (
          <div
            aria-hidden="true"
            style={{ left: `${SCHEDULER_CONFIG.TOTAL_LEFT_COLUMN_WIDTH}px` }}
            className="pointer-events-none absolute top-0 bottom-12 z-25 w-5 bg-gradient-to-r from-slate-900/10 to-transparent transition-opacity duration-200"
          />
        )}
        {showRightShadow && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-0 right-0 bottom-12 z-25 w-6 bg-gradient-to-l from-slate-900/10 to-transparent transition-opacity duration-200"
          />
        )}

        {/* Scrollable Scheduler Container */}
        <div
          ref={containerRef}
          onScroll={updateScrollShadows}
          role="grid"
          aria-label="Lịch trạng thái sân cầu lông"
          className="relative flex-1 w-full overflow-x-auto overflow-y-auto scroll-smooth outline-none scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100"
          style={{ maxHeight: 'calc(100vh - 210px)' }}
        >
          {/* Main Table Structure */}
          <div
            style={{
              width: `${SCHEDULER_CONFIG.TOTAL_LEFT_COLUMN_WIDTH + timelineWidth}px`,
              minWidth: '100%',
            }}
          >
            {/* Sticky Time Header */}
            <TimeHeader
              timeSlots={timeSlots}
              slotWidth={slotWidth}
              timelineWidth={timelineWidth}
              closeTime={normalizedCloseTime}
              currentTimeOffsetPx={currentTimeOffsetPx}
              currentTimeLabel={currentTimeLabel}
            />

            {/* Grid Area with Left Sticky Court Column and Dynamic Rows */}
            <div className="flex">
              <CourtColumn
                courts={courts}
                virtualRows={virtualRows}
                dateLabel={dateLabel}
                totalHeight={totalVirtualHeight}
              />

              <SchedulerGrid
                courts={courts}
                timeSlots={timeSlots}
                bookings={bookings}
                slotWidth={slotWidth}
                timelineWidth={timelineWidth}
                openTime={normalizedOpenTime}
                slotInterval={slotInterval}
                virtualRows={virtualRows}
                totalHeight={totalVirtualHeight}
                totalWidth={totalGridWidth}
                activeSelection={activeSelection}
                currentTimeOffsetPx={currentTimeOffsetPx}
                onSlotClick={handleSlotClick}
                isSlotSelected={isSlotSelected}
                onConfirmSelection={handleConfirmSelection}
                onClearSelection={clearSelection}
                onSelectBooking={onSelectBooking}
                onEditBooking={onEditBooking}
                onCheckIn={onCheckIn}
                onCheckOut={onCheckOut}
                onCreateInvoice={onCreateInvoice}
                onCancelBooking={onCancelBooking}
              />
            </div>
          </div>
        </div>

        {/* Floating Bottom Control Bar (Pixel-matched with reference screenshot) */}
        <div className="sticky bottom-0 z-30 flex items-center justify-between gap-4 border-t border-slate-200 bg-white/95 px-4 py-2.5 backdrop-blur-sm shadow-md">
          {/* Left: Zoom slider and Shift button */}
          <div className="flex items-center gap-3">
            {/* Zoom Slider Control */}
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 shadow-inner">
              <span className="text-[11px] font-semibold text-slate-500">Thu nhỏ</span>
              <input
                type="range"
                min="0.65"
                max="1.5"
                step="0.05"
                aria-label="Mức độ thu phóng khung giờ"
                value={zoomLevel}
                onChange={(e) => onZoomChange(parseFloat(e.target.value))}
                className="h-1.5 w-24 sm:w-32 cursor-pointer appearance-none rounded-lg bg-emerald-200 accent-[#0d6838]"
              />
              <span className="text-[11px] font-semibold text-slate-500">Phóng to</span>
            </div>

            {/* Shift Mode Indicator */}
            <button
              type="button"
              className="hidden sm:flex items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-200 transition-colors"
            >
              <Layers className="size-3.5 text-slate-500" />
              <span>Shift</span>
            </button>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Reset / Reselect Button (Green) */}
            <button
              type="button"
              onClick={handleBottomReset}
              className="flex items-center gap-1.5 rounded-lg bg-[#2ecc71] hover:bg-[#27ae60] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition-transform active:scale-95"
            >
              <RotateCcw className="size-3.5 stroke-[2.5]" />
              <span>
                {activeSelection
                  ? t('courtStatus.bottom.clearSelection', 'Bỏ chọn')
                  : t('courtStatus.bottom.reselect', 'Chọn lại')}
              </span>
            </button>

            {/* Book Court Button (Grey / Green / Disabled) */}
            <button
              type="button"
              onClick={handleBottomBook}
              disabled={isPastDate || isSelectionInvalid}
              title={
                isPastDate
                  ? 'Cannot create bookings for past dates.'
                  : undefined
              }
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition-transform active:scale-95 ${
                isPastDate
                  ? 'bg-slate-400 cursor-not-allowed opacity-60'
                  : activeSelection && !isSelectionInvalid
                    ? 'bg-emerald-600 hover:bg-emerald-700 ring-2 ring-emerald-400'
                    : 'bg-[#7f8c8d] hover:bg-[#6c7a7b]'
              }`}
            >
              <Calendar className="size-3.5 stroke-[2.5]" />
              <span>
                {isPastDate
                  ? t('courtStatus.bottom.pastDateDisabled', 'Không thể đặt ngày quá khứ')
                  : activeSelection
                    ? !activeSelection.isConsecutive
                      ? t('courtStatus.bottom.notConsecutive', 'Chưa liền kề')
                      : activeSelection.hasOverlap
                        ? t('courtStatus.bottom.overlapWarning', 'Bị trùng lịch')
                        : `${t('courtStatus.bottom.book', 'Đặt lịch')} (${activeSelection.startTime} → ${activeSelection.endTime})`
                    : t('courtStatus.bottom.book', 'Đặt lịch')}
              </span>
            </button>

            {/* Create Event Button (Salmon / Reddish / Disabled) */}
            <button
              type="button"
              onClick={onOpenCreateEvent}
              disabled={isPastDate}
              title={
                isPastDate
                  ? 'Cannot create bookings for past dates.'
                  : undefined
              }
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition-transform active:scale-95 ${
                isPastDate
                  ? 'bg-slate-400 cursor-not-allowed opacity-60'
                  : 'bg-[#e74c3c] hover:bg-[#c0392b]'
              }`}
            >
              <Target className="size-3.5 stroke-[2.5]" />
              <span>{t('courtStatus.bottom.event', 'Sự kiện')}</span>
            </button>
          </div>
        </div>
      </div>
    );
  },
);

CourtScheduler.displayName = 'CourtScheduler';
