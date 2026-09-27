import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  UserCheck,
  Sparkles,
} from 'lucide-react';
import type { Customer } from '../types/customer';
import { CUSTOMER_STATUS_CONFIG } from '../constants/customer-status';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import dayjs from '@/lib/dayjs';

interface CustomerProfileCardProps {
  customer: Customer;
  onConvertGuest?: () => void;
}

export const CustomerProfileCard: React.FC<CustomerProfileCardProps> = memo(
  ({ customer, onConvertGuest }) => {
    const { t } = useTranslation();
    const statusCfg = CUSTOMER_STATUS_CONFIG[customer.status];

    const genderLabels: Record<string, string> = {
      male: 'Nam',
      female: 'Nữ',
      other: 'Khác',
    };

    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-6">
        {/* Top Header: Avatar + Name + Badges */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="grid size-14 sm:size-16 place-items-center rounded-2xl bg-emerald-600 text-white font-extrabold text-xl sm:text-2xl shadow-sm ring-4 ring-emerald-50">
              {customer.fullName.charAt(0).toUpperCase()}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  {customer.fullName}
                </h2>
                <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-slate-100 font-bold text-slate-600">
                  {customer.customerCode}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                {/* Status Badge */}
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border',
                    statusCfg.badgeClass,
                  )}
                >
                  <span className={cn('size-1.5 rounded-full', statusCfg.dotClass)} />
                  {statusCfg.labelVi}
                </span>

                {/* Guest / Registered Badge */}
                {customer.isGuest ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                    Khách vãng lai
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                    <UserCheck className="size-3" />
                    Hội viên chính thức
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Action: Convert Guest to Member */}
          {customer.isGuest && onConvertGuest && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onConvertGuest}
              className="text-xs font-bold text-amber-800 border-amber-300 bg-amber-50 hover:bg-amber-100 shadow-xs"
            >
              <Sparkles className="size-3.5 mr-1.5 text-amber-600" />
              {t('customer.convertToMember', 'Nâng cấp lên Hội viên')}
            </Button>
          )}
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs sm:text-sm">
          {/* Phone */}
          <div className="flex items-start gap-3">
            <Phone className="size-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {t('customer.fields.phone', 'Số điện thoại')}
              </p>
              <p className="font-mono font-bold text-slate-900 mt-0.5">{customer.phoneNumber}</p>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-start gap-3">
            <Mail className="size-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {t('customer.fields.email', 'Email')}
              </p>
              <p className="text-slate-800 font-medium mt-0.5">{customer.email || '—'}</p>
            </div>
          </div>

          {/* Gender */}
          <div className="flex items-start gap-3">
            <User className="size-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {t('customer.fields.gender', 'Giới tính')}
              </p>
              <p className="text-slate-800 font-medium mt-0.5">
                {customer.gender ? genderLabels[customer.gender] : '—'}
              </p>
            </div>
          </div>

          {/* Birthday */}
          <div className="flex items-start gap-3">
            <Calendar className="size-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {t('customer.fields.birthday', 'Ngày sinh')}
              </p>
              <p className="text-slate-800 font-medium mt-0.5">
                {customer.birthday ? dayjs(customer.birthday).format('DD/MM/YYYY') : '—'}
              </p>
            </div>
          </div>

          {/* Address */}
          <div className="flex items-start gap-3 sm:col-span-2">
            <MapPin className="size-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {t('customer.fields.address', 'Địa chỉ')}
              </p>
              <p className="text-slate-800 font-medium mt-0.5">{customer.address || '—'}</p>
            </div>
          </div>

          {/* Notes */}
          {customer.notes && (
            <div className="flex items-start gap-3 sm:col-span-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <FileText className="size-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  {t('customer.fields.notes', 'Ghi chú')}
                </p>
                <p className="text-slate-700 text-xs mt-0.5 leading-relaxed">{customer.notes}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  },
);

CustomerProfileCard.displayName = 'CustomerProfileCard';
