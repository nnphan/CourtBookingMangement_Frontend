import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, MapPin, Phone, Compass } from 'lucide-react';
import type { BranchDetailDto } from '../types/branch-detail.types';
import { buildFullAddress } from '../utils/branch-detail.mapper';
import { BranchSummaryCard } from './BranchSummaryCard';
import { useAmenities } from '@/features/amenities/hooks/useAmenities';
import { getAmenityIcon } from '@/features/amenities/utils/getAmenityIcon';

export interface OverviewTabProps {
  branch: BranchDetailDto;
  onEdit?: () => void;
  onZoomImage?: (url: string) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  branch,
  onEdit,
  onZoomImage,
}) => {
  const { t } = useTranslation('branch');
  const fullAddress = buildFullAddress(branch.address, branch.district, branch.city);

  console.log(branch.branchAmenities);

  const { data: amenityCatalog = [] } = useAmenities();

  // Resolve amenities from amenityIds via catalog or directly from branch.amenities
  const resolvedAmenities = useMemo(() => {
    if (branch.branchAmenities && branch.branchAmenities.length > 0) {
      return branch.branchAmenities;
    }
    const ids = branch.amenityIds ?? [];
    return ids.flatMap((id) => {
      const found = amenityCatalog.find((item) => item.id === id);
      return found ? [found] : [];
    });
  }, [branch.branchAmenities, branch.amenityIds, amenityCatalog]);



  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* General Info Card */}
      <div className="space-y-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs sm:p-6 lg:col-span-2">
        <h3 className="flex items-center gap-2 border-b border-slate-100 pb-3 text-base font-bold text-slate-900">
          <Building2 className="size-4 text-emerald-600" />
          {t('details.overview.generalInfo', 'Thông tin chung')}
        </h3>

        <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          {/* Branch Name */}
          <div>
            <span className="block text-xs font-bold tracking-wider text-slate-400 uppercase">
              {t('details.overview.branchName', 'Tên chi nhánh')}
            </span>
            <span className="mt-0.5 block text-base font-bold text-slate-900">
              {branch.name}
            </span>
          </div>

          {/* Contact Phone */}
          <div>
            <span className="block text-xs font-bold tracking-wider text-slate-400 uppercase">
              {t('details.overview.contactPhone', 'Số điện thoại liên hệ')}
            </span>
            <span className="mt-0.5 block flex items-center gap-1.5 font-mono text-base font-bold text-slate-900">
              <Phone className="size-4 text-emerald-600" />
              {branch.phoneNumber || '-'}
            </span>
          </div>

          {/* Full Address */}
          <div className="sm:col-span-2">
            <span className="block text-xs font-bold tracking-wider text-slate-400 uppercase">
              {t('details.overview.fullAddress', 'Địa chỉ đầy đủ')}
            </span>
            <span className="mt-0.5 block flex items-start gap-1.5 font-medium text-slate-800">
              <MapPin className="mt-0.5 size-4 shrink-0 text-emerald-600" />
              {fullAddress || '-'}
            </span>
          </div>

          {/* City */}
          <div>
            <span className="block text-xs font-bold tracking-wider text-slate-400 uppercase">
              {t('details.overview.city', 'Tỉnh / Thành phố')}
            </span>
            <span className="mt-0.5 block font-semibold text-slate-800">
              {branch.city || '-'}
            </span>
          </div>

          {/* District */}
          <div>
            <span className="block text-xs font-bold tracking-wider text-slate-400 uppercase">
              {t('details.overview.district', 'Quận / Huyện')}
            </span>
            <span className="mt-0.5 block font-semibold text-slate-800">
              {branch.district || '-'}
            </span>
          </div>

          {/* Coordinates */}
          <div className="sm:col-span-2">
            <span className="block text-xs font-bold tracking-wider text-slate-400 uppercase">
              {t('details.overview.coordinates', 'Tọa độ địa lý')}
            </span>
            {branch.latitude != null && branch.longitude != null ? (
              <span className="mt-0.5 block flex items-center gap-1.5 font-mono text-xs text-slate-700">
                <Compass className="size-3.5 text-emerald-600" />
                <span>
                  Vĩ độ: {branch.latitude} | Kinh độ: {branch.longitude}
                </span>
              </span>
            ) : (
              <span className="mt-0.5 block text-xs text-slate-400">-</span>
            )}
          </div>

          {/* Amenities */}
          <div className="border-t border-slate-100 pt-3 sm:col-span-2">
            <span className="mb-2 block text-xs font-bold tracking-wider text-slate-400 uppercase">
              {t('details.overview.amenities', 'Tiện ích')}
            </span>
            {resolvedAmenities.length === 0 ? (
              <p className="text-sm text-slate-400 italic">
                {t('details.overview.noAmenities', 'Chưa có tiện ích.')}
              </p>
            ) : (
              <ul className="flex flex-wrap gap-2">
                {resolvedAmenities.map((amenity) => {
                  const Icon = getAmenityIcon(amenity.icon);
                  return (
                    <li
                      key={amenity.id}
                      className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50/70 px-3 py-1 text-xs font-semibold text-emerald-800 shadow-2xs"
                    >
                      <Icon aria-hidden className="size-3.5 text-emerald-600" />
                      <span>{amenity.name}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Description */}
          <div className="border-t border-slate-100 pt-3 sm:col-span-2">
            <span className="mb-1 block text-xs font-bold tracking-wider text-slate-400 uppercase">
              {t('details.overview.description', 'Mô tả')}
            </span>
            <p className="rounded-xl border border-slate-200/60 bg-slate-50 p-3.5 text-sm leading-relaxed text-slate-600">
              {branch.description?.trim() || t('details.overview.noDescription', 'Chưa có mô tả.')}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Card */}
      <BranchSummaryCard branch={branch} onEdit={onEdit} onZoomImage={onZoomImage} />
    </div>
  );
};
