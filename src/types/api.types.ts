/**
 * @module api.types
 * @description Type definitions for API requests and responses.
 */

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  status: number;
}
