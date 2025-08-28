
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { colors } from '../styles/commonStyles';
import { useWeather } from '../hooks/useWeather';
import { router } from 'expo-router';

export type Category = 'f1' | 'motogp';

export interface Circuit {
  slug: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
}

interface Props {
  circuit: Circuit;
  category: Category;
}

export default function CircuitCard({ circuit, category }: Props) {
  const { current } = useWeather(circuit.latitude, circuit.longitude, 'metric');
  const scale = useMemo(() => new Animated.Value(1), []);

  const onPressIn = () => {
    Animated.spring(scale, { toValue: 0.98, useNativeDriver: true }).start();
  };
  const onPressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }], marginBottom: 12 }}>
      <TouchableOpacity
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={() => {
          console.log('Navigating to detail', circuit.slug);
          router.push({ pathname: '/circuit/[slug]', params: { slug: circuit.slug, category } });
        }}
        activeOpacity={0.9}
        style={styles.card}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{circuit.name}</Text>
          <Text style={styles.subtitle}>{circuit.country}</Text>
        </View>

        <View style={styles.right}>
          <Text style={styles.temp}>
            {current ? `${Math.round(current.temperature)}°C` : '—'}
          </Text>
          <Text style={styles.small}>{current ? `Wind ${Math.round(current.wind_speed)} km/h` : 'Loading…'}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.divider,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    boxShadow: '0 6px 24px rgba(16,24,40,0.06)',
  },
  title: { color: colors.text, fontWeight: '700', fontSize: 16, fontFamily: 'Roboto_700Bold' },
  subtitle: { color: colors.textMuted, marginTop: 2, fontFamily: 'Roboto_400Regular' },
  right: { alignItems: 'flex-end' },
  temp: { color: colors.text, fontWeight: '700', fontSize: 18, fontFamily: 'Roboto_700Bold' },
  small: { color: colors.textMuted, marginTop: 2, fontFamily: 'Roboto_400Regular' },
});
