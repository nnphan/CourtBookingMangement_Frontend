import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router';
import dayjs from '@/lib/dayjs';
import { useQueryClient } from '@tanstack/react-query';
import { paths } from '@/app/router/paths';
import { useBranchSearchStore } from '@/features/branch-discovery/store/branch-search.store';
import { useCustomerCourtStatus } from '../hooks/useCustomerCourtStatus';
import { useCustomerCourtStatusStore } from '../store/customer-court-status.store';
import { CourtStatusHeader } from '@/features/court-status/components/CourtStatusHeader';
import { CourtStatusBoard } from '@/features/court-status/components/CourtStatusBoard';
import { StatusLegend } from '../components/StatusLegend';
import { CustomerNoticeBanner } from '../components/CustomerNoticeBanner';
import { CourtPriceModal } from '../components/CourtPriceModal';
import { CreateBookingDialog } from '@/features/court-status-board/components/CreateBookingDialog';
import { CustomerCourtStatusSkeleton } from '../components/CustomerCourtStatusSkeleton';
import { CustomerCourtStatusEmpty } from '../components/CustomerCourtStatusEmpty';
import { CustomerCourtStatusError } from '../components/CustomerCourtStatusError';
import { CustomerDatePickerDialog } from '../components/CustomerDatePickerDialog';
import type { CourtSelection } from '@/features/court-status/utils/time-selection.utils';
import type { BookingSelection } from '@/features/bookings/types/booking.types';
import { useCourtSelectionStore } from '@/features/court-status/store/court-selection.store';
import { formatBookingDateToApi, formatTimeToApi } from '@/features/bookings/utils/booking.mapper';

interface NavigationLocationState {
  branchId?: string;
  branchName?: string;
  selectedDate?: string;
}

export const CustomerCourtStatusPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { branchId: paramBranchId, id: paramId } = useParams<{ branchId?: string; id?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const queryBranchId = searchParams.get('branchId');
  const targetBranchId = paramBranchId || paramId || queryBranchId;

  const queryDate = searchParams.get('date');
  const locationState = location.state as NavigationLocationState | null;
  const stateDate = locationState?.selectedDate;

  // Zustand Stores
  const searchStoreDate = useBranchSearchStore((s) => s.selectedDate);
  const selectedBranchId = useCustomerCourtStatusStore((s) => s.selectedBranchId);
  const setSelectedBranchId = useCustomerCourtStatusStore((s) => s.setSelectedBranchId);
  const storeDate = useCustomerCourtStatusStore((s) => s.selectedDate);
  const setSelectedDate = useCustomerCourtStatusStore((s) => s.setSelectedDate);
  const zoomLevel = useCustomerCourtStatusStore((s) => s.zoomLevel);
  const setZoomLevel = useCustomerCourtStatusStore((s) => s.setZoomLevel);
  const selection = useCourtSelectionStore((s) => s.selection);
  const [isCreateBookingOpen, setIsCreateBookingOpen] = useState(false);

  // Single Source of Truth Date Resolution
  // Priority: 1. Route Date (?date= or location.state) -> 2. Branch Search Store -> 3. Local Store -> 4. Today
  const routeDate = useMemo(() => {
    if (queryDate && dayjs(queryDate).isValid()) {
      return dayjs(queryDate).format('YYYY-MM-DD');
    }
    if (stateDate && dayjs(stateDate).isValid()) {
      return dayjs(stateDate).format('YYYY-MM-DD');
    }
    return null;
  }, [queryDate, stateDate]);

  const selectedDate = useMemo(() => {
    return (
      routeDate ??
      (searchStoreDate && dayjs(searchStoreDate).isValid() ? searchStoreDate : null) ??
      (storeDate && dayjs(storeDate).isValid() ? storeDate : null) ??
      dayjs().format('YYYY-MM-DD')
    );
  }, [routeDate, searchStoreDate, storeDate]);

  const activeBranchId = targetBranchId || selectedBranchId;

  // Sync route parameter branchId into Zustand store
  useEffect(() => {
    if (targetBranchId && targetBranchId !== selectedBranchId) {
      setSelectedBranchId(targetBranchId);
    }
  }, [targetBranchId, selectedBranchId, setSelectedBranchId]);

  // Sync resolved selectedDate into store and URL query string for deep linking & refresh persistence
  useEffect(() => {
    if (selectedDate !== storeDate) {
      setSelectedDate(selectedDate);
    }
    if (queryDate !== selectedDate) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set('date', selectedDate);
          return next;
        },
        { replace: true },
      );
    }
  }, [selectedDate, storeDate, queryDate, setSelectedDate, setSearchParams]);

  // TanStack Query Server State: Completely driven by GET /api/court-status
  const {
    branches,
    statusData,
    courts,
    scheduleItems,
    openTime,
    closeTime,
    branchName,
    isLoading,
    isError,
    error,
    refetch,
  } = useCustomerCourtStatus(activeBranchId, selectedDate);

  // Auto-select first branch when branches are loaded and none is selected
  useEffect(() => {
    if (!activeBranchId && branches.length > 0) {
      setSelectedBranchId(branches[0]!.id);
    }
  }, [activeBranchId, branches, setSelectedBranchId]);

  // Date Picker Dialog State
  const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false);

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // Helper to update both store and URL query string when user changes date
  const updateSelectedDate = useCallback(
    (newDate: string) => {
      const normalized =
        newDate && dayjs(newDate).isValid()
          ? dayjs(newDate).format('YYYY-MM-DD')
          : dayjs().format('YYYY-MM-DD');
      setSelectedDate(normalized);
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set('date', normalized);
          return next;
        },
        { replace: true },
      );
    },
    [setSelectedDate, setSearchParams],
  );

  // Date Navigation Handlers
  const handlePrevDay = useCallback(() => {
    const prev = dayjs(selectedDate).subtract(1, 'day').format('YYYY-MM-DD');
    updateSelectedDate(prev);
  }, [selectedDate, updateSelectedDate]);

  const handleNextDay = useCallback(() => {
    const next = dayjs(selectedDate).add(1, 'day').format('YYYY-MM-DD');
    updateSelectedDate(next);
  }, [selectedDate, updateSelectedDate]);

  const handleBranchChange = useCallback(
    (newBranchId: string) => {
      setSelectedBranchId(newBranchId);
      navigate(paths.customerBranchCourtStatus(newBranchId, selectedDate), { replace: true });
    },
    [navigate, selectedDate, setSelectedBranchId],
  );

  // Handle confirming multi-cell selection from CourtStatusBoard
  const handleConfirmSelection = useCallback(
    (sel: CourtSelection) => {
      if (!activeBranchId || sel.selectedSlots.length === 0 || sel.durationHours <= 0) return;
      setIsCreateBookingOpen(true);
    },
    [activeBranchId],
  );

  // Current branch display resolution
  const currentBranch = useMemo(() => {
    const found = branches.find((b) => b.id === activeBranchId);
    if (found) return found;
    return {
      id: activeBranchId || '',
      branchName: branchName || statusData?.branchName || 'TMT Badminton Center',
      branchCode: 'CLB',
      address: '123 Nguyễn Thị Thập, Quận 7, TP.HCM',
      openTime: openTime || '05:00:00',
      closeTime: closeTime || '23:00:00',
      rating: 4.9,
      isActive: true,
    };
  }, [branches, activeBranchId, branchName, statusData?.branchName, openTime, closeTime]);

  const bookingCourts = useMemo(
    () =>
      activeBranchId
        ? courts.map((court) => ({
            id: court.courtId,
            name: court.courtName,
            courtNumber: court.courtNumber,
            branchId: activeBranchId,
            isActive: court.status.trim().toLowerCase() === 'active',
            pricePerHour: 0,
          }))
        : [],
    [activeBranchId, courts],
  );

  const bookingSelection = useMemo<BookingSelection | null>(() => {
    if (!selection || !activeBranchId || selection.durationHours <= 0) return null;
    return {
      branchId: activeBranchId,
      branchName: currentBranch.branchName,
      courtId: selection.courtId,
      courtName: selection.courtName,
      bookingDate: formatBookingDateToApi(selectedDate),
      startTime: formatTimeToApi(selection.startTime),
      endTime: formatTimeToApi(selection.endTime),
      durationMinutes: selection.durationHours * 60,
    };
  }, [activeBranchId, currentBranch.branchName, selectedDate, selection]);
  useEffect(() => {
    if (!bookingSelection) setIsCreateBookingOpen(false);
  }, [bookingSelection]);

  const invalidateCourtStatus = useCallback(() => {
    if (!activeBranchId) return;
    void queryClient.invalidateQueries({
      queryKey: ['court-status', activeBranchId, selectedDate],
      exact: true,
    });
  }, [activeBranchId, queryClient, selectedDate]);

  const handleBookingCreated = useCallback(() => {
    useCourtSelectionStore.getState().clearSelection();
    setIsCreateBookingOpen(false);
    invalidateCourtStatus();
  }, [invalidateCourtStatus]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#0d6838] text-white">
      {/* 1. TOP HEADER BAR: Dynamic branch title, date display & selector */}
      <CourtStatusHeader
        branchName={branchName || currentBranch.branchName}
        selectedDate={selectedDate}
        branches={branches}
        selectedBranchId={activeBranchId}
        onBranchChange={handleBranchChange}
        onPrevDay={handlePrevDay}
        onNextDay={handleNextDay}
        onOpenDatePicker={() => setIsDatePickerOpen(true)}
        onBack={handleBack}
      />

      {/* 2. SELECTED BRANCH INFORMATION BANNER */}
      <section
        aria-label="Thông tin chi nhánh"
        className="flex flex-col justify-between gap-1.5 border-b border-white/10 bg-[#0b532d] px-3 py-2 text-xs text-white/95 shadow-inner sm:flex-row sm:items-center sm:px-6"
      >
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-100 sm:text-sm">
          <span className="text-sm sm:text-base">🏢</span>
          <span className="tracking-tight">{branchName || currentBranch.branchName}</span>
        </div>
        {currentBranch.address && (
          <div className="flex items-center gap-1.5 text-[11px] text-white/85 sm:text-xs">
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

      {/* 5. MAIN SCHEDULER VIEW: Rendered completely from GET /api/court-status */}
      <main className="flex w-full flex-1 flex-col overflow-hidden bg-white">
        {isLoading ? (
          <CustomerCourtStatusSkeleton />
        ) : isError ? (
          <div className="flex w-full flex-1 items-center justify-center p-6">
            <CustomerCourtStatusError
              message={(error as Error)?.message}
              onRetry={() => refetch()}
            />
          </div>
        ) : courts.length === 0 ? (
          <div className="flex w-full flex-1 items-center justify-center p-6">
            <CustomerCourtStatusEmpty date={selectedDate} />
          </div>
        ) : (
          <div className="flex h-full w-full flex-1 flex-col overflow-hidden">
            <CourtStatusBoard
              courts={courts}
              scheduleItems={scheduleItems}
              openTime={openTime}
              closeTime={closeTime}
              selectedDate={selectedDate}
              selectedBranchId={activeBranchId}
              zoomLevel={zoomLevel}
              onZoomChange={setZoomLevel}
              onConfirmSelection={handleConfirmSelection}
            />
          </div>
        )}
      </main>

      {/* 6. MODALS & DIALOGS */}
      <CourtPriceModal />

      {/* Create Booking Dialog */}
      <CreateBookingDialog
        isOpen={isCreateBookingOpen}
        onClose={() => setIsCreateBookingOpen(false)}
        courts={bookingCourts}
        branchId={activeBranchId}
        mode="CUSTOMER"
        initialSelection={bookingSelection}
        onBookingCreated={handleBookingCreated}
        onBookingConflict={invalidateCourtStatus}
      />

      {/* Vietnamese Date Picker Dialog */}
      <CustomerDatePickerDialog
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        selectedDate={selectedDate}
        onConfirmDate={updateSelectedDate}
      />
    </div>
  );
};

export default CustomerCourtStatusPage;
