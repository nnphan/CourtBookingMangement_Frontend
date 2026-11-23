import { http } from '@/lib/axios';
import type { ApiErrorResponse, ApiErrorShape, ApiResponse } from '@/types/api';
import type {
  CreateStaffRequest,
  CreateStaffResponse,
  StaffDetail,
  StaffListItem,
  StaffListParams,
  StaffListResult,
  StaffOwnedBranch,
} from '../types/staff.types';

const fail = (response: ApiErrorResponse): never => {
  const error: ApiErrorShape = {
    status: 0,
    code: response.errorCode,
    message: response.message,
    traceId: response.traceId,
    fields: response.validationErrors?.reduce<Record<string, string>>((fields, field) => {
      fields[field.field] = field.message;
      return fields;
    }, {}),
  };
  throw error;
};

export const getStaffList = async (params: StaffListParams): Promise<StaffListResult> => {
  const { data: response } = await http.get<ApiResponse<StaffListItem[]>>('/branch-owner/staff', {
    params,
  });
  if (!response.success) return fail(response);
  if (!response.metadata) throw new Error('Staff list response is missing pagination metadata.');
  return { data: response.data, metadata: response.metadata };
};

export const getStaffDetail = async (userId: string): Promise<StaffDetail> => {
  const { data: response } = await http.get<ApiResponse<StaffDetail>>(
    `/branch-owner/staff/${encodeURIComponent(userId)}`,
  );
  if (!response.success) return fail(response);
  return response.data;
};

export const getStaffBranches = async (): Promise<StaffOwnedBranch[]> => {
  const { data: response } = await http.get<ApiResponse<StaffOwnedBranch[]>>(
    '/branch-owner/staff/branches',
  );
  if (!response.success) return fail(response);
  return response.data;
};

export const createStaff = async (request: CreateStaffRequest): Promise<CreateStaffResponse> => {
  const { data: response } = await http.post<ApiResponse<CreateStaffResponse>>(
    '/branch-owner/staff',
    request,
  );
  if (!response.success) return fail(response);
  return response.data;
};

export const resendStaffActivation = async (userId: string): Promise<CreateStaffResponse> => {
  const { data: response } = await http.post<ApiResponse<CreateStaffResponse>>(
    `/branch-owner/staff/${encodeURIComponent(userId)}/send-activation`,
  );
  if (!response.success) return fail(response);
  return response.data;
};
