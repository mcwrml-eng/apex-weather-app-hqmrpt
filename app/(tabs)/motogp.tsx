
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '../../state/ThemeContext';
import { getColors, spacing, borderRadius, getShadows } from '../../styles/commonStyles';
import { motogpCircuits } from '../../data/circuits';
import CircuitCard from '../../components/CircuitCard';
import SearchBar from '../../components/SearchBar';
import Icon from '../../components/Icon';
import InteractiveGlobe from '../../components/InteractiveGlobe';

export default function MotoGPScreen() {
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const shadows = getShadows(isDark);
  const [searchQuery, setSearchQuery] = useState('');
  const [showGlobe, setShowGlobe] = useState(false);

  const filteredCircuits = useMemo(() => {
    if (!searchQuery.trim()) return motogpCircuits;
    const query = searchQuery.toLowerCase();
    return motogpCircuits.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.country.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleTrackSelect = (slug: string) => {
    router.push({
      pathname: '/circuit/[slug]',
      params: { slug, category: 'motogp' },
    });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.lg,
      paddingBottom: spacing.md,
    },
    title: {
      fontSize: 32,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Roboto_700Bold',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
    },
    toggleContainer: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 12,
    },
    toggleButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: colors.backgroundAlt,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.divider,
    },
    toggleButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    toggleButtonText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
      fontFamily: 'Roboto_600SemiBold',
    },
    toggleButtonTextActive: {
      color: '#fff',
    },
    content: {
      paddingHorizontal: spacing.md,
      paddingBottom: 100,
    },
    searchContainer: {
      marginBottom: spacing.md,
    },
    resultsText: {
      fontSize: 14,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      marginBottom: spacing.sm,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>MotoGP</Text>
        <Text style={styles.subtitle}>
          {motogpCircuits.length} circuits • 2025/2026 season
        </Text>
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, !showGlobe && styles.toggleButtonActive]}
            onPress={() => setShowGlobe(false)}
            activeOpacity={0.7}
          >
            <Icon name="list" size={16} color={!showGlobe ? '#fff' : colors.text} />
            <Text style={[styles.toggleButtonText, !showGlobe && styles.toggleButtonTextActive]}>
              List View
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, showGlobe && styles.toggleButtonActive]}
            onPress={() => setShowGlobe(true)}
            activeOpacity={0.7}
          >
            <Icon name="globe-outline" size={16} color={showGlobe ? '#fff' : colors.text} />
            <Text style={[styles.toggleButtonText, showGlobe && styles.toggleButtonTextActive]}>
              Globe View
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {showGlobe ? (
          <InteractiveGlobe
            category="motogp"
            onTrackSelect={handleTrackSelect}
          />
        ) : (
          <>
            <View style={styles.searchContainer}>
              <SearchBar
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search MotoGP circuits..."
              />
            </View>

            {searchQuery.trim() !== '' && (
              <Text style={styles.resultsText}>
                {filteredCircuits.length} result{filteredCircuits.length !== 1 ? 's' : ''} found
              </Text>
            )}

            {filteredCircuits.map((circuit) => (
              <CircuitCard
                key={circuit.slug}
                circuit={circuit}
                category="motogp"
                onPress={() => handleTrackSelect(circuit.slug)}
              />
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}
