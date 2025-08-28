
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { router } from 'expo-router';
import { useWeather } from '../hooks/useWeather';
import { useUnit } from '../state/UnitContext';
import { colors } from '../styles/commonStyles';

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
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const tempUnit = unit === 'metric' ? '°C' : '°F';
  const windUnit = unit === 'metric' ? 'km/h' : 'mph';

  console.log('CircuitCard: Rendering', circuit.name, 'loading:', loading, 'current:', !!current);

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => {
          console.log('CircuitCard: Navigating to', circuit.slug, category);
          router.push(`/circuit/${circuit.slug}?category=${category}`);
        }}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        <View style={styles.header}>
          <Text style={styles.name}>{circuit.name}</Text>
          <Text style={styles.country}>{circuit.country}</Text>
        </View>
        
        <View style={styles.weather}>
          {loading ? (
            <Text style={styles.weatherText}>Loading...</Text>
          ) : current ? (
            <>
              <Text style={styles.temp}>{Math.round(current.temperature)}{tempUnit}</Text>
              <Text style={styles.wind}>{Math.round(current.wind_speed)} {windUnit}</Text>
            </>
          ) : (
            <Text style={styles.weatherText}>No data</Text>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.divider,
    boxShadow: '0 6px 24px rgba(16,24,40,0.06)',
  },
  header: {
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Roboto_700Bold',
    marginBottom: 2,
  },
  country: {
    fontSize: 14,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
  },
  weather: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  temp: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    fontFamily: 'Roboto_500Medium',
  },
  wind: {
    fontSize: 14,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
  },
  weatherText: {
    fontSize: 14,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
  },
});
