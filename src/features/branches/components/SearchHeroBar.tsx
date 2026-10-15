import React, { useState } from 'react';
import { Search, MapPin, Building2, X } from 'lucide-react';

export interface SearchHeroFilters {
  keyword: string;
  city: string;
  district: string;
}

export interface SearchHeroBarProps {
  initialFilters: SearchHeroFilters;
  onSearch: (filters: SearchHeroFilters) => void;
  isLoading?: boolean;
}

const POPULAR_CITIES = [
  'Hồ Chí Minh',
  'Hà Nội',
  'Đà Nẵng',
  'Bình Dương',
  'Cần Thơ',
];

const POPULAR_DISTRICTS_HCM = [
  'Quận 1',
  'Quận 3',
  'Quận 5',
  'Quận 7',
  'Quận 10',
  'Bình Thạnh',
  'Tân Bình',
  'Phú Nhuận',
  'Gò Vấp',
  'Thủ Đức',
];

export const SearchHeroBar: React.FC<SearchHeroBarProps> = ({
  initialFilters,
  onSearch,
  isLoading = false,
}) => {
  const [keyword, setKeyword] = useState(initialFilters.keyword);
  const [city, setCity] = useState(initialFilters.city);
  const [district, setDistrict] = useState(initialFilters.district);

  React.useEffect(() => {
    setKeyword(initialFilters.keyword);
    setCity(initialFilters.city);
    setDistrict(initialFilters.district);
  }, [initialFilters.keyword, initialFilters.city, initialFilters.district]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSearch({
      keyword: keyword.trim(),
      city: city.trim(),
      district: district.trim(),
    });
  };

  const handleClear = () => {
    setKeyword('');
    setCity('');
    setDistrict('');
    onSearch({ keyword: '', city: '', district: '' });
  };

  const hasActiveFilters = Boolean(keyword || city || district);

  return (
    <form
      onSubmit={handleSubmit}
      className="relative rounded-2xl border border-white/20 bg-surface/95 p-3 shadow-2xl backdrop-blur-xl sm:p-4 text-content-primary"
    >
      <div className="grid grid-cols-1 divide-y divide-line rounded-xl lg:grid-cols-12 lg:divide-x lg:divide-y-0 items-center gap-y-2 lg:gap-y-0">
        {/* Field 1: Keyword */}
        <div className="relative p-2 lg:col-span-4">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-content-secondary mb-1">
            Từ khóa tìm kiếm
          </label>
          <div className="flex items-center gap-2">
            <Search className="size-4 text-brand-600 shrink-0" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tên sân, địa chỉ, số điện thoại..."
              className="w-full bg-transparent text-sm font-semibold text-content-primary placeholder:text-content-secondary/60 focus:outline-hidden"
            />
            {keyword && (
              <button
                type="button"
                onClick={() => setKeyword('')}
                className="text-content-secondary hover:text-content-primary p-1"
                aria-label="Xóa từ khóa"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Field 2: City */}
        <div className="relative p-2 lg:col-span-3">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-content-secondary mb-1">
            Tỉnh / Thành phố
          </label>
          <div className="flex items-center gap-2">
            <Building2 className="size-4 text-brand-600 shrink-0" />
            <input
              type="text"
              list="popular-cities-list"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="VD: Hồ Chí Minh"
              className="w-full bg-transparent text-sm font-semibold text-content-primary placeholder:text-content-secondary/60 focus:outline-hidden"
            />
            <datalist id="popular-cities-list">
              {POPULAR_CITIES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
        </div>

        {/* Field 3: District */}
        <div className="relative p-2 lg:col-span-3">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-content-secondary mb-1">
            Quận / Huyện
          </label>
          <div className="flex items-center gap-2">
            <MapPin className="size-4 text-brand-600 shrink-0" />
            <input
              type="text"
              list="popular-districts-list"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="VD: Quận 7"
              className="w-full bg-transparent text-sm font-semibold text-content-primary placeholder:text-content-secondary/60 focus:outline-hidden"
            />
            <datalist id="popular-districts-list">
              {POPULAR_DISTRICTS_HCM.map((d) => (
                <option key={d} value={d} />
              ))}
            </datalist>
          </div>
        </div>

        {/* Action: Search Button & Clear */}
        <div className="flex items-center justify-end gap-2 p-2 lg:col-span-2">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClear}
              className="px-2.5 py-2 text-xs font-semibold text-content-secondary hover:text-content-primary transition-colors cursor-pointer"
              title="Đặt lại bộ lọc"
            >
              Xóa lọc
            </button>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="flex flex-1 items-center justify-center gap-2 h-11 px-5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all select-none active:scale-95 bg-brand-600 text-white shadow-md hover:bg-brand-700 disabled:opacity-60 cursor-pointer"
          >
            <Search className="size-4 shrink-0" />
            <span>{isLoading ? 'Đang tìm...' : 'Tìm kiếm'}</span>
          </button>
        </div>
      </div>
    </form>
  );
};
