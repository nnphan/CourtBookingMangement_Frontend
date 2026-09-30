import React from 'react';
import { CalendarX } from 'lucide-react';

interface CustomerCourtStatusEmptyProps {
  date: string;
}

export const CustomerCourtStatusEmpty: React.FC<CustomerCourtStatusEmptyProps> = ({ date }) => {
  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center p-10 text-center bg-white">
      <div className="size-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-4 shadow-2xs">
        <CalendarX className="size-8" />
      </div>
      <h3 className="font-bold text-slate-900 text-base">Không tìm thấy sân hoạt động</h3>
      <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-md leading-relaxed">
        Hiện tại chi nhánh này chưa có lịch sân hoạt động vào ngày <strong>{date}</strong>. Quý khách
        vui lòng chọn ngày khác hoặc chuyển sang chi nhánh lân cận.
      </p>
    </div>
  );
};

