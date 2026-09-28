import { useMemo } from 'react';
import { DiscoveryHeader } from '../components/DiscoveryHeader';
import { SearchHeroBar } from '../components/SearchHeroBar';
import { CategoryFilterChips } from '../components/CategoryFilterChips';
import { BranchCard } from '../components/BranchCard';
import { BranchMapView } from '../components/BranchMapView';
import { BranchDetailModal } from '../components/BranchDetailModal';
import { QuickBookingDrawer } from '../components/QuickBookingDrawer';
import { BranchSkeletonGrid } from '../components/BranchSkeletonGrid';
import { BranchEmptyState } from '../components/BranchEmptyState';
import { useBranchSearchStore } from '../store/branch-search.store';
import { useBranches } from '../hooks/useBranches';
import type { BranchSearchParams } from '../types/branch';
import { Sparkles, Trophy, Users, ShieldCheck, HeartHandshake } from 'lucide-react';

export const BranchDiscoveryPage = () => {
  const {
    searchQuery,
    selectedDistrict,
    selectedDate,
    selectedTimeSlot,
    selectedAmenities,
    selectedCourtSurface,
    minPrice,
    maxPrice,
    onlyOpenNow,
    sortBy,
    viewMode,
  } = useBranchSearchStore();

  const searchParams: BranchSearchParams = useMemo(
    () => ({
      keyword: searchQuery,
      district: selectedDistrict,
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      amenities: selectedAmenities,
      courtSurface: selectedCourtSurface,
      minPrice,
      maxPrice,
      onlyOpenNow,
      sortBy,
    }),
    [
      searchQuery,
      selectedDistrict,
      selectedDate,
      selectedTimeSlot,
      selectedAmenities,
      selectedCourtSurface,
      minPrice,
      maxPrice,
      onlyOpenNow,
      sortBy,
    ],
  );

  const { data: response, isLoading, isError } = useBranches(searchParams);
  const branches: BadmintonBranch[] = response && response.success ? response.data : [];

  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans selection:bg-brand-100 selection:text-brand-900">
      {/* Sticky Top Header */}
      <DiscoveryHeader />

      {/* Main Landing Discovery Body */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* Search Hero Widget */}
        <SearchHeroBar />

        {/* Quick Filter Chips & View Mode Controls */}
        <CategoryFilterChips />

        {/* Result Header Count */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-black text-content-primary">
              {selectedDistrict === 'all'
                ? 'Tất cả câu lạc bộ cầu lông'
                : `Câu lạc bộ tại ${selectedDistrict}`}
            </h2>
            <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-700">
              {branches.length} địa điểm
            </span>
          </div>
          <span className="text-xs text-content-secondary hidden sm:inline">
            Cập nhật tình trạng sân trống theo thời gian thực
          </span>
        </div>

        {/* Dynamic Viewport (Grid, Split, or Map) */}
        {isLoading ? (
          <BranchSkeletonGrid count={6} />
        ) : isError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm font-semibold text-danger">
            Không thể tải danh sách câu lạc bộ. Vui lòng kiểm tra kết nối mạng và thử lại.
          </div>
        ) : branches.length === 0 ? (
          <BranchEmptyState />
        ) : viewMode === 'map' ? (
          /* Map View Only */
          <div className="space-y-4">
            <BranchMapView branches={branches} />
          </div>
        ) : viewMode === 'split' ? (
          /* Split View: List on left, Sticky Map on right */
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
            <div className="lg:col-span-7 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {branches.map((branch) => (
                <BranchCard key={branch.id} branch={branch} />
              ))}
            </div>
            <div className="lg:col-span-5 sticky top-24">
              <BranchMapView branches={branches} />
            </div>
          </div>
        ) : (
          /* Standard Grid View */
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {branches.map((branch) => (
              <BranchCard key={branch.id} branch={branch} />
            ))}
          </div>
        )}

        {/* Trust Badges & System Features Section */}
        <section className="mt-16 rounded-3xl border border-line bg-surface-muted/50 p-8 sm:p-12">
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
              <Sparkles className="size-3.5" />
              <span>Tiêu chuẩn dịch vụ ALOBO</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-content-primary">
              Tại sao nên đặt sân cầu lông trên ALOBO?
            </h3>
            <p className="text-xs sm:text-sm text-content-secondary">
              Nền tảng quản lý và kết nối sân thể thao hàng đầu, tối ưu hóa trải nghiệm cho người chơi.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-surface border border-line">
              <div className="grid size-12 place-items-center rounded-2xl bg-emerald-100 text-brand-600 mb-3">
                <Trophy className="size-6" />
              </div>
              <h4 className="text-sm font-bold text-content-primary">Chuẩn thi đấu BWF</h4>
              <p className="mt-1 text-xs text-content-secondary">
                100% sân được kiểm duyệt về độ nảy, ánh sáng chống lóa và thảm bảo vệ đầu gối.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-surface border border-line">
              <div className="grid size-12 place-items-center rounded-2xl bg-blue-100 text-blue-600 mb-3">
                <ShieldCheck className="size-6" />
              </div>
              <h4 className="text-sm font-bold text-content-primary">Giữ chỗ tức thì</h4>
              <p className="mt-1 text-xs text-content-secondary">
                Xác nhận tự động qua SMS & Zalo trong 30 giây, không lo bị trùng lịch tại quầy.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-surface border border-line">
              <div className="grid size-12 place-items-center rounded-2xl bg-amber-100 text-amber-700 mb-3">
                <HeartHandshake className="size-6" />
              </div>
              <h4 className="text-sm font-bold text-content-primary">Chính sách hủy linh hoạt</h4>
              <p className="mt-1 text-xs text-content-secondary">
                Miễn phí hủy hoặc dời lịch trước 4 tiếng, hỗ trợ hoàn tiền qua ví thành viên.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-surface border border-line">
              <div className="grid size-12 place-items-center rounded-2xl bg-purple-100 text-purple-600 mb-3">
                <Users className="size-6" />
              </div>
              <h4 className="text-sm font-bold text-content-primary">Cộng đồng sôi động</h4>
              <p className="mt-1 text-xs text-content-secondary">
                Dễ dàng ghép cặp, giao lưu trình độ từ sơ cấp đến vận động viên phong trào.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-line bg-surface py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row text-xs text-content-secondary">
            <div className="flex items-center gap-2">
              <div className="grid size-6 place-items-center rounded-lg bg-brand-600 text-white font-black text-[10px]">
                ALO
              </div>
              <span className="font-bold text-content-primary">ALOBO Badminton Booking System</span>
              <span>© 2026. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-6">
              <span className="hover:text-brand-600 cursor-pointer">Điều khoản dịch vụ</span>
              <span className="hover:text-brand-600 cursor-pointer">Chính sách bảo mật</span>
              <span className="hover:text-brand-600 cursor-pointer">Dành cho chủ sân</span>
              <span className="hover:text-brand-600 cursor-pointer">Hotline: 1900 6868</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Global Modals & Drawers */}
      <BranchDetailModal />
      <QuickBookingDrawer />
    </div>
  );
};

export default BranchDiscoveryPage;
