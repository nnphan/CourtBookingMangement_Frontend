import React, { memo } from 'react';
import { useSchedulerSelectionStore } from '../store/scheduler-selection.store';
import { SLOT_WIDTH } from '../constants/customer-scheduler.config';
import { cn } from '@/lib/utils';

interface SchedulerCellProps {
  courtId: string;
  courtName: string;
  slotTime: string;
  slotEndTime?: string;
  slotWidth?: number;
  onSlotClick: (courtId: string, slotTime: string) => void;
}

export const SchedulerCell: React.FC<SchedulerCellProps> = memo(
  ({ courtId, courtName, slotTime, slotEndTime, slotWidth = SLOT_WIDTH, onSlotClick }) => {
    // Single source of truth from schedulerSelectionStore
    const selectedCourtId = useSchedulerSelectionStore((s) => s.selectedCourtId);
    const selectedSlots = useSchedulerSelectionStore((s) => s.selectedSlots);

    const isCurrentCourt = selectedCourtId === courtId;
    const isSelected = isCurrentCourt && selectedSlots.includes(slotTime);
    const rangeLabel = slotEndTime ? `${slotTime} - ${slotEndTime}` : slotTime;

    return (
      <div
        role="gridcell"
        tabIndex={0}
        aria-selected={isSelected}
        aria-label={`${courtName} ${rangeLabel} ${isSelected ? 'đang chọn' : 'trống'}`}
        style={{
          width: `${slotWidth}px`,
          minWidth: '80px',
          minHeight: '44px',
        }}
        onClick={() => onSlotClick(courtId, slotTime)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSlotClick(courtId, slotTime);
          }
        }}
        className={cn(
          'group shrink-0 h-full cursor-pointer transition-colors duration-150 select-none relative touch-manipulation',
          isSelected
            ? 'bg-emerald-100/90 border-2 border-emerald-600 text-emerald-950 shadow-inner z-5'
            : 'bg-white border-r border-slate-200/90 hover:bg-emerald-50/70 active:bg-emerald-100/80',
        )}
        title={
          isSelected
            ? `Bấm để bỏ chọn ${courtName} (${rangeLabel})`
            : `Bấm để chọn ${courtName} (${rangeLabel})`
        }
      >
        {/* Subtle Hover Highlight Label */}
        {!isSelected && (
          <div className="absolute inset-0 hidden group-hover:flex items-center justify-center pointer-events-none">
            <span className="text-[10px] font-semibold text-emerald-700/80 bg-emerald-50/90 px-1.5 py-0.5 rounded">
              + {slotTime}
            </span>
          </div>
        )}

        {/* Selected Cell Highlight Indicator */}
        {isSelected && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="size-2 rounded-full bg-emerald-600 ring-2 ring-white shadow-xs" />
          </div>
        )}
      </div>
    );
  },
);

SchedulerCell.displayName = 'SchedulerCell';

