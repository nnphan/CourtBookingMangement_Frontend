import React from 'react';
import { useTranslation } from 'react-i18next';
import { Maximize2, Edit2 } from 'lucide-react';
import type { BranchDetailDto } from '../types/branch-detail.types';
import { normalizeBranchImages } from '../utils/branch-detail.mapper';
import { Button } from '@/components/ui/button';
import { useLocaleFormatters } from '@/hooks/useLocaleFormatters';

export interface BranchSummaryCardProps {
  branch: BranchDetailDto;
  onEdit?: () => void;
  onZoomImage?: (url: string) => void;
}

export const BranchSummaryCard: React.FC<BranchSummaryCardProps> = ({
  branch,
  onEdit,
  onZoomImage,
}) => {
  const { t } = useTranslation('branch');
  const { formatNumber } = useLocaleFormatters();

  const courtsCount = branch.courts?.length ?? 0;
  const normalizedImages = normalizeBranchImages(branch.images);
  const coverImage = normalizedImages[0]?.imageUrl;

  return (
    <div className="space-y-4">
      <div className="space-y-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
        <h3 className="border-b border-slate-100 pb-2.5 text-sm font-bold text-slate-900">
          {t('details.overview.recordMetadata', 'Thông tin tóm tắt')}
        </h3>

        <div className="space-y-3 text-xs">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-slate-500">{t('details.overview.status', 'Trạng thái')}</span>
            {branch.isActive ? (
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
          </div>

          {/* Total Courts */}
          <div className="flex items-center justify-between">
            <span className="text-slate-500">{t('details.overview.totalCourts', 'Tổng số sân')}</span>
            <span className="font-bold text-slate-900">{formatNumber(courtsCount)}</span>
          </div>

          {/* Created Date */}
          <div className="flex items-center justify-between">
            <span className="text-slate-500">{t('details.overview.createdAt', 'Ngày tạo')}</span>
            <span className="font-mono text-slate-700">
              {branch.createdAt ? branch.createdAt.slice(0, 10) : '-'}
            </span>
          </div>

          {/* Updated Date */}
          <div className="flex items-center justify-between">
            <span className="text-slate-500">{t('details.overview.updatedAt', 'Ngày cập nhật')}</span>
            <span className="font-mono text-slate-700">
              {branch.updatedAt ? branch.updatedAt.slice(0, 10) : '-'}
            </span>
          </div>
        </div>

        {onEdit && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="w-full rounded-xl border-slate-200 text-xs font-bold mt-2"
          >
            <Edit2 className="size-3.5 mr-1.5 text-slate-500" />
            {t('actions.editInfo', 'Chỉnh sửa thông tin')}
          </Button>
        )}
      </div>

      {/* Cover Image Preview */}
      {coverImage && (
        <div className="rounded-2xl border border-slate-200/90 bg-white p-3 shadow-xs">
          <div className="group relative aspect-video overflow-hidden rounded-xl bg-slate-100">
            <img
              src={coverImage}
              alt={branch.name}
              className="h-full w-full object-cover"
            />
            {onZoomImage && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => onZoomImage(coverImage)}
                  className="flex items-center gap-1.5 rounded-xl bg-white/90 px-2.5 py-1.5 text-xs font-bold text-slate-900 shadow-md transition-transform hover:scale-105"
                >
                  <Maximize2 className="size-3.5" />
                  {t('actions.zoom', 'Phóng to')}
                </button>
              </div>
            )}
          </div>
          <p className="mt-2 text-center text-[11px] font-medium text-slate-400">
            {t('details.overview.coverPhoto', 'Ảnh đại diện chi nhánh')}
          </p>
        </div>
      )}
    </div>
  );
};
