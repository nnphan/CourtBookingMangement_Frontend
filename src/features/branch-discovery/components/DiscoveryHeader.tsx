import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Search, X, User as UserIcon, Bell } from 'lucide-react';
import { paths } from '@/app/router/paths';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useBranchSearchStore } from '../store/branch-search.store';
import { LanguageSwitcher } from '@/shared/components/LanguageSwitcher';
import { CurrentUserMenu } from '@/shared/components/current-user';

export const DiscoveryHeader = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const { searchQuery, setSearchQuery } = useBranchSearchStore();

  const [localInput, setLocalInput] = useState(searchQuery);

  // Sync from store if modified externally
  useEffect(() => {
    setLocalInput(searchQuery);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(localInput.trim());
  };

  const handleClear = () => {
    setLocalInput('');
    setSearchQuery('');
  };

  return (
    <header className="border-line bg-surface/95 sticky top-[env(safe-area-inset-top,0px)] z-30 w-full border-b shadow-xs backdrop-blur-md transition-shadow">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        {/* Left: Brand Logo */}
        <Link
          to={paths.root}
          className="group flex items-center gap-2.5 rounded-lg py-1 transition-opacity hover:opacity-90 focus-visible:outline-3 focus-visible:outline-[var(--color-focus)]"
          aria-label="ALOBO Badminton - Trang chủ"
        >
          <div className="bg-brand-600 flex size-10 items-center justify-center rounded-xl text-white shadow-sm transition-transform group-hover:scale-105">
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
              <span className="text-content-primary text-xl font-extrabold tracking-tight">
                ALOBO
              </span>
              <span className="bg-brand-50 text-brand-600 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase">
                Badminton
              </span>
            </div>
            <span className="text-content-secondary hidden text-[11px] font-medium sm:block">
              Đặt sân & Tìm câu lạc bộ
            </span>
          </div>
        </Link>

        {/* Center: Search Badminton branch, club name, address... */}
        <form
          onSubmit={handleSearchSubmit}
          className="relative hidden max-w-xl flex-1 md:block"
          role="search"
          aria-label="Tìm kiếm câu lạc bộ và sân cầu lông"
        >
          <div className="group border-line bg-surface-muted/60 focus-within:border-brand-600 focus-within:bg-surface focus-within:ring-brand-50 hover:border-line-strong hover:bg-surface relative flex h-12 items-center rounded-full border px-4 shadow-xs transition-all focus-within:ring-3">
            <Search
              aria-hidden="true"
              className="text-content-placeholder group-focus-within:text-brand-600 mr-3 size-5 transition-colors"
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
              className="text-content-primary placeholder:text-content-placeholder h-full w-full bg-transparent text-sm font-medium focus:outline-hidden"
            />
            {localInput && (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Xoá tìm kiếm"
                className="text-content-secondary hover:bg-line hover:text-content-primary focus-visible:outline-brand-600 ml-2 rounded-full p-1 focus-visible:outline-2"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            )}
            <button
              type="submit"
              className="bg-brand-600 hover:bg-brand-700 ml-2 flex items-center justify-center rounded-full px-3.5 py-1.5 text-xs font-bold text-white transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] active:scale-95"
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
              className="border-line bg-surface text-content-secondary hover:text-content-primary hover:bg-surface-muted focus-visible:outline-brand-600 relative grid size-9 cursor-pointer place-items-center rounded-full border transition-colors focus-visible:outline-2"
            >
              <Bell className="size-4" />
              <span className="bg-brand-600 ring-surface absolute top-2 right-2 size-2 rounded-full ring-2" />
            </button>
          )}

          {isAuthenticated ? (
            <CurrentUserMenu variant="surface" />
          ) : (
            <div className="flex items-center gap-1 sm:gap-2">
              <Link
                to={paths.register}
                className="text-content-primary hover:text-brand-600 rounded-lg px-3 py-2 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]"
              >
                Register
              </Link>
              <span className="text-line-strong select-none" aria-hidden="true">
                |
              </span>
              <Link
                to={paths.login}
                className="bg-brand-600 hover:bg-brand-700 flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold text-white shadow-xs transition-transform focus-visible:outline-3 focus-visible:outline-[var(--color-focus)] active:scale-95"
              >
                <UserIcon className="size-4" aria-hidden="true" />
                Login
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Search Input */}
      <div className="border-line/60 border-t px-4 py-2.5 md:hidden">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <Search
            aria-hidden="true"
            className="text-content-placeholder absolute left-3.5 size-4"
          />
          <input
            type="text"
            value={localInput}
            onChange={(e) => {
              setLocalInput(e.target.value);
              setSearchQuery(e.target.value);
            }}
            placeholder="🔍 Search badminton branch, club..."
            className="border-line bg-surface-muted/60 text-content-primary placeholder:text-content-placeholder focus:border-brand-600 focus:bg-surface h-10 w-full rounded-full border pr-8 pl-9 text-xs font-medium focus:outline-hidden"
          />
          {localInput && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Xoá tìm kiếm"
              className="text-content-secondary absolute right-2.5 rounded-full p-1"
            >
              <X className="size-3.5" />
            </button>
          )}
        </form>
      </div>
    </header>
  );
};
