import React, { memo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useCustomerCourtStatusStore } from '../store/customer-court-status.store';
import { Sparkles, Clock, ShieldCheck, PhoneCall } from 'lucide-react';
import { CUSTOMER_HOTLINE } from '../constants/customer-scheduler.config';

export const CourtPriceModal: React.FC = memo(() => {
  const isPriceModalOpen = useCustomerCourtStatusStore((s) => s.isPriceModalOpen);
  const closePriceModal = useCustomerCourtStatusStore((s) => s.closePriceModal);

  return (
    <Dialog open={isPriceModalOpen} onOpenChange={(open) => !open && closePriceModal()}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg text-emerald-800">
            <Sparkles className="size-5 text-amber-500" />
            Thông Tin Sân &amp; Bảng Giá Dịch Vụ
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Hệ thống sân cầu lông tiêu chuẩn thi đấu quốc tế - TMT Badminton Club
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-sm text-slate-700">
          {/* Pricing Table */}
          <div className="rounded-lg border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-emerald-50/80 text-emerald-900 border-b border-emerald-100 font-semibold">
                <tr>
                  <th className="p-2.5">Khung giờ</th>
                  <th className="p-2.5">Thứ 2 - Thứ 6</th>
                  <th className="p-2.5">Thứ 7 - CN &amp; Lễ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-2.5 font-medium flex items-center gap-1.5">
                    <Clock className="size-3.5 text-slate-400" />
                    05:00 - 17:00 (Giờ sáng/chiều)
                  </td>
                  <td className="p-2.5 font-semibold text-emerald-700">80.000 đ/giờ</td>
                  <td className="p-2.5 font-semibold text-emerald-700">110.000 đ/giờ</td>
                </tr>
                <tr className="bg-slate-50/60">
                  <td className="p-2.5 font-medium flex items-center gap-1.5">
                    <Clock className="size-3.5 text-amber-500" />
                    17:00 - 24:00 (Giờ vàng)
                  </td>
                  <td className="p-2.5 font-semibold text-amber-600">120.000 đ/giờ</td>
                  <td className="p-2.5 font-semibold text-amber-600">140.000 đ/giờ</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium">Lịch cố định (tháng)</td>
                  <td colSpan={2} className="p-2.5 text-slate-600 italic">
                    Ưu đãi giảm 10% - 15% khi thanh toán theo tháng
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Court Features */}
          <div className="space-y-2">
            <h4 className="font-semibold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-emerald-600" />
              Tiêu chuẩn kỹ thuật sân bãi
            </h4>
            <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4">
              <li>Thảm vân cát 5.0mm chống trơn trượt đạt chuẩn BWF.</li>
              <li>Hệ thống đèn LED chống lóa chuyên dụng, độ sáng 500+ Lux.</li>
              <li>Khoảng cách an toàn giữa các sân rộng rãi &gt; 1.5m.</li>
              <li>Phòng tắm nước nóng, khu vực thay đồ và máy lạnh sảnh chờ miễn phí.</li>
            </ul>
          </div>

          {/* Contact box */}
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-lg p-3 flex items-start gap-2.5 text-xs text-amber-900">
            <PhoneCall className="size-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Đặt lịch cố định hoặc tổ chức giải:</span>
              <p className="mt-0.5 text-amber-800">
                Vui lòng liên hệ trực tiếp quản lý sân qua hotline{' '}
                <a href={`tel:${CUSTOMER_HOTLINE.PHONE_1}`} className="font-bold underline">
                  {CUSTOMER_HOTLINE.PHONE_1}
                </a>{' '}
                hoặc{' '}
                <a href={`tel:${CUSTOMER_HOTLINE.PHONE_2}`} className="font-bold underline">
                  {CUSTOMER_HOTLINE.PHONE_2}
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

CourtPriceModal.displayName = 'CourtPriceModal';
