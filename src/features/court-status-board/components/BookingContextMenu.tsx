import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  Eye,
  Edit,
  LogIn,
  LogOut,
  Receipt,
  Trash2,
} from 'lucide-react';
import type { BookingItem } from '../types/booking';

interface BookingContextMenuProps {
  booking: BookingItem;
  children: React.ReactNode;
  onViewDetails: (booking: BookingItem) => void;
  onEdit: (booking: BookingItem) => void;
  onCheckIn: (booking: BookingItem) => void;
  onCheckOut: (booking: BookingItem) => void;
  onCreateInvoice: (booking: BookingItem) => void;
  onCancel: (booking: BookingItem) => void;
}

export const BookingContextMenu: React.FC<BookingContextMenuProps> = memo(
  ({
    booking,
    children,
    onViewDetails,
    onEdit,
    onCheckIn,
    onCheckOut,
    onCreateInvoice,
    onCancel,
  }) => {
    const { t } = useTranslation();

    return (
      <ContextMenu>
        <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
        <ContextMenuContent className="w-52 rounded-xl p-1.5 shadow-xl border border-slate-200">
          <ContextMenuItem
            onClick={() => onViewDetails(booking)}
            className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold text-slate-800"
          >
            <Eye className="size-4 text-emerald-600" />
            <span>{t('courtStatus.actions.viewDetails', 'Xem chi tiết')}</span>
          </ContextMenuItem>

          <ContextMenuItem
            onClick={() => onEdit(booking)}
            className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold text-slate-800"
          >
            <Edit className="size-4 text-blue-600" />
            <span>{t('courtStatus.actions.editBooking', 'Chỉnh sửa lịch')}</span>
          </ContextMenuItem>

          <ContextMenuSeparator />

          <ContextMenuItem
            onClick={() => onCheckIn(booking)}
            disabled={booking.checkedIn}
            className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold text-slate-800 disabled:opacity-40"
          >
            <LogIn className="size-4 text-teal-600" />
            <span>{t('courtStatus.actions.checkIn', 'Check-in nhận sân')}</span>
          </ContextMenuItem>

          <ContextMenuItem
            onClick={() => onCheckOut(booking)}
            disabled={!booking.checkedIn || booking.checkedOut}
            className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold text-slate-800 disabled:opacity-40"
          >
            <LogOut className="size-4 text-amber-600" />
            <span>{t('courtStatus.actions.checkOut', 'Check-out trả sân')}</span>
          </ContextMenuItem>

          <ContextMenuSeparator />

          <ContextMenuItem
            onClick={() => onCreateInvoice(booking)}
            className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold text-slate-800"
          >
            <Receipt className="size-4 text-purple-600" />
            <span>{t('courtStatus.actions.createInvoice', 'Tạo hóa đơn')}</span>
          </ContextMenuItem>

          <ContextMenuSeparator />

          <ContextMenuItem
            variant="danger"
            onClick={() => onCancel(booking)}
            className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold text-red-600"
          >
            <Trash2 className="size-4 text-red-600" />
            <span>{t('courtStatus.actions.cancelBooking', 'Hủy lịch đặt')}</span>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
  },
);

BookingContextMenu.displayName = 'BookingContextMenu';
