import React, { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import type { BookingItem } from '../types/booking';
import { useBookingDetail } from '@/features/bookings/hooks/useBookingDetail';
import { useUpdateBookingStatus } from '@/features/bookings/hooks/useUpdateBookingStatus';
import { BookingDetails } from './BookingDetails';
import { BookingDetailSkeleton } from './BookingDetailSkeleton';
import { BookingStatusBadge } from './BookingStatusBadge';
import { CheckOutBookingDialog } from './CheckOutBookingDialog';
import { BookingPaymentDialog } from './BookingPaymentDialog';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  AlertCircle,
  RotateCcw,
  Edit,
  LogIn,
  Trash2,
  CheckCircle2,
  CreditCard,
  Loader2,
} from 'lucide-react';
import { toBookingTypeEnum } from '../utils/booking.utils';
import { getBookingActionCapabilities } from '../utils/booking-action-capabilities';
import { formatCurrency } from '@/features/bookings/utils/booking.mapper';
import { toast } from '@/lib/toast';

export interface BookingDetailDrawerProps {
  bookingId?: string | null;
  booking?: BookingItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (booking: BookingItem) => void;
  onCheckIn?: (booking: BookingItem) => void;
  onCheckOut?: (booking: BookingItem) => void;
  onCancel?: (booking: BookingItem) => void;
  mode?: 'ADMIN' | 'CUSTOMER';
}

export const BookingDetailDrawer: React.FC<BookingDetailDrawerProps> = memo(
  ({
    bookingId,
    booking,
    isOpen,
    onClose,
    onEdit,
    onCheckIn,
    onCheckOut,
    onCancel,
    mode = 'ADMIN',
  }) => {
    const { t } = useTranslation();

    const [isCheckOutModalOpen, setIsCheckOutModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    // Priority: Explicit bookingId prop, fallback to booking?.id
    const targetBookingId = bookingId ?? booking?.id;

    // Fetch latest booking detail directly from backend API (GET /api/bookings/{id})
    const {
      data: bookingDetail,
      isLoading,
      isError,
      error,
      refetch,
    } = useBookingDetail(isOpen ? targetBookingId : undefined, {
      enabled: isOpen && Boolean(targetBookingId),
    });

    // Mutation hook to update booking status via PATCH /api/bookings/{id}
    const updateStatusMutation = useUpdateBookingStatus();

    // Compute lifecycle and financial capabilities
    const capabilities = getBookingActionCapabilities({
      bookingStatus: bookingDetail?.bookingStatus || booking?.bookingStatus,
      paymentStatus: bookingDetail?.paymentStatus || booking?.paymentStatus,
      totalAmount: bookingDetail?.totalAmount ?? booking?.totalAmount,
      paidAmount: bookingDetail?.paidAmount ?? booking?.paidAmount,
      remainingAmount: bookingDetail?.remainingAmount ?? booking?.remainingAmount,
      mode,
      checkedIn: booking?.checkedIn,
    });

    const isUpdatingStatus = updateStatusMutation.isPending;

    // Provide effective BookingItem for action handlers (edit, check-in, check-out, cancel)
    const getEffectiveBooking = (): BookingItem | null => {
      if (!bookingDetail) return booking ?? null;
      const firstDetail = bookingDetail.details?.[0];
      const lastDetail = bookingDetail.details?.[bookingDetail.details.length - 1];
      const courtNames =
        bookingDetail.details?.map((d) => d.courtName).filter(Boolean).join(', ') ||
        bookingDetail.courtName ||
        booking?.courtName ||
        '';
      const targetDate =
        firstDetail?.bookingDate || bookingDetail.bookingDate || booking?.date || '';
      const targetStartTime =
        firstDetail?.startTime || bookingDetail.startTime || booking?.startTime || '';
      const targetEndTime =
        lastDetail?.endTime || bookingDetail.endTime || booking?.endTime || '';

      const paymentLower = (
        bookingDetail.paymentStatus || booking?.paymentStatus || 'unpaid'
      ).toLowerCase();

      return {
        id: bookingDetail.bookingId,
        bookingNumber: bookingDetail.bookingCode || bookingDetail.bookingId,
        courtId: firstDetail?.courtId || booking?.courtId || '',
        courtName: courtNames,
        customerName: bookingDetail.customerName || booking?.customerName || '',
        phoneNumber: bookingDetail.phoneNumber || booking?.phoneNumber || '',
        date: targetDate,
        startTime: targetStartTime,
        endTime: targetEndTime,
        bookingType: toBookingTypeEnum(bookingDetail.bookingType),
        bookingStatus: bookingDetail.bookingStatus || booking?.bookingStatus || 'Pending',
        paymentStatus: paymentLower as any,
        totalAmount: capabilities.totalAmount,
        paidAmount: capabilities.paidAmount,
        remainingAmount: capabilities.remainingAmount,
        notes: bookingDetail.notes ?? booking?.notes,
        checkedIn: capabilities.isCheckedIn,
        checkedOut: capabilities.isCompleted,
      };
    };

    // Handler: Check-in booking (PATCH /api/bookings/{id} with status: "CHECKED_IN")
    const handleCheckInClick = async () => {
      if (!targetBookingId || capabilities.isCheckedIn || isUpdatingStatus) return;

      try {
        await updateStatusMutation.mutateAsync({
          bookingId: targetBookingId,
          status: 'CHECKED_IN',
        });
        toast.success(t('courtStatus.detail.checkInSuccess', 'Check-in thành công!'));
        const eff = getEffectiveBooking();
        if (eff) onCheckIn?.({ ...eff, checkedIn: true, bookingStatus: 'CHECKED_IN' });
      } catch (err: unknown) {
        const errorMsg =
          (err as Error)?.message ||
          t('common.somethingWentWrong', 'Đã xảy ra lỗi vui lòng thử lại sau.');
        toast.error(t('courtStatus.detail.checkInError', 'Không thể cập nhật Check-in'), errorMsg);
      }
    };

    // Handler: Cancel booking (PATCH /api/bookings/{id} with status: "CANCELLED")
    const handleCancelClick = async () => {
      if (!targetBookingId || capabilities.isCancelled || isUpdatingStatus) return;

      const customerDisplay = bookingDetail?.customerName || booking?.customerName || '';
      const confirmMsg = customerDisplay
        ? t(
            'courtStatus.detail.confirmCancelWithCustomer',
            `Bạn có chắc chắn muốn hủy lịch đặt của ${customerDisplay}?`,
          )
        : t(
            'courtStatus.detail.confirmCancel',
            'Bạn có chắc chắn muốn hủy lịch đặt sân này không?',
          );

      if (!window.confirm(confirmMsg)) return;

      try {
        await updateStatusMutation.mutateAsync({
          bookingId: targetBookingId,
          status: 'CANCELLED',
        });
        toast.success(t('courtStatus.detail.cancelSuccess', 'Hủy lịch đặt sân thành công!'));
        const eff = getEffectiveBooking();
        if (eff) onCancel?.({ ...eff, bookingStatus: 'CANCELLED' });
        onClose();
      } catch (err: unknown) {
        const errorMsg =
          (err as Error)?.message ||
          t('common.somethingWentWrong', 'Đã xảy ra lỗi vui lòng thử lại sau.');
        toast.error(t('courtStatus.detail.cancelError', 'Không thể hủy lịch đặt sân'), errorMsg);
      }
    };

    // Callback when check-out dialog completes successfully
    const handleCheckOutSuccess = () => {
      const eff = getEffectiveBooking();
      if (eff) {
        onCheckOut?.({
          ...eff,
          checkedOut: true,
          bookingStatus: 'COMPLETED',
        });
      }
      onClose();
    };

    return (
      <>
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
          <SheetContent
            side="right"
            className="flex w-full flex-col justify-between overflow-y-auto sm:max-w-md"
          >
            <div>
              <SheetHeader className="border-b border-slate-200 pb-4">
                <div className="flex items-start justify-between gap-3 pr-6">
                  <div>
                    <SheetTitle className="text-xl font-bold text-slate-900">
                      {t('courtStatus.detail.title', 'Chi tiết đặt sân')}
                    </SheetTitle>
                    <SheetDescription className="mt-0.5 text-xs text-slate-500">
                      {t(
                        'courtStatus.detail.subtitle',
                        'Thông tin lịch đặt sân và trạng thái thanh toán',
                      )}
                    </SheetDescription>
                  </div>
                  {bookingDetail && (
                    <div className="shrink-0 pt-0.5">
                      <BookingStatusBadge status={bookingDetail.bookingStatus} size="sm" />
                    </div>
                  )}
                </div>
              </SheetHeader>

              <div className="py-2">
                {isLoading ? (
                  <BookingDetailSkeleton />
                ) : isError ? (
                  <div
                    role="alert"
                    className="flex flex-col items-center justify-center space-y-3 px-4 py-12 text-center"
                  >
                    <div className="flex size-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                      <AlertTriangle className="size-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {t('courtStatus.detail.loadError', 'Không thể tải chi tiết đặt sân.')}
                      </h3>
                      <p className="mt-1 max-w-xs text-xs text-slate-500">
                        {mode === 'CUSTOMER'
                          ? 'Không thể tải chi tiết đặt sân. Vui lòng thử lại.'
                          : error?.message ||
                            t('common.somethingWentWrong', 'Đã xảy ra lỗi vui lòng thử lại sau.')}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => void refetch()}
                      className="cursor-pointer gap-1.5 text-xs font-semibold"
                    >
                      <RotateCcw className="size-3.5" />
                      {t('common.retry', 'Thử lại')}
                    </Button>
                  </div>
                ) : !bookingDetail ? (
                  <div
                    role="status"
                    className="flex flex-col items-center justify-center space-y-3 px-4 py-12 text-center"
                  >
                    <div className="flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                      <AlertCircle className="size-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">
                        {t('courtStatus.detail.notFound', 'Không tìm thấy thông tin đặt sân.')}
                      </h3>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {t(
                          'courtStatus.detail.notFoundDesc',
                          'Lịch đặt có thể đã bị xóa hoặc không tồn tại.',
                        )}
                      </p>
                    </div>
                  </div>
                ) : (
                  <BookingDetails booking={bookingDetail} showNotes={mode !== 'CUSTOMER'} />
                )}
              </div>
            </div>

            {/* Lifecycle Action Area */}
            {bookingDetail && (
              <div className="sticky bottom-0 mt-4 flex flex-col gap-2.5 border-t border-slate-200 bg-white pt-3 pb-2">
                {/* Financial overview banner */}
                <div className="flex items-center justify-between rounded-lg border border-slate-150 bg-slate-50/80 px-3 py-1.5 text-xs">
                  <span className="text-slate-600 font-medium">Số tiền còn lại:</span>
                  <span
                    className={`font-bold ${
                      capabilities.remainingAmount > 0 ? 'text-rose-600' : 'text-emerald-700'
                    }`}
                  >
                    {capabilities.remainingAmount > 0
                      ? formatCurrency(capabilities.remainingAmount)
                      : 'Đã thanh toán đủ'}
                  </span>
                </div>

                {/* Primary Action Buttons */}
                {!capabilities.isReadOnly ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      {/* Edit Button */}
                      {capabilities.canEdit && onEdit && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="flex-1 cursor-pointer text-xs font-semibold"
                          onClick={() => {
                            const eff = getEffectiveBooking();
                            if (eff) onEdit(eff);
                          }}
                          disabled={isUpdatingStatus}
                        >
                          <Edit className="mr-1 size-3.5 text-blue-600" />
                          {t('common.edit', 'Chỉnh sửa')}
                        </Button>
                      )}

                      {/* Payment Button (when balance remaining) */}
                      {capabilities.canPay && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="flex-1 cursor-pointer border-blue-200 bg-blue-50/60 text-xs font-semibold text-blue-700 hover:bg-blue-100 hover:text-blue-800"
                          onClick={() => setIsPaymentModalOpen(true)}
                          disabled={isUpdatingStatus}
                        >
                          <CreditCard className="mr-1 size-3.5 text-blue-600" />
                          {t('courtStatus.detail.payAction', 'Thanh toán')}
                        </Button>
                      )}

                      {/* Check-in Button */}
                      {capabilities.canCheckIn && (
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          className="flex-1 cursor-pointer text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
                          onClick={handleCheckInClick}
                          disabled={isUpdatingStatus}
                        >
                          {isUpdatingStatus &&
                          updateStatusMutation.variables?.status === 'CHECKED_IN' ? (
                            <>
                              <Loader2 className="mr-1 size-3.5 animate-spin" />
                              {t('courtStatus.detail.checkingIn', 'Đang Check-in...')}
                            </>
                          ) : (
                            <>
                              <LogIn className="mr-1 size-3.5" />
                              {t('courtStatus.detail.checkIn', 'Check-in')}
                            </>
                          )}
                        </Button>
                      )}

                      {/* Check-out Button (when already checked in / playing) */}
                      {capabilities.canCheckOut && (
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          className="flex-1 cursor-pointer text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-2xs"
                          onClick={() => setIsCheckOutModalOpen(true)}
                          disabled={isUpdatingStatus}
                        >
                          <CheckCircle2 className="mr-1 size-3.5" />
                          {t('courtStatus.detail.checkOut', 'Check-out & Trả sân')}
                        </Button>
                      )}
                    </div>

                    {/* Cancel Booking Button */}
                    {capabilities.canCancel && (
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        className="w-full cursor-pointer text-xs font-semibold"
                        onClick={handleCancelClick}
                        disabled={isUpdatingStatus}
                      >
                        {isUpdatingStatus &&
                        updateStatusMutation.variables?.status === 'CANCELLED' ? (
                          <>
                            <Loader2 className="mr-1 size-3.5 animate-spin" />
                            {t('courtStatus.detail.cancelling', 'Đang hủy lịch...')}
                          </>
                        ) : (
                          <>
                            <Trash2 className="mr-1 size-3.5" />
                            {t('courtStatus.detail.cancelBooking', 'Hủy lịch đặt sân')}
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                ) : capabilities.isCompleted ? (
                  <div className="flex items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 py-2.5 text-xs font-semibold text-emerald-800">
                    <CheckCircle2 className="size-4 text-emerald-600" />
                    <span>{t('courtStatus.detail.completedNotice', 'Lịch đặt sân đã hoàn tất')}</span>
                  </div>
                ) : capabilities.isCancelled ? (
                  <div className="flex items-center justify-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 py-2.5 text-xs font-semibold text-rose-700">
                    <AlertTriangle className="size-4 text-rose-600" />
                    <span>{t('courtStatus.detail.cancelledNotice', 'Lịch đặt sân đã bị hủy')}</span>
                  </div>
                ) : null}
              </div>
            )}
          </SheetContent>
        </Sheet>

        {/* Check-Out Review & Payment Settlement Dialog */}
        {bookingDetail && (
          <CheckOutBookingDialog
            isOpen={isCheckOutModalOpen}
            onClose={() => setIsCheckOutModalOpen(false)}
            booking={bookingDetail}
            onConfirmSuccess={handleCheckOutSuccess}
          />
        )}

        {/* Quick Mid-Session Payment Dialog */}
        {bookingDetail && (
          <BookingPaymentDialog
            isOpen={isPaymentModalOpen}
            onClose={() => setIsPaymentModalOpen(false)}
            booking={bookingDetail}
            onPaymentSuccess={() => {
              void refetch();
            }}
          />
        )}
      </>
    );
  },
);

BookingDetailDrawer.displayName = 'BookingDetailDrawer';
export default BookingDetailDrawer;
