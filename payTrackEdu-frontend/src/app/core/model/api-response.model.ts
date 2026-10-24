/**
 * Standard response envelope returned by the backend.
 *
 * `T` is the endpoint-specific payload contained in `data`.
 */
export type ApiResponse<T> = {
  data: T;
  success: boolean;
  timestamp: string;
};
