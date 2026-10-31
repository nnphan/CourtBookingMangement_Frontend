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
import { formatCurrency } from '@/features/bookings/utils/booking.mapper';
import {
  CreditCard,
  Banknote,
  CheckCircle2,
  Receipt,
  User,
  Phone,
  Copy,
  Check,
  QrCode,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { toast } from '@/lib/toast';

export interface BookingPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingDetailDto;
  onPaymentSuccess?: () => void;
}

export const BookingPaymentDialog: React.FC<BookingPaymentDialogProps> = ({
  isOpen,
  onClose,
  booking,
  onPaymentSuccess,
}) => {
  const { t } = useTranslation();

  const totalAmount = booking.totalAmount ?? 0;
  const paidAmount = booking.paidAmount ?? 0;
  const remainingAmount =
    booking.remainingAmount ?? Math.max(0, totalAmount - paidAmount);

  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'TRANSFER'>('CASH');
  const [amount, setAmount] = useState<number>(remainingAmount);
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Quick preset shortcuts
  const handlePresetAmount = (preset: number) => {
    setAmount(Math.max(0, preset));
  };

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

  const handleConfirmPayment = () => {
    if (amount <= 0) {
      toast.error('Số tiền thanh toán phải lớn hơn 0 ₫');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success(
        t('courtStatus.payment.successTitle', 'Thu tiền thành công!'),
        t(
          'courtStatus.payment.successDesc',
          `Đã ghi nhận thanh toán ${formatCurrency(amount)} (${
            paymentMethod === 'CASH' ? 'Tiền mặt' : 'Chuyển khoản'
          }) cho lịch đặt ${booking.bookingCode || ''}.`,
        ),
      );
      onPaymentSuccess?.();
      onClose();
    }, 450);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DialogContent className="max-w-lg p-0 overflow-hidden sm:rounded-2xl border-slate-200">
        {/* Header with visual accent */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 p-5 text-white">
          <DialogHeader className="text-left space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex size-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-md text-white shadow-inner">
                  <Receipt className="size-5" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold text-white tracking-tight">
                    {t('courtStatus.payment.title', 'Thu tiền đặt sân')}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-blue-100">
                    {t(
                      'courtStatus.payment.subtitle',
                      'Ghi nhận thanh toán tại quầy hoặc chuyển khoản cho khách hàng',
                    )}
                  </DialogDescription>
                </div>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Content body */}
        <div className="max-h-[70vh] space-y-4 overflow-y-auto px-5 py-4 text-xs">
          {/* Customer & Booking Code Card */}
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-[11px]">
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

          {/* Amount Balance Overview Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between text-slate-600">
              <span className="text-xs">Tổng chi phí đặt sân:</span>
              <span className="text-xs font-semibold text-slate-900">
                {formatCurrency(totalAmount)}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span className="text-xs">Đã thanh toán trước:</span>
              <span className="text-xs font-semibold text-emerald-600">
                {formatCurrency(paidAmount)}
              </span>
            </div>

            <div className="border-t border-dashed border-slate-200 pt-2.5 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800">Số tiền còn lại phải thu:</span>
                <div className="text-[10px] text-slate-400">Khoản cần thu để thanh toán đủ</div>
              </div>
              <span
                className={`text-base font-extrabold ${
                  remainingAmount > 0 ? 'text-rose-600' : 'text-emerald-700'
                }`}
              >
                {formatCurrency(remainingAmount)}
              </span>
            </div>
          </div>

          {/* Payment Method Selector (48px min-touch target) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span>Phương thức thanh toán</span>
              <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setPaymentMethod('CASH')}
                className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all cursor-pointer min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                  paymentMethod === 'CASH'
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 shadow-xs ring-1 ring-emerald-600/30'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div
                  className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
                    paymentMethod === 'CASH'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Banknote className="size-4.5" />
                </div>
                <div>
                  <div className="font-bold text-xs">Tiền mặt</div>
                  <div className="text-[10px] text-slate-500">Thu tại quầy</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('TRANSFER')}
                className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all cursor-pointer min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  paymentMethod === 'TRANSFER'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-xs ring-1 ring-blue-600/30'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div
                  className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
                    paymentMethod === 'TRANSFER'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <CreditCard className="size-4.5" />
                </div>
                <div>
                  <div className="font-bold text-xs">Chuyển khoản</div>
                  <div className="text-[10px] text-slate-500">QR / Ngân hàng</div>
                </div>
              </button>
            </div>

            {/* Bank Transfer Helper Hint */}
            {paymentMethod === 'TRANSFER' && (
              <div className="flex items-start gap-2.5 rounded-xl border border-blue-200 bg-blue-50/60 p-3 text-xs text-blue-900 animate-in fade-in-50">
                <QrCode className="size-5 shrink-0 text-blue-600 mt-0.5" />
                <div className="space-y-0.5 text-[11px]">
                  <div className="font-bold text-blue-800">Thông tin chuyển khoản:</div>
                  <div className="text-slate-600">
                    Cú pháp chuyển khoản: <strong className="font-mono text-blue-700 select-all">{booking.bookingCode || booking.bookingId}</strong>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Vui lòng kiểm tra ứng dụng ngân hàng hoặc thông báo SMS để xác nhận đã nhận tiền.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Amount to Collect Input & Presets */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="pay-amount-input" className="text-xs font-bold text-slate-800">
                Số tiền thu thực tế
              </label>
              {remainingAmount > 0 && (
                <button
                  type="button"
                  onClick={() => handlePresetAmount(remainingAmount)}
                  className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  <Sparkles className="size-3" />
                  <span>Thu đủ ({formatCurrency(remainingAmount)})</span>
                </button>
              )}
            </div>

            <div className="relative">
              <input
                id="pay-amount-input"
                type="number"
                min={1000}
                step={10000}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-3.5 pr-14 text-sm font-bold text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">
                VND
              </span>
            </div>

            {/* Quick Amount Suggestion Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {remainingAmount > 0 && (
                <button
                  type="button"
                  onClick={() => handlePresetAmount(remainingAmount)}
                  className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
                    amount === remainingAmount
                      ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-2xs'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  100% ({formatCurrency(remainingAmount)})
                </button>
              )}
              {remainingAmount >= 200000 && (
                <button
                  type="button"
                  onClick={() => handlePresetAmount(Math.round(remainingAmount / 2))}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  50% ({formatCurrency(Math.round(remainingAmount / 2))})
                </button>
              )}
              {[100000, 200000, 500000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handlePresetAmount(val)}
                  className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
                    amount === val
                      ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-2xs'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {formatCurrency(val)}
                </button>
              ))}
            </div>
          </div>

          {/* Note Input */}
          <div className="space-y-1.5">
            <label htmlFor="pay-note-input" className="text-xs font-semibold text-slate-700">
              Ghi chú thanh toán (tùy chọn)
            </label>
            <input
              id="pay-note-input"
              type="text"
              placeholder="VD: Thu tiền mặt tại ca trực sáng..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            />
          </div>
        </div>

        {/* Dialog Footer with primary action */}
        <DialogFooter className="border-t border-slate-200/80 bg-slate-50/80 px-5 py-3.5 flex flex-row items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="cursor-pointer text-xs font-semibold min-h-[38px] px-4"
          >
            {t('common.cancel', 'Hủy bỏ')}
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleConfirmPayment}
            disabled={isSubmitting || amount <= 0}
            className="cursor-pointer gap-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white min-h-[38px] px-5 shadow-xs transition-all"
          >
            <CheckCircle2 className="size-4" />
            <span>Xác nhận thu {formatCurrency(amount)}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BookingPaymentDialog;
