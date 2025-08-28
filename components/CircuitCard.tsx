
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { router } from 'expo-router';
import { useWeather } from '../hooks/useWeather';
import { useUnit } from '../state/UnitContext';
import { colors, animations } from '../styles/commonStyles';
import WeatherSymbol from './WeatherSymbol';

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

  const tempUnit = unit === 'metric' ? '°C' : '°F';
  const windUnit = unit === 'metric' ? 'km/h' : 'mph';

  // Get category-specific colors
  const categoryColor = category === 'f1' ? colors.f1Red : colors.motogpBlue;
  const categoryAccent = category === 'f1' ? colors.f1Gold : colors.motogpOrange;

  console.log('CircuitCard: Rendering', circuit.name, 'loading:', loading, 'current:', !!current);

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
      <TouchableOpacity
        style={[styles.card, { borderLeftColor: categoryColor }]}
        activeOpacity={0.9}
        onPress={() => {
          console.log('CircuitCard: Navigating to', circuit.slug, category);
          router.push(`/circuit/${circuit.slug}?category=${category}`);
        }}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        {/* Category indicator */}
        <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
          <Text style={styles.categoryText}>{category.toUpperCase()}</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.name}>{circuit.name}</Text>
            <Text style={styles.country}>{circuit.country}</Text>
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
                    size={32}
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

        {/* Decorative accent */}
        <View style={[styles.accent, { backgroundColor: categoryAccent }]} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.divider,
    borderLeftWidth: 4,
    boxShadow: `0 8px 32px ${colors.shadow}`,
    overflow: 'hidden',
    position: 'relative',
  },
  categoryBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 1,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Roboto_700Bold',
    letterSpacing: 0.5,
  },
  content: {
    padding: 20,
    paddingTop: 16,
  },
  header: {
    marginBottom: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Roboto_700Bold',
    marginBottom: 4,
    letterSpacing: -0.3,
    lineHeight: 24,
  },
  country: {
    fontSize: 14,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
    letterSpacing: 0.2,
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
    width: 8,
    height: 8,
    borderRadius: 4,
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
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tempContainer: {
    alignItems: 'flex-start',
  },
  temp: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Roboto_700Bold',
    letterSpacing: -0.5,
  },
  tempLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  windContainer: {
    alignItems: 'center',
  },
  wind: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Roboto_500Medium',
  },
  windLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  humidityContainer: {
    alignItems: 'flex-end',
  },
  humidity: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Roboto_500Medium',
  },
  humidityLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
    marginTop: 2,
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
    width: 60,
    height: 3,
    borderTopLeftRadius: 8,
  },
});
