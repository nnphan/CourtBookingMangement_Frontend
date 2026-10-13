import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  Clock,
  MapPin,
  Tag,
  User,
  Phone,
  CreditCard,
  FileText,
  Hourglass,
  BadgeCheck,
} from 'lucide-react';
import type { BookingDetailDto } from '@/features/bookings/types/booking.types';
import {
  mapBookingStatus,
  mapBookingTypeToLabel,
  mapPaymentMethod,
  mapPaymentStatus,
  formatBookingDate,
  formatBookingTime,
  calculateBookingDuration,
  formatCurrency,
} from '@/features/bookings/utils/booking.mapper';
import { cn } from '@/lib/utils';

interface BookingDetailsProps {
  booking: BookingDetailDto;
}

export const BookingDetails: React.FC<BookingDetailsProps> = memo(({ booking }) => {
  const { t } = useTranslation();

  const statusConfig = mapBookingStatus(booking.bookingStatus);
  const paymentStatusConfig = mapPaymentStatus(booking.paymentStatus);
  const formattedDate = formatBookingDate(booking.bookingDate);
  const startTime = formatBookingTime(booking.startTime);
  const endTime = formatBookingTime(booking.endTime);
  const duration = calculateBookingDuration(booking.startTime, booking.endTime);
  const bookingTypeLabel = mapBookingTypeToLabel(booking.bookingType);
  const paymentMethodLabel = mapPaymentMethod(booking.paymentMethod);

  return (
    <div className="space-y-4 py-2 text-sm">
      {/* Header Info: Booking Code & Status Badge */}
      <div className="flex items-center justify-between p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            {t('courtStatus.detail.bookingCode', 'Mã đặt sân')}
          </div>
          <div className="text-sm font-mono font-bold text-slate-900 mt-0.5 select-all">
            {booking.bookingCode || booking.bookingId}
          </div>
        </div>
        <span
          className={cn(
            'px-2.5 py-1 rounded-full text-xs font-semibold border shadow-2xs flex items-center gap-1.5',
            statusConfig.badgeClass,
          )}
        >
          <BadgeCheck className="size-3.5" />
          {statusConfig.label}
        </span>
      </div>

      {/* Customer Information Section */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 shadow-2xs">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <User className="size-3.5 text-blue-600" />
          {t('courtStatus.detail.customerInfo', 'Khách hàng')}
        </h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Họ và tên:</span>
            <span className="font-semibold text-slate-900 text-sm">{booking.customerName || '-'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Số điện thoại:</span>
            {booking.phoneNumber ? (
              <a
                href={`tel:${booking.phoneNumber}`}
                className="font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1.5"
              >
                <Phone className="size-3 text-blue-500" />
                {booking.phoneNumber}
              </a>
            ) : (
              <span className="text-slate-400">-</span>
            )}
          </div>
        </div>
      </div>

      {/* Booking Information Section */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 shadow-2xs">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <MapPin className="size-3.5 text-emerald-600" />
          {t('courtStatus.detail.bookingInfo', 'Thông tin sân')}
        </h4>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-start gap-2 text-slate-700">
            <MapPin className="size-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-[10px] text-slate-400">Sân đấu</div>
              <div className="font-semibold text-slate-900">{booking.courtName || '-'}</div>
            </div>
          </div>

          <div className="flex items-start gap-2 text-slate-700">
            <Calendar className="size-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-[10px] text-slate-400">Ngày đặt</div>
              <div className="font-semibold text-slate-900">{formattedDate}</div>
            </div>
          </div>

          <div className="flex items-start gap-2 text-slate-700">
            <Clock className="size-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-[10px] text-slate-400">Thời gian</div>
              <div className="font-semibold text-slate-900">
                {startTime} - {endTime}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 text-slate-700">
            <Hourglass className="size-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-[10px] text-slate-400">Thời lượng</div>
              <div className="font-semibold text-slate-900">{duration}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Type Section */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2 shadow-2xs">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Tag className="size-3.5 text-purple-600" />
          {t('courtStatus.detail.bookingType', 'Loại đặt sân')}
        </h4>
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">Hình thức đặt:</span>
          <span className="font-bold text-slate-900 bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-md">
            {bookingTypeLabel}
          </span>
        </div>
      </div>

      {/* Payment Information Section */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 shadow-2xs">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <CreditCard className="size-3.5 text-emerald-600" />
          {t('courtStatus.detail.paymentInfo', 'Thông tin thanh toán')}
        </h4>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center text-slate-600">
            <span>Phương thức:</span>
            <span className="font-semibold text-slate-900">{paymentMethodLabel}</span>
          </div>

          <div className="flex justify-between items-center text-slate-600">
            <span>Trạng thái:</span>
            <span
              className={cn(
                'px-2 py-0.5 rounded-full text-[11px] font-bold uppercase border shadow-2xs',
                paymentStatusConfig.badgeClass,
              )}
            >
              {paymentStatusConfig.label}
            </span>
          </div>

          <div className="h-px bg-slate-100 my-2" />

          <div className="flex justify-between items-center text-slate-600">
            <span>Tổng tiền:</span>
            <span className="font-bold text-slate-900 text-sm">
              {formatCurrency(booking.totalAmount)}
            </span>
          </div>

          <div className="flex justify-between items-center text-slate-600">
            <span>Đã thanh toán:</span>
            <span className="font-semibold text-emerald-600">
              {formatCurrency(booking.paidAmount)}
            </span>
          </div>

          <div className="flex justify-between items-center text-slate-600">
            <span>Còn lại:</span>
            <span className={cn('font-bold', (booking.remainingAmount ?? 0) > 0 ? 'text-red-600' : 'text-slate-700')}>
              {formatCurrency(booking.remainingAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2 shadow-2xs">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <FileText className="size-3.5 text-slate-400" />
          {t('courtStatus.detail.notes', 'Ghi chú')}
        </h4>
        <p className="text-xs text-slate-700 italic bg-slate-50/80 p-2.5 rounded-lg border border-slate-150">
          {booking.notes && booking.notes.trim() ? booking.notes : 'Không có ghi chú.'}
        </p>
      </div>
    </div>
  );
});

BookingDetails.displayName = 'BookingDetails';
export default BookingDetails;
