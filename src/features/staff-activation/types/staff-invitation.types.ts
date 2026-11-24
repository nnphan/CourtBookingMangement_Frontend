export interface ValidateStaffInvitationRequest {
  token: string;
  email: string;
}

export interface StaffInvitationValidationResponse {
  valid: boolean;
  displayName: string;
  branchNames: string[];
  expiresAt: string;
}

export interface ActivateStaffInvitationRequest extends ValidateStaffInvitationRequest {
  password: string;
  confirmPassword: string;
}
