import React from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { CustomerForm } from '../components/CustomerForm';
import { useCreateCustomer } from '../hooks/useCreateCustomer';
import { Button } from '@/components/ui/button';
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
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <UserPlus className="size-6 text-emerald-600" />
            {t('customer.createTitle', 'Thêm khách hàng mới')}
          </h1>
          <p className="text-xs text-slate-500">
            {t(
              'customer.createSubtitle',
              'Nhập thông tin cá nhân và số điện thoại để tạo hồ sơ khách hàng mới',
            )}
          </p>
        </div>
      </div>

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
