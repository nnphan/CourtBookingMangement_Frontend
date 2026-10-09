import React, { useMemo } from 'react';
import { Sparkles, Check, RotateCw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAmenities } from '../hooks/useAmenities';
import { getAmenityIcon } from '@/features/amenities/utils/getAmenityIcon';
import { cn } from '@/lib/utils';

interface AmenitiesSectionProps {
  value: string[];
  onChange: (amenityIds: string[]) => void;
  disabled?: boolean;
}

export const AmenitiesSection: React.FC<AmenitiesSectionProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const { data: amenities = [], isLoading, isError, error, refetch, isFetching } = useAmenities();
  const selectedIds = useMemo(() => new Set(value), [value]);

  const toggle = (id: string) => {
    if (disabled) return;
    if (selectedIds.has(id)) {
      onChange(value.filter((item) => item !== id));
    } else {
      onChange([...value, id]);
    }
  };

  const handleSelectAll = () => {
    if (disabled || !amenities.length) return;
    onChange(amenities.map((a) => a.id));
  };

  const handleClearAll = () => {
    if (disabled) return;
    onChange([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Sparkles className="size-4.5 text-emerald-600" />
            Tiện ích cơ sở
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              Đã chọn {value.length} tiện ích
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Chọn các tiện ích sẵn có tại chi nhánh để hiển thị cho khách hàng khi đặt sân.
          </p>
        </div>

        {amenities.length > 0 && !isLoading && !isError && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={disabled}
              onClick={handleSelectAll}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline px-1"
            >
              Chọn tất cả
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              disabled={disabled || value.length === 0}
              onClick={handleClearAll}
              className="text-xs font-semibold text-slate-500 hover:text-slate-700 hover:underline px-1 disabled:opacity-40"
            >
              Bỏ chọn
            </button>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, idx) => (
            <Skeleton key={idx} className="h-13 w-full rounded-xl" />
          ))}
        </div>
      )}

      {isError && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-800">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="size-5 text-rose-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold">Không thể tải danh sách tiện ích</p>
              <p className="text-xs text-rose-600/90">{error?.message || 'Lỗi kết nối máy chủ'}</p>
            </div>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isFetching}
            onClick={() => refetch()}
            className="rounded-xl border-rose-300 bg-white hover:bg-rose-100/50 text-rose-700 text-xs font-semibold"
          >
            <RotateCw className={cn('size-3.5 mr-1.5', isFetching && 'animate-spin')} />
            Thử lại
          </Button>
        </div>
      )}

      {!isLoading && !isError && amenities.length === 0 && (
        <div className="p-6 text-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-sm">
          Chưa có tiện ích nào trong hệ thống.
        </div>
      )}

      {!isLoading && !isError && amenities.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {amenities.map((amenity) => {
            const isSelected = selectedIds.has(amenity.id);
            const Icon = getAmenityIcon(amenity.icon || amenity.code);

            return (
              <button
                key={amenity.id}
                type="button"
                disabled={disabled}
                onClick={() => toggle(amenity.id)}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-150',
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/90 text-emerald-950 shadow-xs ring-1 ring-emerald-600/30'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50/80',
                  disabled && 'opacity-60 cursor-not-allowed',
                )}
              >
                <div
                  className={cn(
                    'size-8 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                    isSelected
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-600',
                  )}
                >
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold truncate">{amenity.name}</p>
                  {amenity.code && (
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                      {amenity.code}
                    </p>
                  )}
                </div>
                {isSelected && (
                  <div className="size-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <Check className="size-3 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
