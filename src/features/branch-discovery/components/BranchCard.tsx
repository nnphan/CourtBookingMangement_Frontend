import { useState } from 'react';
import {
  MapPin,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  CalendarCheck,
  Info,
} from 'lucide-react';
import type { BadmintonBranch } from '../types/branch';
import { useBranchSearchStore } from '../store/branch-search.store';
import { useNavigate } from 'react-router';
import { AMENITIES_MAP } from '../constants/amenities';
import { BranchNavigationService } from '../services/navigation.service';

interface BranchCardProps {
  branch: BadmintonBranch;
}

export const BranchCard = ({ branch }: BranchCardProps) => {
  const navigate = useNavigate();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const { openDetailModal, setHoveredBranchId } = useBranchSearchStore();

  const images =
    Array.isArray(branch.images) && branch.images.length > 0
      ? branch.images
      : [branch.coverImage || 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=1200&auto=format&fit=crop'];

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const minPrice = branch.priceRange?.min ?? 90000;
  const maxPrice = branch.priceRange?.max ?? 170000;
  const formattedMinPrice = minPrice.toLocaleString('vi-VN');
  const formattedMaxPrice = maxPrice.toLocaleString('vi-VN');

  return (
    <article
      onMouseEnter={() => setHoveredBranchId(branch.id)}
      onMouseLeave={() => setHoveredBranchId(null)}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-line-strong hover:shadow-xl focus-within:ring-2 focus-within:ring-brand-500"
    >
      {/* Photo Carousel Area */}
      <div className="relative aspect-16/10 w-full overflow-hidden bg-surface-muted">
        <img
          src={images[activeImageIndex] ?? branch.coverImage}
          alt={`${branch.name} - ảnh ${activeImageIndex + 1}`}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Gradient overlay for badges readability */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {branch.isOpenNow ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-success/90 px-2.5 py-1 text-[11px] font-bold text-white shadow-xs backdrop-blur-xs">
                <span className="size-1.5 rounded-full bg-white animate-pulse" />
                Mở cửa
              </span>
            ) : (
              <span className="rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-bold text-white shadow-xs backdrop-blur-xs">
                Đã đóng cửa
              </span>
            )}


          </div>


        </div>

        {/* Carousel Prev/Next Buttons */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrevImage}
              aria-label="Xem ảnh trước"
              className="absolute left-2 top-1/2 -translate-y-1/2 grid size-8 place-items-center rounded-full bg-white/80 text-black shadow-md opacity-0 backdrop-blur-md transition-opacity group-hover:opacity-100 hover:bg-white focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-brand-600"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={handleNextImage}
              aria-label="Xem ảnh tiếp theo"
              className="absolute right-2 top-1/2 -translate-y-1/2 grid size-8 place-items-center rounded-full bg-white/80 text-black shadow-md opacity-0 backdrop-blur-md transition-opacity group-hover:opacity-100 hover:bg-white focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-brand-600"
            >
              <ChevronRight className="size-4" />
            </button>
          </>
        )}

        {/* Carousel Dot Indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {images.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex(idx);
                }}
                aria-label={`Chuyển đến ảnh ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all ${idx === activeImageIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'
                  }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {/* District & Rating header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 text-xs font-semibold text-content-secondary">
            <MapPin className="size-3.5 text-brand-600 shrink-0" />
            <span className="truncate">{branch.district}, {branch.city}</span>
          </div>
        </div>

        {/* Branch Title */}
        <h3 className="mt-2 text-base font-extrabold text-content-primary line-clamp-1 transition-colors group-hover:text-brand-600 sm:text-lg">
          {branch.name}
        </h3>

        {/* Tagline */}
        <p className="mt-1 text-xs font-normal text-content-secondary line-clamp-2">
          {branch.tagline}
        </p>

        {/* Selected Amenities Chips */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {branch.amenities.slice(0, 4).map((amenityId) => {
            const amenity = AMENITIES_MAP[amenityId];
            if (!amenity) return null;
            return (
              <span
                key={amenityId}
                className="inline-flex items-center gap-1 rounded-md bg-surface-muted px-2 py-0.5 text-[11px] font-medium text-content-secondary"
              >
                <CheckCircle2 className="size-3 text-brand-600" />
                {amenity.name}
              </span>
            );
          })}
          {branch.amenities.length > 4 && (
            <span className="rounded-md bg-surface-muted px-1.5 py-0.5 text-[11px] font-medium text-content-secondary">
              +{branch.amenities.length - 4} tiện ích
            </span>
          )}
        </div>

        {/* Card Footer: Price & Actions */}
        <div className="mt-5 flex items-center justify-between border-t border-line pt-3.5">
          <div>
            <span className="block text-[11px] font-medium text-content-secondary">
              Giá thuê giờ
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-black text-brand-600 sm:text-base">
                {formattedMinPrice} đ
              </span>
              <span className="text-xs text-content-secondary">- {formattedMaxPrice} đ</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => openDetailModal(branch)}
              aria-label={`Xem thông tin câu lạc bộ ${branch.name}`}
              className="grid size-9 place-items-center rounded-xl border border-line bg-surface text-content-primary transition-colors hover:bg-surface-muted hover:border-line-strong focus-visible:outline-2 focus-visible:outline-brand-600"
              title="Xem thông tin chi tiết"
            >
              <Info className="size-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                const selectedDate = useBranchSearchStore.getState().selectedDate;
                BranchNavigationService.goToCustomerCourtStatus(navigate, branch, selectedDate);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition-transform hover:bg-brand-700 active:scale-95 focus-visible:outline-3 focus-visible:outline-[var(--color-focus)] cursor-pointer"
            >
              <CalendarCheck className="size-3.5" />
              <span>Đặt sân</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
