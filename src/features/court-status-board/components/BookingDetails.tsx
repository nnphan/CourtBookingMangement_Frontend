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
  Activity,
  Layers,
} from 'lucide-react';
import type { BookingDetailDto } from '@/features/bookings/types/booking.types';
import {
  mapBookingTypeToLabel,
  mapPaymentMethod,
  mapPaymentStatus,
  formatBookingDate,
  formatBookingTime,
  calculateBookingDuration,
  formatCurrency,
} from '@/features/bookings/utils/booking.mapper';
import { BookingStatusBadge } from './BookingStatusBadge';
import { cn } from '@/lib/utils';

interface BookingDetailsProps {
  booking: BookingDetailDto;
  showNotes?: boolean;
}

export const BookingDetails: React.FC<BookingDetailsProps> = memo(
  ({ booking, showNotes = true }) => {
    const { t } = useTranslation();

    const paymentStatusConfig = mapPaymentStatus(booking.paymentStatus);
    const details = booking.details ?? [];
    const firstDetail = details[0];
    const lastDetail = details[details.length - 1];

    const bookingDate = booking.bookingDate || firstDetail?.bookingDate;
    const formattedDate = formatBookingDate(bookingDate);

    const rawStartTime = booking.startTime || firstDetail?.startTime;
    const rawEndTime = booking.endTime || lastDetail?.endTime;
    const startTime = formatBookingTime(rawStartTime);
    const endTime = formatBookingTime(rawEndTime);
    const duration = calculateBookingDuration(rawStartTime, rawEndTime);

    const bookingTypeLabel = mapBookingTypeToLabel(booking.bookingType);
    const paymentMethodLabel = mapPaymentMethod(booking.paymentMethod);

    const remainingAmount =
      booking.remainingAmount ??
      Math.max(0, (booking.totalAmount ?? 0) - (booking.paidAmount ?? 0));

    const courtNames =
      details.map((d) => d.courtName).filter(Boolean).join(', ') ||
      booking.courtName ||
      '-';

    return (
      <div className="space-y-4 py-2 text-sm">
        {/* Header Info: Booking Code & Status Badge */}
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 shadow-2xs">
          <div>
            <div className="text-[11px] font-medium tracking-wider text-slate-500 uppercase">
              {t('courtStatus.detail.bookingCode', 'Mã đặt sân')}
            </div>
            <div className="mt-0.5 font-mono text-sm font-bold text-slate-900 select-all">
              {booking.bookingCode || booking.bookingId}
            </div>
          </div>
          <BookingStatusBadge status={booking.bookingStatus} size="md" />
        </div>

        {/* Customer Information Section */}
        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <h4 className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-slate-500 uppercase">
            <User className="size-3.5 text-blue-600" />
            {t('courtStatus.detail.customerInfo', 'Khách hàng')}
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Họ và tên:</span>
              <span className="text-sm font-semibold text-slate-900">
                {booking.customerName || '-'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Số điện thoại:</span>
              {booking.phoneNumber ? (
                <a
                  href={`tel:${booking.phoneNumber}`}
                  className="flex items-center gap-1.5 font-semibold text-blue-600 hover:text-blue-700 hover:underline"
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
        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <h4 className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-slate-500 uppercase">
            <MapPin className="size-3.5 text-emerald-600" />
            {t('courtStatus.detail.bookingInfo', 'Thông tin sân')}
          </h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-start gap-2 text-slate-700">
              <MapPin className="mt-0.5 size-4 shrink-0 text-emerald-600" />
              <div>
                <div className="text-[10px] text-slate-400">Chi nhánh</div>
                <div className="font-semibold text-slate-900">{booking.branchName || '-'}</div>
              </div>
            </div>

            <div className="flex items-start gap-2 text-slate-700">
              <Layers className="mt-0.5 size-4 shrink-0 text-emerald-600" />
              <div>
                <div className="text-[10px] text-slate-400">Sân đấu</div>
                <div className="font-semibold text-slate-900">{courtNames}</div>
              </div>
            </div>

            <div className="flex items-start gap-2 text-slate-700">
              <Calendar className="mt-0.5 size-4 shrink-0 text-emerald-600" />
              <div>
                <div className="text-[10px] text-slate-400">Ngày đặt</div>
                <div className="font-semibold text-slate-900">{formattedDate}</div>
              </div>
            </div>

            <div className="flex items-start gap-2 text-slate-700">
              <Clock className="mt-0.5 size-4 shrink-0 text-emerald-600" />
              <div>
                <div className="text-[10px] text-slate-400">Thời gian</div>
                <div className="font-semibold text-slate-900">
                  {startTime} - {endTime}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 text-slate-700">
              <Hourglass className="mt-0.5 size-4 shrink-0 text-emerald-600" />
              <div>
                <div className="text-[10px] text-slate-400">Thời lượng</div>
                <div className="font-semibold text-slate-900">{duration}</div>
              </div>
            </div>
          </div>

          {/* Detailed Court Schedule Items (when details array has records) */}
          {details.length > 0 && (
            <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
              <div className="text-[11px] font-semibold text-slate-500">
                Chi tiết sân ({details.length}):
              </div>
              <div className="space-y-1.5">
                {details.map((detail) => (
                  <div
                    key={detail.bookingDetailId}
                    className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1.5 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-700">{detail.courtName}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-600">
                        {formatBookingTime(detail.startTime)} - {formatBookingTime(detail.endTime)}
                      </span>
                    </div>
                    {detail.price !== undefined && (
                      <span className="font-semibold text-slate-800">
                        {formatCurrency(detail.price)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Booking Type Section */}
        <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <h4 className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-slate-500 uppercase">
            <Tag className="size-3.5 text-purple-600" />
            {t('courtStatus.detail.bookingType', 'Loại đặt sân')}
          </h4>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Hình thức đặt:</span>
            <span className="rounded-md border border-purple-200 bg-purple-50 px-2 py-0.5 font-bold text-purple-700">
              {bookingTypeLabel}
            </span>
          </div>
        </div>

        {/* Booking Status Section */}
        <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <h4 className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-slate-500 uppercase">
            <Activity className="size-3.5 text-blue-600" />
            {t('courtStatus.detail.bookingStatusSection', 'Trạng thái đặt sân')}
          </h4>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Tình trạng:</span>
            <BookingStatusBadge status={booking.bookingStatus} size="md" />
          </div>
        </div>

        {/* Payment Information Section */}
        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <h4 className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-slate-500 uppercase">
            <CreditCard className="size-3.5 text-emerald-600" />
            {t('courtStatus.detail.paymentInfo', 'Thông tin thanh toán')}
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span>Phương thức:</span>
              <span className="font-semibold text-slate-900">{paymentMethodLabel}</span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span>Trạng thái:</span>
              <span
                className={cn(
                  'rounded-full border px-2 py-0.5 text-[11px] font-bold uppercase shadow-2xs',
                  paymentStatusConfig.badgeClass,
                )}
              >
                {paymentStatusConfig.label}
              </span>
            </div>

            <div className="my-2 h-px bg-slate-100" />

            <div className="flex items-center justify-between text-slate-600">
              <span>Tổng tiền:</span>
              <span className="text-sm font-bold text-slate-900">
                {formatCurrency(booking.totalAmount)}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span>Đã thanh toán:</span>
              <span className="font-semibold text-emerald-600">
                {formatCurrency(booking.paidAmount)}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span>Còn lại:</span>
              <span
                className={cn(
                  'font-bold',
                  remainingAmount > 0 ? 'text-red-600' : 'text-slate-700',
                )}
              >
                {formatCurrency(remainingAmount)}
              </span>
            </div>
          </div>
        </div>

        {showNotes && (
          <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
            <h4 className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-slate-500 uppercase">
              <FileText className="size-3.5 text-slate-400" />
              {t('courtStatus.detail.notes', 'Ghi chú')}
            </h4>
            <p className="rounded-lg border border-slate-150 bg-slate-50/80 p-2.5 text-xs text-slate-700 italic">
              {booking.notes && booking.notes.trim() ? booking.notes : 'Không có ghi chú.'}
            </p>
          </div>
        )}
      </div>
    );
  },
);

BookingDetails.displayName = 'BookingDetails';
export default BookingDetails;
