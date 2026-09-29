import React, { memo, useCallback } from 'react';
import type { CustomerSlotSelection } from '../types/customer-slot';
import { useSchedulerSelectionStore } from '../store/scheduler-selection.store';
import { Button } from '@/components/ui/button';
import { CalendarCheck } from 'lucide-react';

interface CustomerAvailabilityLayerProps {
  activeSelection?: CustomerSlotSelection | null;
  onClearSelection: () => void;
  onConfirmSelection: () => void;
}

export const CustomerAvailabilityLayer: React.FC<CustomerAvailabilityLayerProps> = memo(
  ({ activeSelection, onClearSelection, onConfirmSelection }) => {
    // Derive selection state directly from schedulerSelectionStore
    const selectedCourtId = useSchedulerSelectionStore((s) => s.selectedCourtId);
    const selectedCourtName = useSchedulerSelectionStore((s) => s.selectedCourtName);
    const selectedSlots = useSchedulerSelectionStore((s) => s.selectedSlots);
    const startTime = useSchedulerSelectionStore((s) => s.startTime);
    const endTime = useSchedulerSelectionStore((s) => s.endTime);
    const durationMinutes = useSchedulerSelectionStore((s) => s.durationMinutes);
    const clearSelectionStore = useSchedulerSelectionStore((s) => s.clearSelection);

    // Resolve unified selection values
    const courtId = selectedCourtId ?? activeSelection?.courtId;
    const courtName = selectedCourtName ?? activeSelection?.courtName ?? (courtId ? `Sân ${courtId}` : '');
    const activeStartTime = startTime ?? activeSelection?.startTime;
    const activeEndTime = endTime ?? activeSelection?.endTime;
    const activeDuration = durationMinutes || (activeSelection?.durationMinutes ?? 0);
    const slotsCount = selectedSlots.length > 0 ? selectedSlots.length : (activeSelection?.selectedSlots.length ?? 0);

    const handleClearSelection = useCallback(() => {
      clearSelectionStore();
      onClearSelection();
    }, [clearSelectionStore, onClearSelection]);

    // Hidden completely when no slots are selected
    if (!courtId || !activeStartTime || !activeEndTime || slotsCount === 0) {
      return null;
    }

    return (
      <div
        role="region"
        aria-label="Thông tin khung giờ đã chọn"
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 text-white px-5 py-3 rounded-full shadow-2xl border border-slate-700 backdrop-blur-md flex items-center gap-4 animate-in slide-in-from-bottom-5 duration-200 select-none max-w-[95vw]"
      >
        {/* Booking Summary display */}
        <div className="flex items-center gap-2.5 sm:gap-3 text-xs flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-1.5 font-bold text-emerald-400">
            <span>🏸</span>
            <span>{courtName}</span>
          </div>

          <span className="text-slate-500 hidden sm:inline">•</span>

          <div className="flex items-center gap-1.5 font-semibold text-white">
            <span>⏰</span>
            <span>
              {activeStartTime} - {activeEndTime}
            </span>
          </div>

          <span className="text-slate-500 hidden sm:inline">•</span>

          <div className="flex items-center gap-1.5 text-slate-300">
            <span>⏱</span>
            <span>{activeDuration} Minutes</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClearSelection}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleClearSelection();
              }
            }}
            aria-label="Clear selected time slots"
            className="text-xs text-rose-300 hover:text-white hover:bg-rose-900/50 h-8 px-2.5 rounded-full cursor-pointer transition-colors"
          >
            ✕ Bấm để hủy chọn
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={onConfirmSelection}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs h-8 px-4 rounded-full shadow-md cursor-pointer transition-all"
          >
            <CalendarCheck className="size-3.5 mr-1.5" />
            Đặt sân ngay
          </Button>
        </div>
      </div>
    );
  },
);

CustomerAvailabilityLayer.displayName = 'CustomerAvailabilityLayer';
