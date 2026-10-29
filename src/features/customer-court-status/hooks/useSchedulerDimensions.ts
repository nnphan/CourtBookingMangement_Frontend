import { useEffect, useMemo, useState, type RefObject } from 'react';
import {
  BOUNDARY_PADDING_PX,
  COURT_COLUMN_WIDTH,
  MAX_SLOT_WIDTH,
  MIN_SLOT_WIDTH,
  SCHEDULER_CONFIG,
} from '../constants/customer-scheduler.config';
import {
  calculateAdaptiveSlotWidth,
  normalizeOperatingHours,
} from '../utils/time-slot.utils';

export interface UseSchedulerDimensionsOptions {
  containerRef: RefObject<HTMLElement | null>;
  openTime?: string;
  closeTime?: string;
  slotInterval?: number;
  courtColumnWidth?: number;
  zoomLevel?: number;
  minSlotWidth?: number;
  maxSlotWidth?: number;
  boundaryPaddingPx?: number;
}

export interface SchedulerDimensionsResult {
  slotWidth: number;
  gridWidth: number;
  timelineWidth: number;
  totalHours: number;
  totalSlots: number;
  availableWidth: number;
  containerWidth: number;
  openTime: string;
  closeTime: string;
  boundaryPaddingPx: number;
}

/**
 * Reusable hook that dynamically calculates scheduler slotWidth and timelineWidth
 * based on branch operating hours (openTime -> closeTime) and container width.
 * Uses ResizeObserver + requestAnimationFrame to prevent layout thrashing.
 */
export function useSchedulerDimensions({
  containerRef,
  openTime = SCHEDULER_CONFIG.START_TIME,
  closeTime = SCHEDULER_CONFIG.END_TIME,
  slotInterval = SCHEDULER_CONFIG.SLOT_DURATION,
  courtColumnWidth = COURT_COLUMN_WIDTH,
  zoomLevel = 1.0,
  minSlotWidth = MIN_SLOT_WIDTH,
  maxSlotWidth = MAX_SLOT_WIDTH,
  boundaryPaddingPx = BOUNDARY_PADDING_PX,
}: UseSchedulerDimensionsOptions): SchedulerDimensionsResult {
  const [containerWidth, setContainerWidth] = useState<number>(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1280,
  );

  useEffect(() => {
    let rafId: number | null = null;

    const measure = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      rafId = requestAnimationFrame(() => {
        const el = containerRef.current;
        if (el && el.clientWidth > 0) {
          setContainerWidth(Math.floor(el.clientWidth));
        } else if (typeof window !== 'undefined') {
          setContainerWidth(Math.floor(window.innerWidth));
        }
      });
    };

    measure();

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      observer = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
        }
        rafId = requestAnimationFrame(() => {
          const width = Math.floor(entry.contentRect.width);
          if (width > 0) {
            setContainerWidth(width);
          }
        });
      });
      observer.observe(containerRef.current);
    }

    window.addEventListener('resize', measure);
    const visualViewport = typeof window !== 'undefined' ? window.visualViewport : null;
    visualViewport?.addEventListener('resize', measure);

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      observer?.disconnect();
      window.removeEventListener('resize', measure);
      visualViewport?.removeEventListener('resize', measure);
    };
  }, [containerRef]);

  return useMemo(() => {
    const normalized = normalizeOperatingHours(openTime, closeTime);
    const safeInterval = slotInterval > 0 ? slotInterval : SCHEDULER_CONFIG.SLOT_DURATION;
    const totalSlots = Math.max(1, Math.round((normalized.totalHours * 60) / safeInterval));

    const { slotWidth, availableWidth, gridWidth, timelineWidth } = calculateAdaptiveSlotWidth({
      containerWidth,
      totalSlots,
      courtColumnWidth,
      boundaryPaddingPx,
      zoomLevel,
      minSlotWidth,
      maxSlotWidth,
    });

    return {
      slotWidth,
      gridWidth,
      timelineWidth,
      totalHours: normalized.totalHours,
      totalSlots,
      availableWidth,
      containerWidth,
      openTime: normalized.openTime,
      closeTime: normalized.closeTime,
      boundaryPaddingPx,
    };
  }, [
    openTime,
    closeTime,
    slotInterval,
    containerWidth,
    courtColumnWidth,
    boundaryPaddingPx,
    zoomLevel,
    minSlotWidth,
    maxSlotWidth,
  ]);
}
