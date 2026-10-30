import React, { memo } from 'react';
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
import { BookingDetails } from './BookingDetails';
import { BookingDetailSkeleton } from './BookingDetailSkeleton';
import { BookingStatusBadge } from './BookingStatusBadge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, AlertCircle, RotateCcw, Edit, LogIn, Trash2 } from 'lucide-react';
import { toBookingTypeEnum } from '../utils/booking.utils';

export interface BookingDetailDrawerProps {
  bookingId?: string | null;
  booking?: BookingItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (booking: BookingItem) => void;
  onCheckIn?: (booking: BookingItem) => void;
  onCancel?: (booking: BookingItem) => void;
  mode?: 'ADMIN' | 'CUSTOMER';
}

export const BookingDetailDrawer: React.FC<BookingDetailDrawerProps> = memo(
  ({ bookingId, booking, isOpen, onClose, onEdit, onCheckIn, onCancel, mode = 'ADMIN' }) => {
    const { t } = useTranslation();

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

    // Provide effective BookingItem for action handlers (edit, check-in, cancel)
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
      const total = bookingDetail.totalAmount ?? booking?.totalAmount ?? 0;
      const paid = bookingDetail.paidAmount ?? 0;
      const remaining =
        bookingDetail.remainingAmount ?? Math.max(0, total - paid);

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
        totalAmount: total,
        paidAmount: paid,
        remainingAmount: remaining,
        notes: bookingDetail.notes ?? booking?.notes,
        checkedIn: booking?.checkedIn,
        checkedOut: booking?.checkedOut,
      };
    };

    return (
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

          {/* Action buttons (only displayed when booking detail is loaded) */}
          {bookingDetail && (
            <div className="sticky bottom-0 mt-4 flex flex-col gap-2 border-t border-slate-200 bg-white pt-3 pb-2">
              <div className="flex gap-2">
                {onEdit && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1 cursor-pointer text-xs font-semibold"
                    onClick={() => {
                      const eff = getEffectiveBooking();
                      if (eff) onEdit(eff);
                    }}
                  >
                    <Edit className="mr-1 size-3.5 text-blue-600" />
                    {t('common.edit', 'Chỉnh sửa')}
                  </Button>
                )}

                {onCheckIn && (
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    className="flex-1 cursor-pointer bg-emerald-600 text-xs font-semibold text-white hover:bg-emerald-700"
                    onClick={() => {
                      const eff = getEffectiveBooking();
                      if (eff) onCheckIn(eff);
                    }}
                    disabled={booking?.checkedIn}
                  >
                    <LogIn className="mr-1 size-3.5" />
                    {booking?.checkedIn
                      ? t('courtStatus.detail.checkedIn', 'Đã Check-in')
                      : t('courtStatus.detail.checkIn', 'Check-in')}
                  </Button>
                )}
              </div>

              {onCancel && (
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  className="w-full cursor-pointer text-xs font-semibold"
                  onClick={() => {
                    const eff = getEffectiveBooking();
                    if (eff) onCancel(eff);
                  }}
                >
                  <Trash2 className="mr-1 size-3.5" />
                  {t('courtStatus.detail.cancelBooking', 'Hủy lịch đặt sân')}
                </Button>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    );
  },
);

BookingDetailDrawer.displayName = 'BookingDetailDrawer';
export default BookingDetailDrawer;
