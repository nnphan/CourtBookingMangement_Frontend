import React, { memo, useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from '@/lib/dayjs';
import type { CourtStatusCourt, CourtScheduleItem } from '@/types/court-status';
import { generateTimelineHours } from '../utils/generateTimelineHours';
import { CourtRow } from './CourtRow';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Plus,
  Clock,
  Layers,
  Info,
} from 'lucide-react';

export interface CourtStatusBoardProps {
  courts: CourtStatusCourt[];
  scheduleItems: CourtScheduleItem[];
  openTime?: string;
  closeTime?: string;
  date?: string;
  zoomLevel?: number;
  onZoomChange?: (zoom: number) => void;
  onSelectBooking?: (booking: CourtScheduleItem) => void;
  onSlotClick?: (court: CourtStatusCourt, timeSlot: string) => void;
  onResetFilters?: () => void;
  onOpenCreateBooking?: (initial?: {
    courtId?: string;
    courtName?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
  }) => void;
}

const BASE_HOUR_WIDTH = 100;
const COURT_COLUMN_WIDTH = 110;
const ROW_HEIGHT = 44;

export const CourtStatusBoard: React.FC<CourtStatusBoardProps> = memo(
  ({
    courts,
    scheduleItems,
    openTime = '05:00:00',
    closeTime = '23:00:00',
    date,
    zoomLevel = 1.0,
    onZoomChange,
    onSelectBooking,
    onSlotClick,
    onResetFilters,
    onOpenCreateBooking,
  }) => {
    const { t } = useTranslation();
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [nowTick, setNowTick] = useState<number>(() => Date.now());

    // Update clock every minute
    useEffect(() => {
      const timer = window.setInterval(() => setNowTick(Date.now()), 60_000);
      return () => window.clearInterval(timer);
    }, []);

    // 1. Dynamic Timeline Generation from API openTime and closeTime
    const timelineHours = useMemo(
      () => generateTimelineHours(openTime, closeTime),
      [openTime, closeTime],
    );

    // 2. Memoized court list mapping
    const courtMappings = useMemo(() => {
      return courts.map((court) => ({
        ...court,
        key: court.courtId,
      }));
    }, [courts]);

    // 3. Memoized booking mappings grouped by courtId
    const bookingMappings = useMemo(() => {
      const map = new Map<string, CourtScheduleItem[]>();
      for (const item of scheduleItems) {
        const existing = map.get(item.courtId);
        if (existing) {
          existing.push(item);
        } else {
          map.set(item.courtId, [item]);
        }
      }
      return map;
    }, [scheduleItems]);

    // Scaled hour width derived from zoom level
    const hourWidth = useMemo(
      () => Math.max(70, Math.round(BASE_HOUR_WIDTH * zoomLevel)),
      [zoomLevel],
    );

    const totalTimelineWidth = useMemo(
      () => timelineHours.length * hourWidth,
      [timelineHours.length, hourWidth],
    );

    // Current Time Red Indicator Line (only when selected date is today)
    const isToday = useMemo(() => {
      if (!date) return false;
      return dayjs(date).isSame(dayjs(), 'day');
    }, [date]);

    const currentTimeOffsetPx = useMemo(() => {
      void nowTick;
      if (!isToday) return null;

      const now = dayjs();
      const currentMinutes = now.hour() * 60 + now.minute();
      const openParts = openTime.split(':');
      const openMinutes = (parseInt(openParts[0] ?? '5', 10) || 5) * 60 + (parseInt(openParts[1] ?? '0', 10) || 0);

      const closeParts = closeTime.split(':');
      const closeMinutes = (parseInt(closeParts[0] ?? '23', 10) || 23) * 60 + (parseInt(closeParts[1] ?? '0', 10) || 0);

      if (currentMinutes < openMinutes || currentMinutes > closeMinutes) {
        return null;
      }

      const offsetMinutes = currentMinutes - openMinutes;
      return Math.round((offsetMinutes / 60) * hourWidth);
    }, [isToday, openTime, closeTime, hourWidth, nowTick]);

    // Zoom handlers
    const handleZoomIn = useCallback(() => {
      if (onZoomChange) {
        onZoomChange(Math.min(1.6, Number((zoomLevel + 0.15).toFixed(2))));
      }
    }, [zoomLevel, onZoomChange]);

    const handleZoomOut = useCallback(() => {
      if (onZoomChange) {
        onZoomChange(Math.max(0.65, Number((zoomLevel - 0.15).toFixed(2))));
      }
    }, [zoomLevel, onZoomChange]);

    const handleZoomReset = useCallback(() => {
      if (onZoomChange) {
        onZoomChange(1.0);
      }
    }, [onZoomChange]);

    const hasNoBookings = scheduleItems.length === 0;

    return (
      <div className="relative flex flex-col flex-1 h-full w-full bg-white select-none overflow-hidden">
        {/* Floating Empty Bookings Banner if scheduleItems = [] */}
        {hasNoBookings && (
          <div
            role="status"
            className="z-30 flex items-center justify-between border-b border-blue-200 bg-blue-50/90 px-4 py-2 text-xs font-medium text-blue-900 shadow-2xs backdrop-blur-xs"
          >
            <div className="flex items-center gap-2">
              <Info className="size-4 shrink-0 text-blue-600" />
              <span>{t('courtStatus.empty.noBookings', 'No bookings for selected date')}</span>
              <span className="hidden sm:inline text-blue-700/80">
                ({t('courtStatus.empty.noBookingsVi', 'Chưa có lịch đặt nào cho ngày đã chọn.')})
              </span>
            </div>
            {onOpenCreateBooking && (
              <button
                type="button"
                onClick={() => onOpenCreateBooking({ date })}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-blue-600 text-white font-semibold text-xs shadow-2xs hover:bg-blue-700 active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="size-3.5" />
                <span>{t('courtStatus.empty.createBtn', 'Tạo lịch đặt')}</span>
              </button>
            )}
          </div>
        )}

        {/* Scrollable Timeline Grid Container */}
        <div
          ref={scrollContainerRef}
          role="grid"
          aria-label="Lịch trạng thái sân"
          className="relative flex-1 w-full overflow-x-auto overflow-y-auto scroll-smooth outline-none scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100"
          style={{ maxHeight: 'calc(100vh - 210px)' }}
        >
          <div
            style={{
              width: `${COURT_COLUMN_WIDTH + totalTimelineWidth}px`,
              minWidth: '100%',
            }}
          >
            {/* Sticky Time Header */}
            <div className="sticky top-0 z-30 flex h-11 border-b border-slate-200 bg-slate-100/95 backdrop-blur-md shadow-2xs">
              {/* Top-Left Corner Court Header */}
              <div
                style={{ width: `${COURT_COLUMN_WIDTH}px` }}
                className="sticky left-0 z-40 flex shrink-0 items-center justify-between border-r border-slate-200 bg-slate-200/90 px-3 font-bold text-xs text-slate-800 backdrop-blur-md shadow-xs select-none"
              >
                <span>{t('courtStatus.courtColumn.title', 'Sân')}</span>
                <span className="text-[10px] text-slate-500 font-normal">
                  ({courtMappings.length})
                </span>
              </div>

              {/* Time Column Headers */}
              <div className="relative flex flex-1">
                {timelineHours.map((hour) => (
                  <div
                    key={hour}
                    style={{ width: `${hourWidth}px` }}
                    className="flex shrink-0 items-center justify-center border-r border-slate-200/70 text-xs font-semibold text-slate-700 select-none"
                  >
                    <span>{hour}</span>
                  </div>
                ))}

                {/* Current Time Header Indicator Pointer */}
                {currentTimeOffsetPx !== null && (
                  <div
                    style={{ left: `${currentTimeOffsetPx}px` }}
                    className="absolute top-0 bottom-0 z-40 flex -translate-x-1/2 flex-col items-center pointer-events-none"
                  >
                    <span className="rounded bg-rose-600 px-1 text-[10px] font-bold text-white shadow-xs">
                      {dayjs().format('HH:mm')}
                    </span>
                    <div className="size-1.5 rotate-45 bg-rose-600 -mt-0.5" />
                  </div>
                )}
              </div>
            </div>

            {/* Dynamic Court Rows */}
            <div className="relative flex flex-col divide-y divide-slate-100">
              {courtMappings.map((court) => (
                <CourtRow
                  key={court.courtId}
                  court={court}
                  scheduleItems={bookingMappings.get(court.courtId) ?? []}
                  timelineHours={timelineHours}
                  openTime={openTime}
                  hourWidth={hourWidth}
                  rowHeight={ROW_HEIGHT}
                  courtColumnWidth={COURT_COLUMN_WIDTH}
                  onSelectBooking={onSelectBooking}
                  onSlotClick={onSlotClick}
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
                  className="w-[2px] -translate-x-1/2 bg-rose-500/90 pointer-events-none z-25 shadow-[0_0_4px_rgba(244,63,94,0.5)]"
                />
              )}
            </div>
          </div>
        </div>

        {/* Bottom Control Toolbar */}
        <footer className="sticky bottom-0 z-30 flex h-12 w-full items-center justify-between border-t border-slate-200 bg-white/95 px-4 backdrop-blur-md shadow-xs">
          {/* Left stats: court count & booking count */}
          <div className="flex items-center gap-3 text-xs text-slate-600">
            <span className="flex items-center gap-1.5 font-semibold text-slate-800">
              <Layers className="size-3.5 text-emerald-600" />
              <span>{courtMappings.length} {t('courtStatus.toolbar.courts', 'sân')}</span>
            </span>
            <span className="h-3 w-px bg-slate-300" />
            <span className="flex items-center gap-1.5">
              <Clock className="size-3.5 text-slate-500" />
              <span>{scheduleItems.length} {t('courtStatus.toolbar.bookings', 'lịch đặt')}</span>
            </span>
          </div>

          {/* Right Toolbar Actions: Zoom Controls, Reset Filters, Create Booking */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Zoom Controls */}
            {onZoomChange && (
              <div className="flex items-center gap-1 border-r border-slate-200 pr-2 mr-1">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  title={t('courtStatus.toolbar.zoomOut', 'Thu nhỏ')}
                  className="grid size-7 place-items-center rounded bg-slate-100 text-slate-600 hover:bg-slate-200 active:scale-95 transition-all cursor-pointer"
                >
                  <ZoomOut className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleZoomReset}
                  title={t('courtStatus.toolbar.zoomReset', 'Đặt lại kích thước')}
                  className="h-7 px-1.5 rounded bg-slate-100 text-[11px] font-bold text-slate-700 hover:bg-slate-200 cursor-pointer"
                >
                  {Math.round(zoomLevel * 100)}%
                </button>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  title={t('courtStatus.toolbar.zoomIn', 'Phóng to')}
                  className="grid size-7 place-items-center rounded bg-slate-100 text-slate-600 hover:bg-slate-200 active:scale-95 transition-all cursor-pointer"
                >
                  <ZoomIn className="size-3.5" />
                </button>
              </div>
            )}

            {/* Reset Filters Button */}
            {onResetFilters && (
              <button
                type="button"
                onClick={onResetFilters}
                className="flex items-center gap-1 rounded px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
              >
                <RotateCcw className="size-3.5" />
                <span className="hidden sm:inline">{t('courtStatus.toolbar.reset', 'Làm mới')}</span>
              </button>
            )}

            {/* Create Booking Action Button */}
            {onOpenCreateBooking && (
              <button
                type="button"
                onClick={() => onOpenCreateBooking({ date })}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="size-3.5" />
                <span>{t('courtStatus.toolbar.createBooking', 'Tạo đặt lịch')}</span>
              </button>
            )}
          </div>
        </footer>
      </div>
    );
  },
);

CourtStatusBoard.displayName = 'CourtStatusBoard';
export default CourtStatusBoard;
