/**
 * @module services.CivicService
 * @description Service for interacting with Google Civic Information API.
 */

import { BaseService } from './BaseService';
import { CivicInfoResponse } from '../types/election.types';

export class CivicService extends BaseService {
  /**
   * Fetches polling locations and voter info based on the provided address.
   * @param address The voter's registered address.
   * @returns The Civic Info API response.
   */
  public async getVoterInfo(address: string): Promise<CivicInfoResponse> {
    const params = new URLSearchParams({
      address,
      key: import.meta.env.VITE_CIVIC_API_KEY || '',
      electionId: '2000' // Default to VIP Test Election if none specified
    });

    const response = await this.fetchJson<CivicInfoResponse>(`https://civicinfo.googleapis.com/civicinfo/v2/voterinfo?${params.toString()}`);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch civic information');
    }

    return response.data;
  }
}

export const civicService = new CivicService();
