import React from 'react';
import { CalendarX } from 'lucide-react';

interface CustomerCourtStatusEmptyProps {
  date?: string;
}

export const CustomerCourtStatusEmpty: React.FC<CustomerCourtStatusEmptyProps> = ({ date }) => {
  return (
    <div
      role="status"
      className="w-full flex-1 flex flex-col items-center justify-center p-10 text-center bg-white"
    >
      <div className="size-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 mb-4 shadow-2xs">
        <CalendarX className="size-8" />
      </div>
      <h3 className="font-bold text-slate-900 text-base">
        Không có sân khả dụng.
      </h3>
      <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-md leading-relaxed">
        {date
          ? `Hiện không có sân nào hoạt động vào ngày ${date}. Quý khách vui lòng chọn ngày khác hoặc chuyển sang chi nhánh khác.`
          : 'Không tìm thấy sân khả dụng cho chi nhánh đã chọn.'}
      </p>
    </div>
  );
};

export default CustomerCourtStatusEmpty;
