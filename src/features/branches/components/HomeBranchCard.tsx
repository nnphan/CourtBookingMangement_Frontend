import React from 'react';
import { useNavigate } from 'react-router';
import { Clock, MapPin, Zap, ChevronRight, Eye, ShieldCheck } from 'lucide-react';
import type { BranchListItemDto } from '../types/branch.types';
import {
  calculateLowestPrice,
  formatCourtCount,
  formatLowestPriceDisplay,
  formatOperatingHours,
  getAmenityEmoji,
  getBranchThumbnail,
} from '../utils/branch.mapper';
import { paths } from '@/app/router/paths';

export interface HomeBranchCardProps {
  branch: BranchListItemDto;
  onQuickView?: (branchId: string) => void;
}

export const HomeBranchCard: React.FC<HomeBranchCardProps> = ({ branch, onQuickView }) => {
  const navigate = useNavigate();

  const thumbnail = getBranchThumbnail(branch.images);
  const operatingHour = branch.operatingHours?.[0];
  const operatingHoursDisplay = formatOperatingHours(operatingHour);
  const courtCountDisplay = formatCourtCount(branch.courts?.length);
  const lowestPrice = calculateLowestPrice(branch.branchPricings);
  const lowestPriceDisplay = formatLowestPriceDisplay(lowestPrice);

  const amenities = branch.branchAmenities || [];
  const displayedAmenities = amenities.slice(0, 4);
  const remainingAmenitiesCount = Math.max(0, amenities.length - 4);

  const handleCardClick = () => {
    navigate(paths.branchDetail(branch.id));
  };

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(branch.id);
    }
  };

  const handleViewDetailClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(paths.branchDetail(branch.id));
  };

  return (
    <article
      onClick={handleCardClick}
      className="group border-line bg-surface hover:border-brand-500/40 focus-within:ring-brand-500 relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border shadow-xs transition-all duration-300 focus-within:ring-2 hover:-translate-y-1 hover:shadow-xl"
    >
      {/* Branch Thumbnail */}
      <div className="bg-surface-muted relative aspect-16/10 w-full overflow-hidden">
        <img
          src={thumbnail}
          alt={branch.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Ambient Gradient Overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Top Badges (Instant Booking: bg-green-500) */}
        <div className="absolute top-3 right-3 left-3 flex items-center justify-between gap-2">
          {branch.supportsInstantBooking ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500 px-3 py-1 text-xs font-bold text-white shadow-md backdrop-blur-xs">
              <Zap className="size-3.5 fill-current" />
              <span>Đặt ngay</span>
            </span>
          ) : (
            <span />
          )}

          {branch.isActive && (
            <span className="inline-flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur-xs">
              <ShieldCheck className="size-3 text-emerald-400" />
              <span>Tiêu chuẩn</span>
            </span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {/* Branch Name */}
        <h3 className="text-content-primary group-hover:text-brand-600 line-clamp-1 text-base font-extrabold transition-colors sm:text-lg">
          {branch.name}
        </h3>

        {/* Branch Address */}
        <p className="text-content-secondary mt-1 line-clamp-1 text-xs font-medium">
          {branch.address}
        </p>

        {/* Meta details: Operating hours, Courts count, District/City */}
        <div className="border-line/60 text-content-secondary mt-3.5 space-y-2 border-t pt-3 text-xs">
          {/* Operating hours: 🕒 05:30 - 23:30 */}
          <div className="flex items-center gap-2">
            <Clock className="text-brand-600 size-3.5 shrink-0" />
            <span className="text-content-primary font-semibold">{operatingHoursDisplay}</span>
          </div>

          {/* Court count: 🏸 4 sân */}
          <div className="flex items-center gap-2">
            <span className="shrink-0 text-sm leading-none" role="img" aria-label="Sân cầu lông">
              🏸
            </span>
            <span className="font-medium">{courtCountDisplay}</span>
          </div>

          {/* Location: 📍 District, City */}
          <div className="flex items-center gap-2">
            <MapPin className="text-brand-600 size-3.5 shrink-0" />
            <span className="truncate font-medium">
              {[branch.district, branch.city].filter(Boolean).join(', ')}
            </span>
          </div>
        </div>

        {/* Amenities section (Maximum 4, e.g. 📷 Camera, 🏸 Cho thuê vợt, 👟 Cho thuê giày, ☕ Căng tin, +2) */}
        <div className="mt-4">
          <span className="text-content-secondary mb-1.5 block text-[11px] font-bold tracking-wider uppercase">
            Tiện ích:
          </span>
          {displayedAmenities.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {displayedAmenities.map((amenity) => {
                const icon = getAmenityEmoji(amenity.name, amenity.icon);
                return (
                  <span
                    key={amenity.id || amenity.code || amenity.name}
                    className="bg-surface-muted text-content-secondary inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium"
                  >
                    <span className="shrink-0 text-xs leading-none">{icon}</span>
                    <span className="max-w-[120px] truncate">{amenity.name}</span>
                  </span>
                );
              })}
              {remainingAmenitiesCount > 0 && (
                <span className="bg-brand-50 text-brand-700 rounded-md px-1.5 py-0.5 text-[11px] font-bold">
                  +{remainingAmenitiesCount}
                </span>
              )}
            </div>
          ) : (
            <p className="text-content-secondary text-[11px] italic">Đầy đủ tiện ích cơ bản</p>
          )}
        </div>

        {/* Card Price */}
        <div className="border-line/60 mt-4 flex flex-col border-t pt-3">
          <span className="text-content-secondary text-[11px] font-medium">Giá thuê sân</span>
          <span className="text-brand-600 text-sm font-extrabold sm:text-base">
            {lowestPriceDisplay}
          </span>
        </div>

        {/* Card Action Buttons: [Xem nhanh] & [Xem chi tiết] */}
        <div className="border-line mt-3 flex items-center justify-between gap-2 border-t pt-3">
          {/* Quick View Button */}
          <button
            type="button"
            onClick={handleQuickViewClick}
            className="border-line bg-surface text-content-primary hover:bg-surface-muted hover:border-brand-500/40 inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold shadow-2xs transition-all active:scale-95"
            aria-label={`Xem nhanh thông tin ${branch.name}`}
          >
            <Eye className="text-brand-600 size-3.5 shrink-0" />
            <span>Xem nhanh</span>
          </button>

          {/* View Detail Button */}
          <button
            type="button"
            onClick={handleViewDetailClick}
            className="bg-brand-600 hover:bg-brand-700 focus-visible:outline-brand-600 inline-flex flex-1 cursor-pointer items-center justify-center gap-1 rounded-xl px-3 py-2 text-xs font-bold text-white shadow-xs transition-all focus-visible:outline-2 active:scale-95"
            aria-label={`Xem chi tiết ${branch.name}`}
          >
            <span>Đặt sân</span>
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
};
