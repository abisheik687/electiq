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
  protected async fetchJson<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }
      const data = await response.json();
      return { data, success: true };
    } catch (error) {
      return { 
        data: null as any, 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown API error' 
      };
    }
  }
}
