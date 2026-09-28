import { useState, useEffect } from 'react';
import {
  X,
  CalendarCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useBranchSearchStore } from '../store/branch-search.store';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useCreateQuickBooking } from '../hooks/useBranches';
import type { BranchBookingResult } from '../types/branch';

const AVAILABLE_HOURS = [
  '06:00',
  '07:00',
  '08:00',
  '09:00',
  '10:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
  '21:00',
];

export const QuickBookingDrawer = () => {
  const {
    isBookingOpen,
    closeBookingDrawer,
    selectedBranchForBooking: branch,
    selectedDate: initialDate,
  } = useBranchSearchStore();

  const { user } = useAuthStore();
  const createBookingMutation = useCreateQuickBooking();

  const [selectedCourtId, setSelectedCourtId] = useState<string>('');
  const [bookingDate, setBookingDate] = useState<string>(initialDate);
  const [startTime, setStartTime] = useState<string>('18:00');
  const [durationHours, setDurationHours] = useState<number>(2);
  const [fullName, setFullName] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<BranchBookingResult | null>(null);

  // Initialize defaults whenever drawer opens or branch changes
  useEffect(() => {
    if (branch && branch.courts.length > 0) {
      setSelectedCourtId(branch.courts[0]?.id ?? '');
      setBookingDate(initialDate);
      setStartTime('18:00');
      setDurationHours(2);
      setErrorMsg(null);
      setBookingSuccess(null);

      if (user) {
        setFullName(user.fullName ?? '');
        setPhoneNumber(user.phone ?? '');
      } else {
        setFullName('');
        setPhoneNumber('');
      }
    }
  }, [branch, initialDate, user]);

  if (!isBookingOpen || !branch) return null;

  const courts = Array.isArray(branch.courts) && branch.courts.length > 0 ? branch.courts : [];
  const selectedCourt = courts.find((c) => c.id === selectedCourtId) ?? courts[0];
  const pricePerHour = selectedCourt?.pricePerHour ?? branch.priceRange?.min ?? 90000;
  const totalPrice = pricePerHour * durationHours;

  const calculateEndTime = (start: string, duration: number) => {
    const [h, m] = start.split(':').map(Number);
    const endH = (h ?? 18) + duration;
    return `${String(endH).padStart(2, '0')}:${String(m ?? 0).padStart(2, '0')}`;
  };

  const endTime = calculateEndTime(startTime, durationHours);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg('Vui lòng nhập họ và tên người đặt sân.');
      return;
    }
    if (!phoneNumber.trim() || phoneNumber.length < 9) {
      setErrorMsg('Vui lòng nhập số điện thoại hợp lệ để nhận mã xác nhận.');
      return;
    }

    setErrorMsg(null);

    createBookingMutation.mutate(
      {
        branchId: branch.id,
        branchName: branch.name,
        courtId: selectedCourt?.id ?? 'default',
        courtName: selectedCourt?.name ?? 'Sân thi đấu',
        date: bookingDate,
        startTime,
        endTime,
        durationHours,
        pricePerHour,
        totalPrice,
        customerName: fullName.trim(),
        customerPhone: phoneNumber.trim(),
        customerEmail: user?.email ?? undefined,
        note: note.trim() || undefined,
      },
      {
        onSuccess: (res) => {
          if (res.success) {
            setBookingSuccess(res.data);
          } else {
            setErrorMsg(res.message || 'Không thể tạo đơn đặt sân.');
          }
        },
        onError: () => {
          setErrorMsg('Có lỗi xảy ra khi gửi yêu cầu đặt sân. Vui lòng thử lại.');
        },
      },
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-booking-title"
      className="fixed inset-0 z-50 flex items-center justify-end overflow-hidden"
    >
      {/* Backdrop */}
      <div
        onClick={closeBookingDrawer}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      {/* Drawer Container */}
      <div className="relative z-10 flex h-full w-full max-w-lg flex-col border-l border-line bg-surface shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <div>
            <span className="text-[11px] font-bold text-brand-600 uppercase tracking-wider">
              Đặt sân trực tuyến
            </span>
            <h2 id="quick-booking-title" className="text-base font-extrabold text-content-primary line-clamp-1">
              {branch.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={closeBookingDrawer}
            aria-label="Đóng cửa sổ đặt sân"
            className="grid size-9 place-items-center rounded-full bg-surface-muted text-content-secondary hover:bg-line hover:text-content-primary focus-visible:outline-2 focus-visible:outline-brand-600"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {bookingSuccess ? (
            /* Success confirmation screen */
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
              <div className="grid size-16 place-items-center rounded-full bg-emerald-100 text-brand-600 animate-bounce">
                <CheckCircle2 className="size-10" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-content-primary">
                  Đặt sân thành công!
                </h3>
                <p className="text-xs text-content-secondary max-w-xs">
                  Mã giữ chỗ của bạn đã được lưu và gửi tin nhắn xác nhận tới số điện thoại{' '}
                  <strong>{phoneNumber}</strong>.
                </p>
              </div>

              {/* Booking Voucher Receipt */}
              <div className="w-full rounded-2xl border border-line bg-surface-muted/50 p-4 text-left space-y-3">
                <div className="flex items-center justify-between border-b border-line pb-2">
                  <span className="text-xs text-content-secondary">Mã đặt chỗ</span>
                  <span className="font-mono text-sm font-black text-brand-600">
                    {bookingSuccess.bookingCode}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-content-secondary">Câu lạc bộ</span>
                  <span className="font-bold text-content-primary truncate max-w-[200px]">
                    {branch.name}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-content-secondary">Sân</span>
                  <span className="font-bold text-content-primary">
                    {selectedCourt?.name}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-content-secondary">Thời gian</span>
                  <span className="font-bold text-content-primary">
                    {bookingDate} • {startTime} - {endTime}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-line pt-2 text-sm">
                  <span className="font-bold text-content-primary">Tổng tiền thanh toán</span>
                  <span className="font-black text-brand-600">
                    {totalPrice.toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={closeBookingDrawer}
                className="w-full rounded-xl bg-brand-600 py-3 text-sm font-bold text-white hover:bg-brand-700 focus-visible:outline-3 focus-visible:outline-[var(--color-focus)]"
              >
                Hoàn tất & Tiếp tục khám phá
              </button>
            </div>
          ) : (
            /* Booking Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMsg && (
                <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-danger">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Step 1: Pick Court */}
              <div>
                <label className="block text-xs font-bold text-content-secondary mb-2 uppercase tracking-wider">
                  1. Chọn ô sân
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {courts.map((court) => {
                    const isSelected = court.id === selectedCourtId;
                    return (
                      <button
                        key={court.id}
                        type="button"
                        onClick={() => setSelectedCourtId(court.id)}
                        className={`flex flex-col p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-brand-600 bg-brand-50/70 ring-2 ring-brand-500/20'
                            : 'border-line bg-surface hover:bg-surface-muted'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-content-primary">
                            {court.name}
                          </span>
                          {court.category === 'vip' && (
                            <span className="text-[10px] font-black text-amber-700 bg-amber-100 rounded px-1.5">
                              VIP
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-content-secondary mt-0.5 truncate">
                          {court.surfaceLabel}
                        </span>
                        <span className="text-xs font-extrabold text-brand-600 mt-2">
                          {court.pricePerHour.toLocaleString('vi-VN')} đ/h
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Date & Duration */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-content-secondary mb-1.5 uppercase tracking-wider">
                    2. Ngày chơi
                  </label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-xs font-medium text-content-primary focus:border-brand-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-content-secondary mb-1.5 uppercase tracking-wider">
                    Thời lượng
                  </label>
                  <select
                    value={durationHours}
                    onChange={(e) => setDurationHours(Number(e.target.value))}
                    className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-xs font-semibold text-content-primary focus:border-brand-600 focus:outline-hidden cursor-pointer"
                  >
                    <option value={1}>1 giờ</option>
                    <option value={1.5}>1.5 giờ</option>
                    <option value={2}>2 giờ (Phổ biến)</option>
                    <option value={3}>3 giờ</option>
                    <option value={4}>4 giờ</option>
                  </select>
                </div>
              </div>

              {/* Step 3: Available Start Hours */}
              <div>
                <label className="block text-xs font-bold text-content-secondary mb-2 uppercase tracking-wider">
                  3. Giờ bắt đầu ({startTime} - {endTime})
                </label>
                <div className="grid grid-cols-4 gap-1.5 max-h-32 overflow-y-auto pr-1">
                  {AVAILABLE_HOURS.map((hr) => (
                    <button
                      key={hr}
                      type="button"
                      onClick={() => setStartTime(hr)}
                      className={`rounded-lg border py-1.5 text-center text-xs font-semibold transition-colors ${
                        startTime === hr
                          ? 'border-brand-600 bg-brand-600 text-white shadow-xs'
                          : 'border-line text-content-primary hover:bg-surface-muted'
                      }`}
                    >
                      {hr}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 4: Contact Information */}
              <div className="space-y-3 border-t border-line pt-4">
                <label className="block text-xs font-bold text-content-secondary uppercase tracking-wider">
                  4. Thông tin người đặt sân
                </label>

                <div>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Họ và tên người nhận sân (*)"
                    required
                    className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-xs font-medium text-content-primary focus:border-brand-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Số điện thoại nhận tin xác nhận (*)"
                    required
                    className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-xs font-medium text-content-primary focus:border-brand-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Ghi chú thêm (thuê vợt, mua ống cầu...)"
                    className="w-full rounded-xl border border-line bg-surface px-3.5 py-2 text-xs font-medium text-content-primary focus:border-brand-600 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Price Calculation Summary */}
              <div className="rounded-xl border border-line bg-surface-muted/60 p-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-content-secondary">
                  <span>Đơn giá sân / giờ</span>
                  <span>{pricePerHour.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="flex items-center justify-between text-xs text-content-secondary">
                  <span>Thời lượng sử dụng</span>
                  <span>{durationHours} giờ</span>
                </div>
                <div className="flex items-center justify-between border-t border-line pt-2 text-sm">
                  <span className="font-extrabold text-content-primary">Tổng tạm tính</span>
                  <span className="font-black text-brand-600 text-base">
                    {totalPrice.toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={createBookingMutation.isPending}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3.5 text-sm font-extrabold text-white shadow-md transition-all hover:bg-brand-700 active:scale-95 disabled:opacity-50 focus-visible:outline-3 focus-visible:outline-[var(--color-focus)]"
              >
                {createBookingMutation.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Đang xử lý đặt sân...</span>
                  </>
                ) : (
                  <>
                    <CalendarCheck className="size-4" />
                    <span>Xác nhận đặt sân ngay</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
