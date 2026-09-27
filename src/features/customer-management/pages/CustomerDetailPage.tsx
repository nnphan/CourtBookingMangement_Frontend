import React, { useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Edit2, Power, History } from 'lucide-react';
import { useCustomer } from '../hooks/useCustomer';
import { useCustomerBookings } from '../hooks/useCustomerBookings';
import { customerApi } from '../api/customer.api';
import { CustomerProfileCard } from '../components/CustomerProfileCard';
import { MembershipCard } from '../components/MembershipCard';
import { CustomerStatsCard } from '../components/CustomerStatsCard';
import { BookingHistoryTable } from '../components/BookingHistoryTable';
import { CustomerDetailSkeleton } from '../components/CustomerSkeleton';
import { CustomerErrorState } from '../components/ErrorState';
import { Button } from '@/components/ui/button';
import { toast } from '@/lib/toast';

export const CustomerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { customer, isLoading, isError, error, refetch } = useCustomer(id);
  const { data: bookings = [], isLoading: isBookingsLoading } = useCustomerBookings(id ?? '');

  const handleToggleDeactivate = useCallback(async () => {
    if (!customer) return;
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
  }, [customer, refetch]);

  const handleConvertGuest = useCallback(async () => {
    if (!customer || !customer.isGuest) return;
    if (window.confirm(`Xác nhận nâng cấp khách vãng lai ${customer.fullName} thành Hội viên chính thức?`)) {
      try {
        const res = await customerApi.convertGuestToCustomer(customer.id, {
          memberType: 'bronze',
        });
        if (res.success) {
          toast.success('Thành công', 'Đã chuyển đổi thành Hội viên chính thức thành công!');
          refetch();
        }
      } catch {
        toast.error('Lỗi', 'Không thể chuyển đổi khách hàng.');
      }
    }
  }, [customer, refetch]);

  if (isLoading) {
    return (
      <div className="pt-6 pb-12">
        <CustomerDetailSkeleton />
      </div>
    );
  }

  if (isError || !customer) {
    return (
      <div className="pt-8">
        <CustomerErrorState
          title="Không tìm thấy khách hàng"
          message={error?.message || 'Khách hàng không tồn tại hoặc đã bị xóa.'}
          onRetry={() => refetch()}
          onRefresh={() => navigate('/customers')}
        />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-10">
      {/* Top Navigation & Action Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => navigate('/customers')}
            aria-label="Quay lại danh sách"
            className="size-9 p-0 rounded-full hover:bg-slate-100"
          >
            <ArrowLeft className="size-5 text-slate-700" />
          </Button>

          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {customer.fullName}
            </h1>
            <p className="text-xs text-slate-500 font-mono">Mã hồ sơ: {customer.customerCode}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Edit Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate(`/customers/${customer.id}/edit`)}
            className="flex-1 sm:flex-none text-xs font-semibold rounded-xl border-slate-300 hover:bg-slate-50 shadow-xs"
          >
            <Edit2 className="size-3.5 mr-1.5 text-blue-600" />
            {t('common.edit', 'Chỉnh sửa')}
          </Button>

          {/* Toggle Deactivate Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleToggleDeactivate}
            className={`flex-1 sm:flex-none text-xs font-semibold rounded-xl shadow-xs ${
              customer.status === 'active'
                ? 'text-rose-700 border-rose-200 hover:bg-rose-50'
                : 'text-emerald-700 border-emerald-200 hover:bg-emerald-50'
            }`}
          >
            <Power className="size-3.5 mr-1.5" />
            {customer.status === 'active'
              ? t('customer.deactivate', 'Ngừng hoạt động')
              : t('customer.activate', 'Kích hoạt lại')}
          </Button>
        </div>
      </div>

      {/* Grid: Customer Profile Card (2 cols) & Membership Card (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <CustomerProfileCard customer={customer} onConvertGuest={handleConvertGuest} />
        </div>
        <div>
          <MembershipCard customer={customer} />
        </div>
      </div>

      {/* Statistics Cards */}
      <section aria-label="Customer Statistics">
        <CustomerStatsCard customer={customer} />
      </section>

      {/* Booking History Table */}
      <section aria-label="Booking History">
        <BookingHistoryTable bookings={bookings} isLoading={isBookingsLoading} />
      </section>
    </div>
  );
};

export default CustomerDetailPage;
