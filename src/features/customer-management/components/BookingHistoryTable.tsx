import React, { useState, useMemo, memo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  Clock,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import type { CustomerBookingHistory, BookingHistoryStatus, PaymentHistoryStatus } from '../types/booking-history';
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

interface BookingHistoryTableProps {
  bookings: CustomerBookingHistory[];
  isLoading?: boolean;
}

export const BookingHistoryTable: React.FC<BookingHistoryTableProps> = memo(
  ({ bookings, isLoading = false }) => {
    const { t } = useTranslation();

    const [statusFilter, setStatusFilter] = useState<BookingHistoryStatus | 'all'>('all');
    const [paymentFilter, setPaymentFilter] = useState<PaymentHistoryStatus | 'all'>('all');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;

    // Filter and Sort
    const filteredBookings = useMemo(() => {
      let result = [...bookings];

      if (statusFilter !== 'all') {
        result = result.filter((b) => b.bookingStatus === statusFilter);
      }

      if (paymentFilter !== 'all') {
        result = result.filter((b) => b.paymentStatus === paymentFilter);
      }

      result.sort((a, b) => {
        const dateA = new Date(`${a.bookingDate} ${a.startTime}`).getTime();
        const dateB = new Date(`${b.bookingDate} ${b.startTime}`).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      });

      return result;
    }, [bookings, statusFilter, paymentFilter, sortOrder]);

    const totalPages = Math.max(1, Math.ceil(filteredBookings.length / pageSize));
    const paginated = filteredBookings.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize,
    );

    const statusBadge = (status: BookingHistoryStatus) => {
      switch (status) {
        case 'confirmed':
          return (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Đã xác nhận
            </span>
          );
        case 'completed':
          return (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              Hoàn thành
            </span>
          );
        case 'pending':
          return (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              Chờ duyệt
            </span>
          );
        case 'cancelled':
          return (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
              Đã hủy
            </span>
          );
      }
    };

    const paymentBadge = (status: PaymentHistoryStatus) => {
      switch (status) {
        case 'paid':
          return (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Đã thanh toán
            </span>
          );
        case 'unpaid':
          return (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
              Chưa thanh toán
            </span>
          );
        case 'deposit_pending':
          return (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              Chờ cọc
            </span>
          );
        case 'partially_paid':
          return (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Cọc một phần
            </span>
          );
      }
    };

    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Header & Filter Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-800">
              {t('customer.history.title', 'Lịch sử đặt sân')}
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
              {filteredBookings.length}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Booking Status Filter */}
            <div className="w-32">
              <Select
                value={statusFilter}
                onValueChange={(val) => {
                  setStatusFilter(val as BookingHistoryStatus | 'all');
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-8 text-xs bg-white">
                  <SelectValue placeholder="Trạng thái đặt" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả đặt</SelectItem>
                  <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                  <SelectItem value="completed">Hoàn thành</SelectItem>
                  <SelectItem value="pending">Chờ duyệt</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Payment Status Filter */}
            <div className="w-36">
              <Select
                value={paymentFilter}
                onValueChange={(val) => {
                  setPaymentFilter(val as PaymentHistoryStatus | 'all');
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-8 text-xs bg-white">
                  <SelectValue placeholder="Thanh toán" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả thanh toán</SelectItem>
                  <SelectItem value="paid">Đã thanh toán</SelectItem>
                  <SelectItem value="unpaid">Chưa thanh toán</SelectItem>
                  <SelectItem value="deposit_pending">Chờ cọc</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort Toggle */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
              title={sortOrder === 'desc' ? 'Mới nhất trước' : 'Cũ nhất trước'}
              className="h-8 px-2 text-xs bg-white"
            >
              <ArrowUpDown className="size-3.5 mr-1" />
              {sortOrder === 'desc' ? 'Mới nhất' : 'Cũ nhất'}
            </Button>
          </div>
        </div>

        {/* Table Content */}
        {filteredBookings.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            {t('customer.history.empty', 'Chưa có lịch sử đặt sân nào phù hợp.')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] uppercase tracking-wider font-semibold text-slate-500">
                  <th scope="col" className="py-2.5 px-4">
                    {t('customer.history.bookingNumber', 'Mã đặt')}
                  </th>
                  <th scope="col" className="py-2.5 px-4">
                    {t('customer.history.date', 'Ngày đặt')}
                  </th>
                  <th scope="col" className="py-2.5 px-4">
                    {t('customer.history.court', 'Sân')}
                  </th>
                  <th scope="col" className="py-2.5 px-4">
                    {t('customer.history.time', 'Khung giờ')}
                  </th>
                  <th scope="col" className="py-2.5 px-4 text-right">
                    {t('customer.history.amount', 'Số tiền')}
                  </th>
                  <th scope="col" className="py-2.5 px-4">
                    {t('customer.history.status', 'Trạng thái')}
                  </th>
                  <th scope="col" className="py-2.5 px-4">
                    {t('customer.history.payment', 'Thanh toán')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {paginated.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {b.bookingNumber}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {dayjs(b.bookingDate).format('DD/MM/YYYY')}
                    </td>
                    <td className="py-3 px-4 font-semibold text-emerald-800">
                      {b.courtName}
                    </td>
                    <td className="py-3 px-4">
                      <span className="flex items-center gap-1 font-mono text-slate-700">
                        <Clock className="size-3 text-slate-400" />
                        {b.startTime} - {b.endTime}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      }).format(b.totalAmount)}
                    </td>
                    <td className="py-3 px-4">{statusBadge(b.bookingStatus)}</td>
                    <td className="py-3 px-4">{paymentBadge(b.paymentStatus)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-200 bg-slate-50/50 text-xs text-slate-500">
            <span>
              Trang {currentPage} / {totalPages} ({filteredBookings.length} lịch đặt)
            </span>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="h-7 px-2 text-xs bg-white"
              >
                <ChevronLeft className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="h-7 px-2 text-xs bg-white"
              >
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  },
);

BookingHistoryTable.displayName = 'BookingHistoryTable';
