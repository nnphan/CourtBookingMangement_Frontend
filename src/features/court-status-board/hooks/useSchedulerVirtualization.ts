import { useVirtualizer } from '@tanstack/react-virtual';
import { type RefObject } from 'react';
import { SCHEDULER_CONFIG } from '../constants/scheduler';

interface UseSchedulerVirtualizationOptions {
  count: number;
  parentRef: RefObject<HTMLDivElement | null>;
  estimateRowHeight?: number;
  overscan?: number;
}

export const useSchedulerVirtualization = ({
  count,
  parentRef,
  estimateRowHeight = SCHEDULER_CONFIG.ROW_HEIGHT,
  overscan = SCHEDULER_CONFIG.OVERSCAN_ROWS,
}: UseSchedulerVirtualizationOptions) => {
  const rowVirtualizer = useVirtualizer({
    count,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateRowHeight,
    overscan,
  });

  return {
    rowVirtualizer,
    virtualRows: rowVirtualizer.getVirtualItems(),
    totalVirtualHeight: rowVirtualizer.getTotalSize(),
  };
};
