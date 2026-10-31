import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { BookingDetailDto } from '@/features/bookings/types/booking.types';
import { useUpdateBookingStatus } from '@/features/bookings/hooks/useUpdateBookingStatus';
import {
  formatBookingDate,
  formatBookingTime,
  calculateBookingDuration,
  formatCurrency,
} from '@/features/bookings/utils/booking.mapper';
import {
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  Banknote,
  Loader2,
  Calendar,
  Layers,
  User,
  Phone,
  Copy,
  Check,
  MapPin,
  Clock,
  QrCode,
  ShieldCheck,
} from 'lucide-react';
import { toast } from '@/lib/toast';

export interface CheckOutBookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingDetailDto;
  onConfirmSuccess?: () => void;
}

export const CheckOutBookingDialog: React.FC<CheckOutBookingDialogProps> = ({
  isOpen,
  onClose,
  booking,
  onConfirmSuccess,
}) => {
  const { t } = useTranslation();
  const updateStatusMutation = useUpdateBookingStatus();

  const totalAmount = booking.totalAmount ?? 0;
  const paidAmount = booking.paidAmount ?? 0;
  const remainingAmount =
    booking.remainingAmount ?? Math.max(0, totalAmount - paidAmount);
  const hasOutstandingBalance = remainingAmount > 0;

  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'TRANSFER'>('CASH');
  const [isPaymentConfirmed, setIsPaymentConfirmed] = useState(!hasOutstandingBalance);
  const [copiedCode, setCopiedCode] = useState(false);

  const details = booking.details ?? [];

  const handleCopyCode = async () => {
    const code = booking.bookingCode || booking.bookingId;
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
      toast.success('Đã sao chép mã đặt sân');
    } catch {
      toast.error('Không thể sao chép');
    }
  };

  const handleConfirmCheckOut = async () => {
    if (hasOutstandingBalance && !isPaymentConfirmed) {
      toast.error(
        t('courtStatus.checkout.paymentRequiredTitle', 'Chưa xác nhận thanh toán'),
        t(
          'courtStatus.checkout.paymentRequiredDesc',
          'Vui lòng xác nhận đã thu đủ số tiền còn lại trước khi hoàn tất check-out.',
        ),
      );
      return;
    }

    try {
      await updateStatusMutation.mutateAsync({
        bookingId: booking.bookingId,
        status: 'COMPLETED',
      });

      toast.success(
        t('courtStatus.checkout.successTitle', 'Check-out thành công!'),
        t(
          'courtStatus.checkout.successDesc',
          `Lịch đặt ${booking.bookingCode || ''} đã được hoàn tất và trả sân thành công.`,
        ),
      );

      onConfirmSuccess?.();
      onClose();
    } catch (err: unknown) {
      const errorMsg =
        (err as Error)?.message ||
        t('common.somethingWentWrong', 'Đã xảy ra lỗi vui lòng thử lại sau.');
      toast.error(
        t('courtStatus.checkout.errorTitle', 'Không thể hoàn tất Check-out'),
        errorMsg,
      );
    }
  };

  const isPending = updateStatusMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isPending && onClose()}>
      <DialogContent className="max-w-xl p-0 overflow-hidden sm:rounded-2xl border-slate-200">
        {/* Header with emerald gradient accent */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-slate-800 p-5 text-white">
          <DialogHeader className="text-left space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="flex size-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-md text-white shadow-inner">
                <CheckCircle2 className="size-5.5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-white tracking-tight">
                  {t('courtStatus.checkout.title', 'Xác nhận Check-out & Hoàn tất')}
                </DialogTitle>
                <DialogDescription className="text-xs text-emerald-100">
                  {t(
                    'courtStatus.checkout.subtitle',
                    'Kiểm tra chi tiết sân và xác nhận hoàn tất thanh toán trước khi trả sân',
                  )}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Content Body */}
        <div className="max-h-[70vh] space-y-4 overflow-y-auto px-5 py-4 text-xs">
          {/* Customer & Booking Code Card */}
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-[11px]">
                  <User className="size-3.5" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-medium">Khách hàng</div>
                  <div className="font-bold text-slate-900 text-xs">
                    {booking.customerName || t('common.guest', 'Khách vãng lai')}
                  </div>
                </div>
              </div>

              {booking.phoneNumber && (
                <a
                  href={`tel:${booking.phoneNumber}`}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-blue-600 hover:bg-blue-50 transition-colors shadow-2xs"
                >
                  <Phone className="size-3 text-blue-500" />
                  <span>{booking.phoneNumber}</span>
                </a>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-slate-200/70 pt-2 text-[11px] text-slate-500">
              <div className="flex items-center gap-1.5">
                <span>Mã đặt sân:</span>
                <span className="font-mono font-bold text-slate-900">
                  {booking.bookingCode || booking.bookingId}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer rounded"
                  title="Sao chép mã"
                  aria-label="Sao chép mã đặt sân"
                >
                  {copiedCode ? (
                    <Check className="size-3 text-emerald-600" />
                  ) : (
                    <Copy className="size-3" />
                  )}
                </button>
              </div>

              {booking.branchName && (
                <div className="flex items-center gap-1 text-slate-600">
                  <MapPin className="size-3 text-emerald-600" />
                  <span className="font-medium">{booking.branchName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Multi-court Schedule Breakdown */}
          <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Layers className="size-4 text-emerald-600" />
                <span>Danh sách sân sử dụng</span>
              </div>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                {details.length || 1} sân
              </span>
            </div>

            <div className="space-y-2">
              {details.length > 0 ? (
                details.map((item, idx) => (
                  <div
                    key={item.bookingDetailId || idx}
                    className="flex items-center justify-between rounded-xl border border-slate-150 bg-slate-50/60 p-2.5 text-xs hover:border-slate-300 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-bold text-emerald-800 text-[11px]">
                          {item.courtName}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500">
                          <Calendar className="size-3 text-slate-400" />
                          <span>{formatBookingDate(item.bookingDate)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                        <Clock className="size-3 text-slate-400" />
                        <span className="font-semibold text-slate-800">
                          {formatBookingTime(item.startTime)} - {formatBookingTime(item.endTime)}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span>{calculateBookingDuration(item.startTime, item.endTime)}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] text-slate-400">Tiền sân</div>
                      <div className="font-bold text-slate-900 text-xs">
                        {formatCurrency(item.price)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-between rounded-xl border border-slate-150 bg-slate-50/60 p-2.5 text-xs">
                  <div className="space-y-1">
                    <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-bold text-emerald-800 text-[11px]">
                      {booking.courtName || '-'}
                    </span>
                    <div className="flex items-center gap-1 text-[11px] text-slate-600">
                      <Clock className="size-3 text-slate-400" />
                      <span>
                        {formatBookingTime(booking.startTime)} - {formatBookingTime(booking.endTime)}
                      </span>
                    </div>
                  </div>
                  <div className="font-bold text-slate-900 text-xs">
                    {formatCurrency(booking.totalAmount)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment & Balance Receipt Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between text-slate-600">
              <span className="text-xs">Tổng tiền đặt sân:</span>
              <span className="text-xs font-semibold text-slate-900">
                {formatCurrency(totalAmount)}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span className="text-xs">Đã thanh toán:</span>
              <span className="text-xs font-semibold text-emerald-600">
                {formatCurrency(paidAmount)}
              </span>
            </div>

            <div className="border-t border-dashed border-slate-200 pt-2.5 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800">Số tiền còn lại phải thu:</span>
                <div className="text-[10px] text-slate-400">Quyết toán số dư để trả sân</div>
              </div>
              <span
                className={`text-base font-extrabold ${
                  hasOutstandingBalance ? 'text-rose-600' : 'text-emerald-700'
                }`}
              >
                {formatCurrency(remainingAmount)}
              </span>
            </div>
          </div>

          {/* Settlement Section (when unpaid) or Confirmation Banner */}
          {hasOutstandingBalance ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-4 space-y-3.5">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="size-4.5 shrink-0 text-rose-600 mt-0.5" />
                <div>
                  <div className="font-bold text-xs text-rose-900">
                    Khoản thanh toán còn lại: {formatCurrency(remainingAmount)}
                  </div>
                  <div className="text-[11px] text-rose-700 mt-0.5">
                    Vui lòng thu tiền từ khách hàng và chọn phương thức thanh toán trước khi hoàn tất check-out.
                  </div>
                </div>
              </div>

              {/* Payment Method Selector (48px min-touch target) */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[11px] font-bold text-slate-800">
                  Phương thức thu khoản còn lại:
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CASH')}
                    className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-left transition-all cursor-pointer min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                      paymentMethod === 'CASH'
                        ? 'border-emerald-600 bg-white text-emerald-900 shadow-xs ring-2 ring-emerald-600/30'
                        : 'border-slate-200 bg-white/70 text-slate-700 hover:bg-white'
                    }`}
                  >
                    <div
                      className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                        paymentMethod === 'CASH'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Banknote className="size-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs">Tiền mặt</div>
                      <div className="text-[10px] text-slate-500">Tại quầy</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('TRANSFER')}
                    className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-left transition-all cursor-pointer min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                      paymentMethod === 'TRANSFER'
                        ? 'border-blue-600 bg-white text-blue-900 shadow-xs ring-2 ring-blue-600/30'
                        : 'border-slate-200 bg-white/70 text-slate-700 hover:bg-white'
                    }`}
                  >
                    <div
                      className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                        paymentMethod === 'TRANSFER'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <CreditCard className="size-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs">Chuyển khoản</div>
                      <div className="text-[10px] text-slate-500">QR / Ngân hàng</div>
                    </div>
                  </button>
                </div>

                {/* Transfer notice */}
                {paymentMethod === 'TRANSFER' && (
                  <div className="mt-2 flex items-start gap-2 rounded-lg border border-blue-200 bg-white p-2.5 text-[11px] text-blue-900">
                    <QrCode className="size-4 shrink-0 text-blue-600 mt-0.5" />
                    <div>
                      Cú pháp CK: <strong className="font-mono text-blue-700">{booking.bookingCode || booking.bookingId}</strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Settlement Confirmation Checkbox Card */}
              <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 cursor-pointer select-none hover:border-slate-300 transition-colors shadow-2xs">
                <input
                  type="checkbox"
                  checked={isPaymentConfirmed}
                  onChange={(e) => setIsPaymentConfirmed(e.target.checked)}
                  className="size-4.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                />
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-900">
                    Xác nhận đã thu đủ số tiền {formatCurrency(remainingAmount)}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Đã nhận đủ tiền từ khách qua {paymentMethod === 'CASH' ? 'tiền mặt' : 'chuyển khoản'}
                  </div>
                </div>
              </label>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 text-xs text-emerald-900">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <ShieldCheck className="size-4.5" />
              </div>
              <div>
                <div className="font-bold">Lịch đặt đã được thanh toán 100%</div>
                <div className="text-[11px] text-emerald-700">
                  Không còn số dư nợ. Sẵn sàng hoàn tất check-out và bàn giao sân.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dialog Footer with primary action */}
        <DialogFooter className="border-t border-slate-200/80 bg-slate-50/80 px-5 py-3.5 flex flex-row items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isPending}
            className="cursor-pointer text-xs font-semibold min-h-[38px] px-4"
          >
            {t('common.cancel', 'Hủy bỏ')}
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleConfirmCheckOut}
            disabled={isPending || (hasOutstandingBalance && !isPaymentConfirmed)}
            className="cursor-pointer gap-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white min-h-[38px] px-5 shadow-xs transition-all disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>{t('courtStatus.checkout.processing', 'Đang xử lý Check-out...')}</span>
              </>
            ) : hasOutstandingBalance ? (
              <>
                <CheckCircle2 className="size-4" />
                <span>Thu {formatCurrency(remainingAmount)} & Check-out</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="size-4" />
                <span>{t('courtStatus.checkout.confirmAction', 'Xác nhận Check-out')}</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CheckOutBookingDialog;
