import React, { memo, useRef, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { CourtItem } from '../types/court';
import type { BookingItem } from '../types/booking';
import type { SlotSelectionRange } from '../types/common';
import { SchedulerService } from '../services/scheduler.service';
import { SCHEDULER_CONFIG } from '../constants/scheduler';
import { useCourtStatusStore } from '../store/court-status.store';
import { useSchedulerVirtualization } from '../hooks/useSchedulerVirtualization';
import { useSlotSelection } from '../hooks/useSlotSelection';
import { TimeHeader } from './TimeHeader';
import { CourtColumn } from './CourtColumn';
import { SchedulerGrid } from './SchedulerGrid';
import { RotateCcw, Calendar, Target, Layers, AlertTriangle } from 'lucide-react';
import { toast } from '@/lib/toast';

interface CourtSchedulerProps {
  courts: CourtItem[];
  bookings: BookingItem[];
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

    const selectedDate = useCourtStatusStore((s) => s.selectedDate);
    const isPastDate = useMemo(() => SchedulerService.isPastDate(selectedDate), [selectedDate]);

    // Calculate dynamic slot width based on zoom level
    const slotWidth = useMemo(() => {
      const computed = Math.round(SCHEDULER_CONFIG.BASE_SLOT_WIDTH * zoomLevel);
      return Math.max(SCHEDULER_CONFIG.MIN_SLOT_WIDTH, Math.min(SCHEDULER_CONFIG.MAX_SLOT_WIDTH, computed));
    }, [zoomLevel]);

    // Generate time slots based on interval (30 min default, supports 15 min without code changes)
    const timeSlots = useMemo(
      () =>
        SchedulerService.generateTimeSlots(
          SCHEDULER_CONFIG.START_TIME,
          SCHEDULER_CONFIG.END_TIME,
          slotInterval,
        ),
      [slotInterval],
    );

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

    const totalGridWidth = useMemo(() => {
      return timeSlots.length * slotWidth;
    }, [timeSlots.length, slotWidth]);

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
      <div className="relative flex flex-col h-full w-full bg-white select-none overflow-hidden">
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
        {/* Scrollable Scheduler Container */}
        <div
          ref={containerRef}
          role="grid"
          aria-label="Lịch trạng thái sân cầu lông"
          className="relative flex-1 overflow-auto outline-none scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100"
          style={{ maxHeight: 'calc(100vh - 220px)' }}
        >
          {/* Main Table Structure */}
          <div
            style={{
              width: `${SCHEDULER_CONFIG.TOTAL_LEFT_COLUMN_WIDTH + totalGridWidth}px`,
              minWidth: '100%',
            }}
          >
            {/* Sticky Time Header */}
            <TimeHeader timeSlots={timeSlots} slotWidth={slotWidth} />

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
                slotInterval={slotInterval}
                virtualRows={virtualRows}
                totalHeight={totalVirtualHeight}
                totalWidth={totalGridWidth}
                activeSelection={activeSelection}
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
