import React, { memo } from 'react';
import type { CourtSelection } from '../utils/time-selection.utils';
import { Calendar, Clock, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface CourtSelectionBarProps {
  selection: CourtSelection | null;
  onClear: () => void;
  onConfirm: (selection: CourtSelection) => void;
  date?: string;
}

export const CourtSelectionBar: React.FC<CourtSelectionBarProps> = memo(
  ({ selection, onClear, onConfirm, date }) => {
    if (!selection) return null;

    const isButtonEnabled = Boolean(
      selection.courtId && selection.startTime && selection.endTime,
    );

    return (
      <aside
        aria-label="Thông tin đặt sân"
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-200"
      >
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-slate-900/95 text-white backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700/80 ring-1 ring-black/20">
          {/* Details summary */}
          <div className="flex items-center gap-3">
            

            <div className="flex flex-col text-xs leading-snug">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                Thông tin đặt sân
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-bold text-sm text-white">
                  Sân: {selection.courtName}
                </span>
                <span className="text-[11px] font-semibold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
                  Thời lượng: {selection.durationHours} giờ
                </span>
              </div>

              <div className="flex items-center gap-2 text-slate-300 mt-1 text-[11px]">
                <span>
                  Bắt đầu: <strong className="text-white">{selection.startTime}</strong>
                </span>
                <span>•</span>
                <span>
                  Kết thúc: <strong className="text-white">{selection.endTime}</strong>
                </span>
                {date && (
                  <>
                    <span>•</span>
                    <span className="text-slate-400 flex items-center gap-1">
                      <Calendar className="size-3" />
                      {date}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 self-end sm:self-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClear}
              className="h-9 px-3 rounded-xl border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold cursor-pointer"
            >
              <X className="size-3.5 mr-1" />
              <span>Hủy</span>
            </Button>

            <Button
              type="button"
              size="sm"
              disabled={!isButtonEnabled}
              onClick={() => onConfirm(selection)}
              className="h-9 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-emerald-900/40 cursor-pointer flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <span>Đặt sân</span>
              <ArrowRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </aside>
    );
  },
);

CourtSelectionBar.displayName = 'CourtSelectionBar';
export default CourtSelectionBar;
