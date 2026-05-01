/**
 * @module services.MapsService
 * @description Service for loading and interacting with Google Maps.
 */

import { BaseService } from './BaseService';
import { Loader } from '@googlemaps/js-api-loader';

export class MapsService extends BaseService {
  private loader: Loader;
  private loadPromise: Promise<void> | null = null;

  constructor() {
    super();
    this.loader = new Loader({
      apiKey: import.meta.env.VITE_MAPS_KEY,
      version: 'weekly',
      libraries: ['places']
    });
  }

  /**
   * Dynamically loads the Google Maps JavaScript API script.
   * @returns Resolves when loaded.
   */
  public loadGoogleMapsApi(): Promise<void> {
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = this.loader.load().then(() => {});
    return this.loadPromise;
  }
}

export const mapsService = new MapsService();
