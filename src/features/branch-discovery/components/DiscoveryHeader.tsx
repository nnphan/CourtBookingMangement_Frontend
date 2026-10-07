import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Search, X, User as UserIcon, LogOut, LayoutDashboard, CalendarCheck, Bell } from 'lucide-react';
import { paths } from '@/app/router/paths';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useBranchSearchStore } from '../store/branch-search.store';
import { LanguageSwitcher } from '@/shared/components/LanguageSwitcher';
import { getRoleLabel } from '@/shared/constants/roles';

export const DiscoveryHeader = () => {
  const navigate = useNavigate();
  const { user, status, logout } = useAuthStore();
  const isAuthenticated = status === 'authenticated' && !!user;
  const { searchQuery, setSearchQuery } = useBranchSearchStore();

  const [localInput, setLocalInput] = useState(searchQuery);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Sync from store if modified externally
  useEffect(() => {
    setLocalInput(searchQuery);
  }, [searchQuery]);

  // Click outside to close user menu
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(localInput.trim());
  };

  const handleClear = () => {
    setLocalInput('');
    setSearchQuery('');
  };

  console.log(user);

  return (
    <header className="sticky top-[env(safe-area-inset-top,0px)] z-30 w-full border-b border-line bg-surface/95 backdrop-blur-md shadow-xs transition-shadow">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        {/* Left: Brand Logo */}
        <Link
          to={paths.root}
          className="group flex items-center gap-2.5 rounded-lg py-1 transition-opacity hover:opacity-90 focus-visible:outline-3 focus-visible:outline-[var(--color-focus)]"
          aria-label="ALOBO Badminton - Trang chủ"
        >
          <div className="flex size-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm transition-transform group-hover:scale-105">
            <svg
              className="size-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="5" r="3" />
              <path d="m10 8 4 13" />
              <path d="m14 8-4 13" />
              <path d="M4 14h16" />
            </svg>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold tracking-tight text-content-primary">
                ALOBO
              </span>
              <span className="rounded bg-brand-50 px-1.5 py-0.5 text-[10px] font-bold text-brand-600 uppercase">
                Badminton
              </span>
            </div>
            <span className="hidden text-[11px] font-medium text-content-secondary sm:block">
              Đặt sân & Tìm câu lạc bộ
            </span>
          </div>
        </Link>

        {/* Center: Search Badminton branch, club name, address... */}
        <form
          onSubmit={handleSearchSubmit}
          className="relative hidden flex-1 max-w-xl md:block"
          role="search"
          aria-label="Tìm kiếm câu lạc bộ và sân cầu lông"
        >
          <div className="group relative flex h-12 items-center rounded-full border border-line bg-surface-muted/60 px-4 shadow-xs transition-all focus-within:border-brand-600 focus-within:bg-surface focus-within:ring-3 focus-within:ring-brand-50 hover:border-line-strong hover:bg-surface">
            <Search
              aria-hidden="true"
              className="mr-3 size-5 text-content-placeholder transition-colors group-focus-within:text-brand-600"
            />
            <input
              type="text"
              id="branch-discovery-search-input"
              value={localInput}
              onChange={(e) => {
                setLocalInput(e.target.value);
                setSearchQuery(e.target.value);
              }}
              placeholder="🔍 Search badminton branch, club name, address..."
              aria-label="Search badminton branch, club name, address..."
              className="h-full w-full bg-transparent text-sm font-medium text-content-primary placeholder:text-content-placeholder focus:outline-hidden"
            />
            {localInput && (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Xoá tìm kiếm"
                className="ml-2 rounded-full p-1 text-content-secondary hover:bg-line hover:text-content-primary focus-visible:outline-2 focus-visible:outline-brand-600"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            )}
            <button
              type="submit"
              className="ml-2 flex items-center justify-center rounded-full bg-brand-600 px-3.5 py-1.5 text-xs font-bold text-white transition-colors hover:bg-brand-700 active:scale-95 focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]"
            >
              Tìm
            </button>
          </div>
        </form>

        {/* Right: Language Switcher, Notifications, Register | Login or Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Switcher (EN | VI) */}
          <LanguageSwitcher />

          {/* Notifications Icon */}
          {isAuthenticated && (
            <button
              type="button"
              aria-label="Thông báo"
              className="relative grid size-9 place-items-center rounded-full border border-line bg-surface text-content-secondary hover:text-content-primary hover:bg-surface-muted transition-colors focus-visible:outline-2 focus-visible:outline-brand-600 cursor-pointer"
            >
              <Bell className="size-4" />
              <span className="absolute top-2 right-2 size-2 rounded-full bg-brand-600 ring-2 ring-surface" />
            </button>
          )}

          {isAuthenticated ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen((prev) => !prev)}
                className="flex items-center gap-2.5 rounded-full border border-line bg-surface p-1.5 pr-3 text-sm font-semibold text-content-primary shadow-xs transition-colors hover:border-line-strong hover:bg-surface-muted focus-visible:outline-3 focus-visible:outline-[var(--color-focus)]"
                aria-expanded={isUserMenuOpen}
                aria-haspopup="menu"
                aria-label="Tài khoản cá nhân"
              >
                <div className="grid size-8 place-items-center rounded-full bg-brand-100 text-brand-700">
                  <UserIcon className="size-4" />
                </div>
                <span className="max-w-[120px] truncate text-xs sm:text-sm">
                  {user?.fullName ?? 'Thành viên'}
                </span>
              </button>

              {isUserMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-56 rounded-xl border border-line bg-surface p-2 shadow-lg ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-100"
                >
                  <div className="border-b border-line px-3 py-2">
                    <p className="text-xs text-content-secondary">Đang đăng nhập với</p>
                    <p className="truncate text-sm font-bold text-content-primary">
                      {user?.fullName}
                    </p>
                    <span className="mt-0.5 inline-block rounded bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700 uppercase">
                      {getRoleLabel(user?.roles)}
                    </span>
                  </div>

                  <Link
                    to={paths.dashboard}
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-content-primary hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-brand-600"
                    role="menuitem"
                  >
                    <LayoutDashboard className="size-4 text-brand-600" />
                    Trang quản lý (Dashboard)
                  </Link>

                  <Link
                    to={paths.bookings}
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-content-primary hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-brand-600"
                    role="menuitem"
                  >
                    <CalendarCheck className="size-4 text-brand-600" />
                    Lịch đặt sân của tôi
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logout();
                      navigate(paths.root);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-danger hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-danger"
                    role="menuitem"
                  >
                    <LogOut className="size-4" />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1 sm:gap-2">
              <Link
                to={paths.register}
                className="rounded-lg px-3 py-2 text-sm font-bold text-content-primary transition-colors hover:text-brand-600 focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]"
              >
                Register
              </Link>
              <span className="text-line-strong select-none" aria-hidden="true">
                |
              </span>
              <Link
                to={paths.login}
                className="flex items-center gap-1.5 rounded-full bg-brand-600 px-4 py-2 text-sm font-bold text-white shadow-xs transition-transform hover:bg-brand-700 active:scale-95 focus-visible:outline-3 focus-visible:outline-[var(--color-focus)]"
              >
                <UserIcon className="size-4" aria-hidden="true" />
                Login
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Search Input */}
      <div className="border-t border-line/60 px-4 py-2.5 md:hidden">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <Search
            aria-hidden="true"
            className="absolute left-3.5 size-4 text-content-placeholder"
          />
          <input
            type="text"
            value={localInput}
            onChange={(e) => {
              setLocalInput(e.target.value);
              setSearchQuery(e.target.value);
            }}
            placeholder="🔍 Search badminton branch, club..."
            className="h-10 w-full rounded-full border border-line bg-surface-muted/60 pl-9 pr-8 text-xs font-medium text-content-primary placeholder:text-content-placeholder focus:border-brand-600 focus:bg-surface focus:outline-hidden"
          />
          {localInput && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Xoá tìm kiếm"
              className="absolute right-2.5 rounded-full p-1 text-content-secondary"
            >
              <X className="size-3.5" />
            </button>
          )}
        </form>
      </div>
    </header>
  );
};
