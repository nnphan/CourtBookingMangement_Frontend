import React from 'react';
import { useParams, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Edit } from 'lucide-react';
import { CustomerForm } from '../components/CustomerForm';
import { useCustomer } from '../hooks/useCustomer';
import { useUpdateCustomer } from '../hooks/useUpdateCustomer';
import { CustomerDetailSkeleton } from '../components/CustomerSkeleton';
import { CustomerErrorState } from '../components/ErrorState';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/management';
import type { CustomerCreateInput } from '../types/customer';

export const CustomerEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { customer, isLoading, isError, error, refetch } = useCustomer(id);
  const updateMutation = useUpdateCustomer();

  const handleSubmit = async (data: CustomerCreateInput) => {
    if (!id) return;
    try {
      await updateMutation.mutateAsync({
        id,
        data: {
          fullName: data.fullName,
          phoneNumber: data.phoneNumber,
          email: data.email,
          gender: data.gender,
          birthday: data.birthday,
          address: data.address,
          notes: data.notes,
          memberType: data.memberType,
          status: data.status,
        },
      });
      navigate(`/customers/${id}`);
    } catch {
      // Error handled by mutation onError toast
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto pt-6 pb-12">
        <CustomerDetailSkeleton />
      </div>
    );
  }

  if (isError || !customer) {
    return (
      <div className="max-w-3xl mx-auto pt-8">
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
    <div className="max-w-3xl mx-auto space-y-6 pt-4 sm:pt-6 pb-12">
      {/* Top Header */}
      <PageHeader
        leading={
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => navigate(`/customers/${customer.id}`)}
            aria-label="Quay lại hồ sơ"
            className="shrink-0 rounded-xl"
          >
            <ArrowLeft className="size-5 text-slate-600" />
          </Button>
        }
        icon={Edit}
        title={t('customer.editTitle', 'Chỉnh sửa thông tin khách hàng')}
        description={`Hồ sơ: ${customer.fullName} (${customer.customerCode})`}
      />

      {/* Form Container */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-xs">
        <CustomerForm
          initialData={customer}
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/customers/${customer.id}`)}
          isLoading={updateMutation.isPending}
        />
      </div>
    </div>
  );
};

export default CustomerEditPage;
