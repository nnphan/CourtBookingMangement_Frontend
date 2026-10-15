import { http } from '@/lib/axios';
import type { CourtStatusRequest, CourtStatusDto } from '../types/court-status.types';

export interface ApiResponseEnvelope<T> {
  success?: boolean;
  message?: string;
  data: T;
}

export const courtStatusApi = {
  /**
   * Fetch court status from GET /api/court-status
   * Accepts CourtStatusRequest: branchId and date (YYYY-MM-DD)
   */
  async getCourtStatus(params: CourtStatusRequest): Promise<CourtStatusDto> {
    const { branchId, date } = params;

    const response = await http.get<ApiResponseEnvelope<CourtStatusDto> | CourtStatusDto>(
      '/api/court-status',
      {
        params: {
          BranchId: branchId,
          Date: date,
          branchId,
          date,
        },
      },
    );

    const raw = response.data;
    if (raw && typeof raw === 'object' && 'data' in raw && raw.data) {
      return raw.data as CourtStatusDto;
    }
    return raw as CourtStatusDto;
  },
};

export const getCourtStatus = courtStatusApi.getCourtStatus;
