
import React, { useMemo, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { colors, buttonStyles } from '../../styles/commonStyles';
import { getCircuitBySlug } from '../../data/circuits';
import { useWeather } from '../../hooks/useWeather';
import ChartDoughnut from '../../components/ChartDoughnut';
import WindBarGraphs from '../../components/WindBarGraphs';
import WeatherChart from '../../components/WeatherChart';
import WeatherSymbol from '../../components/WeatherSymbol';
import EnhancedWeatherForecast from '../../components/EnhancedWeatherForecast';
import WeatherAlerts from '../../components/WeatherAlerts';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import Icon from '../../components/Icon';
import Button from '../../components/Button';
import { useUnit } from '../../state/UnitContext';
import { getWeekendSchedule, WeekendSession } from '../../data/schedules';

function DetailScreen() {
  const params = useLocalSearchParams<{ slug?: string; category?: 'f1' | 'motogp' }>();
  const slug = params.slug as string;
  const category = (params.category as 'f1' | 'motogp') || 'f1';

  const circuit = getCircuitBySlug(slug, category);
  const { unit, toggleUnit } = useUnit();

  const { current, daily, hourly, alerts, loading, error, lastUpdated } = useWeather(circuit.latitude, circuit.longitude, unit);

  const settingsRef = useRef<BottomSheet>(null);
  const scheduleRef = useRef<BottomSheet>(null);
  const chartsRef = useRef<BottomSheet>(null);
  const forecastRef = useRef<BottomSheet>(null);
  const settingsSnap = useMemo(() => ['32%', '60%'], []);
  const scheduleSnap = useMemo(() => ['40%', '85%'], []);
  const chartsSnap = useMemo(() => ['50%', '90%'], []);
  const forecastSnap = useMemo(() => ['60%', '95%'], []);
  const openSettings = useCallback(() => settingsRef.current?.expand(), []);
  const openSchedule = useCallback(() => scheduleRef.current?.expand(), []);
  const openCharts = useCallback(() => chartsRef.current?.expand(), []);
  const openForecast = useCallback(() => forecastRef.current?.expand(), []);

  const schedule: WeekendSession[] = useMemo(() => getWeekendSchedule(slug, category), [slug, category]);

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
          <TouchableOpacity onPress={openSchedule} style={styles.actionBtn} activeOpacity={0.8}>
            <Icon name="calendar-outline" size={22} color={colors.text} />
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

        {/* Wind Speed, Gusts and Direction Bar Graphs - Always show if we have data */}
        {!loading && windData.length > 0 && (
          <WindBarGraphs
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
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Enhanced Weather Charts Preview */}
            {chartData.length > 0 && (
              <View style={styles.card}>
                <View style={styles.chartHeader}>
                  <Text style={styles.cardLabel}>72-Hour Forecast</Text>
                  <TouchableOpacity onPress={openCharts} style={styles.viewAllBtn}>
                    <Text style={styles.viewAllText}>View All Charts</Text>
                    <Icon name="chevron-forward" size={16} color={colors.primary} />
                  </TouchableOpacity>
                </View>
                <WeatherChart
                  data={chartData}
                  type="temperature"
                  unit={unit}
                  height={100}
                />
              </View>
            )}

            {/* Quick Hourly Preview - Next 12 Hours */}
            {hourly.length > 0 && (
              <View style={styles.hourlyForecastCard}>
                <View style={styles.chartHeader}>
                  <Text style={styles.cardLabel}>Next 12 Hours</Text>
                  <TouchableOpacity onPress={openForecast} style={styles.viewAllBtn}>
                    <Text style={styles.viewAllText}>View Detailed Forecast</Text>
                    <Icon name="chevron-forward" size={16} color={colors.primary} />
                  </TouchableOpacity>
                </View>
                <EnhancedWeatherForecast
                  hourlyData={hourly.slice(0, 12)}
                  unit={unit}
                  latitude={circuit.latitude}
                  longitude={circuit.longitude}
                />
              </View>
            )}

            {/* Weekend Schedule - with proper spacing */}
            <View style={styles.scheduleCard}>
              <Text style={styles.cardLabel}>Weekend Schedule</Text>
              <View style={{ height: 8 }} />
              <View>
                {schedule.slice(0, 4).map((s) => (
                  <View key={s.key} style={styles.sessionRow}>
                    <View style={styles.sessionDot} />
                    <Text style={styles.sessionText}>
                      {s.day} • {s.title} — {s.time}{s.date ? ` • ${new Date(s.date + 'T00:00:00').toLocaleDateString()}` : ''}
                    </Text>
                  </View>
                ))}
              </View>
              <View style={{ height: 10 }} />
              <TouchableOpacity onPress={openSchedule} activeOpacity={0.8} style={styles.moreBtn}>
                <Text style={styles.moreBtnText}>View full schedule</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Settings Bottom Sheet */}
      <BottomSheet ref={settingsRef} index={-1} snapPoints={settingsSnap} enablePanDownToClose>
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
            Enhanced weather data from Open-Meteo API. Includes UV index, visibility, pressure, wind gusts, and detailed forecasts.
            Data updates every 10 minutes for accuracy.
          </Text>
        </BottomSheetView>
      </BottomSheet>

      {/* Schedule Bottom Sheet */}
      <BottomSheet ref={scheduleRef} index={-1} snapPoints={scheduleSnap} enablePanDownToClose>
        <BottomSheetView style={styles.sheet}>
          <Text style={styles.sheetTitle}>Weekend Schedule</Text>
          <View style={{ height: 8 }} />
          {schedule.map((s) => (
            <View key={s.key} style={styles.sessionItem}>
              <View style={styles.sessionDotLarge} />
              <View style={{ flex: 1 }}>
                <Text style={styles.sessionTitle}>{s.title}</Text>
                <Text style={styles.sessionSub}>
                  {s.day} • {s.time}{s.date ? ` • ${new Date(s.date + 'T00:00:00').toLocaleDateString()}` : ''}
                </Text>
              </View>
            </View>
          ))}
          <View style={{ height: 8 }} />
          <Text style={styles.muted}>Local times. Subject to change.</Text>
        </BottomSheetView>
      </BottomSheet>

      {/* Enhanced Weather Charts Bottom Sheet */}
      <BottomSheet ref={chartsRef} index={-1} snapPoints={chartsSnap} enablePanDownToClose>
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
            <View style={{ height: 20 }} />
            <Text style={styles.muted}>
              72-hour enhanced forecast data with number scales for precise readings. Charts update every 10 minutes with detailed atmospheric conditions.
            </Text>
          </ScrollView>
        </BottomSheetView>
      </BottomSheet>

      {/* Enhanced Forecast Bottom Sheet */}
      <BottomSheet ref={forecastRef} index={-1} snapPoints={forecastSnap} enablePanDownToClose>
        <BottomSheetView style={styles.sheet}>
          <Text style={styles.sheetTitle}>Detailed Forecast</Text>
          <View style={{ height: 8 }} />
          <EnhancedWeatherForecast
            hourlyData={hourly}
            unit={unit}
            latitude={circuit.latitude}
            longitude={circuit.longitude}
            showExtended={true}
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
  // New style for hourly forecast card with extra spacing
  hourlyForecastCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.divider,
    boxShadow: '0 6px 24px rgba(16,24,40,0.06)',
    marginBottom: 24, // Increased margin for better separation
  },
  // New style for schedule card with proper spacing
  scheduleCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.divider,
    boxShadow: '0 6px 24px rgba(16,24,40,0.06)',
    marginBottom: 12,
    marginTop: 8, // Added top margin for additional separation
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
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    color: colors.primary,
    fontFamily: 'Roboto_500Medium',
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
  },
  muted: { color: colors.textMuted, fontFamily: 'Roboto_400Regular' },
  error: { color: '#C62828', fontWeight: '600', fontFamily: 'Roboto_500Medium' },
  sheet: { padding: 16, flex: 1 },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: colors.text, fontFamily: 'Roboto_700Bold' },
  sessionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  sessionText: { color: colors.text, fontFamily: 'Roboto_400Regular' },
  moreBtn: {
    alignSelf: 'flex-start',
    backgroundColor: colors.backgroundAlt,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  moreBtnText: { color: colors.text, fontFamily: 'Roboto_500Medium' },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  sessionDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent, marginRight: 8 },
  sessionDotLarge: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.accent },
  sessionTitle: { color: colors.text, fontFamily: 'Roboto_700Bold' },
  sessionSub: { color: colors.textMuted, fontFamily: 'Roboto_400Regular', marginTop: 2 },
});
