import React, { memo } from 'react';
import { Controller, type Control, type FieldErrors, type UseFormRegister } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Clock, User, Crown, Sparkles } from 'lucide-react';
import type { Customer } from '@/features/customer-management/types/customer';
import { CustomerSearchInput } from './CustomerSearchInput';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { CourtItem } from '../types/court';
import { BOOKING_TYPE_OPTIONS } from '../constants/booking.constants';
import type { CreateBookingSchemaType } from '@/features/bookings/schemas/create-booking.schema';

export interface BookingFormProps {
  register: UseFormRegister<CreateBookingSchemaType>;
  control: Control<CreateBookingSchemaType>;
  errors: FieldErrors<CreateBookingSchemaType>;
  courts: CourtItem[];
  selectedCustomer: Customer | null;
  onSelectCustomer: (customer: Customer) => void;
  onDeselectCustomer: () => void;
  onConvertGuest?: () => void;
  isEditing?: boolean;
  formattedDisplayDate: string;
  durationDisplayText?: string;
}

export const BookingForm: React.FC<BookingFormProps> = memo(
  ({
    register,
    control,
    errors,
    courts,
    selectedCustomer,
    onSelectCustomer,
    onDeselectCustomer,
    onConvertGuest,
    isEditing = false,
    formattedDisplayDate,
    durationDisplayText,
  }) => {
    const { t } = useTranslation();

    return (
      <div className="space-y-4 py-2">
        {/* Customer Search & Selection */}
        {!isEditing && (
          <div className="space-y-2 p-3 bg-slate-50/80 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <User className="size-3.5 text-emerald-600" />
                <span>{t('courtStatus.fields.customerSearch', 'Tìm & Chọn Khách Hàng')}</span>
              </label>

              {selectedCustomer && (
                <button
                  type="button"
                  onClick={onDeselectCustomer}
                  className="text-[11px] text-slate-500 hover:text-slate-800 underline cursor-pointer"
                >
                  Bỏ chọn
                </button>
              )}
            </div>

            <CustomerSearchInput
              onSelectCustomer={onSelectCustomer}
              placeholder="Gõ SĐT (0909...), Tên hoặc Mã KH để tìm nhanh..."
            />

            {/* Customer Status & Tier Pill */}
            {selectedCustomer ? (
              <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-lg bg-white border border-slate-200 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{selectedCustomer.fullName}</span>
                  <span className="font-mono text-slate-500">({selectedCustomer.phoneNumber})</span>
                  {selectedCustomer.isGuest ? (
                    <span className="text-[10px] bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded font-medium border border-amber-200">
                      Khách vãng lai
                    </span>
                  ) : (
                    <span className="text-[10px] bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded font-bold border border-emerald-200 flex items-center gap-1">
                      <Crown className="size-2.5" />
                      Hội viên: {selectedCustomer.memberType?.toUpperCase() || 'MEMBER'}
                    </span>
                  )}
                </div>

                {selectedCustomer.isGuest && onConvertGuest && (
                  <button
                    type="button"
                    onClick={onConvertGuest}
                    className="text-[11px] font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 underline cursor-pointer"
                  >
                    <Sparkles className="size-3" />
                    Chuyển sang hội viên
                  </button>
                )}
              </div>
            ) : (
              <p className="text-[11px] text-slate-500">
                💡 Chọn từ danh sách gợi ý hoặc nhập thông tin bên dưới cho khách vãng lai.
              </p>
            )}
          </div>
        )}

        {/* Customer Name */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">
            {t('courtStatus.fields.customerName', 'Tên khách hàng (*)')}
          </label>
          <input
            type="text"
            placeholder="Ví dụ: Coach Hiếu, Nguyễn Văn A..."
            {...register('customerName')}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
          />
          {errors.customerName && (
            <p className="text-[11px] text-red-500">{errors.customerName.message}</p>
          )}
        </div>

        {/* Phone Number */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">
            {t('courtStatus.fields.phoneNumber', 'Số điện thoại (*)')}
          </label>
          <input
            type="tel"
            placeholder="0903xxxxxx"
            {...register('phoneNumber')}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none font-mono"
          />
          {errors.phoneNumber && (
            <p className="text-[11px] text-red-500">{errors.phoneNumber.message}</p>
          )}
        </div>

        {/* Court Selection (Read-Only: pre-filled from scheduler) */}
        <div className="space-y-1">
          <label className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>{t('courtStatus.fields.court', 'Chọn sân')}</span>
          </label>
          <Controller
            control={control}
            name="courtId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange} disabled>
                <SelectTrigger className="w-full border-slate-200 bg-slate-100 text-slate-700 select-none disabled:opacity-100 disabled:bg-slate-100 disabled:text-slate-700 shadow-none focus:ring-0">
                  <SelectValue placeholder={t('courtStatus.fields.court', 'Chọn sân')} />
                </SelectTrigger>
                <SelectContent>
                  {courts.map((court) => (
                    <SelectItem key={court.id} value={court.id}>
                      {court.name} - {(court.pricePerHour ?? 100000).toLocaleString('vi-VN')} đ/giờ
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.courtId && <p className="text-[11px] text-red-500">{errors.courtId.message}</p>}
        </div>

        {/* Date (Read-Only: pre-filled from scheduler, displayed as dd-MM-yyyy) */}
        <div className="space-y-1">
          <label className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>{t('courtStatus.fields.date', 'Ngày đặt sân')}</span>
          </label>
          <input type="hidden" {...register('bookingDate')} />
          <input
            type="text"
            value={formattedDisplayDate}
            readOnly
            tabIndex={-1}
            placeholder="dd-MM-yyyy"
            className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-700 select-none focus:outline-none cursor-not-allowed"
          />
          {errors.bookingDate && (
            <p className="text-[11px] text-red-500">{errors.bookingDate.message}</p>
          )}
        </div>

        {/* Time range (start time & end time: Read-Only from scheduler selection) */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>{t('courtStatus.fields.startTime', 'Giờ bắt đầu')}</span>
            </label>
            <input
              type="text"
              placeholder="13:00"
              {...register('startTime')}
              readOnly
              tabIndex={-1}
              className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-700 cursor-not-allowed select-none focus:outline-none"
            />
            {errors.startTime && (
              <p className="text-[11px] text-red-500">{errors.startTime.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>{t('courtStatus.fields.endTime', 'Giờ kết thúc')}</span>
            </label>
            <input
              type="text"
              placeholder="15:00"
              {...register('endTime')}
              readOnly
              tabIndex={-1}
              className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-700 cursor-not-allowed select-none focus:outline-none"
            />
            {errors.endTime && <p className="text-[11px] text-red-500">{errors.endTime.message}</p>}
          </div>
        </div>

        {/* Duration (Auto-calculated, Readonly) */}
        {durationDisplayText && (
          <div className="flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 border border-emerald-200 shadow-xs">
            <div className="flex items-center gap-1.5">
              <Clock className="size-3.5 text-emerald-600" />
              <span>Thời lượng đặt sân:</span>
            </div>
            <span className="font-bold text-emerald-700">
              {durationDisplayText}
            </span>
          </div>
        )}

        {/* Booking Type */}
        <div className="space-y-1">
          <label htmlFor="booking-type-select" className="text-xs font-semibold text-slate-700">
            {t('courtStatus.fields.bookingType', 'Loại đặt sân')}{' '}
            <span className="text-red-500">*</span>
          </label>
          <Controller
            control={control}
            name="bookingType"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="booking-type-select" className="w-full">
                  <SelectValue placeholder="Chọn loại đặt sân" />
                </SelectTrigger>
                <SelectContent>
                  {BOOKING_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.bookingType && (
            <p className="text-xs text-red-500">{errors.bookingType.message}</p>
          )}
        </div>

        {/* Notes */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">
            {t('courtStatus.fields.notes', 'Ghi chú thêm')}
          </label>
          <textarea
            rows={2}
            placeholder="Ví dụ: Khách mượn cầu, đặt trước nước uống..."
            {...register('note')}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
          />
        </div>
      </div>
    );
  },
);

BookingForm.displayName = 'BookingForm';
