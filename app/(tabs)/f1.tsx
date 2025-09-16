
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getColors, getCommonStyles, spacing, borderRadius, getShadows, layout } from '../../styles/commonStyles';
import { useTheme } from '../../state/ThemeContext';
import CircuitCard from '../../components/CircuitCard';
import FeaturedTrackCard from '../../components/FeaturedTrackCard';
import ChequeredFlag from '../../components/ChequeredFlag';
import { f1Circuits } from '../../data/circuits';

export default function F1Screen() {
  const [searchQuery, setSearchQuery] = useState('');
  const { isDark } = useTheme();
  
  const colors = getColors(isDark);
  const commonStyles = getCommonStyles(isDark);
  const shadows = getShadows(isDark);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: layout.screenPadding,
      paddingTop: spacing.lg,
      paddingBottom: spacing.md,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    headerTitle: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    title: {
      fontSize: 32,
      fontWeight: '800',
      color: colors.f1Red,
      fontFamily: 'Roboto_700Bold',
      marginLeft: spacing.md,
      letterSpacing: -1,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      fontFamily: 'Roboto_400Regular',
      marginBottom: spacing.lg,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.backgroundAlt,
      borderRadius: borderRadius.lg,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchIcon: {
      marginRight: spacing.md,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
      fontFamily: 'Roboto_400Regular',
    },
    content: {
      flex: 1,
    },
    scrollContent: {
      padding: layout.screenPadding,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
      fontFamily: 'Roboto_500Medium',
      marginBottom: spacing.lg,
      marginTop: spacing.md,
    },
    circuitsGrid: {
      gap: spacing.md,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.xl,
      paddingHorizontal: spacing.md,
    },
    statItem: {
      alignItems: 'center',
      backgroundColor: colors.card,
      padding: spacing.lg,
      borderRadius: borderRadius.lg,
      flex: 1,
      marginHorizontal: spacing.xs,
      borderWidth: 1,
      borderColor: colors.borderLight,
      boxShadow: shadows.sm,
    },
    statNumber: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.f1Red,
      fontFamily: 'Roboto_700Bold',
    },
    statLabel: {
      fontSize: 12,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginTop: spacing.xs,
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.massive,
    },
    emptyText: {
      fontSize: 16,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      textAlign: 'center',
      marginTop: spacing.lg,
    },
  });

  const filteredCircuits = useMemo(() => {
    if (!searchQuery.trim()) return f1Circuits;
    
    const query = searchQuery.toLowerCase().trim();
    return f1Circuits.filter(circuit => 
      circuit.name.toLowerCase().includes(query) ||
      circuit.country.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  console.log('F1Screen: Rendering with', filteredCircuits.length, 'circuits, theme:', isDark ? 'dark' : 'light');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitle}>
          <ChequeredFlag size={32} />
          <Text style={styles.title}>Formula 1</Text>
        </View>
        
        <Text style={styles.subtitle}>
          2026 Championship Calendar • {f1Circuits.length} Circuits
        </Text>

        <View style={styles.searchContainer}>
          <Ionicons 
            name="search" 
            size={20} 
            color={colors.textMuted} 
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search circuits or countries..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Ionicons 
              name="close-circle" 
              size={20} 
              color={colors.textMuted}
              onPress={() => setSearchQuery('')}
            />
          )}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.scrollContent}>
          <FeaturedTrackCard category="f1" />

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{f1Circuits.length}</Text>
              <Text style={styles.statLabel}>Circuits</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>24</Text>
              <Text style={styles.statLabel}>Races</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>20</Text>
              <Text style={styles.statLabel}>Teams</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>
            All Circuits ({filteredCircuits.length})
          </Text>

          {filteredCircuits.length > 0 ? (
            <View style={styles.circuitsGrid}>
              {filteredCircuits.map((circuit) => (
                <CircuitCard
                  key={circuit.slug}
                  circuit={circuit}
                  category="f1"
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons 
                name="search" 
                size={48} 
                color={colors.textMuted} 
              />
              <Text style={styles.emptyText}>
                No circuits found matching "{searchQuery}"
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
