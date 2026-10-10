import React from 'react';
import { useTranslation } from 'react-i18next';
import { Clock } from 'lucide-react';
import type { BranchOperatingHourDto } from '../types/branch-detail.types';
import { formatTimeSpan } from '../utils/branch-detail.mapper';

export interface OperatingHoursTabProps {
  operatingHours?: BranchOperatingHourDto[] | null;
}

export const OperatingHoursTab: React.FC<OperatingHoursTabProps> = ({
  operatingHours = [],
}) => {
  const { t } = useTranslation('branch');
  const hours = operatingHours ?? [];

  return (
    <div className="space-y-4 outline-none">
      <div className="space-y-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs sm:p-6">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="size-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
            <Clock className="size-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {t('details.hours.title', 'Giờ hoạt động')}
            </h3>
            <p className="text-xs text-slate-500">
              {t('details.hours.description', 'Khung giờ mở cửa và đóng cửa của chi nhánh')}
            </p>
          </div>
        </div>

        {hours.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <p className="text-sm text-slate-500 italic">
              {t('details.hours.empty', 'Chưa có thông tin giờ hoạt động.')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {hours.map((item, idx) => {
                const openFormatted = formatTimeSpan(item.openTime);
                const closeFormatted = formatTimeSpan(item.closeTime);

                return (
                  <div
                    key={idx}
                    className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                        Khung giờ {idx + 1}
                      </span>
                      {item.isClosed ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200">
                          Đóng cửa
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Mở cửa
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="font-mono text-2xl font-bold text-slate-900">
                        {openFormatted || '00:00'} - {closeFormatted || '24:00'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-slate-500 pt-1">
              {t('details.hours.everyDay', 'Áp dụng cho tất cả các ngày trong tuần.')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
