import React from 'react';
import { CalendarX } from 'lucide-react';

interface CustomerCourtStatusEmptyProps {
  date: string;
}

export const CustomerCourtStatusEmpty: React.FC<CustomerCourtStatusEmptyProps> = ({ date }) => {
  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center p-8 text-center bg-white">
      <div className="size-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
        <CalendarX className="size-7" />
      </div>
      <h3 className="font-semibold text-slate-800 text-sm">Không tìm thấy sân nào</h3>
      <p className="text-xs text-slate-500 mt-1 max-w-sm">
        Hiện tại chi nhánh này chưa có sân hoạt động vào ngày {date}. Quý khách vui lòng chọn ngày
        hoặc chi nhánh khác.
      </p>
    </div>
  );
};
