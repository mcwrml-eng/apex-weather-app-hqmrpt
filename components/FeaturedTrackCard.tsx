
import { useWeather } from '../hooks/useWeather';
import { Circuit, Category } from './CircuitCard';
import { getColors, getCommonStyles, animations, spacing, borderRadius, getShadows } from '../styles/commonStyles';
import { getCurrentTrackOfWeek, getTrackStatusText } from '../utils/currentTrack';
import { router } from 'expo-router';
import WeatherSymbol from './WeatherSymbol';
import { LinearGradient } from 'expo-linear-gradient';
import { useUnit } from '../state/UnitContext';
import { useTheme } from '../state/ThemeContext';
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { getCircuitBySlug } from '../data/circuits';

interface Props {
  category: Category;
}

export default function FeaturedTrackCard({ category }: Props) {
  try {
    const currentTrack = getCurrentTrackOfWeek(category);
    const circuit = currentTrack ? getCircuitBySlug(currentTrack.slug, category) : null;
    
    const { current, loading } = useWeather(
      circuit?.latitude || 0, 
      circuit?.longitude || 0, 
      'metric'
    );
    
    const { unit } = useUnit();
    const { isDark } = useTheme();
    
    const colors = getColors(isDark);
    const commonStyles = getCommonStyles(isDark);
    const shadows = getShadows(isDark);
    
    const scaleAnim = useMemo(() => new Animated.Value(1), []);

    const styles = StyleSheet.create({
      card: {
        backgroundColor: colors.card,
        borderRadius: borderRadius.xl,
        marginBottom: spacing.lg,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.border,
        boxShadow: shadows.md,
      },
      gradient: {
        padding: spacing.xl,
      },
      badge: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.round,
        alignSelf: 'flex-start',
        marginBottom: spacing.md,
      },
      badgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
        fontFamily: 'Roboto_500Medium',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
      },
      header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.lg,
      },
      titleContainer: {
        flex: 1,
        marginRight: spacing.lg,
      },
      circuitName: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.text,
        fontFamily: 'Roboto_700Bold',
        marginBottom: spacing.xs,
        lineHeight: 30,
      },
      country: {
        fontSize: 16,
        color: colors.textSecondary,
        fontFamily: 'Roboto_400Regular',
        marginBottom: spacing.sm,
      },
      status: {
        fontSize: 14,
        color: colors.primary,
        fontFamily: 'Roboto_500Medium',
        fontWeight: '500',
      },
      weatherContainer: {
        alignItems: 'center',
        backgroundColor: colors.backgroundAlt,
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.borderLight,
      },
      temperature: {
        fontSize: 32,
        fontWeight: '800',
        color: colors.temperature,
        fontFamily: 'Roboto_700Bold',
        textAlign: 'center',
        marginTop: spacing.sm,
      },
      weatherInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: spacing.lg,
        paddingTop: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.divider,
      },
      infoItem: {
        alignItems: 'center',
        flex: 1,
      },
      infoLabel: {
        fontSize: 12,
        color: colors.textMuted,
        fontFamily: 'Roboto_400Regular',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: spacing.xs,
      },
      infoValue: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        fontFamily: 'Roboto_500Medium',
      },
      loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 120,
      },
      loadingText: {
        fontSize: 14,
        color: colors.textMuted,
        fontFamily: 'Roboto_400Regular',
        marginTop: spacing.md,
      },
    });

    const getCategoryGradient = () => {
      switch (category) {
        case 'f1':
          return colors.gradientF1;
        case 'motogp':
          return colors.gradientMotoGP;
        case 'indycar':
          return colors.gradientIndyCar;
        default:
          return colors.gradientPrimary;
      }
    };

    const getCategoryTitle = () => {
      switch (category) {
        case 'f1':
          return 'Formula 1';
        case 'motogp':
          return 'MotoGP';
        case 'indycar':
          return 'IndyCar';
        default:
          return 'Featured';
      }
    };

    const onPressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: animations.scale.pressed,
        ...animations.spring,
        useNativeDriver: true,
      }).start();
    };

    const onPressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: animations.scale.normal,
        ...animations.spring,
        useNativeDriver: true,
      }).start();
    };

    const handlePress = () => {
      if (circuit) {
        console.log('FeaturedTrackCard: Navigating to featured circuit:', circuit.slug);
        router.push(`/circuit/${circuit.slug}?category=${category}`);
      }
    };

    if (!circuit || !currentTrack) {
      console.log('FeaturedTrackCard: No circuit or current track found for', category);
      return null;
    }

    return (
      <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
        <TouchableOpacity
          onPress={handlePress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          activeOpacity={1}
        >
          <LinearGradient
            colors={getCategoryGradient()}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {getCategoryTitle()} • This Week
              </Text>
            </View>

            <View style={styles.header}>
              <View style={styles.titleContainer}>
                <Text style={styles.circuitName} numberOfLines={2}>
                  {circuit.name}
                </Text>
                <Text style={styles.country}>
                  {circuit.country}
                </Text>
                <Text style={styles.status}>
                  {getTrackStatusText(currentTrack)}
                </Text>
              </View>
              
              <View style={styles.weatherContainer}>
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <WeatherSymbol weatherCode={1} size={48} />
                    <Text style={styles.loadingText}>Loading...</Text>
                  </View>
                ) : current ? (
                  <>
                    <WeatherSymbol 
                      weatherCode={current.weather_code} 
                      size={48}
                      latitude={circuit.latitude}
                      longitude={circuit.longitude}
                    />
                    <Text style={styles.temperature}>
                      {Math.round(current.temperature)}°
                    </Text>
                  </>
                ) : (
                  <WeatherSymbol weatherCode={1} size={48} />
                )}
              </View>
            </View>

            {current && !loading && (
              <View style={styles.weatherInfo}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Wind Speed</Text>
                  <Text style={styles.infoValue}>
                    {Math.round(current.wind_speed)} {unit === 'metric' ? 'km/h' : 'mph'}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Humidity</Text>
                  <Text style={styles.infoValue}>
                    {Math.round(current.humidity)}%
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Pressure</Text>
                  <Text style={styles.infoValue}>
                    {Math.round(current.pressure)} hPa
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>UV Index</Text>
                  <Text style={styles.infoValue}>
                    {Math.round(current.uv_index)}
                  </Text>
                </View>
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  } catch (error) {
    console.error('FeaturedTrackCard: Error rendering card:', error);
    return null;
  }
}
