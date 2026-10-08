import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Eye,
  Edit2,
  Power,
  Phone,
  Mail,
  Calendar,
  Crown,
} from 'lucide-react';
import type { Customer } from '../types/customer';
import type { PaginationMetadata } from '@/types/api';
import { CUSTOMER_STATUS_CONFIG, MEMBER_TYPE_CONFIG } from '../constants/customer-status';
import { Button } from '@/components/ui/button';
import { StatusBadge, TablePagination, tableStyles } from '@/components/management';
import { cn } from '@/lib/utils';
import dayjs from '@/lib/dayjs';

interface CustomerTableProps {
  customers: Customer[];
  metadata: PaginationMetadata | null;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onViewCustomer: (customer: Customer) => void;
  onEditCustomer: (customer: Customer) => void;
  onToggleDeactivate: (customer: Customer) => void;
}

export const CustomerTable: React.FC<CustomerTableProps> = memo(
  ({
    customers,
    metadata,
    onPageChange,
    onPageSizeChange,
    onViewCustomer,
    onEditCustomer,
    onToggleDeactivate,
  }) => {
    const { t } = useTranslation();

    const currentPage = metadata?.pageNumber ?? 1;
    const totalPages = metadata?.totalPages ?? 1;
    const totalCount = metadata?.totalCount ?? customers.length;
    const pageSize = metadata?.pageSize ?? 10;

    return (
      <div className={`${tableStyles.container} flex flex-col`}>
        {/* 1. Desktop & Tablet Table View (hidden on mobile < 640px) */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className={tableStyles.head}>
              <tr>
                <th scope="col" className={`${tableStyles.th} w-28`}>
                  {t('customer.table.code', 'Mã KH')}
                </th>
                <th scope="col" className={`${tableStyles.th} min-w-[200px]`}>
                  {t('customer.table.fullName', 'Họ và tên')}
                </th>
                <th scope="col" className={`${tableStyles.th} whitespace-nowrap`}>
                  {t('customer.table.phone', 'Số điện thoại')}
                </th>
                <th scope="col" className={`${tableStyles.th} hidden md:table-cell`}>
                  {t('customer.table.email', 'Email')}
                </th>
                <th scope="col" className={`${tableStyles.th} whitespace-nowrap`}>
                  {t('customer.table.memberType', 'Hạng TV')}
                </th>
                <th scope="col" className={`${tableStyles.th} text-center hidden md:table-cell whitespace-nowrap`}>
                  {t('customer.table.totalBookings', 'Lượt đặt')}
                </th>
                <th scope="col" className={`${tableStyles.th} whitespace-nowrap`}>
                  {t('customer.table.status', 'Trạng thái')}
                </th>
                <th scope="col" className={`${tableStyles.th} hidden lg:table-cell whitespace-nowrap`}>
                  {t('customer.table.createdDate', 'Ngày tạo')}
                </th>
                <th scope="col" className={`${tableStyles.th} text-right whitespace-nowrap`}>
                  {t('customer.table.actions', 'Thao tác')}
                </th>
              </tr>
            </thead>
            <tbody className={tableStyles.body}>
              {customers.map((c) => {
                const statusCfg = CUSTOMER_STATUS_CONFIG[c.status];
                const memberCfg = MEMBER_TYPE_CONFIG[c.memberType];
                const formattedDate = dayjs(c.createdDate).format('DD/MM/YYYY');
                const initials = c.fullName
                  .split(' ')
                  .map((w) => w[0])
                  .filter(Boolean)
                  .slice(-2)
                  .join('')
                  .toUpperCase();

                return (
                  <tr
                    key={c.id}
                    className={`${tableStyles.row} group cursor-pointer`}
                    onClick={() => onViewCustomer(c)}
                  >
                    {/* Code */}
                    <td className={`${tableStyles.td} font-mono font-bold text-slate-800 text-xs`}>
                      {c.customerCode}
                    </td>

                    {/* Full Name */}
                    <td className={`${tableStyles.td}`}>
                      <div className="flex items-center gap-2.5">
                        <div className="size-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs grid place-items-center shrink-0">
                          {initials}
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-slate-900">{c.fullName}</span>
                          {c.isGuest && (
                            <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded shrink-0">
                              Vãng lai
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className={`${tableStyles.td} font-mono text-slate-700 whitespace-nowrap`}>
                      {c.phoneNumber}
                    </td>

                    {/* Email */}
                    <td className={`${tableStyles.td} text-slate-500 hidden md:table-cell`}>
                      {c.email || '—'}
                    </td>

                    {/* Member Type */}
                    <td className={`${tableStyles.td} whitespace-nowrap`}>
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold border',
                          memberCfg.badgeClass,
                        )}
                      >
                        <Crown className="size-3" />
                        {memberCfg.labelVi}
                      </span>
                    </td>

                    {/* Total Bookings */}
                    <td className={`${tableStyles.td} text-center hidden md:table-cell whitespace-nowrap`}>
                      <span className="inline-flex items-center justify-center min-w-8 px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 text-xs font-bold">
                        {c.totalBookings}
                      </span>
                    </td>

                    {/* Status */}
                    <td className={`${tableStyles.td} whitespace-nowrap`}>
                      <StatusBadge status={statusCfg.badgeVariant}>{statusCfg.labelVi}</StatusBadge>
                    </td>

                    {/* Created Date */}
                    <td className={`${tableStyles.td} text-slate-500 text-xs hidden lg:table-cell whitespace-nowrap`}>
                      {formattedDate}
                    </td>

                    {/* Actions */}
                    <td
                      className={`${tableStyles.td} text-right whitespace-nowrap`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewCustomer(c)}
                          aria-label={`Xem chi tiết khách hàng ${c.fullName}`}
                          title="Xem chi tiết"
                          className="size-7 p-0 text-slate-500 hover:text-primary hover:bg-brand-50 rounded-lg"
                        >
                          <Eye className="size-3.5" />
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditCustomer(c)}
                          aria-label={`Chỉnh sửa khách hàng ${c.fullName}`}
                          title="Chỉnh sửa"
                          className="size-7 p-0 text-slate-500 hover:text-primary hover:bg-brand-50 rounded-lg"
                        >
                          <Edit2 className="size-3.5" />
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => onToggleDeactivate(c)}
                          aria-label={
                            c.status === 'active'
                              ? `Ngừng hoạt động khách hàng ${c.fullName}`
                              : `Kích hoạt lại khách hàng ${c.fullName}`
                          }
                          title={c.status === 'active' ? 'Ngừng hoạt động' : 'Kích hoạt lại'}
                          className={cn(
                            'size-7 p-0 rounded-lg',
                            c.status === 'active'
                              ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                              : 'text-emerald-600 hover:bg-emerald-50',
                          )}
                        >
                          <Power className="size-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 2. Mobile Responsive Card List (< 640px) */}
        <div className={tableStyles.mobileList}>
          {customers.map((c) => {
            const statusCfg = CUSTOMER_STATUS_CONFIG[c.status];
            const memberCfg = MEMBER_TYPE_CONFIG[c.memberType];

            return (
              <div
                key={c.id}
                onClick={() => onViewCustomer(c)}
                className="p-3.5 space-y-2.5 active:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-slate-500">
                        {c.customerCode}
                      </span>
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold border',
                          memberCfg.badgeClass,
                        )}
                      >
                        {memberCfg.labelVi}
                      </span>
                      {c.isGuest && (
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded">
                          Vãng lai
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 truncate">
                      {c.fullName}
                    </h4>
                  </div>

                  <StatusBadge status={statusCfg.badgeVariant}>{statusCfg.labelVi}</StatusBadge>
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Phone className="size-3 text-slate-400" />
                    <span className="font-mono">{c.phoneNumber}</span>
                  </span>
                  {c.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="size-3 text-slate-400" />
                      <span className="truncate max-w-[150px]">{c.email}</span>
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3 text-slate-400" />
                    <span>{c.totalBookings} lượt đặt</span>
                  </span>
                </div>

                {/* Mobile Actions */}
                <div
                  className="flex items-center justify-end gap-2 pt-1 border-t border-slate-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onViewCustomer(c)}
                    className="h-7 px-2.5 text-xs text-primary border-brand-200"
                  >
                    <Eye className="size-3 mr-1" />
                    Xem
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onEditCustomer(c)}
                    className="h-7 px-2.5 text-xs text-primary border-brand-200"
                  >
                    <Edit2 className="size-3 mr-1" />
                    Sửa
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* 3. Pagination */}
        <TablePagination
          pageNumber={currentPage}
          pageSize={pageSize}
          totalCount={totalCount}
          totalPages={totalPages}
          itemsLabel={t('customer.pagination.records', 'khách hàng')}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      </div>
    );
  },
);

CustomerTable.displayName = 'CustomerTable';
