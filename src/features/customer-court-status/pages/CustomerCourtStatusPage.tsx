import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import dayjs from 'dayjs';
import {
  ArrowLeft,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Building2,
} from 'lucide-react';
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

export const CustomerCourtStatusPage: React.FC = () => {
  const navigate = useNavigate();

  // Zustand Store
  const selectedBranchId = useCustomerCourtStatusStore((s) => s.selectedBranchId);
  const setSelectedBranchId = useCustomerCourtStatusStore((s) => s.setSelectedBranchId);
  const selectedDate = useCustomerCourtStatusStore((s) => s.selectedDate);
  const setSelectedDate = useCustomerCourtStatusStore((s) => s.setSelectedDate);
  const slotInterval = useCustomerCourtStatusStore((s) => s.slotInterval);
  const zoomLevel = useCustomerCourtStatusStore((s) => s.zoomLevel);
  const openCreateBooking = useCustomerCourtStatusStore((s) => s.openCreateBooking);

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

        {/* Right: Date Picker & Branch Select Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Branch Selector */}
          {branches.length > 1 && (
            <div className="hidden sm:flex items-center bg-white/10 hover:bg-white/15 rounded-md px-2 py-1 text-xs border border-white/15">
              <Building2 className="size-3.5 text-white/70 mr-1.5" />
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="bg-transparent text-white font-medium text-xs focus:outline-hidden cursor-pointer"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id} className="text-slate-900 bg-white">
                    {b.branchCode} - {b.branchName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date Picker Button with Day controls */}
          <div className="flex items-center bg-white/15 hover:bg-white/20 border border-white/20 rounded-md px-2 py-1 text-xs transition-colors">
            <button
              type="button"
              onClick={handlePrevDay}
              title="Ngày trước"
              className="p-0.5 hover:text-amber-300 transition-colors"
            >
              <ChevronLeft className="size-3.5" />
            </button>

            {/* Hidden native date input with styled label */}
            <label className="flex items-center gap-1.5 px-1.5 font-semibold cursor-pointer select-none">
              <span>{formattedDisplayDate}</span>
              <Calendar className="size-3.5 text-white/80" />
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateInputChange}
                className="sr-only"
              />
            </label>

            <button
              type="button"
              onClick={handleNextDay}
              title="Ngày sau"
              className="p-0.5 hover:text-amber-300 transition-colors"
            >
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. LEGEND SECTION */}
      <section aria-label="Chú thích màu trạng thái">
        <StatusLegend />
      </section>

      {/* 3. NOTICE BANNER */}
      <section aria-label="Thông báo hỗ trợ lịch cố định">
        <CustomerNoticeBanner />
      </section>

      {/* 4. MAIN SCHEDULER VIEW */}
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
              {/* Branch & Date Badge */}
              <div className="flex items-center justify-between bg-white p-3 rounded-xl shadow-2xs border border-slate-200">
                <span className="font-bold text-xs text-slate-800">
                  {statusData?.branchName || 'TMT Badminton Club'}
                </span>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {formattedDisplayDate}
                </span>
              </div>

              {/* Court Selection Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {courts.map((court) => (
                  <button
                    key={court.courtId}
                    type="button"
                    onClick={() => setActiveMobileCourtId(court.courtId)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
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

      {/* 5. MODALS & DIALOGS */}
      <CourtPriceModal />

      <CustomerCreateBookingDialog
        onSubmitBooking={createBooking}
        isLoading={isCreating}
        branchName={statusData?.branchName}
      />
    </div>
  );
};

export default CustomerCourtStatusPage;
