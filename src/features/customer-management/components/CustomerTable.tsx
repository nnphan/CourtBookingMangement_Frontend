import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Eye,
  Edit2,
  Power,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  Calendar,
  Crown,
} from 'lucide-react';
import type { Customer } from '../types/customer';
import type { PaginationMetadata } from '@/types/api';
import { CUSTOMER_STATUS_CONFIG, MEMBER_TYPE_CONFIG } from '../constants/customer-status';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
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
      <div className="w-full flex flex-col bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* 1. Desktop & Tablet Table View (hidden on mobile < 640px) */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-xs border-b border-slate-200">
              <tr className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
                <th scope="col" className="py-3.5 px-4 w-28">
                  {t('customer.table.code', 'Mã KH')}
                </th>
                <th scope="col" className="py-3.5 px-4 min-w-[200px]">
                  {t('customer.table.fullName', 'Họ và tên')}
                </th>
                <th scope="col" className="py-3.5 px-4 whitespace-nowrap">
                  {t('customer.table.phone', 'Số điện thoại')}
                </th>
                <th scope="col" className="py-3.5 px-4 hidden md:table-cell">
                  {t('customer.table.email', 'Email')}
                </th>
                <th scope="col" className="py-3.5 px-4 whitespace-nowrap">
                  {t('customer.table.memberType', 'Hạng TV')}
                </th>
                <th scope="col" className="py-3.5 px-4 text-center hidden md:table-cell whitespace-nowrap">
                  {t('customer.table.totalBookings', 'Lượt đặt')}
                </th>
                <th scope="col" className="py-3.5 px-4 whitespace-nowrap">
                  {t('customer.table.status', 'Trạng thái')}
                </th>
                <th scope="col" className="py-3.5 px-4 hidden lg:table-cell whitespace-nowrap">
                  {t('customer.table.createdDate', 'Ngày tạo')}
                </th>
                <th scope="col" className="py-3.5 px-4 text-right whitespace-nowrap">
                  {t('customer.table.actions', 'Thao tác')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
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
                    className="hover:bg-emerald-50/30 transition-colors group cursor-pointer"
                    onClick={() => onViewCustomer(c)}
                  >
                    {/* Code */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800 text-xs">
                      {c.customerCode}
                    </td>

                    {/* Full Name */}
                    <td className="py-3.5 px-4">
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
                    <td className="py-3.5 px-4 font-mono text-slate-700 whitespace-nowrap">
                      {c.phoneNumber}
                    </td>

                    {/* Email */}
                    <td className="py-3.5 px-4 text-slate-500 hidden md:table-cell">
                      {c.email || '—'}
                    </td>

                    {/* Member Type */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
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
                    <td className="py-3.5 px-4 text-center hidden md:table-cell whitespace-nowrap">
                      <span className="inline-flex items-center justify-center min-w-8 px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 text-xs font-bold">
                        {c.totalBookings}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border',
                          statusCfg.badgeClass,
                        )}
                      >
                        <span className={cn('size-1.5 rounded-full', statusCfg.dotClass)} />
                        {statusCfg.labelVi}
                      </span>
                    </td>

                    {/* Created Date */}
                    <td className="py-3.5 px-4 text-slate-500 text-xs hidden lg:table-cell whitespace-nowrap">
                      {formattedDate}
                    </td>

                    {/* Actions */}
                    <td
                      className="py-3.5 px-4 text-right whitespace-nowrap"
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
                          className="size-7 p-0 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg"
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
                          className="size-7 p-0 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
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
        <div className="sm:hidden divide-y divide-slate-100">
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

                  <span
                    className={cn(
                      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0',
                      statusCfg.badgeClass,
                    )}
                  >
                    <span className={cn('size-1.5 rounded-full', statusCfg.dotClass)} />
                    {statusCfg.labelVi}
                  </span>
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
                    className="h-7 px-2.5 text-xs text-emerald-700 border-emerald-200"
                  >
                    <Eye className="size-3 mr-1" />
                    Xem
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onEditCustomer(c)}
                    className="h-7 px-2.5 text-xs text-blue-700 border-blue-200"
                  >
                    <Edit2 className="size-3 mr-1" />
                    Sửa
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* 3. Pagination Controls Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-200 bg-slate-50/50 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>
              {t('customer.pagination.showing', 'Hiển thị')}{' '}
              <strong className="text-slate-800 font-semibold">
                {customers.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
              </strong>{' '}
              -{' '}
              <strong className="text-slate-800 font-semibold">
                {Math.min(currentPage * pageSize, totalCount)}
              </strong>{' '}
              / <strong className="text-slate-800 font-semibold">{totalCount}</strong>{' '}
              {t('customer.pagination.records', 'khách hàng')}
            </span>

            {/* Page Size Selector */}
            <div className="ml-2 w-20">
              <Select
                value={String(pageSize)}
                onValueChange={(val) => onPageSizeChange(Number(val))}
              >
                <SelectTrigger className="h-7 text-xs bg-white border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 / trang</SelectItem>
                  <SelectItem value="20">20 / trang</SelectItem>
                  <SelectItem value="50">50 / trang</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              aria-label={t('customer.pagination.previous', 'Trang trước')}
              className="h-7 px-2.5 text-xs bg-white"
            >
              <ChevronLeft className="size-3.5 mr-0.5" />
              {t('customer.pagination.prevBtn', 'Trước')}
            </Button>

            <span className="px-2 font-semibold text-slate-700">
              {currentPage} / {totalPages}
            </span>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              aria-label={t('customer.pagination.next', 'Trang kế tiếp')}
              className="h-7 px-2.5 text-xs bg-white"
            >
              {t('customer.pagination.nextBtn', 'Sau')}
              <ChevronRight className="size-3.5 ml-0.5" />
            </Button>
          </div>
        </div>
      </div>
    );
  },
);

CustomerTable.displayName = 'CustomerTable';
