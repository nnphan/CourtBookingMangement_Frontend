import React, { useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Edit2, Power } from 'lucide-react';
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
import { PageHeader } from '@/components/management';
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
      <PageHeader
        leading={
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => navigate('/customers')}
            aria-label="Quay lại danh sách"
            className="shrink-0 rounded-xl"
          >
            <ArrowLeft className="size-5 text-slate-600" />
          </Button>
        }
        title={customer.fullName}
        description={`Mã hồ sơ: ${customer.customerCode}`}
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigate(`/customers/${customer.id}/edit`)}
              className="flex-1 sm:flex-none"
            >
              <Edit2 className="size-4 text-primary" />
              {t('common.edit', 'Chỉnh sửa')}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleToggleDeactivate}
              className={`flex-1 sm:flex-none ${
                customer.status === 'active'
                  ? 'text-red-700 border-red-200 hover:bg-red-50'
                  : 'text-emerald-700 border-emerald-200 hover:bg-emerald-50'
              }`}
            >
              <Power className="size-4" />
              {customer.status === 'active'
                ? t('customer.deactivate', 'Ngừng hoạt động')
                : t('customer.activate', 'Kích hoạt lại')}
            </Button>
          </>
        }
      />

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
