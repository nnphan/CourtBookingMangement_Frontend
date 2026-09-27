import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  X,
  Globe,
  Home,
  User,
  Info,
  Printer,
  Receipt,
  Users,
  FileBarChart,
  HelpCircle,
  Sparkles,
  Gift,
  Bell,
  RefreshCw,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { cn } from '@/lib/utils';

import { paths } from '@/app/router/paths';
import { useNavigate } from 'react-router';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { icon: Users, label: 'Quản lý khách hàng', path: paths.customers },
  { icon: Globe, label: 'Chuyển đổi ngôn ngữ' },
  { icon: Home, label: 'Đổi trang chủ: Trang chủ cũ', path: paths.dashboard },
  { icon: User, label: 'Thông tin tài khoản' },
  { icon: Info, label: 'Phiên bản: 2.10.3' },
  { icon: Printer, label: 'Cài đặt máy hiện' },
  { icon: Receipt, label: 'Cài đặt hóa đơn' },
  { icon: Users, label: 'Phân quyền nhân viên' },
  { icon: FileBarChart, label: 'Xuất báo cáo tháng' },
  { icon: HelpCircle, label: 'Hướng dẫn sử dụng' },
  { icon: Sparkles, label: 'Ứng dụng có gì mới?' },
  { icon: Gift, label: 'Giới thiệu bạn bè' },
  { icon: Bell, label: 'Quản lý thông báo' },
  { icon: RefreshCw, label: 'Chuyển tài khoản' },
];

  export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { t } = useTranslation();
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Trap focus basic implementation
  useEffect(() => {
    if (isOpen && sidebarRef.current) {
      sidebarRef.current.focus();
    }
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 transition-opacity"
          aria-hidden="true"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        ref={sidebarRef}
        tabIndex={-1}
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-full max-w-[350px] transform bg-brand-600 text-content-onbrand shadow-[var(--shadow-drawer)] transition-transform duration-300 ease-[var(--ease-standard)] outline-none',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
      >
        <div className="flex h-14 items-center justify-between border-b border-white/10 px-4 sm:h-16 pt-[env(safe-area-inset-top,0px)]">
          <button
            type="button"
            onClick={onClose}
            className="grid size-11 place-items-center rounded-full text-content-onbrand transition-colors hover:bg-white/10"
            aria-label="Close menu"
          >
            <X aria-hidden className="size-6" strokeWidth={2.5} />
          </button>
          <span className="text-lg font-bold">Menu</span>
          <div className="w-11" /> {/* Spacer for centering */}
        </div>

        <div className="h-[calc(100dvh-3.5rem-env(safe-area-inset-top,0px))] overflow-y-auto pb-[env(safe-area-inset-bottom,0px)]">
          <nav className="flex flex-col py-2">
            {menuItems.map((item, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  if ('path' in item && item.path) {
                    navigate(item.path);
                    onClose();
                  }
                }}
                className="group flex w-full items-center gap-3 border-b border-white/5 px-4 py-3.5 text-left transition-colors hover:bg-white/10 focus-visible:bg-white/10 cursor-pointer"
              >
                <item.icon aria-hidden className="size-5 shrink-0 opacity-80" />
                <span className="flex-1 text-[15px] font-medium">{item.label}</span>
                <ChevronRight aria-hidden className="size-4 shrink-0 opacity-60" />
              </button>
            ))}
            <button
              type="button"
              onClick={logout}
              className="group flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-white/10 focus-visible:bg-white/10"
            >
              <LogOut aria-hidden className="size-5 shrink-0 opacity-80" />
              <span className="flex-1 text-[15px] font-medium">{t('nav.logout')}</span>
              <ChevronRight aria-hidden className="size-4 shrink-0 opacity-60" />
            </button>
          </nav>
        </div>
      </div>
    </>
  );
};
