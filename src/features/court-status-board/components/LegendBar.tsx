import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { COURT_BOOKING_STATUSES } from '../constants/booking-status';
import { Info, AlertCircle, DollarSign } from 'lucide-react';

export const LegendBar: React.FC = memo(() => {
  const { t } = useTranslation();

  return (
    <div
      role="region"
      aria-label={t('courtStatus.legend.label', 'Bảng chú thích trạng thái')}
      className="flex flex-wrap items-center justify-start gap-x-4 gap-y-2 py-2 px-3 text-xs text-white"
    >
      {COURT_BOOKING_STATUSES.map((status) => {
        const isCircleIcon = status.id === 'service_unpaid' || status.id === 'ticket_unpaid';

        return (
          <div
            key={status.id}
            className="flex items-center gap-1.5 transition-opacity hover:opacity-90 cursor-default select-none"
            title={status.description}
          >
            {isCircleIcon ? (
              <div
                className="grid size-4 place-items-center rounded-full text-[10px] font-bold shadow-xs"
                style={{ backgroundColor: status.color, color: status.textColor }}
              >
                {status.id === 'service_unpaid' ? (
                  <AlertCircle className="size-3 stroke-[2.5]" />
                ) : (
                  <DollarSign className="size-3 stroke-[3]" />
                )}
              </div>
            ) : status.id === 'event' ? (
              <div
                className="grid size-3.5 place-items-center rounded-xs text-[10px] font-bold shadow-xs"
                style={{ backgroundColor: status.color, color: status.textColor }}
              >
                <Info className="size-2.5 stroke-[2.5]" />
              </div>
            ) : (
              <span
                className="size-3.5 rounded-xs border border-white/20 shadow-xs shrink-0"
                style={{ backgroundColor: status.color }}
              />
            )}
            <span className="font-medium tracking-tight text-white/95">
              {t(`courtStatus.statuses.${status.id}`, status.name)}
            </span>
          </div>
        );
      })}
    </div>
  );
});

LegendBar.displayName = 'LegendBar';
