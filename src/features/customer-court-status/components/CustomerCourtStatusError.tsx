import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CustomerCourtStatusErrorProps {
  message?: string;
  onRetry: () => void;
}

export const CustomerCourtStatusError: React.FC<CustomerCourtStatusErrorProps> = ({
  message,
  onRetry,
}) => {
  return (
    <div
      role="alert"
      className="w-full flex-1 flex flex-col items-center justify-center p-8 text-center bg-white"
    >
      <div className="size-14 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mb-3 shadow-2xs">
        <AlertCircle className="size-7" />
      </div>
      <h3 className="font-bold text-slate-800 text-base">
        Không thể tải trạng thái sân.
      </h3>
      <p className="text-xs text-slate-500 mt-1 max-w-sm">
        {message || 'Đã xảy ra lỗi khi kết nối với máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.'}
      </p>
      <Button
        size="sm"
        onClick={onRetry}
        className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 cursor-pointer"
      >
        <RotateCcw className="size-3.5 mr-1.5" />
        Thử lại
      </Button>
    </div>
  );
};

export default CustomerCourtStatusError;
