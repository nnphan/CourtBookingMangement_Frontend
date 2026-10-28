import { courtStatusApi, type ApiResponseEnvelope } from '@/features/court-status/api/court-status.api';
import type { CourtStatusDto } from '@/features/court-status/types/court-status.types';
import { http } from '@/lib/axios';
import type { CustomerBranch } from '../types/customer-court';
import type { CustomerCourtStatusData } from '../types/customer-slot';
import type { CourtStatusV2Data } from '../types/court-status-v2';
import { branchApi } from '@/features/branches/api/branch.api';

export interface GetCourtStatusV2Params {
  branchId: string;
  date: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const hasStringFields = (value: Record<string, unknown>, fields: string[]): boolean =>
  fields.every((field) => typeof value[field] === 'string');

const isCourt = (value: unknown): boolean =>
  isRecord(value) &&
  hasStringFields(value, ['courtId', 'courtName', 'status']) &&
  typeof value.courtNumber === 'number';

const isScheduleItem = (value: unknown): boolean =>
  isRecord(value) &&
  hasStringFields(value, [
    'bookingDetailId',
    'bookingId',
    'bookingCode',
    'courtId',
    'courtName',
    'bookingDate',
    'startTime',
    'endTime',
    'bookingType',
    'bookingStatus',
    'bookingDetailStatus',
    'paymentStatus',
    'customerName',
    'phoneNumber',
  ]) &&
  typeof value.courtNumber === 'number' &&
  typeof value.bookingCourtCount === 'number' &&
  (value.title === undefined || value.title === null || typeof value.title === 'string') &&
  (value.displayLabel === undefined ||
    value.displayLabel === null ||
    typeof value.displayLabel === 'string') &&
  (value.displayStatus === undefined ||
    value.displayStatus === null ||
    typeof value.displayStatus === 'string');

const isCourtStatusV2Data = (value: unknown): value is CourtStatusV2Data => {
  if (!isRecord(value) || !isRecord(value.summary)) return false;
  const summary = value.summary;
  return (
    typeof value.branchId === 'string' &&
    typeof value.branchName === 'string' &&
    typeof value.date === 'string' &&
    typeof value.timezone === 'string' &&
    typeof value.isClosed === 'boolean' &&
    (typeof value.openTime === 'string' || value.openTime === null) &&
    (typeof value.closeTime === 'string' || value.closeTime === null) &&
    [
      'totalCourts',
      'activeCourts',
      'unavailableCourts',
      'totalScheduleItems',
      'totalBookings',
      'occupiedCourtCount',
    ].every((key) => typeof summary[key] === 'number') &&
    ((Array.isArray(value.courts) && value.courts.every(isCourt)) || value.courts === null) &&
    ((Array.isArray(value.scheduleItems) && value.scheduleItems.every(isScheduleItem)) ||
      value.scheduleItems === null)
  );
};

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

  async getCourtStatusV2(
    params: GetCourtStatusV2Params,
    signal?: AbortSignal,
  ): Promise<CourtStatusV2Data> {
    const response = await http.get<ApiResponseEnvelope<unknown>>('/api/court-status-v2', {
      params: {
        BranchId: params.branchId,
        Date: params.date,
      },
      signal,
    });
    if (response.data?.success === false) {
      throw new Error('Court Status V2 request was unsuccessful.');
    }
    if (!isCourtStatusV2Data(response.data?.data)) {
      throw new Error('Invalid Court Status V2 response.');
    }
    return response.data.data;
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
