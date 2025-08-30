
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { router } from 'expo-router';
import { useWeather } from '../hooks/useWeather';
import { useUnit } from '../state/UnitContext';
import { colors, animations } from '../styles/commonStyles';
import WeatherSymbol from './WeatherSymbol';
import { Circuit, Category } from './CircuitCard';
import { getCurrentTrackOfWeek, getTrackStatusText } from '../utils/currentTrack';
import { getCircuitBySlug } from '../data/circuits';

interface Props {
  category: Category;
}

export default function FeaturedTrackCard({ category }: Props) {
  console.log('FeaturedTrackCard: Rendering for category', category);
  
  const { unit } = useUnit();
  const trackOfWeek = getCurrentTrackOfWeek(category);
  
  const circuit = trackOfWeek ? getCircuitBySlug(trackOfWeek.slug, category) : null;
  const { current, loading } = useWeather(
    circuit?.latitude || 0, 
    circuit?.longitude || 0, 
    unit
  );

  const scaleValue = useMemo(() => new Animated.Value(1), []);

  const onPressIn = () => {
    Animated.spring(scaleValue, {
      toValue: animations.scale.pressed,
      tension: animations.spring.tension,
      friction: animations.spring.friction,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scaleValue, {
      toValue: animations.scale.normal,
      tension: animations.spring.tension,
      friction: animations.spring.friction,
      useNativeDriver: true,
    }).start();
  };

  if (!trackOfWeek || !circuit) {
    console.log('FeaturedTrackCard: No track of week found for', category);
    return null;
  }

  const tempUnit = unit === 'metric' ? '°C' : '°F';
  const windUnit = unit === 'metric' ? 'km/h' : 'mph';
  const statusText = getTrackStatusText(trackOfWeek);
  
  // Get category-specific colors
  const categoryColor = category === 'f1' ? colors.f1Red : colors.motogpBlue;
  const categoryAccent = category === 'f1' ? colors.f1Gold : colors.motogpOrange;

  console.log('FeaturedTrackCard: Rendering', circuit.name, 'status:', statusText);

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.sectionTitle}>Track of the Week</Text>
        <View style={[styles.statusBadge, { backgroundColor: trackOfWeek.isRaceWeek ? categoryColor : colors.textMuted }]}>
          <Text style={styles.statusText}>{statusText}</Text>
        </View>
      </View>
      
      <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
        <TouchableOpacity
          style={[styles.card, { borderLeftColor: categoryColor, backgroundColor: colors.cardHighlight || colors.card }]}
          activeOpacity={0.9}
          onPress={() => {
            console.log('FeaturedTrackCard: Navigating to', circuit.slug, category);
            router.push(`/circuit/${circuit.slug}?category=${category}`);
          }}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
        >
          {/* Featured indicator */}
          <View style={[styles.featuredBadge, { backgroundColor: categoryColor }]}>
            <Text style={styles.featuredText}>FEATURED</Text>
          </View>

          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.name}>{circuit.name}</Text>
              <Text style={styles.country}>{circuit.country}</Text>
              <Text style={[styles.raceDate, { color: categoryColor }]}>
                Race: {new Date(trackOfWeek.raceDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </Text>
            </View>
            
            <View style={styles.weather}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <View style={styles.loadingDot} />
                  <Text style={styles.weatherText}>Loading...</Text>
                </View>
              ) : current ? (
                <>
                  <View style={styles.weatherSymbolContainer}>
                    <WeatherSymbol 
                      weatherCode={current.weather_code} 
                      size={36}
                      latitude={circuit.latitude}
                      longitude={circuit.longitude}
                    />
                    <Text style={styles.weatherLabel}>Current</Text>
                  </View>
                  <View style={styles.tempContainer}>
                    <Text style={[styles.temp, { color: colors.temperature }]}>
                      {Math.round(current.temperature)}{tempUnit}
                    </Text>
                    <Text style={styles.tempLabel}>Temperature</Text>
                  </View>
                  <View style={styles.windContainer}>
                    <Text style={[styles.wind, { color: colors.wind }]}>
                      {Math.round(current.wind_speed)} {windUnit}
                    </Text>
                    <Text style={styles.windLabel}>Wind Speed</Text>
                  </View>
                  <View style={styles.humidityContainer}>
                    <Text style={[styles.humidity, { color: colors.humidity }]}>
                      {Math.round(current.humidity)}%
                    </Text>
                    <Text style={styles.humidityLabel}>Humidity</Text>
                  </View>
                </>
              ) : (
                <Text style={styles.weatherText}>No data available</Text>
              )}
            </View>
          </View>

          {/* Enhanced decorative accent */}
          <View style={[styles.accent, { backgroundColor: categoryAccent }]} />
          <View style={[styles.glowAccent, { backgroundColor: categoryColor }]} />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Roboto_700Bold',
    letterSpacing: -0.3,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Roboto_500Medium',
    letterSpacing: 0.3,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.divider,
    borderLeftWidth: 5,
    boxShadow: `0 12px 40px ${colors.shadow}`,
    overflow: 'hidden',
    position: 'relative',
  },
  featuredBadge: {
    position: 'absolute',
    top: 18,
    right: 18,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    zIndex: 1,
  },
  featuredText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'Roboto_700Bold',
    letterSpacing: 0.8,
  },
  content: {
    padding: 24,
    paddingTop: 20,
  },
  header: {
    marginBottom: 20,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Roboto_700Bold',
    marginBottom: 6,
    letterSpacing: -0.4,
    lineHeight: 28,
  },
  country: {
    fontSize: 16,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
    letterSpacing: 0.2,
    marginBottom: 8,
  },
  raceDate: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Roboto_500Medium',
    letterSpacing: 0.1,
  },
  weather: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    opacity: 0.6,
  },
  weatherSymbolContainer: {
    alignItems: 'center',
  },
  weatherLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
    marginTop: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tempContainer: {
    alignItems: 'flex-start',
  },
  temp: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Roboto_700Bold',
    letterSpacing: -0.6,
  },
  tempLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  windContainer: {
    alignItems: 'center',
  },
  wind: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Roboto_500Medium',
  },
  windLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  humidityContainer: {
    alignItems: 'flex-end',
  },
  humidity: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Roboto_500Medium',
  },
  humidityLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  weatherText: {
    fontSize: 14,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
  },
  accent: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 80,
    height: 4,
    borderTopLeftRadius: 12,
  },
  glowAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 4,
    height: '100%',
    opacity: 0.3,
  },
});
