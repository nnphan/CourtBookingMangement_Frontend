import React from 'react';
import { useNavigate } from 'react-router';
import {
  Clock,
  MapPin,
  Phone,
  Zap,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import type { BranchListItemDto } from '../types/branch.types';
import {
  calculateLowestPrice,
  formatCourtCount,
  formatLowestPriceDisplay,
  formatOperatingHours,
  getBranchThumbnail,
} from '../utils/branch.mapper';

export interface HomeBranchCardProps {
  branch: BranchListItemDto;
}

export const HomeBranchCard: React.FC<HomeBranchCardProps> = ({ branch }) => {
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
    navigate(`/branches/${branch.id}`);
  };

  return (
    <article
      onClick={handleCardClick}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/40 hover:shadow-xl focus-within:ring-2 focus-within:ring-brand-500 cursor-pointer"
    >
      {/* Branch Thumbnail */}
      <div className="relative aspect-16/10 w-full overflow-hidden bg-surface-muted">
        <img
          src={thumbnail}
          alt={branch.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Ambient Gradient Overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Top Badges (Instant Booking) */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
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
        <h3 className="text-base font-extrabold text-content-primary line-clamp-1 transition-colors group-hover:text-brand-600 sm:text-lg">
          {branch.name}
        </h3>

        {/* Branch Address */}
        <p className="mt-1 text-xs font-medium text-content-secondary line-clamp-1">
          {branch.address}
        </p>

        {/* Meta details: Operating hours, Courts count, District/City */}
        <div className="mt-3.5 space-y-2 border-t border-line/60 pt-3 text-xs text-content-secondary">
          {/* Operating hours: 🕒 05:30 - 23:30 */}
          <div className="flex items-center gap-2">
            <Clock className="size-3.5 text-brand-600 shrink-0" />
            <span className="font-semibold text-content-primary">{operatingHoursDisplay}</span>
          </div>

          {/* Court count: 🏸 4 sân */}
          <div className="flex items-center gap-2">
            <span className="text-sm shrink-0 leading-none" role="img" aria-label="Sân cầu lông">
              🏸
            </span>
            <span className="font-medium">{courtCountDisplay}</span>
          </div>

          {/* Location: 📍 District, City */}
          <div className="flex items-center gap-2">
            <MapPin className="size-3.5 text-brand-600 shrink-0" />
            <span className="truncate font-medium">
              {[branch.district, branch.city].filter(Boolean).join(', ')}
            </span>
          </div>

          {/* Phone: 0971899081 */}
          {branch.phoneNumber && (
            <div className="flex items-center gap-2">
              <Phone className="size-3.5 text-brand-600 shrink-0" />
              <span className="font-medium">{branch.phoneNumber}</span>
            </div>
          )}
        </div>

        {/* Amenities section */}
        <div className="mt-4">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-content-secondary mb-1.5">
            Tiện ích:
          </span>
          {displayedAmenities.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {displayedAmenities.map((amenity) => (
                <span
                  key={amenity.id || amenity.code || amenity.name}
                  className="inline-flex items-center gap-1 rounded-md bg-surface-muted px-2 py-0.5 text-[11px] font-medium text-content-secondary"
                >
                  <CheckCircle2 className="size-3 text-brand-600 shrink-0" />
                  <span className="truncate max-w-[120px]">{amenity.name}</span>
                </span>
              ))}
              {remainingAmenitiesCount > 0 && (
                <span className="rounded-md bg-brand-50 px-1.5 py-0.5 text-[11px] font-bold text-brand-700">
                  +{remainingAmenitiesCount}
                </span>
              )}
            </div>
          ) : (
            <p className="text-[11px] text-content-secondary italic">Đầy đủ tiện ích cơ bản</p>
          )}
        </div>

        {/* Card Footer: Price & CTA */}
        <div className="mt-auto pt-4 border-t border-line flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-[11px] font-medium text-content-secondary">Giá thuê sân</span>
            <span className="text-sm sm:text-base font-extrabold text-brand-600">
              {lowestPriceDisplay}
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/branches/${branch.id}`);
            }}
            className="inline-flex items-center gap-1 rounded-xl bg-brand-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition-all hover:bg-brand-700 active:scale-95 focus-visible:outline-2 focus-visible:outline-brand-600 cursor-pointer"
          >
            <span>Xem chi tiết</span>
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
};
