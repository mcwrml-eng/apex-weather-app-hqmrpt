
import React, { useMemo, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { colors, buttonStyles } from '../../styles/commonStyles';
import { getCircuitBySlug } from '../../data/circuits';
import { useWeather } from '../../hooks/useWeather';
import ChartDoughnut from '../../components/ChartDoughnut';
import WindBarGraphs from '../../components/WindBarGraphs';
import WindRadarGraph from '../../components/WindRadarGraph';
import WeatherChart from '../../components/WeatherChart';
import WeatherSymbol from '../../components/WeatherSymbol';
import EnhancedWeatherForecast from '../../components/EnhancedWeatherForecast';
import WeatherTextForecast from '../../components/WeatherTextForecast';
import WeatherAlerts from '../../components/WeatherAlerts';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import Icon from '../../components/Icon';
import Button from '../../components/Button';
import { useUnit } from '../../state/UnitContext';

function DetailScreen() {
  const params = useLocalSearchParams<{ slug?: string; category?: 'f1' | 'motogp' | 'indycar' }>();
  const slug = params.slug as string;
  const category = (params.category as 'f1' | 'motogp' | 'indycar') || 'f1';

  const circuit = getCircuitBySlug(slug, category);
  const { unit, toggleUnit } = useUnit();

  const { current, daily, hourly, alerts, loading, error, lastUpdated } = useWeather(circuit.latitude, circuit.longitude, unit);

  const settingsRef = useRef<BottomSheet>(null);
  const chartsRef = useRef<BottomSheet>(null);
  const forecastRef = useRef<BottomSheet>(null);
  const settingsSnap = useMemo(() => ['32%', '60%'], []);
  const chartsSnap = useMemo(() => ['50%', '90%'], []);
  const forecastSnap = useMemo(() => ['60%', '95%'], []);
  const openSettings = useCallback(() => settingsRef.current?.expand(), []);
  const openCharts = useCallback(() => chartsRef.current?.expand(), []);
  const openForecast = useCallback(() => forecastRef.current?.expand(), []);

  // Convert hourly data for charts
  const chartData = useMemo(() => {
    return hourly.map(h => ({
      time: h.time,
      temperature: h.temperature,
      windSpeed: h.windSpeed,
      humidity: h.humidity,
      precipitation: h.precipitation,
    }));
  }, [hourly]);

  // Convert hourly data for wind graphs - now includes wind gusts
  const windData = useMemo(() => {
    return hourly.map(h => ({
      time: h.time,
      windSpeed: h.windSpeed,
      windDirection: h.windDirection,
      windGusts: h.windGusts,
    }));
  }, [hourly]);

  // Get 72-hour forecast data (3 days)
  const forecast72Hours = useMemo(() => {
    return hourly.slice(0, 72);
  }, [hourly]);

  // Get today's sunrise and sunset times
  const todaySunTimes = useMemo(() => {
    if (!daily?.days || daily.days.length === 0) return null;
    console.log('DetailScreen: Today sun times raw data:', daily.days[0]);
    return {
      sunrise: daily.days[0].sunrise,
      sunset: daily.days[0].sunset,
    };
  }, [daily]);

  // Enhanced time parsing function
  const parseTimeString = useCallback((timeStr: string): number => {
    console.log('DetailScreen: Parsing time string:', timeStr);
    
    if (!timeStr) {
      console.log('DetailScreen: Empty time string, returning 0');
      return 0;
    }

    // Handle different time formats
    let cleanTimeStr = timeStr.trim();
    
    // If it's an ISO datetime string, extract just the time part
    if (cleanTimeStr.includes('T')) {
      const timePart = cleanTimeStr.split('T')[1];
      if (timePart) {
        cleanTimeStr = timePart.split('.')[0]; // Remove milliseconds if present
        cleanTimeStr = cleanTimeStr.split('+')[0]; // Remove timezone if present
        cleanTimeStr = cleanTimeStr.split('Z')[0]; // Remove Z if present
      }
    }
    
    // Now parse HH:MM or HH:MM:SS format
    const timeParts = cleanTimeStr.split(':');
    if (timeParts.length >= 2) {
      const hours = parseInt(timeParts[0], 10) || 0;
      const minutes = parseInt(timeParts[1], 10) || 0;
      const totalMinutes = hours * 60 + minutes;
      console.log('DetailScreen: Parsed time', cleanTimeStr, 'to', totalMinutes, 'minutes');
      return totalMinutes;
    }
    
    console.log('DetailScreen: Could not parse time string:', timeStr);
    return 0;
  }, []);

  // Calculate daylight duration with enhanced error handling
  const daylightDuration = useMemo(() => {
    if (!todaySunTimes) {
      console.log('DetailScreen: No sun times available for daylight calculation');
      return null;
    }
    
    console.log('DetailScreen: Calculating daylight duration with sunrise:', todaySunTimes.sunrise, 'sunset:', todaySunTimes.sunset);
    
    const sunriseMinutes = parseTimeString(todaySunTimes.sunrise);
    const sunsetMinutes = parseTimeString(todaySunTimes.sunset);
    
    if (sunriseMinutes === 0 && sunsetMinutes === 0) {
      console.log('DetailScreen: Both sunrise and sunset parsed to 0, returning null');
      return null;
    }
    
    let durationMinutes = sunsetMinutes - sunriseMinutes;
    
    // Handle case where sunset is next day (rare but possible in polar regions)
    if (durationMinutes < 0) {
      durationMinutes += 24 * 60; // Add 24 hours
    }
    
    // Sanity check - daylight should be between 0 and 24 hours
    if (durationMinutes < 0 || durationMinutes > 24 * 60) {
      console.log('DetailScreen: Invalid daylight duration calculated:', durationMinutes, 'minutes');
      return null;
    }
    
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    
    const result = `${hours}h ${minutes}m`;
    console.log('DetailScreen: Calculated daylight duration:', result);
    return result;
  }, [todaySunTimes, parseTimeString]);

  // Get current time status (day/night) with enhanced parsing
  const currentTimeStatus = useMemo(() => {
    if (!todaySunTimes) return 'unknown';
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const sunriseMinutes = parseTimeString(todaySunTimes.sunrise);
    const sunsetMinutes = parseTimeString(todaySunTimes.sunset);
    
    if (sunriseMinutes === 0 && sunsetMinutes === 0) return 'unknown';
    
    if (currentTime < sunriseMinutes) return 'night';
    if (currentTime > sunsetMinutes) return 'night';
    return 'day';
  }, [todaySunTimes, parseTimeString]);

  // Format time for display
  const formatTimeForDisplay = useCallback((timeStr: string): string => {
    if (!timeStr) return '--:--';
    
    // If it's an ISO datetime string, extract just the time part
    let cleanTimeStr = timeStr.trim();
    if (cleanTimeStr.includes('T')) {
      const timePart = cleanTimeStr.split('T')[1];
      if (timePart) {
        cleanTimeStr = timePart.split('.')[0]; // Remove milliseconds if present
        cleanTimeStr = cleanTimeStr.split('+')[0]; // Remove timezone if present
        cleanTimeStr = cleanTimeStr.split('Z')[0]; // Remove Z if present
      }
    }
    
    // Extract HH:MM from HH:MM:SS if needed
    const timeParts = cleanTimeStr.split(':');
    if (timeParts.length >= 2) {
      return `${timeParts[0]}:${timeParts[1]}`;
    }
    
    return timeStr; // Return original if we can't parse it
  }, []);

  // Get weather condition description
  const getWeatherDescription = (code: number): string => {
    const descriptions: { [key: number]: string } = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Fog',
      48: 'Depositing rime fog',
      51: 'Light drizzle',
      53: 'Moderate drizzle',
      55: 'Dense drizzle',
      61: 'Slight rain',
      63: 'Moderate rain',
      65: 'Heavy rain',
      71: 'Slight snow',
      73: 'Moderate snow',
      75: 'Heavy snow',
      80: 'Slight rain showers',
      81: 'Moderate rain showers',
      82: 'Violent rain showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with hail',
      99: 'Thunderstorm with heavy hail',
    };
    return descriptions[code] || 'Unknown conditions';
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.8}
        >
          <Icon name="chevron-back" size={22} color="#fff" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{circuit.name}</Text>
        <Text style={styles.subtitle}>{circuit.country} • {category.toUpperCase()}</Text>

        <View style={styles.actions}>
          <TouchableOpacity onPress={openForecast} style={styles.actionBtn} activeOpacity={0.8}>
            <Icon name="time-outline" size={22} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={openCharts} style={styles.actionBtn} activeOpacity={0.8}>
            <Icon name="analytics-outline" size={22} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={openSettings} style={styles.actionBtn} activeOpacity={0.8}>
            <Icon name="settings-outline" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loading && <Text style={styles.muted}>Loading enhanced weather data…</Text>}
        {error && <Text style={styles.error}>Failed to load weather data. Please try again.</Text>}

        {/* Weather Alerts */}
        {!loading && alerts && alerts.length > 0 && (
          <WeatherAlerts alerts={alerts} />
        )}

        {/* Last Updated Info */}
        {!loading && lastUpdated && (
          <View style={styles.updateInfo}>
            <Icon name="refresh" size={14} color={colors.textMuted} />
            <Text style={styles.updateText}>
              Updated {lastUpdated.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
            </Text>
          </View>
        )}

        {/* SUNRISE & SUNSET TIMES */}
        {!loading && todaySunTimes && (
          <View style={styles.sunTimesCard}>
            <View style={styles.sunTimesHeader}>
              <Icon name="sunny" size={20} color={colors.warning} />
              <Text style={styles.sunTimesTitle}>Sunrise & Sunset</Text>
              <View style={[styles.timeStatusBadge, { 
                backgroundColor: currentTimeStatus === 'day' ? colors.warning + '20' : colors.primary + '20' 
              }]}>
                <Text style={[styles.timeStatusText, { 
                  color: currentTimeStatus === 'day' ? colors.warning : colors.primary 
                }]}>
                  {currentTimeStatus === 'day' ? 'Daylight' : currentTimeStatus === 'night' ? 'Night' : 'Unknown'}
                </Text>
              </View>
            </View>
            
            <View style={styles.sunTimesGrid}>
              <View style={styles.sunTimeItem}>
                <View style={styles.sunTimeIconContainer}>
                  <Icon name="arrow-up" size={16} color={colors.warning} />
                </View>
                <Text style={styles.sunTimeLabel}>Sunrise</Text>
                <Text style={styles.sunTimeValue}>{formatTimeForDisplay(todaySunTimes.sunrise)}</Text>
              </View>
              
              <View style={styles.sunTimeItem}>
                <View style={styles.sunTimeIconContainer}>
                  <Icon name="arrow-down" size={16} color={colors.primary} />
                </View>
                <Text style={styles.sunTimeLabel}>Sunset</Text>
                <Text style={styles.sunTimeValue}>{formatTimeForDisplay(todaySunTimes.sunset)}</Text>
              </View>
              
              <View style={styles.sunTimeItem}>
                <View style={styles.sunTimeIconContainer}>
                  <Icon name="time" size={16} color={colors.text} />
                </View>
                <Text style={styles.sunTimeLabel}>Daylight</Text>
                <Text style={styles.sunTimeValue}>{daylightDuration || '--h --m'}</Text>
              </View>
            </View>

            {/* Weekly Sunrise/Sunset Preview */}
            <View style={styles.weeklySunTimes}>
              <Text style={styles.weeklySunTimesTitle}>This Week</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.weeklySunTimesScroll}>
                {daily?.days.slice(0, 7).map((day, index) => (
                  <View key={day.date} style={[styles.weeklySunTimeCard, index === 0 && styles.weeklySunTimeCardToday]}>
                    <Text style={[styles.weeklySunTimeDay, index === 0 && styles.weeklySunTimeDayToday]}>
                      {index === 0 ? 'Today' : day.weekday}
                    </Text>
                    <View style={styles.weeklySunTimeValues}>
                      <View style={styles.weeklySunTimeRow}>
                        <Icon name="arrow-up" size={12} color={colors.warning} />
                        <Text style={styles.weeklySunTimeText}>{formatTimeForDisplay(day.sunrise)}</Text>
                      </View>
                      <View style={styles.weeklySunTimeRow}>
                        <Icon name="arrow-down" size={12} color={colors.primary} />
                        <Text style={styles.weeklySunTimeText}>{formatTimeForDisplay(day.sunset)}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        )}

        {/* WEATHER FORECASTS AND CURRENT CONDITIONS */}
        
        {/* Next 12 Hours Forecast - Moved above text forecast */}
        {!loading && forecast72Hours.length > 0 && (
          <View style={styles.next12HoursCard}>
            <View style={styles.next12HoursHeader}>
              <Icon name="time" size={20} color={colors.primary} />
              <Text style={styles.next12HoursTitle}>Next 12 Hours</Text>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.next12HoursScroll}
            >
              {forecast72Hours.slice(0, 12).map((hour, index) => (
                <View key={hour.time} style={styles.next12HourCard}>
                  <Text style={styles.next12HourTime}>
                    {new Date(hour.time).toLocaleTimeString([], { hour: 'numeric' })}
                  </Text>
                  <WeatherSymbol 
                    weatherCode={hour.weatherCode}
                    size={28}
                    latitude={circuit.latitude}
                    longitude={circuit.longitude}
                    time={hour.time}
                    sunrise={todaySunTimes?.sunrise}
                    sunset={todaySunTimes?.sunset}
                  />
                  <Text style={styles.next12HourTemp}>
                    {Math.round(hour.temperature)}°
                  </Text>
                  <Text style={styles.next12HourRain}>
                    {Math.round(hour.precipitationProbability)}%
                  </Text>
                  <Text style={styles.next12HourWind}>
                    {Math.round(hour.windSpeed)} {unit === 'metric' ? 'km/h' : 'mph'}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Written Text Weather Forecast */}
        {!loading && current && hourly.length > 0 && (
          <WeatherTextForecast
            current={current}
            hourlyData={hourly}
            unit={unit}
            circuitName={circuit.name}
            latitude={circuit.latitude}
            longitude={circuit.longitude}
          />
        )}

        {/* Enhanced Current Weather Display */}
        {!loading && current && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Current Conditions</Text>
            <View style={styles.currentWeatherContainer}>
              <WeatherSymbol 
                weatherCode={current.weather_code} 
                size={56}
                latitude={circuit.latitude}
                longitude={circuit.longitude}
                sunrise={todaySunTimes?.sunrise}
                sunset={todaySunTimes?.sunset}
              />
              <View style={styles.currentWeatherText}>
                <Text style={styles.cardValue}>{Math.round(current.temperature)}°{unit === 'metric' ? 'C' : 'F'}</Text>
                <Text style={styles.feelsLike}>Feels {Math.round(current.apparent_temperature)}°</Text>
                <Text style={styles.weatherDescription}>
                  {getWeatherDescription(current.weather_code)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Enhanced Weather Details Grid */}
        {!loading && current && (
          <View style={styles.detailsGrid}>
            <View style={styles.detailCard}>
              <Icon name="thermometer" size={20} color={colors.temperature} />
              <Text style={styles.detailLabel}>Temperature</Text>
              <Text style={styles.detailValue}>{Math.round(current.temperature)}°{unit === 'metric' ? 'C' : 'F'}</Text>
              <Text style={styles.detailSub}>Dew point: {Math.round(current.dew_point)}°</Text>
            </View>

            <View style={styles.detailCard}>
              <Icon name="flag" size={20} color={colors.wind} />
              <Text style={styles.detailLabel}>Wind & Gusts</Text>
              <Text style={styles.detailValue}>{Math.round(current.wind_speed)} / {Math.round(current.wind_gusts)}</Text>
              <Text style={styles.detailSub}>{unit === 'metric' ? 'km/h' : 'mph'} • {Math.round(current.wind_direction)}°</Text>
            </View>

            <View style={styles.detailCard}>
              <Icon name="eye" size={20} color={colors.wind} />
              <Text style={styles.detailLabel}>Visibility</Text>
              <Text style={styles.detailValue}>{Math.round(current.visibility / 1000)}km</Text>
              <Text style={styles.detailSub}>Cloud cover: {current.cloud_cover}%</Text>
            </View>

            <View style={styles.detailCard}>
              <Icon name="speedometer" size={20} color={colors.textMuted} />
              <Text style={styles.detailLabel}>Pressure</Text>
              <Text style={styles.detailValue}>{Math.round(current.pressure)} hPa</Text>
              <Text style={styles.detailSub}>Sea level</Text>
            </View>

            {current.uv_index > 0 && (
              <View style={styles.detailCard}>
                <Icon name="sunny" size={20} color={colors.warning} />
                <Text style={styles.detailLabel}>UV Index</Text>
                <Text style={styles.detailValue}>{Math.round(current.uv_index)}</Text>
                <Text style={styles.detailSub}>
                  {current.uv_index <= 2 ? 'Low' : 
                   current.uv_index <= 5 ? 'Moderate' : 
                   current.uv_index <= 7 ? 'High' : 'Very High'}
                </Text>
              </View>
            )}
          </View>
        )}

        {!loading && daily && (
          <>
            <View style={styles.chartCard}>
              <Text style={styles.cardLabel}>Precipitation Forecast</Text>
              <ChartDoughnut
                size={140}
                strokeWidth={18}
                progress={(daily.precipitation_probability_max ?? 0) / 100}
                color={colors.precipitation}
                backgroundColor={colors.divider}
                centerText={`${daily.precipitation_probability_max ?? 0}%`}
                subText="chance today"
                showScale={true}
                maxValue={100}
                unit="%"
              />
            </View>

            {/* Additional Weather Metrics with Doughnut Charts */}
            {current && (
              <View style={styles.metricsGrid}>
                <View style={styles.metricCard}>
                  <Text style={styles.metricLabel}>Humidity</Text>
                  <ChartDoughnut
                    size={100}
                    strokeWidth={12}
                    progress={current.humidity / 100}
                    color={colors.humidity}
                    backgroundColor={colors.divider}
                    centerText={`${current.humidity}%`}
                    showScale={false}
                  />
                </View>

                <View style={styles.metricCard}>
                  <Text style={styles.metricLabel}>Cloud Cover</Text>
                  <ChartDoughnut
                    size={100}
                    strokeWidth={12}
                    progress={current.cloud_cover / 100}
                    color={colors.textMuted}
                    backgroundColor={colors.divider}
                    centerText={`${current.cloud_cover}%`}
                    showScale={false}
                  />
                </View>
              </View>
            )}

            <View style={styles.card}>
              <Text style={styles.cardLabel}>7-Day Forecast</Text>
              <View style={{ height: 8 }} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                {daily.days.map((d) => (
                  <View key={d.date} style={styles.dayPill}>
                    <Text style={styles.dayText}>{d.weekday}</Text>
                    <View style={styles.daySymbolContainer}>
                      <WeatherSymbol 
                        weatherCode={d.weather_code} 
                        size={24}
                        latitude={circuit.latitude}
                        longitude={circuit.longitude}
                        sunrise={d.sunrise}
                        sunset={d.sunset}
                      />
                    </View>
                    <Text style={styles.dayTemp}>
                      {Math.round(d.max)}° / {Math.round(d.min)}°
                    </Text>
                    {/* Always show precipitation totals */}
                    <Text style={[styles.dayRain, { 
                      color: d.precipitation_sum > 0 ? colors.precipitation : colors.textMuted 
                    }]}>
                      {d.precipitation_sum === 0 ? '0' : 
                       unit === 'imperial' ? 
                         (d.precipitation_sum < 0.01 ? '<0.01' : Math.round(d.precipitation_sum * 100) / 100) :
                         (d.precipitation_sum < 0.1 ? '<0.1' : Math.round(d.precipitation_sum * 10) / 10)
                      }{unit === 'metric' ? 'mm' : 'in'}
                    </Text>
                    {d.precipitation_probability > 0 && (
                      <Text style={styles.dayRainProb}>
                        {d.precipitation_probability}%
                      </Text>
                    )}
                    {/* Show sunrise/sunset times in daily forecast */}
                    <View style={styles.daySunTimes}>
                      <Text style={styles.daySunTime}>
                        ↑{formatTimeForDisplay(d.sunrise)} ↓{formatTimeForDisplay(d.sunset)}
                      </Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* 72-Hour Forecast Section */}
            {forecast72Hours.length > 0 && (
              <View style={styles.forecast72Card}>
                <View style={styles.forecast72Header}>
                  <View style={styles.forecast72TitleContainer}>
                    <Icon name="time" size={20} color={colors.primary} />
                    <Text style={styles.forecast72Title}>72-Hour Forecast</Text>
                  </View>
                  <TouchableOpacity onPress={openForecast} style={styles.viewDetailedBtn}>
                    <Text style={styles.viewDetailedText}>View Detailed</Text>
                    <Icon name="chevron-forward" size={16} color={colors.primary} />
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.forecast72Subtitle}>
                  Next 3 days • {forecast72Hours.length} hours of data
                </Text>

                {/* Temperature Chart Preview */}
                <View style={styles.chartPreviewContainer}>
                  <Text style={styles.chartPreviewLabel}>Temperature Trend</Text>
                  <WeatherChart
                    data={chartData.slice(0, 72)}
                    type="temperature"
                    unit={unit}
                    height={120}
                  />
                </View>

                {/* Key Highlights from 72-hour data */}
                <View style={styles.forecast72Highlights}>
                  <Text style={styles.highlightsTitle}>Key Highlights</Text>
                  <View style={styles.highlightsGrid}>
                    <View style={styles.highlightItem}>
                      <Icon name="thermometer" size={16} color={colors.temperature} />
                      <Text style={styles.highlightLabel}>Temp Range</Text>
                      <Text style={styles.highlightValue}>
                        {Math.round(Math.min(...forecast72Hours.map(h => h.temperature)))}° - {Math.round(Math.max(...forecast72Hours.map(h => h.temperature)))}°
                      </Text>
                    </View>
                    
                    <View style={styles.highlightItem}>
                      <Icon name="rainy" size={16} color={colors.precipitation} />
                      <Text style={styles.highlightLabel}>Max Rain</Text>
                      <Text style={styles.highlightValue}>
                        {Math.round(Math.max(...forecast72Hours.map(h => h.precipitationProbability)))}%
                      </Text>
                    </View>
                    
                    <View style={styles.highlightItem}>
                      <Icon name="flag" size={16} color={colors.wind} />
                      <Text style={styles.highlightLabel}>Max Wind</Text>
                      <Text style={styles.highlightValue}>
                        {Math.round(Math.max(...forecast72Hours.map(h => h.windSpeed)))} {unit === 'metric' ? 'km/h' : 'mph'}
                      </Text>
                    </View>
                    
                    <View style={styles.highlightItem}>
                      <Icon name="water" size={16} color={colors.humidity} />
                      <Text style={styles.highlightLabel}>Humidity</Text>
                      <Text style={styles.highlightValue}>
                        {Math.round(forecast72Hours.reduce((sum, h) => sum + h.humidity, 0) / forecast72Hours.length)}%
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
          </>
        )}

        {/* Wind Analysis */}
        {!loading && windData.length > 0 && (
          <WindBarGraphs
            hourlyData={windData}
            unit={unit}
          />
        )}

        {/* Wind Direction Radar Analysis */}
        {!loading && windData.length > 0 && (
          <WindRadarGraph
            hourlyData={windData}
            unit={unit}
          />
        )}

        {/* Debug info when no wind data */}
        {!loading && windData.length === 0 && (
          <View style={styles.card}>
            <Text style={styles.muted}>No wind data available</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Settings Bottom Sheet */}
      <BottomSheet 
        ref={settingsRef} 
        index={-1} 
        snapPoints={settingsSnap} 
        enablePanDownToClose
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.bottomSheetHandle}
      >
        <BottomSheetView style={styles.sheet}>
          <Text style={styles.sheetTitle}>Settings</Text>
          <View style={{ height: 8 }} />
          <Text style={styles.muted}>Units</Text>
          <View style={{ height: 10 }} />
          <Button
            text={`Switch to ${unit === 'metric' ? 'Imperial' : 'Metric'}`}
            onPress={toggleUnit}
            style={buttonStyles.secondary}
          />
          <View style={{ height: 18 }} />
          <Text style={styles.muted}>
            Enhanced weather data from Open-Meteo API. Includes UV index, visibility, pressure, wind gusts, detailed forecasts, written text summaries, and sunrise/sunset times.
            Data updates every 10 minutes for accuracy.
          </Text>
        </BottomSheetView>
      </BottomSheet>

      {/* Enhanced Weather Charts Bottom Sheet */}
      <BottomSheet 
        ref={chartsRef} 
        index={-1} 
        snapPoints={chartsSnap} 
        enablePanDownToClose
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.bottomSheetHandle}
      >
        <BottomSheetView style={styles.sheet}>
          <Text style={styles.sheetTitle}>Weather Analysis</Text>
          <View style={{ height: 8 }} />
          <ScrollView showsVerticalScrollIndicator={false}>
            {chartData.length > 0 && (
              <>
                <WeatherChart
                  data={chartData}
                  type="temperature"
                  unit={unit}
                  height={120}
                />
                <WeatherChart
                  data={chartData}
                  type="wind"
                  unit={unit}
                  height={120}
                />
                <WeatherChart
                  data={chartData}
                  type="humidity"
                  unit={unit}
                  height={120}
                />
                <WeatherChart
                  data={chartData}
                  type="precipitation"
                  unit={unit}
                  height={120}
                />
              </>
            )}
            
            {/* Wind Direction Radar Analysis in Weather Analysis section */}
            {windData.length > 0 && (
              <WindRadarGraph
                hourlyData={windData}
                unit={unit}
              />
            )}
            
            <View style={{ height: 20 }} />
            <Text style={styles.muted}>
              72-hour enhanced forecast data with number scales for precise readings. Charts update every 10 minutes with detailed atmospheric conditions. Wind radar analysis shows directional patterns and frequency distribution.
            </Text>
          </ScrollView>
        </BottomSheetView>
      </BottomSheet>

      {/* Enhanced Forecast Bottom Sheet */}
      <BottomSheet 
        ref={forecastRef} 
        index={-1} 
        snapPoints={forecastSnap} 
        enablePanDownToClose
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.bottomSheetHandle}
      >
        <BottomSheetView style={styles.sheet}>
          <Text style={styles.sheetTitle}>Detailed Forecast</Text>
          <View style={{ height: 8 }} />
          <EnhancedWeatherForecast
            hourlyData={hourly}
            unit={unit}
            latitude={circuit.latitude}
            longitude={circuit.longitude}
            showExtended={true}
            sunrise={todaySunTimes?.sunrise}
            sunset={todaySunTimes?.sunset}
          />
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}

export default DetailScreen;

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  backBtn: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    gap: 6,
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  },
  backText: { color: '#fff', fontWeight: '700', fontFamily: 'Roboto_700Bold' },
  title: { fontSize: 26, fontWeight: '700', marginTop: 10, color: colors.text, fontFamily: 'Roboto_700Bold' },
  subtitle: { color: colors.textMuted, marginTop: 4, fontFamily: 'Roboto_400Regular' },
  actions: { position: 'absolute', right: 16, top: 8, flexDirection: 'row', gap: 4 },
  actionBtn: { padding: 8, borderRadius: 10 },
  content: { paddingHorizontal: 16, paddingTop: 8 },
  updateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.backgroundAlt,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  updateText: {
    fontSize: 12,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
  },

  // Sunrise & Sunset Times Styles
  sunTimesCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.divider,
    boxShadow: '0 6px 24px rgba(16,24,40,0.06)',
    marginBottom: 16,
  },
  sunTimesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sunTimesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Roboto_700Bold',
    marginLeft: 8,
    flex: 1,
  },
  timeStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timeStatusText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Roboto_500Medium',
  },
  sunTimesGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  sunTimeItem: {
    flex: 1,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.divider,
  },
  sunTimeIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  sunTimeLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
    marginBottom: 4,
  },
  sunTimeValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Roboto_700Bold',
  },
  weeklySunTimes: {
    marginTop: 4,
  },
  weeklySunTimesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Roboto_500Medium',
    marginBottom: 12,
  },
  weeklySunTimesScroll: {
    paddingHorizontal: 4,
    gap: 8,
  },
  weeklySunTimeCard: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 10,
    padding: 10,
    minWidth: 80,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  weeklySunTimeCardToday: {
    backgroundColor: colors.primary + '15',
    borderColor: colors.primary + '30',
  },
  weeklySunTimeDay: {
    fontSize: 11,
    color: colors.textMuted,
    fontFamily: 'Roboto_500Medium',
    textAlign: 'center',
    marginBottom: 8,
  },
  weeklySunTimeDayToday: {
    color: colors.primary,
    fontWeight: '700',
  },
  weeklySunTimeValues: {
    gap: 4,
  },
  weeklySunTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  weeklySunTimeText: {
    fontSize: 10,
    color: colors.text,
    fontFamily: 'Roboto_400Regular',
  },

  // Next 12 Hours section styles (moved above text forecast)
  next12HoursCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.divider,
    boxShadow: '0 6px 24px rgba(16,24,40,0.06)',
    marginBottom: 16,
  },
  next12HoursHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  next12HoursTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Roboto_700Bold',
  },
  next12HoursScroll: {
    paddingHorizontal: 4,
    gap: 12,
  },
  next12HourCard: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  next12HourTime: {
    fontSize: 11,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
    marginBottom: 8,
  },
  next12HourTemp: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Roboto_700Bold',
    marginTop: 8,
    marginBottom: 4,
  },
  next12HourRain: {
    fontSize: 11,
    color: colors.precipitation,
    fontFamily: 'Roboto_500Medium',
    marginBottom: 4,
  },
  next12HourWind: {
    fontSize: 10,
    color: colors.wind,
    fontFamily: 'Roboto_400Regular',
  },

  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.divider,
    boxShadow: '0 6px 24px rgba(16,24,40,0.06)',
    marginBottom: 12,
  },
  chartCard: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.divider,
    marginBottom: 12,
    boxShadow: '0 6px 24px rgba(16,24,40,0.06)',
  },
  // 72-Hour Forecast section styles
  forecast72Card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.divider,
    boxShadow: '0 6px 24px rgba(16,24,40,0.06)',
    marginBottom: 16,
    marginTop: 8,
  },
  forecast72Header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  forecast72TitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  forecast72Title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Roboto_700Bold',
  },
  forecast72Subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
    marginBottom: 16,
  },
  viewDetailedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.backgroundAlt,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  viewDetailedText: {
    fontSize: 13,
    color: colors.primary,
    fontFamily: 'Roboto_500Medium',
  },
  chartPreviewContainer: {
    marginBottom: 16,
  },
  chartPreviewLabel: {
    fontSize: 14,
    color: colors.textMuted,
    fontFamily: 'Roboto_500Medium',
    marginBottom: 8,
  },
  forecast72Highlights: {
    marginBottom: 16,
  },
  highlightsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Roboto_500Medium',
    marginBottom: 12,
  },
  highlightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  highlightItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.backgroundAlt,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.divider,
  },
  highlightLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
    marginTop: 4,
    marginBottom: 2,
  },
  highlightValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Roboto_500Medium',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.divider,
    alignItems: 'center',
    boxShadow: '0 6px 24px rgba(16,24,40,0.06)',
  },
  metricLabel: {
    fontSize: 14,
    color: colors.textMuted,
    fontFamily: 'Roboto_500Medium',
    marginBottom: 8,
  },
  currentWeatherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 12,
  },
  currentWeatherText: {
    flex: 1,
  },
  feelsLike: {
    fontSize: 14,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
    marginTop: 2,
  },
  weatherDescription: {
    fontSize: 13,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
    marginTop: 4,
    fontStyle: 'italic',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  detailCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.divider,
    alignItems: 'center',
    boxShadow: '0 4px 16px rgba(16,24,40,0.04)',
  },
  detailLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
    marginTop: 6,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Roboto_700Bold',
  },
  detailSub: {
    fontSize: 10,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
    marginTop: 2,
  },
  cardLabel: { color: colors.textMuted, fontFamily: 'Roboto_500Medium' },
  cardValue: { fontSize: 28, color: colors.text, fontWeight: '700', marginTop: 6, fontFamily: 'Roboto_700Bold' },
  dayPill: {
    backgroundColor: colors.backgroundAlt,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.divider,
    minWidth: 110,
    alignItems: 'center',
  },
  dayText: { 
    color: colors.text, 
    fontFamily: 'Roboto_500Medium',
    fontSize: 13,
    marginBottom: 6,
  },
  daySymbolContainer: {
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  dayTemp: { 
    color: colors.textMuted, 
    fontFamily: 'Roboto_400Regular',
    fontSize: 12,
    marginBottom: 2,
  },
  dayRain: {
    color: colors.precipitation,
    fontFamily: 'Roboto_500Medium',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  dayRainProb: {
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
    fontSize: 10,
    marginBottom: 4,
  },
  // Sunrise/sunset times in daily forecast
  daySunTimes: {
    marginTop: 2,
  },
  daySunTime: {
    fontSize: 9,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
    textAlign: 'center',
  },
  muted: { color: colors.textMuted, fontFamily: 'Roboto_400Regular' },
  error: { color: '#C62828', fontWeight: '600', fontFamily: 'Roboto_500Medium' },
  // BottomSheet styling
  bottomSheetBackground: {
    backgroundColor: colors.background,
  },
  bottomSheetHandle: {
    backgroundColor: colors.divider,
  },
  sheet: { 
    padding: 16, 
    flex: 1,
    backgroundColor: colors.background,
  },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: colors.text, fontFamily: 'Roboto_700Bold' },
});
