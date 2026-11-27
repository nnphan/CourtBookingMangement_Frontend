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
import { useBranchDetail } from '@/features/branches/api/useBranchDetail';
import { Button } from '@/components/ui/button';

const pricingLabels: Record<string, string> = {
  NORMAL: 'Thứ 2 – Thứ 6 · Giờ thường',
  PEAK: 'Thứ 2 – Thứ 6 · Giờ cao điểm',
  WEEKEND: 'Thứ 7 – Chủ nhật',
};
const priceFormat = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 });

export const CourtPriceModal: React.FC<{ branchId: string }> = memo(({ branchId }) => {
  const isPriceModalOpen = useCustomerCourtStatusStore((s) => s.isPriceModalOpen);
  const closePriceModal = useCustomerCourtStatusStore((s) => s.closePriceModal);
  const branch = useBranchDetail(isPriceModalOpen ? branchId : undefined);
  const pricings = branch.data?.isActive ? [...(branch.data.branchPricings ?? [])].sort(
    (first, second) => Number(first.pricingType === 'WEEKEND') - Number(second.pricingType === 'WEEKEND')
      || first.startTime.localeCompare(second.startTime),
  ) : [];

  return (
    <Dialog open={isPriceModalOpen} onOpenChange={(open) => !open && closePriceModal()}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg text-emerald-800">
            <Sparkles className="size-5 text-amber-500" />
            Thông Tin Sân &amp; Bảng Giá Dịch Vụ
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            {branch.data?.name ?? 'Bảng giá theo chi nhánh'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-sm text-slate-700">
          {/* Pricing Table */}
          {branch.isLoading ? (
            <p role="status">Đang tải bảng giá…</p>
          ) : branch.isError ? (
            <div role="alert" className="flex flex-wrap items-center justify-between gap-2">
              <span>Không tải được bảng giá chi nhánh.</span>
              <Button size="sm" variant="outline" onClick={() => void branch.refetch()}>Thử lại</Button>
            </div>
          ) : pricings.length === 0 ? (
            <p>{branchId ? 'Chi nhánh chưa có bảng giá đang áp dụng.' : 'Vui lòng chọn chi nhánh để xem bảng giá.'}</p>
          ) : (
            <div className="rounded-lg border border-slate-200 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-emerald-50/80 text-emerald-900 border-b border-emerald-100 font-semibold">
                  <tr>
                    <th scope="col" className="p-2.5">Khung giờ</th>
                    <th scope="col" className="p-2.5">Áp dụng</th>
                    <th scope="col" className="p-2.5">Giá sân</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pricings.map(({ pricingType, startTime, endTime, pricePerHour }) => (
                    <tr key={`${pricingType}:${startTime}:${endTime}:${pricePerHour}`} className="even:bg-slate-50/60">
                      <td className="p-2.5 font-medium whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock aria-hidden className={`size-3.5 shrink-0 ${pricingType === 'PEAK' ? 'text-amber-500' : 'text-slate-400'}`} />
                          {startTime.slice(0, 5)} – {endTime.slice(0, 5)}
                        </span>
                      </td>
                      <td className="p-2.5">{pricingLabels[pricingType] ?? pricingType}</td>
                      <td className={`p-2.5 font-semibold whitespace-nowrap ${pricingType === 'PEAK' ? 'text-amber-700' : 'text-emerald-700'}`}>
                        {priceFormat.format(pricePerHour)} đ/giờ
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

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
