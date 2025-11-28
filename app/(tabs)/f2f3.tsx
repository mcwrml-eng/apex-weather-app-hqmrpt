
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getColors, getCommonStyles, spacing, borderRadius, getShadows, layout } from '../../styles/commonStyles';
import { useTheme } from '../../state/ThemeContext';
import { useLanguage } from '../../state/LanguageContext';
import CircuitCard from '../../components/CircuitCard';
import AppHeader from '../../components/AppHeader';
import ErrorBoundary from '../../components/ErrorBoundary';
import { f2Circuits, f3Circuits } from '../../data/f2f3-circuits';

export default function F2F3Screen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'f2' | 'f3'>('all');
  const { isDark } = useTheme();
  const { t } = useLanguage();
  
  const colors = getColors(isDark);
  const commonStyles = getCommonStyles(isDark);
  const shadows = getShadows(isDark);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
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
      marginHorizontal: layout.screenPadding,
      marginBottom: spacing.lg,
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
    filterContainer: {
      flexDirection: 'row',
      marginBottom: spacing.xl,
      gap: spacing.md,
    },
    filterButton: {
      flex: 1,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      alignItems: 'center',
    },
    filterButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    filterText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      fontFamily: 'Roboto_500Medium',
      textTransform: 'uppercase',
    },
    filterTextActive: {
      color: colors.background,
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
      color: colors.primary,
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

  const allCircuits = useMemo(() => {
    const f2WithCategory = f2Circuits.map(circuit => ({ ...circuit, category: 'f2' as const }));
    const f3WithCategory = f3Circuits.map(circuit => ({ ...circuit, category: 'f3' as const }));
    return [...f2WithCategory, ...f3WithCategory];
  }, []);

  const filteredCircuits = useMemo(() => {
    try {
      let circuits = allCircuits;

      // Filter by category
      if (selectedCategory !== 'all') {
        circuits = circuits.filter(circuit => circuit.category === selectedCategory);
      }

      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        circuits = circuits.filter(circuit => 
          circuit.name.toLowerCase().includes(query) ||
          circuit.country.toLowerCase().includes(query)
        );
      }

      return circuits;
    } catch (error) {
      console.error('F2F3Screen: Error filtering circuits:', error);
      return allCircuits;
    }
  }, [searchQuery, selectedCategory, allCircuits]);

  const f2Count = f2Circuits.length;
  const f3Count = f3Circuits.length;

  console.log('F2F3Screen: Rendering with', filteredCircuits.length, 'circuits, theme:', isDark ? 'dark' : 'light');

  return (
    <ErrorBoundary>
      <View style={styles.container}>
        <AppHeader
          title="F2 / F3"
          subtitle={`FIA Formula 2 & Formula 3 • ${allCircuits.length} ${t('circuits')}`}
          icon={<Ionicons name="trophy" size={32} color={colors.primary} />}
        />

        <View style={styles.searchContainer}>
          <Ionicons 
            name="search" 
            size={20} 
            color={colors.textMuted} 
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder={t('search_circuits')}
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

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.scrollContent}>
            <View style={styles.filterContainer}>
              <View 
                style={[
                  styles.filterButton, 
                  selectedCategory === 'all' && styles.filterButtonActive
                ]}
                onTouchEnd={() => setSelectedCategory('all')}
              >
                <Text style={[
                  styles.filterText,
                  selectedCategory === 'all' && styles.filterTextActive
                ]}>
                  All
                </Text>
              </View>
              <View 
                style={[
                  styles.filterButton, 
                  selectedCategory === 'f2' && styles.filterButtonActive
                ]}
                onTouchEnd={() => setSelectedCategory('f2')}
              >
                <Text style={[
                  styles.filterText,
                  selectedCategory === 'f2' && styles.filterTextActive
                ]}>
                  F2
                </Text>
              </View>
              <View 
                style={[
                  styles.filterButton, 
                  selectedCategory === 'f3' && styles.filterButtonActive
                ]}
                onTouchEnd={() => setSelectedCategory('f3')}
              >
                <Text style={[
                  styles.filterText,
                  selectedCategory === 'f3' && styles.filterTextActive
                ]}>
                  F3
                </Text>
              </View>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{f2Count}</Text>
                <Text style={styles.statLabel}>F2 {t('circuits')}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{f3Count}</Text>
                <Text style={styles.statLabel}>F3 {t('circuits')}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{allCircuits.length}</Text>
                <Text style={styles.statLabel}>{t('total')}</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>
              {selectedCategory === 'all' ? t('all_circuits') : selectedCategory.toUpperCase() + ' ' + t('circuits')} ({filteredCircuits.length})
            </Text>

            {filteredCircuits.length > 0 ? (
              <View style={styles.circuitsGrid}>
                {filteredCircuits.map((circuit) => (
                  <ErrorBoundary key={`${circuit.category}-${circuit.slug}`}>
                    <CircuitCard
                      circuit={circuit}
                      category="f1"
                    />
                  </ErrorBoundary>
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
                  {t('no_circuits_found')} &quot;{searchQuery}&quot;
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </ErrorBoundary>
  );
}
