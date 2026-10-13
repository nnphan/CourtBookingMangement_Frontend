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
import { CourtScheduler } from '../components/CourtScheduler';
import { BookingDetailDrawer } from '../components/BookingDetailDrawer';
import { CreateBookingDialog } from '../components/CreateBookingDialog';
import { CourtStatusBoardSkeleton } from '../components/CourtStatusBoardSkeleton';
import { ErrorState } from '../components/ErrorState';
import { EmptyState } from '../components/EmptyState';
import type { BookingItem } from '../types/booking';
import { LanguageSwitcher } from '@/shared/components/LanguageSwitcher';
import { ManagementNavigation } from '@/components/navigation';

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
    dateLabel,
    handleDateChange,
    handleBranchChange,
    handleGroupChange,
    handleIntervalChange,
    resetFilters,
  } = useCourtStatusFilters();

  // Auto-select branch logic
  // Case 1 & Case 2: Auto select first branch when branches are loaded and none or invalid branch selected
  // Case 3: No branches returned -> do not select branch
  useEffect(() => {
    if (myBranches.length === 0) return;

    const branchExists = myBranches.some((b) => b.id === selectedBranch);
    if (!selectedBranch || !branchExists) {
      handleBranchChange(myBranches[0]!.id);
    }
  }, [myBranches, selectedBranch, handleBranchChange]);

  // Server state query & mutations (automatically refetches when filterParams.branchId changes)
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
    createBooking,
    isCreating,
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

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const isPastDate = useMemo(() => SchedulerService.isPastDate(selectedDate), [selectedDate]);

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
      if (initial?.startTime && SchedulerService.isPastSlot(targetDate, initial.startTime)) {
        toast.error(
          t('courtStatus.pastSlotTooltip', 'Past time slots cannot be booked.'),
          'Không thể đặt khung giờ trong quá khứ.',
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

  const handleOpenCreateEvent = useCallback(() => {
    if (SchedulerService.isPastDate(selectedDate)) {
      toast.error(
        t('courtStatus.pastDateAlert', 'Cannot create bookings for past dates.'),
        'Không thể tạo sự kiện cho các ngày trong quá khứ.',
      );
      return;
    }
    openCreateDialog({
      courtId: courts[0]?.id,
      date: selectedDate,
      startTime: '08:00',
      endTime: '12:00',
    });
  }, [openCreateDialog, courts, selectedDate, t]);

  const handleCancelBooking = useCallback(
    async (booking: BookingItem) => {
      if (window.confirm(`Bạn có chắc chắn muốn hủy lịch đặt của ${booking.customerName}?`)) {
        await cancelBooking(booking.id);
        closeDetailDrawer();
      }
    },
    [cancelBooking, closeDetailDrawer],
  );

  const handleCheckIn = useCallback(
    async (booking: BookingItem) => {
      await checkIn(booking.id);
    },
    [checkIn],
  );

  const handleCheckOut = useCallback(
    async (booking: BookingItem) => {
      await checkOut(booking.id);
    },
    [checkOut],
  );

  const handleCreateInvoice = useCallback((booking: BookingItem) => {
    alert(`Tạo hóa đơn cho lịch đặt ${booking.bookingNumber} - ${booking.customerName}`);
  }, []);

  const handleSubmitBooking = useCallback(
    async (payload: Partial<BookingItem>) => {
      if (payload.id) {
        await updateBooking({ id: payload.id, data: payload });
      } else {
        await createBooking(payload);
      }
    },
    [createBooking, updateBooking],
  );

  return (
    <div className="flex flex-col min-h-screen w-full bg-[#0d6838] text-white">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between px-4 bg-[#0d6838] border-b border-white/10 shadow-xs">
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

          {/* Avatar here */}
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
      <section aria-label="Bộ lọc trạng thái sân" className="bg-[#0d6838] border-b border-white/10">
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
      <section aria-label="Chú thích màu trạng thái" className="bg-[#0b5129]/90 border-b border-white/10">
        <LegendBar />
      </section>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col w-full h-full bg-white overflow-hidden">
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
              onCreateBooking={isPastDate ? undefined : () => handleOpenCreateBooking({ date: selectedDate })}
            />
          </div>
        ) : (
          <div className="flex flex-1 flex-col w-full h-full overflow-hidden">
            <CourtScheduler
              courts={courts}
              bookings={bookings}
              openTime={openTime}
              closeTime={closeTime}
              slotInterval={slotInterval}
              dateLabel={dateLabel}
              zoomLevel={zoomLevel}
              onZoomChange={setZoomLevel}
              onResetFilters={resetFilters}
              onOpenCreateBooking={handleOpenCreateBooking}
              onOpenCreateEvent={handleOpenCreateEvent}
              onSelectBooking={openDetailDrawer}
              onEditBooking={openEditDialog}
              onCheckIn={handleCheckIn}
              onCheckOut={handleCheckOut}
              onCreateInvoice={handleCreateInvoice}
              onCancelBooking={handleCancelBooking}
            />
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
      <CreateBookingDialog
        isOpen={isCreateDialogOpen}
        onClose={closeCreateDialog}
        courts={courts}
        branchId={selectedBranch}
        defaultValues={createDialogDefaultValues}
        editingBooking={editingBooking}
        onSubmitBooking={handleSubmitBooking}
        isLoading={isCreating || isUpdating}
      />
    </div>
  );
};

export default CourtStatusPage;
