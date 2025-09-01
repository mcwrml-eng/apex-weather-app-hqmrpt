
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { router } from 'expo-router';
import { useWeather } from '../hooks/useWeather';
import { useUnit } from '../state/UnitContext';
import { colors, animations, spacing, borderRadius, shadows, commonStyles } from '../styles/commonStyles';
import WeatherSymbol from './WeatherSymbol';
import { LinearGradient } from 'expo-linear-gradient';

export interface Circuit {
  slug: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
}

export type Category = 'f1' | 'motogp';

interface Props {
  circuit: Circuit;
  category: Category;
}

export default function CircuitCard({ circuit, category }: Props) {
  const { unit } = useUnit();
  const { current, loading } = useWeather(circuit.latitude, circuit.longitude, unit);

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

  const tempUnit = unit === 'metric' ? '°C' : '°F';
  const windUnit = unit === 'metric' ? 'km/h' : 'mph';

  // Get category-specific colors and gradients
  const categoryConfig = category === 'f1' ? {
    primary: colors.f1Red,
    accent: colors.f1Gold,
    gradient: colors.gradientF1,
    label: 'FORMULA 1'
  } : {
    primary: colors.motogpBlue,
    accent: colors.motogpOrange,
    gradient: colors.gradientMotoGP,
    label: 'MOTOGP'
  };

  console.log('CircuitCard: Rendering enhanced', circuit.name, 'loading:', loading, 'current:', !!current);

  return (
    <Animated.View style={{ 
      transform: [{ scale: scaleValue }], 
      opacity: opacityValue 
    }}>
      <TouchableOpacity
        style={styles.cardContainer}
        activeOpacity={1}
        onPress={() => {
          console.log('CircuitCard: Navigating to', circuit.slug, category);
          router.push(`/circuit/${circuit.slug}?category=${category}`);
        }}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        {/* Enhanced gradient background */}
        <LinearGradient
          colors={[colors.card, colors.cardElevated]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBackground}
        />
        
        {/* Category accent border */}
        <View style={[styles.accentBorder, { backgroundColor: categoryConfig.primary }]} />
        
        {/* Category badge with gradient */}
        <View style={styles.categoryBadgeContainer}>
          <LinearGradient
            colors={categoryConfig.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.categoryBadge}
          >
            <Text style={styles.categoryText}>{categoryConfig.label}</Text>
          </LinearGradient>
        </View>

        <View style={styles.content}>
          {/* Enhanced header section */}
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.circuitName}>{circuit.name}</Text>
              <View style={styles.countryContainer}>
                <View style={[styles.countryDot, { backgroundColor: categoryConfig.accent }]} />
                <Text style={styles.countryText}>{circuit.country}</Text>
              </View>
            </View>
          </View>
          
          {/* Enhanced weather section */}
          <View style={styles.weatherSection}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <View style={styles.loadingIndicator}>
                  <Animated.View style={[styles.loadingDot, styles.loadingDot1]} />
                  <Animated.View style={[styles.loadingDot, styles.loadingDot2]} />
                  <Animated.View style={[styles.loadingDot, styles.loadingDot3]} />
                </View>
                <Text style={styles.loadingText}>Loading weather data...</Text>
              </View>
            ) : current ? (
              <>
                {/* Current weather symbol */}
                <View style={styles.weatherSymbolSection}>
                  <View style={styles.weatherSymbolContainer}>
                    <WeatherSymbol 
                      weatherCode={current.weather_code} 
                      size={36}
                      latitude={circuit.latitude}
                      longitude={circuit.longitude}
                    />
                  </View>
                  <Text style={styles.weatherLabel}>Current</Text>
                </View>

                {/* Weather metrics grid */}
                <View style={styles.metricsGrid}>
                  {/* Temperature */}
                  <View style={styles.metricItem}>
                    <View style={[styles.metricIcon, { backgroundColor: `${colors.temperature}20` }]}>
                      <Text style={[styles.metricIconText, { color: colors.temperature }]}>°</Text>
                    </View>
                    <View style={styles.metricContent}>
                      <Text style={[styles.metricValue, { color: colors.temperature }]}>
                        {Math.round(current.temperature)}{tempUnit}
                      </Text>
                      <Text style={styles.metricLabel}>Temperature</Text>
                    </View>
                  </View>

                  {/* Wind Speed */}
                  <View style={styles.metricItem}>
                    <View style={[styles.metricIcon, { backgroundColor: `${colors.wind}20` }]}>
                      <Text style={[styles.metricIconText, { color: colors.wind }]}>⚡</Text>
                    </View>
                    <View style={styles.metricContent}>
                      <Text style={[styles.metricValue, { color: colors.wind }]}>
                        {Math.round(current.wind_speed)}
                      </Text>
                      <Text style={styles.metricLabel}>{windUnit}</Text>
                    </View>
                  </View>

                  {/* Humidity */}
                  <View style={styles.metricItem}>
                    <View style={[styles.metricIcon, { backgroundColor: `${colors.humidity}20` }]}>
                      <Text style={[styles.metricIconText, { color: colors.humidity }]}>💧</Text>
                    </View>
                    <View style={styles.metricContent}>
                      <Text style={[styles.metricValue, { color: colors.humidity }]}>
                        {Math.round(current.humidity)}%
                      </Text>
                      <Text style={styles.metricLabel}>Humidity</Text>
                    </View>
                  </View>
                </View>
              </>
            ) : (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>Weather data unavailable</Text>
                <Text style={styles.noDataSubtext}>Tap to view circuit details</Text>
              </View>
            )}
          </View>
        </View>

        {/* Enhanced decorative elements */}
        <View style={styles.decorativeElements}>
          <View style={[styles.decorativeDot, { backgroundColor: categoryConfig.accent }]} />
          <View style={[styles.decorativeLine, { backgroundColor: categoryConfig.primary }]} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: 'transparent',
    borderRadius: borderRadius.xl,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: colors.divider,
    boxShadow: shadows.lg,
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
  categoryBadgeContainer: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    zIndex: 2,
  },
  categoryBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  categoryText: {
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
  },
  titleContainer: {
    gap: spacing.sm,
  },
  circuitName: {
    ...commonStyles.headingSmall,
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Roboto_700Bold',
    letterSpacing: -0.4,
    lineHeight: 24,
    paddingRight: spacing.xxxl, // Account for category badge
  },
  countryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  countryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  countryText: {
    ...commonStyles.bodyMedium,
    fontSize: 13,
    letterSpacing: 0.3,
  },
  weatherSection: {
    gap: spacing.md,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  loadingIndicator: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  loadingDot1: {
    opacity: 0.4,
  },
  loadingDot2: {
    opacity: 0.7,
  },
  loadingDot3: {
    opacity: 1,
  },
  loadingText: {
    ...commonStyles.caption,
    fontSize: 11,
  },
  weatherSymbolSection: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  weatherSymbolContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.divider,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  weatherLabel: {
    ...commonStyles.captionSmall,
    fontSize: 9,
    fontWeight: '600',
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  metricItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.divider,
    gap: spacing.sm,
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
    fontWeight: '600',
  },
  metricContent: {
    flex: 1,
    alignItems: 'flex-start',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Roboto_700Bold',
    lineHeight: 18,
  },
  metricLabel: {
    ...commonStyles.captionSmall,
    fontSize: 8,
    lineHeight: 12,
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.xs,
  },
  noDataText: {
    ...commonStyles.bodyMedium,
    color: colors.textMuted,
  },
  noDataSubtext: {
    ...commonStyles.caption,
    fontSize: 11,
    color: colors.textDisabled,
  },
  decorativeElements: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
  },
  decorativeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  decorativeLine: {
    width: 20,
    height: 2,
    borderRadius: 1,
  },
});
