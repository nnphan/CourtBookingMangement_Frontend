import React, { memo } from 'react';
import type { CustomerCourt } from '../types/customer-court';
import type { CustomerSlotItem, CustomerSlotSelection } from '../types/customer-slot';
import { CustomerCourtStatusService } from '../services/customer-court-status.service';
import type { CustomerGeneratedTimeSlot } from '../services/customer-court-status.service';
import { CUSTOMER_SCHEDULER_CONFIG } from '../constants/customer-scheduler.config';
import { CUSTOMER_COURT_STATUS } from '../types/customer-status';
import { AvailableSlotTooltip } from './AvailableSlotTooltip';
import { SchedulerCell } from './SchedulerCell';
import { X } from 'lucide-react';

interface CustomerCourtRowProps {
  court: CustomerCourt;
  slots: CustomerSlotItem[];
  timeSlots: CustomerGeneratedTimeSlot[];
  slotWidth: number;
  slotInterval: number;
  activeSelection: CustomerSlotSelection | null;
  onSlotClick: (courtId: string, slotTime: string) => void;
  onClearSelection: () => void;
  isSlotSelected: (courtId: string, slotTime: string) => boolean;
}

export const CustomerCourtRow: React.FC<CustomerCourtRowProps> = memo(
  ({
    court,
    slots,
    timeSlots,
    slotWidth,
    slotInterval,
    activeSelection,
    onSlotClick,
    onClearSelection,
  }) => {
    // Filter slots belonging to this court that are NOT available
    const courtOccupiedSlots = slots.filter(
      (s) => s.courtId === court.courtId && s.status !== 'AVAILABLE',
    );

    // Check if this court has active selection
    const isCurrentCourtSelected = activeSelection?.courtId === court.courtId;

    // Selection dimensions
    const selectionDim = isCurrentCourtSelected && activeSelection
      ? CustomerCourtStatusService.calculateSlotDimensions(
          activeSelection.startTime,
          activeSelection.endTime,
          slotWidth,
          slotInterval,
        )
      : null;

    return (
      <div
        style={{ height: CUSTOMER_SCHEDULER_CONFIG.ROW_HEIGHT }}
        className="flex border-b border-slate-200 hover:bg-slate-50/50 transition-colors relative"
      >
        {/* Sticky Court Column on left */}
        <div
          style={{ width: CUSTOMER_SCHEDULER_CONFIG.COURT_COL_WIDTH }}
          className="sticky left-0 z-20 shrink-0 bg-[#ebf7f0] border-r border-slate-300 font-semibold text-xs text-slate-800 flex items-center justify-center select-none"
        >
          {court.courtName}
        </div>

        {/* Schedule Grid Track */}
        <div
          className="relative flex shrink-0"
          style={{ width: timeSlots.length * slotWidth }}
        >
          {/* Base Grid cells for click targets deriving from single source of truth */}
          {timeSlots.map((slot) => (
            <SchedulerCell
              key={slot.time}
              courtId={court.courtId}
              courtName={court.courtName}
              slotTime={slot.time}
              slotWidth={slotWidth}
              onSlotClick={onSlotClick}
            />
          ))}

          {/* Occupied blocks layer (BOOKED, LOCKED, EVENT) */}
          {courtOccupiedSlots.map((slot, index) => {
            const dim = CustomerCourtStatusService.calculateSlotDimensions(
              slot.startTime,
              slot.endTime,
              slotWidth,
              slotInterval,
            );
            const statusConfig = CUSTOMER_COURT_STATUS[slot.status];

            return (
              <AvailableSlotTooltip
                key={`${slot.courtId}-${slot.startTime}-${index}`}
                status={slot.status}
                courtName={court.courtName}
                timeRange={`${slot.startTime} - ${slot.endTime}`}
              >
                <div
                  style={{
                    left: `${dim.left}px`,
                    width: `${dim.width}px`,
                    backgroundColor: statusConfig.color,
                  }}
                  className="absolute top-[2px] bottom-[2px] rounded-xs shadow-xs flex items-center justify-center cursor-not-allowed select-none z-10 transition-opacity hover:opacity-90"
                >
                  {slot.status === 'EVENT' && (
                    <span className="text-white text-xs font-bold">!</span>
                  )}
                </div>
              </AvailableSlotTooltip>
            );
          })}

          {/* Active Selection Overlay Box (Mint green highlight as seen in screenshot) */}
          {selectionDim && activeSelection && (
            <div
              style={{
                left: `${selectionDim.left}px`,
                width: `${selectionDim.width}px`,
              }}
              className="absolute top-[2px] bottom-[2px] rounded-xs bg-[#D1FAE5] border-2 border-[#059669] shadow-sm z-15 flex items-center justify-between px-1.5 pointer-events-none transition-all duration-150 animate-in fade-in zoom-in-95"
            >
              <span className="text-[10px] font-bold text-emerald-900 px-1 bg-white/70 rounded-xs shadow-2xs truncate">
                {activeSelection.startTime} - {activeSelection.endTime}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClearSelection();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.stopPropagation();
                    e.preventDefault();
                    onClearSelection();
                  }
                }}
                aria-label="Clear selected time slots"
                className="pointer-events-auto p-0.5 rounded-full text-emerald-800 hover:text-emerald-950 hover:bg-emerald-200/80 transition-colors cursor-pointer"
                title="✕ Bấm để hủy chọn"
              >
                <X className="size-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  },
);

CustomerCourtRow.displayName = 'CustomerCourtRow';
