import React from 'react';
import { Sparkles, Trophy, ShieldCheck } from 'lucide-react';
import { SearchHeroBar, type SearchHeroFilters } from './SearchHeroBar';

export interface HomeHeroSectionProps {
  filters: SearchHeroFilters;
  onSearch: (filters: SearchHeroFilters) => void;
  isLoading?: boolean;
}

export const HomeHeroSection: React.FC<HomeHeroSectionProps> = ({
  filters,
  onSearch,
  isLoading,
}) => {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-brand-950 via-brand-900 to-brand-950 p-6 sm:p-8 lg:p-12 text-white shadow-2xl">
      {/* Ambient badminton glow */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-emerald-400/15 blur-3xl" />

      <div className="relative z-10 max-w-4xl space-y-4">
        {/* Subtitle badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-semibold backdrop-blur-md">
          <Sparkles className="size-3.5 text-amber-400" />
          <span>Hệ thống đặt sân cầu lông thông minh & thời gian thực</span>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
          Tìm kiếm & Đặt sân cầu lông gần bạn
        </h1>

        <p className="text-sm font-medium text-brand-100 sm:text-base max-w-2xl leading-relaxed">
          Khám phá các cụm sân cầu lông đạt chuẩn thi đấu, hỗ trợ giữ chỗ tức thì, kiểm tra lịch trống
          và bảng giá công khai, minh bạch.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative z-20 mt-8">
        <SearchHeroBar
          initialFilters={filters}
          onSearch={onSearch}
          isLoading={isLoading}
        />
      </div>

      {/* Feature Pills */}
      <div className="relative z-10 mt-6 flex flex-wrap items-center gap-4 text-xs font-medium text-brand-200">
        <div className="flex items-center gap-1.5">
          <Trophy className="size-4 text-amber-400" />
          <span>100% Sân thảm Yonex/Enlio tiêu chuẩn BWF</span>
        </div>
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="size-4 text-emerald-400" />
          <span>Xác nhận tức thì qua hệ thống</span>
        </div>
      </div>
    </section>
  );
};
