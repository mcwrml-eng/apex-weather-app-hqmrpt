
import { useEffect, useMemo, useState } from 'react';

type Unit = 'metric' | 'imperial';

interface Current {
  temperature: number;
  apparent_temperature: number;
  wind_speed: number;
  humidity: number;
}

interface DayInfo {
  date: string;
  weekday: string;
  min: number;
  max: number;
}

interface Daily {
  precipitation_probability_max?: number;
  days: DayInfo[];
}

function weekdayFromDate(date: string) {
  const d = new Date(date);
  return d.toLocaleDateString(undefined, { weekday: 'short' });
}

function toUnitParams(unit: Unit) {
  return {
    temperature_unit: unit === 'metric' ? 'celsius' : 'fahrenheit',
    wind_speed_unit: unit === 'metric' ? 'kmh' : 'mph',
  };
}

const cache: Record<string, { ts: number; data: { current: Current; daily: Daily } }> = {};

export function useWeather(latitude: number, longitude: number, unit: Unit) {
  const [current, setCurrent] = useState<Current | null>(null);
  const [daily, setDaily] = useState<Daily | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setErr] = useState<string | null>(null);

  const key = useMemo(() => `${latitude},${longitude},${unit}`, [latitude, longitude, unit]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        setLoading(true);
        setErr(null);

        const cached = cache[key];
        if (cached && Date.now() - cached.ts < 5 * 60 * 1000) {
          setCurrent(cached.data.current);
          setDaily(cached.data.daily);
          setLoading(false);
          return;
        }

        const unitParams = toUnitParams(unit);
        const url =
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
          `&current=temperature_2m,apparent_temperature,wind_speed_10m,relative_humidity_2m,weather_code` +
          `&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
          `&timezone=auto&forecast_days=7` +
          `&temperature_unit=${unitParams.temperature_unit}&wind_speed_unit=${unitParams.wind_speed_unit}`;

        console.log('Fetching weather', url);
        const res = await fetch(url);
        const json = await res.json();

        if (cancelled) return;

        const cur = {
          temperature: json?.current?.temperature_2m ?? 0,
          apparent_temperature: json?.current?.apparent_temperature ?? json?.current?.temperature_2m ?? 0,
          wind_speed: json?.current?.wind_speed_10m ?? 0,
          humidity: json?.current?.relative_humidity_2m ?? 0,
        } as Current;

        const days: DayInfo[] = (json?.daily?.time || []).map((t: string, idx: number) => ({
          date: t,
          weekday: weekdayFromDate(t),
          min: json?.daily?.temperature_2m_min?.[idx] ?? 0,
          max: json?.daily?.temperature_2m_max?.[idx] ?? 0,
        }));

        const d: Daily = {
          precipitation_probability_max: json?.daily?.precipitation_probability_max?.[0],
          days,
        };

        setCurrent(cur);
        setDaily(d);
        cache[key] = { ts: Date.now(), data: { current: cur, daily: d } };
        setLoading(false);
      } catch (e: any) {
        console.log('Weather fetch failed', e?.message || e);
        setErr('fetch_failed');
        setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [key]);

  return { current, daily, loading, error: error };
}
