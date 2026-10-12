import { http } from '@/lib/axios';
import type { CourtStatusResponse } from '@/types/court-status';

export interface ApiResponseWrapper<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const courtStatusService = {
  /**
   * Fetch court status, courts, and schedule items for a specific branch and date
   * GET /api/court-status?BranchId={branchId}&Date={date}
   */
  getCourtStatus: async (branchId: string, date: string): Promise<CourtStatusResponse> => {
    const response = await http.get<ApiResponseWrapper<CourtStatusResponse>>('/api/court-status', {
      params: {
        BranchId: branchId,
        Date: date,
        branchId,
        date,
      },
    });

    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data &&
      response.data.data
    ) {
      return response.data.data;
    }
    return response.data as unknown as CourtStatusResponse;
  },
};

export const getCourtStatus = courtStatusService.getCourtStatus;
export default courtStatusService;
