
import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Animated } from 'react-native';
import { colors } from '../../styles/commonStyles';
import { motogpCircuits } from '../../data/circuits';
import CircuitCard from '../../components/CircuitCard';
import SearchBar from '../../components/SearchBar';

export default function MotoGPScreen() {
  console.log('MotoGPScreen: Rendering with', motogpCircuits.length, 'circuits');
  
  const headerOpacity = useMemo(() => new Animated.Value(0), []);
  const [query, setQuery] = useState('');

  React.useEffect(() => {
    Animated.timing(headerOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, [headerOpacity]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return motogpCircuits;
    return motogpCircuits.filter((c) =>
      c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <View style={styles.wrapper}>
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <Text style={styles.title}>MotoGP</Text>
        <Text style={styles.subtitle}>2025 / 2026 Circuits</Text>
        <View style={{ height: 10 }} />
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Search circuits or countries"
          onClear={() => setQuery('')}
        />
      </Animated.View>
      <ScrollView contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled">
        {filtered.length === 0 ? (
          <Text style={styles.empty}>No circuits match your search.</Text>
        ) : (
          filtered.map((c) => <CircuitCard key={c.slug} circuit={c} category="motogp" />)
        )}
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
  empty: { color: colors.textMuted, paddingHorizontal: 4, marginTop: 10, fontFamily: 'Roboto_400Regular' },
});
