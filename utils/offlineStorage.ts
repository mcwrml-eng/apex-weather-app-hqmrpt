
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CachedWeatherData {
  current: any;
  daily: any;
  hourly: any[];
  alerts: any[];
  timestamp: number;
  latitude: number;
  longitude: number;
  unit: string;
}

interface CachedCircuitData {
  circuitSlug: string;
  category: string;
  weatherData: CachedWeatherData;
  lastViewed: number;
}

const WEATHER_CACHE_PREFIX = '@weather_cache_';
const RECENT_CIRCUITS_KEY = '@recent_circuits';
const MAX_CACHED_CIRCUITS = 10;
const CACHE_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes

export class OfflineStorageService {
  private static instance: OfflineStorageService;

  private constructor() {
    console.log('OfflineStorageService: Initialized');
  }

  static getInstance(): OfflineStorageService {
    if (!OfflineStorageService.instance) {
      OfflineStorageService.instance = new OfflineStorageService();
    }
    return OfflineStorageService.instance;
  }

  // Cache weather data for a circuit
  async cacheWeatherData(
    circuitSlug: string,
    category: string,
    weatherData: CachedWeatherData
  ): Promise<void> {
    try {
      const cacheKey = `${WEATHER_CACHE_PREFIX}${circuitSlug}_${category}`;
      const cachedData: CachedCircuitData = {
        circuitSlug,
        category,
        weatherData: {
          ...weatherData,
          timestamp: Date.now(),
        },
        lastViewed: Date.now(),
      };

      await AsyncStorage.setItem(cacheKey, JSON.stringify(cachedData));
      await this.updateRecentCircuits(circuitSlug, category);
      
      console.log('OfflineStorageService: Cached weather data for', circuitSlug);
    } catch (error) {
      console.error('OfflineStorageService: Error caching weather data', error);
    }
  }

  // Get cached weather data for a circuit
  async getCachedWeatherData(
    circuitSlug: string,
    category: string
  ): Promise<CachedWeatherData | null> {
    try {
      const cacheKey = `${WEATHER_CACHE_PREFIX}${circuitSlug}_${category}`;
      const cached = await AsyncStorage.getItem(cacheKey);
      
      if (!cached) {
        console.log('OfflineStorageService: No cached data for', circuitSlug);
        return null;
      }

      const cachedData: CachedCircuitData = JSON.parse(cached);
      const age = Date.now() - cachedData.weatherData.timestamp;

      // Return cached data even if expired (for offline mode)
      // But mark it as stale
      console.log('OfflineStorageService: Retrieved cached data for', circuitSlug, 'age:', Math.round(age / 1000), 'seconds');
      
      return {
        ...cachedData.weatherData,
        isStale: age > CACHE_EXPIRY_MS,
      } as any;
    } catch (error) {
      console.error('OfflineStorageService: Error getting cached weather data', error);
      return null;
    }
  }

  // Check if cached data is available
  async hasCachedData(circuitSlug: string, category: string): Promise<boolean> {
    try {
      const cacheKey = `${WEATHER_CACHE_PREFIX}${circuitSlug}_${category}`;
      const cached = await AsyncStorage.getItem(cacheKey);
      return cached !== null;
    } catch (error) {
      console.error('OfflineStorageService: Error checking cached data', error);
      return false;
    }
  }

  // Update recent circuits list
  private async updateRecentCircuits(circuitSlug: string, category: string): Promise<void> {
    try {
      const recentStr = await AsyncStorage.getItem(RECENT_CIRCUITS_KEY);
      let recent: Array<{ slug: string; category: string; timestamp: number }> = [];
      
      if (recentStr) {
        recent = JSON.parse(recentStr);
      }

      // Remove existing entry if present
      recent = recent.filter(r => !(r.slug === circuitSlug && r.category === category));
      
      // Add to front
      recent.unshift({ slug: circuitSlug, category, timestamp: Date.now() });
      
      // Keep only MAX_CACHED_CIRCUITS
      recent = recent.slice(0, MAX_CACHED_CIRCUITS);
      
      await AsyncStorage.setItem(RECENT_CIRCUITS_KEY, JSON.stringify(recent));
    } catch (error) {
      console.error('OfflineStorageService: Error updating recent circuits', error);
    }
  }

  // Get recent circuits
  async getRecentCircuits(): Promise<Array<{ slug: string; category: string; timestamp: number }>> {
    try {
      const recentStr = await AsyncStorage.getItem(RECENT_CIRCUITS_KEY);
      if (recentStr) {
        return JSON.parse(recentStr);
      }
      return [];
    } catch (error) {
      console.error('OfflineStorageService: Error getting recent circuits', error);
      return [];
    }
  }

  // Clear old cache entries
  async clearOldCache(): Promise<void> {
    try {
      const recent = await this.getRecentCircuits();
      const allKeys = await AsyncStorage.getAllKeys();
      const weatherKeys = allKeys.filter(key => key.startsWith(WEATHER_CACHE_PREFIX));
      
      // Keep only recent circuits
      const recentKeys = recent.map(r => `${WEATHER_CACHE_PREFIX}${r.slug}_${r.category}`);
      const keysToRemove = weatherKeys.filter(key => !recentKeys.includes(key));
      
      if (keysToRemove.length > 0) {
        await AsyncStorage.multiRemove(keysToRemove);
        console.log('OfflineStorageService: Cleared', keysToRemove.length, 'old cache entries');
      }
    } catch (error) {
      console.error('OfflineStorageService: Error clearing old cache', error);
    }
  }

  // Clear all cached data
  async clearAllCache(): Promise<void> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const weatherKeys = allKeys.filter(key => key.startsWith(WEATHER_CACHE_PREFIX));
      
      if (weatherKeys.length > 0) {
        await AsyncStorage.multiRemove(weatherKeys);
        console.log('OfflineStorageService: Cleared all cache entries');
      }
      
      await AsyncStorage.removeItem(RECENT_CIRCUITS_KEY);
    } catch (error) {
      console.error('OfflineStorageService: Error clearing all cache', error);
    }
  }

  // Get cache statistics
  async getCacheStats(): Promise<{
    totalCached: number;
    totalSize: string;
    oldestCache: number | null;
    newestCache: number | null;
  }> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const weatherKeys = allKeys.filter(key => key.startsWith(WEATHER_CACHE_PREFIX));
      
      let totalSize = 0;
      let oldestTimestamp: number | null = null;
      let newestTimestamp: number | null = null;
      
      for (const key of weatherKeys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          totalSize += data.length;
          const parsed: CachedCircuitData = JSON.parse(data);
          const timestamp = parsed.weatherData.timestamp;
          
          if (oldestTimestamp === null || timestamp < oldestTimestamp) {
            oldestTimestamp = timestamp;
          }
          if (newestTimestamp === null || timestamp > newestTimestamp) {
            newestTimestamp = timestamp;
          }
        }
      }
      
      return {
        totalCached: weatherKeys.length,
        totalSize: `${(totalSize / 1024).toFixed(2)} KB`,
        oldestCache: oldestTimestamp,
        newestCache: newestTimestamp,
      };
    } catch (error) {
      console.error('OfflineStorageService: Error getting cache stats', error);
      return {
        totalCached: 0,
        totalSize: '0 KB',
        oldestCache: null,
        newestCache: null,
      };
    }
  }
}

export default OfflineStorageService.getInstance();
