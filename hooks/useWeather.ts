
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
    precipitation_unit: 'mm', // Always use mm from API, we'll convert for display
  };
}

// Enhanced precipitation conversion with higher precision
function convertPrecipitation(value: number, unit: Unit): number {
  if (!value || isNaN(value)) return 0;
  
  if (unit === 'imperial') {
    // Convert mm to inches with high precision
    const inches = value / 25.4;
    // Round to 3 decimal places for accuracy
    return Math.round(inches * 1000) / 1000;
  }
  
  // Round mm to 2 decimal places for metric
  return Math.round(value * 100) / 100;
}

// Get precipitation unit label
function getPrecipitationUnit(unit: Unit): string {
  return unit === 'metric' ? 'mm' : 'in';
}

// Enhanced data validation and sanitization
function validateAndSanitizeNumber(value: any, fallback: number = 0, min?: number, max?: number): number {
  let num = Number(value);
  
  if (isNaN(num) || !isFinite(num)) {
    console.log('useWeather: Invalid number detected, using fallback:', value, '→', fallback);
    num = fallback;
  }
  
  if (min !== undefined && num < min) {
    console.log('useWeather: Value below minimum, clamping:', num, '→', min);
    num = min;
  }
  
  if (max !== undefined && num > max) {
    console.log('useWeather: Value above maximum, clamping:', num, '→', max);
    num = max;
  }
  
  return num;
}

// Enhanced temperature validation
function validateTemperature(value: any, unit: Unit): number {
  const minTemp = unit === 'metric' ? -60 : -76; // Extreme cold limits
  const maxTemp = unit === 'metric' ? 60 : 140;  // Extreme heat limits
  return validateAndSanitizeNumber(value, 0, minTemp, maxTemp);
}

// Enhanced wind speed validation
function validateWindSpeed(value: any, unit: Unit): number {
  const maxWind = unit === 'metric' ? 300 : 186; // ~300 km/h = ~186 mph (extreme hurricane)
  return validateAndSanitizeNumber(value, 0, 0, maxWind);
}

// Enhanced humidity validation
function validateHumidity(value: any): number {
  return validateAndSanitizeNumber(value, 50, 0, 100);
}

// Enhanced precipitation validation
function validatePrecipitation(value: any): number {
  return validateAndSanitizeNumber(value, 0, 0, 500); // Max 500mm/hour (extreme rainfall)
}

// Enhanced pressure validation
function validatePressure(value: any): number {
  return validateAndSanitizeNumber(value, 1013, 870, 1085); // Realistic atmospheric pressure range
}

// Enhanced visibility validation
function validateVisibility(value: any): number {
  return validateAndSanitizeNumber(value, 10000, 0, 50000); // 0-50km visibility range
}

// Enhanced wind direction validation
function validateWindDirection(value: any): number {
  let direction = validateAndSanitizeNumber(value, 0, 0, 360);
  // Normalize to 0-360 range
  direction = direction % 360;
  if (direction < 0) direction += 360;
  return direction;
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
function analyzeWeatherAlerts(current: Current | null, hourly: HourlyData[], unit: Unit): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];
  
  if (!current || hourly.length === 0) return alerts;
  
  // High wind alert (including gusts)
  const maxWind = Math.max(current.wind_speed, current.wind_gusts);
  const windUnit = unit === 'metric' ? 'km/h' : 'mph';
  const windThreshold = unit === 'metric' ? 50 : 31; // 50 km/h = ~31 mph
  const severeWindThreshold = unit === 'metric' ? 70 : 43; // 70 km/h = ~43 mph
  
  if (maxWind > windThreshold) {
    alerts.push({
      title: 'High Wind Warning',
      description: `Strong winds of ${Math.round(current.wind_speed)} ${windUnit} with gusts up to ${Math.round(current.wind_gusts)} ${windUnit} detected. May affect vehicle handling and safety.`,
      severity: maxWind > severeWindThreshold ? 'severe' : 'moderate',
      start: new Date().toISOString(),
      end: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), // 3 hours
    });
  }
  
  // Rain alert for next 6 hours - convert precipitation for alert threshold
  const nextSixHours = hourly.slice(0, 6);
  const precipitationThreshold = unit === 'metric' ? 5 : 0.2; // 5mm = ~0.2 inches
  const heavyRainHours = nextSixHours.filter(h => convertPrecipitation(h.precipitation, unit) > precipitationThreshold).length;
  
  if (heavyRainHours > 2) {
    const precipUnit = getPrecipitationUnit(unit);
    alerts.push({
      title: 'Heavy Rain Expected',
      description: `Significant rainfall (>${precipitationThreshold}${precipUnit}/hour) expected in the next 6 hours. Track conditions may be severely affected.`,
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
  
  // Low visibility alert - convert visibility for imperial units
  const visibilityThreshold = unit === 'metric' ? 5000 : 3.1; // 5km = ~3.1 miles
  const severeVisibilityThreshold = unit === 'metric' ? 1000 : 0.6; // 1km = ~0.6 miles
  const visibilityValue = unit === 'metric' ? current.visibility : current.visibility / 1609.34; // Convert to miles
  const visibilityUnit = unit === 'metric' ? 'km' : 'miles';
  
  if (visibilityValue < visibilityThreshold) {
    const displayVisibility = unit === 'metric' ? Math.round(current.visibility / 1000) : Math.round(visibilityValue * 10) / 10;
    alerts.push({
      title: 'Low Visibility Warning',
      description: `Visibility reduced to ${displayVisibility}${visibilityUnit}. Driving conditions may be hazardous.`,
      severity: visibilityValue < severeVisibilityThreshold ? 'severe' : 'moderate',
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
        console.log('useWeather: Starting enhanced accurate fetch for', latitude, longitude, unit);
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

        console.log('useWeather: Fetching enhanced accurate data from API');
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

        // Enhanced current weather data with validation
        const cur = {
          temperature: validateTemperature(json?.current?.temperature_2m, unit),
          apparent_temperature: validateTemperature(json?.current?.apparent_temperature || json?.current?.temperature_2m, unit),
          wind_speed: validateWindSpeed(json?.current?.wind_speed_10m, unit),
          wind_direction: validateWindDirection(json?.current?.wind_direction_10m),
          wind_gusts: validateWindSpeed(json?.current?.wind_gusts_10m || json?.current?.wind_speed_10m, unit),
          humidity: validateHumidity(json?.current?.relative_humidity_2m),
          weather_code: validateAndSanitizeNumber(json?.current?.weather_code, 0, 0, 99),
          pressure: validatePressure(json?.current?.surface_pressure),
          visibility: validateVisibility(json?.current?.visibility),
          uv_index: validateAndSanitizeNumber(json?.current?.uv_index, 0, 0, 15),
          dew_point: validateTemperature(json?.current?.dew_point_2m, unit),
          cloud_cover: validateAndSanitizeNumber(json?.current?.cloud_cover, 0, 0, 100),
        } as Current;

        // Enhanced daily forecast data with validation and accurate precipitation conversion
        const days: DayInfo[] = (json?.daily?.time || []).map((t: string, idx: number) => ({
          date: t,
          weekday: weekdayFromDate(t),
          min: validateTemperature(json?.daily?.temperature_2m_min?.[idx], unit),
          max: validateTemperature(json?.daily?.temperature_2m_max?.[idx], unit),
          weather_code: validateAndSanitizeNumber(json?.daily?.weather_code?.[idx], 0, 0, 99),
          precipitation_probability: validateAndSanitizeNumber(json?.daily?.precipitation_probability_max?.[idx], 0, 0, 100),
          precipitation_sum: convertPrecipitation(validatePrecipitation(json?.daily?.precipitation_sum?.[idx]), unit),
          wind_speed_max: validateWindSpeed(json?.daily?.wind_speed_10m_max?.[idx], unit),
          wind_direction_dominant: validateWindDirection(json?.daily?.wind_direction_10m_dominant?.[idx]),
          wind_gusts_max: validateWindSpeed(json?.daily?.wind_gusts_10m_max?.[idx] || json?.daily?.wind_speed_10m_max?.[idx], unit),
          uv_index_max: validateAndSanitizeNumber(json?.daily?.uv_index_max?.[idx], 0, 0, 15),
          sunrise: json?.daily?.sunrise?.[idx] || '06:00',
          sunset: json?.daily?.sunset?.[idx] || '18:00',
        }));

        const d: Daily = {
          precipitation_probability_max: validateAndSanitizeNumber(json?.daily?.precipitation_probability_max?.[0], 0, 0, 100),
          days,
        };

        // Enhanced hourly data for the next 72 hours (3 days) with validation and accurate conversion
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
          temperature: validateTemperature(hourlyTemps[idx], unit),
          windSpeed: validateWindSpeed(hourlyWindSpeeds[idx], unit),
          windDirection: validateWindDirection(hourlyWindDirections[idx]),
          windGusts: validateWindSpeed(hourlyWindGusts[idx] || hourlyWindSpeeds[idx], unit),
          humidity: validateHumidity(hourlyHumidity[idx]),
          precipitation: convertPrecipitation(validatePrecipitation(hourlyPrecipitation[idx]), unit),
          precipitationProbability: validateAndSanitizeNumber(hourlyPrecipitationProb[idx], 0, 0, 100),
          weatherCode: validateAndSanitizeNumber(hourlyWeatherCodes[idx], 0, 0, 99),
          pressure: validatePressure(hourlyPressure[idx]),
          visibility: validateVisibility(hourlyVisibility[idx]),
          uvIndex: validateAndSanitizeNumber(hourlyUvIndex[idx], 0, 0, 15),
          dewPoint: validateTemperature(hourlyDewPoint[idx], unit),
          cloudCover: validateAndSanitizeNumber(hourlyCloudCover[idx], 0, 0, 100),
        }));

        // Analyze weather for alerts
        const weatherAlerts = analyzeWeatherAlerts(cur, hourlyData, unit);

        console.log('useWeather: Enhanced accurate data processed - current temp:', cur.temperature, 'daily days:', days.length, 'hourly points:', hourlyData.length, 'alerts:', weatherAlerts.length);
        console.log('useWeather: Precipitation unit for', unit, 'is', getPrecipitationUnit(unit));
        console.log('useWeather: Sample hourly precipitation values:', hourlyData.slice(0, 5).map(h => h.precipitation));

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
        console.log('useWeather: Successfully loaded enhanced accurate weather data');
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

// Export utility functions for use in components
export { convertPrecipitation, getPrecipitationUnit, validateTemperature, validateWindSpeed, validateHumidity, validatePrecipitation, validatePressure, validateWindDirection };
