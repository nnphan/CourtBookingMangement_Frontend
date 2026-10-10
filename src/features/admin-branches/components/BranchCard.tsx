import React from 'react';
import { useTranslation } from 'react-i18next';
import { Building, MapPin, Phone } from 'lucide-react';
import type { BranchListItemDto } from '../types/branch-admin.types';
import { formatNullableText } from '../utils/branch.mapper';
import { useLocaleFormatters } from '@/hooks/useLocaleFormatters';

export interface BranchCardProps {
  branch: BranchListItemDto;
  onView?: (branch: BranchListItemDto) => void;
  onEdit?: (branch: BranchListItemDto) => void;
  onDelete?: (branch: BranchListItemDto) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export const BranchCard: React.FC<BranchCardProps> = ({
  branch,
  onView,
  onEdit,
  onDelete,
  canEdit = true,
  canDelete = false,
}) => {
  const { t } = useTranslation('branch');
  const { formatNumber } = useLocaleFormatters();

  const cityText = formatNullableText(branch.city);
  const districtText = formatNullableText(branch.district);
  const locationText =
    branch.city || branch.district
      ? [districtText !== '-' ? districtText : '', cityText !== '-' ? cityText : '']
          .filter(Boolean)
          .join(', ')
      : '-';

  return (
    <div className="p-4 space-y-3 bg-white border border-slate-200/80 rounded-2xl shadow-xs transition-shadow hover:shadow-sm">
      {/* Header: Name + Status */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="size-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 shrink-0 mt-0.5 border border-slate-200/60">
            <Building className="size-4 text-emerald-700" />
          </div>
          <div className="min-w-0">
            <h4
              onClick={() => onView?.(branch)}
              className="font-semibold text-slate-900 text-sm hover:text-emerald-700 transition-colors cursor-pointer truncate"
            >
              {branch.name}
            </h4>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin className="size-3 text-slate-400 shrink-0" />
              <span className="truncate">{locationText}</span>
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="shrink-0">
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
      </div>

      {/* Info Row: Phone & Courts */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
        <div className="flex items-center gap-3">
          <span className="font-mono flex items-center gap-1 text-slate-600">
            <Phone className="size-3 text-slate-400" />
            <span>{formatNullableText(branch.phoneNumber)}</span>
          </span>

          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            {t('table.courtsCount', {
              count: branch.totalCourts,
              formatted: formatNumber(branch.totalCourts),
              defaultValue: `${branch.totalCourts} sân`,
            })}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          {onView && (
            <button
              type="button"
              onClick={() => onView(branch)}
              className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {t('actions.viewShort', 'Xem')}
            </button>
          )}
          {canEdit && onEdit && (
            <button
              type="button"
              onClick={() => onEdit(branch)}
              className="px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
            >
              {t('actions.edit', 'Sửa')}
            </button>
          )}
          {canDelete && onDelete && (
            <button
              type="button"
              onClick={() => onDelete(branch)}
              className="px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              {t('actions.delete', 'Xóa')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
