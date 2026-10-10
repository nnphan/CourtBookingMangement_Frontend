import React from 'react';
import { useTranslation } from 'react-i18next';
import { DollarSign } from 'lucide-react';
import type { BranchPricingDto } from '../types/branch-detail.types';
import {
  formatBranchPrice,
  formatTimeRange,
  mapPricingTypeLabel,
} from '../utils/branch-detail.mapper';

export interface PricingTabProps {
  branchPricings?: BranchPricingDto[] | null;
  onEdit?: () => void;
  canEdit?: boolean;
}

export const PricingTab: React.FC<PricingTabProps> = ({
  branchPricings = [],
}) => {
  const { t } = useTranslation('branch');
  const pricings = branchPricings ?? [];

  return (
    <div className="space-y-4 outline-none">
      <div className="space-y-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs sm:p-6">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="size-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
            <DollarSign className="size-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {t('details.pricing.title', 'Bảng giá thuê sân')}
            </h3>
            <p className="text-xs text-slate-500">
              {t('details.pricing.description', 'Bảng giá áp dụng theo khung giờ và các ngày trong tuần')}
            </p>
          </div>
        </div>

        {pricings.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <p className="text-sm text-slate-500 italic">
              {t('details.pricing.empty', 'Chưa có bảng giá.')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {pricings.map((tier, idx) => {
              const label = mapPricingTypeLabel(tier.pricingType);
              const timeRange = formatTimeRange(tier.startTime, tier.endTime);
              const formattedPrice = formatBranchPrice(tier.pricePerHour);

              return (
                <div
                  key={idx}
                  className="space-y-3 rounded-2xl border border-slate-200/80 bg-linear-to-b from-slate-50/80 to-white p-5 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900">{label}</h4>
                    <span className="size-2 rounded-full bg-emerald-500" />
                  </div>

                  <p className="text-xs font-mono text-slate-500">{timeRange}</p>

                  <div className="border-t border-slate-100 pt-2">
                    <span className="font-mono text-2xl font-black text-emerald-700">
                      {formattedPrice}
                    </span>
                    <span className="ml-1 text-xs font-semibold text-slate-500">
                      / giờ
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
