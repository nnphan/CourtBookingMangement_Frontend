import React, { useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Filter } from 'lucide-react';
import { toast } from '@/lib/toast';
import { SchedulerService } from '../services/scheduler.service';
import { useCourtStatus } from '../hooks/useCourtStatus';
import { useCourtStatusFilters } from '../hooks/useCourtStatusFilters';
import { useCourtStatusSocket } from '../hooks/useCourtStatusSocket';
import { useCourtStatusStore } from '../store/court-status.store';
import { useMyBranches } from '@/hooks/branches/useMyBranches';
import { CourtStatusFilters } from '../components/CourtStatusFilters';
import { LegendBar } from '../components/LegendBar';
import {
  CourtScheduleBoard,
  type CourtScheduleBoardCourt,
  type CourtScheduleBoardBooking,
} from '@/features/court-status/components/CourtScheduleBoard';
import { SelectedScheduleSummary } from '@/features/court-status/components/SelectedScheduleSummary';
import { useCourtSlotSelection } from '@/features/court-status/hooks/useCourtSlotSelection';
import { BookingDetailDrawer } from '../components/BookingDetailDrawer';
import { CreateBookingDialog } from '@/features/bookings/components/CreateBookingDialog';
import { EditBookingDialog } from '../components/EditBookingDialog';
import type { MultiCourtBookingSelection } from '@/features/bookings/types/booking.types';
import { CourtStatusBoardSkeleton } from '../components/CourtStatusBoardSkeleton';
import { ErrorState } from '../components/ErrorState';
import { EmptyState } from '../components/EmptyState';
import type { BookingItem } from '../types/booking';
import { LanguageSwitcher } from '@/shared/components/LanguageSwitcher';
import { CurrentUserMenu } from '@/shared/components/current-user';
import { ManagementNavigation } from '@/components/navigation';
import { formatBookingDateToApi, formatTimeToApi } from '@/features/bookings/utils/booking.mapper';

export const CourtStatusPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Branch list from backend API
  const {
    data: myBranches = [],
    isLoading: isBranchesLoading,
    isError: isBranchesError,
    error: branchesError,
    refetch: refetchBranches,
  } = useMyBranches();

  // Filters hook
  const {
    selectedDate,
    selectedBranch,
    selectedCourtGroup,
    slotInterval,
    filterParams,
    handleDateChange,
    handleBranchChange,
    handleGroupChange,
    handleIntervalChange,
  } = useCourtStatusFilters();

  // Auto-select branch logic
  useEffect(() => {
    if (myBranches.length === 0) return;

    const branchExists = myBranches.some((b) => b.id === selectedBranch);
    if (!selectedBranch || !branchExists) {
      handleBranchChange(myBranches[0]!.id);
    }
  }, [myBranches, selectedBranch, handleBranchChange]);

  // Server state query & mutations
  const {
    courts,
    bookings,
    groups = [],
    openTime,
    closeTime,
    isLoading,
    isError,
    error,
    refetch,
    updateBooking,
    isUpdating,
    cancelBooking,
    checkIn,
    checkOut,
  } = useCourtStatus(filterParams);

  // Real-time socket events
  useCourtStatusSocket();

  // Zustand modal/drawer store
  const zoomLevel = useCourtStatusStore((s) => s.zoomLevel);
  const setZoomLevel = useCourtStatusStore((s) => s.setZoomLevel);
  const selectedBooking = useCourtStatusStore((s) => s.selectedBooking);
  const editingBooking = useCourtStatusStore((s) => s.editingBooking);
  const isCreateDialogOpen = useCourtStatusStore((s) => s.isCreateDialogOpen);
  const isDetailDrawerOpen = useCourtStatusStore((s) => s.isDetailDrawerOpen);
  const createDialogDefaultValues = useCourtStatusStore((s) => s.createDialogDefaultValues);

  const openCreateDialog = useCourtStatusStore((s) => s.openCreateDialog);
  const closeCreateDialog = useCourtStatusStore((s) => s.closeCreateDialog);
  const openEditDialog = useCourtStatusStore((s) => s.openEditDialog);
  const openDetailDrawer = useCourtStatusStore((s) => s.openDetailDrawer);
  const closeDetailDrawer = useCourtStatusStore((s) => s.closeDetailDrawer);

  // Independent multi-court, multi-time-slot selection state
  const {
    selectedSlotKeys,
    normalizedRanges,
    totalDurationHours,
    totalCourtCount,
    hasSelection,
    toggleSlot,
    removeRange,
    removeCourt,
    clearSelection,
  } = useCourtSlotSelection({ defaultSlotDurationMinutes: slotInterval || 60 });

  // Clear selections when branch or date changes
  useEffect(() => {
    clearSelection();
  }, [selectedBranch, selectedDate, clearSelection]);

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const isPastDate = useMemo(() => SchedulerService.isPastDate(selectedDate), [selectedDate]);

  const filteredCourts = useMemo(() => {
    if (!selectedCourtGroup || selectedCourtGroup === 'all') return courts;
    return courts.filter((c) => c.courtGroupId === selectedCourtGroup);
  }, [courts, selectedCourtGroup]);

  // Board adapters
  const boardCourts = useMemo<CourtScheduleBoardCourt[]>(() => {
    return filteredCourts.map((c) => ({
      id: c.id,
      name: c.name,
      status: c.isActive ? 'active' : 'inactive',
      pricePerHour: c.pricePerHour,
    }));
  }, [filteredCourts]);

  const boardBookings = useMemo<CourtScheduleBoardBooking[]>(() => {
    return bookings.map((b) => ({
      id: b.id,
      courtId: b.courtId,
      courtName: b.courtName,
      customerName: b.customerName,
      phoneNumber: b.phoneNumber,
      bookingDate: b.date || selectedDate,
      startTime: b.startTime,
      endTime: b.endTime,
      bookingType: b.bookingType,
      bookingStatus: b.bookingStatus,
      paymentStatus: b.paymentStatus,
      color: b.color,
      notes: b.notes,
      checkedIn: b.checkedIn,
      checkedOut: b.checkedOut,
    }));
  }, [bookings, selectedDate]);

  const handleToggleSlot = useCallback(
    (court: CourtScheduleBoardCourt, slotTime: string) => {
      toggleSlot({
        courtId: court.id,
        courtName: court.name,
        bookingDate: selectedDate,
        startTime: slotTime,
      });
    },
    [toggleSlot, selectedDate],
  );

  const handleOpenCreateBooking = useCallback(
    (initial?: {
      branchId?: string;
      courtId?: string;
      courtName?: string;
      date?: string;
      bookingDate?: string;
      startTime?: string;
      endTime?: string;
    }) => {
      const targetDate = initial?.bookingDate ?? initial?.date ?? selectedDate;
      if (SchedulerService.isPastDate(targetDate)) {
        toast.error(
          t('courtStatus.pastDateAlert', 'Cannot create bookings for past dates.'),
          'Không thể đặt lịch cho các ngày trong quá khứ.',
        );
        return;
      }
      openCreateDialog({
        branchId: initial?.branchId ?? selectedBranch,
        date: targetDate,
        bookingDate: targetDate,
        ...initial,
      });
    },
    [openCreateDialog, selectedDate, selectedBranch, t],
  );

  const handleCancelBooking = useCallback(
    async (booking: CourtScheduleBoardBooking | BookingItem) => {
      if (window.confirm(`Bạn có chắc chắn muốn hủy lịch đặt của ${booking.customerName}?`)) {
        await cancelBooking(booking.id);
        closeDetailDrawer();
      }
    },
    [cancelBooking, closeDetailDrawer],
  );

  const handleCheckIn = useCallback(
    async (booking: CourtScheduleBoardBooking | BookingItem) => {
      await checkIn(booking.id);
    },
    [checkIn],
  );

  const handleCheckOut = useCallback(
    async (booking: CourtScheduleBoardBooking | BookingItem) => {
      await checkOut(booking.id);
    },
    [checkOut],
  );

  const handleCreateInvoice = useCallback((booking: CourtScheduleBoardBooking | BookingItem) => {
    alert(`Tạo hóa đơn cho lịch đặt ${booking.customerName}`);
  }, []);

  const handleSubmitBooking = useCallback(
    async (payload: Partial<BookingItem>) => {
      if (payload.id) {
        await updateBooking({ id: payload.id, data: payload });
      }
    },
    [updateBooking],
  );

  // Multi-court booking selection mapped losslessly to CreateBookingDialog
  const createSelection = useMemo<MultiCourtBookingSelection | null>(() => {
    if (normalizedRanges.length > 0 && selectedBranch) {
      const primaryRange = normalizedRanges[0]!;
      const courtsMap = new Map<string, string>();
      for (const r of normalizedRanges) {
        courtsMap.set(r.courtId, r.courtName);
      }
      const selectedCourtsList = Array.from(courtsMap.entries()).map(([courtId, courtName]) => ({
        courtId,
        courtName,
      }));

      return {
        branchId: selectedBranch,
        bookingDate: formatBookingDateToApi(selectedDate),
        startTime: formatTimeToApi(primaryRange.startTime),
        endTime: formatTimeToApi(primaryRange.endTime),
        courts: selectedCourtsList,
        details: normalizedRanges.map((range) => ({
          courtId: range.courtId,
          courtName: range.courtName,
          bookingDate: formatBookingDateToApi(range.bookingDate),
          startTime: formatTimeToApi(range.startTime),
          endTime: formatTimeToApi(range.endTime),
        })),
      };
    }

    // Fallback if dialog opened without slot selection (e.g. from event button or empty state)
    const defaults = createDialogDefaultValues;
    const court = courts.find((item) => item.id === defaults?.courtId) ?? courts[0];
    const fallbackCourts = court ? [{ courtId: court.id, courtName: court.name }] : [];
    if (!selectedBranch || fallbackCourts.length === 0) return null;
    return {
      branchId: selectedBranch,
      bookingDate: defaults?.bookingDate ?? defaults?.date ?? selectedDate,
      startTime: defaults?.startTime ? formatTimeToApi(defaults.startTime) : '08:00:00',
      endTime: defaults?.endTime ? formatTimeToApi(defaults.endTime) : '09:00:00',
      courts: fallbackCourts,
    };
  }, [normalizedRanges, selectedBranch, selectedDate, createDialogDefaultValues, courts]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#0d6838] text-white">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-white/10 bg-[#0d6838] px-4 shadow-xs">
        {/* Left: Back Button */}
        <button
          type="button"
          onClick={handleBack}
          aria-label={t('common.back', 'Quay lại')}
          className="grid size-9 place-items-center rounded-full text-white/90 transition-colors hover:bg-white/15 active:scale-95"
        >
          <ArrowLeft className="size-5 stroke-[2.5]" />
        </button>

        <ManagementNavigation />

        {/* Right: Language Switcher, Search and Filter Icons */}
        <div className="flex items-center gap-1 sm:gap-2">
          <LanguageSwitcher variant="contrast" className="mr-1" />
          <CurrentUserMenu />

          <button
            type="button"
            aria-label={t('courtStatus.header.filter', 'Bộ lọc')}
            className="grid size-9 place-items-center rounded-full text-white/90 transition-colors hover:bg-white/15 active:scale-95"
          >
            <Filter className="size-5 stroke-[2.2]" />
          </button>
        </div>
      </header>

      {/* Filter Section */}
      <section aria-label="Bộ lọc trạng thái sân" className="border-b border-white/10 bg-[#0d6838]">
        <CourtStatusFilters
          branches={myBranches}
          groups={groups}
          selectedBranch={selectedBranch}
          selectedGroup={selectedCourtGroup}
          selectedDate={selectedDate}
          slotInterval={slotInterval}
          isLoading={isLoading}
          isBranchesLoading={isBranchesLoading}
          isBranchesError={isBranchesError}
          onRetryBranches={() => void refetchBranches()}
          onBranchChange={handleBranchChange}
          onGroupChange={handleGroupChange}
          onDateChange={handleDateChange}
          onIntervalChange={handleIntervalChange}
          onRefresh={() => refetch()}
        />
      </section>

      {/* Legend Section */}
      <section
        aria-label="Chú thích màu trạng thái"
        className="border-b border-white/10 bg-[#0b5129]/90"
      >
        <LegendBar />
      </section>

      {/* Main Content Area */}
      <main className="relative flex h-full w-full flex-1 flex-col overflow-hidden bg-white">
        {isBranchesLoading || (isLoading && Boolean(selectedBranch)) ? (
          <CourtStatusBoardSkeleton />
        ) : isBranchesError ? (
          <div className="p-6">
            <ErrorState
              title={t('courtStatus.filters.branchLoadError', 'Failed to load branches')}
              message={
                (branchesError as Error)?.message ||
                t('courtStatus.branchLoadErrorDesc', 'Unable to retrieve your branch list.')
              }
              onRetry={() => void refetchBranches()}
            />
          </div>
        ) : myBranches.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title={t('courtStatus.noBranches', 'No branches available')}
              description={t(
                'courtStatus.noBranchesDesc',
                'No branches found for your account. Please contact the administrator.',
              )}
              date={selectedDate}
            />
          </div>
        ) : isError ? (
          <div className="p-6">
            <ErrorState
              title={t('courtStatus.error.title', 'Failed to load court schedule')}
              message={(error as Error)?.message || t('courtStatus.error.tryAgain', 'Try Again')}
              onRetry={() => refetch()}
            />
          </div>
        ) : courts.length === 0 ? (
          <div className="p-6">
            <EmptyState
              date={selectedDate}
              onCreateBooking={
                isPastDate ? undefined : () => handleOpenCreateBooking({ date: selectedDate })
              }
            />
          </div>
        ) : (
          <div className="flex h-full w-full flex-1 flex-col overflow-hidden pb-16">
            <CourtScheduleBoard
              courts={boardCourts}
              bookings={boardBookings}
              selectedDate={selectedDate}
              openTime={openTime}
              closeTime={closeTime}
              slotInterval={slotInterval}
              zoomLevel={zoomLevel}
              onZoomChange={setZoomLevel}
              selectedSlotKeys={selectedSlotKeys}
              onToggleSlot={handleToggleSlot}
              onSelectBooking={(b) => {
                const found = bookings.find((item) => item.id === b.id);
                if (found) openDetailDrawer(found);
              }}
              onEditBooking={(b) => {
                const found = bookings.find((item) => item.id === b.id);
                if (found) openEditDialog(found);
              }}
              onCheckIn={handleCheckIn}
              onCheckOut={handleCheckOut}
              onCreateInvoice={handleCreateInvoice}
              onCancelBooking={handleCancelBooking}
            />

            {/* Selected Schedule Summary Bar */}
            {hasSelection && (
              <SelectedScheduleSummary
                ranges={normalizedRanges}
                totalDurationHours={totalDurationHours}
                totalCourtCount={totalCourtCount}
                onRemoveRange={removeRange}
                onClearAll={clearSelection}
                onConfirm={() => openCreateDialog()}
                confirmLabel={t('courtStatus.bottom.book', 'Đặt lịch')}
              />
            )}
          </div>
        )}
      </main>

      {/* Booking Detail Drawer (Sheet) */}
      <BookingDetailDrawer
        bookingId={selectedBooking?.id}
        booking={selectedBooking}
        isOpen={isDetailDrawerOpen}
        onClose={closeDetailDrawer}
        onEdit={(b) => {
          closeDetailDrawer();
          openEditDialog(b);
        }}
        onCheckIn={handleCheckIn}
        onCancel={handleCancelBooking}
      />

      {/* Create / Edit Booking Modal Dialog */}
      {editingBooking ? (
        <EditBookingDialog
          isOpen={isCreateDialogOpen}
          onClose={closeCreateDialog}
          courts={courts}
          branchId={selectedBranch}
          editingBooking={editingBooking}
          onSubmitBooking={handleSubmitBooking}
          isLoading={isUpdating}
        />
      ) : (
        <CreateBookingDialog
          isOpen={isCreateDialogOpen}
          onClose={closeCreateDialog}
          mode="ADMIN"
          selection={createSelection}
          onRemoveCourt={removeCourt}
          onBookingCreated={() => {
            clearSelection();
            void refetch();
          }}
        />
      )}
    </div>
  );
};

export default CourtStatusPage;
