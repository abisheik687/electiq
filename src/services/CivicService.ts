/**
 * @module services.CivicService
 * @description Service for interacting with Google Civic Information API.
 */

import { BaseService } from './BaseService';
import { VoterInfo } from '../types/models';

export class CivicService extends BaseService {
  private isValidAddress(address: string): boolean {
    // Must have at least a street + city/state component
    return address.trim().length > 10 && /\d/.test(address) && address.includes(',');
  }

  private async fetchWithBackoff(url: string, retries = 3): Promise<Response> {
    for (let attempt = 0; attempt < retries; attempt++) {
      const response = await fetch(url);
      if (response.status !== 429) return response;
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    throw new Error('Civic API quota exceeded after retries');
  }

  /**
   * Fetches polling locations and voter info based on the provided address.
   * @param address The voter's registered address.
   * @returns The Civic Info API response.
   */
  public async getVoterInfo(address: string): Promise<VoterInfo> {
    if (!this.isValidAddress(address)) {
      throw new Error('Please provide a full address including street number, city, and state');
    }

    const params = new URLSearchParams({
      address,
      key: import.meta.env.VITE_CIVIC_API_KEY || '',
      electionId: '2000' // Default to VIP Test Election if none specified
    });

    const response = await this.fetchWithBackoff(`https://civicinfo.googleapis.com/civicinfo/v2/voterinfo?${params.toString()}`);
    
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || 'Failed to fetch civic information');
    }

    const data = await response.json();
    return data as VoterInfo;
  }
}

export const civicService = new CivicService();
