/**
 * @fileoverview Service for loading and interacting with Google Maps.
 */

let isLoaded = false;
let loadPromise = null;

/**
 * Dynamically loads the Google Maps JavaScript API script.
 * @returns {Promise<void>} Resolves when loaded.
 */
export const loadGoogleMapsApi = () => {
  if (isLoaded) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_MAPS_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      isLoaded = true;
      resolve();
    };
    script.onerror = (error) => reject(error);
    document.head.appendChild(script);
  });

  return loadPromise;
};
