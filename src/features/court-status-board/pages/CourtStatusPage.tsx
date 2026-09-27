import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Search, Filter } from 'lucide-react';
import { toast } from '@/lib/toast';
import { SchedulerService } from '../services/scheduler.service';
import { useCourtStatus } from '../hooks/useCourtStatus';
import { useCourtStatusFilters } from '../hooks/useCourtStatusFilters';
import { useCourtStatusSocket } from '../hooks/useCourtStatusSocket';
import { useCourtStatusStore } from '../store/court-status.store';
import { CourtStatusFilters } from '../components/CourtStatusFilters';
import { LegendBar } from '../components/LegendBar';
import { CourtScheduler } from '../components/CourtScheduler';
import { BookingDetailDrawer } from '../components/BookingDetailDrawer';
import { CreateBookingDialog } from '../components/CreateBookingDialog';
import { CourtStatusSkeleton } from '../components/CourtStatusSkeleton';
import { ErrorState } from '../components/ErrorState';
import { EmptyState } from '../components/EmptyState';
import type { BookingItem } from '../types/booking';

export const CourtStatusPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

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

  // Server state query & mutations
  const {
    courts,
    bookings,
    branches,
    groups,
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
      courtId?: string;
      courtName?: string;
      date?: string;
      startTime?: string;
      endTime?: string;
    }) => {
      const targetDate = initial?.date ?? selectedDate;
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
      openCreateDialog({ date: targetDate, ...initial });
    },
    [openCreateDialog, selectedDate, t],
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

        {/* Center: Title */}
        <h1 className="text-base sm:text-lg font-bold tracking-tight text-white drop-shadow-xs">
          {t('courtStatus.title', 'Trạng thái sân')}
        </h1>

        {/* Right: Search and Filter Icons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label={t('courtStatus.header.search', 'Tìm kiếm')}
            className="grid size-9 place-items-center rounded-full text-white/90 transition-colors hover:bg-white/15 active:scale-95"
          >
            <Search className="size-5 stroke-[2.2]" />
          </button>
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
          branches={branches}
          groups={groups}
          selectedBranch={selectedBranch}
          selectedGroup={selectedCourtGroup}
          selectedDate={selectedDate}
          slotInterval={slotInterval}
          isLoading={isLoading}
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
      <main className="flex-1 flex flex-col bg-white">
        {isLoading ? (
          <CourtStatusSkeleton />
        ) : isError ? (
          <div className="p-6">
            <ErrorState message={(error as Error)?.message} onRetry={() => refetch()} />
          </div>
        ) : courts.length === 0 ? (
          <div className="p-6">
            <EmptyState
              date={selectedDate}
              onCreateBooking={isPastDate ? undefined : () => handleOpenCreateBooking({ date: selectedDate })}
            />
          </div>
        ) : (
          <>
            {/* Desktop & Tablet View: Full Scheduler */}
            <div className="hidden md:flex flex-1 flex-col">
              <CourtScheduler
                courts={courts}
                bookings={bookings}
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

            {/* Mobile View (<768px): Card / List Mode per court */}
            <div className="md:hidden flex flex-col p-3 space-y-3 bg-slate-50">
              <div className="flex items-center justify-between bg-white p-3 rounded-xl shadow-xs border border-slate-200">
                <span className="font-bold text-sm text-slate-800">
                  {dateLabel.dayOfWeek}, {dateLabel.formattedDate}
                </span>
                <span className="text-xs text-slate-500">
                  {bookings.length} {t('courtStatus.mobile.activeBookings', 'lượt đặt')}
                </span>
              </div>

              {courts.map((court) => {
                const courtBookings = bookings.filter((b) => b.courtId === court.id);
                return (
                  <div
                    key={court.id}
                    className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs space-y-2"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-emerald-500" />
                        <h3 className="font-bold text-slate-900">{court.name}</h3>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          openCreateDialog({
                            courtId: court.id,
                            courtName: court.name,
                            date: selectedDate,
                          })
                        }
                        className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                      >
                        + Đặt sân
                      </button>
                    </div>

                    {courtBookings.length === 0 ? (
                      <div className="text-xs text-slate-400 py-1 italic">
                        {t('courtStatus.mobile.emptyCourt', 'Sân trống cả ngày')}
                      </div>
                    ) : (
                      <div className="space-y-1.5 pt-1">
                        {courtBookings.map((b) => (
                          <div
                            key={b.id}
                            onClick={() => openDetailDrawer(b)}
                            className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-emerald-50/70 border border-slate-100 transition-colors cursor-pointer"
                          >
                            <div className="text-xs">
                              <span className="font-bold text-slate-900">{b.customerName}</span>
                              <div className="text-[11px] text-slate-500">
                                {b.startTime} - {b.endTime}
                              </div>
                            </div>
                            <span className="text-xs font-semibold text-emerald-700">
                              {(b.totalAmount ?? 0).toLocaleString('vi-VN')} đ
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>

      {/* Booking Detail Drawer (Sheet) */}
      <BookingDetailDrawer
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
        defaultValues={createDialogDefaultValues}
        editingBooking={editingBooking}
        onSubmitBooking={handleSubmitBooking}
        isLoading={isCreating || isUpdating}
      />
    </div>
  );
};

export default CourtStatusPage;
