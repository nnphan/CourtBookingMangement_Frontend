import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import dayjs from 'dayjs';
import {
  ArrowLeft,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { paths } from '@/app/router/paths';
import { useCustomerCourtStatus } from '../hooks/useCustomerCourtStatus';
import { useCustomerCourtStatusStore } from '../store/customer-court-status.store';
import { StatusLegend } from '../components/StatusLegend';
import { CustomerNoticeBanner } from '../components/CustomerNoticeBanner';
import { CustomerCourtScheduler } from '../components/CustomerCourtScheduler';
import { CourtPriceModal } from '../components/CourtPriceModal';
import { CustomerCreateBookingDialog } from '../components/CustomerCreateBookingDialog';
import { CustomerCourtStatusSkeleton } from '../components/CustomerCourtStatusSkeleton';
import { CustomerCourtStatusEmpty } from '../components/CustomerCourtStatusEmpty';
import { CustomerCourtStatusError } from '../components/CustomerCourtStatusError';
import { BranchSelectDropdown } from '../components/BranchSelectDropdown';
import { SlotIntervalSelect } from '../components/SlotIntervalSelect';
import { CustomerDatePickerDialog } from '../components/CustomerDatePickerDialog';

export const CustomerCourtStatusPage: React.FC = () => {
  const navigate = useNavigate();
  const { branchId: paramBranchId } = useParams<{ branchId?: string }>();
  const [searchParams] = useSearchParams();
  const queryBranchId = searchParams.get('branchId');
  const targetBranchId = paramBranchId || queryBranchId;

  // Zustand Store
  const selectedBranchId = useCustomerCourtStatusStore((s) => s.selectedBranchId);
  const setSelectedBranchId = useCustomerCourtStatusStore((s) => s.setSelectedBranchId);
  const selectedDate = useCustomerCourtStatusStore((s) => s.selectedDate);
  const setSelectedDate = useCustomerCourtStatusStore((s) => s.setSelectedDate);
  const slotInterval = useCustomerCourtStatusStore((s) => s.slotInterval);
  const setSlotInterval = useCustomerCourtStatusStore((s) => s.setSlotInterval);
  const zoomLevel = useCustomerCourtStatusStore((s) => s.zoomLevel);

  // Sync route parameter branchId into Zustand store
  useEffect(() => {
    if (targetBranchId && targetBranchId !== selectedBranchId) {
      setSelectedBranchId(targetBranchId);
    }
  }, [targetBranchId, selectedBranchId, setSelectedBranchId]);

  // TanStack Query Server State
  const {
    branches,
    statusData,
    courts,
    slots,
    isLoading,
    isError,
    error,
    refetch,
    createBooking,
    isCreating,
  } = useCustomerCourtStatus();

  const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false);

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // Date Navigation
  const formattedDisplayDate = useMemo(() => {
    return dayjs(selectedDate).format('DD/MM/YYYY');
  }, [selectedDate]);

  const handlePrevDay = useCallback(() => {
    const prev = dayjs(selectedDate).subtract(1, 'day').format('YYYY-MM-DD');
    setSelectedDate(prev);
  }, [selectedDate, setSelectedDate]);

  const handleNextDay = useCallback(() => {
    const next = dayjs(selectedDate).add(1, 'day').format('YYYY-MM-DD');
    setSelectedDate(next);
  }, [selectedDate, setSelectedDate]);

  const handleBranchChange = (newBranchId: string) => {
    setSelectedBranchId(newBranchId);
    navigate(paths.customerBranchCourtStatus(newBranchId), { replace: true });
  };

  // Resolve current branch information
  const currentBranch = useMemo(() => {
    const found = branches.find((b) => b.id === selectedBranchId);
    if (found) return found;
    return {
      id: selectedBranchId,
      branchName: statusData?.branchName || 'TMT Badminton Club',
      branchCode: 'CLB',
      address: '123 Nguyễn Thị Thập, Quận 7, TP.HCM',
      openTime: '05:00',
      closeTime: '23:00',
      rating: 4.9,
      isActive: true,
    };
  }, [branches, selectedBranchId, statusData?.branchName]);

  return (
    <div className="flex flex-col min-h-screen w-full bg-[#0d6838] text-white">
      {/* 1. TOP HEADER BAR */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between px-3 sm:px-6 bg-[#0d6838] border-b border-white/10 shadow-xs">
        {/* Left: Back Button */}
        <button
          type="button"
          onClick={handleBack}
          aria-label="Quay lại"
          className="grid size-9 place-items-center rounded-full text-white/90 transition-colors hover:bg-white/15 active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="size-5 stroke-[2.5]" />
        </button>

        {/* Center: Title (Matches Screenshot) */}
        <h1 className="text-sm sm:text-base md:text-lg font-bold tracking-tight text-white drop-shadow-xs uppercase text-center truncate px-2">
          ĐẶT LỊCH THEO SÂN - TRỰC QUAN
        </h1>

        {/* Right: Date Picker & Modern Notion/Linear Dropdowns */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Branch Selector Dropdown (Modern Enterprise Radix UI Select) */}
          {branches.length > 1 && (
            <div className="hidden sm:block">
              <BranchSelectDropdown
                branches={branches}
                selectedBranchId={selectedBranchId}
                onBranchChange={handleBranchChange}
                variant="header"
              />
            </div>
          )}

          {/* Slot Interval Select (Desktop/Tablet) */}
          <div className="hidden lg:block">
            <SlotIntervalSelect
              value={slotInterval}
              onChange={setSlotInterval}
            />
          </div>

          {/* Date Picker Button (Matches Screenshot: [ 29/09/2026 📅 ]) */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrevDay}
              title="Ngày trước"
              aria-label="Ngày trước"
              className="p-1 rounded-md text-white/80 hover:text-white hover:bg-white/15 transition-colors cursor-pointer hidden sm:grid place-items-center"
            >
              <ChevronLeft className="size-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setIsDatePickerOpen(true)}
              aria-label="Chọn ngày xem lịch trạng thái sân"
              className="flex items-center gap-2 bg-white/12 hover:bg-white/20 active:bg-white/25 border border-white/25 rounded-lg px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition-all duration-150 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-emerald-300"
            >
              <span>{formattedDisplayDate}</span>
              <Calendar className="size-3.5 text-white/90" />
            </button>

            <button
              type="button"
              onClick={handleNextDay}
              title="Ngày sau"
              aria-label="Ngày sau"
              className="p-1 rounded-md text-white/80 hover:text-white hover:bg-white/15 transition-colors cursor-pointer hidden sm:grid place-items-center"
            >
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. SELECTED BRANCH INFORMATION BANNER */}
      <section
        aria-label="Thông tin chi nhánh"
        className="bg-[#0b532d] px-3 sm:px-6 py-2 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs text-white/95 shadow-inner"
      >
        <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-emerald-100">
          <span className="text-sm sm:text-base">🏢</span>
          <span className="tracking-tight">{currentBranch.branchName}</span>
        </div>
        {currentBranch.address && (
          <div className="flex items-center gap-1.5 text-white/85 text-[11px] sm:text-xs">
            <span className="text-emerald-300">📍</span>
            <span>{currentBranch.address}</span>
          </div>
        )}
      </section>

      {/* 3. LEGEND SECTION */}
      <section aria-label="Chú thích màu trạng thái">
        <StatusLegend />
      </section>

      {/* 4. NOTICE BANNER */}
      <section aria-label="Thông báo hỗ trợ lịch cố định">
        <CustomerNoticeBanner />
      </section>

      {/* 5. MAIN SCHEDULER VIEW (100% Full Width across Desktop, Tablet & Mobile) */}
      <main className="flex-1 w-full flex flex-col bg-white overflow-hidden">
        {/* Mobile Controls Bar (< 640px): Branch & Interval Selectors */}
        {branches.length > 1 && (
          <div className="sm:hidden flex items-center gap-2 px-3 py-2 bg-slate-50 border-b border-slate-200">
            <div className="flex-1">
              <BranchSelectDropdown
                branches={branches}
                selectedBranchId={selectedBranchId}
                onBranchChange={handleBranchChange}
                variant="surface"
              />
            </div>
            <SlotIntervalSelect
              value={slotInterval}
              onChange={setSlotInterval}
              className="bg-emerald-800 hover:bg-emerald-700 text-white border-emerald-700"
            />
          </div>
        )}

        {isLoading ? (
          <CustomerCourtStatusSkeleton />
        ) : isError ? (
          <div className="p-6 w-full flex-1 flex items-center justify-center">
            <CustomerCourtStatusError
              message={(error as Error)?.message}
              onRetry={() => refetch()}
            />
          </div>
        ) : courts.length === 0 ? (
          <div className="p-6 w-full flex-1 flex items-center justify-center">
            <CustomerCourtStatusEmpty date={selectedDate} />
          </div>
        ) : (
          <div className="flex flex-1 flex-col w-full h-full overflow-hidden">
            <CustomerCourtScheduler
              courts={courts}
              slots={slots}
              slotInterval={slotInterval}
              zoomLevel={zoomLevel}
            />
          </div>
        )}
      </main>

      {/* 6. MODALS & DIALOGS */}
      <CourtPriceModal />

      <CustomerCreateBookingDialog
        onSubmitBooking={createBooking}
        isLoading={isCreating}
        branchName={currentBranch.branchName}
      />

      {/* 7. CUSTOM VIETNAMESE CALENDAR DIALOG (MATCHES SCREENSHOT) */}
      <CustomerDatePickerDialog
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        selectedDate={selectedDate}
        onConfirmDate={setSelectedDate}
      />
    </div>
  );
};

export default CustomerCourtStatusPage;
