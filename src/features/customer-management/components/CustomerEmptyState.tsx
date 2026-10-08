import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, UserPlus, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ManagementEmptyState } from '@/components/management';

interface CustomerEmptyStateProps {
  hasFilters?: boolean;
  onResetFilters?: () => void;
  onAddCustomer?: () => void;
}

export const CustomerEmptyState: React.FC<CustomerEmptyStateProps> = memo(
  ({ hasFilters = false, onResetFilters, onAddCustomer }) => {
    const { t } = useTranslation();

    return (
      <ManagementEmptyState
        icon={<Users className="size-8" />}
        title={t('customer.emptyTitle', 'Không tìm thấy khách hàng nào')}
        description={
          hasFilters
            ? t(
                'customer.emptyFilterDesc',
                'Không có khách hàng nào khớp với bộ lọc hoặc từ khóa tìm kiếm hiện tại. Vui lòng thử lại với từ khóa khác.',
              )
            : t(
                'customer.emptyDesc',
                'Hệ thống chưa có khách hàng nào. Hãy thêm khách hàng đầu tiên để bắt đầu quản lý.',
              )
        }
        actions={
          <>
            {hasFilters && onResetFilters && (
              <Button type="button" variant="outline" size="sm" onClick={onResetFilters}>
                <RotateCcw className="size-3.5" />
                {t('customer.resetFilters', 'Xóa bộ lọc')}
              </Button>
            )}
            {onAddCustomer && (
              <Button type="button" variant="primary" size="sm" onClick={onAddCustomer}>
                <UserPlus className="size-3.5" />
                {t('customer.addCustomer', 'Thêm khách hàng mới')}
              </Button>
            )}
          </>
        }
      />
    );
  },
);

CustomerEmptyState.displayName = 'CustomerEmptyState';
