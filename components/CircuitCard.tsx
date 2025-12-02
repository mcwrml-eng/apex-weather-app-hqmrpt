
import { useWeather } from '../hooks/useWeather';
import { getColors, getCommonStyles, animations, spacing, borderRadius, getShadows } from '../styles/commonStyles';
import { router } from 'expo-router';
import WeatherSymbol from './WeatherSymbol';
import { LinearGradient } from 'expo-linear-gradient';
import { useUnit } from '../state/UnitContext';
import { useTheme } from '../state/ThemeContext';
import { useLanguage } from '../state/LanguageContext';
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';

export interface Circuit {
  slug: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  trackDirection?: number; // Main straight direction in degrees (0-360)
}

export type Category = 'f1' | 'f2' | 'f3' | 'motogp' | 'indycar' | 'nascar';

interface Props {
  circuit: Circuit;
  category: Category;
  onPress?: () => void;
  disablePress?: boolean;
}

export default function CircuitCard({ circuit, category, onPress, disablePress = false }: Props) {
  const { current, loading } = useWeather(circuit.latitude, circuit.longitude, 'metric');
  const { unit } = useUnit();
  const { isDark } = useTheme();
  const { t } = useLanguage();
  
  const colors = getColors(isDark);
  const commonStyles = getCommonStyles(isDark);
  const shadows = getShadows(isDark);
  
  const scaleAnim = useMemo(() => new Animated.Value(1), []);

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      marginBottom: spacing.md,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.borderLight,
      boxShadow: shadows.sm,
    },
    gradient: {
      padding: spacing.lg,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.sm,
    },
    titleContainer: {
      flex: 1,
      marginRight: spacing.md,
    },
    circuitName: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      fontFamily: 'Roboto_500Medium',
      marginBottom: 2,
    },
    country: {
      fontSize: 14,
      color: colors.textSecondary,
      fontFamily: 'Roboto_400Regular',
    },
    weatherContainer: {
      alignItems: 'center',
      minWidth: 60,
    },
    temperature: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.temperature,
      fontFamily: 'Roboto_700Bold',
      textAlign: 'center',
    },
    weatherInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: spacing.sm,
      paddingTop: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    },
    infoItem: {
      alignItems: 'center',
      flex: 1,
    },
    infoLabel: {
      fontSize: 11,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 2,
    },
    infoValue: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      fontFamily: 'Roboto_500Medium',
    },
    loadingContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 60,
    },
    loadingText: {
      fontSize: 14,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      marginTop: spacing.sm,
    },
  });

  const getCategoryGradient = () => {
    switch (category) {
      case 'f1':
        return colors.gradientF1;
      case 'f2':
        return colors.gradientF1; // Use F1 gradient for F2
      case 'f3':
        return colors.gradientF1; // Use F1 gradient for F3
      case 'motogp':
        return colors.gradientMotoGP;
      case 'indycar':
        return colors.gradientIndyCar;
      case 'nascar':
        return [colors.nascarYellow, colors.nascarBlack];
      default:
        return colors.gradientPrimary;
    }
  };

  const onPressIn = () => {
    if (disablePress) return;
    Animated.spring(scaleAnim, {
      toValue: animations.scale.pressed,
      ...animations.spring,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    if (disablePress) return;
    Animated.spring(scaleAnim, {
      toValue: animations.scale.normal,
      ...animations.spring,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    if (disablePress) return;
    if (onPress) {
      onPress();
    } else {
      console.log('CircuitCard: Navigating to circuit:', circuit.slug, 'category:', category);
      router.push(`/circuit/${circuit.slug}?category=${category}`);
    }
  };

  const cardContent = (
    <LinearGradient
      colors={[colors.card, colors.backgroundAlt]}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.circuitName} numberOfLines={2}>
            {circuit.name}
          </Text>
          <Text style={styles.country}>
            {circuit.country}
          </Text>
        </View>
        
        <View style={styles.weatherContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <WeatherSymbol weatherCode={1} size={32} />
              <Text style={styles.loadingText}>{t('loading')}</Text>
            </View>
          ) : current ? (
            <>
              <WeatherSymbol 
                weatherCode={current.weather_code} 
                size={32}
                latitude={circuit.latitude}
                longitude={circuit.longitude}
              />
              <Text style={styles.temperature}>
                {Math.round(current.temperature)}°
              </Text>
            </>
          ) : (
            <WeatherSymbol weatherCode={1} size={32} />
          )}
        </View>
      </View>

      {current && !loading && (
        <View style={styles.weatherInfo}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>{t('wind')}</Text>
            <Text style={styles.infoValue}>
              {Math.round(current.wind_speed)} {unit === 'metric' ? 'km/h' : 'mph'}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>{t('humidity')}</Text>
            <Text style={styles.infoValue}>
              {Math.round(current.humidity)}%
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>{t('pressure')}</Text>
            <Text style={styles.infoValue}>
              {Math.round(current.pressure)} hPa
            </Text>
          </View>
        </View>
      )}
    </LinearGradient>
  );

  if (disablePress) {
    return (
      <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
        {cardContent}
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
      >
        {cardContent}
      </TouchableOpacity>
    </Animated.View>
  );
}
