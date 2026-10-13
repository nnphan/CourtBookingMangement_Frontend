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
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  AlertCircle,
  RotateCcw,
  Edit,
  LogIn,
  Trash2,
} from 'lucide-react';
import { toBookingTypeEnum } from '../utils/booking.utils';

export interface BookingDetailDrawerProps {
  bookingId?: string | null;
  booking?: BookingItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (booking: BookingItem) => void;
  onCheckIn?: (booking: BookingItem) => void;
  onCancel?: (booking: BookingItem) => void;
}

export const BookingDetailDrawer: React.FC<BookingDetailDrawerProps> = memo(
  ({ bookingId, booking, isOpen, onClose, onEdit, onCheckIn, onCancel }) => {
    const { t } = useTranslation();

    // Priority: Explicit bookingId prop, fallback to booking?.id
    const targetBookingId = bookingId ?? booking?.id;

    // Fetch latest booking detail directly from backend API
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
      if (booking) return booking;
      if (!bookingDetail) return null;
      return {
        id: bookingDetail.bookingId,
        bookingNumber: bookingDetail.bookingCode || bookingDetail.bookingId,
        courtId: '',
        courtName: bookingDetail.courtName,
        customerName: bookingDetail.customerName,
        phoneNumber: bookingDetail.phoneNumber,
        date: bookingDetail.bookingDate,
        startTime: bookingDetail.startTime,
        endTime: bookingDetail.endTime,
        bookingType: toBookingTypeEnum(bookingDetail.bookingType),
        bookingStatus: bookingDetail.bookingStatus,
        paymentStatus: 'unpaid',
        totalAmount: bookingDetail.totalAmount,
        remainingAmount: bookingDetail.remainingAmount,
        notes: bookingDetail.notes || undefined,
      };
    };

    return (
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto flex flex-col justify-between">
          <div>
            <SheetHeader className="pb-4 border-b border-slate-200">
              <SheetTitle className="text-xl font-bold text-slate-900">
                {t('courtStatus.detail.title', 'Chi tiết đặt sân')}
              </SheetTitle>
              <SheetDescription className="text-xs text-slate-500">
                {t('courtStatus.detail.subtitle', 'Thông tin lịch đặt sân và trạng thái thanh toán')}
              </SheetDescription>
            </SheetHeader>

            <div className="py-2">
              {isLoading ? (
                <BookingDetailSkeleton />
              ) : isError ? (
                <div
                  role="alert"
                  className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-3"
                >
                  <div className="size-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                    <AlertTriangle className="size-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {t('courtStatus.detail.loadError', 'Không thể tải chi tiết đặt sân.')}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs">
                      {error?.message || t('common.somethingWentWrong', 'Đã xảy ra lỗi vui lòng thử lại sau.')}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void refetch()}
                    className="gap-1.5 text-xs font-semibold cursor-pointer"
                  >
                    <RotateCcw className="size-3.5" />
                    {t('common.retry', 'Thử lại')}
                  </Button>
                </div>
              ) : !bookingDetail ? (
                <div
                  role="status"
                  className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-3"
                >
                  <div className="size-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
                    <AlertCircle className="size-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      {t('courtStatus.detail.notFound', 'Không tìm thấy thông tin đặt sân.')}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {t('courtStatus.detail.notFoundDesc', 'Lịch đặt có thể đã bị xóa hoặc không tồn tại.')}
                    </p>
                  </div>
                </div>
              ) : (
                <BookingDetails booking={bookingDetail} />
              )}
            </div>
          </div>

          {/* Action buttons (only displayed when booking detail is loaded) */}
          {bookingDetail && (
            <div className="flex flex-col gap-2 pt-3 pb-2 border-t border-slate-200 mt-4 sticky bottom-0 bg-white">
              <div className="flex gap-2">
                {onEdit && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs font-semibold cursor-pointer"
                    onClick={() => {
                      const eff = getEffectiveBooking();
                      if (eff) onEdit(eff);
                    }}
                  >
                    <Edit className="size-3.5 mr-1 text-blue-600" />
                    {t('common.edit', 'Chỉnh sửa')}
                  </Button>
                )}

                {onCheckIn && (
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    className="flex-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                    onClick={() => {
                      const eff = getEffectiveBooking();
                      if (eff) onCheckIn(eff);
                    }}
                    disabled={booking?.checkedIn}
                  >
                    <LogIn className="size-3.5 mr-1" />
                    {booking?.checkedIn ? t('courtStatus.detail.checkedIn', 'Đã Check-in') : t('courtStatus.detail.checkIn', 'Check-in')}
                  </Button>
                )}
              </div>

              {onCancel && (
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  className="w-full text-xs font-semibold cursor-pointer"
                  onClick={() => {
                    const eff = getEffectiveBooking();
                    if (eff) onCancel(eff);
                  }}
                >
                  <Trash2 className="size-3.5 mr-1" />
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
