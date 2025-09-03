
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { router } from 'expo-router';
import { useWeather } from '../hooks/useWeather';
import { useUnit } from '../state/UnitContext';
import { colors, animations, spacing, borderRadius, shadows, commonStyles } from '../styles/commonStyles';
import WeatherSymbol from './WeatherSymbol';
import { Circuit, Category } from './CircuitCard';
import { getCurrentTrackOfWeek, getTrackStatusText } from '../utils/currentTrack';
import { getCircuitBySlug } from '../data/circuits';
import { LinearGradient } from 'expo-linear-gradient';

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
  const opacityValue = useMemo(() => new Animated.Value(1), []);

  const onPressIn = () => {
    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: animations.scale.pressed,
        tension: animations.spring.tension,
        friction: animations.spring.friction,
        useNativeDriver: true,
      }),
      Animated.timing(opacityValue, {
        toValue: animations.opacity.pressed,
        duration: animations.timingFast.duration,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const onPressOut = () => {
    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: animations.scale.normal,
        tension: animations.spring.tension,
        friction: animations.spring.friction,
        useNativeDriver: true,
      }),
      Animated.timing(opacityValue, {
        toValue: animations.opacity.normal,
        duration: animations.timingFast.duration,
        useNativeDriver: true,
      }),
    ]).start();
  };

  if (!trackOfWeek || !circuit) {
    console.log('FeaturedTrackCard: No track of week found for', category);
    return null;
  }

  const tempUnit = unit === 'metric' ? '°C' : '°F';
  const windUnit = unit === 'metric' ? 'km/h' : 'mph';
  const statusText = getTrackStatusText(trackOfWeek);
  
  // Enhanced category-specific styling
  const categoryConfig = category === 'f1' ? {
    primary: colors.f1Red,
    accent: colors.f1Gold,
    gradient: colors.gradientF1,
    bgGradient: ['#2A0F0F', '#3A1A1A'],
    label: 'FORMULA 1'
  } : {
    primary: colors.motogpBlue,
    accent: colors.motogpOrange,
    gradient: colors.gradientMotoGP,
    bgGradient: ['#0F1A2A', '#1A2A3A'],
    label: 'MOTOGP'
  };

  console.log('FeaturedTrackCard: Rendering', circuit.name, 'status:', statusText);

  return (
    <View style={styles.container}>
      {/* Enhanced header with better typography */}
      <View style={styles.headerContainer}>
        <View style={styles.titleSection}>
          <Text style={styles.sectionTitle}>Track of the Week</Text>
          <View style={styles.categoryIndicator}>
            <LinearGradient
              colors={categoryConfig.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.categoryBadge}
            >
              <Text style={styles.categoryText}>{categoryConfig.label}</Text>
            </LinearGradient>
          </View>
        </View>
        <View style={[styles.statusBadge, { 
          backgroundColor: trackOfWeek.isRaceWeek ? categoryConfig.primary : colors.textMuted,
          boxShadow: trackOfWeek.isRaceWeek ? `0 4px 12px ${categoryConfig.primary}40` : 'none'
        }]}>
          <Text style={styles.statusText}>{statusText}</Text>
        </View>
      </View>
      
      <Animated.View style={{ 
        transform: [{ scale: scaleValue }], 
        opacity: opacityValue 
      }}>
        <TouchableOpacity
          style={styles.card}
          activeOpacity={1}
          onPress={() => {
            console.log('FeaturedTrackCard: Navigating to', circuit.slug, category);
            router.push(`/circuit/${circuit.slug}?category=${category}`);
          }}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
        >
          {/* Enhanced gradient background */}
          <LinearGradient
            colors={categoryConfig.bgGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientBackground}
          />

          {/* Accent border with glow */}
          <View style={[styles.accentBorder, { 
            backgroundColor: categoryConfig.primary,
            boxShadow: `0 0 16px ${categoryConfig.primary}50`
          }]} />

          {/* Featured badge */}
          <View style={styles.featuredBadgeContainer}>
            <LinearGradient
              colors={[categoryConfig.accent, categoryConfig.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.featuredBadge}
            >
              <Text style={styles.featuredText}>★ FEATURED</Text>
            </LinearGradient>
          </View>

          <View style={styles.content}>
            {/* Enhanced header section */}
            <View style={styles.header}>
              <Text style={styles.circuitName} numberOfLines={2}>
                {circuit.name}
              </Text>
              <View style={styles.locationContainer}>
                <View style={[styles.locationDot, { backgroundColor: categoryConfig.accent }]} />
                <Text style={styles.countryText}>{circuit.country.toUpperCase()}</Text>
              </View>
              <Text style={[styles.raceDate, { color: categoryConfig.primary }]}>
                Race: {new Date(trackOfWeek.raceDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </Text>
            </View>
            
            {/* Enhanced weather section */}
            <View style={styles.weatherSection}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <View style={styles.loadingIndicator}>
                    <Animated.View style={[styles.loadingDot, { backgroundColor: categoryConfig.primary }]} />
                    <Animated.View style={[styles.loadingDot, { backgroundColor: categoryConfig.primary, opacity: 0.7 }]} />
                    <Animated.View style={[styles.loadingDot, { backgroundColor: categoryConfig.primary, opacity: 0.4 }]} />
                  </View>
                  <Text style={styles.loadingText}>Loading weather...</Text>
                </View>
              ) : current ? (
                <>
                  {/* Current weather display */}
                  <View style={styles.weatherHeader}>
                    <View style={styles.weatherSymbolSection}>
                      <View style={[styles.weatherSymbolContainer, {
                        backgroundColor: `${categoryConfig.primary}15`,
                        borderColor: `${categoryConfig.primary}30`
                      }]}>
                        <WeatherSymbol 
                          weatherCode={current.weather_code} 
                          size={28}
                          latitude={circuit.latitude}
                          longitude={circuit.longitude}
                        />
                      </View>
                      <Text style={styles.weatherLabel}>Current</Text>
                    </View>
                    
                    <View style={styles.primaryMetric}>
                      <Text style={[styles.primaryTemp, { color: colors.temperature }]}>
                        {Math.round(current.temperature)}°
                      </Text>
                      <Text style={styles.tempUnit}>{tempUnit}</Text>
                    </View>
                  </View>

                  {/* Weather metrics grid */}
                  <View style={styles.metricsGrid}>
                    <View style={styles.metricCard}>
                      <View style={[styles.metricIcon, { backgroundColor: `${colors.wind}20` }]}>
                        <Text style={[styles.metricIconText, { color: colors.wind }]}>💨</Text>
                      </View>
                      <View style={styles.metricContent}>
                        <Text style={[styles.metricValue, { color: colors.wind }]}>
                          {Math.round(current.wind_speed)}
                        </Text>
                        <Text style={styles.metricLabel}>{windUnit}</Text>
                      </View>
                    </View>

                    <View style={styles.metricCard}>
                      <View style={[styles.metricIcon, { backgroundColor: `${colors.humidity}20` }]}>
                        <Text style={[styles.metricIconText, { color: colors.humidity }]}>💧</Text>
                      </View>
                      <View style={styles.metricContent}>
                        <Text style={[styles.metricValue, { color: colors.humidity }]}>
                          {Math.round(current.humidity)}
                        </Text>
                        <Text style={styles.metricLabel}>%</Text>
                      </View>
                    </View>

                    <View style={styles.metricCard}>
                      <View style={[styles.metricIcon, { backgroundColor: `${colors.pressure}20` }]}>
                        <Text style={[styles.metricIconText, { color: colors.pressure }]}>⚡</Text>
                      </View>
                      <View style={styles.metricContent}>
                        <Text style={[styles.metricValue, { color: colors.pressure }]}>
                          {Math.round(current.pressure)}
                        </Text>
                        <Text style={styles.metricLabel}>hPa</Text>
                      </View>
                    </View>
                  </View>
                </>
              ) : (
                <View style={styles.noDataContainer}>
                  <View style={[styles.noDataIcon, { backgroundColor: `${categoryConfig.primary}20` }]}>
                    <Text style={[styles.noDataIconText, { color: categoryConfig.primary }]}>⚠</Text>
                  </View>
                  <Text style={styles.noDataText}>Weather data unavailable</Text>
                </View>
              )}
            </View>
          </View>

          {/* Enhanced decorative elements */}
          <View style={styles.decorativeElements}>
            <View style={[styles.decorativeAccent, { backgroundColor: categoryConfig.accent }]} />
            <View style={[styles.decorativeGlow, { backgroundColor: `${categoryConfig.primary}30` }]} />
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  titleSection: {
    flex: 1,
    gap: spacing.xs,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Roboto_700Bold',
    letterSpacing: -0.4,
    lineHeight: 28,
  },
  categoryIndicator: {
    alignSelf: 'flex-start',
  },
  categoryBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    fontFamily: 'Roboto_700Bold',
    letterSpacing: 0.8,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Roboto_500Medium',
    letterSpacing: 0.3,
  },
  card: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: colors.divider,
    boxShadow: `0 12px 48px rgba(0, 0, 0, 0.4)`,
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  accentBorder: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: borderRadius.xl,
    borderBottomLeftRadius: borderRadius.xl,
  },
  featuredBadgeContainer: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    zIndex: 2,
  },
  featuredBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
  },
  featuredText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Roboto_700Bold',
    letterSpacing: 0.8,
  },
  content: {
    padding: spacing.xl,
    paddingTop: spacing.lg,
    zIndex: 1,
  },
  header: {
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  circuitName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Roboto_700Bold',
    letterSpacing: -0.6,
    lineHeight: 30,
    paddingRight: spacing.xxxl,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  locationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  countryText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Roboto_500Medium',
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  raceDate: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Roboto_500Medium',
    letterSpacing: 0.1,
    marginTop: spacing.xs,
  },
  weatherSection: {
    gap: spacing.md,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  loadingIndicator: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  loadingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  loadingText: {
    fontSize: 12,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
  },
  weatherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  weatherSymbolSection: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  weatherSymbolContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weatherLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  primaryMetric: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  primaryTemp: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'Roboto_700Bold',
    lineHeight: 32,
  },
  tempUnit: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textMuted,
    fontFamily: 'Roboto_500Medium',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  metricCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: spacing.xs,
  },
  metricIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricIconText: {
    fontSize: 12,
  },
  metricContent: {
    flex: 1,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Roboto_700Bold',
    lineHeight: 18,
  },
  metricLabel: {
    fontSize: 9,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
    lineHeight: 12,
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  noDataIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataIconText: {
    fontSize: 16,
  },
  noDataText: {
    fontSize: 14,
    color: colors.textMuted,
    fontFamily: 'Roboto_500Medium',
    textAlign: 'center',
  },
  decorativeElements: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  decorativeAccent: {
    width: 60,
    height: 3,
    borderTopLeftRadius: borderRadius.sm,
    borderBottomRightRadius: borderRadius.xl,
  },
  decorativeGlow: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderTopLeftRadius: borderRadius.md,
    borderBottomRightRadius: borderRadius.xl,
  },
});
