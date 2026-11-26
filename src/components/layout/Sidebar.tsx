import { useRef } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { useTranslation } from 'react-i18next';
import { ChevronRight, LogOut, X } from 'lucide-react';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { cn } from '@/lib/utils';
import { useLocation, useNavigate } from 'react-router';
import { useManagementNavigation } from './management-navigation';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { t } = useTranslation();
  const { logout, isLoggingOut } = useLogout();
  const items = useManagementNavigation();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const previousFocus = useRef<HTMLElement | null>(null);

  return (
    <DialogPrimitive.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogPrimitive.Portal>
        {/* Backdrop */}
        <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-black/50 transition-opacity" />

        {/* Drawer */}
        <DialogPrimitive.Content
          className="bg-brand-600 text-content-onbrand fixed inset-y-0 left-0 z-50 w-full max-w-[350px] shadow-[var(--shadow-drawer)] outline-none"
          aria-label="Menu"
          aria-describedby={undefined}
          onOpenAutoFocus={() => {
            previousFocus.current =
              document.activeElement instanceof HTMLElement ? document.activeElement : null;
          }}
          onCloseAutoFocus={(event) => {
            if (previousFocus.current?.isConnected) {
              event.preventDefault();
              previousFocus.current.focus();
            }
          }}
        >
          <div className="flex h-14 items-center justify-between border-b border-white/10 px-4 pt-[env(safe-area-inset-top,0px)] sm:h-16">
            <button
              type="button"
              onClick={onClose}
              className="text-content-onbrand grid size-11 place-items-center rounded-full transition-colors hover:bg-white/10"
              aria-label="Close menu"
            >
              <X aria-hidden className="size-6" strokeWidth={2.5} />
            </button>
            <span className="text-lg font-bold">Menu</span>
            <div className="w-11" /> {/* Spacer for centering */}
          </div>

          <div className="h-[calc(100dvh-3.5rem-env(safe-area-inset-top,0px))] overflow-y-auto pb-[env(safe-area-inset-bottom,0px)]">
            <nav className="flex flex-col py-2">
              {items.map((item) => (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => {
                    navigate(item.path);
                    onClose();
                  }}
                  aria-current={
                    (pathname === item.path || pathname.startsWith(`${item.path}/`))
                      ? 'page'
                      : undefined
                  }
                  className={cn(
                    'group flex w-full cursor-pointer items-center gap-3 border-b border-white/5 px-4 py-3.5 text-left transition-colors hover:bg-white/10 focus-visible:bg-white/10',
                    (pathname === item.path || pathname.startsWith(`${item.path}/`)) &&
                      'bg-white/20 font-bold',
                  )}
                >
                  <item.icon aria-hidden className="size-5 shrink-0 opacity-80" />
                  <span className="flex-1 text-[15px] font-medium">
                    {item.translationKey ? t(item.translationKey) : item.label}
                  </span>
                  <ChevronRight aria-hidden className="size-4 shrink-0 opacity-60" />
                </button>
              ))}
              <button
                type="button"
                onClick={logout}
                disabled={isLoggingOut}
                className="group flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-white/10 focus-visible:bg-white/10 disabled:opacity-60"
              >
                <LogOut aria-hidden className="size-5 shrink-0 opacity-80" />
                <span className="flex-1 text-[15px] font-medium">{t('nav.logout')}</span>
                <ChevronRight aria-hidden className="size-4 shrink-0 opacity-60" />
              </button>
            </nav>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
