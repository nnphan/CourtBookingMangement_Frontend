import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router';
import { paths } from '@/app/router/paths';
import { GuestRoute, ProtectedRoute } from '@/app/router/guards';
import { AppLayout } from '@/components/layout/AppLayout';
import { RouteFallback } from '@/components/common/RouteFallback';

const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/features/auth/pages/ForgotPasswordPage'));
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage'));
const CourtsPage = lazy(() => import('@/features/courts/pages/CourtsPage'));
const BookingsPage = lazy(() => import('@/features/booking/pages/BookingsPage'));
const CourtStatusPage = lazy(() => import('@/features/court-status-board/pages/CourtStatusPage'));
const NotFoundPage = lazy(() => import('@/components/common/NotFoundPage'));

const withSuspense = (node: React.ReactNode) => (
  <Suspense fallback={<RouteFallback />}>{node}</Suspense>
);

export const router = createBrowserRouter([
  { path: paths.root, element: <Navigate to={paths.login} replace /> },
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
    ],
  },
  { path: paths.notFound, element: withSuspense(<NotFoundPage />) },
]);

export const AppRouter = () => <RouterProvider router={router} />;
