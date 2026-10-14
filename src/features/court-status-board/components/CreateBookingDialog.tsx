import React, { memo, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from '@/lib/toast';
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
import { Button } from '@/components/ui/button';
import type { CourtItem } from '../types/court';
import { BookingType, type BookingItem, type PaymentStatus } from '../types/booking';
import { SchedulerService } from '../services/scheduler.service';
import { useCourtStatusStore } from '../store/court-status.store';
import { schedulerSelectionStore } from '../store/scheduler-selection.store';
import dayjs from '@/lib/dayjs';
import {
  createBookingSchema,
  type CreateBookingSchemaType,
} from '@/features/bookings/schemas/create-booking.schema';
import { useCreateBooking } from '@/features/bookings/hooks/useCreateBooking';
import { useCalculateBookingPrice } from '@/features/bookings/hooks/useCalculateBookingPrice';
import { BookingService } from '@/features/bookings/services/booking.service';
import {
  toCreateBookingPayload,
  formatTimeToApi,
  formatBookingDateToApi,
} from '@/features/bookings/utils/booking.mapper';
import { BookingForm } from './BookingForm';


export interface CreateBookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  courts: CourtItem[];
  branchId?: string;
  defaultValues?: {
    branchId?: string;
    courtId?: string;
    courtName?: string;
    date?: string;
    bookingDate?: string;
    startTime?: string;
    endTime?: string;
  } | null;
  editingBooking?: BookingItem | null;
  onSubmitBooking?: (data: Partial<BookingItem>) => Promise<unknown>;
  isLoading?: boolean;
}

export const CreateBookingDialog: React.FC<CreateBookingDialogProps> = memo(
  ({
    isOpen,
    onClose,
    courts,
    branchId: propBranchId,
    defaultValues,
    editingBooking,
    onSubmitBooking,
    isLoading = false,
  }) => {
    const { t } = useTranslation();
    const storeSelectedDate = useCourtStatusStore((s) => s.selectedDate);
    const storeSelectedBranch = useCourtStatusStore((s) => s.selectedBranch);

    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    // TanStack Query Mutation for Create Booking (POST /api/bookings)
    const { mutateAsync: createBookingMutation, isPending: isCreatingBooking } = useCreateBooking();

    const {
      register,
      control,
      handleSubmit,
      reset,
      watch,
      setValue,
      formState: { errors, isSubmitting },
    } = useForm<CreateBookingSchemaType>({
      resolver: zodResolver(createBookingSchema),
      defaultValues: {
        customerId: null,
        customerName: '',
        phoneNumber: '',
        courtId: courts[0]?.id ?? 'court-1',
        bookingDate: defaultValues?.bookingDate ?? defaultValues?.date ?? storeSelectedDate,
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

    const selectedCourt = useMemo(() => {
      return courts.find((c) => c.id === watchedCourtId) || courts[0];
    }, [courts, watchedCourtId]);

    // Effective branch ID from props, defaultValues, selected court, store, or court list
    const effectiveBranchId = useMemo(() => {
      return (
        propBranchId ||
        defaultValues?.branchId ||
        selectedCourt?.branchId ||
        storeSelectedBranch ||
        courts[0]?.branchId ||
        ''
      );
    }, [propBranchId, defaultValues?.branchId, selectedCourt?.branchId, storeSelectedBranch, courts]);

    const isPastDate = useMemo(() => {
      if (editingBooking) return false;
      return SchedulerService.isPastDate(watchedDate);
    }, [editingBooking, watchedDate]);

    const isPastSlot = useMemo(() => {
      if (editingBooking) return false;
      return SchedulerService.isPastSlot(watchedDate, watchedStart);
    }, [editingBooking, watchedDate, watchedStart]);

    // Format date as dd-MM-yyyy for user display (e.g. 13-10-2026)
    const formattedDisplayDate = useMemo(() => {
      if (!watchedDate) return '';
      const d = dayjs(watchedDate);
      return d.isValid() ? d.format('DD-MM-YYYY') : watchedDate;
    }, [watchedDate]);

    // Auto calculate duration fallback (e.g., "2 giờ (13:00 - 15:00)")
    const durationInfo = useMemo(() => {
      if (watchedStart && watchedEnd) {
        return BookingService.calculateDuration(watchedStart, watchedEnd);
      }
      return null;
    }, [watchedStart, watchedEnd]);

    // Format parameters for API call (HH:mm:ss and YYYY-MM-DD)
    const apiStartTime = useMemo(() => formatTimeToApi(watchedStart), [watchedStart]);
    const apiEndTime = useMemo(() => formatTimeToApi(watchedEnd), [watchedEnd]);
    const apiBookingDate = useMemo(() => formatBookingDateToApi(watchedDate), [watchedDate]);

    // Automatic Booking Price Calculation via TanStack Query
    // Auto re-triggers whenever branch, court, date, startTime, or endTime changes
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
          isOpen &&
          Boolean(effectiveBranchId && apiBookingDate && apiStartTime && apiEndTime),
      },
    );

    // Sync calculated price to scheduler selection store
    useEffect(() => {
      if (pricingData?.totalAmount !== undefined) {
        schedulerSelectionStore.getState().setEstimatedPrice(pricingData.totalAmount);
      }
    }, [pricingData?.totalAmount]);

    // Prefer API durationHours, fallback to frontend calculated duration
    const effectiveDurationText = useMemo(() => {
      if (pricingData?.durationHours !== undefined && pricingData.durationHours > 0) {
        return `${pricingData.durationHours} giờ`;
      }
      return durationInfo?.displayText;
    }, [pricingData?.durationHours, durationInfo?.displayText]);


    useEffect(() => {
      if (isOpen) {
        setSelectedCustomer(null);
        if (editingBooking) {
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
        } else if (defaultValues) {
          const targetDate =
            defaultValues.bookingDate ?? defaultValues.date ?? storeSelectedDate;
          const targetCourtId = defaultValues.courtId ?? courts[0]?.id ?? 'court-1';
          const targetCourt = courts.find((c) => c.id === targetCourtId);
          const targetStart = defaultValues.startTime ?? '13:00';

          let calculatedEndTime = defaultValues.endTime;
          if (!calculatedEndTime && defaultValues.startTime) {
            const startMin = SchedulerService.parseTimeToMinutes(defaultValues.startTime);
            calculatedEndTime = SchedulerService.minutesToTime(Math.min(24 * 60, startMin + 120));
          }

          const targetEnd = calculatedEndTime ?? '15:00';

          // Synchronize selection store
          schedulerSelectionStore.getState().setSelection({
            branchId: effectiveBranchId,
            courtId: targetCourtId,
            courtName: targetCourt?.name ?? defaultValues.courtName,
            bookingDate: targetDate,
            startTime: targetStart,
            endTime: targetEnd,
          });

          reset({
            customerId: null,
            customerName: '',
            phoneNumber: '',
            courtId: targetCourtId,
            bookingDate: targetDate,
            startTime: targetStart,
            endTime: targetEnd,
            bookingType: 'FLEXIBLE',
            note: '',
          });
        }
      }
    }, [
      isOpen,
      defaultValues,
      editingBooking,
      courts,
      storeSelectedDate,
      effectiveBranchId,
      reset,
    ]);

    const handleSelectCustomer = (customer: Customer) => {
      setSelectedCustomer(customer);
      setValue('customerId', customer.id, { shouldValidate: true });
      setValue('customerName', customer.fullName, { shouldValidate: true });
      setValue('phoneNumber', customer.phoneNumber, { shouldValidate: true });
    };

    const handleDeselectCustomer = () => {
      setSelectedCustomer(null);
      setValue('customerId', null);
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

    const onSubmit = async (values: CreateBookingSchemaType) => {
      // Validate past date / time slot before submitting
      if (!editingBooking) {
        if (SchedulerService.isPastDate(values.bookingDate)) {
          toast.error(
            t('courtStatus.pastDateAlert', 'Cannot create bookings for past dates.'),
            'Không thể đặt lịch cho các ngày trong quá khứ.',
          );
          return;
        }
        if (SchedulerService.isPastSlot(values.bookingDate, values.startTime)) {
          toast.error(
            t('courtStatus.pastSlotTooltip', 'Past time slots cannot be booked.'),
            'Không thể đặt khung giờ trong quá khứ.',
          );
          return;
        }
      }

      const selectedCourt = courts.find((c) => c.id === values.courtId);
      const courtName = selectedCourt?.name ?? 'Sân';

      if (editingBooking) {
        // Edit mode - update existing booking
        const updatePayload: Partial<BookingItem> = {
          id: editingBooking.id,
          courtId: values.courtId,
          courtName,
          customerName: values.customerName.trim(),
          phoneNumber: values.phoneNumber.trim(),
          date: values.bookingDate,
          startTime: values.startTime,
          endTime: values.endTime,
          bookingType: values.bookingType === 'FIXED' ? BookingType.FIXED : BookingType.FLEXIBLE,
          notes: values.note,
          paymentStatus: (editingBooking?.paymentStatus ?? 'unpaid') as PaymentStatus,
        };

        if (onSubmitBooking) {
          await onSubmitBooking(updatePayload);
        }
        onClose();
        return;
      }

      // Create Booking Flow: Calls POST /api/bookings with standard payload
      const payload = toCreateBookingPayload(
        {
          customerName: values.customerName,
          phoneNumber: values.phoneNumber,
          bookingType: values.bookingType,
          note: values.note,
        },
        {
          branchId: effectiveBranchId,
          courtId: values.courtId,
          bookingDate: values.bookingDate,
          startTime: values.startTime,
          endTime: values.endTime,
          customerId: selectedCustomer?.id ?? values.customerId ?? null,
          paymentMethod: 'CASH',
        },
      );

      try {
        await createBookingMutation(payload);
        // Also call onSubmitBooking callback if provided by parent for local sync
        if (onSubmitBooking) {
          await onSubmitBooking({
            courtId: values.courtId,
            courtName,
            customerName: values.customerName.trim(),
            phoneNumber: values.phoneNumber.trim(),
            date: values.bookingDate,
            startTime: values.startTime,
            endTime: values.endTime,
            bookingType: values.bookingType === 'FIXED' ? BookingType.FIXED : BookingType.FLEXIBLE,
            notes: values.note,
          });
        }
        onClose();
      } catch {
        // Error is automatically toasted by useCreateBooking
      }
    };

    const isProcessing = isCreatingBooking || isSubmitting || isLoading;

    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && !isProcessing && onClose()}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingBooking
                ? t('courtStatus.dialog.editTitle', 'Chỉnh sửa lịch đặt sân')
                : t('courtStatus.dialog.createTitle', 'Đặt sân mới')}
            </DialogTitle>
            <DialogDescription>
              {t(
                'courtStatus.dialog.description',
                'Nhập đầy đủ thông tin khách hàng và giờ thuê sân.',
              )}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

            {/* Booking Form Inputs */}
            <BookingForm
              register={register}
              control={control}
              errors={errors}
              courts={courts}
              selectedCustomer={selectedCustomer}
              onSelectCustomer={handleSelectCustomer}
              onDeselectCustomer={handleDeselectCustomer}
              onConvertGuest={handleConvertGuest}
              isEditing={Boolean(editingBooking)}
              formattedDisplayDate={formattedDisplayDate}
              durationDisplayText={effectiveDurationText}
              pricingData={pricingData}
              isPricingLoading={isPricingLoading || (isPricingFetching && !pricingData)}
              isPricingError={isPricingError}
              onRetryPricing={refetchPricing}
            />

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={isProcessing}
              >
                {t('common.cancel', 'Hủy')}
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={isProcessing || (!editingBooking && (isPastDate || isPastSlot))}
                className="bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    {editingBooking ? 'Đang lưu...' : 'Đang xử lý...'}
                  </>
                ) : editingBooking ? (
                  t('courtStatus.actions.save', 'Cập nhật')
                ) : (
                  'Đặt sân'
                )}
              </Button>
            </DialogFooter>

          </form>
        </DialogContent>
      </Dialog>
    );
  },
);

CreateBookingDialog.displayName = 'CreateBookingDialog';
