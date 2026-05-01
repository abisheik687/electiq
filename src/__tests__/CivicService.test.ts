import { describe, it, expect, vi } from 'vitest';
import { CivicService } from '../services/CivicService';

describe('CivicService', () => {
  it('validates address format before API call', async () => {
    const service = new CivicService();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    global.fetch = vi.fn();
    await expect(service.getVoterInfo('bad')).rejects.toThrow();
    
    // Should not call fetch for invalid address
    expect(global.fetch).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('combines pollingLocations, earlyVoteSites, dropOffLocations', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        pollingLocations: [{ address: { locationName: 'School' } }],
        earlyVoteSites: [{ address: { locationName: 'Library' } }],
        dropOffLocations: [{ address: { locationName: 'City Hall' } }]
      })
    } as Response);

    const service = new CivicService();
    const result = await service.getVoterInfo('123 Main St, Springfield, IL');
    const allLocations = [
      ...(result.pollingLocations || []),
      ...(result.earlyVoteSites || []),
      ...(result.dropOffLocations || [])
    ];
    expect(allLocations).toHaveLength(3);
  });

  it('handles 429 quota exceeded gracefully', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => ({ error: { message: 'Quota exceeded' } })
    } as Response);

    const service = new CivicService();
    await expect(service.getVoterInfo('123 Main St, Springfield, IL'))
      .rejects.toThrow();
  });
});
