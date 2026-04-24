import { useEffect, useRef, useState } from 'react';
import { loadGoogleMapsApi } from '../services/mapsService';
import { useTranslation } from '../hooks/useTranslation';
import styles from './PollingPlaceFinder.module.css';

export default function PollingPlaceFinder() {
  const mapRef = useRef(null);
  const { translate } = useTranslation();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initMap = async () => {
      try {
        await loadGoogleMapsApi();
        
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              };

              const map = new window.google.maps.Map(mapRef.current, {
                center: userLocation,
                zoom: 13,
              });

              new window.google.maps.Marker({
                position: userLocation,
                map: map,
                title: translate('Your Location'),
                icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
              });

              // Mock finding polling stations
              const request = {
                location: userLocation,
                radius: '5000',
                keyword: 'school OR library OR community center',
              };

              const service = new window.google.maps.places.PlacesService(map);
              service.nearbySearch(request, (results, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
                  results.slice(0, 5).forEach(place => {
                    const marker = new window.google.maps.Marker({
                      map,
                      position: place.geometry.location,
                      title: place.name,
                    });

                    const infoWindow = new window.google.maps.InfoWindow({
                      content: `<div><strong>${place.name}</strong><br>${place.vicinity}</div>`,
                    });

                    marker.addListener('click', () => {
                      infoWindow.open({
                        anchor: marker,
                        map,
                      });
                    });
                  });
                }
                setLoading(false);
              });
            },
            () => {
              setError(translate('Geolocation permission denied. Please enter address manually.'));
              setLoading(false);
            }
          );
        } else {
          setError(translate('Geolocation is not supported by your browser.'));
          setLoading(false);
        }
      } catch (err) {
        setError(translate('Failed to load Google Maps.'));
        setLoading(false);
      }
    };

    initMap();
  }, [translate]);

  return (
    <div className={styles.finderContainer}>
      <h2 className={styles.title}>{translate('Find Your Polling Place')}</h2>
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.mapContainer} ref={mapRef} aria-label={translate('Map showing polling places')}>
        {loading && <p className={styles.loading}>{translate('Loading map...')}</p>}
      </div>
      {error && (
        <div className={styles.fallbackInput}>
          <input type="text" placeholder={translate('Enter your address')} className={styles.addressInput} />
          <button className={styles.searchButton}>{translate('Search')}</button>
        </div>
      )}
    </div>
  );
}
