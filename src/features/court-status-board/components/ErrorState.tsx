import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  message?: string;
  onRetry: () => void;
  onRefresh?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = memo(
  ({ message, onRetry, onRefresh }) => {
    const { t } = useTranslation();

    return (
      <div
        role="alert"
        className="flex flex-col items-center justify-center p-8 text-center min-h-[400px] w-full bg-white rounded-2xl border border-red-100 shadow-sm"
      >
        <div className="flex size-14 items-center justify-center rounded-full bg-red-100 text-red-600 mb-4">
          <AlertTriangle className="size-7 stroke-[2]" />
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-1">
          {t('courtStatus.error.title', 'Không thể tải lịch trạng thái sân')}
        </h3>

        <p className="text-xs text-slate-500 max-w-md mb-6">
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

ErrorState.displayName = 'ErrorState';
