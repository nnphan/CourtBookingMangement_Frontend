import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Building } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FilterPanel, FilterSearchInput, FILTER_CONTROL_CLASS } from '@/components/management';

export interface BranchFilterValues {
  keyword: string;
  city: string;
  district: string;
  status: 'all' | 'active' | 'inactive';
}

interface BranchFiltersProps {
  values: BranchFilterValues;
  onChange: (values: Partial<BranchFilterValues>) => void;
  onReset: () => void;
}

const CITY_DISTRICT_MAP: Record<string, string[]> = {
  'Hồ Chí Minh': [
    'Quận 1',
    'Quận 3',
    'Quận 7',
    'Quận 10',
    'Bình Thạnh',
    'Tân Bình',
    'Phú Nhuận',
    'Gò Vấp',
    'Thành phố Thủ Đức',
  ],
  'Hà Nội': [
    'Cầu Giấy',
    'Tây Hồ',
    'Đống Đa',
    'Thanh Xuân',
    'Nam Từ Liêm',
    'Ba Đình',
    'Hai Bà Trưng',
  ],
  'Đà Nẵng': ['Hải Châu', 'Sơn Trà', 'Thanh Khê', 'Ngũ Hành Sơn'],
  'Bình Dương': ['Dĩ An', 'Thuận An', 'Thủ Dầu Một'],
};

export const BranchFilters: React.FC<BranchFiltersProps> = ({
  values,
  onChange,
  onReset,
}) => {
  const { t } = useTranslation('branch');

  const availableDistricts = useMemo(() => {
    if (values.city && values.city !== 'all') {
      return CITY_DISTRICT_MAP[values.city] || [];
    }
    // If all cities or none selected, combine all unique districts
    return Object.values(CITY_DISTRICT_MAP).flat();
  }, [values.city]);

  const hasActiveFilters = Boolean(
    values.keyword ||
      (values.city && values.city !== 'all') ||
      (values.district && values.district !== 'all') ||
      values.status !== 'all',
  );

  return (
    <FilterPanel
      title={t('filters.title')}
      resetLabel={t('filters.reset')}
      onReset={hasActiveFilters ? onReset : undefined}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
        {/* Search input (4 cols on desktop) */}
        <div className="lg:col-span-4">
          <FilterSearchInput
            value={values.keyword}
            onChange={(keyword) => onChange({ keyword })}
            placeholder={t('filters.search')}
            aria-label={t('filters.search')}
          />
        </div>

        {/* City Filter (3 cols) */}
        <div className="lg:col-span-3">
          <Select
            value={values.city || 'all'}
            onValueChange={(val) => {
              onChange({ city: val, district: 'all' });
            }}
          >
            <SelectTrigger aria-label={t('filters.city')} className={FILTER_CONTROL_CLASS}>
              <div className="flex items-center gap-2 truncate text-slate-700">
                <Building className="size-3.5 text-slate-400 shrink-0" />
                <SelectValue placeholder={t('filters.allCities')} />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200">
              <SelectItem value="all">{t('filters.allCities')}</SelectItem>
              {Object.keys(CITY_DISTRICT_MAP).map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* District Filter (3 cols) */}
        <div className="lg:col-span-3">
          <Select
            value={values.district || 'all'}
            onValueChange={(val) => onChange({ district: val })}
          >
            <SelectTrigger aria-label={t('filters.district')} className={FILTER_CONTROL_CLASS}>
              <div className="flex items-center gap-2 truncate text-slate-700">
                <MapPin className="size-3.5 text-slate-400 shrink-0" />
                <SelectValue placeholder={t('filters.allDistricts')} />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200">
              <SelectItem value="all">{t('filters.allDistricts')}</SelectItem>
              {availableDistricts.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter (2 cols) */}
        <div className="lg:col-span-2">
          <Select
            value={values.status || 'all'}
            onValueChange={(val) => onChange({ status: val as 'all' | 'active' | 'inactive' })}
          >
            <SelectTrigger aria-label={t('filters.status')} className={FILTER_CONTROL_CLASS}>
              <SelectValue placeholder={t('filters.allStatuses')} />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200">
              <SelectItem value="all">{t('filters.allStatuses')}</SelectItem>
              <SelectItem value="active">{t('status.active')}</SelectItem>
              <SelectItem value="inactive">{t('status.inactive')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </FilterPanel>
  );
};
