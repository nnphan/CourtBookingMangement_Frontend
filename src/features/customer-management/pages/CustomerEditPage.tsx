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
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/customers/${customer.id}`)}
          aria-label="Quay lại hồ sơ"
          className="size-9 p-0 rounded-full hover:bg-slate-100"
        >
          <ArrowLeft className="size-5 text-slate-700" />
        </Button>

        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Edit className="size-6 text-blue-600" />
            {t('customer.editTitle', 'Chỉnh sửa thông tin khách hàng')}
          </h1>
          <p className="text-xs text-slate-500 font-mono">
            Hồ sơ: {customer.fullName} ({customer.customerCode})
          </p>
        </div>
      </div>

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
