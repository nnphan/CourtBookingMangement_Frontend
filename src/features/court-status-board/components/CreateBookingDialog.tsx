import React, { memo, useEffect, useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Clock, AlertTriangle, Crown, UserCheck, Sparkles, User } from 'lucide-react';
import { toast } from '@/lib/toast';
import { CustomerSearch } from '@/features/customer-management/components/CustomerSearch';
import type { Customer } from '@/features/customer-management/types/customer';
import { customerApi } from '@/features/customer-management/api/customer.api';
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
import { useCourtStatusStore } from '../store/court-status.store';
import dayjs from '@/lib/dayjs';

const bookingSchema = z
  .object({
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
  })
  .refine(
    (data) => {
      const startMin = SchedulerService.parseTimeToMinutes(data.startTime);
      const endMin = SchedulerService.parseTimeToMinutes(data.endTime);
      return endMin > startMin;
    },
    {
      message: 'Giờ kết thúc phải sau giờ bắt đầu',
      path: ['endTime'],
    },
  );

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
    const storeSelectedDate = useCourtStatusStore((s) => s.selectedDate);

    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    const {
      register,
      control,
      handleSubmit,
      reset,
      watch,
      setValue,
      formState: { errors },
    } = useForm<BookingFormValues>({
      resolver: zodResolver(bookingSchema),
      defaultValues: {
        customerName: '',
        phoneNumber: '',
        courtId: courts[0]?.id ?? 'court-1',
        date: defaultValues?.date ?? storeSelectedDate,
        startTime: '08:00',
        endTime: '10:00',
        bookingType: 'daily',
        notes: '',
      },
    });

    const watchedStart = watch('startTime');
    const watchedEnd = watch('endTime');
    const watchedDate = watch('date');

    const isPastDate = useMemo(() => {
      if (editingBooking) return false;
      return SchedulerService.isPastDate(watchedDate);
    }, [editingBooking, watchedDate]);

    const isPastSlot = useMemo(() => {
      if (editingBooking) return false;
      return SchedulerService.isPastSlot(watchedDate, watchedStart);
    }, [editingBooking, watchedDate, watchedStart]);

    // Format date as dd-MM-yyyy for user display (e.g. 29-09-2026)
    const formattedDisplayDate = useMemo(() => {
      if (!watchedDate) return '';
      const d = dayjs(watchedDate);
      return d.isValid() ? d.format('DD-MM-YYYY') : watchedDate;
    }, [watchedDate]);

    const durationInfo = useMemo(() => {
      if (watchedStart && watchedEnd) {
        return SchedulerService.calculateDuration(watchedStart, watchedEnd);
      }
      return null;
    }, [watchedStart, watchedEnd]);

    useEffect(() => {
      if (isOpen) {
        setSelectedCustomer(null);
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
            date: defaultValues.date ?? storeSelectedDate,
            startTime: defaultValues.startTime ?? '08:00',
            endTime: calculatedEndTime ?? '10:00',
            bookingType: 'daily',
            notes: '',
          });
        }
      }
    }, [isOpen, defaultValues, editingBooking, courts, storeSelectedDate, reset]);

    const handleSelectCustomer = (customer: Customer) => {
      setSelectedCustomer(customer);
      setValue('customerName', customer.fullName, { shouldValidate: true });
      setValue('phoneNumber', customer.phoneNumber, { shouldValidate: true });
    };

    const handleConvertGuest = async () => {
      if (!selectedCustomer || !selectedCustomer.isGuest) return;
      try {
        const res = await customerApi.convertGuestToCustomer(selectedCustomer.id, {
          memberType: 'bronze',
        });
        if (res.success) {
          setSelectedCustomer(res.data);
          toast.success('Thành công', 'Đã chuyển đổi thành Hội viên chính thức!');
        }
      } catch {
        toast.error('Lỗi', 'Không thể chuyển đổi khách hàng.');
      }
    };

    const onSubmit = async (values: BookingFormValues) => {
      // Validate past date / time slot before submitting
      if (!editingBooking) {
        if (SchedulerService.isPastDate(values.date)) {
          toast.error(
            t('courtStatus.pastDateAlert', 'Cannot create bookings for past dates.'),
            'Không thể đặt lịch cho các ngày trong quá khứ.',
          );
          return;
        }
        if (SchedulerService.isPastSlot(values.date, values.startTime)) {
          toast.error(
            t('courtStatus.pastSlotTooltip', 'Past time slots cannot be booked.'),
            'Không thể đặt khung giờ trong quá khứ.',
          );
          return;
        }
      }

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
            {/* Past Date / Past Slot Protection Alert */}
            {!editingBooking && (isPastDate || isPastSlot) && (
              <div
                role="alert"
                className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs font-semibold text-red-700"
              >
                <AlertTriangle className="size-4 shrink-0 text-red-500" />
                <span>
                  {isPastDate
                    ? t('courtStatus.pastDateAlert', 'Cannot create bookings for past dates.')
                    : t('courtStatus.pastSlotTooltip', 'Past time slots cannot be booked.')}
                </span>
              </div>
            )}

            {/* Customer Search & Quick Selection */}
            {!editingBooking && (
              <div className="space-y-2 p-3 bg-slate-50/80 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <User className="size-3.5 text-emerald-600" />
                    <span>{t('courtStatus.fields.customerSearch', 'Tìm & Chọn Khách Hàng')}</span>
                  </label>

                  {selectedCustomer && (
                    <button
                      type="button"
                      onClick={() => setSelectedCustomer(null)}
                      className="text-[11px] text-slate-500 hover:text-slate-800 underline cursor-pointer"
                    >
                      Bỏ chọn
                    </button>
                  )}
                </div>

                <CustomerSearch
                  onSelectCustomer={handleSelectCustomer}
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
                          Hội viên: {selectedCustomer.memberType.toUpperCase()}
                        </span>
                      )}
                    </div>

                    {selectedCustomer.isGuest && (
                      <button
                        type="button"
                        onClick={handleConvertGuest}
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
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none font-mono"
              />
              {errors.phoneNumber && (
                <p className="text-[11px] text-red-500">{errors.phoneNumber.message}</p>
              )}
            </div>

            {/* Court Selection (Read-Only: pre-filled from scheduler) */}
            <div className="space-y-1">
              <label className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>{t('courtStatus.fields.court', 'Sân đã chọn')}</span>
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

            {/* Date (Read-Only: pre-filled from scheduler, displayed as dd-MM-yyyy) */}
            <div className="space-y-1">
              <label className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>{t('courtStatus.fields.date', 'Ngày đặt sân')}</span>
              </label>
              <input type="hidden" {...register('date')} />
              <input
                type="text"
                value={formattedDisplayDate}
                readOnly
                tabIndex={-1}
                placeholder="dd-MM-yyyy"
                className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-700 select-none focus:outline-none"
              />
              {errors.date && <p className="text-[11px] text-red-500">{errors.date.message}</p>}
            </div>

            {/* Time range (start time & end time: Read-Only from scheduler selection) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span>{t('courtStatus.fields.startTime', 'Giờ bắt đầu')}</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="08:00"
                    {...register('startTime')}
                    readOnly
                    tabIndex={-1}
                    className="w-full rounded-lg border border-slate-200 bg-slate-100 pr-9 pl-3 py-2 text-sm text-slate-700 cursor-not-allowed select-none pointer-events-none focus:outline-none"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  </div>
                </div>
                {errors.startTime && (
                  <p className="text-[11px] text-red-500">{errors.startTime.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span>{t('courtStatus.fields.endTime', 'Giờ kết thúc')}</span>                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="10:00"
                    {...register('endTime')}
                    readOnly
                    tabIndex={-1}
                    className="w-full rounded-lg border border-slate-200 bg-slate-100 pr-9 pl-3 py-2 text-sm text-slate-700 cursor-not-allowed select-none pointer-events-none focus:outline-none"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  </div>
                </div>
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
                disabled={!editingBooking && (isPastDate || isPastSlot)}
                loading={isLoading}
                title={
                  !editingBooking && (isPastDate || isPastSlot)
                    ? isPastDate
                      ? 'Cannot create bookings for past dates.'
                      : 'Past time slots cannot be booked.'
                    : undefined
                }
                className="bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
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
