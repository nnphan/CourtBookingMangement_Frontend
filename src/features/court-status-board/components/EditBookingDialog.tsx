import React, { memo, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import type { Customer } from '@/features/customer-management/types/customer';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { CourtItem } from '../types/court';
import { BookingType, type BookingItem, type PaymentStatus } from '../types/booking';
import { useCourtStatusStore } from '../store/court-status.store';
import dayjs from '@/lib/dayjs';
import {
  createBookingSchema,
  type CreateBookingSchemaType,
} from '@/features/bookings/schemas/create-booking.schema';
import { useCalculateBookingPrice } from '@/features/bookings/hooks/useCalculateBookingPrice';
import { BookingService } from '@/features/bookings/services/booking.service';
import {
  formatTimeToApi,
  formatBookingDateToApi,
} from '@/features/bookings/utils/booking.mapper';
import { BookingForm } from './BookingForm';

export interface EditBookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  courts: CourtItem[];
  branchId?: string;
  editingBooking: BookingItem | null;
  onSubmitBooking?: (data: Partial<BookingItem>) => Promise<unknown>;
  isLoading?: boolean;
}

/** Edit-only dialog (PUT flow). Creating bookings is handled by CreateBookingDialog. */
export const EditBookingDialog: React.FC<EditBookingDialogProps> = memo(
  ({
    isOpen,
    onClose,
    courts,
    branchId: propBranchId,
    editingBooking,
    onSubmitBooking,
    isLoading = false,
  }) => {
    const { t } = useTranslation();
    const storeSelectedDate = useCourtStatusStore((s) => s.selectedDate);
    const storeSelectedBranch = useCourtStatusStore((s) => s.selectedBranch);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    const {
      register,
      control,
      handleSubmit,
      reset,
      watch,
      formState: { errors, isSubmitting },
    } = useForm<CreateBookingSchemaType>({
      resolver: zodResolver(createBookingSchema),
      defaultValues: {
        customerId: null,
        customerName: '',
        phoneNumber: '',
        courtId: courts[0]?.id ?? '',
        bookingDate: storeSelectedDate,
        startTime: '13:00',
        endTime: '15:00',
        bookingType: 'FLEXIBLE',
        note: '',
      },
    });

    const watchedCourtId = watch('courtId');
    const watchedStart = watch('startTime') || '13:00';
    const watchedEnd = watch('endTime') || '15:00';
    const watchedDate = watch('bookingDate');

    const effectiveBranchId = useMemo(() => {
      const court = courts.find((c) => c.id === watchedCourtId) ?? courts[0];
      return propBranchId || court?.branchId || storeSelectedBranch || '';
    }, [propBranchId, courts, watchedCourtId, storeSelectedBranch]);

    const formattedDisplayDate = useMemo(() => {
      if (!watchedDate) return '';
      const d = dayjs(watchedDate);
      return d.isValid() ? d.format('DD-MM-YYYY') : watchedDate;
    }, [watchedDate]);

    const durationInfo = useMemo(
      () => BookingService.calculateDuration(watchedStart, watchedEnd),
      [watchedStart, watchedEnd],
    );

    const apiStartTime = formatTimeToApi(watchedStart);
    const apiEndTime = formatTimeToApi(watchedEnd);
    const apiBookingDate = formatBookingDateToApi(watchedDate);

    const {
      data: pricingData,
      isLoading: isPricingLoading,
      isFetching: isPricingFetching,
      isError: isPricingError,
      refetch: refetchPricing,
    } = useCalculateBookingPrice(
      {
        branchId: effectiveBranchId,
        bookingDate: apiBookingDate,
        startTime: apiStartTime,
        endTime: apiEndTime,
        courtId: watchedCourtId,
      },
      {
        enabled:
          isOpen && Boolean(effectiveBranchId && apiBookingDate && apiStartTime && apiEndTime),
      },
    );

    const effectiveDurationText =
      pricingData?.durationHours !== undefined && pricingData.durationHours > 0
        ? `${pricingData.durationHours} giờ`
        : durationInfo?.displayText;

    useEffect(() => {
      if (!isOpen || !editingBooking) return;
      setSelectedCustomer(null);
      reset({
        customerId: null,
        customerName: editingBooking.customerName,
        phoneNumber: editingBooking.phoneNumber,
        courtId: editingBooking.courtId,
        bookingDate: editingBooking.date,
        startTime: editingBooking.startTime,
        endTime: editingBooking.endTime,
        bookingType: editingBooking.bookingType === 'FIXED' ? 'FIXED' : 'FLEXIBLE',
        note: editingBooking.notes ?? '',
      });
    }, [isOpen, editingBooking, reset]);

    const onSubmit = async (values: CreateBookingSchemaType) => {
      if (!editingBooking) return;
      const courtName = courts.find((c) => c.id === values.courtId)?.name ?? 'Sân';
      await onSubmitBooking?.({
        id: editingBooking.id,
        courtId: values.courtId,
        courtName,
        customerName: (values.customerName ?? '').trim(),
        phoneNumber: (values.phoneNumber ?? '').trim(),
        date: values.bookingDate,
        startTime: values.startTime,
        endTime: values.endTime,
        bookingType: values.bookingType === 'FIXED' ? BookingType.FIXED : BookingType.FLEXIBLE,
        notes: values.note,
        paymentStatus: (editingBooking.paymentStatus ?? 'unpaid') as PaymentStatus,
      });
      onClose();
    };

    const isProcessing = isSubmitting || isLoading;

    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && !isProcessing && onClose()}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('courtStatus.dialog.editTitle', 'Chỉnh sửa lịch đặt sân')}</DialogTitle>
            <DialogDescription>
              {t(
                'courtStatus.dialog.description',
                'Nhập đầy đủ thông tin khách hàng và giờ thuê sân.',
              )}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <BookingForm
              register={register}
              control={control}
              errors={errors}
              courts={courts}
              mode="ADMIN"
              selectedCustomer={selectedCustomer}
              onSelectCustomer={setSelectedCustomer}
              onDeselectCustomer={() => setSelectedCustomer(null)}
              isEditing
              formattedDisplayDate={formattedDisplayDate}
              durationDisplayText={effectiveDurationText}
              pricingData={pricingData}
              isPricingLoading={isPricingLoading || (isPricingFetching && !pricingData)}
              isPricingError={isPricingError}
              onRetryPricing={refetchPricing}
            />
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isProcessing}>
                {t('common.cancel', 'Hủy')}
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={isProcessing}
                className="cursor-pointer bg-emerald-600 text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                aria-busy={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  t('courtStatus.actions.save', 'Cập nhật')
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  },
);

EditBookingDialog.displayName = 'EditBookingDialog';
