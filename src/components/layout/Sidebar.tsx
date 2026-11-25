import { use, useRef } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
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
  Building2,
  KeyRound,
  Shield,
  ShoppingBag,
  PackageOpen,
  BarChart3,
  Tags,
  UsersRound,
} from 'lucide-react';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { hasCurrentUserRole } from '@/shared/utils/current-user';
import { USER_ROLES } from '@/shared/constants/roles';
import { PERMISSIONS as P } from '@/shared/constants/permissions';
import { useAuthorization } from '@/features/auth/authorization';
import { useStaffAccess } from '@/features/staff-management/hooks/useStaffManagement';
import { cn } from '@/lib/utils';

import { paths } from '@/app/router/paths';
import { useLocation, useNavigate } from 'react-router';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  {
    icon: Building2,
    label: 'Quản lý chi nhánh (Branches)',
    path: paths.adminBranches,
    anyPermissions: [P.BRANCH_CREATE, P.BRANCH_VIEW],
  },
  {
    icon: Building2,
    label: 'Quản lý chủ sân',
    translationKey: 'navigation.owners',
    path: paths.adminOwners,
    adminOnly: false,
  },
  {
    icon: KeyRound,
    label: 'Quản lý permissions',
    translationKey: 'navigation.permissions',
    path: paths.adminPermissions,
    adminOnly: true,
  },
  {
    icon: Shield,
    label: 'Quản lý roles',
    translationKey: 'navigation.roles',
    path: paths.adminRoles,
    adminOnly: true,
  },
  {
    icon: User,
    label: 'Quản lý nhân viên',
    translationKey: 'staffManagement.title',
    path: paths.staffManagement,
    requiresStaffAccess: true,
  },
  { icon: Users, label: 'Quản lý khách hàng', path: paths.customers, permission: P.CUSTOMER_VIEW },
  {
    icon: UsersRound,
    label: 'Player matching profile',
    translationKey: 'playerMatchingProfile.nav',
    path: paths.playerMatchingProfile,
  },
  {
    icon: ShoppingBag,
    label: 'POS / Bán hàng',
    path: paths.posSales,
    anyPermissions: [P.SALES_VIEW, P.PRODUCT_VIEW, P.INVENTORY_VIEW, P.SALES_REPORT_VIEW],
  },
  {
    icon: BarChart3,
    label: 'Quản trị POS & kho',
    path: paths.posDashboard,
    permission: P.SALES_REPORT_VIEW,
  },
  { icon: Tags, label: 'Danh mục sản phẩm', path: paths.posCategories, permission: P.PRODUCT_VIEW },
  {
    icon: PackageOpen,
    label: 'Kho và danh mục',
    path: paths.posInventory,
    permission: P.INVENTORY_VIEW,
  },
  {
    icon: User,
    label: 'Quản lý người dùng (User)',
    path: paths.adminUsers,
    adminOnly: true,
  },
  { icon: FileBarChart, label: 'Xuất báo cáo tháng' },
  { icon: Bell, label: 'Quản lý thông báo' },
];

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { t } = useTranslation();
  const { logout, isLoggingOut } = useLogout();
  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const authenticated = useAuthStore((s) => s.isAuthenticated());
  const canAccessAdminRoutes =
    hasHydrated && authenticated && hasCurrentUserRole(user, USER_ROLES.ADMIN);
  const { hasPermission, hasAnyPermission } = useAuthorization();
  const staffAccess = useStaffAccess(isOpen);
  const staffAccessFailed =
    staffAccess.isError && !('status' in staffAccess.error && staffAccess.error.status === 403);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const previousFocus = useRef<HTMLElement | null>(null);

  console.log(user);
  console.log(hasPermission);

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
              {menuItems
                .filter((item) => !('adminOnly' in item) || !item.adminOnly || canAccessAdminRoutes)
                .filter(
                  (item) =>
                    !('permission' in item) ||
                    !item.permission ||
                    (hasHydrated && authenticated && hasPermission(item.permission)),
                )
                .filter(
                  (item) =>
                    !('anyPermissions' in item) ||
                    !item.anyPermissions ||
                    (hasHydrated && authenticated && hasAnyPermission(item.anyPermissions)),
                )
                .filter(
                  (item) =>
                    !('requiresStaffAccess' in item) ||
                    !item.requiresStaffAccess ||
                    (staffAccess.isSuccess && !staffAccess.isFetching),
                )
                .map((item, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      if ('path' in item && item.path) {
                        navigate(item.path);
                        onClose();
                      }
                    }}
                    aria-current={
                      'requiresStaffAccess' in item &&
                      (pathname === item.path || pathname.startsWith(`${item.path}/`))
                        ? 'page'
                        : undefined
                    }
                    className={cn(
                      'group flex w-full cursor-pointer items-center gap-3 border-b border-white/5 px-4 py-3.5 text-left transition-colors hover:bg-white/10 focus-visible:bg-white/10',
                      'requiresStaffAccess' in item &&
                        (pathname === item.path || pathname.startsWith(`${item.path}/`)) &&
                        'bg-white/20 font-bold',
                    )}
                  >
                    <item.icon aria-hidden className="size-5 shrink-0 opacity-80" />
                    <span className="flex-1 text-[15px] font-medium">
                      {'translationKey' in item && item.translationKey
                        ? t(item.translationKey)
                        : item.label}
                    </span>
                    <ChevronRight aria-hidden className="size-4 shrink-0 opacity-60" />
                  </button>
                ))}
              {staffAccessFailed && (
                <div role="alert" className="px-4 py-3 text-sm">
                  <p>{t('staffManagement.accessError')}</p>
                  <button
                    type="button"
                    className="mt-1 font-semibold underline"
                    onClick={() => void staffAccess.refetch()}
                  >
                    {t('staffManagement.retry')}
                  </button>
                </div>
              )}
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
