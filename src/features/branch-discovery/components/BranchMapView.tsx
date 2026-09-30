import { useState } from 'react';
import {
  MapPin,
  Star,
  Plus,
  Minus,
  Navigation,
  ExternalLink,
  CalendarCheck,
} from 'lucide-react';
import type { BadmintonBranch } from '../types/branch';
import { useBranchSearchStore } from '../store/branch-search.store';

import { useNavigate } from 'react-router';
import { BranchNavigationService } from '../services/navigation.service';

interface BranchMapViewProps {
  branches: BadmintonBranch[];
}

export const BranchMapView = ({ branches }: BranchMapViewProps) => {
  const navigate = useNavigate();
  const {
    hoveredBranchId,
    setHoveredBranchId,
    openDetailModal,
  } = useBranchSearchStore();

  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  const activeBranch = branches.find((b) => b.id === (selectedPinId ?? hoveredBranchId));

  return (
    <div className="relative h-[600px] w-full overflow-hidden rounded-2xl border border-line bg-[#f0f3f6] shadow-inner">
      {/* Map SVG Canvas background representation */}
      <div
        className="absolute inset-0 transition-transform duration-300"
        style={{
          transform: `scale(${zoomLevel})`,
          backgroundImage: `
            radial-gradient(#0e6534 0.75px, transparent 0.75px),
            linear-gradient(to right, #e2e8f0 1px, transparent 1px),
            linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      >
        {/* Simulated water body & major green parks */}
        <div className="absolute top-1/4 -right-10 h-72 w-96 rounded-full bg-blue-100/60 blur-xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 h-64 w-80 rounded-full bg-emerald-100/50 blur-xl pointer-events-none" />

        {/* Simulated Road Lines */}
        <svg
          className="absolute inset-0 h-full w-full stroke-slate-300/80 pointer-events-none"
          strokeWidth="3"
        >
          <path d="M 0 150 Q 250 180 500 130 T 1000 200" fill="none" />
          <path d="M 120 0 Q 180 300 220 600" fill="none" />
          <path d="M 400 0 Q 450 350 480 600" fill="none" />
          <path d="M 700 0 Q 680 300 720 600" fill="none" />
          <path d="M 0 420 Q 300 400 700 450 T 1100 410" fill="none" />
        </svg>

        {/* Interactive Badminton Club Markers */}
        {branches.map((b, index) => {
          // Deterministic pseudo coordinates across canvas
          const topPercent = 20 + ((index * 29) % 60);
          const leftPercent = 15 + ((index * 37) % 70);

          const isHovered = hoveredBranchId === b.id;
          const isSelected = selectedPinId === b.id;
          const minPrice = b.priceRange?.min ?? 90000;
          const priceTag = `${Math.round(minPrice / 1000)}k`;

          return (
            <div
              key={b.id}
              style={{ top: `${topPercent}%`, left: `${leftPercent}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
            >
              <button
                type="button"
                onClick={() => setSelectedPinId(isSelected ? null : b.id)}
                onMouseEnter={() => setHoveredBranchId(b.id)}
                onMouseLeave={() => setHoveredBranchId(null)}
                aria-label={`Câu lạc bộ ${b.name}, giá từ ${priceTag}`}
                className={`group flex items-center gap-1 rounded-full px-3 py-1 text-xs font-black shadow-lg transition-all duration-200 cursor-pointer ${
                  isSelected || isHovered
                    ? 'scale-115 bg-brand-600 text-white ring-4 ring-brand-300 z-30'
                    : 'bg-white text-content-primary hover:scale-105 hover:bg-brand-50'
                }`}
              >
                <MapPin className={`size-3.5 ${isSelected || isHovered ? 'text-white' : 'text-brand-600'}`} />
                <span>{priceTag}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Map Control Floating Buttons */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 rounded-xl border border-line bg-surface/90 p-1 shadow-md backdrop-blur-xs">
        <button
          type="button"
          onClick={() => setZoomLevel((z) => Math.min(z + 0.2, 1.8))}
          aria-label="Phóng to bản đồ"
          className="grid size-8 place-items-center rounded-lg text-content-primary hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-brand-600"
        >
          <Plus className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => setZoomLevel((z) => Math.max(z - 0.2, 0.8))}
          aria-label="Thu nhỏ bản đồ"
          className="grid size-8 place-items-center rounded-lg text-content-primary hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-brand-600"
        >
          <Minus className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => {
            setZoomLevel(1);
            setSelectedPinId(null);
          }}
          aria-label="Đặt lại góc nhìn"
          className="grid size-8 place-items-center rounded-lg text-content-primary hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-brand-600"
        >
          <Navigation className="size-4 text-brand-600" />
        </button>
      </div>

      {/* Selected Branch Detail Card Popup (bottom floating) */}
      {activeBranch && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-30 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex gap-3 overflow-hidden rounded-2xl border border-line bg-surface p-3 shadow-2xl">
            <img
              src={activeBranch.coverImage}
              alt={activeBranch.name}
              className="size-24 rounded-xl object-cover shrink-0"
            />
            <div className="flex flex-1 flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] font-bold text-brand-600 uppercase">
                    {activeBranch.district}
                  </span>
                  <div className="flex items-center gap-0.5 text-xs font-bold text-amber-700">
                    <Star className="size-3 fill-current text-amber-500" />
                    <span>{activeBranch.rating.toFixed(1)}</span>
                  </div>
                </div>
                <h4 className="text-xs sm:text-sm font-extrabold text-content-primary line-clamp-1">
                  {activeBranch.name}
                </h4>
                <p className="text-[11px] text-content-secondary line-clamp-1">
                  {activeBranch.address}
                </p>
              </div>

              <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-line">
                <span className="text-xs font-extrabold text-brand-600">
                  {(activeBranch.priceRange?.min ?? 90000).toLocaleString('vi-VN')} đ/h
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => openDetailModal(activeBranch)}
                    className="rounded-lg border border-line px-2 py-1 text-[11px] font-bold text-content-primary hover:bg-surface-muted"
                  >
                    <ExternalLink className="size-3 inline mr-1" />
                    Chi tiết
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (activeBranch) {
                        const selectedDate = useBranchSearchStore.getState().selectedDate;
                        BranchNavigationService.goToCustomerCourtStatus(navigate, activeBranch, selectedDate);
                      }
                    }}
                    className="rounded-lg bg-brand-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-brand-700 cursor-pointer"
                  >
                    <CalendarCheck className="size-3 inline mr-1" />
                    Đặt sân
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
