import React, { useState, useTransition } from 'react';
import { Sparkles, Trophy, Users, ShieldCheck, HeartHandshake } from 'lucide-react';
import { DiscoveryHeader } from '@/features/branch-discovery/components/DiscoveryHeader';
import { QuickActionsSection } from '@/features/player-matching/components/QuickActionsSection';
import { HomeHeroSection } from '../components/HomeHeroSection';
import { HomeBranchList } from '../components/HomeBranchList';
import type { SearchHeroFilters } from '../components/SearchHeroBar';
import { useBranches } from '../api/branch.query';
import type { BranchSearchRequest } from '../types/branch.types';

export const HomePage: React.FC = () => {
  const [, startTransition] = useTransition();

  const [filters, setFilters] = useState<BranchSearchRequest>({
    pageNumber: 1,
    pageSize: 12,
    keyword: '',
    city: '',
    district: '',
    isActive: true,
  });

  const { data, isLoading, isError, error, refetch } = useBranches(filters);

  const branches = data?.branches ?? [];
  const metadata = data?.metadata ?? {
    pageNumber: filters.pageNumber,
    pageSize: filters.pageSize,
    totalCount: branches.length,
    totalPages: Math.max(1, Math.ceil(branches.length / filters.pageSize)),
    hasPreviousPage: filters.pageNumber > 1,
    hasNextPage: false,
  };

  const handleSearch = (searchFilters: SearchHeroFilters) => {
    startTransition(() => {
      setFilters((prev) => ({
        ...prev,
        pageNumber: 1,
        keyword: searchFilters.keyword,
        city: searchFilters.city,
        district: searchFilters.district,
      }));
    });
  };

  const handlePageChange = (newPage: number) => {
    startTransition(() => {
      setFilters((prev) => ({
        ...prev,
        pageNumber: newPage,
      }));
    });

    // Smoothly scroll down to branch list
    const branchSection = document.getElementById('branches-section');
    if (branchSection) {
      branchSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleClearFilters = () => {
    startTransition(() => {
      setFilters({
        pageNumber: 1,
        pageSize: 12,
        keyword: '',
        city: '',
        district: '',
        isActive: true,
      });
    });
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans selection:bg-brand-100 selection:text-brand-900">
      {/* Sticky Global Navigation */}
      <DiscoveryHeader />

      {/* Main Content Body */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-8">
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
        <div id="branches-section" className="scroll-mt-20">
          <HomeBranchList
            branches={branches}
            metadata={metadata}
            isLoading={isLoading}
            isError={isError}
            errorMessage={error?.message}
            onPageChange={handlePageChange}
            onRetry={() => refetch()}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Quality Standards & Trust Badges */}
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
            <div className="flex flex-col items-center text-center p-5 rounded-2xl bg-surface border border-line shadow-xs">
              <div className="grid size-12 place-items-center rounded-2xl bg-emerald-100 text-brand-600 mb-3">
                <Trophy className="size-6" />
              </div>
              <h4 className="text-sm font-bold text-content-primary">Chuẩn thi đấu BWF</h4>
              <p className="mt-1 text-xs text-content-secondary leading-relaxed">
                100% sân được kiểm duyệt về độ nảy, ánh sáng chống lóa và thảm bảo vệ đầu gối.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-5 rounded-2xl bg-surface border border-line shadow-xs">
              <div className="grid size-12 place-items-center rounded-2xl bg-blue-100 text-blue-600 mb-3">
                <ShieldCheck className="size-6" />
              </div>
              <h4 className="text-sm font-bold text-content-primary">Giữ chỗ tức thì</h4>
              <p className="mt-1 text-xs text-content-secondary leading-relaxed">
                Xác nhận tự động qua SMS & Zalo trong 30 giây, không lo bị trùng lịch tại quầy.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-5 rounded-2xl bg-surface border border-line shadow-xs">
              <div className="grid size-12 place-items-center rounded-2xl bg-amber-100 text-amber-700 mb-3">
                <HeartHandshake className="size-6" />
              </div>
              <h4 className="text-sm font-bold text-content-primary">Chính sách hủy linh hoạt</h4>
              <p className="mt-1 text-xs text-content-secondary leading-relaxed">
                Miễn phí hủy hoặc dời lịch trước 4 tiếng, hỗ trợ hoàn tiền qua ví thành viên.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-5 rounded-2xl bg-surface border border-line shadow-xs">
              <div className="grid size-12 place-items-center rounded-2xl bg-purple-100 text-purple-600 mb-3">
                <Users className="size-6" />
              </div>
              <h4 className="text-sm font-bold text-content-primary">Cộng đồng sôi động</h4>
              <p className="mt-1 text-xs text-content-secondary leading-relaxed">
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
    </div>
  );
};

export default HomePage;
