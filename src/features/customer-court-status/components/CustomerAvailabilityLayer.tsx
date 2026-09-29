import React, { memo } from 'react';
import type { CustomerSlotSelection } from '../types/customer-slot';
import { Button } from '@/components/ui/button';
import { CalendarCheck, X } from 'lucide-react';

interface CustomerAvailabilityLayerProps {
  activeSelection: CustomerSlotSelection | null;
  onClearSelection: () => void;
  onConfirmSelection: () => void;
}

export const CustomerAvailabilityLayer: React.FC<CustomerAvailabilityLayerProps> = memo(
  ({ activeSelection, onClearSelection, onConfirmSelection }) => {
    if (!activeSelection) return null;

    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 text-white px-5 py-3 rounded-full shadow-2xl border border-slate-700 backdrop-blur-md flex items-center gap-4 animate-in slide-in-from-bottom-5 duration-200">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
          <div className="text-xs">
            <span className="font-semibold text-emerald-400">
              {activeSelection.courtName}:
            </span>{' '}
            <span className="font-bold">
              {activeSelection.startTime} - {activeSelection.endTime}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={onClearSelection}
            className="text-xs text-slate-300 hover:text-white hover:bg-slate-800 h-8 px-2.5 rounded-full"
          >
            <X className="size-3.5 mr-1" />
            Bỏ chọn
          </Button>

          <Button
            size="sm"
            onClick={onConfirmSelection}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs h-8 px-4 rounded-full shadow-md"
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
