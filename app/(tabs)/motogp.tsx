
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getColors, getCommonStyles, spacing, borderRadius, getShadows, layout } from '../../styles/commonStyles';
import { useTheme } from '../../state/ThemeContext';
import { useLanguage } from '../../state/LanguageContext';
import CircuitCard from '../../components/CircuitCard';
import FeaturedTrackCard from '../../components/FeaturedTrackCard';
import AppHeader from '../../components/AppHeader';
import ErrorBoundary from '../../components/ErrorBoundary';
import Footer from '../../components/Footer';
import { motogpCircuits } from '../../data/circuits';

export default function MotoGPScreen() {
  const [searchQuery, setSearchQuery] = useState('');
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
      paddingBottom: spacing.xl,
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
      color: colors.motogpOrange,
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
    try {
      if (!searchQuery.trim()) return motogpCircuits;
      
      const query = searchQuery.toLowerCase().trim();
      return motogpCircuits.filter(circuit => 
        circuit.name.toLowerCase().includes(query) ||
        circuit.country.toLowerCase().includes(query)
      );
    } catch (error) {
      console.error('MotoGPScreen: Error filtering circuits:', error);
      return motogpCircuits;
    }
  }, [searchQuery]);

  console.log('MotoGPScreen: Rendering with', filteredCircuits.length, 'circuits, theme:', isDark ? 'dark' : 'light');

  return (
    <ErrorBoundary>
      <View style={styles.container}>
        <AppHeader
          title={t('motogp')}
          subtitle={`${t('championship_calendar')} • ${motogpCircuits.length} ${t('circuits')}`}
          icon={<Ionicons name="bicycle" size={32} color={colors.motogpOrange} />}
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
            <ErrorBoundary>
              <FeaturedTrackCard category="motogp" />
            </ErrorBoundary>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{motogpCircuits.length}</Text>
                <Text style={styles.statLabel}>{t('circuits')}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>20</Text>
                <Text style={styles.statLabel}>{t('races')}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>6</Text>
                <Text style={styles.statLabel}>{t('teams')}</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>
              {t('all_circuits')} ({filteredCircuits.length})
            </Text>

            {filteredCircuits.length > 0 ? (
              <View style={styles.circuitsGrid}>
                {filteredCircuits.map((circuit) => (
                  <ErrorBoundary key={circuit.slug}>
                    <CircuitCard
                      circuit={circuit}
                      category="motogp"
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
          <Footer />
        </ScrollView>
      </View>
    </ErrorBoundary>
  );
}
