import React from 'react';
import { useNavigate } from 'react-router';
import {
  Clock,
  MapPin,
  Phone,
  Zap,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Calendar,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useBranchDetail } from '../hooks/useBranchDetail';
import {
  formatOperatingHours,
  getAmenityEmoji,
  getBranchThumbnail,
} from '../utils/branch.mapper';
import {
  formatBranchPrice,
  formatTimeRange,
  mapPricingTypeLabel,
} from '../utils/branch-detail.mapper';
import { paths } from '@/app/router/paths';

export interface BranchQuickViewDialogProps {
  branchId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BranchQuickViewDialog: React.FC<BranchQuickViewDialogProps> = ({
  branchId,
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();

  const {
    data: branch,
    isLoading,
    isError,
    error,
    refetch,
  } = useBranchDetail(isOpen && branchId ? branchId : null);

  const handleViewDetail = () => {
    if (!branchId) return;
    onClose();
    navigate(paths.branchDetail(branchId));
  };

  const handleBookNow = () => {
    if (!branchId) return;
    onClose();
    navigate(paths.customerBranchCourtStatus(branchId));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl sm:max-w-2xl md:max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-3xl border-line bg-surface shadow-2xl">
        {/* Loading State Skeleton */}
        {isLoading && (
          <div className="p-6 sm:p-8 space-y-6 animate-pulse" aria-busy="true" aria-label="Đang tải thông tin chi nhánh">
            {/* Header Skeleton */}
            <div className="space-y-2 pr-8">
              <div className="h-6 w-3/4 rounded-lg bg-surface-muted" />
              <div className="h-4 w-1/2 rounded bg-surface-muted" />
              <div className="h-4 w-1/3 rounded bg-surface-muted" />
            </div>

            {/* Image Skeleton */}
            <div className="aspect-16/9 w-full rounded-2xl bg-surface-muted" />

            {/* Grid details skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="h-20 rounded-2xl bg-surface-muted" />
              <div className="h-20 rounded-2xl bg-surface-muted" />
            </div>

            {/* Pricing Skeleton */}
            <div className="space-y-2">
              <div className="h-5 w-28 rounded bg-surface-muted" />
              <div className="grid grid-cols-3 gap-3">
                <div className="h-16 rounded-xl bg-surface-muted" />
                <div className="h-16 rounded-xl bg-surface-muted" />
                <div className="h-16 rounded-xl bg-surface-muted" />
              </div>
            </div>

            {/* Footer Buttons Skeleton */}
            <div className="pt-4 border-t border-line flex justify-end gap-3">
              <div className="h-10 w-28 rounded-xl bg-surface-muted" />
              <div className="h-10 w-32 rounded-xl bg-surface-muted" />
            </div>
          </div>
        )}

        {/* Error State */}
        {!isLoading && isError && (
          <div className="p-8 sm:p-12 text-center space-y-4">
            <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-red-100 text-red-600">
              <AlertCircle className="size-7" />
            </div>
            <DialogTitle className="text-lg font-bold text-red-900">
              Không thể tải thông tin chi nhánh.
            </DialogTitle>
            <p className="text-xs text-red-700 max-w-sm mx-auto">
              {error?.message || 'Đã có lỗi xảy ra trong quá trình kết nối tới máy chủ. Vui lòng thử lại.'}
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => refetch()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition-all hover:bg-red-700 active:scale-95 cursor-pointer"
              >
                <RotateCcw className="size-3.5" />
                <span>Thử lại</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-line bg-surface px-4 py-2 text-xs font-semibold text-content-primary hover:bg-surface-muted transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        )}

        {/* Success State Content */}
        {!isLoading && !isError && branch && (
          <div className="flex flex-col">
            {/* Header: Name, Address, Phone */}
            <DialogHeader className="p-5 sm:p-6 pb-4 text-left border-b border-line pr-12">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-bold text-brand-700">
                  <Sparkles className="size-3" />
                  <span>Xem nhanh</span>
                </span>
                {branch.supportsInstantBooking && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2.5 py-0.5 text-[11px] font-bold text-green-700">
                    <Zap className="size-3 fill-current text-green-600" />
                    <span>Hỗ trợ đặt ngay</span>
                  </span>
                )}
              </div>

              <DialogTitle className="text-xl sm:text-2xl font-black text-content-primary tracking-tight">
                {branch.name}
              </DialogTitle>

              <DialogDescription className="text-xs text-content-secondary mt-1 flex flex-col gap-1 sm:gap-1.5">
                <span className="inline-flex items-center gap-1.5 text-content-secondary">
                  <MapPin className="size-3.5 text-brand-600 shrink-0" />
                  <span>{[branch.address, branch.district, branch.city].filter(Boolean).join(', ')}</span>
                </span>
                {branch.phoneNumber && (
                  <span className="inline-flex items-center gap-1.5 text-content-secondary font-medium">
                    <Phone className="size-3.5 text-brand-600 shrink-0" />
                    <span>{branch.phoneNumber}</span>
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>

            {/* Scrollable Body */}
            <div className="p-5 sm:p-6 space-y-6">
              {/* Branch Image */}
              <div className="relative aspect-16/9 w-full overflow-hidden rounded-2xl bg-surface-muted shadow-xs">
                <img
                  src={getBranchThumbnail(branch.images)}
                  alt={branch.name}
                  className="h-full w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                  <span className="inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 backdrop-blur-xs font-semibold">
                    <ShieldCheck className="size-3.5 text-emerald-400" />
                    <span>Sân tiêu chuẩn chất lượng cao</span>
                  </span>
                  {branch.courts && branch.courts.length > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 backdrop-blur-xs font-semibold">
                      🏸 {branch.courts.length} Sân
                    </span>
                  )}
                </div>
              </div>

              {/* Branch Description */}
              {branch.description ? (
                <div className="rounded-2xl bg-surface-muted/60 p-4 border border-line/60">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-content-primary mb-1">
                    <Info className="size-3.5 text-brand-600" />
                    <span>Giới thiệu chi nhánh</span>
                  </div>
                  <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
                    {branch.description}
                  </p>
                </div>
              ) : null}

              {/* Two columns: Operating Hours & Instant Booking Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Operating Hours */}
                <div className="rounded-2xl border border-line bg-surface p-4 shadow-2xs">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="grid size-8 place-items-center rounded-xl bg-brand-50 text-brand-600">
                      <Clock className="size-4" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-content-secondary block">
                        Giờ hoạt động
                      </span>
                      <span className="text-sm font-extrabold text-content-primary">
                        {formatOperatingHours(branch.operatingHours?.[0])}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-content-secondary">
                    Mở cửa đón khách tất cả các ngày trong tuần.
                  </p>
                </div>

                {/* Instant Booking Status */}
                <div className="rounded-2xl border border-line bg-surface p-4 shadow-2xs">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`grid size-8 place-items-center rounded-xl ${
                      branch.supportsInstantBooking
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      <Zap className="size-4 fill-current" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-content-secondary block">
                        Đặt sân tức thì
                      </span>
                      <span className={`text-sm font-extrabold ${
                        branch.supportsInstantBooking ? 'text-emerald-700' : 'text-content-secondary'
                      }`}>
                        {branch.supportsInstantBooking
                          ? 'Có hỗ trợ đặt sân nhanh'
                          : 'Không hỗ trợ đặt sân nhanh'}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-content-secondary">
                    {branch.supportsInstantBooking
                      ? 'Giữ chỗ tự động xác nhận qua hệ thống trong 30 giây.'
                      : 'Vui lòng liên hệ trực tiếp qua số điện thoại để đặt lịch.'}
                  </p>
                </div>
              </div>

              {/* Courts Section: Sân 01, Sân 02, Sân 03, Sân 04 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-content-secondary">
                    Danh sách sân ({branch.courts?.length || 0} sân)
                  </h4>
                  <span className="text-[11px] text-brand-600 font-semibold">100% Thảm BWF</span>
                </div>

                {branch.courts && branch.courts.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {branch.courts.map((court, idx) => (
                      <div
                        key={court.courtNumber ?? idx}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-line bg-surface-muted/40 hover:bg-surface-muted transition-colors"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs">🏸</span>
                          <span className="text-xs font-bold text-content-primary">
                            {court.name || `Sân ${String(court.courtNumber || idx + 1).padStart(2, '0')}`}
                          </span>
                        </div>
                        <span
                          className={`size-2 rounded-full ${
                            court.isActive !== false ? 'bg-emerald-500' : 'bg-slate-300'
                          }`}
                          title={court.isActive !== false ? 'Đang hoạt động' : 'Tạm bảo trì'}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-content-secondary italic">Đang cập nhật danh sách sân.</p>
                )}
              </div>

              {/* Amenities Section: Display All */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-content-secondary mb-2.5">
                  Tiện ích & Dịch vụ ({branch.branchAmenities?.length || 0})
                </h4>

                {branch.branchAmenities && branch.branchAmenities.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {branch.branchAmenities.map((amenity) => {
                      const icon = getAmenityEmoji(amenity.name, amenity.icon);
                      return (
                        <div
                          key={amenity.id || amenity.code || amenity.name}
                          className="flex items-center gap-2 rounded-xl border border-line/70 bg-surface px-3 py-2 text-xs font-medium text-content-primary shadow-2xs"
                        >
                          <span className="text-sm shrink-0 leading-none">{icon}</span>
                          <span className="truncate">{amenity.name}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-content-secondary">
                    <CheckCircle2 className="size-3.5 text-brand-600" />
                    <span>Đầy đủ các tiện ích tiêu chuẩn cơ bản (chỗ gửi xe, nước uống, phòng thay đồ).</span>
                  </div>
                )}
              </div>

              {/* Price List Section */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-content-secondary mb-2.5">
                  Bảng giá thuê sân tham khảo
                </h4>

                {branch.branchPricings && branch.branchPricings.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {branch.branchPricings.map((pricing, idx) => {
                      const label = mapPricingTypeLabel(pricing.pricingType);
                      const timeStr = formatTimeRange(pricing.startTime, pricing.endTime);
                      const priceFormatted = formatBranchPrice(pricing.pricePerHour);

                      return (
                        <div
                          key={`${pricing.pricingType}-${idx}`}
                          className="flex flex-col rounded-2xl border border-line bg-surface p-3.5 shadow-2xs hover:border-brand-500/30 transition-colors"
                        >
                          <span className="text-[11px] font-bold uppercase tracking-wider text-content-secondary">
                            {pricing.pricingType}
                          </span>
                          <span className="text-xs font-medium text-brand-700 mt-0.5">
                            {label}
                          </span>
                          {timeStr !== '-' && (
                            <span className="text-[11px] text-content-secondary mt-1">
                              Khung giờ: {timeStr}
                            </span>
                          )}
                          <span className="mt-2 text-base font-extrabold text-brand-600">
                            {priceFormatted}
                            <span className="text-[10px] font-medium text-content-secondary">/giờ</span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-xl border border-line bg-surface-muted/40 p-3 text-xs text-content-secondary italic">
                    Bảng giá đang được cập nhật, vui lòng liên hệ chi nhánh để nhận báo giá chi tiết.
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer CTA Buttons */}
            <div className="p-4 sm:p-5 border-t border-line bg-surface-muted/30 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={handleViewDetail}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-line bg-surface px-4 py-2.5 text-xs sm:text-sm font-bold text-content-primary shadow-2xs hover:bg-surface-muted active:scale-95 transition-all cursor-pointer"
              >
                <span>Xem chi tiết</span>
                <ChevronRight className="size-4" />
              </button>

              <button
                type="button"
                onClick={handleBookNow}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-brand-700 active:scale-95 transition-all cursor-pointer"
              >
                <Calendar className="size-4" />
                <span>Đặt sân</span>
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
