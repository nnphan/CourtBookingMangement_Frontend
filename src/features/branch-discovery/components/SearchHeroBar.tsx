import { useState, useMemo, useEffect, useCallback } from 'react';
import dayjs from '@/lib/dayjs';
import {
  MapPin,
  Calendar,
  Clock,
  SlidersHorizontal,
  Search,
  Sparkles,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
} from 'lucide-react';
import { useBranchSearchStore } from '../store/branch-search.store';
import {
  POPULAR_LOCATIONS,
  TIME_SLOT_OPTIONS,
  AMENITIES_LIST,
  COURT_SURFACE_LABELS,
} from '../constants/amenities';
import type { TimeSlotCategory, CourtSurface } from '../types/branch';

const WEEKDAY_HEADERS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'] as const;

export const SearchHeroBar = () => {
  const {
    selectedDistrict,
    setSelectedDistrict,
    selectedDate,
    setSelectedDate,
    selectedTimeSlot,
    setSelectedTimeSlot,
    selectedAmenities,
    toggleAmenity,
    selectedCourtSurface,
    setSelectedCourtSurface,
    onlyOpenNow,
    setOnlyOpenNow,
    resetFilters,
  } = useBranchSearchStore();

  const [activeTab, setActiveTab] = useState<'location' | 'date' | 'time' | 'filters' | null>(null);

  // Calendar state for Date Selector
  const [viewDate, setViewDate] = useState(() =>
    selectedDate && dayjs(selectedDate).isValid() ? dayjs(selectedDate) : dayjs(),
  );
  const [tempDate, setTempDate] = useState(selectedDate);

  // Sync calendar view and tempDate whenever date dropdown opens or selectedDate changes
  useEffect(() => {
    if (activeTab === 'date') {
      const d = selectedDate && dayjs(selectedDate).isValid() ? dayjs(selectedDate) : dayjs();
      setViewDate(d);
      setTempDate(selectedDate);
    }
  }, [activeTab, selectedDate]);

  const handlePrevMonth = useCallback(() => {
    setViewDate((prev) => prev.subtract(1, 'month'));
  }, []);

  const handleNextMonth = useCallback(() => {
    setViewDate((prev) => prev.add(1, 'month'));
  }, []);

  const monthHeaderLabel = useMemo(() => {
    return viewDate.isValid() ? `tháng ${viewDate.month() + 1} năm ${viewDate.year()}` : '';
  }, [viewDate]);

  const calendarDays = useMemo(() => {
    const daysInMonth = viewDate.daysInMonth();
    const firstDayOfMonth = viewDate.startOf('month');
    // Monday is 0, Tuesday is 1, ..., Sunday is 6
    const leadingEmptyCount = (firstDayOfMonth.day() + 6) % 7;

    const days: { dayNumber: number; dateString: string }[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const d = viewDate.date(day);
      days.push({
        dayNumber: day,
        dateString: d.format('YYYY-MM-DD'),
      });
    }

    return { leadingEmptyCount, days };
  }, [viewDate]);

  // Quick Date Helpers
  const setQuickDate = (daysFromToday: number) => {
    const target = dayjs().add(daysFromToday, 'day');
    const formatted = target.format('YYYY-MM-DD');
    setTempDate(formatted);
    setViewDate(target);
    setSelectedDate(formatted);
  };

  const getDayLabel = (dateStr: string) => {
    const parsed = dayjs(dateStr);
    if (!parsed.isValid()) return dateStr;
    if (parsed.isSame(dayjs(), 'day')) {
      return `Hôm nay (${parsed.format('DD/MM/YYYY')})`;
    }
    return parsed.format('DD/MM/YYYY');
  };

  return (
    <section className="relative overflow-visible rounded-2xl bg-gradient-to-b from-brand-900 via-brand-800 to-brand-900 p-6 text-white shadow-xl sm:p-8 lg:p-10">
      {/* Background ambient badminton glow */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-brand-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-accent-gold/15 blur-3xl" />

      {/* Hero Headline & Value Proposition */}
      <div className="relative z-10 max-w-3xl space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-semibold backdrop-blur-md">
          <Sparkles className="size-3.5 text-accent-gold" />
          <span>Hơn 50+ câu lạc bộ & 200+ sân cầu lông tiêu chuẩn BWF</span>
        </div>
        <h1 className="text-2xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
          Tìm kiếm & Đặt sân cầu lông gần bạn
        </h1>
        <p className="text-sm font-medium text-brand-100 sm:text-base">
          Trải nghiệm đặt sân tức thì theo phong cách Playtomic & Booking.com. Chọn giờ linh hoạt,
          sân máy lạnh, thảm tiêu chuẩn thi đấu quốc tế.
        </p>
      </div>

      {/* Main Search Floating Card (Playtomic / Airbnb style) */}
      <div className="relative z-20 mt-8 rounded-2xl border border-white/20 bg-surface p-2 shadow-2xl backdrop-blur-xl sm:p-3">
        <div className="grid grid-cols-1 divide-y divide-line rounded-xl lg:grid-cols-4 lg:divide-x lg:divide-y-0">
          {/* Section 1: Location & District */}
          <div className="relative p-2 sm:p-3">
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'location' ? null : 'location')}
              className="flex w-full items-center justify-between gap-3 text-left focus-visible:outline-2 focus-visible:outline-brand-600 rounded-lg p-2 transition-colors hover:bg-surface-muted"
              aria-expanded={activeTab === 'location'}
              aria-label="Chọn khu vực hoặc quận"
            >
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-600">
                  <MapPin className="size-5" />
                </div>
                <div>
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-content-secondary">
                    Khu vực
                  </span>
                  <span className="block text-sm font-bold text-content-primary">
                    {selectedDistrict === 'all' ? 'Tất cả khu vực' : selectedDistrict}
                  </span>
                </div>
              </div>
              <ChevronDown
                className={`size-4 text-content-secondary transition-transform ${activeTab === 'location' ? 'rotate-180' : ''
                  }`}
              />
            </button>

            {/* Location Dropdown */}
            {activeTab === 'location' && (
              <div className="absolute left-0 top-full z-40 mt-2 w-72 rounded-xl border border-line bg-surface p-2 shadow-xl ring-1 ring-black/5 animate-in fade-in zoom-in-95">
                <p className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-content-secondary">
                  Khu vực phổ biến
                </p>
                <div className="mt-1 space-y-1">
                  {POPULAR_LOCATIONS.map((loc) => (
                    <button
                      key={loc.value}
                      type="button"
                      onClick={() => {
                        setSelectedDistrict(loc.value);
                        setActiveTab(null);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${selectedDistrict === loc.value
                          ? 'bg-brand-50 text-brand-700'
                          : 'text-content-primary hover:bg-surface-muted'
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="size-3.5 text-brand-600" />
                        <span>{loc.label}</span>
                      </div>
                      <span className="rounded bg-surface-muted px-1.5 py-0.5 text-[10px] text-content-secondary">
                        {loc.count} CLB
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Date Selector */}
          <div className="relative p-2 sm:p-3">
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'date' ? null : 'date')}
              className="flex w-full items-center justify-between gap-3 text-left focus-visible:outline-2 focus-visible:outline-brand-600 rounded-lg p-2 transition-colors hover:bg-surface-muted"
              aria-expanded={activeTab === 'date'}
              aria-label="Chọn ngày đánh cầu"
            >
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-600">
                  <Calendar className="size-5" />
                </div>
                <div>
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-content-secondary">
                    Ngày chơi
                  </span>
                  <span className="block text-sm font-bold text-content-primary">
                    {getDayLabel(selectedDate)}
                  </span>
                </div>
              </div>
              <ChevronDown
                className={`size-4 text-content-secondary transition-transform ${activeTab === 'date' ? 'rotate-180' : ''
                  }`}
              />
            </button>

            {/* Date Dropdown with Vietnamese Calendar (matches screenshot) */}
            {activeTab === 'date' && (
              <div
                role="dialog"
                aria-label="Chọn ngày chơi cầu lông"
                className="absolute left-0 top-full z-50 mt-2 w-[320px] sm:w-[340px] rounded-2xl border border-slate-100 bg-white p-4 sm:p-5 shadow-2xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-150 select-none"
              >
                {/* Quick Select Pills */}
                <div className="grid grid-cols-3 gap-1.5 mb-3 pb-3 border-b border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setQuickDate(0);
                      setActiveTab(null);
                    }}
                    className={`rounded-lg border py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                      tempDate === dayjs().format('YYYY-MM-DD')
                        ? 'border-[#0d6838] bg-emerald-50 text-[#0d6838]'
                        : 'border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-[#0d6838]'
                    }`}
                  >
                    Hôm nay
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setQuickDate(1);
                      setActiveTab(null);
                    }}
                    className={`rounded-lg border py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                      tempDate === dayjs().add(1, 'day').format('YYYY-MM-DD')
                        ? 'border-[#0d6838] bg-emerald-50 text-[#0d6838]'
                        : 'border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-[#0d6838]'
                    }`}
                  >
                    Ngày mai
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setQuickDate(2);
                      setActiveTab(null);
                    }}
                    className={`rounded-lg border py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                      tempDate === dayjs().add(2, 'day').format('YYYY-MM-DD')
                        ? 'border-[#0d6838] bg-emerald-50 text-[#0d6838]'
                        : 'border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-[#0d6838]'
                    }`}
                  >
                    Ngày kia
                  </button>
                </div>

                {/* 1. Month / Year Header Navigation: < tháng 9 năm 2026 > */}
                <div className="flex items-center justify-between pb-3">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    aria-label="Tháng trước"
                    className="grid size-8 place-items-center rounded-full text-[#0d6838] transition-colors hover:bg-emerald-50 active:scale-95 cursor-pointer"
                  >
                    <ChevronLeft className="size-4 stroke-[2.5]" />
                  </button>

                  <span className="text-sm font-bold text-slate-800 tracking-tight lowercase">
                    {monthHeaderLabel}
                  </span>

                  <button
                    type="button"
                    onClick={handleNextMonth}
                    aria-label="Tháng tiếp theo"
                    className="grid size-8 place-items-center rounded-full text-[#0d6838] transition-colors hover:bg-emerald-50 active:scale-95 cursor-pointer"
                  >
                    <ChevronRight className="size-4 stroke-[2.5]" />
                  </button>
                </div>

                {/* 2. Weekday Headers: T2, T3, T4, T5, T6, T7, CN */}
                <div className="grid grid-cols-7 gap-1 pb-2 pt-1 text-center text-xs font-medium text-slate-400">
                  {WEEKDAY_HEADERS.map((dayLabel) => (
                    <div key={dayLabel} className="h-6 flex items-center justify-center">
                      {dayLabel}
                    </div>
                  ))}
                </div>

                {/* 3. Calendar Days Grid */}
                <div className="grid grid-cols-7 gap-1 text-center text-xs">
                  {Array.from({ length: calendarDays.leadingEmptyCount }).map((_, i) => (
                    <div key={`empty-${i}`} className="size-9" />
                  ))}

                  {calendarDays.days.map(({ dayNumber, dateString }) => {
                    const isSelected = dateString === tempDate;
                    const isToday = dateString === dayjs().format('YYYY-MM-DD');

                    return (
                      <button
                        key={dateString}
                        type="button"
                        onClick={() => setTempDate(dateString)}
                        className={`grid size-9 place-items-center rounded-lg text-xs font-medium transition-all select-none cursor-pointer ${
                          isSelected
                            ? 'bg-[#0d6838] text-white font-bold shadow-xs ring-1 ring-[#0d6838]'
                            : isToday
                              ? 'text-[#0d6838] font-bold hover:bg-emerald-50'
                              : 'text-slate-700 hover:bg-emerald-50'
                        }`}
                      >
                        {dayNumber}
                      </button>
                    );
                  })}
                </div>

                {/* 4. Footer Actions: Hủy & Xác nhận */}
                <div className="flex items-center justify-end gap-2 pt-4 mt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setTempDate(selectedDate);
                      setActiveTab(null);
                    }}
                    className="rounded-lg px-3.5 py-1.5 text-xs font-bold text-[#0d6838] transition-colors hover:bg-emerald-50 active:scale-95 cursor-pointer"
                  >
                    Hủy
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDate(tempDate);
                      setActiveTab(null);
                    }}
                    className="rounded-lg bg-[#0d6838] px-4 py-1.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-[#0a522c] active:scale-95 cursor-pointer"
                  >
                    Xác nhận
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Time Slot */}
          <div className="relative p-2 sm:p-3">
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'time' ? null : 'time')}
              className="flex w-full items-center justify-between gap-3 text-left focus-visible:outline-2 focus-visible:outline-brand-600 rounded-lg p-2 transition-colors hover:bg-surface-muted"
              aria-expanded={activeTab === 'time'}
              aria-label="Chọn khung giờ chơi"
            >
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-600">
                  <Clock className="size-5" />
                </div>
                <div>
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-content-secondary">
                    Khung giờ
                  </span>
                  <span className="block text-sm font-bold text-content-primary">
                    {TIME_SLOT_OPTIONS.find((t) => t.id === selectedTimeSlot)?.label ?? 'Cả ngày'}
                  </span>
                </div>
              </div>
              <ChevronDown
                className={`size-4 text-content-secondary transition-transform ${activeTab === 'time' ? 'rotate-180' : ''
                  }`}
              />
            </button>

            {/* Time Slot Dropdown */}
            {activeTab === 'time' && (
              <div className="absolute left-0 top-full z-40 mt-2 w-72 rounded-xl border border-line bg-surface p-2 shadow-xl ring-1 ring-black/5 animate-in fade-in zoom-in-95">
                <p className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-content-secondary">
                  Chọn khung giờ
                </p>
                <div className="mt-1 space-y-1">
                  {TIME_SLOT_OPTIONS.map((slot) => (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => {
                        setSelectedTimeSlot(slot.id as TimeSlotCategory);
                        setActiveTab(null);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${selectedTimeSlot === slot.id
                          ? 'bg-brand-50 text-brand-700'
                          : 'text-content-primary hover:bg-surface-muted'
                        }`}
                    >
                      <span>{slot.label}</span>
                      <span className="text-[11px] text-content-secondary font-normal">
                        {slot.hours}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Filters & Search Button */}
          <div className="relative flex items-center justify-between gap-2.5 p-2 sm:p-3">
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'filters' ? null : 'filters')}
              className={`flex flex-1 items-center justify-center gap-2 h-12 min-w-[120px] px-4 sm:px-5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all select-none active:scale-95 focus-visible:outline-3 focus-visible:outline-[var(--color-focus)] border ${
                selectedAmenities.length > 0 || selectedCourtSurface !== 'all' || onlyOpenNow
                  ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-xs'
                  : 'border-line text-content-primary bg-surface hover:bg-surface-muted hover:border-line-strong'
              }`}
              aria-expanded={activeTab === 'filters'}
              aria-label="Mở bộ lọc nâng cao"
            >
              <SlidersHorizontal className="size-4 shrink-0" />
              <span>Bộ lọc</span>
              {(selectedAmenities.length > 0 || selectedCourtSurface !== 'all') && (
                <span className="grid size-4.5 shrink-0 place-items-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
                  {selectedAmenities.length + (selectedCourtSurface !== 'all' ? 1 : 0)}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab(null)}
              className="flex flex-1 items-center justify-center gap-2 h-12 min-w-[120px] px-4 sm:px-5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all select-none active:scale-95 focus-visible:outline-3 focus-visible:outline-[var(--color-focus)] bg-brand-600 text-white shadow-md hover:bg-brand-700"
              aria-label="Khám phá câu lạc bộ cầu lông"
            >
              <Search className="size-4 shrink-0" />
              <span>Khám phá</span>
            </button>

            {/* Expanded Advanced Filters Modal */}
            {activeTab === 'filters' && (
              <div className="absolute right-0 top-full z-40 mt-2 w-80 sm:w-96 rounded-2xl border border-line bg-surface p-5 shadow-2xl ring-1 ring-black/5 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-line pb-3">
                  <h3 className="text-sm font-bold text-content-primary">Bộ lọc nâng cao</h3>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="text-xs font-semibold text-brand-600 hover:underline"
                  >
                    Thiết lập lại
                  </button>
                </div>

                <div className="mt-4 space-y-4">
                  {/* Open now switch */}
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-xs font-semibold text-content-primary">
                      Chỉ câu lạc bộ đang mở cửa
                    </span>
                    <input
                      type="checkbox"
                      checked={onlyOpenNow}
                      onChange={(e) => setOnlyOpenNow(e.target.checked)}
                      className="size-4 rounded border-line text-brand-600 focus:ring-brand-500"
                    />
                  </label>

                  {/* Surface type */}
                  <div>
                    <label className="block text-xs font-bold text-content-secondary mb-2">
                      Loại mặt sân
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {Object.entries(COURT_SURFACE_LABELS).map(([key, label]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setSelectedCourtSurface(key as CourtSurface | 'all')}
                          className={`rounded-lg border px-2.5 py-1.5 text-left text-xs font-medium transition-colors ${selectedCourtSurface === key
                              ? 'border-brand-600 bg-brand-50 text-brand-700'
                              : 'border-line text-content-primary hover:bg-surface-muted'
                            }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Amenities checklist */}
                  <div>
                    <label className="block text-xs font-bold text-content-secondary mb-2">
                      Tiện ích mong muốn
                    </label>
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                      {AMENITIES_LIST.map((amenity) => {
                        const isChecked = selectedAmenities.includes(amenity.id);
                        return (
                          <button
                            key={amenity.id}
                            type="button"
                            onClick={() => toggleAmenity(amenity.id)}
                            className={`flex items-center gap-2 rounded-lg border p-2 text-left text-xs transition-colors ${isChecked
                                ? 'border-brand-600 bg-brand-50 text-brand-700 font-semibold'
                                : 'border-line text-content-primary hover:bg-surface-muted'
                              }`}
                          >
                            <div
                              className={`grid size-4 place-items-center rounded border ${isChecked
                                  ? 'border-brand-600 bg-brand-600 text-white'
                                  : 'border-line bg-surface'
                                }`}
                            >
                              {isChecked && <Check className="size-3" />}
                            </div>
                            <span className="truncate">{amenity.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-line flex justify-end">
                  <button
                    type="button"
                    onClick={() => setActiveTab(null)}
                    className="rounded-lg bg-brand-600 px-4 py-2 text-xs font-bold text-white hover:bg-brand-700"
                  >
                    Áp dụng bộ lọc
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
