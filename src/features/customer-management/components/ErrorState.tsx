import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  onRefresh?: () => void;
}

export const CustomerErrorState: React.FC<ErrorStateProps> = memo(
  ({ title, message, onRetry, onRefresh }) => {
    const { t } = useTranslation();

    return (
      <div
        role="alert"
        className="flex flex-col items-center justify-center p-8 sm:p-12 text-center min-h-[300px] w-full bg-rose-50/40 rounded-2xl border border-rose-200"
      >
        <div className="flex size-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 mb-3 shadow-xs">
          <AlertTriangle className="size-7" />
        </div>

        <h3 className="text-base font-bold text-slate-800">
          {title || t('customer.errorTitle', 'Đã xảy ra sự cố khi tải dữ liệu')}
        </h3>

        <p className="text-xs text-slate-500 max-w-md mt-1.5 mb-5 leading-relaxed">
          {message ||
            t(
              'customer.errorDesc',
              'Không thể kết nối với máy chủ hoặc dữ liệu không tồn tại. Vui lòng thử lại sau giây lát.',
            )}
        </p>

        <div className="flex items-center gap-2">
          {onRetry && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="text-xs font-semibold border-rose-300 text-rose-700 hover:bg-rose-100/60"
            >
              <RefreshCw className="size-3.5 mr-1.5" />
              {t('common.retry', 'Thử lại')}
            </Button>
          )}

          {onRefresh && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={onRefresh}
              className="bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white shadow-xs"
            >
              {t('common.refresh', 'Làm mới')}
            </Button>
          )}
        </div>
      </div>
    );
  },
);

CustomerErrorState.displayName = 'CustomerErrorState';
