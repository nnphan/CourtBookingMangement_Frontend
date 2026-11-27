import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router';
import { paths } from '@/app/router/paths';
import { AdminOnlyRoute, GuestRoute, PermissionGuard, ProtectedRoute } from '@/app/router/guards';
import { PERMISSIONS as P } from '@/shared/constants/permissions';
import { AppLayout } from '@/components/layout/AppLayout';
import { RouteFallback } from '@/components/common/RouteFallback';
import { RouteErrorBoundary } from '@/components/common/RouteErrorBoundary';

const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/features/auth/pages/ForgotPasswordPage'));
const StaffActivationPage = lazy(
  () => import('@/features/staff-activation/pages/StaffActivationPage'),
);
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage'));
const StaffManagementPage = lazy(() => import('@/features/staff-management/pages/StaffManagementPage'));
const StaffDetailPage = lazy(() => import('@/features/staff-management/pages/StaffDetailPage'));
const BusinessStatisticsPage = lazy(() => import('@/features/pos-sales/pages/BusinessStatisticsPage'));
const CommercePage = lazy(() => import('@/features/pos-sales/pages/CommercePage'));
const CommerceManagementPage = lazy(
  () => import('@/features/pos-sales/pages/CommerceManagementPage'),
);
const CourtsPage = lazy(() => import('@/features/courts/pages/CourtsPage'));
const BookingsPage = lazy(() => import('@/features/booking/pages/BookingsPage'));
const CourtStatusPage = lazy(() => import('@/features/court-status-board/pages/CourtStatusPage'));
const CustomerLayout = lazy(() => import('@/features/customer-management/layouts/CustomerLayout'));
const CustomerListPage = lazy(
  () => import('@/features/customer-management/pages/CustomerListPage'),
);
const CustomerDetailPage = lazy(
  () => import('@/features/customer-management/pages/CustomerDetailPage'),
);
const CustomerCreatePage = lazy(
  () => import('@/features/customer-management/pages/CustomerCreatePage'),
);
const CustomerEditPage = lazy(
  () => import('@/features/customer-management/pages/CustomerEditPage'),
);
const BranchDiscoveryPage = lazy(
  () => import('@/features/branch-discovery/pages/BranchDiscoveryPage'),
);
const CustomerCourtStatusPage = lazy(
  () => import('@/features/customer-court-status/pages/CustomerCourtStatusPage'),
);
const MyBookingPage = lazy(() => import('@/features/bookings/pages/MyBookingPage'));
const MyProfilePage = lazy(() => import('@/features/profile/pages/MyProfilePage'));
const MomoReturnPage = lazy(() => import('@/features/payments/pages/MomoReturnPage'));
const SePayPaymentPage = lazy(() => import('@/features/payments/pages/SePayPaymentPage'));
const DiscoverMatchesPage = lazy(
  () => import('@/features/player-matching/pages/DiscoverMatchesPage'),
);
const MyPlayerMatchesPage = lazy(
  () => import('@/features/player-matching/pages/MyPlayerMatchesPage'),
);
const PlayerMatchingProfilePage = lazy(
  () => import('@/features/player-matching/pages/PlayerMatchingProfilePage'),
);
const BranchListPage = lazy(() => import('@/pages/admin/branches/BranchListPage'));
const BranchCreatePage = lazy(() => import('@/pages/admin/branches/BranchCreatePage'));
const BranchDetailPage = lazy(() => import('@/pages/admin/branches/BranchDetailPage'));
const BranchEditPage = lazy(() => import('@/pages/admin/branches/BranchEditPage'));
const UserManagementLayout = lazy(
  () => import('@/features/user-management/layouts/UserManagementLayout'),
);
const UserListPage = lazy(() => import('@/features/user-management/pages/UserListPage'));
const OwnerListPage = lazy(() => import('@/features/owner-management/pages/OwnerListPage'));
const PermissionListPage = lazy(
  () => import('@/features/permission-management/pages/PermissionListPage'),
);
const RoleListPage = lazy(() => import('@/features/role-management/pages/RoleListPage'));
const NotFoundPage = lazy(() => import('@/components/common/NotFoundPage'));

const withSuspense = (node: React.ReactNode) => (
  <Suspense fallback={<RouteFallback />}>{node}</Suspense>
);

const withPermissions = (node: React.ReactNode, permissions: readonly string[], mode: 'all' | 'any' = 'all') => (
  <PermissionGuard permissions={permissions} mode={mode}>{withSuspense(node)}</PermissionGuard>
);

export const router = createBrowserRouter([
  {
    path: paths.root,
    element: withSuspense(<BranchDiscoveryPage />),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: paths.customerCourtStatus,
    element: withSuspense(<CustomerCourtStatusPage />),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: paths.momoReturn,
    element: withSuspense(<MomoReturnPage />),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: paths.sePayPayment(),
    element: withSuspense(<SePayPaymentPage />),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: paths.staffActivation,
    element: withSuspense(<StaffActivationPage />),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: paths.branchDetail(),
    element: withSuspense(<CustomerCourtStatusPage />),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: paths.customerBranchCourtStatus(),
    element: withSuspense(<CustomerCourtStatusPage />),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: paths.playerMatching,
    element: withSuspense(<DiscoverMatchesPage />),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: paths.playerMatchingDetail(),
    element: withSuspense(<DiscoverMatchesPage />),
    errorElement: <RouteErrorBoundary />,
  },
  {
    element: <GuestRoute />,
    children: [
      { path: paths.login, element: withSuspense(<LoginPage />) },
      { path: paths.register, element: withSuspense(<RegisterPage />) },
      { path: paths.forgotPassword, element: withSuspense(<ForgotPasswordPage />) },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: paths.dashboard, element: withPermissions(<DashboardPage />, [P.DASHBOARD_VIEW]) },
          { path: paths.staffManagement, element: withSuspense(<StaffManagementPage />) },
          { path: paths.staffDetail(), element: withSuspense(<StaffDetailPage />) },
          { path: paths.myProfile, element: withSuspense(<MyProfilePage />) },
          { path: paths.courts, element: withPermissions(<CourtsPage />, [P.COURT_VIEW]) },
          { path: paths.bookings, element: withPermissions(<BookingsPage />, [P.BOOKING_VIEW]) },
          { path: paths.posSales, element: withPermissions(<CommercePage />, [P.SALES_VIEW, P.PRODUCT_VIEW, P.INVENTORY_VIEW, P.SALES_REPORT_VIEW], 'any') },
          {
            path: paths.posCategories,
            element: withPermissions(<CommerceManagementPage section="categories" />, [P.PRODUCT_VIEW]),
          },
          {
            path: paths.posProducts,
            element: withPermissions(<CommerceManagementPage section="products" />, [P.PRODUCT_VIEW]),
          },
          {
            path: paths.posBranchProducts,
            element: <Navigate to={paths.posProducts} replace />,
          },
          {
            path: paths.posInventory,
            element: withPermissions(<CommerceManagementPage section="inventory" />, [P.INVENTORY_VIEW]),
          },
          {
            path: paths.posMovements,
            element: withPermissions(<CommerceManagementPage section="movements" />, [P.INVENTORY_VIEW]),
          },
          {
            path: paths.posReceipts,
            element: withPermissions(<CommerceManagementPage section="receipts" />, [P.INVENTORY_VIEW]),
          },
          {
            path: paths.posReceiptCreate,
            element: withPermissions(<CommerceManagementPage section="receipt-edit" />, [P.INVENTORY_RECEIVE]),
          },
          {
            path: paths.posReceiptEdit(),
            element: withPermissions(<CommerceManagementPage section="receipt-edit" />, [P.INVENTORY_VIEW, P.INVENTORY_RECEIVE]),
          },
          {
            path: paths.posReceiptDetail(),
            element: withPermissions(<CommerceManagementPage section="receipt-detail" />, [P.INVENTORY_VIEW]),
          },
          {
            path: paths.posOrders,
            element: withPermissions(<CommerceManagementPage section="orders" />, [P.SALES_VIEW]),
          },
          {
            path: paths.posOrderDetail(),
            element: withPermissions(<CommerceManagementPage section="order-detail" />, [P.SALES_VIEW]),
          },
          {
            path: paths.posDashboard,
            element: withPermissions(<BusinessStatisticsPage />, [P.SALES_REPORT_VIEW]),
          },
          {
            path: paths.posInvoice(),
            element: withPermissions(<CommerceManagementPage section="invoice" />, [P.SALES_INVOICE_VIEW]),
          },
        ],
      },
      { path: paths.courtStatus, element: withPermissions(<CourtStatusPage />, [P.BOOKING_VIEW]) },
      { path: paths.myBooking, element: withSuspense(<MyBookingPage />) },
      { path: paths.myPlayerMatches, element: withSuspense(<MyPlayerMatchesPage />) },
      {
        path: paths.playerMatchingProfile,
        element: withSuspense(<PlayerMatchingProfilePage />),
      },
      {
        element: withPermissions(<CustomerLayout />, [P.CUSTOMER_VIEW]),
        children: [
          { path: paths.customers, element: withSuspense(<CustomerListPage />) },
          { path: paths.customerCreate, element: withSuspense(<CustomerCreatePage />) },
          { path: '/customers/:id', element: withSuspense(<CustomerDetailPage />) },
          { path: '/customers/:id/edit', element: withSuspense(<CustomerEditPage />) },
        ],
      },
      {
        element: <AdminOnlyRoute />,
        children: [
          {
            element: withSuspense(<UserManagementLayout />),
            children: [
              { path: paths.adminUsers, element: withSuspense(<UserListPage />) },
              { path: paths.adminOwners, element: withSuspense(<OwnerListPage />) },
              { path: paths.adminPermissions, element: withSuspense(<PermissionListPage />) },
              { path: paths.adminRoles, element: withSuspense(<RoleListPage />) },
            ],
          },
        ],
      },
      {
        path: paths.adminBranches,
        element: withPermissions(<AppLayout />, [P.BRANCH_VIEW]),
        children: [
          { index: true, element: withSuspense(<BranchListPage />) },
          { path: 'create', element: withPermissions(<BranchCreatePage />, [P.BRANCH_CREATE]) },
          { path: ':id', element: withSuspense(<BranchDetailPage />) },
          { path: ':id/edit', element: withPermissions(<BranchEditPage />, [P.BRANCH_UPDATE]) },
        ],
      },
    ],
  },
  { path: paths.notFound, element: withSuspense(<NotFoundPage />) },
]);

export const AppRouter = () => <RouterProvider router={router} />;
