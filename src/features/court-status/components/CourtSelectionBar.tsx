import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Calendar, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SelectedBookingCourt } from '@/features/bookings/types/booking.types';
import type { CourtSelection } from '../utils/time-selection.utils';

export interface CourtSelectionBarProps {
  selection: CourtSelection | null;
  courts?: SelectedBookingCourt[];
  notice?: string | null;
  onClear: () => void;
  onConfirm: (selection: CourtSelection) => void;
  date?: string;
}

export const CourtSelectionBar: React.FC<CourtSelectionBarProps> = memo(
  ({ selection, courts, notice, onClear, onConfirm, date }) => {
    const { t } = useTranslation();
    if (!selection) return null;
    const selectedCourts = courts?.length
      ? courts
      : [{ courtId: selection.courtId, courtName: selection.courtName }];
    const visibleCourts = selectedCourts.slice(0, 3);
    const overflow = selectedCourts.length - visibleCourts.length;

    return (
      <aside
        aria-label={t('booking.multiCourt.title')}
        className="fixed bottom-6 left-1/2 z-50 w-[95%] max-w-xl -translate-x-1/2"
      >
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-700 bg-slate-900/95 p-4 text-white shadow-2xl sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs">
            <p className="font-bold" aria-live="polite">
              {t('booking.multiCourt.selectedCount', { count: selectedCourts.length })}
            </p>
            <div className="mt-1 flex flex-wrap gap-1">
              {visibleCourts.map((court) => (
                <span key={court.courtId} className="rounded-full border border-emerald-700 px-2 py-0.5">
                  {court.courtName}
                </span>
              ))}
              {overflow > 0 && <span className="rounded-full border border-slate-600 px-2 py-0.5">+{overflow}</span>}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-slate-300">
              {date && <span><Calendar className="mr-1 inline size-3" aria-hidden />{date}</span>}
              <span><Clock className="mr-1 inline size-3" aria-hidden />{selection.startTime}-{selection.endTime}</span>
            </div>
            {notice && <p role="alert" className="mt-1 font-semibold text-amber-300">{notice}</p>}
          </div>
          <div className="flex gap-2 self-end sm:self-center">
            <Button type="button" variant="outline" size="sm" onClick={onClear}>
              <X className="mr-1 size-3.5" aria-hidden />
              {t('booking.multiCourt.clearSelection')}
            </Button>
            <Button type="button" size="sm" onClick={() => onConfirm(selection)}>
              {t('booking.multiCourt.continue')}
              <ArrowRight className="ml-1 size-3.5" aria-hidden />
            </Button>
          </div>
        </div>
      </aside>
    );
  },
);

CourtSelectionBar.displayName = 'CourtSelectionBar';
export default CourtSelectionBar;
