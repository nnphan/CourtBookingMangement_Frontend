export interface RegisterRequest {
  email: string;
  fullName: string;
  password: string;
  phoneNumber: string;
}

export interface RegisteredUser {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  isActive: boolean;
  isEmailVerified: boolean;
  roles: string[];
  permissions: string[];
}

export interface RegisterSuccessData {
  user: RegisteredUser;
}

export interface RegisterSuccessResponse {
  success: true;
  message: string;
  data: RegisterSuccessData;
  metadata: null;
  traceId: string;
  timestamp: string;
}

export interface RegisterErrorResponse {
  success: false;
  errorCode: string;
  message: string;
  traceId: string;
  timestamp: string;
  validationErrors: null | Record<string, string>[];
}
