import React, { memo } from 'react';
import { CUSTOMER_COURT_STATUS } from '../types/customer-status';
import { useCustomerCourtStatusStore } from '../store/customer-court-status.store';

export const StatusLegend: React.FC = memo(() => {
  const openPriceModal = useCustomerCourtStatusStore((s) => s.openPriceModal);

  const statuses = [
    CUSTOMER_COURT_STATUS.AVAILABLE,
    CUSTOMER_COURT_STATUS.BOOKED,
    CUSTOMER_COURT_STATUS.LOCKED,
    CUSTOMER_COURT_STATUS.EVENT,
    CUSTOMER_COURT_STATUS.PAST,
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-y-2 px-4 py-2 bg-[#0d6838] border-t border-white/10 text-xs text-white">
      {/* Statuses list */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
        {statuses.map((item) => (
          <div key={item.id} className="flex items-center gap-1.5 select-none" title={item.tooltip}>
            {item.id === 'EVENT' ? (
              <div
                className="grid size-3.5 place-items-center rounded-xs text-[10px] font-bold shadow-xs border border-purple-300"
                style={{ backgroundColor: item.color, color: item.textColor }}
              >
                !
              </div>
            ) : item.id === 'PAST' ? (
              <span
                className="size-3.5 rounded-xs shadow-xs shrink-0 scheduler-cell--past border border-slate-300"
              />
            ) : (
              <span
                className="size-3.5 rounded-xs shadow-xs shrink-0"
                style={{
                  backgroundColor: item.color,
                  border: item.id === 'AVAILABLE' ? '1px solid #CBD5E1' : '1px solid rgba(255,255,255,0.2)',
                }}
              />
            )}
            <span className="font-medium text-white/95">{item.name}</span>
          </div>
        ))}
      </div>

      {/* Action: Xem sân & bảng giá */}
      <button
        type="button"
        onClick={openPriceModal}
        className="font-semibold text-amber-300 hover:text-amber-200 transition-colors underline underline-offset-4 cursor-pointer text-xs"
      >
        Xem sân &amp; bảng giá
      </button>
    </div>
  );
});

StatusLegend.displayName = 'StatusLegend';
