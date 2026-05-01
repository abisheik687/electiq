/**
 * @module services.BaseService
 * @description Abstract base class for all API and external service integrations.
 */

import { ApiResponse } from '../types/api.types';

export abstract class BaseService {
  /**
   * Helper to perform fetch requests with standardized error handling.
   * @param url The endpoint to fetch
   * @param options Fetch options
   * @returns A promise of the standardized API response
   */
  protected async request<T>(url: string, options?: RequestInit): Promise<T | null> {
    try {
      const response = await fetch(url, options);
      if (!response.ok) return null;
      return await response.json() as T;
    } catch {
      return null;
    }
  }
}
