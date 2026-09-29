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
import { CustomerCourtStatusService } from '../services/customer-court-status.service';
import { BranchSelectDropdown } from '../components/BranchSelectDropdown';
import { SlotIntervalSelect } from '../components/SlotIntervalSelect';
import { MobileCourtSelect } from '../components/MobileCourtSelect';
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
  const openCreateBooking = useCustomerCourtStatusStore((s) => s.openCreateBooking);

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

  // Mobile selected court state
  const [activeMobileCourtId, setActiveMobileCourtId] = useState<string>('court-1');
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

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      setSelectedDate(e.target.value);
    }
  };

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
      closeTime: '23:30',
      rating: 4.9,
      isActive: true,
    };
  }, [branches, selectedBranchId, statusData?.branchName]);

  // Mobile active court
  const activeCourt = useMemo(() => {
    return courts.find((c) => c.courtId === activeMobileCourtId) || courts[0];
  }, [courts, activeMobileCourtId]);

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

      {/* 5. MAIN SCHEDULER VIEW */}
      <main className="flex-1 flex flex-col bg-white">
        {isLoading ? (
          <CustomerCourtStatusSkeleton />
        ) : isError ? (
          <div className="p-6">
            <CustomerCourtStatusError
              message={(error as Error)?.message}
              onRetry={() => refetch()}
            />
          </div>
        ) : courts.length === 0 ? (
          <div className="p-6">
            <CustomerCourtStatusEmpty date={selectedDate} />
          </div>
        ) : (
          <>
            {/* Desktop & Tablet Scheduler (>= 768px) */}
            <div className="hidden md:flex flex-1 flex-col">
              <CustomerCourtScheduler
                courts={courts}
                slots={slots}
                slotInterval={slotInterval}
                zoomLevel={zoomLevel}
              />
            </div>

            {/* Mobile View (< 768px): Privacy-Safe Court Cards */}
            <div className="md:hidden flex flex-col p-3 space-y-3 bg-slate-50">
              {/* Branch Selector on Mobile with modern Select */}
              {branches.length > 1 && (
                <div className="w-full">
                  <BranchSelectDropdown
                    branches={branches}
                    selectedBranchId={selectedBranchId}
                    onBranchChange={handleBranchChange}
                    variant="surface"
                  />
                </div>
              )}

              {/* Date & Court Switcher on Mobile */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1">
                  <MobileCourtSelect
                    courts={courts}
                    activeCourtId={activeCourt?.courtId || courts[0]?.courtId || ''}
                    onCourtChange={setActiveMobileCourtId}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setIsDatePickerOpen(true)}
                  aria-label="Chọn ngày xem lịch"
                  className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1.5 rounded-xl shrink-0 flex items-center gap-1.5 hover:bg-emerald-100/80 cursor-pointer transition-colors"
                >
                  <span>{formattedDisplayDate}</span>
                  <Calendar className="size-3.5 text-emerald-700" />
                </button>
              </div>

              {/* Court Quick Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {courts.map((court) => (
                  <button
                    key={court.courtId}
                    type="button"
                    onClick={() => setActiveMobileCourtId(court.courtId)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      (activeCourt?.courtId || courts[0]?.courtId) === court.courtId
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {court.courtName}
                  </button>
                ))}
              </div>

              {/* Mobile Court Slot Card */}
              {activeCourt && (
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full bg-emerald-500" />
                      <h3 className="font-bold text-sm text-slate-900">{activeCourt.courtName}</h3>
                    </div>
                    <span className="text-[11px] text-slate-500">Khung giờ hoạt động 05:00 - 24:00</span>
                  </div>

                  {/* Hourly availability summary */}
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-slate-700">Khung giờ phổ biến:</div>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { start: '06:00', end: '08:00', label: '06:00 - 08:00 (Sáng)' },
                        { start: '08:00', end: '10:00', label: '08:00 - 10:00 (Sáng)' },
                        { start: '14:00', end: '16:00', label: '14:00 - 16:00 (Chiều)' },
                        { start: '16:00', end: '18:00', label: '16:00 - 18:00 (Chiều)' },
                        { start: '18:00', end: '20:00', label: '18:00 - 20:00 (Tối)' },
                        { start: '20:00', end: '22:00', label: '20:00 - 22:00 (Tối)' },
                      ].map((slot) => {
                        const isAvailable = CustomerCourtStatusService.isRangeAvailable(
                          slots,
                          activeCourt.courtId,
                          slot.start,
                          slot.end,
                        );

                        return (
                          <button
                            key={slot.label}
                            type="button"
                            disabled={!isAvailable}
                            onClick={() =>
                              openCreateBooking({
                                courtId: activeCourt.courtId,
                                courtName: activeCourt.courtName,
                                startTime: slot.start,
                                endTime: slot.end,
                                selectedSlots: [slot.start],
                              })
                            }
                            className={`p-2.5 rounded-lg border text-left text-xs font-medium transition-all ${
                              isAvailable
                                ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950 hover:bg-emerald-100/80 cursor-pointer shadow-2xs'
                                : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                            }`}
                          >
                            <div className="font-semibold">{slot.label}</div>
                            <div className="text-[10px] mt-0.5 font-normal">
                              {isAvailable ? '🟢 Còn trống • Đặt ngay' : '🔴 Đã kín / Tạm khóa'}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
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
