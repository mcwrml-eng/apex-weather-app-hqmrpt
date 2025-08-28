
import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Animated } from 'react-native';
import { colors } from '../../styles/commonStyles';
import { motogpCircuits } from '../../data/circuits';
import CircuitCard from '../../components/CircuitCard';

export default function MotoGPScreen() {
  const headerOpacity = useMemo(() => new Animated.Value(0), []);
  React.useEffect(() => {
    Animated.timing(headerOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, [headerOpacity]);

  return (
    <View style={styles.wrapper}>
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <Text style={styles.title}>MotoGP</Text>
        <Text style={styles.subtitle}>2025 / 2026 Circuits</Text>
      </Animated.View>
      <ScrollView contentContainerStyle={styles.list}>
        {motogpCircuits.map((c) => (
          <CircuitCard key={c.slug} circuit={c} category="motogp" />
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'Roboto_700Bold',
  },
  subtitle: {
    color: colors.textMuted,
    marginTop: 4,
    fontFamily: 'Roboto_400Regular',
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 6,
  },
});
