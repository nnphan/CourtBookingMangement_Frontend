import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, UserPlus, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CustomerEmptyStateProps {
  hasFilters?: boolean;
  onResetFilters?: () => void;
  onAddCustomer?: () => void;
}

export const CustomerEmptyState: React.FC<CustomerEmptyStateProps> = memo(
  ({ hasFilters = false, onResetFilters, onAddCustomer }) => {
    const { t } = useTranslation();

    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center min-h-[360px] w-full bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
        <div className="relative mb-4">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-xs ring-8 ring-emerald-50/50">
            <Users className="size-8" />
          </div>
          <div className="absolute -bottom-1 -right-1 size-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 shadow-xs">
            <span className="text-xs font-bold">0</span>
          </div>
        </div>

        <h3 className="text-base font-bold text-slate-800">
          {t('customer.emptyTitle', 'Không tìm thấy khách hàng nào')}
        </h3>

        <p className="text-xs text-slate-500 max-w-sm mt-1.5 mb-5 leading-relaxed">
          {hasFilters
            ? t(
                'customer.emptyFilterDesc',
                'Không có khách hàng nào khớp với bộ lọc hoặc từ khóa tìm kiếm hiện tại. Vui lòng thử lại với từ khóa khác.',
              )
            : t(
                'customer.emptyDesc',
                'Hệ thống chưa có khách hàng nào. Hãy thêm khách hàng đầu tiên để bắt đầu quản lý.',
              )}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {hasFilters && onResetFilters && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onResetFilters}
              className="text-xs font-semibold"
            >
              <RotateCcw className="size-3.5 mr-1.5" />
              {t('customer.resetFilters', 'Xóa bộ lọc')}
            </Button>
          )}

          {onAddCustomer && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={onAddCustomer}
              className="bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white shadow-xs"
            >
              <UserPlus className="size-3.5 mr-1.5" />
              {t('customer.addCustomer', 'Thêm khách hàng mới')}
            </Button>
          )}
        </div>
      </div>
    );
  },
);

CustomerEmptyState.displayName = 'CustomerEmptyState';
