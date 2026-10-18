import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { CalendarDays, LoaderCircle, Plus, RefreshCw, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { paths } from '@/app/router/paths';
import { DiscoveryHeader } from '@/features/branch-discovery/components/DiscoveryHeader';
import { BookingDetailDrawer } from '@/features/court-status-board/components/BookingDetailDrawer';
import { useMyBookings } from '../hooks/useMyBookings';
import type { MyBookingListItemDto } from '../types/booking.types';
import { normalizeBookingStatus } from '../utils/booking-status.utils';
import { MyBookingCard } from '../components/MyBookingCard';
import {
  MyBookingEmptyState,
  MyBookingErrorState,
  MyBookingSkeleton,
} from '../components/MyBookingStates';
import {
  MY_BOOKING_SUMMARY_ICONS,
  MyBookingSummary,
  type MyBookingSummaryItem,
} from '../components/MyBookingSummary';
import dayjs from '@/lib/dayjs';

type BookingTab = 'upcoming' | 'completed' | 'cancelled' | 'all';
const TIME_ZONE = 'Asia/Ho_Chi_Minh';

const getBookingTimestamp = (booking: MyBookingListItemDto, time: string): number | null => {
  const formattedTime = time.split(':').slice(0, 2).join(':');
  const value = dayjs.tz(`${booking.bookingDate} ${formattedTime}`, 'YYYY-MM-DD HH:mm', TIME_ZONE);
  return value.isValid() ? value.valueOf() : null;
};

const isUpcoming = (booking: MyBookingListItemDto, now: number): boolean => {
  const status = normalizeBookingStatus(booking.status);
  if (status === 'COMPLETED' || status === 'CANCELLED') return false;
  const end = getBookingTimestamp(booking, booking.endTime);
  return end !== null && end > now;
};

const normalizeSearch = (value: string): string =>
  value
    .trim()
    .toLocaleLowerCase('vi-VN')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd');

const TAB_OPTIONS: { id: BookingTab; label: string }[] = [
  { id: 'upcoming', label: 'Sắp tới' },
  { id: 'completed', label: 'Hoàn thành' },
  { id: 'cancelled', label: 'Đã hủy' },
  { id: 'all', label: 'Tất cả' },
];

const EMPTY_BOOKINGS: MyBookingListItemDto[] = [];

export const MyBookingPage = () => {
  const navigate = useNavigate();
  const { data, isLoading, isFetching, isError, refetch } = useMyBookings();
  const bookings = data ?? EMPTY_BOOKINGS;
  const [activeTab, setActiveTab] = useState<BookingTab>('upcoming');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [now, setNow] = useState(() => dayjs().tz(TIME_ZONE));

  useEffect(() => {
    const current = dayjs().tz(TIME_ZONE);
    const nextMidnight = current.add(1, 'day').startOf('day');
    const timer = window.setTimeout(
      () => setNow(dayjs().tz(TIME_ZONE)),
      Math.max(1, nextMidnight.diff(current) + 500),
    );
    return () => window.clearTimeout(timer);
  }, [now]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const nowTimestamp = now.valueOf();
  const counts = useMemo(
    () => ({
      upcoming: bookings.filter((booking) => isUpcoming(booking, nowTimestamp)).length,
      confirmed: bookings.filter(
        (booking) => normalizeBookingStatus(booking.status) === 'CONFIRMED',
      ).length,
      completed: bookings.filter(
        (booking) => normalizeBookingStatus(booking.status) === 'COMPLETED',
      ).length,
      cancelled: bookings.filter(
        (booking) => normalizeBookingStatus(booking.status) === 'CANCELLED',
      ).length,
    }),
    [bookings, nowTimestamp],
  );

  const visibleBookings = useMemo(() => {
    const upcoming = bookings.filter((booking) => isUpcoming(booking, nowTimestamp));
    let selected: MyBookingListItemDto[];

    if (activeTab === 'upcoming') {
      selected = upcoming.sort(
        (left, right) =>
          (getBookingTimestamp(left, left.startTime) ?? 0) -
          (getBookingTimestamp(right, right.startTime) ?? 0),
      );
    } else if (activeTab === 'completed') {
      selected = bookings
        .filter((booking) => normalizeBookingStatus(booking.status) === 'COMPLETED')
        .sort(
          (left, right) =>
            (getBookingTimestamp(right, right.startTime) ?? 0) -
            (getBookingTimestamp(left, left.startTime) ?? 0),
        );
    } else if (activeTab === 'cancelled') {
      selected = bookings
        .filter((booking) => normalizeBookingStatus(booking.status) === 'CANCELLED')
        .sort(
          (left, right) =>
            (getBookingTimestamp(right, right.startTime) ?? 0) -
            (getBookingTimestamp(left, left.startTime) ?? 0),
        );
    } else {
      selected = [...bookings].sort((left, right) => {
        const leftUpcoming = isUpcoming(left, nowTimestamp);
        const rightUpcoming = isUpcoming(right, nowTimestamp);
        if (leftUpcoming !== rightUpcoming) return leftUpcoming ? -1 : 1;
        const difference =
          (getBookingTimestamp(left, left.startTime) ?? 0) -
          (getBookingTimestamp(right, right.startTime) ?? 0);
        return leftUpcoming ? difference : -difference;
      });
    }

    const query = normalizeSearch(debouncedSearch);
    if (!query) return selected;
    return selected.filter((booking) =>
      [booking.bookingCode, booking.branchName, booking.courtName].some((value) =>
        normalizeSearch(value).includes(query),
      ),
    );
  }, [activeTab, bookings, debouncedSearch, nowTimestamp]);

  const nearestUpcomingBookingId = useMemo(
    () =>
      bookings
        .filter((booking) => isUpcoming(booking, nowTimestamp))
        .sort(
          (left, right) =>
            (getBookingTimestamp(left, left.startTime) ?? 0) -
            (getBookingTimestamp(right, right.startTime) ?? 0),
        )[0]?.bookingId,
    [bookings, nowTimestamp],
  );

  const summaryItems: MyBookingSummaryItem[] = [
    {
      label: 'Sắp tới',
      count: counts.upcoming,
      icon: MY_BOOKING_SUMMARY_ICONS.upcoming,
      tone: 'brand',
    },
    {
      label: 'Đã xác nhận',
      count: counts.confirmed,
      icon: MY_BOOKING_SUMMARY_ICONS.confirmed,
      tone: 'blue',
    },
    {
      label: 'Hoàn thành',
      count: counts.completed,
      icon: MY_BOOKING_SUMMARY_ICONS.completed,
      tone: 'green',
    },
    {
      label: 'Đã hủy',
      count: counts.cancelled,
      icon: MY_BOOKING_SUMMARY_ICONS.cancelled,
      tone: 'red',
    },
  ];

  const handleRefresh = () => {
    void refetch();
  };

  return (
    <div className="bg-surface-muted/50 text-content-primary flex min-h-screen flex-col">
      <DiscoveryHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <section className="border-brand-100 bg-surface relative mb-6 overflow-hidden rounded-xl border p-5 shadow-xs sm:p-6">
          <div aria-hidden="true" className="bg-brand-600 absolute inset-x-0 top-0 h-1" />
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <div className="bg-brand-50 text-brand-700 mt-0.5 grid size-11 shrink-0 place-items-center rounded-lg">
                <CalendarDays aria-hidden="true" className="size-5" />
              </div>
              <div className="min-w-0">
                <h1 className="text-content-primary text-2xl font-extrabold sm:text-3xl">
                  Lịch đặt sân của tôi
                </h1>
                <p className="text-content-secondary mt-1 text-sm">
                  Theo dõi lịch chơi, trạng thái và thông tin đặt sân của bạn.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2 min-[420px]:flex-row sm:shrink-0">
              <Button
                type="button"
                variant="outline"
                className="min-h-11 gap-2"
                onClick={handleRefresh}
                disabled={isFetching}
                aria-busy={isFetching}
              >
                <RefreshCw
                  aria-hidden="true"
                  className={`size-4 ${isFetching ? 'motion-safe:animate-spin' : ''}`}
                />
                Làm mới
              </Button>
              <Button
                type="button"
                className="min-h-11 gap-2 shadow-xs"
                onClick={() => navigate(paths.root)}
              >
                <Plus aria-hidden="true" className="size-4" />
                Đặt sân mới
              </Button>
            </div>
          </div>
        </section>

        {!isLoading && bookings.length > 0 && <MyBookingSummary items={summaryItems} />}

        <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div
            role="tablist"
            aria-label="Lọc lịch đặt theo trạng thái"
            className="border-line bg-surface flex gap-1 overflow-x-auto rounded-lg border p-1 shadow-xs"
          >
            {TAB_OPTIONS.map((tab) => {
              const count = tab.id === 'all' ? bookings.length : counts[tab.id];
              const selected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`my-booking-tab-${tab.id}`}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls="my-booking-panel"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold whitespace-nowrap transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] sm:flex-1 ${
                    selected
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'text-content-secondary hover:bg-surface-muted hover:text-content-primary'
                  }`}
                >
                  {tab.label}
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs tabular-nums ${
                      selected
                        ? 'bg-white/20 text-white'
                        : 'bg-surface-muted text-content-secondary'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex min-w-0 flex-col gap-2 min-[420px]:flex-row xl:w-[min(100%,28rem)]">
            <div className="relative min-w-0 flex-1">
              <label htmlFor="my-booking-search" className="sr-only">
                Tìm lịch đặt sân
              </label>
              <Search
                aria-hidden="true"
                className="text-content-secondary absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
              />
              <input
                type="search"
                id="my-booking-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm theo mã đặt sân, chi nhánh hoặc sân..."
                className="border-line bg-surface text-content-primary placeholder:text-content-placeholder focus-visible:outline-brand-600 h-11 w-full rounded-lg border pr-10 pl-10 text-sm shadow-xs focus-visible:outline-2"
              />
              {search && (
                <button
                  type="button"
                  aria-label="Xóa tìm kiếm"
                  onClick={() => setSearch('')}
                  className="text-content-secondary hover:text-content-primary focus-visible:outline-brand-600 absolute top-1/2 right-2 grid size-8 -translate-y-1/2 place-items-center rounded-md focus-visible:outline-2"
                >
                  <X aria-hidden="true" className="size-4" />
                </button>
              )}
            </div>
            {isFetching && !isLoading && (
              <p
                role="status"
                className="text-content-secondary flex min-h-11 items-center gap-2 text-xs min-[420px]:shrink-0"
              >
                <LoaderCircle aria-hidden="true" className="size-4 motion-safe:animate-spin" />
                Đang cập nhật
              </p>
            )}
          </div>
        </div>

        <section
          id="my-booking-panel"
          role="tabpanel"
          aria-labelledby={`my-booking-tab-${activeTab}`}
          tabIndex={0}
          className="space-y-4 outline-none"
        >
          {isLoading ? (
            <MyBookingSkeleton />
          ) : isError && !data ? (
            <MyBookingErrorState onRetry={handleRefresh} onHome={() => navigate(paths.root)} />
          ) : bookings.length === 0 ? (
            <MyBookingEmptyState
              title="Bạn chưa có lịch đặt sân nào."
              description="Hãy chọn chi nhánh và khung giờ phù hợp để bắt đầu đặt sân."
              actionLabel="Đặt sân ngay"
              onAction={() => navigate(paths.root)}
            />
          ) : visibleBookings.length === 0 ? (
            <MyBookingEmptyState
              search={Boolean(debouncedSearch)}
              title={
                debouncedSearch
                  ? 'Không tìm thấy lịch đặt sân phù hợp.'
                  : activeTab === 'upcoming'
                    ? 'Bạn chưa có lịch đặt sân sắp tới.'
                    : activeTab === 'completed'
                      ? 'Chưa có lịch đặt sân đã hoàn thành.'
                      : activeTab === 'cancelled'
                        ? 'Bạn chưa có lịch đặt sân đã hủy.'
                        : 'Không có lịch đặt sân phù hợp.'
              }
              description={
                debouncedSearch
                  ? 'Thử tìm bằng mã đặt sân, tên chi nhánh hoặc tên sân.'
                  : 'Bạn có thể xem các lịch đặt khác hoặc chọn một khung giờ mới.'
              }
              actionLabel={
                debouncedSearch
                  ? 'Xóa tìm kiếm'
                  : activeTab === 'all'
                    ? 'Đặt sân mới'
                    : 'Xem tất cả lịch đặt'
              }
              onAction={() => {
                if (debouncedSearch) {
                  setSearch('');
                  setDebouncedSearch('');
                } else if (activeTab === 'all') {
                  navigate(paths.root);
                } else {
                  setActiveTab('all');
                }
              }}
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {isError && (
                <p role="status" className="text-content-secondary text-sm">
                  Không thể cập nhật lịch mới nhất. Đang hiển thị dữ liệu đã tải trước đó.
                </p>
              )}
              {visibleBookings.map((booking) => (
                <MyBookingCard
                  key={booking.bookingId}
                  booking={booking}
                  onViewDetails={setSelectedBookingId}
                  isUpcoming={isUpcoming(booking, nowTimestamp)}
                  isNearestUpcoming={booking.bookingId === nearestUpcomingBookingId}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <BookingDetailDrawer
        bookingId={selectedBookingId}
        isOpen={Boolean(selectedBookingId)}
        onClose={() => setSelectedBookingId(null)}
        mode="CUSTOMER"
      />
    </div>
  );
};

export default MyBookingPage;
