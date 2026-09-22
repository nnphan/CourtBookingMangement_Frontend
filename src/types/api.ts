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
