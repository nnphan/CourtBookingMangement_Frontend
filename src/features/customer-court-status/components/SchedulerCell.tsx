import React, { memo } from 'react';
import { useSchedulerSelectionStore } from '../store/scheduler-selection.store';
import { cn } from '@/lib/utils';

interface SchedulerCellProps {
  courtId: string;
  courtName: string;
  slotTime: string;
  slotWidth: number;
  onSlotClick: (courtId: string, slotTime: string) => void;
}

export const SchedulerCell: React.FC<SchedulerCellProps> = memo(
  ({ courtId, courtName, slotTime, slotWidth, onSlotClick }) => {
    // Single source of truth from schedulerSelectionStore
    const selectedCourtId = useSchedulerSelectionStore((s) => s.selectedCourtId);
    const selectedSlots = useSchedulerSelectionStore((s) => s.selectedSlots);

    const isCurrentCourt = selectedCourtId === courtId;
    const isSelected = isCurrentCourt && selectedSlots.includes(slotTime);

    return (
      <div
        role="gridcell"
        tabIndex={0}
        aria-selected={isSelected}
        aria-label={`${courtName} ${slotTime} ${isSelected ? 'đang chọn' : 'trống'}`}
        style={{ width: slotWidth }}
        onClick={() => onSlotClick(courtId, slotTime)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSlotClick(courtId, slotTime);
          }
        }}
        className={cn(
          'shrink-0 h-full cursor-pointer transition-colors select-none relative',
          isSelected
            ? 'bg-blue-100 border-2 border-blue-500 text-blue-900 shadow-2xs z-5'
            : 'bg-white border-r border-slate-200 hover:bg-slate-50',
        )}
        title={
          isSelected
            ? `Bấm để bỏ chọn ${courtName} lúc ${slotTime}`
            : `Bấm để chọn ${courtName} lúc ${slotTime}`
        }
      >
        {isSelected && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="size-1.5 rounded-full bg-blue-600 ring-2 ring-blue-200 shadow-xs" />
          </div>
        )}
      </div>
    );
  },
);

SchedulerCell.displayName = 'SchedulerCell';
