import React from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { CustomerForm } from '../components/CustomerForm';
import { useCreateCustomer } from '../hooks/useCreateCustomer';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/management';
import type { CustomerCreateInput } from '../types/customer';

export const CustomerCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const createMutation = useCreateCustomer();

  const handleSubmit = async (data: CustomerCreateInput) => {
    try {
      const created = await createMutation.mutateAsync(data);
      navigate(`/customers/${created.id}`);
    } catch {
      // Error handled by mutation onError toast
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pt-4 sm:pt-6 pb-12">
      {/* Top Header */}
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
        icon={UserPlus}
        title={t('customer.createTitle', 'Thêm khách hàng mới')}
        description={t(
          'customer.createSubtitle',
          'Nhập thông tin cá nhân và số điện thoại để tạo hồ sơ khách hàng mới',
        )}
      />

      {/* Form Container */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-xs">
        <CustomerForm
          onSubmit={handleSubmit}
          onCancel={() => navigate('/customers')}
          isLoading={createMutation.isPending}
        />
      </div>
    </div>
  );
};

export default CustomerCreatePage;
