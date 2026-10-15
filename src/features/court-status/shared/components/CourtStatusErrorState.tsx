import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CourtStatusErrorStateProps {
  title?: string;
  message?: string;
  onRetry: () => void;
  onRefresh?: () => void;
}

export const CourtStatusErrorState: React.FC<CourtStatusErrorStateProps> = memo(
  ({ title, message, onRetry, onRefresh }) => {
    const { t } = useTranslation();

    return (
      <div
        role="alert"
        className="flex min-h-[400px] w-full flex-col items-center justify-center rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm"
      >
        <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-red-100 text-red-600">
          <AlertTriangle className="size-7 stroke-[2]" />
        </div>
        <h3 className="mb-1 text-lg font-bold text-slate-900">
          {title || t('courtStatus.error.title', 'Không thể tải lịch trạng thái sân')}
        </h3>
        <p className="mb-6 max-w-md text-xs text-slate-500">
          {message ||
            t(
              'courtStatus.error.description',
              'Đã xảy ra lỗi khi kết nối với máy chủ. Vui lòng kiểm tra đường truyền và thử lại.',
            )}
        </p>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh || onRetry}
            className="flex items-center gap-2"
          >
            <RotateCw className="size-3.5" />
            {t('courtStatus.error.refresh', 'Tải lại trang')}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onRetry}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {t('courtStatus.error.retry', 'Thử lại')}
          </Button>
        </div>
      </div>
    );
  },
);

CourtStatusErrorState.displayName = 'CourtStatusErrorState';
