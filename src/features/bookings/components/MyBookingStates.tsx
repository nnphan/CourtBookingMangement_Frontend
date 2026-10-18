import { AlertCircle, CalendarPlus, RotateCcw, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const MyBookingSkeleton = () => (
  <div
    role="status"
    aria-label="Đang tải lịch đặt sân"
    className="grid grid-cols-1 gap-4 xl:grid-cols-2"
  >
    {[1, 2, 3, 4].map((item) => (
      <div
        key={`booking-skeleton-${item}`}
        className="border-line bg-surface animate-pulse overflow-hidden rounded-xl border p-4 shadow-xs sm:p-5"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="bg-surface-muted h-6 w-32 rounded-full" />
          <div className="bg-surface-muted h-3 w-28 rounded" />
        </div>
        <div className="mt-5 space-y-2">
          <div className="bg-surface-muted h-5 w-3/4 rounded" />
          <div className="bg-surface-muted h-6 w-20 rounded" />
        </div>
        <div className="bg-surface-muted mt-4 space-y-3 rounded-lg p-3">
          <div className="bg-surface h-4 w-2/3 rounded" />
          <div className="bg-surface h-4 w-1/2 rounded" />
        </div>
        <div className="mt-4 flex gap-2">
          <div className="bg-surface-muted h-7 w-20 rounded-md" />
          <div className="bg-surface-muted h-7 w-24 rounded-md" />
        </div>
        <div className="border-line mt-4 flex items-center justify-between border-t pt-4">
          <div className="space-y-2">
            <div className="bg-surface-muted h-3 w-16 rounded" />
            <div className="bg-surface-muted h-5 w-28 rounded" />
          </div>
          <div className="bg-surface-muted h-11 w-36 rounded-lg" />
        </div>
      </div>
    ))}
    <span className="sr-only">Đang tải danh sách lịch đặt sân.</span>
  </div>
);

interface MyBookingEmptyStateProps {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  search?: boolean;
}

export const MyBookingEmptyState = ({
  title,
  description,
  actionLabel,
  onAction,
  search = false,
}: MyBookingEmptyStateProps) => {
  const Icon = search ? SearchX : CalendarPlus;

  return (
    <section className="border-brand-200 bg-surface flex flex-col items-center rounded-xl border border-dashed px-5 py-12 text-center shadow-xs sm:py-16">
      <div className="bg-brand-50 text-brand-700 mb-4 grid size-14 place-items-center rounded-xl">
        <Icon aria-hidden="true" className="size-7" />
      </div>
      <h2 className="text-content-primary text-lg font-bold">{title}</h2>
      <p className="text-content-secondary mt-2 max-w-md text-sm">{description}</p>
      <Button type="button" className="mt-6 min-h-11" onClick={onAction}>
        {actionLabel}
      </Button>
    </section>
  );
};

interface MyBookingErrorStateProps {
  onRetry: () => void;
  onHome: () => void;
}

export const MyBookingErrorState = ({ onRetry, onHome }: MyBookingErrorStateProps) => (
  <section
    role="alert"
    className="border-line bg-surface flex flex-col items-center rounded-xl border px-5 py-12 text-center shadow-xs sm:py-16"
  >
    <div className="mb-4 grid size-14 place-items-center rounded-full bg-rose-100 text-rose-700">
      <AlertCircle aria-hidden="true" className="size-7" />
    </div>
    <h2 className="text-danger text-lg font-bold">Không thể tải lịch đặt sân.</h2>
    <p className="text-content-secondary mt-2 max-w-md text-sm">
      Phiên đăng nhập có thể đã hết hạn. Vui lòng kiểm tra kết nối và thử lại.
    </p>
    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
      <Button type="button" className="min-h-11 gap-2" onClick={onRetry}>
        <RotateCcw aria-hidden="true" className="size-4" />
        Thử lại
      </Button>
      <Button type="button" variant="outline" className="min-h-11" onClick={onHome}>
        Về trang chủ
      </Button>
    </div>
  </section>
);
