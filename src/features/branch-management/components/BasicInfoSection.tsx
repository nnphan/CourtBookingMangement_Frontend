import React from 'react';
import {
  Building2,
  Phone,
  MapPin,
  Compass,
  FileText,
  Zap,
  Globe,
} from 'lucide-react';
import type { UseFormRegister, FieldErrors, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import type { CreateBranchFormValues } from '../validators/createBranch.schema';
import { cn } from '@/lib/utils';

interface BasicInfoSectionProps {
  register: UseFormRegister<CreateBranchFormValues>;
  setValue: UseFormSetValue<CreateBranchFormValues>;
  watch: UseFormWatch<CreateBranchFormValues>;
  errors: FieldErrors<CreateBranchFormValues>;
  disabled?: boolean;
}

const PRESET_CITIES = ['Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Bình Dương', 'Cần Thơ', 'Hải Phòng'];

const CITY_DISTRICT_MAP: Record<string, string[]> = {
  'Hồ Chí Minh': [
    'Quận 1',
    'Quận 3',
    'Quận 5',
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
    'Đống Đa',
    'Ba Đình',
    'Hai Bà Trưng',
    'Thanh Xuân',
    'Tây Hồ',
    'Nam Từ Liêm',
    'Bắc Từ Liêm',
    'Hoàn Kiếm',
  ],
  'Đà Nẵng': ['Hải Châu', 'Thanh Khê', 'Sơn Trà', 'Ngũ Hành Sơn', 'Liên Chiểu', 'Cẩm Lệ'],
  'Bình Dương': ['Thủ Dầu Một', 'Thuận An', 'Dĩ An', 'Bến Cát', 'Tân Uyên'],
  'Cần Thơ': ['Ninh Kiều', 'Cái Răng', 'Bình Thủy', 'Ô Môn'],
  'Hải Phòng': ['Hồng Bàng', 'Ngô Quyền', 'Lê Chân', 'Hải An'],
};

export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  register,
  setValue,
  watch,
  errors,
  disabled = false,
}) => {
  const selectedCity = watch('city');

  const availableDistricts = React.useMemo(() => {
    return CITY_DISTRICT_MAP[selectedCity] || [
      'Quận 1',
      'Quận 3',
      'Quận 7',
      'Bình Thạnh',
      'Cầu Giấy',
      'Hải Châu',
    ];
  }, [selectedCity]);

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const city = e.target.value;
    setValue('city', city, { shouldValidate: true, shouldDirty: true });
    const districts = CITY_DISTRICT_MAP[city];
    if (districts && districts.length > 0) {
      setValue('district', districts[0] || '', { shouldValidate: true, shouldDirty: true });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
          <Building2 className="size-4.5 text-emerald-600" />
          Thông tin cơ sở & Địa chỉ
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Nhập các thông tin cơ bản về tên sân, liên hệ và địa chỉ định vị chi nhánh.
        </p>
      </div>

      <div className="space-y-4">
        {/* Row 1: Name & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Building2 className="size-3.5 text-slate-400" />
              Tên chi nhánh <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              disabled={disabled}
              {...register('name')}
              placeholder="VD: ALOBO Arena Badminton - Chi nhánh Quận 7"
              className={cn(
                'w-full h-11 px-3.5 rounded-xl border bg-white text-sm font-semibold text-slate-800 transition-all outline-none',
                'focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20',
                errors.name ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300',
              )}
            />
            {errors.name && (
              <p className="text-xs text-rose-600 font-medium mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Phone className="size-3.5 text-slate-400" />
              Số điện thoại liên hệ <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              disabled={disabled}
              {...register('phoneNumber')}
              placeholder="VD: 0901 234 567"
              className={cn(
                'w-full h-11 px-3.5 rounded-xl border bg-white text-sm font-semibold text-slate-800 transition-all outline-none',
                'focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20',
                errors.phoneNumber ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300',
              )}
            />
            {errors.phoneNumber && (
              <p className="text-xs text-rose-600 font-medium mt-1">
                {errors.phoneNumber.message}
              </p>
            )}
          </div>
        </div>

        {/* Row 2: City & District */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <MapPin className="size-3.5 text-slate-400" />
              Tỉnh / Thành phố <span className="text-rose-500">*</span>
            </label>
            <select
              disabled={disabled}
              value={selectedCity}
              onChange={handleCityChange}
              className={cn(
                'w-full h-11 px-3.5 rounded-xl border bg-white text-sm font-semibold text-slate-800 transition-all outline-none',
                'focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20',
                errors.city ? 'border-rose-400' : 'border-slate-300',
              )}
            >
              {PRESET_CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {errors.city && (
              <p className="text-xs text-rose-600 font-medium mt-1">{errors.city.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Compass className="size-3.5 text-slate-400" />
              Quận / Huyện <span className="text-rose-500">*</span>
            </label>
            <select
              disabled={disabled}
              {...register('district')}
              className={cn(
                'w-full h-11 px-3.5 rounded-xl border bg-white text-sm font-semibold text-slate-800 transition-all outline-none',
                'focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20',
                errors.district ? 'border-rose-400' : 'border-slate-300',
              )}
            >
              {availableDistricts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            {errors.district && (
              <p className="text-xs text-rose-600 font-medium mt-1">{errors.district.message}</p>
            )}
          </div>
        </div>

        {/* Row 3: Street Address */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <MapPin className="size-3.5 text-slate-400" />
            Địa chỉ chi tiết <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            disabled={disabled}
            {...register('address')}
            placeholder="VD: Số 123 Nguyễn Thị Thập, Phường Tân Quy"
            className={cn(
              'w-full h-11 px-3.5 rounded-xl border bg-white text-sm font-semibold text-slate-800 transition-all outline-none',
              'focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20',
              errors.address ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300',
            )}
          />
          {errors.address && (
            <p className="text-xs text-rose-600 font-medium mt-1">{errors.address.message}</p>
          )}
        </div>

        {/* Row 4: Coordinates & Timezone */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Vĩ độ (Latitude)</label>
            <input
              type="number"
              step="any"
              disabled={disabled}
              {...register('latitude', { valueAsNumber: true })}
              placeholder="10.7303"
              className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 outline-none focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Kinh độ (Longitude)</label>
            <input
              type="number"
              step="any"
              disabled={disabled}
              {...register('longitude', { valueAsNumber: true })}
              placeholder="106.7072"
              className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 outline-none focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
              <Globe className="size-3 text-slate-400" />
              Múi giờ (TimeZone)
            </label>
            <input
              type="text"
              disabled={disabled}
              {...register('timeZone')}
              className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-slate-50 text-xs font-semibold text-slate-800 outline-none"
            />
          </div>
        </div>

        {/* Row 5: Instant Booking Switch */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Zap className="size-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Cho phép đặt sân tức thì (Instant Booking)</p>
              <p className="text-[11px] text-slate-500">
                Khách hàng có thể xác nhận đặt lịch tự động mà không cần chờ duyệt thủ công.
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              disabled={disabled}
              {...register('supportsInstantBooking')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        {/* Row 6: Description */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <FileText className="size-3.5 text-slate-400" />
            Mô tả giới thiệu chi nhánh
          </label>
          <textarea
            rows={3}
            disabled={disabled}
            {...register('description')}
            placeholder="Giới thiệu về cơ sở vật chất, loại thảm thi đấu, dịch vụ căn tin, bãi đỗ xe ô tô/xe máy..."
            className="w-full p-3 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-800 transition-all outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 resize-none"
          />
        </div>
      </div>
    </div>
  );
};
