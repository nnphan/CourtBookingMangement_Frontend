import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CustomerCourtStatusErrorProps {
  message?: string;
  onRetry: () => void;
}

export const CustomerCourtStatusError: React.FC<CustomerCourtStatusErrorProps> = ({
  message = 'Không thể tải thông tin trạng thái sân. Vui lòng thử lại.',
  onRetry,
}) => {
  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center p-8 text-center bg-white">
      <div className="size-14 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mb-3">
        <AlertCircle className="size-7" />
      </div>
      <h3 className="font-semibold text-slate-800 text-sm">Đã có lỗi xảy ra</h3>
      <p className="text-xs text-slate-500 mt-1 max-w-sm">{message}</p>
      <Button
        size="sm"
        onClick={onRetry}
        className="mt-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs"
      >
        <RotateCcw className="size-3.5 mr-1.5" />
        Thử lại
      </Button>
    </div>
  );
};
