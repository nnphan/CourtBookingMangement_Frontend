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
import { getStatusConfig } from '../constants/booking-status';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Award,
  CreditCard,
  ShoppingBag,
  FileText,
  Edit,
  LogIn,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BookingDetailDrawerProps {
  booking: BookingItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (booking: BookingItem) => void;
  onCheckIn: (booking: BookingItem) => void;
  onCancel: (booking: BookingItem) => void;
}

export const BookingDetailDrawer: React.FC<BookingDetailDrawerProps> = memo(
  ({ booking, isOpen, onClose, onEdit, onCheckIn, onCancel }) => {
    const { t } = useTranslation();

    if (!booking) return null;

    const statusCfg = getStatusConfig(booking.bookingType);

    return (
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader className="pb-4 border-b border-slate-200">
            <div className="flex items-center justify-between pr-6">
              <span
                className="px-2.5 py-1 rounded-full text-xs font-semibold"
                style={{ backgroundColor: statusCfg.color, color: statusCfg.textColor }}
              >
                {statusCfg.name}
              </span>
              <span className="text-xs font-mono text-slate-500">{booking.bookingNumber}</span>
            </div>
            <SheetTitle className="text-xl font-bold text-slate-900 mt-2">
              {t('courtStatus.detail.title', 'Chi tiết đặt sân')}
            </SheetTitle>
            <SheetDescription className="text-xs text-slate-500">
              {t('courtStatus.detail.subtitle', 'Thông tin lịch đặt sân và trạng thái thanh toán')}
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-5 py-4 text-sm">
            {/* Booking Information */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {t('courtStatus.detail.bookingInfo', 'Thông tin đặt sân')}
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <MapPin className="size-4 text-emerald-600 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-400">Sân đấu</div>
                    <div className="font-semibold text-slate-900">{booking.courtName}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-700">
                  <Calendar className="size-4 text-emerald-600 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-400">Ngày đặt</div>
                    <div className="font-semibold text-slate-900">{booking.date}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-700 col-span-2">
                  <Clock className="size-4 text-emerald-600 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-400">Khung giờ</div>
                    <div className="font-semibold text-slate-900">
                      {booking.startTime} - {booking.endTime}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {t('courtStatus.detail.customerInfo', 'Thông tin khách hàng')}
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-700">
                    <User className="size-4 text-blue-600 shrink-0" />
                    <span className="font-semibold text-slate-900">{booking.customerName}</span>
                  </div>
                  {booking.membership && (
                    <span className="flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-200">
                      <Award className="size-3 text-amber-600" />
                      {booking.membership}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-slate-700">
                  <Phone className="size-4 text-blue-600 shrink-0" />
                  <a href={`tel:${booking.phoneNumber}`} className="text-blue-600 hover:underline">
                    {booking.phoneNumber}
                  </a>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {t('courtStatus.detail.paymentInfo', 'Thông tin thanh toán')}
              </h4>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Trạng thái:</span>
                  <span className="font-semibold text-slate-900 uppercase">
                    {booking.paymentStatus === 'paid' ? 'Đã thanh toán đủ' : 'Chưa hoàn tất'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Tiền cọc:</span>
                  <span className="font-medium text-slate-800">
                    {(booking.depositAmount ?? 0).toLocaleString('vi-VN')} đ
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Còn lại cần thu:</span>
                  <span className="font-bold text-red-600">
                    {(booking.remainingAmount ?? 0).toLocaleString('vi-VN')} đ
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
                  <span className="flex items-center gap-1.5">
                    <CreditCard className="size-4 text-emerald-600" />
                    Tổng cộng:
                  </span>
                  <span className="text-emerald-700">
                    {(booking.totalAmount ?? 0).toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </div>
            </div>

            {/* Additional Services */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                <span>{t('courtStatus.detail.services', 'Dịch vụ cộng thêm')}</span>
                <ShoppingBag className="size-3.5 text-slate-400" />
              </h4>
              {booking.services && booking.services.length > 0 ? (
                <div className="space-y-1.5 text-xs">
                  {booking.services.map((srv) => (
                    <div key={srv.id} className="flex justify-between items-center text-slate-700">
                      <span>
                        {srv.name} (x{srv.quantity})
                      </span>
                      <span className="font-medium">
                        {srv.totalPrice.toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-400 italic">
                  Chưa chọn dịch vụ thêm (Cầu lông, thuê vợt, nước suối...)
                </div>
              )}
            </div>

            {/* Notes */}
            {booking.notes && (
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <FileText className="size-3 text-slate-400" />
                  Ghi chú
                </h4>
                <p className="text-xs text-slate-700 italic">{booking.notes}</p>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2 pt-2 border-t border-slate-200">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                onClick={() => onEdit(booking)}
              >
                <Edit className="size-3.5 mr-1 text-blue-600" />
                Chỉnh sửa
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="flex-1 text-xs bg-emerald-600 hover:bg-emerald-700"
                onClick={() => onCheckIn(booking)}
                disabled={booking.checkedIn}
              >
                <LogIn className="size-3.5 mr-1" />
                {booking.checkedIn ? 'Đã Check-in' : 'Check-in'}
              </Button>
            </div>
            <Button
              variant="danger"
              size="sm"
              className="w-full text-xs"
              onClick={() => onCancel(booking)}
            >
              <Trash2 className="size-3.5 mr-1" />
              Hủy lịch đặt sân
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    );
  },
);

BookingDetailDrawer.displayName = 'BookingDetailDrawer';
