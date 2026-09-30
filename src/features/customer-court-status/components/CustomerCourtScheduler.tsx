import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CustomerCourt } from '../types/customer-court';
import type { CustomerSlotItem } from '../types/customer-slot';
import { CustomerCourtStatusService } from '../services/customer-court-status.service';
import {
  COURT_COLUMN_WIDTH,
  SCHEDULER_CONFIG,
} from '../constants/customer-scheduler.config';
import {
  calculateCurrentTimeOffset,
  getResponsiveSlotWidth,
} from '../utils/time-slot.utils';
import { CustomerTimeHeader } from './CustomerTimeHeader';
import { CustomerCourtRow } from './CustomerCourtRow';
import { CustomerAvailabilityLayer } from './CustomerAvailabilityLayer';
import { useCustomerSchedulerSelection } from '../hooks/useCustomerSchedulerSelection';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';

interface CustomerCourtSchedulerProps {
  courts: CustomerCourt[];
  slots: CustomerSlotItem[];
  slotInterval?: number;
  zoomLevel: number;
}

export const CustomerCourtScheduler: React.FC<CustomerCourtSchedulerProps> = memo(
  ({ courts, slots, slotInterval = SCHEDULER_CONFIG.SLOT_DURATION, zoomLevel }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const hasAutoScrolledRef = useRef<boolean>(false);

    const [viewportWidth, setViewportWidth] = useState<number>(() =>
      typeof window !== 'undefined' ? window.innerWidth : 1280,
    );
    const [containerWidth, setContainerWidth] = useState<number>(0);
    const [canScrollLeft, setCanScrollLeft] = useState<boolean>(false);
    const [canScrollRight, setCanScrollRight] = useState<boolean>(true);
    const [tick, setTick] = useState<number>(0);

    // Generate 60-minute time slots from 05:00 to 23:00 (18 cells)
    const timeSlots = useMemo(
      () =>
        CustomerCourtStatusService.generateTimeSlots(
          SCHEDULER_CONFIG.START_TIME,
          SCHEDULER_CONFIG.END_TIME,
          slotInterval,
        ),
      [slotInterval],
    );

    // Observe viewport & container width for 100% full-width responsive slot sizing
    useEffect(() => {
      const updateDimensions = () => {
        setViewportWidth(window.innerWidth);
        if (scrollContainerRef.current) {
          setContainerWidth(scrollContainerRef.current.clientWidth);
        }
      };

      updateDimensions();
      window.addEventListener('resize', updateDimensions);

      let observer: ResizeObserver | null = null;
      if (typeof ResizeObserver !== 'undefined' && scrollContainerRef.current) {
        observer = new ResizeObserver((entries) => {
          const entry = entries[0];
          if (entry) {
            setContainerWidth(Math.floor(entry.contentRect.width));
          }
        });
        observer.observe(scrollContainerRef.current);
      }

      return () => {
        window.removeEventListener('resize', updateDimensions);
        observer?.disconnect();
      };
    }, []);

    // Refresh current time indicator every minute
    useEffect(() => {
      const timer = window.setInterval(() => {
        setTick((prev) => prev + 1);
      }, 60_000);
      return () => window.clearInterval(timer);
    }, []);

    // Responsive slot width: 100px Desktop (>=1280), 90px Tablet (768-1279), 80px Mobile (<768)
    // Expands automatically when screen is wider so scheduler uses 100% available width
    const slotWidth = useMemo(
      () =>
        getResponsiveSlotWidth(
          viewportWidth,
          containerWidth,
          timeSlots.length,
          zoomLevel,
          COURT_COLUMN_WIDTH,
        ),
      [viewportWidth, containerWidth, timeSlots.length, zoomLevel],
    );

    const totalGridWidth = useMemo(
      () => timeSlots.length * slotWidth,
      [timeSlots.length, slotWidth],
    );

    // Current time red line position
    const currentTimeInfo = useMemo(
      () =>
        calculateCurrentTimeOffset(
          slotWidth,
          slotInterval,
          SCHEDULER_CONFIG.START_TIME,
          SCHEDULER_CONFIG.END_TIME,
        ),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [slotWidth, slotInterval, tick],
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
    }, [totalGridWidth, containerWidth, handleScroll]);

    // Auto-scroll to current time on initial load
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
      if (!hasAutoScrolledRef.current && scrollContainerRef.current && slotWidth > 0) {
        hasAutoScrolledRef.current = true;
        if (currentTimeInfo.isWithinHours && currentTimeInfo.offsetPx > 240) {
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
              <span>Khung giờ: 05:00 - 23:00 ({slotInterval} phút/ô)</span>
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
                width: `${COURT_COLUMN_WIDTH + totalGridWidth + 28}px`,
                minWidth: '100%',
              }}
            >
              {/* Sticky Time Header */}
              <CustomerTimeHeader
                timeSlots={timeSlots}
                slotWidth={slotWidth}
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

