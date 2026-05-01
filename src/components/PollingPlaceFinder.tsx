import { useEffect, useRef, useState } from 'react';
import { mapsService } from '../services/MapsService';
import { useTranslation } from '../hooks/useTranslation';
import DOMPurify from 'dompurify';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { CivicService } from '../services/CivicService';
import styles from './PollingPlaceFinder.module.css';

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

interface CivicLocation {
  address: {
    locationName: string;
    line1: string;
    city: string;
    state: string;
    zip: string;
  };
  pollingHours?: string;
  latitude?: number;
  longitude?: number;
  type?: string;
}

export default function PollingPlaceFinder() {
  const mapRef = useRef<HTMLDivElement>(null);
  const { translate } = useTranslation();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [locations, setLocations] = useState<CivicLocation[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const mapInstance = useRef<google.maps.Map | null>(null);
  const sessionToken = useRef<google.maps.places.AutocompleteSessionToken | null>(null);

  const markersRef = useRef<google.maps.Marker[]>([]);
  const clustererRef = useRef<MarkerClusterer | null>(null);

  const updateMapMarkers = (locationsData: CivicLocation[], query: string) => {
    if (!mapInstance.current) return;
    
    // Clear old markers
    if (clustererRef.current) {
      clustererRef.current.clearMarkers();
    } else {
      markersRef.current.forEach(m => m.setMap(null));
    }
    markersRef.current = [];

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: query }, (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
      if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
        mapInstance.current?.setCenter(results[0].geometry.location);
        
        let pendingGeocodes = 0;
        const checkAndCluster = () => {
          if (pendingGeocodes === 0) {
            if (clustererRef.current) {
              clustererRef.current.clearMarkers();
              clustererRef.current.addMarkers(markersRef.current);
            } else if (mapInstance.current) {
              clustererRef.current = new MarkerClusterer({ map: mapInstance.current, markers: markersRef.current });
            }
          }
        };

        locationsData.forEach((loc: CivicLocation) => {
          const locAddress = loc.address ? `${loc.address.line1}, ${loc.address.city}, ${loc.address.state} ${loc.address.zip}` : '';
          const createMarker = (position: google.maps.LatLng | google.maps.LatLngLiteral) => {
            const marker = new google.maps.Marker({ position, title: loc.address?.locationName });
            markersRef.current.push(marker);
          };
          
          if (loc.latitude && loc.longitude) {
            createMarker({ lat: loc.latitude, lng: loc.longitude });
          } else {
            pendingGeocodes++;
            geocoder.geocode({ address: locAddress }, (geoRes: google.maps.GeocoderResult[] | null, geoStatus: google.maps.GeocoderStatus) => {
              if (geoStatus === google.maps.GeocoderStatus.OK && geoRes && geoRes[0]) {
                createMarker(geoRes[0].geometry.location);
              }
              pendingGeocodes--;
              checkAndCluster();
            });
          }
        });
        
        checkAndCluster();
      }
    });
  };

  const handleSearch = async (addressToSearch?: string) => {
    const query = addressToSearch || searchQuery;
    if (!query) return;
    sessionToken.current = new google.maps.places.AutocompleteSessionToken();
    setLoading(true);
    setError('');

    const cacheKey = `civic_polling_${query}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      const { data, expiresAt } = JSON.parse(cached);
      if (Date.now() < expiresAt) {
        setLocations(data);
        updateMapMarkers(data, query);
        setLoading(false);
        return;
      }
    }

    try {
      const civicService = new CivicService();
      const voterInfo = await civicService.getVoterInfo(query);
      const allLocations = [
        ...(voterInfo.pollingLocations || []).map((l: CivicLocation) => ({ ...l, type: 'Polling Place' })),
        ...(voterInfo.earlyVoteSites || []).map((l: CivicLocation) => ({ ...l, type: 'Early Voting' })),
        ...(voterInfo.dropOffLocations || []).map((l: CivicLocation) => ({ ...l, type: 'Drop-off Box' }))
      ];
      sessionStorage.setItem(cacheKey, JSON.stringify({ data: allLocations, expiresAt: Date.now() + CACHE_TTL_MS }));
      setLocations(allLocations);
      updateMapMarkers(allLocations, query);
    } catch (err) {
      setError('Unable to find polling locations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const initMap = async () => {
      try {
        await mapsService.loadGoogleMapsApi();
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              if (!isMounted || !mapRef.current) return;
              const userLocation = { lat: position.coords.latitude, lng: position.coords.longitude };
              mapInstance.current = new google.maps.Map(mapRef.current, { center: userLocation, zoom: 13 });
              const geocoder = new google.maps.Geocoder();
              geocoder.geocode({ location: userLocation }, (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
                if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
                  const address = results[0].formatted_address;
                  if (address) {
                    setSearchQuery(address);
                    handleSearch(address);
                    sessionToken.current = new google.maps.places.AutocompleteSessionToken();
                  }
                }
              });
            },
            () => {
              if (!isMounted) return;
              setError(translate('Geolocation permission denied. Please enter address manually.'));
              setLoading(false);
            }
          );
        }
      } catch (err) {
        if (!isMounted) return;
        setError(translate('Failed to load Google Maps.'));
        setLoading(false);
      }
    };
    initMap();
    return () => {
      isMounted = false;
      // Note: controller.abort() was referencing an undefined controller, omitting.
    };
  }, [translate]);

  return (
    <div className={styles.finderContainer}>
      <h2 className={styles.title}>{translate('Find Your Polling Place')}</h2>
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.mapContainer} ref={mapRef} role="region" aria-label="Polling place map">
        {loading && <p className={styles.loading}>{translate('Loading map...')}</p>}
      </div>
      {error && (
        <div className={styles.fallbackInput}>
          <input type="text" placeholder={translate('Enter your address')} className={styles.addressInput} />
          <button className={styles.searchButton}>{translate('Search')}</button>
        </div>
      )}
      <ul style={{ position: 'absolute', width: '1px', height: '1px', padding: '0', margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', borderWidth: '0' }}>
        {locations.map((loc, idx) => (
          <li key={idx}>
            {loc.type}: {loc.address?.locationName}, {loc.address?.line1}, {loc.address?.city}, {loc.address?.state} {loc.address?.zip}. {loc.pollingHours ? `Hours: ${loc.pollingHours}` : ''}
          </li>
        ))}
      </ul>
    </div>
  );
}
