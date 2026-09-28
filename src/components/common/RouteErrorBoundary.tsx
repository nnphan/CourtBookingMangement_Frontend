import { useRouteError, isRouteErrorResponse, Link } from 'react-router';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import { paths } from '@/app/router/paths';

export const RouteErrorBoundary = () => {
  const error = useRouteError();

  let errorMessage = 'Đã có sự cố không mong muốn xảy ra. Vui lòng tải lại trang.';
  let errorStatus = 500;

  if (isRouteErrorResponse(error)) {
    errorStatus = error.status;
    errorMessage = error.statusText || error.data?.message || errorMessage;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-surface text-content-primary">
      <div className="max-w-md w-full rounded-3xl border border-line bg-surface p-8 shadow-xl text-center space-y-4">
        <div className="grid size-16 place-items-center rounded-2xl bg-amber-100 text-amber-700 mx-auto">
          <AlertTriangle className="size-8" />
        </div>

        <h1 className="text-xl font-extrabold text-content-primary">
          {errorStatus === 404 ? 'Không tìm thấy trang' : 'Đã xảy ra lỗi hệ thống'}
        </h1>

        <p className="text-xs text-content-secondary leading-relaxed">{errorMessage}</p>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="flex items-center gap-1.5 rounded-xl border border-line px-4 py-2 text-xs font-bold text-content-primary hover:bg-surface-muted"
          >
            <RotateCcw className="size-3.5" />
            Tải lại trang
          </button>

          <Link
            to={paths.root}
            className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white hover:bg-brand-700"
          >
            <Home className="size-3.5" />
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
};
