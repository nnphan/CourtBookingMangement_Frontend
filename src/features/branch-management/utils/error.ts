/**
 * Safely extracts human-readable error messages from Axios / ApiErrorShape or standard Error
 */
export const extractErrorMessage = (err: unknown, fallback: string): string => {
  if (!err) return fallback;

  if (err instanceof Error && err.message) {
    return err.message;
  }

  if (typeof err === 'object') {
    const errorObj = err as Record<string, unknown>;
    if (typeof errorObj.message === 'string' && errorObj.message.trim().length > 0) {
      return errorObj.message;
    }
  }

  if (typeof err === 'string' && err.trim().length > 0) {
    return err;
  }

  return fallback;
};
