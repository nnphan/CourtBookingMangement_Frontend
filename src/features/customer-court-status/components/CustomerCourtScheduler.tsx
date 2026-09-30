import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CustomerCourt } from '../types/customer-court';
import type { CustomerSlotItem } from '../types/customer-slot';
import { CustomerCourtStatusService } from '../services/customer-court-status.service';
import {
  COURT_COLUMN_WIDTH,
  SCHEDULER_CONFIG,
} from '../constants/customer-scheduler.config';
import { calculateCurrentTimeOffset } from '../utils/time-slot.utils';
import { useSchedulerDimensions } from '../hooks/useSchedulerDimensions';
import { CustomerTimeHeader } from './CustomerTimeHeader';
import { CustomerCourtRow } from './CustomerCourtRow';
import { CustomerAvailabilityLayer } from './CustomerAvailabilityLayer';
import { useCustomerSchedulerSelection } from '../hooks/useCustomerSchedulerSelection';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';

interface CustomerCourtSchedulerProps {
  courts: CustomerCourt[];
  slots: CustomerSlotItem[];
  openTime?: string;
  closeTime?: string;
  slotInterval?: number;
  zoomLevel: number;
}

export const CustomerCourtScheduler: React.FC<CustomerCourtSchedulerProps> = memo(
  ({
    courts,
    slots,
    openTime = SCHEDULER_CONFIG.START_TIME,
    closeTime = SCHEDULER_CONFIG.END_TIME,
    slotInterval = SCHEDULER_CONFIG.SLOT_DURATION,
    zoomLevel,
  }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const hasAutoScrolledRef = useRef<boolean>(false);

    const [canScrollLeft, setCanScrollLeft] = useState<boolean>(false);
    const [canScrollRight, setCanScrollRight] = useState<boolean>(false);
    const [tick, setTick] = useState<number>(0);

    // Dynamic responsive dimensions derived from openTime, closeTime, and container width
    const {
      slotWidth,
      timelineWidth,
      openTime: normalizedOpenTime,
      closeTime: normalizedCloseTime,
      containerWidth,
    } = useSchedulerDimensions({
      containerRef: scrollContainerRef,
      openTime,
      closeTime,
      slotInterval,
      courtColumnWidth: COURT_COLUMN_WIDTH,
      zoomLevel,
    });

    // Generate time slots based on branch operating hours (openTime -> closeTime)
    const timeSlots = useMemo(
      () =>
        CustomerCourtStatusService.generateTimeSlots(
          normalizedOpenTime,
          normalizedCloseTime,
          slotInterval,
        ),
      [normalizedOpenTime, normalizedCloseTime, slotInterval],
    );

    // Refresh current time indicator every minute
    useEffect(() => {
      const timer = window.setInterval(() => {
        setTick((prev) => prev + 1);
      }, 60_000);
      return () => window.clearInterval(timer);
    }, []);

    // Current time red line position
    const currentTimeInfo = useMemo(
      () =>
        calculateCurrentTimeOffset(
          slotWidth,
          slotInterval,
          normalizedOpenTime,
          normalizedCloseTime,
        ),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [slotWidth, slotInterval, normalizedOpenTime, normalizedCloseTime, tick],
    );

    // Update horizontal scroll shadow indicators
    const handleScroll = useCallback(() => {
      const el = scrollContainerRef.current;
      if (!el) return;
      setCanScrollLeft(el.scrollLeft > 8);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
    }, []);

    useEffect(() => {
      handleScroll();
    }, [timelineWidth, containerWidth, handleScroll]);

    // Auto-scroll to current time on initial load (only when horizontal scroll is active)
    const scrollToCurrentTime = useCallback(
      (behavior: ScrollBehavior = 'smooth') => {
        const el = scrollContainerRef.current;
        if (!el) return;
        const targetX = Math.max(0, currentTimeInfo.offsetPx - el.clientWidth / 3);
        el.scrollTo({ left: targetX, behavior });
      },
      [currentTimeInfo.offsetPx],
    );

    useEffect(() => {
      const el = scrollContainerRef.current;
      if (!hasAutoScrolledRef.current && el && slotWidth > 0) {
        hasAutoScrolledRef.current = true;
        const isOverflowing = el.scrollWidth > el.clientWidth + 8;
        if (isOverflowing && currentTimeInfo.isWithinHours && currentTimeInfo.offsetPx > 240) {
          scrollToCurrentTime('smooth');
        }
      }
    }, [slotWidth, currentTimeInfo.isWithinHours, currentTimeInfo.offsetPx, scrollToCurrentTime]);

    const handleScrollBy = useCallback(
      (direction: 'left' | 'right') => {
        const el = scrollContainerRef.current;
        if (!el) return;
        const delta = slotWidth * 3 * (direction === 'left' ? -1 : 1);
        el.scrollBy({ left: delta, behavior: 'smooth' });
      },
      [slotWidth],
    );

    // Selection management hook
    const {
      activeSelection,
      handleSlotClick,
      isSlotSelected,
      clearSelection,
      handleBookCurrentSelection,
    } = useCustomerSchedulerSelection({ courts, slots, slotInterval });

    return (
      <div className="relative w-full h-full flex-1 flex flex-col overflow-hidden bg-white select-none">
        {/* Quick Navigation Bar for Mobile & Tablet Horizontal Scroll */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50 border-b border-slate-200 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 font-medium text-slate-700">
              <Clock className="size-3.5 text-emerald-600" />
              <span>
                Khung giờ: {normalizedOpenTime} - {normalizedCloseTime} ({slotInterval} phút/ô)
              </span>
            </span>
            <span className="hidden sm:inline text-slate-400">•</span>
            <span className="hidden sm:inline text-slate-500">
              Chạm hoặc nhấp vào các ô trống liên tiếp để đặt lịch
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => scrollToCurrentTime('smooth')}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-[11px] transition-colors cursor-pointer"
              title="Cuộn đến giờ hiện tại"
            >
              <span className="size-1.5 rounded-full bg-rose-500 animate-pulse" />
              <span>Hiện tại ({currentTimeInfo.currentTimeLabel})</span>
            </button>

            <button
              type="button"
              onClick={() => handleScrollBy('left')}
              disabled={!canScrollLeft}
              aria-label="Cuộn sang trái"
              className="p-1 rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 cursor-pointer transition-colors"
            >
              <ChevronLeft className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleScrollBy('right')}
              disabled={!canScrollRight}
              aria-label="Cuộn sang phải"
              className="p-1 rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 cursor-pointer transition-colors"
            >
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>

        {/* Horizontal & Vertical Scroll Container with Mobile Scroll Shadow Indicators */}
        <div className="relative flex-1 flex flex-col w-full overflow-hidden">
          {canScrollLeft && (
            <div
              aria-hidden="true"
              style={{ left: `${COURT_COLUMN_WIDTH}px` }}
              className="pointer-events-none absolute top-0 bottom-0 w-5 z-25 bg-linear-to-r from-black/10 to-transparent"
            />
          )}
          {canScrollRight && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 z-25 bg-linear-to-l from-black/10 to-transparent"
            />
          )}

          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex-1 w-full overflow-x-auto overflow-y-auto relative scroll-smooth touch-pan-x touch-pan-y"
          >
            <div
              style={{
                width: `${COURT_COLUMN_WIDTH + timelineWidth}px`,
                minWidth: '100%',
              }}
            >
              {/* Sticky Time Header */}
              <CustomerTimeHeader
                timeSlots={timeSlots}
                slotWidth={slotWidth}
                timelineWidth={timelineWidth}
                closeTime={normalizedCloseTime}
                currentTimeOffsetPx={
                  currentTimeInfo.isWithinHours ? currentTimeInfo.offsetPx : null
                }
                currentTimeLabel={currentTimeInfo.currentTimeLabel}
              />

              {/* Court Rows */}
              <div className="flex flex-col w-full">
                {courts.map((court) => (
                  <CustomerCourtRow
                    key={court.courtId}
                    court={court}
                    slots={slots}
                    timeSlots={timeSlots}
                    slotWidth={slotWidth}
                    timelineWidth={timelineWidth}
                    openTime={normalizedOpenTime}
                    slotInterval={slotInterval}
                    activeSelection={activeSelection}
                    currentTimeOffsetPx={
                      currentTimeInfo.isWithinHours ? currentTimeInfo.offsetPx : null
                    }
                    onSlotClick={handleSlotClick}
                    onClearSelection={clearSelection}
                    isSlotSelected={isSlotSelected}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Floating selection action layer */}
        <CustomerAvailabilityLayer
          activeSelection={activeSelection}
          onClearSelection={clearSelection}
          onConfirmSelection={handleBookCurrentSelection}
        />
      </div>
    );
  },
);

CustomerCourtScheduler.displayName = 'CustomerCourtScheduler';

