import { courtStatusApi } from '@/features/court-status/api/court-status.api';
import type { CourtStatusDto } from '@/features/court-status/types/court-status.types';
import type { CustomerBranch } from '../types/customer-court';
import type { CustomerCourtStatusData } from '../types/customer-slot';
import { branchApi } from '@/features/branches/api/branch.api';

export const customerCourtStatusApi = {
  /**
   * Fetch all active branches from GET /branches
   */
  async getBranches(): Promise<CustomerBranch[]> {
    const res = await branchApi.getBranches({ pageSize: 50, isActive: true });
    return (res.branches || []).map((b) => ({
      id: b.id,
      branchCode: b.district || '',
      branchName: b.name,
      address: b.address,
      openTime: b.operatingHours?.[0]?.openTime || '05:00:00',
      closeTime: b.operatingHours?.[0]?.closeTime || '23:00:00',
      rating: 4.8,
      isActive: b.isActive,
    }));
  },

  /**
   * Get court status matrix from real GET /api/court-status
   */
  async getCourtStatusRaw(branchId: string, date: string): Promise<CourtStatusDto> {
    return courtStatusApi.getCourtStatus({ branchId, date });
  },

  /**
   * Legacy adapter for backward compatibility with existing customer components
   */
  async getCourtStatus(branchId: string, date: string): Promise<CustomerCourtStatusData> {
    const data = await courtStatusApi.getCourtStatus({ branchId, date });
    return {
      branchId: data.branchId,
      branchName: data.branchName,
      bookingDate: data.date,
      courts: (data.courts || []).map((c) => ({
        courtId: c.courtId,
        courtName: c.courtName,
      })),
      slots: [],
    };
  },
};
