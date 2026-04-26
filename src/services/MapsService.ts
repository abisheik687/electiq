/**
 * @module services.MapsService
 * @description Service for loading and interacting with Google Maps.
 */

import { BaseService } from './BaseService';

export class MapsService extends BaseService {
  private isLoaded = false;
  private loadPromise: Promise<void> | null = null;

  /**
   * Dynamically loads the Google Maps JavaScript API script.
   * @returns Resolves when loaded.
   */
  public loadGoogleMapsApi(): Promise<void> {
    if (this.isLoaded) return Promise.resolve();
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_MAPS_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.isLoaded = true;
        resolve();
      };
      script.onerror = (error) => reject(error);
      document.head.appendChild(script);
    });

    return this.loadPromise;
  }
}

export const mapsService = new MapsService();
