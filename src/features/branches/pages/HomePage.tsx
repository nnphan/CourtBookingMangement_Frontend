import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router';
import { Sparkles, Trophy, Users, ShieldCheck, HeartHandshake } from 'lucide-react';
import { DiscoveryHeader } from '@/features/branch-discovery/components/DiscoveryHeader';
import { QuickActionsSection } from '@/features/player-matching/components/QuickActionsSection';
import { HomeHeroSection } from '../components/HomeHeroSection';
import { HomeBranchList } from '../components/HomeBranchList';
import { BranchQuickViewDialog } from '../components/BranchQuickViewDialog';
import type { SearchHeroFilters } from '../components/SearchHeroBar';
import { useBranches } from '../api/branch.query';
import type { BranchSearchRequest } from '../types/branch.types';

export const HomePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { hash, key } = useLocation();

  useEffect(() => {
    if (hash !== '#branches-section') return;
    const frame = requestAnimationFrame(() => {
      document.getElementById('branches-section')?.scrollIntoView({ block: 'start' });
    });
    return () => cancelAnimationFrame(frame);
  }, [hash, key]);

  // Quick View Modal state
  const [quickViewBranchId, setQuickViewBranchId] = useState<string | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  // Parse filters directly from URL Query Parameters for persistence & bookmarking
  const pageNumber = Math.max(
    1,
    parseInt(searchParams.get('page') || searchParams.get('pageNumber') || '1', 10),
  );
  const pageSize = Math.max(1, parseInt(searchParams.get('pageSize') || '9', 10));
  const keyword = searchParams.get('keyword') || '';
  const city = searchParams.get('city') || '';
  const district = searchParams.get('district') || '';

  const filters: BranchSearchRequest = useMemo(
    () => ({
      pageNumber,
      pageSize,
      keyword,
      city,
      district,
      isActive: true,
    }),
    [pageNumber, pageSize, keyword, city, district],
  );

  const { data, isLoading, isError, error, refetch } = useBranches(filters);

  const branches = data?.branches ?? [];
  const metadata = data?.metadata ?? {
    pageNumber: filters.pageNumber ?? 1,
    pageSize: filters.pageSize ?? 9,
    totalCount: branches.length,
    totalPages: Math.max(1, Math.ceil(branches.length / (filters.pageSize ?? 9))),
    hasPreviousPage: (filters.pageNumber ?? 1) > 1,
    hasNextPage: false,
  };

  const handleSearch = (searchFilters: SearchHeroFilters) => {
    const nextParams = new URLSearchParams();
    if (searchFilters.keyword.trim()) {
      nextParams.set('keyword', searchFilters.keyword.trim());
    }
    if (searchFilters.city.trim() && searchFilters.city !== 'all') {
      nextParams.set('city', searchFilters.city.trim());
    }
    if (searchFilters.district.trim() && searchFilters.district !== 'all') {
      nextParams.set('district', searchFilters.district.trim());
    }
    if (pageSize !== 9) {
      nextParams.set('pageSize', String(pageSize));
    }
    // Automatically resets to page 1 on search
    setSearchParams(nextParams);
  };

  const handlePageChange = (newPage: number) => {
    const nextParams = new URLSearchParams(searchParams);
    if (newPage > 1) {
      nextParams.set('page', String(newPage));
    } else {
      nextParams.delete('page');
      nextParams.delete('pageNumber');
    }
    setSearchParams(nextParams);

    // Smoothly scroll down to branch list
    const branchSection = document.getElementById('branches-section');
    if (branchSection) {
      branchSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleClearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const handleOpenQuickView = (branchId: string) => {
    setQuickViewBranchId(branchId);
    setIsQuickViewOpen(true);
  };

  const handleCloseQuickView = () => {
    setIsQuickViewOpen(false);
  };

  return (
    <div className="bg-surface selection:bg-brand-100 selection:text-brand-900 flex min-h-screen flex-col font-sans">
      {/* Sticky Global Navigation */}
      <DiscoveryHeader />

      {/* Main Content Body */}
      <main className="mx-auto w-full max-w-7xl flex-1 space-y-8 px-4 py-6 sm:px-6 lg:px-8">
        {/* Hero Section with Search Hero Bar */}
        <HomeHeroSection
          filters={{
            keyword: filters.keyword ?? '',
            city: filters.city ?? '',
            district: filters.district ?? '',
          }}
          onSearch={handleSearch}
          isLoading={isLoading}
        />

        {/* Quick Actions (Match Finder, Court Status, Booking History) */}
        <QuickActionsSection />

        {/* Main Branches Listing Section */}
        <div id="branches-section" className="scroll-mt-36 md:scroll-mt-20">
          <HomeBranchList
            branches={branches}
            metadata={metadata}
            isLoading={isLoading}
            isError={isError}
            errorMessage={error?.message}
            onPageChange={handlePageChange}
            onRetry={() => refetch()}
            onClearFilters={handleClearFilters}
            onQuickView={handleOpenQuickView}
          />
        </div>

        {/* Quick View Dialog */}
        <BranchQuickViewDialog
          branchId={quickViewBranchId}
          isOpen={isQuickViewOpen}
          onClose={handleCloseQuickView}
        />

        {/* Quality Standards & Trust Badges */}
        <section className="border-line bg-surface-muted/50 mt-16 rounded-3xl border p-8 sm:p-12">
          <div className="mx-auto mb-10 max-w-2xl space-y-2 text-center">
            <div className="bg-brand-50 text-brand-700 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold">
              <Sparkles className="size-3.5" />
              <span>Tiêu chuẩn dịch vụ CourtNow</span>
            </div>
            <h3 className="text-content-primary text-xl font-black sm:text-2xl">
              Tại sao nên đặt sân cầu lông trên CourtNow?
            </h3>
            <p className="text-content-secondary text-xs sm:text-sm">
              Nền tảng quản lý và kết nối sân thể thao hàng đầu, tối ưu hóa trải nghiệm cho người
              chơi.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-surface border-line flex flex-col items-center rounded-2xl border p-5 text-center shadow-xs">
              <div className="text-brand-600 mb-3 grid size-12 place-items-center rounded-2xl bg-emerald-100">
                <Trophy className="size-6" />
              </div>
              <h4 className="text-content-primary text-sm font-bold">Chuẩn thi đấu BWF</h4>
              <p className="text-content-secondary mt-1 text-xs leading-relaxed">
                100% sân được kiểm duyệt về độ nảy, ánh sáng chống lóa và thảm bảo vệ đầu gối.
              </p>
            </div>

            <div className="bg-surface border-line flex flex-col items-center rounded-2xl border p-5 text-center shadow-xs">
              <div className="mb-3 grid size-12 place-items-center rounded-2xl bg-blue-100 text-blue-600">
                <ShieldCheck className="size-6" />
              </div>
              <h4 className="text-content-primary text-sm font-bold">Giữ chỗ tức thì</h4>
              <p className="text-content-secondary mt-1 text-xs leading-relaxed">
                Xác nhận tự động qua SMS & Zalo trong 30 giây, không lo bị trùng lịch tại quầy.
              </p>
            </div>

            <div className="bg-surface border-line flex flex-col items-center rounded-2xl border p-5 text-center shadow-xs">
              <div className="mb-3 grid size-12 place-items-center rounded-2xl bg-amber-100 text-amber-700">
                <HeartHandshake className="size-6" />
              </div>
              <h4 className="text-content-primary text-sm font-bold">Chính sách hủy linh hoạt</h4>
              <p className="text-content-secondary mt-1 text-xs leading-relaxed">
                Miễn phí hủy hoặc dời lịch trước 4 tiếng, hỗ trợ hoàn tiền qua ví thành viên.
              </p>
            </div>

            <div className="bg-surface border-line flex flex-col items-center rounded-2xl border p-5 text-center shadow-xs">
              <div className="mb-3 grid size-12 place-items-center rounded-2xl bg-purple-100 text-purple-600">
                <Users className="size-6" />
              </div>
              <h4 className="text-content-primary text-sm font-bold">Cộng đồng sôi động</h4>
              <p className="text-content-secondary mt-1 text-xs leading-relaxed">
                Dễ dàng ghép cặp, giao lưu trình độ từ sơ cấp đến vận động viên phong trào.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-line bg-surface mt-16 border-t py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-content-secondary flex flex-col items-center justify-between gap-4 text-xs sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="bg-brand-600 grid size-6 place-items-center rounded-lg text-[10px] font-black text-white">
                CN
              </div>
              <span className="text-content-primary font-bold">
                CourtNow Badminton Booking System
              </span>
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
    </div>
  );
};

export default HomePage;
