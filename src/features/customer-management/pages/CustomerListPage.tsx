import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
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
import { CustomerTableSkeleton } from '../components/CustomerSkeleton';
import { CustomerEmptyState } from '../components/CustomerEmptyState';
import { CustomerErrorState } from '../components/ErrorState';
import { CustomerAnalytics } from '../components/CustomerAnalytics';
import { Button } from '@/components/ui/button';
import { toast } from '@/lib/toast';
import type { Customer } from '../types/customer';
import { paths } from '@/app/router/paths';

export const CustomerListPage: React.FC = () => {
  const { t } = useTranslation();
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
    <div className="w-full space-y-5">
      {/* 1. Header Bar: Title, Count Badge, Analytics Toggle, Add Customer Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-xs">
              <Users className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {t('customer.title', 'Quản lý Khách hàng')}
                </h1>
                {metadata && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {metadata.totalCount} {t('customer.pagination.records', 'khách hàng')}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {t(
                  'customer.subtitle',
                  'Danh sách hồ sơ khách hàng, phân hạng hội viên và lịch sử đặt sân',
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Toggle Analytics Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowAnalytics((prev) => !prev)}
            className="flex-1 sm:flex-none text-xs font-semibold rounded-xl border-slate-200 bg-white hover:bg-slate-50"
          >
            <BarChart3 className="size-3.5 mr-1.5 text-emerald-600" />
            {showAnalytics ? 'Ẩn báo cáo' : 'Báo cáo thống kê'}
            {showAnalytics ? (
              <ChevronUp className="size-3.5 ml-1" />
            ) : (
              <ChevronDown className="size-3.5 ml-1" />
            )}
          </Button>

          {/* Add Customer Button */}
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => navigate('/customers/new')}
            className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs"
          >
            <UserPlus className="size-3.5 mr-1.5" />
            {t('customer.addCustomer', 'Thêm khách hàng')}
          </Button>
        </div>
      </div>

      {/* 2. Customer Summary Metric Cards */}
      {statsData && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                {t('customer.stats.total', 'Tổng khách hàng')}
              </p>
              <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                {statsData.totalCustomers}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600">
              <Users className="size-5" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                {t('customer.stats.active', 'Đang hoạt động')}
              </p>
              <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-0.5">
                {statsData.activeCustomers}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <UserCheck className="size-5" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                {t('customer.stats.vip', 'Hội viên VIP')}
              </p>
              <p className="text-xl sm:text-2xl font-black text-amber-500 mt-0.5">
                {statsData.vipCustomers}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <Crown className="size-5" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                {t('customer.stats.newThisMonth', 'Khách mới tháng này')}
              </p>
              <p className="text-xl sm:text-2xl font-black text-blue-600 mt-0.5">
                +{statsData.newCustomersThisMonth}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <Sparkles className="size-5" />
            </div>
          </div>
        </div>
      )}

      {/* 3. Analytics Dashboard Section (Collapsible) */}
      {showAnalytics && statsData && (
        <section aria-label="Customer Analytics" className="animate-in fade-in duration-200">
          <CustomerAnalytics stats={statsData} />
        </section>
      )}

      {/* 4. Search and Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="w-full md:max-w-md">
          <CustomerSearch
            value={searchKeyword}
            onChange={setSearchKeyword}
            showDropdown={false}
          />
        </div>

        <CustomerFilters
          filters={filters}
          onChangeFilters={setFilters}
          onResetFilters={resetFilters}
        />
      </div>

      {/* 5. Customer Table & States */}
      <div>
        {isLoading ? (
          <CustomerTableSkeleton />
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
