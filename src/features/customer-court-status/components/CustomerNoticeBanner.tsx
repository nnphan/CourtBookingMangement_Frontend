import React, { memo } from 'react';
import { CUSTOMER_HOTLINE } from '../constants/customer-scheduler.config';

export const CustomerNoticeBanner: React.FC = memo(() => {
  return (
    <div className="w-full bg-[#fcf8e3] border-b border-[#faebcc] px-4 py-1.5 text-center text-xs text-slate-700">
      <span className="font-bold text-[#b97a29] mr-1">Lưu ý:</span>
      <span>
        Nếu bạn cần đặt lịch cố định vui lòng liên hệ:{' '}
        <a
          href={`tel:${CUSTOMER_HOTLINE.PHONE_1}`}
          className="font-semibold text-slate-900 hover:text-emerald-700 underline"
        >
          {CUSTOMER_HOTLINE.PHONE_1}
        </a>{' '}
        hoặc{' '}
        <a
          href={`tel:${CUSTOMER_HOTLINE.PHONE_2}`}
          className="font-semibold text-slate-900 hover:text-emerald-700 underline"
        >
          {CUSTOMER_HOTLINE.PHONE_2}
        </a>{' '}
        để được hỗ trợ
      </span>
    </div>
  );
});

CustomerNoticeBanner.displayName = 'CustomerNoticeBanner';
