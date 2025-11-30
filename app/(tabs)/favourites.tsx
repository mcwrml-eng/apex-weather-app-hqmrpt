
import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getColors, getCommonStyles, spacing, borderRadius, getShadows, layout } from '../../styles/commonStyles';
import { useTheme } from '../../state/ThemeContext';
import { useLanguage } from '../../state/LanguageContext';
import { useUnit } from '../../state/UnitContext';
import AppHeader from '../../components/AppHeader';
import CircuitCard from '../../components/CircuitCard';
import { f1Circuits, motogpCircuits, indycarCircuits, nascarCircuits } from '../../data/circuits';
import { f2Circuits, f3Circuits } from '../../data/f2f3-circuits';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useWeather } from '../../hooks/useWeather';
import WeatherSymbol from '../../components/WeatherSymbol';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';

const FAVOURITES_STORAGE_KEY = '@motorsport_weather_favourites';

interface FavouriteLocation {
  id: string;
  type: 'circuit' | 'custom';
  name: string;
  country?: string;
  latitude: number;
  longitude: number;
  category?: 'f1' | 'f2' | 'f3' | 'motogp' | 'indycar' | 'nascar';
  slug?: string;
  addedAt: number;
}

export default function FavouritesScreen() {
  const [favourites, setFavourites] = useState<FavouriteLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const { unit } = useUnit();
  
  const colors = getColors(isDark);
  const commonStyles = getCommonStyles(isDark);
  const shadows = getShadows(isDark);

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
    },
    section: {
      marginBottom: spacing.xl,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      fontFamily: 'Roboto_500Medium',
      marginBottom: spacing.md,
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
      fontSize: 20,
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
      paddingHorizontal: spacing.xl,
    },
    emptyHint: {
      fontSize: 13,
      color: colors.textSecondary,
      fontFamily: 'Roboto_400Regular',
      textAlign: 'center',
      marginTop: spacing.md,
      fontStyle: 'italic',
    },
    customLocationCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      marginBottom: spacing.md,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.borderLight,
      boxShadow: shadows.sm,
    },
    gradient: {
      padding: spacing.lg,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.sm,
    },
    locationInfo: {
      flex: 1,
      marginRight: spacing.md,
    },
    locationName: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      fontFamily: 'Roboto_500Medium',
      marginBottom: 2,
    },
    locationDetails: {
      fontSize: 14,
      color: colors.textSecondary,
      fontFamily: 'Roboto_400Regular',
    },
    weatherContainer: {
      alignItems: 'center',
      minWidth: 60,
    },
    temperature: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.temperature,
      fontFamily: 'Roboto_700Bold',
      textAlign: 'center',
    },
    weatherInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: spacing.sm,
      paddingTop: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    },
    infoItem: {
      alignItems: 'center',
      flex: 1,
    },
    infoLabel: {
      fontSize: 11,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 2,
    },
    infoValue: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      fontFamily: 'Roboto_500Medium',
    },
    circuitCardWrapper: {
      marginBottom: spacing.md,
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
  });

  // Load favourites from storage - using useFocusEffect to reload when tab comes into focus
  const loadFavourites = useCallback(async () => {
    try {
      console.log('Favourites: Loading favourites from storage');
      setLoading(true);
      const stored = await AsyncStorage.getItem(FAVOURITES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('Favourites: Loaded', parsed.length, 'favourites:', parsed.map((f: FavouriteLocation) => f.id));
        setFavourites(parsed);
      } else {
        console.log('Favourites: No favourites found in storage');
        setFavourites([]);
      }
    } catch (error) {
      console.error('Favourites: Error loading favourites:', error);
      setFavourites([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Use useFocusEffect to reload favourites when the tab comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('Favourites: Tab focused, reloading favourites');
      loadFavourites();
    }, [loadFavourites])
  );

  const circuitFavourites = useMemo(() => 
    favourites.filter(fav => fav.type === 'circuit'),
    [favourites]
  );

  const customFavourites = useMemo(() => 
    favourites.filter(fav => fav.type === 'custom'),
    [favourites]
  );

  console.log('FavouritesScreen: Rendering with', favourites.length, 'favourites, theme:', isDark ? 'dark' : 'light');

  if (loading) {
    return (
      <View style={styles.container}>
        <AppHeader
          title="Favourites"
          subtitle="Your saved locations"
          icon={<Ionicons name="heart" size={32} color={colors.primary} />}
        />
        <View style={styles.emptyState}>
          <Ionicons name="hourglass-outline" size={64} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader
        title="Favourites"
        subtitle={`${favourites.length} saved location${favourites.length !== 1 ? 's' : ''}`}
        icon={<Ionicons name="heart" size={32} color={colors.primary} />}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.scrollContent}>
          {favourites.length > 0 && (
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{favourites.length}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{circuitFavourites.length}</Text>
                <Text style={styles.statLabel}>Circuits</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{customFavourites.length}</Text>
                <Text style={styles.statLabel}>Custom</Text>
              </View>
            </View>
          )}

          {favourites.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="heart-outline"
                size={64}
                color={colors.textMuted}
                style={styles.emptyIcon}
              />
              <Text style={styles.emptyTitle}>No Favourites Yet</Text>
              <Text style={styles.emptyText}>
                Start adding your favourite racing circuits and custom locations to quickly access their weather forecasts.
              </Text>
              <Text style={styles.emptyHint}>
                Tap the heart icon on any circuit or custom location to add it to your favourites
              </Text>
            </View>
          ) : (
            <>
              {circuitFavourites.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>
                    Racing Circuits ({circuitFavourites.length})
                  </Text>
                  {circuitFavourites.map((favourite) => {
                    const circuit = {
                      slug: favourite.slug || favourite.id,
                      name: favourite.name,
                      country: favourite.country || '',
                      latitude: favourite.latitude,
                      longitude: favourite.longitude,
                    };
                    
                    return (
                      <View key={favourite.id} style={styles.circuitCardWrapper}>
                        <TouchableOpacity
                          onPress={() => {
                            console.log('Favourites: Circuit card pressed, navigating to:', favourite.slug);
                            router.push(`/circuit/${favourite.slug}?category=${favourite.category || 'f1'}`);
                          }}
                          activeOpacity={0.8}
                        >
                          <CircuitCard
                            circuit={circuit}
                            category={favourite.category || 'f1'}
                            disablePress={true}
                          />
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              )}

              {customFavourites.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>
                    Custom Locations ({customFavourites.length})
                  </Text>
                  {customFavourites.map((favourite) => (
                    <CustomLocationCard
                      key={favourite.id}
                      favourite={favourite}
                      colors={colors}
                      styles={styles}
                      unit={unit}
                    />
                  ))}
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

interface CustomLocationCardProps {
  favourite: FavouriteLocation;
  colors: any;
  styles: any;
  unit: string;
}

function CustomLocationCard({ favourite, colors, styles, unit }: CustomLocationCardProps) {
  const { current, loading } = useWeather(favourite.latitude, favourite.longitude, unit === 'metric' ? 'metric' : 'imperial');

  return (
    <View style={{ marginBottom: spacing.md }}>
      <View style={styles.customLocationCard}>
        <LinearGradient
          colors={[colors.card, colors.backgroundAlt]}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.cardHeader}>
            <View style={styles.locationInfo}>
              <Text style={styles.locationName} numberOfLines={2}>
                {favourite.name}
              </Text>
              <Text style={styles.locationDetails}>
                {favourite.country || 'Custom Location'}
              </Text>
              <Text style={[styles.locationDetails, { fontSize: 12, marginTop: 2 }]}>
                {favourite.latitude.toFixed(4)}°, {favourite.longitude.toFixed(4)}°
              </Text>
            </View>

            <View style={styles.weatherContainer}>
              {loading ? (
                <WeatherSymbol weatherCode={1} size={32} latitude={favourite.latitude} longitude={favourite.longitude} />
              ) : current ? (
                <>
                  <WeatherSymbol 
                    weatherCode={current.weather_code} 
                    size={32}
                    latitude={favourite.latitude}
                    longitude={favourite.longitude}
                  />
                  <Text style={styles.temperature}>
                    {Math.round(current.temperature)}°
                  </Text>
                </>
              ) : (
                <WeatherSymbol weatherCode={1} size={32} latitude={favourite.latitude} longitude={favourite.longitude} />
              )}
            </View>
          </View>

          {current && !loading && (
            <View style={styles.weatherInfo}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Wind</Text>
                <Text style={styles.infoValue}>
                  {Math.round(current.wind_speed)} {unit === 'metric' ? 'km/h' : 'mph'}
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Humidity</Text>
                <Text style={styles.infoValue}>
                  {Math.round(current.humidity)}%
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Pressure</Text>
                <Text style={styles.infoValue}>
                  {Math.round(current.pressure)} hPa
                </Text>
              </View>
            </View>
          )}
        </LinearGradient>
      </View>
    </View>
  );
}
