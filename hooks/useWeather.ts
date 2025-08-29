
import { useEffect, useMemo, useState } from 'react';

type Unit = 'metric' | 'imperial';

interface Current {
  temperature: number;
  apparent_temperature: number;
  wind_speed: number;
  wind_direction: number;
  wind_gusts: number;
  humidity: number;
  weather_code: number;
  pressure: number;
  visibility: number;
  uv_index: number;
  dew_point: number;
  cloud_cover: number;
}

interface DayInfo {
  date: string;
  weekday: string;
  min: number;
  max: number;
  weather_code: number;
  precipitation_probability: number;
  precipitation_sum: number;
  wind_speed_max: number;
  wind_direction_dominant: number;
  wind_gusts_max: number;
  uv_index_max: number;
  sunrise: string;
  sunset: string;
}

interface HourlyData {
  time: string;
  temperature: number;
  windSpeed: number;
  windDirection: number;
  windGusts: number;
  humidity: number;
  precipitation: number;
  weatherCode: number;
  pressure: number;
  visibility: number;
  uvIndex: number;
  dewPoint: number;
  cloudCover: number;
  precipitationProbability: number;
}

interface Daily {
  precipitation_probability_max?: number;
  days: DayInfo[];
}

interface WeatherAlert {
  title: string;
  description: string;
  severity: 'minor' | 'moderate' | 'severe' | 'extreme';
  start: string;
  end: string;
}

interface WeatherData {
  current: Current | null;
  daily: Daily | null;
  hourly: HourlyData[];
  alerts: WeatherAlert[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

function weekdayFromDate(date: string) {
  const d = new Date(date);
  return d.toLocaleDateString(undefined, { weekday: 'short' });
}

function toUnitParams(unit: Unit) {
  return {
    temperature_unit: unit === 'metric' ? 'celsius' : 'fahrenheit',
    wind_speed_unit: unit === 'metric' ? 'kmh' : 'mph',
    precipitation_unit: 'mm',
  };
}

// Calculate sunrise and sunset times for better day/night detection
function getSunTimes(latitude: number, longitude: number, date: Date) {
  // Simplified sunrise/sunset calculation
  // For production, consider using a proper astronomy library
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  const p = Math.asin(0.39795 * Math.cos(0.98563 * (dayOfYear - 173) * Math.PI / 180));
  const argument = (Math.sin(0.8333 * Math.PI / 180) + Math.sin(latitude * Math.PI / 180) * Math.sin(p)) / (Math.cos(latitude * Math.PI / 180) * Math.cos(p));
  
  if (Math.abs(argument) > 1) {
    // Polar day or night
    return { sunrise: '06:00', sunset: '18:00' };
  }
  
  const hourAngle = Math.acos(argument) * 180 / Math.PI / 15;
  const sunrise = 12 - hourAngle - longitude / 15;
  const sunset = 12 + hourAngle - longitude / 15;
  
  const formatTime = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };
  
  return {
    sunrise: formatTime(sunrise),
    sunset: formatTime(sunset)
  };
}

// Analyze weather conditions for potential racing alerts
function analyzeWeatherAlerts(current: Current | null, hourly: HourlyData[]): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];
  
  if (!current || hourly.length === 0) return alerts;
  
  // High wind alert (including gusts)
  const maxWind = Math.max(current.wind_speed, current.wind_gusts);
  if (maxWind > 50) { // 50+ km/h or mph depending on unit
    alerts.push({
      title: 'High Wind Warning',
      description: `Strong winds of ${Math.round(current.wind_speed)} with gusts up to ${Math.round(current.wind_gusts)} detected. May affect vehicle handling and safety.`,
      severity: maxWind > 70 ? 'severe' : 'moderate',
      start: new Date().toISOString(),
      end: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), // 3 hours
    });
  }
  
  // Rain alert for next 6 hours
  const nextSixHours = hourly.slice(0, 6);
  const heavyRainHours = nextSixHours.filter(h => h.precipitation > 5).length;
  if (heavyRainHours > 2) {
    alerts.push({
      title: 'Heavy Rain Expected',
      description: `Significant rainfall expected in the next 6 hours. Track conditions may be severely affected.`,
      severity: 'severe',
      start: new Date().toISOString(),
      end: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    });
  }
  
  // Thunderstorm alert
  const thunderstormCodes = [95, 96, 99];
  if (thunderstormCodes.includes(current.weather_code)) {
    alerts.push({
      title: 'Thunderstorm Alert',
      description: 'Thunderstorm conditions detected. Racing activities may be suspended for safety.',
      severity: 'extreme',
      start: new Date().toISOString(),
      end: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    });
  }
  
  // Low visibility alert
  if (current.visibility < 5000) { // Less than 5km visibility
    alerts.push({
      title: 'Low Visibility Warning',
      description: `Visibility reduced to ${Math.round(current.visibility / 1000)}km. Driving conditions may be hazardous.`,
      severity: current.visibility < 1000 ? 'severe' : 'moderate',
      start: new Date().toISOString(),
      end: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    });
  }
  
  return alerts;
}

const cache: Record<string, { ts: number; data: WeatherData }> = {};

export function useWeather(latitude: number, longitude: number, unit: Unit): WeatherData {
  const [current, setCurrent] = useState<Current | null>(null);
  const [daily, setDaily] = useState<Daily | null>(null);
  const [hourly, setHourly] = useState<HourlyData[]>([]);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setErr] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const key = useMemo(() => `${latitude},${longitude},${unit}`, [latitude, longitude, unit]);

  useEffect(() => {
    let cancelled = false;
    
    async function run() {
      try {
        console.log('useWeather: Starting enhanced fetch for', latitude, longitude, unit);
        setLoading(true);
        setErr(null);

        const cached = cache[key];
        if (cached && Date.now() - cached.ts < 10 * 60 * 1000) { // 10 minute cache
          console.log('useWeather: Using cached data for', key);
          setCurrent(cached.data.current);
          setDaily(cached.data.daily);
          setHourly(cached.data.hourly);
          setAlerts(cached.data.alerts);
          setLastUpdated(cached.data.lastUpdated);
          setLoading(false);
          return;
        }

        const unitParams = toUnitParams(unit);
        const url =
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
          `&current=temperature_2m,apparent_temperature,wind_speed_10m,wind_direction_10m,wind_gusts_10m,relative_humidity_2m,weather_code,surface_pressure,visibility,uv_index,dew_point_2m,cloud_cover` +
          `&hourly=temperature_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m,relative_humidity_2m,precipitation,precipitation_probability,weather_code,surface_pressure,visibility,uv_index,dew_point_2m,cloud_cover` +
          `&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max,precipitation_sum,wind_speed_10m_max,wind_direction_10m_dominant,wind_gusts_10m_max,uv_index_max,sunrise,sunset` +
          `&timezone=auto&forecast_days=7&forecast_hours=168` + // 7 days of hourly data
          `&temperature_unit=${unitParams.temperature_unit}&wind_speed_unit=${unitParams.wind_speed_unit}&precipitation_unit=${unitParams.precipitation_unit}`;

        console.log('useWeather: Fetching enhanced data from API');
        const res = await fetch(url);
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        
        const json = await res.json();
        console.log('useWeather: Enhanced API response received', Object.keys(json));

        if (cancelled) {
          console.log('useWeather: Request cancelled');
          return;
        }

        // Enhanced current weather data
        const cur = {
          temperature: json?.current?.temperature_2m ?? 0,
          apparent_temperature: json?.current?.apparent_temperature ?? json?.current?.temperature_2m ?? 0,
          wind_speed: json?.current?.wind_speed_10m ?? 0,
          wind_direction: json?.current?.wind_direction_10m ?? 0,
          wind_gusts: json?.current?.wind_gusts_10m ?? json?.current?.wind_speed_10m ?? 0,
          humidity: json?.current?.relative_humidity_2m ?? 0,
          weather_code: json?.current?.weather_code ?? 0,
          pressure: json?.current?.surface_pressure ?? 1013,
          visibility: json?.current?.visibility ?? 10000,
          uv_index: json?.current?.uv_index ?? 0,
          dew_point: json?.current?.dew_point_2m ?? 0,
          cloud_cover: json?.current?.cloud_cover ?? 0,
        } as Current;

        // Enhanced daily forecast data
        const days: DayInfo[] = (json?.daily?.time || []).map((t: string, idx: number) => ({
          date: t,
          weekday: weekdayFromDate(t),
          min: json?.daily?.temperature_2m_min?.[idx] ?? 0,
          max: json?.daily?.temperature_2m_max?.[idx] ?? 0,
          weather_code: json?.daily?.weather_code?.[idx] ?? 0,
          precipitation_probability: json?.daily?.precipitation_probability_max?.[idx] ?? 0,
          precipitation_sum: json?.daily?.precipitation_sum?.[idx] ?? 0,
          wind_speed_max: json?.daily?.wind_speed_10m_max?.[idx] ?? 0,
          wind_direction_dominant: json?.daily?.wind_direction_10m_dominant?.[idx] ?? 0,
          wind_gusts_max: json?.daily?.wind_gusts_10m_max?.[idx] ?? json?.daily?.wind_speed_10m_max?.[idx] ?? 0,
          uv_index_max: json?.daily?.uv_index_max?.[idx] ?? 0,
          sunrise: json?.daily?.sunrise?.[idx] ?? '06:00',
          sunset: json?.daily?.sunset?.[idx] ?? '18:00',
        }));

        const d: Daily = {
          precipitation_probability_max: json?.daily?.precipitation_probability_max?.[0],
          days,
        };

        // Enhanced hourly data for the next 72 hours (3 days)
        const hourlyTimes = json?.hourly?.time || [];
        const hourlyTemps = json?.hourly?.temperature_2m || [];
        const hourlyWindSpeeds = json?.hourly?.wind_speed_10m || [];
        const hourlyWindDirections = json?.hourly?.wind_direction_10m || [];
        const hourlyWindGusts = json?.hourly?.wind_gusts_10m || [];
        const hourlyHumidity = json?.hourly?.relative_humidity_2m || [];
        const hourlyPrecipitation = json?.hourly?.precipitation || [];
        const hourlyPrecipitationProb = json?.hourly?.precipitation_probability || [];
        const hourlyWeatherCodes = json?.hourly?.weather_code || [];
        const hourlyPressure = json?.hourly?.surface_pressure || [];
        const hourlyVisibility = json?.hourly?.visibility || [];
        const hourlyUvIndex = json?.hourly?.uv_index || [];
        const hourlyDewPoint = json?.hourly?.dew_point_2m || [];
        const hourlyCloudCover = json?.hourly?.cloud_cover || [];

        const hourlyData: HourlyData[] = hourlyTimes.slice(0, 72).map((time: string, idx: number) => ({
          time,
          temperature: hourlyTemps[idx] ?? 0,
          windSpeed: hourlyWindSpeeds[idx] ?? 0,
          windDirection: hourlyWindDirections[idx] ?? 0,
          windGusts: hourlyWindGusts[idx] ?? hourlyWindSpeeds[idx] ?? 0,
          humidity: hourlyHumidity[idx] ?? 0,
          precipitation: hourlyPrecipitation[idx] ?? 0,
          precipitationProbability: hourlyPrecipitationProb[idx] ?? 0,
          weatherCode: hourlyWeatherCodes[idx] ?? 0,
          pressure: hourlyPressure[idx] ?? 1013,
          visibility: hourlyVisibility[idx] ?? 10000,
          uvIndex: hourlyUvIndex[idx] ?? 0,
          dewPoint: hourlyDewPoint[idx] ?? 0,
          cloudCover: hourlyCloudCover[idx] ?? 0,
        }));

        // Analyze weather for alerts
        const weatherAlerts = analyzeWeatherAlerts(cur, hourlyData);

        console.log('useWeather: Enhanced data processed - current temp:', cur.temperature, 'daily days:', days.length, 'hourly points:', hourlyData.length, 'alerts:', weatherAlerts.length);

        const now = new Date();
        setCurrent(cur);
        setDaily(d);
        setHourly(hourlyData);
        setAlerts(weatherAlerts);
        setLastUpdated(now);
        
        const weatherData: WeatherData = {
          current: cur,
          daily: d,
          hourly: hourlyData,
          alerts: weatherAlerts,
          loading: false,
          error: null,
          lastUpdated: now,
        };
        
        cache[key] = { ts: Date.now(), data: weatherData };
        setLoading(false);
        console.log('useWeather: Successfully loaded enhanced weather data');
      } catch (e: any) {
        console.log('useWeather: Error fetching enhanced weather:', e?.message || e);
        setErr('fetch_failed');
        setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [latitude, longitude, unit, key]);

  return { current, daily, hourly, alerts, loading, error, lastUpdated };
}
