import React from 'react';
import {
  Grid3X3,
  Plus,
  Trash2,
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
import { cn } from '@/lib/utils';

interface CourtsSectionProps {
  control: Control<CreateBranchFormValues>;
  register: UseFormRegister<CreateBranchFormValues>;
  setValue: UseFormSetValue<CreateBranchFormValues>;
  watch: UseFormWatch<CreateBranchFormValues>;
  errors: FieldErrors<CreateBranchFormValues>;
  disabled?: boolean;
}

export const CourtsSection: React.FC<CourtsSectionProps> = ({
  control,
  register,
  setValue,
  watch,
  errors,
  disabled = false,
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'courts',
  });

  const courtsWatch = watch('courts');

  // Check duplicate court numbers
  const duplicateNumbers = React.useMemo(() => {
    const counts = new Map<number, number>();
    const list = courtsWatch || [];
    list.forEach((c) => {
      const num = Number(c.courtNumber);
      if (!isNaN(num)) {
        counts.set(num, (counts.get(num) || 0) + 1);
      }
    });
    const dupes = new Set<number>();
    counts.forEach((count, num) => {
      if (count > 1) dupes.add(num);
    });
    return dupes;
  }, [courtsWatch]);

  const handleAddCourt = () => {
    if (disabled) return;
    // Find next available court number
    const list = courtsWatch || [];
    const existingNumbers = list.map((c) => Number(c.courtNumber)).filter((n) => !isNaN(n));
    const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
    append({
      courtNumber: nextNumber,
      name: `Sân ${String(nextNumber).padStart(2, '0')}`,
      isActive: true,
    });
  };

  const handlePresetCourts = (count: number) => {
    if (disabled) return;
    const newCourts = Array.from({ length: count }, (_, i) => ({
      courtNumber: i + 1,
      name: `Sân ${String(i + 1).padStart(2, '0')}`,
      isActive: true,
    }));
    setValue('courts', newCourts, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Grid3X3 className="size-4.5 text-emerald-600" />
            Danh sách sân thi đấu
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              {fields.length} sân
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Cấu hình số thứ tự sân (duy nhất), tên gọi hiển thị và trạng thái kích hoạt.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl">
            <span className="text-[11px] font-medium text-slate-500 px-2">Tạo nhanh:</span>
            <button
              type="button"
              disabled={disabled}
              onClick={() => handlePresetCourts(4)}
              className="text-[11px] font-bold px-2 py-1 rounded-lg bg-white shadow-2xs hover:text-emerald-700 text-slate-700 transition-colors"
            >
              4 sân
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => handlePresetCourts(6)}
              className="text-[11px] font-bold px-2 py-1 rounded-lg bg-white shadow-2xs hover:text-emerald-700 text-slate-700 transition-colors"
            >
              6 sân
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => handlePresetCourts(8)}
              className="text-[11px] font-bold px-2 py-1 rounded-lg bg-white shadow-2xs hover:text-emerald-700 text-slate-700 transition-colors"
            >
              8 sân
            </button>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={handleAddCourt}
            className="rounded-xl border-slate-200 text-xs font-semibold hover:bg-slate-50"
          >
            <Plus className="size-4 mr-1 text-emerald-600" />
            Thêm sân mới
          </Button>
        </div>
      </div>

      {duplicateNumbers.size > 0 && (
        <div className="flex items-center gap-2 p-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-xs">
          <AlertCircle className="size-4 text-rose-600 shrink-0" />
          <span>
            Phát hiện số thứ tự sân bị trùng lặp:{' '}
            <strong className="underline">{Array.from(duplicateNumbers).join(', ')}</strong>. Vui lòng đảm bảo mỗi sân có số thứ tự duy nhất!
          </span>
        </div>
      )}

      {fields.length === 0 ? (
        <div className="p-8 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50">
          <Grid3X3 className="size-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">Chưa có sân nào được thêm</p>
          <p className="text-xs text-slate-500 mt-1">
            Chi nhánh cần tối thiểu 1 sân để phục vụ khách đặt lịch.
          </p>
          <Button
            type="button"
            size="sm"
            onClick={handleAddCourt}
            className="mt-4 rounded-xl text-xs font-semibold"
          >
            <Plus className="size-4 mr-1.5" />
            Thêm sân đầu tiên
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {fields.map((field, index) => {
            const currentNumber = Number(courtsWatch[index]?.courtNumber);
            const isDupe = duplicateNumbers.has(currentNumber);
            const isActive = courtsWatch[index]?.isActive;
            const courtError = errors.courts?.[index];

            return (
              <div
                key={field.id}
                className={cn(
                  'p-4 rounded-2xl border bg-white shadow-2xs transition-all duration-150 space-y-3',
                  isDupe
                    ? 'border-rose-400 ring-2 ring-rose-300/30'
                    : 'border-slate-200 hover:border-slate-300',
                  !isActive && 'bg-slate-50/70 border-dashed',
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="size-6 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">
                      #{index + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      Cấu hình sân {index + 1}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Active toggle */}
                    <label
                      title="Trạng thái sân"
                      className={cn(
                        'flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-semibold cursor-pointer select-none transition-colors',
                        isActive
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-400',
                      )}
                    >
                      <input
                        type="checkbox"
                        disabled={disabled}
                        {...register(`courts.${index}.isActive`)}
                        className="size-3.5 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                      />
                      <span>{isActive ? 'Hoạt động' : 'Tắt'}</span>
                    </label>

                    {/* Delete button */}
                    {fields.length > 1 && (
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() => remove(index)}
                        title="Xóa sân này"
                        className="size-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-2.5">
                  {/* Court Number */}
                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Số thứ tự <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      disabled={disabled}
                      {...register(`courts.${index}.courtNumber`, { valueAsNumber: true })}
                      placeholder="1"
                      className={cn(
                        'w-full h-9 px-2.5 rounded-xl border bg-white text-xs font-bold text-slate-800 outline-none transition-all',
                        'focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20',
                        isDupe || courtError?.courtNumber ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300',
                      )}
                    />
                  </div>

                  {/* Court Name */}
                  <div className="col-span-3">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Tên hiển thị <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      disabled={disabled}
                      {...register(`courts.${index}.name`)}
                      placeholder="VD: Sân 01"
                      className={cn(
                        'w-full h-9 px-2.5 rounded-xl border bg-white text-xs font-semibold text-slate-800 outline-none transition-all',
                        'focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20',
                        courtError?.name ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300',
                      )}
                    />
                  </div>
                </div>

                {(courtError?.name || courtError?.courtNumber) && (
                  <p className="text-[11px] font-medium text-rose-600">
                    {courtError.name?.message || courtError.courtNumber?.message}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
