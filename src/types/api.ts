export interface ApiEnvelope<T> {
  data: T;
  message?: string;
}

export interface ApiErrorShape {
  status: number;
  code: string;
  message: string;
  /** Server-side per-field messages, keyed by form field name. */
  fields?: Record<string, string>;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface PaginationMetadata {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
  metadata: PaginationMetadata | null;
  traceId: string;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  errorCode: string;
  message: string;
  traceId: string;
  timestamp: string;
  validationErrors: ValidationError[] | null;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
