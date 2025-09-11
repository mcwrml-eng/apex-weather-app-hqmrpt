
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

export type Category = 'f1' | 'motogp' | 'indycar';

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

  // Get category-specific colors and gradients - Updated for light theme
  const categoryConfig = category === 'f1' ? {
    primary: colors.f1Red,
    accent: colors.f1Gold,
    gradient: colors.gradientF1,
    label: 'FORMULA 1',
    bgGradient: ['#FFFFFF', '#F8FAFC'], // Light gradient instead of dark
    textColor: colors.text, // Dark text for light background
    secondaryTextColor: colors.textSecondary
  } : category === 'motogp' ? {
    primary: colors.motogpBlue,
    accent: colors.motogpOrange,
    gradient: colors.gradientMotoGP,
    label: 'MOTOGP',
    bgGradient: ['#FFFFFF', '#F8FAFC'], // Light gradient instead of dark
    textColor: colors.text, // Dark text for light background
    secondaryTextColor: colors.textSecondary
  } : {
    primary: colors.indycarBlue,
    accent: colors.indycarRed,
    gradient: colors.gradientIndyCar,
    label: 'INDYCAR',
    bgGradient: ['#FFFFFF', '#F8FAFC'], // Light gradient instead of dark
    textColor: colors.text, // Dark text for light background
    secondaryTextColor: colors.textSecondary
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
        {/* Enhanced gradient background with light theme */}
        <LinearGradient
          colors={categoryConfig.bgGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBackground}
        />
        
        {/* Subtle overlay for depth */}
        <View style={styles.overlayPattern} />
        
        {/* Category accent border with glow effect */}
        <View style={[styles.accentBorder, { 
          backgroundColor: categoryConfig.primary,
          boxShadow: `0 0 12px ${categoryConfig.primary}40`
        }]} />
        
        {/* Enhanced category badge */}
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
          {/* Enhanced header section with better typography */}
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={[styles.circuitName, { color: categoryConfig.textColor }]} numberOfLines={2}>
                {circuit.name}
              </Text>
              <View style={styles.countryContainer}>
                <View style={[styles.countryIndicator, { backgroundColor: categoryConfig.accent }]} />
                <Text style={styles.countryText}>{circuit.country.toUpperCase()}</Text>
              </View>
            </View>
          </View>
          
          {/* Enhanced weather section with better visual hierarchy */}
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
                {/* Current weather display with enhanced styling */}
                <View style={styles.weatherHeader}>
                  <View style={styles.weatherSymbolSection}>
                    <View style={[styles.weatherSymbolContainer, {
                      backgroundColor: `${categoryConfig.primary}15`,
                      borderColor: `${categoryConfig.primary}30`
                    }]}>
                      <WeatherSymbol 
                        weatherCode={current.weather_code} 
                        size={32}
                        latitude={circuit.latitude}
                        longitude={circuit.longitude}
                      />
                    </View>
                  </View>
                  <View style={styles.currentTempSection}>
                    <Text style={[styles.currentTemp, { color: colors.temperature }]}>
                      {Math.round(current.temperature)}°
                    </Text>
                    <Text style={styles.tempUnit}>{tempUnit}</Text>
                  </View>
                </View>

                {/* Enhanced weather metrics with better spacing */}
                <View style={styles.metricsContainer}>
                  <View style={styles.metricsRow}>
                    {/* Wind Speed */}
                    <View style={styles.metricCard}>
                      <View style={[styles.metricIconContainer, { backgroundColor: `${colors.wind}20` }]}>
                        <Text style={[styles.metricIcon, { color: colors.wind }]}>💨</Text>
                      </View>
                      <View style={styles.metricInfo}>
                        <Text style={[styles.metricValue, { color: colors.wind }]}>
                          {Math.round(current.wind_speed)}
                        </Text>
                        <Text style={styles.metricUnit}>{windUnit}</Text>
                      </View>
                    </View>

                    {/* Humidity */}
                    <View style={styles.metricCard}>
                      <View style={[styles.metricIconContainer, { backgroundColor: `${colors.humidity}20` }]}>
                        <Text style={[styles.metricIcon, { color: colors.humidity }]}>💧</Text>
                      </View>
                      <View style={styles.metricInfo}>
                        <Text style={[styles.metricValue, { color: colors.humidity }]}>
                          {Math.round(current.humidity)}
                        </Text>
                        <Text style={styles.metricUnit}>%</Text>
                      </View>
                    </View>
                  </View>

                  {/* Additional weather info */}
                  <View style={styles.additionalInfo}>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Feels like</Text>
                      <Text style={[styles.infoValue, { color: categoryConfig.secondaryTextColor }]}>
                        {Math.round(current.apparent_temperature)}°{tempUnit}
                      </Text>
                    </View>
                    <View style={styles.infoDivider} />
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Pressure</Text>
                      <Text style={[styles.infoValue, { color: categoryConfig.secondaryTextColor }]}>
                        {Math.round(current.pressure)} hPa
                      </Text>
                    </View>
                  </View>
                </View>
              </>
            ) : (
              <View style={styles.noDataContainer}>
                <View style={[styles.noDataIcon, { backgroundColor: `${categoryConfig.primary}20` }]}>
                  <Text style={[styles.noDataIconText, { color: categoryConfig.primary }]}>⚠</Text>
                </View>
                <Text style={[styles.noDataText, { color: categoryConfig.secondaryTextColor }]}>Weather data unavailable</Text>
                <Text style={styles.noDataSubtext}>Tap to view circuit details</Text>
              </View>
            )}
          </View>
        </View>

        {/* Enhanced decorative elements */}
        <View style={styles.decorativeElements}>
          <View style={[styles.decorativePattern, { backgroundColor: `${categoryConfig.accent}30` }]} />
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
    borderColor: colors.border,
    boxShadow: shadows.md, // Lighter shadow for light theme
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlayPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(248, 250, 252, 0.5)', // Light overlay instead of dark
  },
  accentBorder: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    borderTopLeftRadius: borderRadius.xl,
    borderBottomLeftRadius: borderRadius.xl,
  },
  categoryBadgeContainer: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    zIndex: 2,
  },
  categoryBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    boxShadow: shadows.sm,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    fontFamily: 'Roboto_700Bold',
    letterSpacing: 1,
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
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Roboto_700Bold',
    letterSpacing: -0.5,
    lineHeight: 26,
    paddingRight: spacing.xxxl,
  },
  countryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  countryIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  countryText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'Roboto_500Medium',
    color: colors.textMuted,
    letterSpacing: 0.5,
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
    flex: 1,
  },
  weatherSymbolContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentTempSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  currentTemp: {
    fontSize: 32,
    fontWeight: '700',
    fontFamily: 'Roboto_700Bold',
    lineHeight: 36,
  },
  tempUnit: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textMuted,
    fontFamily: 'Roboto_500Medium',
  },
  metricsContainer: {
    gap: spacing.md,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  metricCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt, // Light background instead of transparent
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: spacing.sm,
  },
  metricIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricIcon: {
    fontSize: 14,
  },
  metricInfo: {
    flex: 1,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Roboto_700Bold',
    lineHeight: 20,
  },
  metricUnit: {
    fontSize: 10,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
    lineHeight: 14,
  },
  additionalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundTertiary, // Light background
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
    marginBottom: spacing.xs,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Roboto_500Medium',
  },
  infoDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.divider,
    marginHorizontal: spacing.sm,
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  noDataIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  noDataIconText: {
    fontSize: 18,
  },
  noDataText: {
    fontSize: 14,
    fontFamily: 'Roboto_500Medium',
    textAlign: 'center',
  },
  noDataSubtext: {
    fontSize: 11,
    color: colors.textDisabled,
    fontFamily: 'Roboto_400Regular',
    textAlign: 'center',
  },
  decorativeElements: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 60,
    height: 3,
  },
  decorativePattern: {
    flex: 1,
    borderTopLeftRadius: borderRadius.sm,
    borderBottomRightRadius: borderRadius.xl,
  },
});
