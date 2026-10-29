import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, CalendarDays, Clock, Loader2, MapPin } from 'lucide-react';
import { toast } from '@/lib/toast';
import type {
  BookingDialogMode,
  BookingSelection,
  CreateBookingResponse,
} from '@/features/bookings/types/booking.types';
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
  formatBookingTime,
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
  mode?: BookingDialogMode;
  initialSelection?: BookingSelection | null;
  onBookingCreated?: (result: CreateBookingResponse) => void;
  onBookingConflict?: () => void;
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
    mode = 'ADMIN',
    initialSelection,
    onBookingCreated,
    onBookingConflict,
  }) => {
    const { t } = useTranslation();
    const [dialogDebugId] = useState(() => crypto.randomUUID());
    const activeRequestDebugIdRef = useRef<string | null>(null);
    const createBookingInFlightRef = useRef(false);
    const [conflictMessage, setConflictMessage] = useState<string | null>(null);

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
      setError,
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
    }, [
      propBranchId,
      defaultValues?.branchId,
      selectedCourt?.branchId,
      storeSelectedBranch,
      courts,
    ]);

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
          isOpen && Boolean(effectiveBranchId && apiBookingDate && apiStartTime && apiEndTime),
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
      if (!isOpen || mode !== 'CUSTOMER' || !initialSelection) return;

      setSelectedCustomer(null);
      setConflictMessage(null);
      reset({
        customerId: null,
        customerName: '',
        phoneNumber: '',
        courtId: initialSelection.courtId,
        bookingDate: formatBookingDateToApi(initialSelection.bookingDate),
        startTime: formatBookingTime(initialSelection.startTime),
        endTime: formatBookingTime(initialSelection.endTime),
        bookingType: 'FLEXIBLE',
        note: '',
      });
    }, [isOpen, mode, initialSelection, reset]);

    useEffect(() => {
      if (!isOpen || mode === 'CUSTOMER') return;

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
        const targetDate = defaultValues.bookingDate ?? defaultValues.date ?? storeSelectedDate;
        const targetCourtId = defaultValues.courtId ?? courts[0]?.id ?? 'court-1';
        const targetCourt = courts.find((court) => court.id === targetCourtId);
        const targetStart = defaultValues.startTime ?? '13:00';

        let calculatedEndTime = defaultValues.endTime;
        if (!calculatedEndTime && defaultValues.startTime) {
          const startMin = SchedulerService.parseTimeToMinutes(defaultValues.startTime);
          calculatedEndTime = SchedulerService.minutesToTime(Math.min(24 * 60, startMin + 120));
        }

        const targetEnd = calculatedEndTime ?? '15:00';

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
    }, [
      isOpen,
      mode,
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
      setConflictMessage(null);

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
          customerName: (values.customerName ?? '').trim(),
          phoneNumber: (values.phoneNumber ?? '').trim(),
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
          bookingType: values.bookingType,
          note: values.note,
        },
        {
          branchId: effectiveBranchId,
          courtIds: [values.courtId],
          bookingDate: values.bookingDate,
          startTime: values.startTime,
          endTime: values.endTime,
          paymentMethod: 'CASH',
        },
      );

      if (createBookingInFlightRef.current) return;
      createBookingInFlightRef.current = true;

      try {
        const requestDebugId = crypto.randomUUID();
        activeRequestDebugIdRef.current = requestDebugId;
        if (import.meta.env.DEV) {
          console.debug('[CreateBookingDialog] submit accepted', {
            dialogDebugId,
            requestDebugId,
            mode,
          });
        }
        const result = await createBookingMutation({ payload, requestDebugId });
        onBookingCreated?.(result);
        // Also call onSubmitBooking callback if provided by parent for local sync
        if (onSubmitBooking) {
          await onSubmitBooking({
            courtId: values.courtId,
            courtName,
            customerName: (values.customerName ?? '').trim(),
            phoneNumber: (values.phoneNumber ?? '').trim(),
            date: values.bookingDate,
            startTime: values.startTime,
            endTime: values.endTime,
            bookingType: values.bookingType === 'FIXED' ? BookingType.FIXED : BookingType.FLEXIBLE,
            notes: values.note,
          });
        }
        onClose();
      } catch (error: unknown) {
        if (!error || typeof error !== 'object') return;
        const apiError = error as { code?: unknown; fields?: unknown };
        if (apiError.fields && typeof apiError.fields === 'object') {
          const formFields = new Set<keyof CreateBookingSchemaType>([
            'customerName',
            'phoneNumber',
            'courtId',
            'bookingDate',
            'startTime',
            'endTime',
            'bookingType',
            'note',
          ]);
          for (const [field, message] of Object.entries(apiError.fields)) {
            if (
              formFields.has(field as keyof CreateBookingSchemaType) &&
              typeof message === 'string'
            ) {
              setError(field as keyof CreateBookingSchemaType, {
                type: 'server',
                message,
              });
            }
          }
        }
        if (apiError.code === 'BOOKING_CONFLICT') {
          setConflictMessage(
            t(
              'booking.multiCourt.conflictNoPartial',
              'Một hoặc nhiều sân vừa được người khác đặt. Không có sân nào trong yêu cầu này được tạo. Vui lòng kiểm tra và chọn lại.',
            ),
          );
          onBookingConflict?.();
        }
      } finally {
        createBookingInFlightRef.current = false;
        activeRequestDebugIdRef.current = null;
      }
    };

    const isProcessing = isCreatingBooking || isSubmitting || isLoading;
    useEffect(() => {
      if (!import.meta.env.DEV) return;
      console.debug('[CreateBookingDialog] mounted', { dialogDebugId });
      return () => console.debug('[CreateBookingDialog] unmounted', { dialogDebugId });
    }, [dialogDebugId]);

    useEffect(() => {
      if (!import.meta.env.DEV) return;
      console.debug('[CreateBookingDialog] state', {
        dialogDebugId,
        requestDebugId: activeRequestDebugIdRef.current,
        open: isOpen,
        isPending: isProcessing,
      });
    }, [dialogDebugId, isOpen, isProcessing]);

    const isCustomerMode = mode === 'CUSTOMER';
    const isCustomerPricingPending =
      isCustomerMode && (isPricingLoading || (isPricingFetching && !pricingData));

    useEffect(() => {
      if (!isOpen && mode === 'CUSTOMER') {
        reset({
          customerId: null,
          customerName: '',
          phoneNumber: '',
          courtId: '',
          bookingDate: '',
          startTime: '13:00',
          endTime: '15:00',
          bookingType: 'FLEXIBLE',
          note: '',
        });
        setSelectedCustomer(null);
      }
    }, [isOpen, mode, reset]);

    if (mode === 'CUSTOMER' && !initialSelection) return null;

    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && !isProcessing && onClose()}>
        <DialogContent
          className={
            mode === 'CUSTOMER'
              ? 'h-[calc(100dvh-1rem)] max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] overflow-y-auto p-4 sm:h-auto sm:max-h-[90vh] sm:max-w-md sm:p-6'
              : 'max-h-[90vh] overflow-y-auto sm:max-w-md'
          }
        >
          <DialogHeader>
            <DialogTitle>
              {editingBooking
                ? t('courtStatus.dialog.editTitle', 'Chỉnh sửa lịch đặt sân')
                : mode === 'CUSTOMER'
                  ? 'Xác nhận đặt sân'
                  : t('courtStatus.dialog.createTitle', 'Đặt sân mới')}
            </DialogTitle>
            <DialogDescription>
              {mode === 'CUSTOMER'
                ? t('booking.guest.reviewDescription', 'Kiểm tra thông tin và xác nhận đặt sân.')
                : t(
                    'courtStatus.dialog.description',
                    'Nhập đầy đủ thông tin khách hàng và giờ thuê sân.',
                  )}
            </DialogDescription>
          </DialogHeader>

          {mode === 'CUSTOMER' && initialSelection && (
            <section
              aria-label="Thông tin đặt sân đã chọn"
              className="space-y-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-950"
            >
              <h3 className="font-semibold">Thông tin đặt sân</h3>
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-emerald-700" />
                <span>
                  {initialSelection.branchName || 'Chi nhánh'} · {initialSelection.courtName}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarDays className="size-4 shrink-0 text-emerald-700" />
                <span>{dayjs(initialSelection.bookingDate).format('DD-MM-YYYY')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="size-4 shrink-0 text-emerald-700" />
                <span>
                  {formatBookingTime(initialSelection.startTime)} -{' '}
                  {formatBookingTime(initialSelection.endTime)} ·{' '}
                  {initialSelection.durationMinutes / 60} giờ
                </span>
              </div>
            </section>
          )}

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

            {conflictMessage && (
              <div
                role="alert"
                tabIndex={-1}
                ref={(node) => node?.focus()}
                className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs font-semibold text-red-700"
              >
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-500" />
                <span>{conflictMessage}</span>
              </div>
            )}

            <BookingForm
              register={register}
              control={control}
              errors={errors}
              courts={courts}
              mode={mode}
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

            <DialogFooter
              className={
                mode === 'CUSTOMER' ? 'bg-background/95 sticky bottom-0 mt-4 border-t py-3' : 'pt-2'
              }
            >
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={isProcessing}
                className={mode === 'CUSTOMER' ? 'h-11' : undefined}
              >
                {t('common.cancel', 'Hủy')}
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={
                  isProcessing ||
                  isCustomerPricingPending ||
                  (!editingBooking && (isPastDate || isPastSlot))
                }
                className={
                  mode === 'CUSTOMER'
                    ? 'h-11 cursor-pointer bg-emerald-600 text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50'
                    : 'cursor-pointer bg-emerald-600 text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50'
                }
                aria-busy={isProcessing || isCustomerPricingPending}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    {editingBooking
                      ? 'Đang lưu...'
                      : mode === 'CUSTOMER'
                        ? 'Đang đặt sân...'
                        : 'Đang xử lý...'}
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
