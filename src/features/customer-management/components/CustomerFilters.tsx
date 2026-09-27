import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Filter, RotateCcw } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import type { CustomerFilters as CustomerFiltersType, CustomerStatus, MemberType } from '../types/customer';
import { CUSTOMER_STATUS_CONFIG, MEMBER_TYPE_CONFIG } from '../constants/customer-status';

interface CustomerFiltersProps {
  filters: CustomerFiltersType;
  onChangeFilters: (filters: Partial<CustomerFiltersType>) => void;
  onResetFilters: () => void;
}

export const CustomerFilters: React.FC<CustomerFiltersProps> = memo(
  ({ filters, onChangeFilters, onResetFilters }) => {
    const { t } = useTranslation();

    const isFiltered =
      filters.status !== 'all' ||
      filters.memberType !== 'all' ||
      filters.isGuest !== 'all';

    return (
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Status Select */}
        <div className="w-36 sm:w-44">
          <Select
            value={filters.status ?? 'all'}
            onValueChange={(val) =>
              onChangeFilters({ status: val as CustomerStatus | 'all' })
            }
          >
            <SelectTrigger className="h-9 text-xs bg-white border-slate-200">
              <SelectValue placeholder={t('customer.filterStatus', 'Trạng thái')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('customer.allStatuses', 'Tất cả trạng thái')}</SelectItem>
              <SelectItem value="active">
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-emerald-500" />
                  {CUSTOMER_STATUS_CONFIG.active.labelVi}
                </span>
              </SelectItem>
              <SelectItem value="inactive">
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-amber-500" />
                  {CUSTOMER_STATUS_CONFIG.inactive.labelVi}
                </span>
              </SelectItem>
              <SelectItem value="blocked">
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-rose-500" />
                  {CUSTOMER_STATUS_CONFIG.blocked.labelVi}
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Member Type Select */}
        <div className="w-36 sm:w-44">
          <Select
            value={filters.memberType ?? 'all'}
            onValueChange={(val) =>
              onChangeFilters({ memberType: val as MemberType | 'all' })
            }
          >
            <SelectTrigger className="h-9 text-xs bg-white border-slate-200">
              <SelectValue placeholder={t('customer.filterMemberType', 'Hạng thành viên')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('customer.allMemberTypes', 'Tất cả hạng')}</SelectItem>
              <SelectItem value="bronze">{MEMBER_TYPE_CONFIG.bronze.labelVi}</SelectItem>
              <SelectItem value="silver">{MEMBER_TYPE_CONFIG.silver.labelVi}</SelectItem>
              <SelectItem value="gold">{MEMBER_TYPE_CONFIG.gold.labelVi}</SelectItem>
              <SelectItem value="platinum">{MEMBER_TYPE_CONFIG.platinum.labelVi}</SelectItem>
              <SelectItem value="standard">{MEMBER_TYPE_CONFIG.standard.labelVi}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Guest Type Select */}
        <div className="w-36 sm:w-40">
          <Select
            value={filters.isGuest === 'all' || filters.isGuest === undefined ? 'all' : filters.isGuest ? 'guest' : 'registered'}
            onValueChange={(val) =>
              onChangeFilters({
                isGuest: val === 'all' ? 'all' : val === 'guest',
              })
            }
          >
            <SelectTrigger className="h-9 text-xs bg-white border-slate-200">
              <SelectValue placeholder={t('customer.filterType', 'Phân loại')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('customer.allTypes', 'Tất cả loại')}</SelectItem>
              <SelectItem value="registered">{t('customer.registered', 'Hội viên đã đăng ký')}</SelectItem>
              <SelectItem value="guest">{t('customer.guest', 'Khách vãng lai')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reset Filter Button */}
        {isFiltered && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="h-9 px-2.5 text-xs text-slate-500 hover:text-slate-900"
          >
            <RotateCcw className="size-3.5 mr-1" />
            {t('customer.resetFilters', 'Đặt lại')}
          </Button>
        )}
      </div>
    );
  },
);

CustomerFilters.displayName = 'CustomerFilters';
