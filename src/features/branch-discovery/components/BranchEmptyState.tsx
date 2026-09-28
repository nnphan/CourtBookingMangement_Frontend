import { SearchX, RotateCcw, MapPin } from 'lucide-react';
import { useBranchSearchStore } from '../store/branch-search.store';
import { POPULAR_LOCATIONS } from '../constants/amenities';

export const BranchEmptyState = () => {
  const { resetFilters, setSelectedDistrict } = useBranchSearchStore();

  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-line bg-surface p-8 text-center sm:p-12">
      <div className="grid size-16 place-items-center rounded-full bg-brand-50 text-brand-600 mb-4">
        <SearchX className="size-8" />
      </div>

      <h3 className="text-lg sm:text-xl font-extrabold text-content-primary">
        Không tìm thấy câu lạc bộ phù hợp
      </h3>

      <p className="mt-1 max-w-md text-xs sm:text-sm text-content-secondary">
        Rất tiếc, không có sân cầu lông nào khớp với tất cả tiêu chí tìm kiếm hoặc bộ lọc hiện tại của bạn.
      </p>

      {/* Quick suggestions */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <span className="text-xs font-semibold text-content-secondary">Gợi ý khu vực:</span>
        {POPULAR_LOCATIONS.slice(1, 4).map((loc) => (
          <button
            key={loc.value}
            type="button"
            onClick={() => setSelectedDistrict(loc.value)}
            className="flex items-center gap-1 rounded-full border border-line bg-surface-muted px-3 py-1 text-xs font-medium text-content-primary hover:border-brand-600 hover:text-brand-600 transition-colors"
          >
            <MapPin className="size-3" />
            {loc.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        <button
          type="button"
          onClick={resetFilters}
          className="flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-brand-700 active:scale-95 focus-visible:outline-3 focus-visible:outline-[var(--color-focus)]"
        >
          <RotateCcw className="size-4" />
          <span>Xóa tất cả bộ lọc</span>
        </button>
      </div>
    </div>
  );
};
