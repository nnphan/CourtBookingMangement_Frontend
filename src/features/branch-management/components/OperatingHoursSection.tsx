import React from 'react';
import { Clock, Moon, Sun, AlertCircle } from 'lucide-react';
import type { UseFormRegister, FieldErrors, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import type { CreateBranchFormValues } from '../validators/createBranch.schema';
import { cn } from '@/lib/utils';

interface OperatingHoursSectionProps {
  register: UseFormRegister<CreateBranchFormValues>;
  setValue: UseFormSetValue<CreateBranchFormValues>;
  watch: UseFormWatch<CreateBranchFormValues>;
  errors: FieldErrors<CreateBranchFormValues>;
  disabled?: boolean;
}

const PRESET_HOURS = [
  { label: '05:30 - 23:30 (Chuẩn)', open: '05:30', close: '23:30' },
  { label: '06:00 - 22:00 (Sớm)', open: '06:00', close: '22:00' },
  { label: '07:00 - 23:00 (Tối muộn)', open: '07:00', close: '23:00' },
  { label: '05:00 - 00:00 (Mở rộng)', open: '05:00', close: '23:59' },
];

export const OperatingHoursSection: React.FC<OperatingHoursSectionProps> = ({
  register,
  setValue,
  watch,
  errors,
  disabled = false,
}) => {
  const isClosed = watch('operatingHours.0.isClosed');
  const openTime = watch('operatingHours.0.openTime');
  const closeTime = watch('operatingHours.0.closeTime');
  const hourError = errors.operatingHours?.[0]?.closeTime?.message || errors.operatingHours?.[0]?.openTime?.message;

  const applyPreset = (presetOpen: string, presetClose: string) => {
    if (disabled) return;
    setValue('operatingHours.0.openTime', presetOpen, { shouldValidate: true, shouldDirty: true });
    setValue('operatingHours.0.closeTime', presetClose, { shouldValidate: true, shouldDirty: true });
    setValue('operatingHours.0.isClosed', false, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Clock className="size-4.5 text-emerald-600" />
            Khung giờ hoạt động chi nhánh
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Quy định giờ mở cửa và đóng cửa mỗi ngày của cơ sở. Áp dụng cho lịch đặt sân của khách hàng.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-medium text-slate-400 mr-1">Mẫu nhanh:</span>
          {PRESET_HOURS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              disabled={disabled}
              onClick={() => applyPreset(preset.open, preset.close)}
              className="text-[11px] font-semibold px-2 py-1 rounded-lg border border-slate-200 bg-white hover:bg-emerald-50 hover:border-emerald-300 text-slate-700 hover:text-emerald-800 transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-end">
          {/* Open Time */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Sun className="size-3.5 text-amber-500" />
              Giờ mở cửa (Open Time) <span className="text-rose-500">*</span>
            </label>
            <input
              type="time"
              disabled={disabled || isClosed}
              {...register('operatingHours.0.openTime')}
              className={cn(
                'w-full h-11 px-3.5 rounded-xl border bg-white text-sm font-semibold text-slate-800 transition-all outline-none',
                'focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20',
                errors.operatingHours?.[0]?.openTime ? 'border-rose-400' : 'border-slate-300',
                isClosed && 'bg-slate-100 text-slate-400 cursor-not-allowed',
              )}
            />
          </div>

          {/* Close Time */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Moon className="size-3.5 text-indigo-500" />
              Giờ đóng cửa (Close Time) <span className="text-rose-500">*</span>
            </label>
            <input
              type="time"
              disabled={disabled || isClosed}
              {...register('operatingHours.0.closeTime')}
              className={cn(
                'w-full h-11 px-3.5 rounded-xl border bg-white text-sm font-semibold text-slate-800 transition-all outline-none',
                'focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20',
                errors.operatingHours?.[0]?.closeTime ? 'border-rose-400' : 'border-slate-300',
                isClosed && 'bg-slate-100 text-slate-400 cursor-not-allowed',
              )}
            />
          </div>

          {/* isClosed Checkbox */}
          <div className="sm:col-span-2 md:col-span-1">
            <label
              className={cn(
                'flex items-center gap-3 h-11 px-3.5 rounded-xl border transition-all cursor-pointer select-none',
                isClosed
                  ? 'border-amber-400 bg-amber-50/80 text-amber-900 font-bold'
                  : 'border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium',
                disabled && 'opacity-60 cursor-not-allowed',
              )}
            >
              <input
                type="checkbox"
                disabled={disabled}
                {...register('operatingHours.0.isClosed')}
                className="size-4.5 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
              />
              <div className="text-xs">
                <span className="font-bold">Đóng cửa / Tạm nghỉ</span>
                <span className="block text-[11px] text-slate-500 font-normal">
                  Chi nhánh tạm dừng đón khách
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Status preview pill */}
        <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/80">
          <span className="text-slate-500">Trạng thái phục vụ:</span>
          {isClosed ? (
            <span className="font-bold text-amber-700 bg-amber-100/70 px-2.5 py-0.5 rounded-md">
              Đang đóng cửa
            </span>
          ) : (
            <span className="font-bold text-emerald-800 bg-emerald-100/70 px-2.5 py-0.5 rounded-md">
              Mở cửa từ {openTime || '--:--'} đến {closeTime || '--:--'} hằng ngày
            </span>
          )}
        </div>

        {hourError && (
          <div className="flex items-center gap-1.5 text-xs text-rose-600 font-medium">
            <AlertCircle className="size-4 shrink-0" />
            <span>{hourError}</span>
          </div>
        )}
      </div>
    </div>
  );
};
