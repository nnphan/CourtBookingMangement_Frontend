import React, { memo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import type { CustomerCourt } from '../types/customer-court';
import { ChevronDown, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileCourtSelectProps {
  courts: CustomerCourt[];
  activeCourtId: string;
  onCourtChange: (courtId: string) => void;
  className?: string;
}

export const MobileCourtSelect: React.FC<MobileCourtSelectProps> = memo(
  ({ courts, activeCourtId, onCourtChange, className }) => {
    const selectedCourt = courts.find((c) => c.courtId === activeCourtId) || courts[0];

    if (!courts || courts.length === 0) {
      return null;
    }

    return (
      <Select value={activeCourtId} onValueChange={onCourtChange}>
        <SelectTrigger
          hideChevron
          aria-label="Chọn sân thi đấu"
          className={cn(
            'h-9 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs shadow-2xs transition-all flex items-center justify-between gap-2 group cursor-pointer focus:ring-2 focus:ring-emerald-500',
            className,
          )}
        >
          <div className="flex items-center gap-2 truncate">
            <span className="size-2.5 rounded-full bg-emerald-500 shrink-0" />
            <span className="truncate">{selectedCourt?.courtName || 'Chọn sân'}</span>
          </div>
          <ChevronDown className="size-4 text-slate-400 shrink-0 transition-transform duration-200 ease-out group-data-[state=open]:rotate-180" />
        </SelectTrigger>

        <SelectContent
          align="start"
          sideOffset={6}
          className="w-[240px] p-1.5 rounded-xl border border-slate-200 bg-white shadow-xl backdrop-blur-md"
        >
          <div className="px-2.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
            Danh sách sân đấu ({courts.length} sân)
          </div>

          <div className="space-y-0.5">
            {courts.map((court) => {
              const isSelected = court.courtId === activeCourtId;
              return (
                <SelectItem
                  key={court.courtId}
                  value={court.courtId}
                  className={cn(
                    'py-2 px-2.5 rounded-lg text-xs font-semibold cursor-pointer',
                    isSelected ? 'bg-emerald-50 text-emerald-950' : 'hover:bg-slate-50 text-slate-800',
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'size-2 rounded-full',
                        isSelected ? 'bg-emerald-600' : 'bg-slate-300',
                      )}
                    />
                    <span>{court.courtName}</span>
                  </div>
                </SelectItem>
              );
            })}
          </div>
        </SelectContent>
      </Select>
    );
  },
);

MobileCourtSelect.displayName = 'MobileCourtSelect';
