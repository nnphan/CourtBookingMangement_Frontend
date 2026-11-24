import { http } from '@/lib/axios';
import type { ApiErrorResponse, ApiErrorShape, ApiResponse } from '@/types/api';
import type {
  ActivateStaffInvitationRequest,
  StaffInvitationValidationResponse,
  ValidateStaffInvitationRequest,
} from '../types/staff-invitation.types';

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

export const validateStaffInvitation = async (
  request: ValidateStaffInvitationRequest,
  signal?: AbortSignal,
): Promise<StaffInvitationValidationResponse> => {
  const { data: response } = await http.post<ApiResponse<StaffInvitationValidationResponse>>(
    '/auth/staff-invitations/validate',
    request,
    { signal },
  );
  if (!response.success) return fail(response);
  return response.data;
};

export const activateStaffInvitation = async (
  request: ActivateStaffInvitationRequest,
): Promise<void> => {
  const { data: response } = await http.post<ApiResponse<unknown>>(
    '/auth/staff-invitations/activate',
    request,
  );
  if (!response.success) fail(response);
};
