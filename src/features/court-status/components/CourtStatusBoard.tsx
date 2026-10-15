import React, { memo, useMemo, useRef, useState, useEffect, useCallback } from 'react';
import type { CourtStatusCourtDto, CourtScheduleItemDto } from '../types/court-status.types';
import { generateTimelineHours, calculateCurrentTimeIndicator } from '../utils/timeline.utils';
import type { CourtSelection } from '../utils/time-selection.utils';
import { useCourtSelectionStore } from '../store/court-selection.store';
import { CourtTimeline } from './CourtTimeline';
import { CourtRow } from './CourtRow';
import { CourtSelectionBar } from './CourtSelectionBar';
import {
  ZoomIn,
  ZoomOut,
  Layers,
  Clock,
  Info,
  CalendarX,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export interface CourtStatusBoardProps {
  courts: CourtStatusCourtDto[];
  scheduleItems: CourtScheduleItemDto[];
  openTime?: string;
  closeTime?: string;
  selectedDate: string;
  selectedBranchId?: string;
  zoomLevel?: number;
  onZoomChange?: (zoom: number) => void;
  onSelectBooking?: (bookingId: string, item: CourtScheduleItemDto) => void;
  onConfirmSelection?: (selection: CourtSelection) => void;
}

interface SelectionInteraction {
  court: CourtStatusCourtDto;
  slot: string;
  pointerType: 'mouse' | 'touch';
  didDrag: boolean;
}

const BASE_HOUR_WIDTH = 100;
const COURT_COLUMN_WIDTH = 110;
const ROW_HEIGHT = 48;

export const CourtStatusBoard: React.FC<CourtStatusBoardProps> = memo(
  ({
    courts,
    scheduleItems,
    openTime = '05:00:00',
    closeTime = '23:00:00',
    selectedDate,
    selectedBranchId,
    zoomLevel = 1.0,
    onZoomChange,
    onSelectBooking,
    onConfirmSelection,
  }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [tick, setTick] = useState<number>(() => Date.now());

    // Zustand Court Selection Store
    const selection = useCourtSelectionStore((s) => s.selection);

    const startSelection = useCourtSelectionStore((s) => s.startSelection);
    const updateSelection = useCourtSelectionStore((s) => s.updateSelection);
    const completeSelection = useCourtSelectionStore((s) => s.completeSelection);
    const clearSelection = useCourtSelectionStore((s) => s.clearSelection);
    const handleClickSlot = useCourtSelectionStore((s) => s.handleClickSlot);
    const setHoverSlot = useCourtSelectionStore((s) => s.setHoverSlot);
    const interactionRef = useRef<SelectionInteraction | null>(null);
    const suppressClickRef = useRef(false);
    const suppressClickTimeoutRef = useRef<number | null>(null);

    const suppressFollowingClick = useCallback(() => {
      suppressClickRef.current = true;
      if (suppressClickTimeoutRef.current !== null) {
        window.clearTimeout(suppressClickTimeoutRef.current);
      }
      suppressClickTimeoutRef.current = window.setTimeout(() => {
        suppressClickRef.current = false;
        suppressClickTimeoutRef.current = null;
      }, 0);
    }, []);

    const finishInteraction = useCallback(() => {
      const interaction = interactionRef.current;
      interactionRef.current = null;
      if (interaction?.didDrag) {
        suppressFollowingClick();
      }
      if (useCourtSelectionStore.getState().isSelecting) {
        completeSelection();
      }
    }, [completeSelection, suppressFollowingClick]);

    // Edge Case 4 & 5: Clear selection when date or branch changes
    useEffect(() => {
      clearSelection();
    }, [selectedDate, selectedBranchId, clearSelection]);

    // Update current time clock every 30 seconds
    useEffect(() => {
      const timer = window.setInterval(() => setTick(Date.now()), 30_000);
      return () => window.clearInterval(timer);
    }, []);

    // 1. Dynamic Timeline Generation from openTime and closeTime
    const timelineHours = useMemo(
      () => generateTimelineHours(openTime, closeTime),
      [openTime, closeTime],
    );

    // 2. Scaled hour width derived from zoom level
    const hourWidth = useMemo(
      () => Math.max(70, Math.round(BASE_HOUR_WIDTH * zoomLevel)),
      [zoomLevel],
    );

    const totalTimelineWidth = useMemo(
      () => timelineHours.length * hourWidth,
      [timelineHours.length, hourWidth],
    );

    // 3. Group scheduleItems by courtId for O(1) row access
    const bookingsByCourtId = useMemo(() => {
      const map = new Map<string, CourtScheduleItemDto[]>();
      for (const item of scheduleItems) {
        const list = map.get(item.courtId);
        if (list) {
          list.push(item);
        } else {
          map.set(item.courtId, [item]);
        }
      }
      return map;
    }, [scheduleItems]);

    const updateDragSelection = useCallback(
      (interaction: SelectionInteraction, slot: string) => {
        const { court } = interaction;
        const bookings = bookingsByCourtId.get(court.courtId) || [];
        if (!interaction.didDrag) {
          interaction.didDrag = true;
          startSelection(
            court.courtId,
            court.courtName,
            interaction.slot,
            timelineHours,
            bookings,
            selectedDate,
            court.status,
          );
        }
        updateSelection(court.courtId, slot, timelineHours, bookings, selectedDate, court.status);
      },
      [bookingsByCourtId, selectedDate, startSelection, timelineHours, updateSelection],
    );

    // 4. Current Time Vertical Red Indicator Line
    const { offsetPx: currentTimeOffsetPx, label: currentTimeLabel } = useMemo(() => {
      void tick;
      return calculateCurrentTimeIndicator(openTime, closeTime, hourWidth, selectedDate);
    }, [openTime, closeTime, hourWidth, selectedDate, tick]);

    // Global mouseup & touchend & keydown (Escape) listener
    useEffect(() => {
      const handleGlobalKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          clearSelection();
        }
      };

      window.addEventListener('mouseup', finishInteraction);
      window.addEventListener('touchend', finishInteraction);
      window.addEventListener('keydown', handleGlobalKeyDown);

      return () => {
        window.removeEventListener('mouseup', finishInteraction);
        window.removeEventListener('touchend', finishInteraction);
        window.removeEventListener('keydown', handleGlobalKeyDown);
        if (suppressClickTimeoutRef.current !== null) {
          window.clearTimeout(suppressClickTimeoutRef.current);
        }
      };
    }, [clearSelection, finishInteraction]);

    // Desktop Mouse Event Handlers
    const handleCellMouseDown = useCallback(
      (court: CourtStatusCourtDto, hour: string, e: React.MouseEvent) => {
        // Only trigger on left-click
        if (e.button !== 0) return;
        interactionRef.current = { court, slot: hour, pointerType: 'mouse', didDrag: false };
      },
      [],
    );

    const handleCellMouseEnter = useCallback(
      (court: CourtStatusCourtDto, hour: string) => {
        const interaction = interactionRef.current;
        if (
          interaction?.pointerType === 'mouse' &&
          interaction.court.courtId === court.courtId &&
          (hour !== interaction.slot || interaction.didDrag)
        ) {
          updateDragSelection(interaction, hour);
          return;
        }
        const currentSelection = useCourtSelectionStore.getState();
        if (currentSelection.isSelecting && currentSelection.selectedCourtId === court.courtId) {
          const bookings = bookingsByCourtId.get(court.courtId) || [];
          updateSelection(court.courtId, hour, timelineHours, bookings, selectedDate, court.status);
        } else {
          setHoverSlot(hour);
        }
      },
      [
        bookingsByCourtId,
        updateSelection,
        timelineHours,
        selectedDate,
        setHoverSlot,
        updateDragSelection,
      ],
    );

    const handleCellMouseUp = finishInteraction;

    const handleCellClick = useCallback(
      (court: CourtStatusCourtDto, hour: string) => {
        if (suppressClickRef.current) {
          suppressClickRef.current = false;
          if (suppressClickTimeoutRef.current !== null) {
            window.clearTimeout(suppressClickTimeoutRef.current);
            suppressClickTimeoutRef.current = null;
          }
          return;
        }
        const bookings = bookingsByCourtId.get(court.courtId) || [];
        handleClickSlot(
          court.courtId,
          court.courtName,
          hour,
          timelineHours,
          bookings,
          selectedDate,
          court.status,
        );
      },
      [bookingsByCourtId, handleClickSlot, timelineHours, selectedDate],
    );

    // Mobile Touch Event Handlers
    const handleCellTouchStart = useCallback((court: CourtStatusCourtDto, hour: string) => {
      interactionRef.current = { court, slot: hour, pointerType: 'touch', didDrag: false };
    }, []);

    const handleTouchMove = useCallback(
      (e: React.TouchEvent) => {
        const touch = e.touches[0];
        if (!touch) return;

        const interaction = interactionRef.current;
        if (interaction?.pointerType !== 'touch') return;

        const el = document.elementFromPoint(touch.clientX, touch.clientY);
        const cell = el?.closest('[data-slot-hour]');
        if (cell) {
          const slotHour = cell.getAttribute('data-slot-hour');
          const cellCourtId = cell.getAttribute('data-court-id');
          if (slotHour && cellCourtId === interaction.court.courtId) {
            if (slotHour !== interaction.slot || interaction.didDrag) {
              updateDragSelection(interaction, slotHour);
            }
          }
        }
      },
      [updateDragSelection],
    );

    // Zoom Handlers
    const handleZoomIn = useCallback(() => {
      if (onZoomChange) {
        onZoomChange(Math.min(1.6, Number((zoomLevel + 0.15).toFixed(2))));
      }
    }, [zoomLevel, onZoomChange]);

    const handleZoomOut = useCallback(() => {
      if (onZoomChange) {
        onZoomChange(Math.max(0.7, Number((zoomLevel - 0.15).toFixed(2))));
      }
    }, [zoomLevel, onZoomChange]);

    const handleZoomReset = useCallback(() => {
      if (onZoomChange) {
        onZoomChange(1.0);
      }
    }, [onZoomChange]);

    const handleScrollBy = useCallback(
      (direction: 'left' | 'right') => {
        const el = scrollContainerRef.current;
        if (!el) return;
        const delta = hourWidth * 3 * (direction === 'left' ? -1 : 1);
        el.scrollBy({ left: delta, behavior: 'smooth' });
      },
      [hourWidth],
    );

    // Empty state: No courts
    if (courts.length === 0) {
      return (
        <div
          role="status"
          className="flex w-full flex-1 flex-col items-center justify-center bg-white p-8 text-center"
        >
          <div className="mb-3 flex size-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <CalendarX className="size-8" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Không có sân khả dụng.</h2>
          <p className="mt-1 max-w-sm text-xs text-slate-500">
            Hiện không tìm thấy sân nào thuộc chi nhánh đã chọn hoặc chi nhánh chưa cấu hình danh
            sách sân.
          </p>
        </div>
      );
    }

    return (
      <div
        className="relative flex h-full w-full flex-1 flex-col overflow-hidden bg-white select-none"
        onTouchMove={handleTouchMove}
      >
        {/* Floating banner when there are 0 bookings for the date */}
        {scheduleItems.length === 0 && (
          <div
            role="status"
            className="z-30 flex items-center justify-between border-b border-emerald-200 bg-emerald-50/90 px-4 py-2 text-xs font-medium text-emerald-900 shadow-2xs backdrop-blur-xs"
          >
            <div className="flex items-center gap-2">
              <Info className="size-4 shrink-0 text-emerald-600" />
              <span>
                Chưa có lịch đặt nào cho ngày đã chọn. Nhấp hoặc kéo chuột để chọn dải giờ đặt sân!
              </span>
            </div>
          </div>
        )}

        {/* Scrollable Timeline Grid Container */}
        <div
          ref={scrollContainerRef}
          role="grid"
          aria-label="Bảng trạng thái sân"
          className="relative w-full flex-1 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 overflow-x-auto overflow-y-auto scroll-smooth outline-none"
          style={{ maxHeight: 'calc(100vh - 195px)' }}
        >
          <div
            style={{
              width: `${COURT_COLUMN_WIDTH + totalTimelineWidth}px`,
              minWidth: '100%',
            }}
          >
            {/* Sticky Time Header */}
            <CourtTimeline
              timelineHours={timelineHours}
              hourWidth={hourWidth}
              courtColumnWidth={COURT_COLUMN_WIDTH}
              courtCount={courts.length}
              currentTimeOffsetPx={currentTimeOffsetPx}
              currentTimeLabel={currentTimeLabel}
            />

            {/* Dynamic Court Rows */}
            <div className="relative flex flex-col divide-y divide-slate-100">
              {courts.map((court) => (
                <CourtRow
                  key={court.courtId}
                  court={court}
                  bookings={bookingsByCourtId.get(court.courtId) ?? []}
                  timelineHours={timelineHours}
                  openTime={openTime}
                  hourWidth={hourWidth}
                  rowHeight={ROW_HEIGHT}
                  courtColumnWidth={COURT_COLUMN_WIDTH}
                  selectedDate={selectedDate}
                  onSelectBooking={onSelectBooking}
                  onMouseDown={handleCellMouseDown}
                  onMouseEnter={handleCellMouseEnter}
                  onMouseUp={handleCellMouseUp}
                  onTouchStart={handleCellTouchStart}
                  onTouchEnd={handleCellMouseUp}
                  onClickSlot={handleCellClick}
                />
              ))}

              {/* Current Time Vertical Red Line across all rows */}
              {currentTimeOffsetPx !== null && (
                <div
                  style={{
                    position: 'absolute',
                    left: `${COURT_COLUMN_WIDTH + currentTimeOffsetPx}px`,
                    top: 0,
                    bottom: 0,
                  }}
                  className="pointer-events-none z-25 w-[2px] -translate-x-1/2 bg-rose-500/90 shadow-[0_0_4px_rgba(244,63,94,0.5)]"
                />
              )}
            </div>
          </div>
        </div>

        {/* Bottom Control Toolbar */}
        <footer className="sticky bottom-0 z-30 flex h-12 w-full items-center justify-between border-t border-slate-200 bg-white/95 px-4 shadow-xs backdrop-blur-md">
          {/* Left stats: court count & booking count */}
          <div className="flex items-center gap-3 text-xs text-slate-600">
            <span className="flex items-center gap-1.5 font-bold text-slate-800">
              <Layers className="size-3.5 text-emerald-600" />
              <span>{courts.length} sân</span>
            </span>
            <span className="h-3 w-px bg-slate-300" />
            <span className="flex items-center gap-1.5 font-medium">
              <Clock className="size-3.5 text-slate-500" />
              <span>{scheduleItems.length} lịch đặt</span>
            </span>
          </div>

          {/* Right Toolbar Actions: Scroll navigation & Zoom Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Scroll navigation arrows for small screens / touch */}
            <div className="mr-1 flex items-center gap-1 border-r border-slate-200 pr-2">
              <button
                type="button"
                onClick={() => handleScrollBy('left')}
                title="Cuộn sang trái"
                aria-label="Cuộn sang trái"
                className="grid size-7 cursor-pointer place-items-center rounded bg-slate-100 text-slate-600 transition-all hover:bg-slate-200 active:scale-95"
              >
                <ChevronLeft className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleScrollBy('right')}
                title="Cuộn sang phải"
                aria-label="Cuộn sang phải"
                className="grid size-7 cursor-pointer place-items-center rounded bg-slate-100 text-slate-600 transition-all hover:bg-slate-200 active:scale-95"
              >
                <ChevronRight className="size-3.5" />
              </button>
            </div>

            {/* Zoom Controls */}
            {onZoomChange && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  title="Thu nhỏ"
                  className="grid size-7 cursor-pointer place-items-center rounded bg-slate-100 text-slate-600 transition-all hover:bg-slate-200 active:scale-95"
                >
                  <ZoomOut className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleZoomReset}
                  title="Đặt lại 100%"
                  className="h-7 cursor-pointer rounded bg-slate-100 px-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-200"
                >
                  {Math.round(zoomLevel * 100)}%
                </button>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  title="Phóng to"
                  className="grid size-7 cursor-pointer place-items-center rounded bg-slate-100 text-slate-600 transition-all hover:bg-slate-200 active:scale-95"
                >
                  <ZoomIn className="size-3.5" />
                </button>
              </div>
            )}
          </div>
        </footer>

        {/* Floating Selection Confirmation Bar (Thông tin đặt sân) */}
        <CourtSelectionBar
          selection={selection}
          date={selectedDate}
          onClear={clearSelection}
          onConfirm={(sel) => onConfirmSelection?.(sel)}
        />
      </div>
    );
  },
);

CourtStatusBoard.displayName = 'CourtStatusBoard';
export default CourtStatusBoard;
