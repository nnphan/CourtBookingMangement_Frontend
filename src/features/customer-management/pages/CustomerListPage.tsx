import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useLocaleFormatters } from '@/hooks/useLocaleFormatters';
import {
  Users,
  UserPlus,
  BarChart3,
  UserCheck,
  Crown,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useCustomers } from '../hooks/useCustomers';
import { useCustomerStats } from '../hooks/useCustomerStats';
import { useCustomerStore } from '../store/customer.store';
import { customerApi } from '../api/customer.api';
import { CustomerTable } from '../components/CustomerTable';
import { CustomerSearch } from '../components/CustomerSearch';
import { CustomerFilters } from '../components/CustomerFilters';
import { CustomerEmptyState } from '../components/CustomerEmptyState';
import { CustomerErrorState } from '../components/ErrorState';
import { CustomerAnalytics } from '../components/CustomerAnalytics';
import { Button } from '@/components/ui/button';
import {
  FilterPanel,
  PageHeader,
  StatCard,
  StatCardGrid,
  TableSkeleton,
} from '@/components/management';
import { toast } from '@/lib/toast';
import type { Customer } from '../types/customer';

export const CustomerListPage: React.FC = () => {
  const { t } = useTranslation();
  const { formatNumber } = useLocaleFormatters();
  const navigate = useNavigate();

  const {
    searchKeyword,
    filters,
    pagination,
    setSearchKeyword,
    setFilters,
    setPagination,
    resetFilters,
  } = useCustomerStore();

  const [showAnalytics, setShowAnalytics] = useState(false);

  // TanStack Query for customer list
  const searchParams = useMemo(
    () => ({
      pageNumber: pagination.pageNumber,
      pageSize: pagination.pageSize,
      keyword: searchKeyword,
      status: filters.status,
      memberType: filters.memberType,
      isGuest: filters.isGuest,
    }),
    [pagination.pageNumber, pagination.pageSize, searchKeyword, filters],
  );

  const { customers, metadata, isLoading, isError, error, refetch } = useCustomers(searchParams);
  const { data: statsData } = useCustomerStats();

  const handlePageChange = useCallback(
    (pageNumber: number) => {
      setPagination({ pageNumber });
    },
    [setPagination],
  );

  const handlePageSizeChange = useCallback(
    (pageSize: number) => {
      setPagination({ pageSize, pageNumber: 1 });
    },
    [setPagination],
  );

  const handleViewCustomer = useCallback(
    (customer: Customer) => {
      navigate(`/customers/${customer.id}`);
    },
    [navigate],
  );

  const handleEditCustomer = useCallback(
    (customer: Customer) => {
      navigate(`/customers/${customer.id}/edit`);
    },
    [navigate],
  );

  const handleToggleDeactivate = useCallback(
    async (customer: Customer) => {
      const actionName = customer.status === 'active' ? 'ngừng hoạt động' : 'kích hoạt lại';
      if (window.confirm(`Bạn có chắc chắn muốn ${actionName} khách hàng ${customer.fullName}?`)) {
        try {
          const res = await customerApi.deactivateCustomer(customer.id);
          if (res.success) {
            toast.success(
              'Thành công',
              res.message || `Đã ${actionName} khách hàng ${customer.fullName}.`,
            );
            refetch();
          }
        } catch {
          toast.error('Lỗi', `Không thể ${actionName} khách hàng.`);
        }
      }
    },
    [refetch],
  );

  const hasActiveFilters = Boolean(
    searchKeyword ||
      filters.status !== 'all' ||
      filters.memberType !== 'all' ||
      filters.isGuest !== 'all',
  );

  return (
    <div className="w-full space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        icon={Users}
        title={t('customer.title', 'Quản lý Khách hàng')}
        badge={
          metadata
            ? `${formatNumber(metadata.totalCount)} ${t('customer.pagination.records', 'khách hàng')}`
            : undefined
        }
        description={t(
          'customer.subtitle',
          'Danh sách hồ sơ khách hàng, phân hạng hội viên và lịch sử đặt sân',
        )}
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAnalytics((prev) => !prev)}
              className="flex-1 sm:flex-none"
            >
              <BarChart3 className="size-4 text-primary" />
              {showAnalytics ? 'Ẩn báo cáo' : 'Báo cáo thống kê'}
              {showAnalytics ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            </Button>

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => navigate('/customers/new')}
              className="flex-1 sm:flex-none"
            >
              <UserPlus className="size-4" />
              {t('customer.addCustomer', 'Thêm khách hàng')}
            </Button>
          </>
        }
      />

      {/* 2. Customer Summary Metric Cards */}
      {statsData && (
        <StatCardGrid>
          <StatCard
            label={t('customer.stats.total', 'Tổng khách hàng')}
            value={formatNumber(statsData.totalCustomers)}
            icon={Users}
            tone="neutral"
          />
          <StatCard
            label={t('customer.stats.active', 'Đang hoạt động')}
            value={formatNumber(statsData.activeCustomers)}
            icon={UserCheck}
            tone="success"
          />
          <StatCard
            label={t('customer.stats.vip', 'Hội viên VIP')}
            value={formatNumber(statsData.vipCustomers)}
            icon={Crown}
            tone="warning"
          />
          <StatCard
            label={t('customer.stats.newThisMonth', 'Khách mới tháng này')}
            value={`+${formatNumber(statsData.newCustomersThisMonth)}`}
            icon={Sparkles}
            tone="primary"
          />
        </StatCardGrid>
      )}

      {/* 3. Analytics Dashboard Section (Collapsible) */}
      {showAnalytics && statsData && (
        <section aria-label="Customer Analytics" className="animate-in fade-in duration-200">
          <CustomerAnalytics stats={statsData} />
        </section>
      )}

      {/* 4. Search and Filter Section */}
      <FilterPanel
        title={t('customer.filterPanelTitle', 'Bộ lọc & Tìm kiếm')}
        resetLabel={t('customer.resetFilters', 'Đặt lại bộ lọc')}
        onReset={hasActiveFilters ? resetFilters : undefined}
      >
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="w-full lg:max-w-sm">
            <CustomerSearch
              value={searchKeyword}
              onChange={setSearchKeyword}
              showDropdown={false}
            />
          </div>

          <CustomerFilters filters={filters} onChangeFilters={setFilters} />
        </div>
      </FilterPanel>

      {/* 5. Customer Table & States */}
      <div>
        {isLoading ? (
          <TableSkeleton />
        ) : isError ? (
          <CustomerErrorState
            message={error?.message}
            onRetry={() => refetch()}
            onRefresh={() => refetch()}
          />
        ) : customers.length === 0 ? (
          <CustomerEmptyState
            hasFilters={hasActiveFilters}
            onResetFilters={resetFilters}
            onAddCustomer={() => navigate('/customers/new')}
          />
        ) : (
          <CustomerTable
            customers={customers}
            metadata={metadata}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onViewCustomer={handleViewCustomer}
            onEditCustomer={handleEditCustomer}
            onToggleDeactivate={handleToggleDeactivate}
          />
        )}
      </div>
    </div>
  );
};

export default CustomerListPage;
