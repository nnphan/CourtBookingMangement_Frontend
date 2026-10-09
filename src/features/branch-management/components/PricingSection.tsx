import React from 'react';
import {
  DollarSign,
  Plus,
  Trash2,
  Clock,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import {
  useFieldArray,
  type Control,
  type UseFormRegister,
  type FieldErrors,
  type UseFormSetValue,
  type UseFormWatch,
} from 'react-hook-form';
import { Button } from '@/components/ui/button';
import type { CreateBranchFormValues } from '../validators/createBranch.schema';
import type { PricingType } from '../types/branch.types';
import { cn } from '@/lib/utils';

interface PricingSectionProps {
  control: Control<CreateBranchFormValues>;
  register: UseFormRegister<CreateBranchFormValues>;
  setValue: UseFormSetValue<CreateBranchFormValues>;
  watch: UseFormWatch<CreateBranchFormValues>;
  errors: FieldErrors<CreateBranchFormValues>;
  disabled?: boolean;
}

const PRICING_TYPE_OPTIONS: { value: PricingType; label: string; badgeClass: string }[] = [
  { value: 'NORMAL', label: 'Giờ thường (NORMAL)', badgeClass: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'PEAK', label: 'Giờ cao điểm (PEAK)', badgeClass: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'WEEKEND', label: 'Cuối tuần (WEEKEND)', badgeClass: 'bg-purple-50 text-purple-700 border-purple-200' },
];

const DEFAULT_RECOMMENDED_PRICING = [
  {
    pricingType: 'NORMAL' as const,
    startTime: '05:00',
    endTime: '17:00',
    pricePerHour: 80000,
  },
  {
    pricingType: 'PEAK' as const,
    startTime: '17:00',
    endTime: '23:30',
    pricePerHour: 140000,
  },
  {
    pricingType: 'WEEKEND' as const,
    startTime: '05:30',
    endTime: '23:30',
    pricePerHour: 120000,
  },
];

export const PricingSection: React.FC<PricingSectionProps> = ({
  control,
  register,
  setValue,
  watch,
  errors,
  disabled = false,
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'branchPricings',
  });

  const pricingsWatch = watch('branchPricings') || [];

  const handleAddTier = () => {
    if (disabled) return;
    append({
      pricingType: 'NORMAL',
      startTime: '06:00',
      endTime: '17:00',
      pricePerHour: 100000,
    });
  };

  const handleApplyRecommended = () => {
    if (disabled) return;
    setValue('branchPricings', DEFAULT_RECOMMENDED_PRICING, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <DollarSign className="size-4.5 text-emerald-600" />
            Cấu hình bảng giá theo giờ
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              {fields.length} khung giá
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Thiết lập mức giá theo giờ cho ngày thường, giờ cao điểm và cuối tuần.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={handleApplyRecommended}
            className="rounded-xl border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/60 text-emerald-800 text-xs font-semibold"
          >
            <Sparkles className="size-3.5 mr-1.5 text-emerald-600" />
            Mẫu giá tiêu chuẩn
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={handleAddTier}
            className="rounded-xl border-slate-200 text-xs font-semibold hover:bg-slate-50"
          >
            <Plus className="size-4 mr-1 text-emerald-600" />
            Thêm khung giá
          </Button>
        </div>
      </div>

      {fields.length === 0 ? (
        <div className="p-8 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50">
          <DollarSign className="size-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">Chưa có bảng giá nào</p>
          <p className="text-xs text-slate-500 mt-1">
            Chi nhánh cần ít nhất 1 khung giá giờ để tính phí đặt sân.
          </p>
          <Button
            type="button"
            size="sm"
            onClick={handleAddTier}
            className="mt-4 rounded-xl text-xs font-semibold"
          >
            <Plus className="size-4 mr-1.5" />
            Thêm khung giá đầu tiên
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {fields.map((field, index) => {
            const pricingItem = pricingsWatch[index];
            const tierError = errors.branchPricings?.[index];
            const currentType = pricingItem?.pricingType || 'NORMAL';
            const typeConfig = PRICING_TYPE_OPTIONS.find((t) => t.value === currentType);

            return (
              <div
                key={field.id}
                className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs hover:border-slate-300 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="size-6 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">
                      #{index + 1}
                    </span>
                    <span
                      className={cn(
                        'text-xs font-bold px-2.5 py-0.5 rounded-full border',
                        typeConfig?.badgeClass || 'bg-slate-100 text-slate-700 border-slate-200',
                      )}
                    >
                      {typeConfig?.label || currentType}
                    </span>
                  </div>

                  {fields.length > 1 && (
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => remove(index)}
                      title="Xóa khung giá này"
                      className="size-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Pricing Type */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Loại khung giá <span className="text-rose-500">*</span>
                    </label>
                    <select
                      disabled={disabled}
                      {...register(`branchPricings.${index}.pricingType`)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                    >
                      {PRICING_TYPE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Start Time */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <Clock className="size-3 text-slate-400" />
                      Giờ bắt đầu <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="time"
                      disabled={disabled}
                      {...register(`branchPricings.${index}.startTime`)}
                      className={cn(
                        'w-full h-10 px-3 rounded-xl border bg-white text-xs font-semibold text-slate-800 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20',
                        tierError?.startTime ? 'border-rose-400' : 'border-slate-300',
                      )}
                    />
                  </div>

                  {/* End Time */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <Clock className="size-3 text-slate-400" />
                      Giờ kết thúc <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="time"
                      disabled={disabled}
                      {...register(`branchPricings.${index}.endTime`)}
                      className={cn(
                        'w-full h-10 px-3 rounded-xl border bg-white text-xs font-semibold text-slate-800 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20',
                        tierError?.endTime ? 'border-rose-400' : 'border-slate-300',
                      )}
                    />
                  </div>

                  {/* Price Per Hour */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <DollarSign className="size-3 text-emerald-600" />
                      Giá / giờ (VND) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step={5000}
                        min={1000}
                        disabled={disabled}
                        {...register(`branchPricings.${index}.pricePerHour`, { valueAsNumber: true })}
                        placeholder="80000"
                        className={cn(
                          'w-full h-10 pl-3 pr-12 rounded-xl border bg-white text-xs font-bold text-slate-800 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20',
                          tierError?.pricePerHour ? 'border-rose-400' : 'border-slate-300',
                        )}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                        đ/giờ
                      </span>
                    </div>
                  </div>
                </div>

                {/* Inline error */}
                {(tierError?.endTime || tierError?.pricePerHour) && (
                  <div className="flex items-center gap-1.5 text-xs text-rose-600 font-medium">
                    <AlertCircle className="size-3.5 shrink-0" />
                    <span>{tierError.endTime?.message || tierError.pricePerHour?.message}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
