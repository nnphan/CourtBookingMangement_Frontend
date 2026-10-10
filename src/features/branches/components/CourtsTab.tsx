import React from 'react';
import { useTranslation } from 'react-i18next';
import { Grid3X3, Plus } from 'lucide-react';
import type { BranchCourtDto } from '../types/branch-detail.types';
import { Button } from '@/components/ui/button';

export interface CourtsTabProps {
  courts?: BranchCourtDto[] | null;
  onAddCourt?: () => void;
  canEdit?: boolean;
}

export const CourtsTab: React.FC<CourtsTabProps> = ({
  courts = [],
  onAddCourt,
  canEdit = true,
}) => {
  const { t } = useTranslation('branch');
  const courtList = courts ?? [];

  return (
    <div className="space-y-4 outline-none">
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 p-4 sm:p-5">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
              <Grid3X3 className="size-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {t('details.courts.title', 'Danh sách sân')} ({courtList.length})
              </h3>
              <p className="text-xs text-slate-500">
                {t('details.courts.description', 'Quản lý các sân thi đấu thuộc chi nhánh')}
              </p>
            </div>
          </div>

          {canEdit && onAddCourt && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={onAddCourt}
              className="rounded-xl text-xs font-bold"
            >
              <Plus className="mr-1 size-3.5" />
              {t('actions.addCourt', 'Thêm sân')}
            </Button>
          )}
        </div>

        {courtList.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <p className="text-sm text-slate-500 italic">
              {t('details.courts.empty', 'Chưa có sân nào.')}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold tracking-wider text-slate-500 uppercase">
                <tr>
                  <th className="px-5 py-3">STT</th>
                  <th className="px-5 py-3">{t('details.courts.name', 'Tên sân')}</th>
                  <th className="px-5 py-3">{t('details.courts.status', 'Trạng thái')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {courtList.map((court, idx) => (
                  <tr key={court.courtNumber ?? idx} className="transition-colors hover:bg-slate-50/70">
                    <td className="px-5 py-3.5 font-mono text-xs font-semibold text-slate-500">
                      {court.courtNumber ? `#${String(court.courtNumber).padStart(2, '0')}` : `#${String(idx + 1).padStart(2, '0')}`}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-900">
                      {court.name || `Sân ${String(idx + 1).padStart(2, '0')}`}
                    </td>
                    <td className="px-5 py-3.5">
                      {court.isActive ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap bg-emerald-50 text-emerald-700 border-emerald-200">
                          <span aria-hidden className="size-1.5 rounded-full bg-emerald-500" />
                          {t('status.active', 'Hoạt động')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap bg-red-50 text-red-700 border-red-200">
                          <span aria-hidden className="size-1.5 rounded-full bg-red-500" />
                          {t('status.inactive', 'Ngưng hoạt động')}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
