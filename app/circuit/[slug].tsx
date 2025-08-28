
import React, { useMemo, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { colors, buttonStyles } from '../../styles/commonStyles';
import { getCircuitBySlug } from '../../data/circuits';
import { useWeather } from '../../hooks/useWeather';
import ChartDoughnut from '../../components/ChartDoughnut';
import TrackMap from '../../components/TrackMap';
import WeatherChart from '../../components/WeatherChart';
import WeatherSymbol from '../../components/WeatherSymbol';
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

  const { current, daily, hourly, loading, error } = useWeather(circuit.latitude, circuit.longitude, unit);

  const settingsRef = useRef<BottomSheet>(null);
  const scheduleRef = useRef<BottomSheet>(null);
  const chartsRef = useRef<BottomSheet>(null);
  const settingsSnap = useMemo(() => ['32%', '60%'], []);
  const scheduleSnap = useMemo(() => ['40%', '85%'], []);
  const chartsSnap = useMemo(() => ['50%', '90%'], []);
  const openSettings = useCallback(() => settingsRef.current?.expand(), []);
  const openSchedule = useCallback(() => scheduleRef.current?.expand(), []);
  const openCharts = useCallback(() => chartsRef.current?.expand(), []);

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
        {loading && <Text style={styles.muted}>Loading weather…</Text>}
        {error && <Text style={styles.error}>Failed to load. Please try again.</Text>}

        {/* Track Map with Wind Direction */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Track Layout & Wind</Text>
          <View style={styles.mapContainer}>
            <TrackMap
              circuitSlug={circuit.slug}
              windDirection={current?.wind_direction || 0}
              windSpeed={current?.wind_speed || 0}
              size={200}
            />
          </View>
          <Text style={styles.mapNote}>
            Wind arrows show current direction and speed across the track
          </Text>
        </View>

        {/* Current Weather Display with Symbol */}
        {!loading && current && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Current Weather</Text>
            <View style={styles.currentWeatherContainer}>
              <WeatherSymbol 
                weatherCode={current.weather_code} 
                size={48}
                latitude={circuit.latitude}
                longitude={circuit.longitude}
              />
              <View style={styles.currentWeatherText}>
                <Text style={styles.cardValue}>{Math.round(current.temperature)}°{unit === 'metric' ? 'C' : 'F'}</Text>
                <Text style={styles.muted}>Feels {Math.round(current.apparent_temperature)}°</Text>
              </View>
            </View>
          </View>
        )}

        {!loading && current && (
          <View style={styles.cardRow}>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Current Temp</Text>
              <Text style={styles.cardValue}>{Math.round(current.temperature)}°{unit === 'metric' ? 'C' : 'F'}</Text>
              <Text style={styles.muted}>Feels {Math.round(current.apparent_temperature)}°</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardLabel}>Wind</Text>
              <Text style={styles.cardValue}>{Math.round(current.wind_speed)} {unit === 'metric' ? 'km/h' : 'mph'}</Text>
              <Text style={styles.muted}>
                {Math.round(current.wind_direction)}° • {current.humidity}% humidity
              </Text>
            </View>
          </View>
        )}

        {!loading && daily && (
          <>
            <View style={styles.chartCard}>
              <Text style={styles.cardLabel}>Chance of Rain</Text>
              <ChartDoughnut
                size={140}
                strokeWidth={18}
                progress={(daily.precipitation_probability_max ?? 0) / 100}
                color={colors.secondary}
                backgroundColor={colors.divider}
                centerText={`${daily.precipitation_probability_max ?? 0}%`}
                subText="today"
              />
            </View>

            <View style={styles.card}>
              <Text style={styles.cardLabel}>This Week</Text>
              <View style={{ height: 8 }} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                {daily.days.map((d) => (
                  <View key={d.date} style={styles.dayPill}>
                    <Text style={styles.dayText}>{d.weekday}</Text>
                    <Text style={styles.dayTemp}>
                      {Math.round(d.min)}° / {Math.round(d.max)}°
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Weather Charts Preview */}
            {chartData.length > 0 && (
              <View style={styles.card}>
                <View style={styles.chartHeader}>
                  <Text style={styles.cardLabel}>24-Hour Forecast</Text>
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

            <View style={styles.card}>
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
            style={buttonStyles.instructionsButton}
          />
          <View style={{ height: 18 }} />
          <Text style={styles.muted}>
            Data from Open-Meteo. Minimalistic UI designed for clarity on race weekends.
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

      {/* Weather Charts Bottom Sheet */}
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
              24-hour forecast data. Charts update every 5 minutes.
            </Text>
          </ScrollView>
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
  cardRow: { flexDirection: 'row', gap: 12 },
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
  mapContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  mapNote: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    fontFamily: 'Roboto_400Regular',
    marginTop: 8,
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
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.divider,
    minWidth: 90,
  },
  dayText: { color: colors.text, fontFamily: 'Roboto_500Medium' },
  dayTemp: { color: colors.textMuted, marginTop: 4, fontFamily: 'Roboto_400Regular' },
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
