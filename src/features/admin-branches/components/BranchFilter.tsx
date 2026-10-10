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
import type { BranchFilterValues } from '../types/branch-admin.types';

export interface BranchFilterProps {
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

export const BranchFilter: React.FC<BranchFilterProps> = ({ values, onChange, onReset }) => {
  const { t } = useTranslation('branch');

  const availableDistricts = useMemo(() => {
    if (values.city && values.city !== 'all') {
      return CITY_DISTRICT_MAP[values.city] || [];
    }
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
      title={t('filters.title', 'Bộ lọc & Tìm kiếm')}
      resetLabel={t('filters.reset', 'Xóa bộ lọc')}
      onReset={hasActiveFilters ? onReset : undefined}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
        {/* Keyword Search */}
        <div className="lg:col-span-4">
          <FilterSearchInput
            value={values.keyword}
            onChange={(keyword) => onChange({ keyword })}
            placeholder={t('filters.search', 'Tìm kiếm theo tên chi nhánh...')}
            aria-label={t('filters.search', 'Tìm kiếm theo tên chi nhánh...')}
          />
        </div>

        {/* City Filter */}
        <div className="lg:col-span-3">
          <Select
            value={values.city || 'all'}
            onValueChange={(val) => {
              onChange({ city: val, district: 'all' });
            }}
          >
            <SelectTrigger aria-label={t('filters.city', 'Thành phố')} className={FILTER_CONTROL_CLASS}>
              <div className="flex items-center gap-2 truncate text-slate-700">
                <Building className="size-3.5 text-slate-400 shrink-0" />
                <SelectValue placeholder={t('filters.allCities', 'Tất cả thành phố')} />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200">
              <SelectItem value="all">{t('filters.allCities', 'Tất cả thành phố')}</SelectItem>
              {Object.keys(CITY_DISTRICT_MAP).map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* District Filter */}
        <div className="lg:col-span-3">
          <Select
            value={values.district || 'all'}
            onValueChange={(val) => onChange({ district: val })}
          >
            <SelectTrigger aria-label={t('filters.district', 'Quận/Huyện')} className={FILTER_CONTROL_CLASS}>
              <div className="flex items-center gap-2 truncate text-slate-700">
                <MapPin className="size-3.5 text-slate-400 shrink-0" />
                <SelectValue placeholder={t('filters.allDistricts', 'Tất cả quận/huyện')} />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200">
              <SelectItem value="all">{t('filters.allDistricts', 'Tất cả quận/huyện')}</SelectItem>
              {availableDistricts.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className="lg:col-span-2">
          <Select
            value={values.status || 'all'}
            onValueChange={(val) => onChange({ status: val as 'all' | 'active' | 'inactive' })}
          >
            <SelectTrigger aria-label={t('filters.status', 'Trạng thái')} className={FILTER_CONTROL_CLASS}>
              <SelectValue placeholder={t('filters.allStatuses', 'Tất cả trạng thái')} />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200">
              <SelectItem value="all">{t('filters.allStatuses', 'Tất cả trạng thái')}</SelectItem>
              <SelectItem value="active">{t('status.active', 'Hoạt động')}</SelectItem>
              <SelectItem value="inactive">{t('status.inactive', 'Ngưng hoạt động')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </FilterPanel>
  );
};
