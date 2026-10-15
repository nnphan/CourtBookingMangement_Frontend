import React, { memo } from 'react';
import type { CourtItem } from '../types/court';
import { SCHEDULER_CONFIG } from '../constants/scheduler';
import { CourtStatusCourtNameCell } from '@/features/court-status/shared/components/CourtStatusCourtNameCell';

interface CourtColumnProps {
  courts: CourtItem[];
  virtualRows: { index: number; start: number; size: number }[];
  dateLabel: { dayOfWeek: string; formattedDate: string };
  totalHeight: number;
}

export const CourtColumn: React.FC<CourtColumnProps> = memo(
  ({ courts, virtualRows, dateLabel, totalHeight }) => {
    return (
      <div
        style={{ width: `${SCHEDULER_CONFIG.TOTAL_LEFT_COLUMN_WIDTH}px` }}
        className="sticky left-0 z-20 flex shrink-0 border-r border-[#c8ded2] bg-[#f4faf6] select-none"
      >
        {/* Far Left Date Indicator: e.g. "Thứ 7 15/08" spanning vertical height */}
        <div
          style={{ width: `${SCHEDULER_CONFIG.DATE_COLUMN_WIDTH}px`, height: `${totalHeight}px` }}
          className="sticky top-[42px] flex shrink-0 flex-col items-center justify-center border-r border-[#c8ded2] bg-[#e4f3eb] p-1 text-center text-xs font-semibold text-slate-700"
        >
          <span className="leading-tight">{dateLabel.dayOfWeek}</span>
          <span className="text-[11px] font-medium text-slate-500">{dateLabel.formattedDate}</span>
        </div>

        {/* Court Names column (virtualized items) */}
        <div
          style={{
            width: `${SCHEDULER_CONFIG.COURT_NAME_WIDTH}px`,
            height: `${totalHeight}px`,
            position: 'relative',
          }}
          className="bg-[#f4faf6]"
        >
          {virtualRows.map((virtualRow) => {
            const court = courts[virtualRow.index];
            if (!court) return null;

            return (
              <CourtStatusCourtNameCell
                key={court.id}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                className="border-b border-[#d7e9df] transition-colors hover:bg-[#e4f3eb]"
              >
                <span className="truncate">{court.name}</span>
              </CourtStatusCourtNameCell>
            );
          })}
        </div>
      </div>
    );
  },
);

CourtColumn.displayName = 'CourtColumn';
