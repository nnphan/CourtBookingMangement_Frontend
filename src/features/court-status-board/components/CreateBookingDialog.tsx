import React, { memo, useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import type { CourtItem } from '../types/court';
import type { BookingItem, BookingType, PaymentStatus } from '../types/booking';
import { COURT_BOOKING_STATUSES } from '../constants/booking-status';
import { SchedulerService } from '../services/scheduler.service';

const bookingSchema = z.object({
  customerName: z.string().min(2, 'Họ và tên khách hàng ít nhất 2 ký tự'),
  phoneNumber: z
    .string()
    .min(9, 'Số điện thoại gồm 9-10 chữ số')
    .regex(/^[0-9+]+$/, 'Số điện thoại không hợp lệ'),
  courtId: z.string().min(1, 'Vui lòng chọn sân'),
  date: z.string().min(1, 'Vui lòng chọn ngày'),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Giờ bắt đầu không hợp lệ (HH:mm)'),
  endTime: z.string().regex(/^([01]\d|2[0-4]):([0-5]\d)$/, 'Giờ kết thúc không hợp lệ (HH:mm)'),
  bookingType: z.enum([
    'recurring',
    'daily',
    'flexible',
    'event',
    'deposit_pending',
    'maintenance',
  ]),
  notes: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

interface CreateBookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  courts: CourtItem[];
  defaultValues?: {
    courtId?: string;
    courtName?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
  } | null;
  editingBooking?: BookingItem | null;
  onSubmitBooking: (data: Partial<BookingItem>) => Promise<unknown>;
  isLoading?: boolean;
}

export const CreateBookingDialog: React.FC<CreateBookingDialogProps> = memo(
  ({
    isOpen,
    onClose,
    courts,
    defaultValues,
    editingBooking,
    onSubmitBooking,
    isLoading = false,
  }) => {
    const { t } = useTranslation();

    const {
      register,
      control,
      handleSubmit,
      reset,
      watch,
      formState: { errors },
    } = useForm<BookingFormValues>({
      resolver: zodResolver(bookingSchema),
      defaultValues: {
        customerName: '',
        phoneNumber: '',
        courtId: courts[0]?.id ?? 'court-1',
        date: '2026-08-15',
        startTime: '08:00',
        endTime: '10:00',
        bookingType: 'daily',
        notes: '',
      },
    });

    const watchedStart = watch('startTime');
    const watchedEnd = watch('endTime');

    const durationInfo = useMemo(() => {
      if (watchedStart && watchedEnd) {
        return SchedulerService.calculateDuration(watchedStart, watchedEnd);
      }
      return null;
    }, [watchedStart, watchedEnd]);

    useEffect(() => {
      if (isOpen) {
        if (editingBooking) {
          reset({
            customerName: editingBooking.customerName,
            phoneNumber: editingBooking.phoneNumber,
            courtId: editingBooking.courtId,
            date: editingBooking.date,
            startTime: editingBooking.startTime,
            endTime: editingBooking.endTime,
            bookingType: editingBooking.bookingType,
            notes: editingBooking.notes ?? '',
          });
        } else if (defaultValues) {
          // If startTime is provided, compute a 1-hour or 2-hour default end time
          let calculatedEndTime = defaultValues.endTime;
          if (!calculatedEndTime && defaultValues.startTime) {
            const startMin = SchedulerService.parseTimeToMinutes(defaultValues.startTime);
            calculatedEndTime = SchedulerService.minutesToTime(Math.min(24 * 60, startMin + 60));
          }

          reset({
            customerName: '',
            phoneNumber: '',
            courtId: defaultValues.courtId ?? courts[0]?.id ?? 'court-1',
            date: defaultValues.date ?? '2026-08-15',
            startTime: defaultValues.startTime ?? '08:00',
            endTime: calculatedEndTime ?? '10:00',
            bookingType: 'daily',
            notes: '',
          });
        }
      }
    }, [isOpen, defaultValues, editingBooking, courts, reset]);

    const onSubmit = async (values: BookingFormValues) => {
      const selectedCourt = courts.find((c) => c.id === values.courtId);
      const courtName = selectedCourt?.name ?? 'Sân';

      const payload: Partial<BookingItem> = {
        courtId: values.courtId,
        courtName,
        customerName: values.customerName,
        phoneNumber: values.phoneNumber,
        date: values.date,
        startTime: values.startTime,
        endTime: values.endTime,
        bookingType: values.bookingType as BookingType,
        notes: values.notes,
        paymentStatus: (editingBooking?.paymentStatus ?? 'unpaid') as PaymentStatus,
      };

      if (editingBooking) {
        payload.id = editingBooking.id;
      }

      await onSubmitBooking(payload);
      onClose();
    };

    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingBooking
                ? t('courtStatus.dialog.editTitle', 'Chỉnh sửa lịch đặt sân')
                : t('courtStatus.dialog.createTitle', 'Đặt sân mới')}
            </DialogTitle>
            <DialogDescription>
              {t('courtStatus.dialog.description', 'Nhập đầy đủ thông tin khách hàng và giờ thuê sân.')}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
            {/* Customer Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                {t('courtStatus.fields.customerName', 'Tên khách hàng (*) ')}
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

            {/* Phone */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                {t('courtStatus.fields.phoneNumber', 'Số điện thoại (*)')}
              </label>
              <input
                type="tel"
                placeholder="0903xxxxxx"
                {...register('phoneNumber')}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
              />
              {errors.phoneNumber && (
                <p className="text-[11px] text-red-500">{errors.phoneNumber.message}</p>
              )}
            </div>

            {/* Court Selection */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                {t('courtStatus.fields.court', 'Chọn sân')}
              </label>
              <Controller
                control={control}
                name="courtId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t('courtStatus.fields.court', 'Chọn sân')} />
                    </SelectTrigger>
                    <SelectContent>
                      {courts.map((court) => (
                        <SelectItem key={court.id} value={court.id}>
                          {court.name} - {court.pricePerHour.toLocaleString('vi-VN')} đ/giờ
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.courtId && (
                <p className="text-[11px] text-red-500">{errors.courtId.message}</p>
              )}
            </div>

            {/* Date */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                {t('courtStatus.fields.date', 'Ngày đặt sân')}
              </label>
              <input
                type="date"
                {...register('date')}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
              />
              {errors.date && <p className="text-[11px] text-red-500">{errors.date.message}</p>}
            </div>

            {/* Time range (start time & end time) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  {t('courtStatus.fields.startTime', 'Giờ bắt đầu')}
                </label>
                <input
                  type="text"
                  placeholder="08:00"
                  {...register('startTime')}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
                />
                {errors.startTime && (
                  <p className="text-[11px] text-red-500">{errors.startTime.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  {t('courtStatus.fields.endTime', 'Giờ kết thúc')}
                </label>
                <input
                  type="text"
                  placeholder="10:00"
                  {...register('endTime')}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
                />
                {errors.endTime && (
                  <p className="text-[11px] text-red-500">{errors.endTime.message}</p>
                )}
              </div>
            </div>

            {/* Calculated Duration Display */}
            {durationInfo && durationInfo.minutes > 0 && (
              <div className="flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 border border-emerald-200 shadow-xs">
                <div className="flex items-center gap-1.5">
                  <Clock className="size-3.5 text-emerald-600" />
                  <span>Thời lượng đặt sân:</span>
                </div>
                <span className="font-bold text-emerald-700">
                  {durationInfo.formatted} ({watchedStart} → {watchedEnd})
                </span>
              </div>
            )}

            {/* Booking Type */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                {t('courtStatus.fields.bookingType', 'Loại lịch')}
              </label>
              <Controller
                control={control}
                name="bookingType"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t('courtStatus.fields.bookingType', 'Loại lịch')} />
                    </SelectTrigger>
                    <SelectContent>
                      {COURT_BOOKING_STATUSES.filter((s) => s.id !== 'available').map((status) => (
                        <SelectItem key={status.id} value={status.id}>
                          <div className="flex items-center gap-2">
                            <span
                              className="size-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: status.color }}
                            />
                            <span>{status.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                {t('courtStatus.fields.notes', 'Ghi chú thêm')}
              </label>
              <textarea
                rows={2}
                placeholder="Ví dụ: Đặt trước nước uống, khách cần mượn bóng..."
                {...register('notes')}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                {t('common.cancel', 'Đóng')}
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={isLoading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {editingBooking
                  ? t('courtStatus.actions.save', 'Cập nhật')
                  : t('courtStatus.actions.confirm', 'Xác nhận đặt sân')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  },
);

CreateBookingDialog.displayName = 'CreateBookingDialog';
