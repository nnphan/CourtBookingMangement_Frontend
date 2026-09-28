import {
  Sparkles,
  Clock,
  AirVent,
  Medal,
  Star,
  Car,
  Wrench,
  LayoutGrid,
  Map as MapIcon,
  Columns2,
  ArrowUpDown,
} from 'lucide-react';
import { useBranchSearchStore } from '../store/branch-search.store';
import type { BranchSortOption } from '../types/branch';

export const CategoryFilterChips = () => {
  const {
    selectedAmenities,
    toggleAmenity,
    onlyOpenNow,
    setOnlyOpenNow,
    selectedCourtSurface,
    setSelectedCourtSurface,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
  } = useBranchSearchStore();

  const isBwfActive = selectedCourtSurface === 'bwf_mat';
  const isAirConActive = selectedAmenities.includes('air_conditioning');
  const isParkingActive = selectedAmenities.includes('parking');
  const isStringingActive = selectedAmenities.includes('stringing');
  const isTopRated = sortBy === 'rating_desc';

  return (
    <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between border-b border-line">
      {/* Category Pills horizontal scroll */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
        {/* All */}
        <button
          type="button"
          onClick={() => {
            setSelectedCourtSurface('all');
            setOnlyOpenNow(false);
          }}
          className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] ${
            !onlyOpenNow && selectedCourtSurface === 'all' && selectedAmenities.length === 0
              ? 'bg-brand-600 text-white shadow-xs'
              : 'border border-line bg-surface text-content-primary hover:border-line-strong hover:bg-surface-muted'
          }`}
        >
          <Sparkles className="size-3.5" />
          <span>Tất cả</span>
        </button>

        {/* Open now */}
        <button
          type="button"
          onClick={() => setOnlyOpenNow(!onlyOpenNow)}
          className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] ${
            onlyOpenNow
              ? 'bg-brand-600 text-white shadow-xs'
              : 'border border-line bg-surface text-content-primary hover:border-line-strong hover:bg-surface-muted'
          }`}
        >
          <Clock className="size-3.5" />
          <span>Đang mở cửa</span>
        </button>

        {/* BWF Mat */}
        <button
          type="button"
          onClick={() => setSelectedCourtSurface(isBwfActive ? 'all' : 'bwf_mat')}
          className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] ${
            isBwfActive
              ? 'bg-brand-600 text-white shadow-xs'
              : 'border border-line bg-surface text-content-primary hover:border-line-strong hover:bg-surface-muted'
          }`}
        >
          <Medal className="size-3.5" />
          <span>Thảm thi đấu BWF</span>
        </button>

        {/* Air con */}
        <button
          type="button"
          onClick={() => toggleAmenity('air_conditioning')}
          className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] ${
            isAirConActive
              ? 'bg-brand-600 text-white shadow-xs'
              : 'border border-line bg-surface text-content-primary hover:border-line-strong hover:bg-surface-muted'
          }`}
        >
          <AirVent className="size-3.5" />
          <span>Sân máy lạnh</span>
        </button>

        {/* Top rated */}
        <button
          type="button"
          onClick={() => setSortBy(isTopRated ? 'recommended' : 'rating_desc')}
          className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] ${
            isTopRated
              ? 'bg-brand-600 text-white shadow-xs'
              : 'border border-line bg-surface text-content-primary hover:border-line-strong hover:bg-surface-muted'
          }`}
        >
          <Star className="size-3.5 fill-current text-accent-gold" />
          <span>Đánh giá 4.8+★</span>
        </button>

        {/* Parking */}
        <button
          type="button"
          onClick={() => toggleAmenity('parking')}
          className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] ${
            isParkingActive
              ? 'bg-brand-600 text-white shadow-xs'
              : 'border border-line bg-surface text-content-primary hover:border-line-strong hover:bg-surface-muted'
          }`}
        >
          <Car className="size-3.5" />
          <span>Bãi xe ô tô</span>
        </button>

        {/* Stringing */}
        <button
          type="button"
          onClick={() => toggleAmenity('stringing')}
          className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] ${
            isStringingActive
              ? 'bg-brand-600 text-white shadow-xs'
              : 'border border-line bg-surface text-content-primary hover:border-line-strong hover:bg-surface-muted'
          }`}
        >
          <Wrench className="size-3.5" />
          <span>Đan vợt lấy liền</span>
        </button>
      </div>

      {/* Right controls: Sort & View switcher */}
      <div className="flex shrink-0 items-center justify-between sm:justify-end gap-2.5">
        {/* Sort Select */}
        <div className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs font-semibold text-content-primary shadow-xs">
          <ArrowUpDown className="size-3.5 text-content-secondary" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as BranchSortOption)}
            aria-label="Sắp xếp danh sách"
            className="bg-transparent font-semibold text-content-primary focus:outline-hidden cursor-pointer"
          >
            <option value="recommended">Gợi ý hàng đầu</option>
            <option value="rating_desc">Đánh giá cao nhất</option>
            <option value="price_asc">Giá từ thấp đến cao</option>
            <option value="price_desc">Giá từ cao đến thấp</option>
            <option value="distance_asc">Khoảng cách gần nhất</option>
            <option value="courts_desc">Nhiều sân nhất</option>
          </select>
        </div>

        {/* View Mode Toggle */}
        <div
          role="group"
          aria-label="Chế độ hiển thị"
          className="flex items-center rounded-lg border border-line bg-surface p-0.5 shadow-xs"
        >
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            title="Dạng lưới"
            aria-label="Hiển thị dạng lưới"
            aria-pressed={viewMode === 'grid'}
            className={`rounded-md p-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-brand-600 ${
              viewMode === 'grid'
                ? 'bg-brand-50 text-brand-700 shadow-xs'
                : 'text-content-secondary hover:text-content-primary'
            }`}
          >
            <LayoutGrid className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('split')}
            title="Dạng chia đôi (Danh sách + Bản đồ)"
            aria-label="Hiển thị chia đôi danh sách và bản đồ"
            aria-pressed={viewMode === 'split'}
            className={`rounded-md p-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-brand-600 ${
              viewMode === 'split'
                ? 'bg-brand-50 text-brand-700 shadow-xs'
                : 'text-content-secondary hover:text-content-primary'
            }`}
          >
            <Columns2 className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('map')}
            title="Dạng bản đồ toàn màn hình"
            aria-label="Hiển thị bản đồ toàn màn hình"
            aria-pressed={viewMode === 'map'}
            className={`rounded-md p-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-brand-600 ${
              viewMode === 'map'
                ? 'bg-brand-50 text-brand-700 shadow-xs'
                : 'text-content-secondary hover:text-content-primary'
            }`}
          >
            <MapIcon className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
