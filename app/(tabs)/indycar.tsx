
import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Animated } from 'react-native';
import { colors, commonStyles, spacing, borderRadius, shadows, layout } from '../../styles/commonStyles';
import { indycarCircuits } from '../../data/circuits';
import CircuitCard from '../../components/CircuitCard';
import SearchBar from '../../components/SearchBar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function IndyCarScreen() {
  console.log('IndyCarScreen: Rendering enhanced IndyCar screen with', indycarCircuits.length, 'circuits');
  
  const headerOpacity = useMemo(() => new Animated.Value(0), []);
  const headerTranslateY = useMemo(() => new Animated.Value(-20), []);
  const [query, setQuery] = useState('');

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(headerOpacity, { 
        toValue: 1, 
        duration: 600, 
        useNativeDriver: true 
      }),
      Animated.spring(headerTranslateY, {
        toValue: 0,
        tension: 300,
        friction: 20,
        useNativeDriver: true,
      }),
    ]).start();
  }, [headerOpacity, headerTranslateY]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return indycarCircuits;
    return indycarCircuits.filter((c) =>
      c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <View style={styles.wrapper}>
      {/* Enhanced header with gradient background */}
      <Animated.View style={[
        styles.headerContainer,
        { 
          opacity: headerOpacity,
          transform: [{ translateY: headerTranslateY }]
        }
      ]}>
        <LinearGradient
          colors={[colors.background, colors.backgroundAlt]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.headerGradient}
        />
        
        <View style={styles.headerContent}>
          {/* Title section with enhanced typography and racing logo */}
          <View style={styles.titleSection}>
            <View style={styles.titleContainer}>
              <View style={styles.logoContainer}>
                <View style={styles.logoBackground}>
                  <Ionicons 
                    name="car-sport" 
                    size={28} 
                    color={colors.indycarBlue} 
                  />
                </View>
                <View style={styles.speedLines}>
                  <View style={[styles.speedLine, styles.speedLine1]} />
                  <View style={[styles.speedLine, styles.speedLine2]} />
                  <View style={[styles.speedLine, styles.speedLine3]} />
                </View>
              </View>
              <View style={styles.titleTextContainer}>
                <Text style={styles.title}>IndyCar</Text>
                <View style={styles.titleAccent} />
              </View>
            </View>
            <Text style={styles.subtitle}>Racing Circuits</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{indycarCircuits.length}</Text>
                <Text style={styles.statLabel}>Circuits</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{filtered.length}</Text>
                <Text style={styles.statLabel}>Showing</Text>
              </View>
            </View>
          </View>

          {/* Enhanced search bar */}
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder="Search IndyCar circuits or countries..."
            onClear={() => setQuery('')}
          />
        </View>
      </Animated.View>

      {/* Enhanced content area */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyStateIcon}>
              <Text style={styles.emptyStateIconText}>🏁</Text>
            </View>
            <Text style={styles.emptyStateTitle}>No circuits found</Text>
            <Text style={styles.emptyStateSubtitle}>
              Try adjusting your search terms or clear the search to see all circuits.
            </Text>
          </View>
        ) : (
          <>
            {/* Results header */}
            {query && (
              <View style={styles.resultsHeader}>
                <Text style={styles.resultsText}>
                  Found {filtered.length} circuit{filtered.length !== 1 ? 's' : ''} matching "{query}"
                </Text>
              </View>
            )}
            
            {/* Circuit cards */}
            <View style={styles.circuitsContainer}>
              {filtered.map((circuit, index) => (
                <Animated.View
                  key={circuit.slug}
                  style={{
                    opacity: headerOpacity,
                    transform: [{
                      translateY: headerTranslateY.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20 * (index + 1), 0],
                      })
                    }]
                  }}
                >
                  <CircuitCard circuit={circuit} category="indycar" />
                </Animated.View>
              ))}
            </View>
          </>
        )}
        
        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    position: 'relative',
    zIndex: 1,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerContent: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  titleSection: {
    marginBottom: spacing.lg,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  logoContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBackground: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.indycarBlue,
    boxShadow: `0 4px 12px ${colors.indycarBlue}20`,
  },
  speedLines: {
    position: 'absolute',
    right: -12,
    top: '50%',
    transform: [{ translateY: -6 }],
  },
  speedLine: {
    height: 2,
    backgroundColor: colors.indycarBlue,
    marginVertical: 1,
    borderRadius: 1,
  },
  speedLine1: {
    width: 8,
    opacity: 0.8,
  },
  speedLine2: {
    width: 12,
    opacity: 0.6,
  },
  speedLine3: {
    width: 6,
    opacity: 0.4,
  },
  titleTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    ...commonStyles.title,
    fontSize: 32,
    color: colors.text,
  },
  titleAccent: {
    width: 4,
    height: 24,
    backgroundColor: colors.indycarBlue,
    borderRadius: 2,
  },
  subtitle: {
    ...commonStyles.subtitle,
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.divider,
    boxShadow: shadows.sm,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    ...commonStyles.headingSmall,
    fontSize: 20,
    fontWeight: '700',
    color: colors.indycarBlue,
    fontFamily: 'Roboto_700Bold',
  },
  statLabel: {
    ...commonStyles.captionSmall,
    marginTop: spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.divider,
    marginHorizontal: spacing.md,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.sm,
  },
  resultsHeader: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  resultsText: {
    ...commonStyles.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  circuitsContainer: {
    gap: spacing.sm,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.huge,
    paddingHorizontal: spacing.xl,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  emptyStateIconText: {
    fontSize: 32,
  },
  emptyStateTitle: {
    ...commonStyles.heading,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emptyStateSubtitle: {
    ...commonStyles.bodyMedium,
    textAlign: 'center',
    color: colors.textMuted,
    lineHeight: 22,
  },
  bottomSpacing: {
    height: spacing.huge,
  },
});
