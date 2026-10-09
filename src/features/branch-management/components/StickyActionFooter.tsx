import React from 'react';
import { Loader2, ArrowLeft, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface StickyActionFooterProps {
  onCancel: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  submitProgressText?: string | null;
  courtsCount: number;
  pricingsCount: number;
  imagesCount: number;
  amenitiesCount: number;
  disabled?: boolean;
}

export const StickyActionFooter: React.FC<StickyActionFooterProps> = ({
  onCancel,
  onSubmit,
  isSubmitting,
  submitProgressText,
  courtsCount,
  pricingsCount,
  imagesCount,
  amenitiesCount,
  disabled = false,
}) => {
  return (
    <aside
      aria-label="Thao tác gửi biểu mẫu chi nhánh"
      className="sticky bottom-0 z-30 w-full border-t border-slate-200 bg-white/95 backdrop-blur-md shadow-lg transition-all"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Status badges summary */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="font-semibold text-slate-700">Tổng quan:</span>
          <span
            className={cn(
              'px-2 py-0.5 rounded-md font-medium border',
              imagesCount > 0
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200',
            )}
          >
            {imagesCount}/10 ảnh
          </span>
          <span
            className={cn(
              'px-2 py-0.5 rounded-md font-medium border',
              courtsCount > 0
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200',
            )}
          >
            {courtsCount} sân
          </span>
          <span
            className={cn(
              'px-2 py-0.5 rounded-md font-medium border',
              pricingsCount > 0
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200',
            )}
          >
            {pricingsCount} bảng giá
          </span>
          <span className="hidden md:inline px-2 py-0.5 rounded-md font-medium bg-slate-100 text-slate-700 border border-slate-200">
            {amenitiesCount} tiện ích
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isSubmitting}
            onClick={onCancel}
            className="rounded-xl border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold px-4"
          >
            <ArrowLeft className="size-4 mr-1.5" />
            Hủy & Quay lại
          </Button>

          <Button
            type="button"
            size="sm"
            disabled={isSubmitting || disabled}
            onClick={onSubmit}
            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 shadow-sm min-w-36 transition-all"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                <span>{submitProgressText || 'Đang xử lý...'}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Building2 className="size-4" />
                <span>Tạo chi nhánh mới</span>
              </div>
            )}
          </Button>
        </div>
      </div>
    </aside>
  );
};
