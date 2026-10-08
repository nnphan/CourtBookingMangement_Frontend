import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, RotateCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { getAmenityIcon } from '@/features/amenities/utils/getAmenityIcon';
import type { Amenity } from '@/features/amenities/types/amenity';
import { cn } from '@/lib/utils';

interface BranchAmenitySelectorProps {
  amenities: Amenity[];
  value: string[];
  onChange: (amenityIds: string[]) => void;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

/** Toggleable amenity cards. Selected cards are highlighted with the primary color. */
export const BranchAmenitySelector: React.FC<BranchAmenitySelectorProps> = ({
  amenities,
  value,
  onChange,
  isLoading,
  isError,
  onRetry,
}) => {
  const { t } = useTranslation('branch');
  const selectedIds = useMemo(() => new Set(value), [value]);

  const toggle = (id: string) =>
    onChange(value.includes(id) ? value.filter((selectedId) => selectedId !== id) : [...value, id]);

  if (isLoading) {
    return (
      <ul
        aria-label={t('form.amenities.title')}
        className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4"
      >
        {Array.from({ length: 8 }, (_, index) => (
          <li key={index}>
            <Skeleton className="h-12 w-full rounded-xl" />
          </li>
        ))}
      </ul>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p role="alert" className="text-sm text-red-700">
          Không thể tải danh sách tiện ích.
        </p>
        <Button type="button" size="sm" variant="outline" onClick={onRetry}>
          <RotateCw aria-hidden className="size-4" />
          Thử lại
        </Button>
      </div>
    );
  }

  if (amenities.length === 0) {
    return <p className="text-sm text-slate-500">Chưa có tiện ích nào.</p>;
  }

  return (
    <ul
      aria-label={t('form.amenities.title')}
      className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4"
    >
      {amenities.map((amenity) => {
        const isSelected = selectedIds.has(amenity.id);
        const Icon = getAmenityIcon(amenity.icon);

        return (
          <li key={amenity.id}>
            <button
              type="button"
              aria-pressed={isSelected}
              onClick={() => toggle(amenity.id)}
              className={cn(
                'flex min-h-12 w-full items-center gap-2.5 rounded-xl border px-3.5 py-3 text-left text-sm font-semibold transition-colors',
                'focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:ring-offset-1',
                isSelected
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-400 hover:bg-emerald-50/50',
              )}
            >
              <Icon aria-hidden className="size-4.5 shrink-0" />
              <span className="min-w-0 flex-1">{amenity.name}</span>
              {isSelected && <Check aria-hidden className="size-4 shrink-0" />}
            </button>
          </li>
        );
      })}
    </ul>
  );
};
