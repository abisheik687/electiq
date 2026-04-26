/**
 * @module election.types
 * @description Type definitions for Election and Polling Data.
 */

export interface PollingPlace {
  id: string;
  name: string;
  address: string;
  pollingHours: string;
  location: {
    lat: number;
    lng: number;
  };
}

export interface ElectionOfficial {
  name: string;
  title: string;
  phones: string[];
  emails: string[];
}

export interface CivicInfoResponse {
  pollingLocations?: PollingPlace[];
  officials?: ElectionOfficial[];
}
