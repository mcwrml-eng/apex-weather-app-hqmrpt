
import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getColors, getCommonStyles, spacing, borderRadius, getShadows, layout } from '../../styles/commonStyles';
import { useTheme } from '../../state/ThemeContext';
import { useLanguage } from '../../state/LanguageContext';
import AppHeader from '../../components/AppHeader';
import ErrorBoundary from '../../components/ErrorBoundary';
import FavoritesService, { FavoriteCircuit } from '../../utils/favoritesService';
import CircuitCard from '../../components/CircuitCard';
import { getCircuitBySlug } from '../../data/circuits';
import { getF2F3CircuitBySlug } from '../../data/f2f3-circuits';
import { useFocusEffect } from '@react-navigation/native';

export default function FavoritesScreen() {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const colors = getColors(isDark);
  const commonStyles = getCommonStyles(isDark);
  const shadows = getShadows(isDark);

  const [favorites, setFavorites] = useState<FavoriteCircuit[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      loadFavorites();
    }, [])
  );

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const fav = await FavoritesService.getFavorites();
      setFavorites(fav);
      console.log('FavoritesScreen: Loaded', fav.length, 'favorites');
    } catch (error) {
      console.error('FavoritesScreen: Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (slug: string, category: string) => {
    try {
      await FavoritesService.removeFavorite(slug, category);
      await loadFavorites();
    } catch (error) {
      console.error('FavoritesScreen: Error removing favorite:', error);
    }
  };

  const handleClearAll = async () => {
    try {
      await FavoritesService.clearAllFavorites();
      await loadFavorites();
    } catch (error) {
      console.error('FavoritesScreen: Error clearing favorites:', error);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
    },
    scrollContent: {
      padding: layout.screenPadding,
      paddingBottom: 100,
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
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.massive,
    },
    emptyIcon: {
      marginBottom: spacing.lg,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      fontFamily: 'Roboto_500Medium',
      marginBottom: spacing.sm,
      textAlign: 'center',
    },
    emptyText: {
      fontSize: 14,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      textAlign: 'center',
      lineHeight: 20,
    },
    favoriteCardContainer: {
      position: 'relative',
      marginBottom: spacing.md,
    },
    removeButton: {
      position: 'absolute',
      top: spacing.md,
      right: spacing.md,
      backgroundColor: colors.error,
      borderRadius: borderRadius.round,
      width: 36,
      height: 36,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
      boxShadow: shadows.md,
    },
    clearAllButton: {
      backgroundColor: colors.error + '20',
      borderRadius: borderRadius.md,
      padding: spacing.md,
      alignItems: 'center',
      marginTop: spacing.lg,
      borderWidth: 1,
      borderColor: colors.error,
    },
    clearAllButtonText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.error,
      fontFamily: 'Roboto_500Medium',
    },
    loadingContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.massive,
    },
    loadingText: {
      fontSize: 14,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      marginTop: spacing.md,
    },
  });

  console.log('FavoritesScreen: Rendering with', favorites.length, 'favorites, theme:', isDark ? 'dark' : 'light');

  return (
    <ErrorBoundary>
      <View style={styles.container}>
        <AppHeader
          title="Favorites"
          subtitle="Your saved circuits"
          icon={<Ionicons name="heart" size={32} color={colors.primary} />}
        />

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.scrollContent}>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{favorites.length}</Text>
                <Text style={styles.statLabel}>Saved</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {new Set(favorites.map(f => f.category)).size}
                </Text>
                <Text style={styles.statLabel}>Categories</Text>
              </View>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <Ionicons name="heart-outline" size={48} color={colors.textMuted} />
                <Text style={styles.loadingText}>Loading favorites...</Text>
              </View>
            ) : favorites.length > 0 ? (
              <>
                <Text style={styles.sectionTitle}>
                  Your Favorite Circuits ({favorites.length})
                </Text>

                <View style={styles.circuitsGrid}>
                  {favorites.map((favorite, index) => {
                    const circuit = favorite.category === 'f2' || favorite.category === 'f3'
                      ? getF2F3CircuitBySlug(favorite.slug, favorite.category)
                      : getCircuitBySlug(favorite.slug, favorite.category);

                    if (!circuit) return null;

                    return (
                      <React.Fragment key={`${favorite.slug}-${favorite.category}`}>
                        <View style={styles.favoriteCardContainer}>
                          <TouchableOpacity
                            style={styles.removeButton}
                            onPress={() => handleRemoveFavorite(favorite.slug, favorite.category)}
                          >
                            <Ionicons name="close" size={20} color="#FFFFFF" />
                          </TouchableOpacity>

                          <CircuitCard
                            circuit={circuit}
                            category={favorite.category}
                          />
                        </View>
                      </React.Fragment>
                    );
                  })}
                </View>

                {favorites.length > 0 && (
                  <TouchableOpacity
                    style={styles.clearAllButton}
                    onPress={handleClearAll}
                  >
                    <Text style={styles.clearAllButtonText}>
                      Clear All Favorites
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons
                  name="heart-outline"
                  size={64}
                  color={colors.textMuted}
                  style={styles.emptyIcon}
                />
                <Text style={styles.emptyTitle}>No Favorites Yet</Text>
                <Text style={styles.emptyText}>
                  Add circuits to your favorites for quick access{'\n'}
                  to your favorite racing venues
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </ErrorBoundary>
  );
}
