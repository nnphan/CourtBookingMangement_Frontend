import { generateTraceId } from './mock-trace-id';
import type { ApiSuccessResponse, PaginationMetadata } from '@/types/api';

/**
 * Creates an ApiSuccessResponse following the common enterprise contract
 */
export function createSuccessResponse<T>(
  data: T,
  metadata?: PaginationMetadata | null,
  message = 'Request completed successfully.',
): ApiSuccessResponse<T> {
  return {
    success: true,
    message,
    data,
    metadata: metadata ?? null,
    traceId: generateTraceId(),
    timestamp: new Date().toISOString(),
  };
}
