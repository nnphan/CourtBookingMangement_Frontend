import { useEffect } from 'react';
import {
  X,
  Star,
  MapPin,
  Phone,
  Clock,
  ShieldAlert,
  CalendarCheck,
  CheckCircle2,
} from 'lucide-react';
import { useBranchSearchStore } from '../store/branch-search.store';
import { AMENITIES_MAP } from '../constants/amenities';

export const BranchDetailModal = () => {
  const {
    isDetailOpen,
    closeDetailModal,
    selectedBranchForDetail: branch,
    openBookingDrawer,
  } = useBranchSearchStore();

  // Escape key closes modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDetailModal();
    };
    if (isDetailOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isDetailOpen, closeDetailModal]);

  if (!isDetailOpen || !branch) return null;

  const images =
    Array.isArray(branch.images) && branch.images.length > 0
      ? branch.images
      : [branch.coverImage || 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=1200&auto=format&fit=crop'];

  const minPrice = branch.priceRange?.min ?? 90000;
  const maxPrice = branch.priceRange?.max ?? 170000;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="branch-detail-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        onClick={closeDetailModal}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      {/* Modal Dialog Content */}
      <div className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-line bg-surface shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Sticky Header with Close Button */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-surface/95 px-6 py-4 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="rounded bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700 uppercase">
              {branch.district}
            </span>
            <span className="text-xs font-semibold text-content-secondary">
              Mã CLB: {branch.id}
            </span>
          </div>

          <button
            type="button"
            onClick={closeDetailModal}
            aria-label="Đóng cửa sổ thông tin"
            className="grid size-9 place-items-center rounded-full bg-surface-muted text-content-secondary transition-colors hover:bg-line hover:text-content-primary focus-visible:outline-2 focus-visible:outline-brand-600"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Photo Gallery Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 rounded-2xl overflow-hidden">
            <div className="sm:col-span-2 aspect-16/10 overflow-hidden bg-surface-muted">
              <img
                src={images[0] ?? branch.coverImage}
                alt={branch.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="hidden sm:grid grid-rows-2 gap-2.5">
              <div className="aspect-16/10 overflow-hidden bg-surface-muted">
                <img
                  src={images[1] ?? images[0] ?? branch.coverImage}
                  alt={`${branch.name} ảnh phụ`}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="aspect-16/10 overflow-hidden bg-surface-muted">
                <img
                  src={images[2] ?? images[0] ?? branch.coverImage}
                  alt={`${branch.name} khuôn viên`}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Club Title & Overview */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-line pb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h2 id="branch-detail-title" className="text-xl sm:text-2xl font-black text-content-primary">
                  {branch.name}
                </h2>
              </div>
              <p className="text-sm font-medium text-brand-700">{branch.tagline}</p>
              <div className="flex items-center gap-2 text-xs font-medium text-content-secondary">
                <MapPin className="size-4 text-brand-600 shrink-0" />
                <span>{branch.address}, {branch.district}, {branch.city}</span>
              </div>
            </div>

            {/* Rating card */}
            <div className="flex items-center sm:flex-col sm:items-end justify-between rounded-xl bg-surface-muted p-3 sm:px-4 sm:py-3 shrink-0">
              <div className="flex items-center gap-1.5 text-base font-extrabold text-amber-800">
                <Star className="size-5 fill-current text-amber-500" />
                <span>{branch.rating.toFixed(2)}</span>
                <span className="text-xs text-content-secondary font-normal">
                  ({branch.reviewCount} đánh giá)
                </span>
              </div>
              <span className="text-xs font-semibold text-brand-600 mt-1">Xuất sắc</span>
            </div>
          </div>

          {/* Key Facts / Operating Hours / Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 rounded-2xl border border-line p-4 bg-surface">
              <div className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-600 shrink-0">
                <Clock className="size-5" />
              </div>
              <div>
                <span className="block text-[11px] font-bold text-content-secondary uppercase">
                  Giờ mở cửa
                </span>
                <span className="block text-sm font-bold text-content-primary">
                  {branch.operatingHours.open} - {branch.operatingHours.close}
                </span>
                <span className="text-[11px] text-content-secondary">
                  {branch.operatingHours.daysDescription}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-line p-4 bg-surface">
              <div className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-600 shrink-0">
                <Phone className="size-5" />
              </div>
              <div>
                <span className="block text-[11px] font-bold text-content-secondary uppercase">
                  Hotline hỗ trợ
                </span>
                <span className="block text-sm font-bold text-content-primary">
                  {branch.hotline}
                </span>
                <span className="text-[11px] text-content-secondary">{branch.phone}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-line p-4 bg-surface">
              <div className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-600 shrink-0">
                <CalendarCheck className="size-5" />
              </div>
              <div>
                <span className="block text-[11px] font-bold text-content-secondary uppercase">
                  Tình trạng sân
                </span>
                <span className="block text-sm font-bold text-brand-600">
                  {branch.availableCourtsCount} / {branch.courtsCount} sân trống
                </span>
                <span className="text-[11px] text-content-secondary">Sẵn sàng nhận khách</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-base font-extrabold text-content-primary">Giới thiệu câu lạc bộ</h3>
            <p className="text-sm leading-relaxed text-content-secondary">{branch.description}</p>
          </div>

          {/* Court Inventory List */}
          <div className="space-y-3">
            <h3 className="text-base font-extrabold text-content-primary">Danh sách sân tại chi nhánh</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(branch.courts ?? []).map((court) => (
                <div
                  key={court.id}
                  className="flex items-center justify-between rounded-xl border border-line p-3.5 bg-surface-muted/50"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-content-primary">{court.name}</span>
                      {court.category === 'vip' && (
                        <span className="rounded bg-accent-gold/20 px-2 py-0.5 text-[10px] font-black text-amber-800 uppercase">
                          VIP
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-content-secondary">{court.surfaceLabel}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-sm font-black text-brand-600">
                      {court.pricePerHour.toLocaleString('vi-VN')} đ/h
                    </span>
                    <span
                      className={`text-[11px] font-bold ${
                        court.isAvailableNow ? 'text-success' : 'text-danger'
                      }`}
                    >
                      {court.isAvailableNow ? 'Còn chỗ' : 'Kín lịch'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Amenities Grid */}
          <div className="space-y-3">
            <h3 className="text-base font-extrabold text-content-primary">Tiện ích & dịch vụ</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(branch.amenities ?? []).map((amenityId) => {
                const amenity = AMENITIES_MAP[amenityId];
                if (!amenity) return null;
                return (
                  <div
                    key={amenityId}
                    className="flex items-start gap-2.5 rounded-xl border border-line p-3 bg-surface"
                  >
                    <CheckCircle2 className="size-4 text-brand-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-xs font-bold text-content-primary">
                        {amenity.name}
                      </span>
                      <span className="text-[11px] text-content-secondary line-clamp-1">
                        {amenity.description}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rules & Policy */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
              <ShieldAlert className="size-4 text-amber-600" />
              <span>Nội quy & chính sách đặt sân</span>
            </div>
            <ul className="list-disc list-inside text-xs text-amber-950 space-y-1">
              {(branch.rules ?? []).map((rule, idx) => (
                <li key={idx}>{rule}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Modal Sticky Bottom Action */}
        <div className="sticky bottom-0 z-20 flex items-center justify-between border-t border-line bg-surface/95 px-6 py-4 backdrop-blur-md">
          <div>
            <span className="text-xs text-content-secondary">Giá dao động</span>
            <div className="flex items-baseline gap-1">
              <span className="text-base sm:text-lg font-black text-brand-600">
                {minPrice.toLocaleString('vi-VN')} đ
              </span>
              <span className="text-xs text-content-secondary">
                - {maxPrice.toLocaleString('vi-VN')} đ / giờ
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={closeDetailModal}
              className="rounded-xl border border-line px-4 py-2.5 text-xs font-bold text-content-primary hover:bg-surface-muted"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={() => {
                closeDetailModal();
                openBookingDrawer(branch);
              }}
              className="flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-xs sm:text-sm font-extrabold text-white shadow-md hover:bg-brand-700 active:scale-95 focus-visible:outline-3 focus-visible:outline-[var(--color-focus)]"
            >
              <CalendarCheck className="size-4" />
              <span>Tiến hành đặt sân ngay</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
