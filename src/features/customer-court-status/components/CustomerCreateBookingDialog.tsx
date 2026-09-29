import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useCustomerCourtStatusStore } from '../store/customer-court-status.store';
import type { CustomerCreateBookingPayload } from '../types/customer-slot';
import { Calendar, Clock, MapPin, Loader2, CheckCircle2 } from 'lucide-react';

const bookingSchema = z.object({
  customerName: z
    .string()
    .min(2, 'Họ và tên tối thiểu 2 ký tự')
    .max(50, 'Họ và tên tối đa 50 ký tự'),
  phoneNumber: z
    .string()
    .min(10, 'Số điện thoại không hợp lệ')
    .regex(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/, 'Số điện thoại Việt Nam không đúng định dạng'),
  note: z.string().max(200, 'Ghi chú tối đa 200 ký tự').optional(),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

interface CustomerCreateBookingDialogProps {
  onSubmitBooking: (payload: CustomerCreateBookingPayload) => Promise<unknown>;
  isLoading: boolean;
  branchName?: string;
}

export const CustomerCreateBookingDialog: React.FC<CustomerCreateBookingDialogProps> = ({
  onSubmitBooking,
  isLoading,
  branchName = 'TMT Badminton Club',
}) => {
  const isCreateBookingOpen = useCustomerCourtStatusStore((s) => s.isCreateBookingOpen);
  const closeCreateBooking = useCustomerCourtStatusStore((s) => s.closeCreateBooking);
  const activeSelection = useCustomerCourtStatusStore((s) => s.activeSelection);
  const selectedBranchId = useCustomerCourtStatusStore((s) => s.selectedBranchId);
  const selectedDate = useCustomerCourtStatusStore((s) => s.selectedDate);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      customerName: '',
      phoneNumber: '',
      note: '',
    },
  });

  // Reset form whenever dialog is closed or activeSelection is cleared
  useEffect(() => {
    if (!activeSelection) {
      reset({ customerName: '', phoneNumber: '', note: '' });
      if (isCreateBookingOpen) {
        closeCreateBooking();
      }
    } else {
      reset({ customerName: '', phoneNumber: '', note: '' });
    }
  }, [isCreateBookingOpen, activeSelection, reset, closeCreateBooking]);

  const onFormSubmit = async (values: BookingFormValues) => {
    if (!activeSelection) return;

    const payload: CustomerCreateBookingPayload = {
      branchId: selectedBranchId,
      courtId: activeSelection.courtId,
      bookingDate: selectedDate,
      startTime: activeSelection.startTime,
      endTime: activeSelection.endTime,
      customerName: values.customerName.trim(),
      phoneNumber: values.phoneNumber.trim(),
      note: values.note?.trim() || '',
    };

    try {
      await onSubmitBooking(payload);
      closeCreateBooking();
    } catch {
      // Error handled in hook toast
    }
  };

  if (!activeSelection) return null;

  return (
    <Dialog open={isCreateBookingOpen} onOpenChange={(open) => !open && closeCreateBooking()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="size-5 text-emerald-600" />
            Xác Nhận Yêu Cầu Đặt Sân
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Vui lòng kiểm tra khung giờ và điền thông tin để hoàn tất yêu cầu
          </DialogDescription>
        </DialogHeader>

        {/* Slot Summary Card */}
        <div className="bg-emerald-50/70 border border-emerald-100 rounded-lg p-3 space-y-1.5 text-xs text-emerald-950">
          <div className="flex items-center gap-2 font-medium">
            <MapPin className="size-3.5 text-emerald-700 shrink-0" />
            <span>
              {branchName} — <strong className="text-emerald-900">{activeSelection.courtName}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2 font-medium">
            <Calendar className="size-3.5 text-emerald-700 shrink-0" />
            <span>Ngày: {selectedDate}</span>
          </div>
          <div className="flex items-center gap-2 font-medium">
            <Clock className="size-3.5 text-emerald-700 shrink-0" />
            <span>
              Khung giờ: <strong>{activeSelection.startTime} - {activeSelection.endTime}</strong>
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-3 pt-2">
          {/* Customer Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">
              Họ và tên của bạn <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Ví dụ: Nguyễn Văn A"
              {...register('customerName')}
              className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            {errors.customerName && (
              <p className="text-[11px] text-rose-500">{errors.customerName.message}</p>
            )}
          </div>

          {/* Phone Number */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">
              Số điện thoại liên hệ <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              placeholder="Ví dụ: 0909123456"
              {...register('phoneNumber')}
              className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            {errors.phoneNumber && (
              <p className="text-[11px] text-rose-500">{errors.phoneNumber.message}</p>
            )}
          </div>

          {/* Note */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">
              Ghi chú thêm (không bắt buộc)
            </label>
            <textarea
              rows={2}
              placeholder="Ví dụ: Cần mượn vợt, mua thêm nước..."
              {...register('note')}
              className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={closeCreateBooking}
              disabled={isLoading}
              className="text-xs"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isLoading}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                'Gửi yêu cầu đặt sân'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
