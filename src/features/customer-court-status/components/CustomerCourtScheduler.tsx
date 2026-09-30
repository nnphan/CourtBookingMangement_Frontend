import React, { memo, useMemo } from 'react';
import type { CustomerCourt } from '../types/customer-court';
import type { CustomerSlotItem } from '../types/customer-slot';
import { CustomerCourtStatusService } from '../services/customer-court-status.service';
import { CUSTOMER_SCHEDULER_CONFIG, SLOT_WIDTH } from '../constants/customer-scheduler.config';
import { CustomerTimeHeader } from './CustomerTimeHeader';
import { CustomerCourtRow } from './CustomerCourtRow';
import { CustomerAvailabilityLayer } from './CustomerAvailabilityLayer';
import { useCustomerSchedulerSelection } from '../hooks/useCustomerSchedulerSelection';

interface CustomerCourtSchedulerProps {
  courts: CustomerCourt[];
  slots: CustomerSlotItem[];
  slotInterval: number;
  zoomLevel: number;
}

export const CustomerCourtScheduler: React.FC<CustomerCourtSchedulerProps> = memo(
  ({ courts, slots, slotInterval, zoomLevel }) => {
    // Dynamic slot width derived from single source of truth SLOT_WIDTH = 80
    const slotWidth = useMemo(() => {
      const computed = Math.round(SLOT_WIDTH * zoomLevel);
      return Math.max(
        CUSTOMER_SCHEDULER_CONFIG.MIN_SLOT_WIDTH,
        Math.min(CUSTOMER_SCHEDULER_CONFIG.MAX_SLOT_WIDTH, computed),
      );
    }, [zoomLevel]);

    // Generate time slots
    const timeSlots = useMemo(
      () =>
        CustomerCourtStatusService.generateTimeSlots(
          CUSTOMER_SCHEDULER_CONFIG.START_TIME,
          CUSTOMER_SCHEDULER_CONFIG.END_TIME,
          slotInterval,
        ),
      [slotInterval],
    );

    const totalGridWidth = useMemo(() => timeSlots.length * slotWidth, [timeSlots.length, slotWidth]);

    // Selection management hook
    const {
      activeSelection,
      handleSlotClick,
      isSlotSelected,
      clearSelection,
      handleBookCurrentSelection,
    } = useCustomerSchedulerSelection({ courts, slots, slotInterval });

    return (
      <div className="relative w-full h-full flex flex-col overflow-hidden bg-white select-none">
        {/* Horizontal & Vertical Scroll Container */}
        <div className="flex-1 overflow-auto relative">
          <div
            style={{
              width: `${CUSTOMER_SCHEDULER_CONFIG.COURT_COL_WIDTH + totalGridWidth + 24}px`,
              minWidth: '100%',
            }}
          >
            {/* Sticky Time Header */}
            <CustomerTimeHeader timeSlots={timeSlots} slotWidth={slotWidth} />

            {/* Court Rows */}
            <div className="flex flex-col">
              {courts.map((court) => (
                <CustomerCourtRow
                  key={court.courtId}
                  court={court}
                  slots={slots}
                  timeSlots={timeSlots}
                  slotWidth={slotWidth}
                  slotInterval={slotInterval}
                  activeSelection={activeSelection}
                  onSlotClick={handleSlotClick}
                  onClearSelection={clearSelection}
                  isSlotSelected={isSlotSelected}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Floating selection action layer */}
        <CustomerAvailabilityLayer
          activeSelection={activeSelection}
          onClearSelection={clearSelection}
          onConfirmSelection={handleBookCurrentSelection}
        />
      </div>
    );
  },
);

CustomerCourtScheduler.displayName = 'CustomerCourtScheduler';
