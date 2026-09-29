import { request } from '@/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { CustomerBranch } from '../types/customer-court';
import type {
  CustomerCourtStatusData,
  CustomerCourtAvailableSlotsData,
  CustomerCreateBookingPayload,
  CustomerCreateBookingResult,
} from '../types/customer-slot';
import {
  MOCK_CUSTOMER_BRANCHES,
  getMockCustomerCourtStatus,
  getMockAvailableSlots,
  createMockCustomerBooking,
} from '../mocks/customer-court-status.mock';

export const customerCourtStatusApi = {
  /**
   * Fetch all branches
   */
  async getBranches(): Promise<CustomerBranch[]> {
    try {
      const response = await request<ApiSuccessResponse<CustomerBranch[]>>({
        url: '/api/branches',
        method: 'GET',
      });
      if (response && response.success && response.data) {
        return response.data;
      }
      return MOCK_CUSTOMER_BRANCHES;
    } catch {
      return MOCK_CUSTOMER_BRANCHES;
    }
  },

  /**
   * Get customer court status matrix
   */
  async getCourtStatus(
    branchId: string,
    date: string,
  ): Promise<CustomerCourtStatusData> {
    try {
      const response = await request<ApiSuccessResponse<CustomerCourtStatusData>>({
        url: '/api/customer/court-status',
        method: 'GET',
        params: { branchId, date },
      });
      if (response && response.success && response.data) {
        return response.data;
      }
      return getMockCustomerCourtStatus(branchId, date).data;
    } catch {
      return getMockCustomerCourtStatus(branchId, date).data;
    }
  },

  /**
   * Get available slots for a specific court
   */
  async getAvailableSlots(
    courtId: string,
    date: string,
  ): Promise<CustomerCourtAvailableSlotsData> {
    try {
      const response = await request<ApiSuccessResponse<CustomerCourtAvailableSlotsData>>({
        url: '/api/customer/available-slots',
        method: 'GET',
        params: { courtId, date },
      });
      if (response && response.success && response.data) {
        return response.data;
      }
      return getMockAvailableSlots(courtId, date).data;
    } catch {
      return getMockAvailableSlots(courtId, date).data;
    }
  },

  /**
   * Create a customer court booking
   */
  async createBooking(
    payload: CustomerCreateBookingPayload,
  ): Promise<CustomerCreateBookingResult> {
    try {
      const response = await request<ApiSuccessResponse<CustomerCreateBookingResult>>({
        url: '/api/customer/bookings',
        method: 'POST',
        data: payload,
      });
      if (response && response.success && response.data) {
        return response.data;
      }
      return createMockCustomerBooking(payload).data;
    } catch {
      return createMockCustomerBooking(payload).data;
    }
  },
};
