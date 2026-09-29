import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { CustomerCourtStatusType } from '../types/customer-status';
import { CUSTOMER_COURT_STATUS } from '../types/customer-status';

interface AvailableSlotTooltipProps {
  status: CustomerCourtStatusType;
  courtName: string;
  timeRange: string;
  children: React.ReactNode;
}

export const AvailableSlotTooltip: React.FC<AvailableSlotTooltipProps> = ({
  status,
  courtName,
  timeRange,
  children,
}) => {
  const config = CUSTOMER_COURT_STATUS[status];

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side="top" className="text-xs max-w-xs shadow-md z-50">
          <div className="font-semibold text-slate-900">
            {courtName} ({timeRange})
          </div>
          <div className="text-slate-600 mt-0.5">{config.tooltip}</div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
