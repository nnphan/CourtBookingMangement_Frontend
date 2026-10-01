import { Link } from 'react-router';
import { DiscoveryHeader } from '@/features/branch-discovery/components/DiscoveryHeader';
import { MatchFilters } from '../components/MatchFilters';
import { MatchList } from '../components/MatchList';
import { paths } from '@/app/router/paths';
import { ArrowLeft, Flame, Sparkles, Users } from 'lucide-react';

export const DiscoverMatchesPage = () => {
  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans selection:bg-brand-100 selection:text-brand-900">
      {/* Top Header */}
      <DiscoveryHeader />

      {/* Main Container */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* Navigation Breadcrumb & Back Link */}
        <div className="flex items-center gap-2 text-xs font-semibold text-content-secondary">
          <Link
            to={paths.root}
            className="flex items-center gap-1 hover:text-brand-600 transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            <span>Trang chủ</span>
          </Link>
          <span>/</span>
          <span className="text-content-primary">Player Matching</span>
        </div>

        {/* Page Banner / Header */}
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-emerald-700 via-teal-700 to-cyan-800 p-6 sm:p-10 text-white shadow-lg">
          <div className="absolute -right-10 -bottom-10 size-60 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
              <Flame className="size-3.5 text-amber-300 fill-amber-300" />
              <span>Cộng đồng ghép trận cầu lông</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Discover Badminton Matches
            </h1>
            <p className="text-xs sm:text-base text-emerald-100 leading-relaxed">
              Tìm kiếm đồng đội, khám phá các trận đấu đang tuyển thêm thành viên và kết nối với các lông thủ cùng trình độ xung quanh bạn.
            </p>
            <div className="flex flex-wrap gap-4 pt-2 text-xs text-emerald-200">
              <div className="flex items-center gap-1.5">
                <Users className="size-4 text-emerald-300" />
                <span>Ghép cặp nhanh chóng</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="size-4 text-amber-300" />
                <span>Cân bằng trình độ</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter Section */}
        <section aria-label="Bộ lọc tìm kiếm">
          <MatchFilters />
        </section>

        {/* Result Summary & Match Grid with Infinite Scroll */}
        <section aria-label="Danh sách trận đấu tìm người">
          <MatchList />
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-line bg-surface py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-xs text-content-secondary">
          <p>© 2026 ALOBO Badminton Booking & Player Matching System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default DiscoverMatchesPage;
