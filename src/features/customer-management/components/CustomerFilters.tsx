import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FILTER_CONTROL_CLASS } from '@/components/management';
import type { CustomerFilters as CustomerFiltersType, CustomerStatus, MemberType } from '../types/customer';
import { CUSTOMER_STATUS_CONFIG, MEMBER_TYPE_CONFIG } from '../constants/customer-status';

interface CustomerFiltersProps {
  filters: CustomerFiltersType;
  onChangeFilters: (filters: Partial<CustomerFiltersType>) => void;
}

/** Dropdown filters only; search and the reset action live in the shared FilterPanel. */
export const CustomerFilters: React.FC<CustomerFiltersProps> = memo(
  ({ filters, onChangeFilters }) => {
    const { t } = useTranslation();

    return (
      <div className="flex flex-wrap items-center gap-3">
        {/* Status Select */}
        <div className="w-full sm:w-44">
          <Select
            value={filters.status ?? 'all'}
            onValueChange={(val) =>
              onChangeFilters({ status: val as CustomerStatus | 'all' })
            }
          >
            <SelectTrigger
              aria-label={t('customer.filterStatus', 'Trạng thái')}
              className={FILTER_CONTROL_CLASS}
            >
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
                  <span className="size-2 rounded-full bg-slate-400" />
                  {CUSTOMER_STATUS_CONFIG.inactive.labelVi}
                </span>
              </SelectItem>
              <SelectItem value="blocked">
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-red-500" />
                  {CUSTOMER_STATUS_CONFIG.blocked.labelVi}
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Member Type Select */}
        <div className="w-full sm:w-44">
          <Select
            value={filters.memberType ?? 'all'}
            onValueChange={(val) =>
              onChangeFilters({ memberType: val as MemberType | 'all' })
            }
          >
            <SelectTrigger
              aria-label={t('customer.filterMemberType', 'Hạng thành viên')}
              className={FILTER_CONTROL_CLASS}
            >
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
        <div className="w-full sm:w-44">
          <Select
            value={filters.isGuest === 'all' || filters.isGuest === undefined ? 'all' : filters.isGuest ? 'guest' : 'registered'}
            onValueChange={(val) =>
              onChangeFilters({
                isGuest: val === 'all' ? 'all' : val === 'guest',
              })
            }
          >
            <SelectTrigger
              aria-label={t('customer.filterType', 'Phân loại')}
              className={FILTER_CONTROL_CLASS}
            >
              <SelectValue placeholder={t('customer.filterType', 'Phân loại')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('customer.allTypes', 'Tất cả loại')}</SelectItem>
              <SelectItem value="registered">{t('customer.registered', 'Hội viên đã đăng ký')}</SelectItem>
              <SelectItem value="guest">{t('customer.guest', 'Khách vãng lai')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  },
);

CustomerFilters.displayName = 'CustomerFilters';
