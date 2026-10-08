import type { StatusBadgeVariant } from '@/components/management';
import type { CustomerStatus, MemberType } from '../types/customer';

export const CUSTOMER_STATUS_CONFIG: Record<
  CustomerStatus,
  {
    labelVi: string;
    labelEn: string;
    badgeVariant: StatusBadgeVariant;
    badgeClass: string;
    dotClass: string;
  }
> = {
  active: {
    labelVi: 'Hoạt động',
    labelEn: 'Active',
    badgeVariant: 'active',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20',
    dotClass: 'bg-emerald-500',
  },
  inactive: {
    labelVi: 'Ngừng hoạt động',
    labelEn: 'Inactive',
    badgeVariant: 'inactive',
    badgeClass: 'bg-slate-100 text-slate-600 border-slate-200 ring-slate-500/20',
    dotClass: 'bg-slate-400',
  },
  blocked: {
    labelVi: 'Bị khóa',
    labelEn: 'Blocked',
    badgeVariant: 'blocked',
    badgeClass: 'bg-red-50 text-red-700 border-red-200 ring-red-500/20',
    dotClass: 'bg-red-500',
  },
};

export const MEMBER_TYPE_CONFIG: Record<
  MemberType,
  {
    labelVi: string;
    labelEn: string;
    badgeClass: string;
    cardGradient: string;
    color: string;
  }
> = {
  bronze: {
    labelVi: 'Hạng Đồng',
    labelEn: 'Bronze',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
    cardGradient: 'from-amber-700 via-amber-800 to-amber-950',
    color: '#b45309',
  },
  silver: {
    labelVi: 'Hạng Bạc',
    labelEn: 'Silver',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
    cardGradient: 'from-slate-500 via-slate-600 to-slate-800',
    color: '#64748b',
  },
  gold: {
    labelVi: 'Hạng Vàng (VIP)',
    labelEn: 'Gold (VIP)',
    badgeClass: 'bg-yellow-100 text-yellow-900 border-yellow-300',
    cardGradient: 'from-amber-400 via-yellow-500 to-yellow-700',
    color: '#eab308',
  },
  platinum: {
    labelVi: 'Hạng Bạch Kim',
    labelEn: 'Platinum',
    badgeClass: 'bg-purple-100 text-purple-900 border-purple-300',
    cardGradient: 'from-indigo-600 via-purple-700 to-slate-900',
    color: '#a855f7',
  },
  standard: {
    labelVi: 'Tiêu chuẩn',
    labelEn: 'Standard',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    cardGradient: 'from-emerald-600 to-teal-800',
    color: '#10b981',
  },
};
