
import React, { useMemo, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useGlobalSearchParams, useLocalSearchParams, router } from 'expo-router';
import { colors, buttonStyles } from '../../styles/commonStyles';
import { getCircuitBySlug } from '../../data/circuits';
import { useWeather } from '../../hooks/useWeather';
import ChartDoughnut from '../../components/ChartDoughnut';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import Icon from '../../components/Icon';
import Button from '../../components/Button';
import { UnitProvider, useUnit } from '../../state/UnitContext';

function DetailInner() {
  const params = useLocalSearchParams<{ slug?: string; category?: 'f1' | 'motogp' }>();
  const slug = params.slug as string;
  const category = (params.category as 'f1' | 'motogp') || 'f1';

  const circuit = getCircuitBySlug(slug, category);
  const { unit, toggleUnit } = useUnit();

  const { current, daily, loading, error } = useWeather(circuit.latitude, circuit.longitude, unit);

  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['32%', '60%'], []);
  const openSheet = useCallback(() => sheetRef.current?.expand(), []);

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
          <TouchableOpacity onPress={openSheet} style={styles.actionBtn} activeOpacity={0.8}>
            <Icon name="settings-outline" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loading && <Text style={styles.muted}>Loading weather…</Text>}
        {error && <Text style={styles.error}>Failed to load. Please try again.</Text>}

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
              <Text style={styles.muted}>Humidity {current.humidity}%</Text>
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
          </>
        )}

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Map</Text>
          <Text style={styles.muted}>
            react-native-maps is not supported on web in Natively. A map would be shown here on device.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <BottomSheet ref={sheetRef} index={-1} snapPoints={snapPoints} enablePanDownToClose>
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
    </View>
  );
}

export default function DetailScreen() {
  // Provide unit context per detail page so toggling reflects immediately
  return (
    <UnitProvider>
      <DetailInner />
    </UnitProvider>
  );
}

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
  actions: { position: 'absolute', right: 16, top: 8, display: 'contents' as any },
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
  sheet: { padding: 16 },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: colors.text, fontFamily: 'Roboto_700Bold' },
});
