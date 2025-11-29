
import { useEffect, useState, useRef } from 'react';
import { useWeather } from './useWeather';
import OfflineStorageService from '../utils/offlineStorage';

type Unit = 'metric' | 'imperial';

interface WeatherDataWithCache {
  current: any;
  daily: any;
  hourly: any[];
  alerts: any[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  isOffline: boolean;
  isCached: boolean;
}

export function useWeatherWithCache(
  latitude: number,
  longitude: number,
  unit: Unit,
  circuitSlug?: string,
  category?: string
): WeatherDataWithCache {
  const [cachedData, setCachedData] = useState<any>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [isCached, setIsCached] = useState(false);

  // Get live weather data
  const liveWeather = useWeather(latitude, longitude, unit);
  const liveWeatherRef = useRef(liveWeather);
  liveWeatherRef.current = liveWeather;

  // Load cached data on mount
  useEffect(() => {
    async function loadCache() {
      if (circuitSlug && category) {
        const cached = await OfflineStorageService.getCachedWeatherData(circuitSlug, category);
        if (cached) {
          setCachedData(cached);
          setIsCached(true);
          console.log('useWeatherWithCache: Loaded cached data for', circuitSlug);
        }
      }
    }
    loadCache();
  }, [circuitSlug, category]);

  // Cache live data when it updates
  useEffect(() => {
    async function cacheData() {
      if (
        !liveWeatherRef.current.loading &&
        !liveWeatherRef.current.error &&
        liveWeatherRef.current.current &&
        circuitSlug &&
        category
      ) {
        await OfflineStorageService.cacheWeatherData(circuitSlug, category, {
          current: liveWeatherRef.current.current,
          daily: liveWeatherRef.current.daily,
          hourly: liveWeatherRef.current.hourly,
          alerts: liveWeatherRef.current.alerts,
          timestamp: Date.now(),
          latitude,
          longitude,
          unit,
        });
        console.log('useWeatherWithCache: Cached live data for', circuitSlug);
      }
    }
    cacheData();
  }, [liveWeather.loading, liveWeather.error, liveWeather.current, circuitSlug, category, latitude, longitude, unit]);

  // Detect offline mode
  useEffect(() => {
    if (liveWeather.error === 'fetch_failed' && cachedData) {
      setIsOffline(true);
      console.log('useWeatherWithCache: Offline mode detected, using cached data');
    } else {
      setIsOffline(false);
    }
  }, [liveWeather.error, cachedData]);

  // Return live data if available, otherwise cached data
  if (isOffline && cachedData) {
    return {
      current: cachedData.current,
      daily: cachedData.daily,
      hourly: cachedData.hourly,
      alerts: cachedData.alerts,
      loading: false,
      error: null,
      lastUpdated: new Date(cachedData.timestamp),
      isOffline: true,
      isCached: true,
    };
  }

  return {
    ...liveWeather,
    isOffline: false,
    isCached: false,
  };
}
