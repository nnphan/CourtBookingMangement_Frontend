import React, { memo } from 'react';
import { cn } from '@/lib/utils';
import { Check, Lock } from 'lucide-react';
import { useCourtSelectionStore } from '../store/court-selection.store';

export interface TimeSlotCellProps {
  courtId: string;
  courtName: string;
  slotTime: string;
  hourWidth: number;
  isPast: boolean;
  isBooked: boolean;
  isBranchClosed?: boolean;
  disabledTitle?: string;
  onMouseDown?: (e: React.MouseEvent) => void;
  onMouseEnter?: () => void;
  onMouseUp?: () => void;
  onTouchStart?: (e: React.TouchEvent) => void;
  onTouchEnd?: () => void;
  onClick?: () => void;
}

export const TimeSlotCell: React.FC<TimeSlotCellProps> = memo(
  ({
    courtId,
    courtName,
    slotTime,
    hourWidth,
    isPast,
    isBooked,
    isBranchClosed = false,
    disabledTitle,
    onMouseDown,
    onMouseEnter,
    onMouseUp,
    onTouchStart,
    onTouchEnd,
    onClick,
  }) => {
    const selectionSegment = useCourtSelectionStore((state) => {
      if (state.selectedCourtId !== courtId || !state.selectedSlots.includes(slotTime)) {
        return null;
      }
      const isStart = state.selectedSlots[0] === slotTime;
      const isEnd = state.selectedSlots[state.selectedSlots.length - 1] === slotTime;
      if (isStart && isEnd) return 'single';
      if (isStart) return 'start';
      if (isEnd) return 'end';
      return 'middle';
    });
    const isSelected = selectionSegment !== null;
    const isStartCell = selectionSegment === 'start' || selectionSegment === 'single';
    const isEndCell = selectionSegment === 'end' || selectionSegment === 'single';
    const isMiddleCell = selectionSegment === 'middle';
    const isHovered = useCourtSelectionStore(
      (state) =>
        state.selectedCourtId === courtId &&
        state.hoverSlot === slotTime &&
        !state.selectedSlots.includes(slotTime) &&
        !isBooked &&
        !isPast,
    );

    // Priority 1: BOOKED
    if (isBooked) {
      return (
        <div
          role="gridcell"
          aria-disabled="true"
          data-court-id={courtId}
          data-slot-hour={slotTime}
          style={{ width: `${hourWidth}px` }}
          className="pointer-events-none relative h-full shrink-0 cursor-not-allowed border-r border-slate-100/80 bg-slate-50/20 select-none"
        />
      );
    }

    // Priority 2: DISABLED (Past time slot)
    if (isPast || isBranchClosed) {
      return (
        <div
          role="gridcell"
          aria-disabled="true"
          title={disabledTitle ?? `Khung giờ ${slotTime} đã qua`}
          data-court-id={courtId}
          data-slot-hour={slotTime}
          style={{ width: `${hourWidth}px` }}
          className={cn(
            'group/cell pointer-events-none relative h-full shrink-0 cursor-not-allowed border-r border-slate-200/60 opacity-50 select-none',
            'bg-[repeating-linear-gradient(45deg,#f8fafc,#f8fafc_6px,#e2e8f0_6px,#e2e8f0_10px)]',
          )}
        >
          <div className="absolute inset-0 flex items-center justify-center opacity-40">
            <Lock className="size-3 text-slate-400" />
          </div>
        </div>
      );
    }

    // Priority 3: SELECTED
    if (isSelected) {
      return (
        <div
          role="gridcell"
          aria-selected="true"
          data-court-id={courtId}
          data-slot-hour={slotTime}
          style={{ width: `${hourWidth}px` }}
          onMouseDown={onMouseDown}
          onMouseEnter={onMouseEnter}
          onMouseUp={onMouseUp}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onClick={onClick}
          className={cn(
            'group/cell relative z-10 flex h-full shrink-0 cursor-pointer items-center justify-center text-white transition-all select-none',
            // Middle cell styling: bg-primary/80
            isMiddleCell && 'border-r border-emerald-500/60 bg-emerald-600/85 font-semibold',
            // Start cell styling: bg-primary rounded-l-md
            isStartCell &&
              'rounded-l-md border-r border-emerald-500 bg-emerald-600 font-bold shadow-xs',
            // End cell styling: bg-primary rounded-r-md
            isEndCell &&
              'rounded-r-md border-r border-emerald-500 bg-emerald-600 font-bold shadow-xs',
            // Single slot selected (both start and end)
            isStartCell && isEndCell && 'rounded-md',
          )}
          title={`Đã chọn ${courtName}: ${slotTime}`}
        >
          <div className="flex items-center gap-1 text-[11px] font-bold tracking-tight text-white drop-shadow-xs">
            <span>{slotTime}</span>
            <Check className="size-3.5 stroke-[3]" />
          </div>
        </div>
      );
    }

    // Priority 4: HOVER while dragging
    if (isHovered) {
      return (
        <div
          role="gridcell"
          data-court-id={courtId}
          data-slot-hour={slotTime}
          style={{ width: `${hourWidth}px` }}
          onMouseDown={onMouseDown}
          onMouseEnter={onMouseEnter}
          onMouseUp={onMouseUp}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onClick={onClick}
          className="group/cell relative flex h-full shrink-0 cursor-pointer items-center justify-center border-r border-emerald-400/80 bg-emerald-500/20 text-emerald-800 transition-colors select-none"
        >
          <span className="rounded bg-white/80 px-1 py-0.5 text-[11px] font-semibold text-emerald-800 shadow-2xs">
            {slotTime}
          </span>
        </div>
      );
    }

    // Priority 5: AVAILABLE
    return (
      <div
        role="gridcell"
        data-court-id={courtId}
        data-slot-hour={slotTime}
        style={{ width: `${hourWidth}px` }}
        onMouseDown={onMouseDown}
        onMouseEnter={onMouseEnter}
        onMouseUp={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onClick={onClick}
        className={cn(
          'group/cell relative h-full shrink-0 cursor-pointer border-r border-slate-100/90 transition-colors select-none',
          'bg-white hover:bg-emerald-500/20 hover:text-emerald-800 active:bg-emerald-500/30',
        )}
        title={`Bấm hoặc kéo để chọn ${courtName} lúc ${slotTime}`}
      >
        <div className="pointer-events-none absolute inset-0 hidden items-center justify-center group-hover/cell:flex">
          <span className="rounded border border-emerald-200 bg-white/95 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 shadow-xs">
            + {slotTime}
          </span>
        </div>
      </div>
    );
  },
);

TimeSlotCell.displayName = 'TimeSlotCell';
export default TimeSlotCell;
