import React, { memo } from 'react';
import type { CustomerCourt } from '../types/customer-court';
import type { CustomerSlotItem, CustomerSlotSelection } from '../types/customer-slot';
import { CustomerCourtStatusService } from '../services/customer-court-status.service';
import type { CustomerGeneratedTimeSlot } from '../services/customer-court-status.service';
import {
  BOUNDARY_PADDING_PX,
  COURT_COLUMN_WIDTH,
  CUSTOMER_SCHEDULER_CONFIG,
  SCHEDULER_CONFIG,
  SLOT_WIDTH,
} from '../constants/customer-scheduler.config';
import { CUSTOMER_COURT_STATUS } from '../types/customer-status';
import { AvailableSlotTooltip } from './AvailableSlotTooltip';
import { SchedulerCell } from './SchedulerCell';
import { X } from 'lucide-react';

interface CustomerCourtRowProps {
  court: CustomerCourt;
  slots: CustomerSlotItem[];
  timeSlots: CustomerGeneratedTimeSlot[];
  slotWidth?: number;
  timelineWidth?: number;
  openTime?: string;
  slotInterval: number;
  activeSelection: CustomerSlotSelection | null;
  currentTimeOffsetPx?: number | null;
  onSlotClick: (courtId: string, slotTime: string) => void;
  onClearSelection: () => void;
  isSlotSelected: (courtId: string, slotTime: string) => boolean;
}

export const CustomerCourtRow: React.FC<CustomerCourtRowProps> = memo(
  ({
    court,
    slots,
    timeSlots,
    slotWidth = SLOT_WIDTH,
    timelineWidth,
    openTime = SCHEDULER_CONFIG.START_TIME,
    slotInterval,
    activeSelection,
    currentTimeOffsetPx = null,
    onSlotClick,
    onClearSelection,
  }) => {
    const totalGridWidth = Math.round(timeSlots.length * slotWidth);
    const effectiveTimelineWidth = timelineWidth ?? totalGridWidth + BOUNDARY_PADDING_PX;

    // Filter slots belonging to this court that are NOT available
    const courtOccupiedSlots = slots.filter(
      (s) => s.courtId === court.courtId && s.status !== 'AVAILABLE',
    );

    // Check if this court has active selection
    const isCurrentCourtSelected = activeSelection?.courtId === court.courtId;

    // Selection dimensions
    const selectionDim =
      isCurrentCourtSelected && activeSelection
        ? CustomerCourtStatusService.calculateBookingWidth(
            activeSelection.startTime,
            activeSelection.endTime,
            slotWidth,
            slotInterval,
            openTime,
          )
        : null;

    return (
      <div
        role="row"
        style={{
          height: `${CUSTOMER_SCHEDULER_CONFIG.ROW_HEIGHT}px`,
          minHeight: '44px',
        }}
        className="flex border-b border-slate-200 hover:bg-slate-50/40 transition-colors relative"
      >
        {/* Sticky Court Column on left */}
        <div
          role="rowheader"
          style={{ width: `${COURT_COLUMN_WIDTH}px` }}
          className="sticky left-0 z-20 shrink-0 bg-[#ebf7f0] border-r border-[#c8ded2] font-semibold text-xs sm:text-sm text-slate-800 flex items-center gap-2 px-3 select-none shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)]"
        >
          <span className="size-2 rounded-full bg-emerald-600 shrink-0" />
          <span className="truncate">{court.courtName}</span>
        </div>

        {/* Schedule Grid Track */}
        <div
          className="relative flex shrink-0"
          style={{ width: `${effectiveTimelineWidth}px` }}
        >
          {/* Base Grid cells for click targets deriving from single source of truth */}
          {timeSlots.map((slot) => (
            <SchedulerCell
              key={slot.time}
              courtId={court.courtId}
              courtName={court.courtName}
              slotTime={slot.time}
              slotEndTime={slot.endTime}
              slotWidth={slotWidth}
              onSlotClick={onSlotClick}
            />
          ))}

          {/* Occupied blocks layer (BOOKED, LOCKED, EVENT) */}
          {courtOccupiedSlots.map((slot, index) => {
            const dim = CustomerCourtStatusService.calculateBookingWidth(
              slot.startTime,
              slot.endTime,
              slotWidth,
              slotInterval,
              openTime,
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
                    minWidth: `${Math.round(dim.cellsSpanned * slotWidth)}px`,
                    backgroundColor: statusConfig.color,
                  }}
                  className="absolute top-[2px] bottom-[2px] rounded-xs shadow-xs flex items-center justify-center px-2 cursor-not-allowed select-none z-10 transition-opacity hover:opacity-95 overflow-hidden"
                >
                  <span className="text-white text-[11px] font-semibold tracking-tight truncate drop-shadow-2xs">
                    {slot.status === 'EVENT'
                      ? `Sự kiện (${slot.startTime} - ${slot.endTime})`
                      : `${slot.startTime} - ${slot.endTime}`}
                  </span>
                </div>
              </AvailableSlotTooltip>
            );
          })}

          {/* Active Selection Overlay Box */}
          {selectionDim && activeSelection && (
            <div
              style={{
                left: `${selectionDim.left}px`,
                width: `${selectionDim.width}px`,
                minWidth: `${Math.round(selectionDim.cellsSpanned * slotWidth)}px`,
              }}
              className="absolute top-[2px] bottom-[2px] rounded-xs bg-[#D1FAE5] border-2 border-[#059669] shadow-sm z-15 flex items-center justify-between px-2 pointer-events-none transition-all duration-150 animate-in fade-in zoom-in-95"
            >
              <span className="text-[11px] font-bold text-emerald-950 px-1.5 py-0.5 bg-white/85 rounded-xs shadow-2xs truncate">
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
                className="pointer-events-auto p-1 rounded-full text-emerald-800 hover:text-emerald-950 hover:bg-emerald-200/80 transition-colors cursor-pointer"
                title="✕ Bấm để hủy chọn"
              >
                <X className="size-3.5" />
              </button>
            </div>
          )}

          {/* Current Time Indicator Vertical Red Line */}
          {currentTimeOffsetPx !== null && (
            <div
              style={{
                position: 'absolute',
                left: `${currentTimeOffsetPx}px`,
              }}
              className="top-0 bottom-0 w-[2px] -translate-x-1/2 bg-rose-500/90 pointer-events-none z-25 shadow-[0_0_4px_rgba(244,63,94,0.5)]"
            />
          )}
        </div>
      </div>
    );
  },
);

CustomerCourtRow.displayName = 'CustomerCourtRow';

