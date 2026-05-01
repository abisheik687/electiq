import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock navigator.geolocation globally so PollingPlaceFinder tests don't timeout
Object.defineProperty(global.navigator, 'geolocation', {
  value: {
    getCurrentPosition: vi.fn((success) =>
      success({ coords: { latitude: 38.8951, longitude: -77.0364 } })
    ),
    watchPosition: vi.fn(),
    clearWatch: vi.fn()
  },
  writable: true
});
