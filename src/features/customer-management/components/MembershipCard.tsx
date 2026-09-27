import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Crown, Calendar, Sparkles, Award } from 'lucide-react';
import type { Customer } from '../types/customer';
import { MEMBER_TYPE_CONFIG } from '../constants/customer-status';
import { cn } from '@/lib/utils';
import dayjs from '@/lib/dayjs';

interface MembershipCardProps {
  customer: Customer;
}

export const MembershipCard: React.FC<MembershipCardProps> = memo(({ customer }) => {
  const { t } = useTranslation();
  const memberCfg = MEMBER_TYPE_CONFIG[customer.memberType];

  const formattedJoinDate = customer.joinDate
    ? dayjs(customer.joinDate).format('DD/MM/YYYY')
    : '—';
  const formattedExpireDate = customer.expireDate
    ? dayjs(customer.expireDate).format('DD/MM/YYYY')
    : 'Vô thời hạn';

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl p-6 text-white shadow-lg bg-gradient-to-br flex flex-col justify-between min-h-[220px]',
        memberCfg.cardGradient,
      )}
    >
      {/* Decorative background badges */}
      <div className="absolute -right-6 -bottom-6 opacity-15 pointer-events-none">
        <Crown className="size-44" />
      </div>

      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="grid size-8 place-items-center rounded-lg bg-white/20 backdrop-blur-md">
            <Award className="size-5 text-white" />
          </div>
          <span className="font-extrabold tracking-wider text-xs uppercase opacity-90">
            ALOBO BADMINTON CLUB
          </span>
        </div>

        <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="size-3 text-yellow-300" />
          {memberCfg.labelVi}
        </span>
      </div>

      {/* Middle Code & Name */}
      <div className="space-y-1 my-4">
        <p className="font-mono text-xs opacity-75 tracking-widest uppercase">MÃ THẺ THÀNH VIÊN</p>
        <p className="font-mono text-xl sm:text-2xl font-black tracking-widest">
          {customer.customerCode}
        </p>
        <p className="font-bold text-sm sm:text-base opacity-95 truncate">{customer.fullName}</p>
      </div>

      {/* Bottom Dates */}
      <div className="flex items-center justify-between pt-3 border-t border-white/20 text-xs">
        <div>
          <span className="opacity-75 block text-[10px] uppercase font-semibold">
            {t('customer.membership.joinDate', 'Ngày gia nhập')}
          </span>
          <span className="font-mono font-bold">{formattedJoinDate}</span>
        </div>

        <div className="text-right">
          <span className="opacity-75 block text-[10px] uppercase font-semibold">
            {t('customer.membership.expireDate', 'Ngày hết hạn')}
          </span>
          <span className="font-mono font-bold flex items-center gap-1 justify-end">
            <Calendar className="size-3 text-white/80" />
            {formattedExpireDate}
          </span>
        </div>
      </div>
    </div>
  );
});

MembershipCard.displayName = 'MembershipCard';
