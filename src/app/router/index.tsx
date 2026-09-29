import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { paths } from '@/app/router/paths';
import { GuestRoute, ProtectedRoute } from '@/app/router/guards';
import { AppLayout } from '@/components/layout/AppLayout';
import { RouteFallback } from '@/components/common/RouteFallback';
import { RouteErrorBoundary } from '@/components/common/RouteErrorBoundary';

const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/features/auth/pages/ForgotPasswordPage'));
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage'));
const CourtsPage = lazy(() => import('@/features/courts/pages/CourtsPage'));
const BookingsPage = lazy(() => import('@/features/booking/pages/BookingsPage'));
const CourtStatusPage = lazy(() => import('@/features/court-status-board/pages/CourtStatusPage'));
const CustomerLayout = lazy(() => import('@/features/customer-management/layouts/CustomerLayout'));
const CustomerListPage = lazy(() => import('@/features/customer-management/pages/CustomerListPage'));
const CustomerDetailPage = lazy(() => import('@/features/customer-management/pages/CustomerDetailPage'));
const CustomerCreatePage = lazy(() => import('@/features/customer-management/pages/CustomerCreatePage'));
const CustomerEditPage = lazy(() => import('@/features/customer-management/pages/CustomerEditPage'));
const BranchDiscoveryPage = lazy(
  () => import('@/features/branch-discovery/pages/BranchDiscoveryPage'),
);
const CustomerCourtStatusPage = lazy(
  () => import('@/features/customer-court-status/pages/CustomerCourtStatusPage'),
);
const NotFoundPage = lazy(() => import('@/components/common/NotFoundPage'));

const withSuspense = (node: React.ReactNode) => (
  <Suspense fallback={<RouteFallback />}>{node}</Suspense>
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
          { path: paths.dashboard, element: withSuspense(<DashboardPage />) },
          { path: paths.courts, element: withSuspense(<CourtsPage />) },
          { path: paths.bookings, element: withSuspense(<BookingsPage />) },
        ],
      },
      { path: paths.courtStatus, element: withSuspense(<CourtStatusPage />) },
      {
        element: withSuspense(<CustomerLayout />),
        children: [
          { path: paths.customers, element: withSuspense(<CustomerListPage />) },
          { path: paths.customerCreate, element: withSuspense(<CustomerCreatePage />) },
          { path: '/customers/:id', element: withSuspense(<CustomerDetailPage />) },
          { path: '/customers/:id/edit', element: withSuspense(<CustomerEditPage />) },
        ],
      },
    ],
  },
  { path: paths.notFound, element: withSuspense(<NotFoundPage />) },
]);

export const AppRouter = () => <RouterProvider router={router} />;
