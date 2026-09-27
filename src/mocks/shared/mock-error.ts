import { generateTraceId } from './mock-trace-id';
import type { ApiErrorResponse, ValidationError } from '@/types/api';

/**
 * Creates an ApiErrorResponse following the common enterprise contract
 */
export function createErrorResponse(
  errorCode: string,
  message: string,
  validationErrors?: ValidationError[],
): ApiErrorResponse {
  return {
    success: false,
    errorCode,
    message,
    traceId: generateTraceId(),
    timestamp: new Date().toISOString(),
    validationErrors: validationErrors ?? null,
  };
}
