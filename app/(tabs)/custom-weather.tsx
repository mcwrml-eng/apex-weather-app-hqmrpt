
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Platform, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getColors, getCommonStyles, spacing, borderRadius, getShadows, layout } from '../../styles/commonStyles';
import { useTheme } from '../../state/ThemeContext';
import { useLanguage } from '../../state/LanguageContext';
import { useUnit } from '../../state/UnitContext';
import AppHeader from '../../components/AppHeader';
import { useWeather } from '../../hooks/useWeather';
import WeatherSymbol from '../../components/WeatherSymbol';
import TwelveHourForecast from '../../components/TwelveHourForecast';
import TrackRainfallRadar from '../../components/TrackRainfallRadar';
import { LinearGradient } from 'expo-linear-gradient';
import { toggleFavourite, isFavourite } from '../../utils/favourites';
import * as Haptics from 'expo-haptics';

interface SavedLocation {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
}

interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
  country_code?: string;
}

// Popular locations for quick selection
const POPULAR_LOCATIONS: SavedLocation[] = [
  { name: 'New York, USA', latitude: 40.7128, longitude: -74.0060 },
  { name: 'London, UK', latitude: 51.5074, longitude: -0.1278 },
  { name: 'Tokyo, Japan', latitude: 35.6762, longitude: 139.6503 },
  { name: 'Paris, France', latitude: 48.8566, longitude: 2.3522 },
  { name: 'Sydney, Australia', latitude: -33.8688, longitude: 151.2093 },
  { name: 'Dubai, UAE', latitude: 25.2048, longitude: 55.2708 },
  { name: 'Singapore', latitude: 1.3521, longitude: 103.8198 },
  { name: 'Los Angeles, USA', latitude: 34.0522, longitude: -118.2437 },
];

export default function CustomWeatherScreen() {
  const [locationSearch, setLocationSearch] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<SavedLocation | null>(null);
  const [showCoordinates, setShowCoordinates] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isFav, setIsFav] = useState(false);
  
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const { unit } = useUnit();
  
  const colors = getColors(isDark);
  const commonStyles = getCommonStyles(isDark);
  const shadows = getShadows(isDark);

  // Parse coordinates
  const parsedLat = useMemo(() => {
    const num = parseFloat(latitude);
    return !isNaN(num) && num >= -90 && num <= 90 ? num : null;
  }, [latitude]);

  const parsedLon = useMemo(() => {
    const num = parseFloat(longitude);
    return !isNaN(num) && num >= -180 && num <= 180 ? num : null;
  }, [longitude]);

  // Fetch weather data if coordinates are valid
  const { current, daily, hourly, loading, error } = useWeather(
    selectedLocation?.latitude || parsedLat || 0,
    selectedLocation?.longitude || parsedLon || 0,
    unit === 'metric' ? 'metric' : 'imperial'
  );

  const hasValidLocation = selectedLocation || (parsedLat !== null && parsedLon !== null);

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
    searchContainer: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: colors.borderLight,
      boxShadow: shadows.sm,
      marginBottom: spacing.md,
    },
    searchInputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.backgroundAlt,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchIcon: {
      marginRight: spacing.sm,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
      fontFamily: 'Roboto_400Regular',
      paddingVertical: spacing.sm,
    },
    clearButton: {
      padding: spacing.xs,
    },
    searchResultsContainer: {
      marginTop: spacing.md,
      backgroundColor: colors.backgroundAlt,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      maxHeight: 300,
    },
    searchResultItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    searchResultItemLast: {
      borderBottomWidth: 0,
    },
    searchResultIcon: {
      marginRight: spacing.md,
    },
    searchResultText: {
      flex: 1,
    },
    searchResultName: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.text,
      fontFamily: 'Roboto_500Medium',
      marginBottom: 2,
    },
    searchResultDetails: {
      fontSize: 13,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
    },
    searchingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.lg,
    },
    searchingText: {
      fontSize: 14,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      marginLeft: spacing.md,
    },
    noResultsContainer: {
      alignItems: 'center',
      padding: spacing.lg,
    },
    noResultsText: {
      fontSize: 14,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      textAlign: 'center',
    },
    inputContainer: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: colors.borderLight,
      boxShadow: shadows.sm,
      marginBottom: spacing.md,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
      fontFamily: 'Roboto_500Medium',
      marginBottom: spacing.sm,
    },
    input: {
      backgroundColor: colors.backgroundAlt,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      fontSize: 16,
      color: colors.text,
      fontFamily: 'Roboto_400Regular',
      borderWidth: 1,
      borderColor: colors.border,
    },
    coordinateRow: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    coordinateInput: {
      flex: 1,
    },
    toggleButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.backgroundAlt,
      borderRadius: borderRadius.md,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      marginTop: spacing.md,
    },
    toggleButtonText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.primary,
      fontFamily: 'Roboto_500Medium',
      marginLeft: spacing.xs,
    },
    popularLocationsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    locationChip: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderWidth: 1,
      borderColor: colors.borderLight,
      boxShadow: shadows.xs,
    },
    locationChipSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    locationChipText: {
      fontSize: 14,
      color: colors.text,
      fontFamily: 'Roboto_400Regular',
    },
    locationChipTextSelected: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
    weatherCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.borderLight,
      boxShadow: shadows.sm,
    },
    gradient: {
      padding: spacing.lg,
    },
    weatherHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.md,
    },
    locationInfo: {
      flex: 1,
      marginRight: spacing.md,
    },
    locationNameText: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
      fontFamily: 'Roboto_500Medium',
      marginBottom: spacing.xs,
    },
    coordinatesText: {
      fontSize: 12,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
    },
    weatherContainer: {
      alignItems: 'center',
      minWidth: 80,
    },
    temperature: {
      fontSize: 32,
      fontWeight: '700',
      color: colors.temperature,
      fontFamily: 'Roboto_700Bold',
      textAlign: 'center',
      marginTop: spacing.xs,
    },
    weatherInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: spacing.md,
      paddingTop: spacing.md,
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
    forecastSection: {
      marginTop: spacing.lg,
      paddingTop: spacing.lg,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    },
    forecastTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      fontFamily: 'Roboto_500Medium',
      marginBottom: spacing.md,
    },
    forecastRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: spacing.xs,
    },
    forecastDay: {
      flex: 1,
      backgroundColor: colors.backgroundAlt,
      borderRadius: borderRadius.md,
      padding: spacing.sm,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    forecastDayName: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecondary,
      fontFamily: 'Roboto_500Medium',
      marginBottom: spacing.xs,
    },
    forecastTemp: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      fontFamily: 'Roboto_500Medium',
      marginTop: spacing.xs,
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
    loadingContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.xl,
    },
    loadingText: {
      fontSize: 14,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      marginTop: spacing.md,
    },
    errorContainer: {
      backgroundColor: colors.error + '20',
      borderRadius: borderRadius.md,
      padding: spacing.md,
      marginTop: spacing.md,
      borderWidth: 1,
      borderColor: colors.error + '40',
    },
    errorText: {
      fontSize: 14,
      color: colors.error,
      fontFamily: 'Roboto_400Regular',
      textAlign: 'center',
    },
    hintText: {
      fontSize: 13,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      marginTop: spacing.sm,
      fontStyle: 'italic',
    },
    radarSection: {
      marginTop: spacing.lg,
    },
    radarSectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      fontFamily: 'Roboto_500Medium',
      marginBottom: spacing.md,
    },
  });

  // Search for locations using Open-Meteo Geocoding API
  const searchLocation = async (query: string) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    console.log('CustomWeather: Searching for location:', query);
    setIsSearching(true);
    setSearchError(null);
    setShowSearchResults(true);

    try {
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=en&format=json`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('CustomWeather: Geocoding results:', data.results?.length || 0);

      if (data.results && data.results.length > 0) {
        setSearchResults(data.results);
        setSearchError(null);
      } else {
        setSearchResults([]);
        setSearchError('No locations found. Try a different search term.');
      }
    } catch (error: any) {
      console.error('CustomWeather: Error searching location:', error);
      setSearchError('Failed to search locations. Please try again.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  const handleSearchChange = (text: string) => {
    setLocationSearch(text);
    
    // Clear previous timeout
    if ((handleSearchChange as any).timeout) {
      clearTimeout((handleSearchChange as any).timeout);
    }

    // Set new timeout for debounced search
    (handleSearchChange as any).timeout = setTimeout(() => {
      searchLocation(text);
    }, 500);
  };

  const handleLocationSelect = async (location: SavedLocation) => {
    console.log('CustomWeather: Selected location:', location.name);
    setSelectedLocation(location);
    setLocationSearch('');
    setSearchResults([]);
    setShowSearchResults(false);
    setLatitude('');
    setLongitude('');
    
    // Check if this location is favourited
    const favouriteId = `custom-${location.latitude}-${location.longitude}`;
    const status = await isFavourite(favouriteId);
    setIsFav(status);
  };

  const handleSearchResultSelect = (result: GeocodingResult) => {
    const locationName = result.admin1 
      ? `${result.name}, ${result.admin1}, ${result.country}`
      : `${result.name}, ${result.country}`;
    
    const location: SavedLocation = {
      name: locationName,
      latitude: result.latitude,
      longitude: result.longitude,
      country: result.country,
      admin1: result.admin1,
    };

    console.log('CustomWeather: Selected search result:', locationName);
    handleLocationSelect(location);
  };

  const handleManualCoordinates = async () => {
    if (parsedLat !== null && parsedLon !== null) {
      console.log('CustomWeather: Using manual coordinates:', parsedLat, parsedLon);
      setSelectedLocation(null);
      setLocationSearch('');
      setSearchResults([]);
      setShowSearchResults(false);
      
      // Check if this location is favourited
      const favouriteId = `custom-${parsedLat}-${parsedLon}`;
      const status = await isFavourite(favouriteId);
      setIsFav(status);
    }
  };

  const clearLocation = () => {
    console.log('CustomWeather: Clearing location');
    setSelectedLocation(null);
    setLocationSearch('');
    setLatitude('');
    setLongitude('');
    setSearchResults([]);
    setShowSearchResults(false);
    setIsFav(false);
  };

  const handleToggleFavourite = async () => {
    if (!selectedLocation && (parsedLat === null || parsedLon === null)) {
      Alert.alert('No Location', 'Please select or enter a location first.');
      return;
    }
    
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const lat = selectedLocation?.latitude || parsedLat || 0;
      const lon = selectedLocation?.longitude || parsedLon || 0;
      const favouriteId = `custom-${lat}-${lon}`;
      
      const locationName = selectedLocation?.name || `${lat.toFixed(4)}°, ${lon.toFixed(4)}°`;
      
      const newStatus = await toggleFavourite({
        id: favouriteId,
        type: 'custom',
        name: locationName,
        country: selectedLocation?.country,
        latitude: lat,
        longitude: lon,
      });
      
      setIsFav(newStatus);
      
      if (newStatus) {
        Alert.alert('Added to Favourites', `${locationName} has been added to your favourites.`);
      } else {
        Alert.alert('Removed from Favourites', `${locationName} has been removed from your favourites.`);
      }
    } catch (error) {
      console.error('CustomWeather: Error toggling favourite:', error);
      Alert.alert('Error', 'Failed to update favourites. Please try again.');
    }
  };

  const clearSearch = () => {
    setLocationSearch('');
    setSearchResults([]);
    setShowSearchResults(false);
    setSearchError(null);
  };

  console.log('CustomWeatherScreen: Rendering with theme:', isDark ? 'dark' : 'light', 'hasValidLocation:', hasValidLocation);

  return (
    <View style={styles.container}>
      <AppHeader
        title="Custom Weather"
        subtitle="Get weather forecast for any location"
        icon={<Ionicons name="location" size={32} color={colors.primary} />}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.scrollContent}>
          {/* Location Search Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Search Location</Text>
            <View style={styles.searchContainer}>
              <View style={styles.searchInputWrapper}>
                <Ionicons 
                  name="search" 
                  size={20} 
                  color={colors.textMuted} 
                  style={styles.searchIcon}
                />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Type a city name (e.g., New York, London)"
                  placeholderTextColor={colors.textMuted}
                  value={locationSearch}
                  onChangeText={handleSearchChange}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
                {locationSearch.length > 0 && (
                  <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                    <Ionicons name="close-circle" size={20} color={colors.textMuted} />
                  </TouchableOpacity>
                )}
              </View>

              <Text style={styles.hintText}>
                Search for any city, town, or location worldwide
              </Text>

              {/* Search Results */}
              {showSearchResults && (
                <View style={styles.searchResultsContainer}>
                  <ScrollView style={{ maxHeight: 300 }} nestedScrollEnabled>
                    {isSearching ? (
                      <View style={styles.searchingContainer}>
                        <ActivityIndicator size="small" color={colors.primary} />
                        <Text style={styles.searchingText}>Searching...</Text>
                      </View>
                    ) : searchError ? (
                      <View style={styles.noResultsContainer}>
                        <Ionicons name="alert-circle-outline" size={32} color={colors.textMuted} />
                        <Text style={styles.noResultsText}>{searchError}</Text>
                      </View>
                    ) : searchResults.length > 0 ? (
                      searchResults.map((result, index) => (
                        <TouchableOpacity
                          key={result.id}
                          style={[
                            styles.searchResultItem,
                            index === searchResults.length - 1 && styles.searchResultItemLast,
                          ]}
                          onPress={() => handleSearchResultSelect(result)}
                        >
                          <Ionicons 
                            name="location" 
                            size={20} 
                            color={colors.primary} 
                            style={styles.searchResultIcon}
                          />
                          <View style={styles.searchResultText}>
                            <Text style={styles.searchResultName}>{result.name}</Text>
                            <Text style={styles.searchResultDetails}>
                              {result.admin1 ? `${result.admin1}, ` : ''}{result.country}
                            </Text>
                          </View>
                          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                        </TouchableOpacity>
                      ))
                    ) : (
                      <View style={styles.noResultsContainer}>
                        <Text style={styles.noResultsText}>
                          No results found. Try a different search term.
                        </Text>
                      </View>
                    )}
                  </ScrollView>
                </View>
              )}
            </View>
          </View>

          {/* Popular Locations Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Popular Locations</Text>
            <View style={styles.popularLocationsGrid}>
              {POPULAR_LOCATIONS.map((location, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.locationChip,
                    selectedLocation?.name === location.name && styles.locationChipSelected,
                  ]}
                  onPress={() => handleLocationSelect(location)}
                >
                  <Text
                    style={[
                      styles.locationChipText,
                      selectedLocation?.name === location.name && styles.locationChipTextSelected,
                    ]}
                  >
                    {location.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Manual Coordinates Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Or Enter Coordinates</Text>
            <View style={styles.inputContainer}>
              <TouchableOpacity
                style={styles.toggleButton}
                onPress={() => setShowCoordinates(!showCoordinates)}
              >
                <Ionicons
                  name={showCoordinates ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={colors.primary}
                />
                <Text style={styles.toggleButtonText}>
                  {showCoordinates ? 'Hide' : 'Show'} Coordinate Input
                </Text>
              </TouchableOpacity>

              {showCoordinates && (
                <>
                  <View style={{ marginTop: spacing.md }}>
                    <Text style={styles.inputLabel}>Latitude (-90 to 90)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g., 40.7128"
                      placeholderTextColor={colors.textMuted}
                      value={latitude}
                      onChangeText={(text) => {
                        setLatitude(text);
                        if (text) {
                          setSelectedLocation(null);
                          setLocationSearch('');
                          setSearchResults([]);
                          setShowSearchResults(false);
                        }
                      }}
                      keyboardType="numeric"
                      onBlur={handleManualCoordinates}
                    />
                  </View>

                  <View style={{ marginTop: spacing.md }}>
                    <Text style={styles.inputLabel}>Longitude (-180 to 180)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g., -74.0060"
                      placeholderTextColor={colors.textMuted}
                      value={longitude}
                      onChangeText={(text) => {
                        setLongitude(text);
                        if (text) {
                          setSelectedLocation(null);
                          setLocationSearch('');
                          setSearchResults([]);
                          setShowSearchResults(false);
                        }
                      }}
                      keyboardType="numeric"
                      onBlur={handleManualCoordinates}
                    />
                  </View>

                  {(parsedLat === null && latitude !== '') || (parsedLon === null && longitude !== '') ? (
                    <View style={styles.errorContainer}>
                      <Text style={styles.errorText}>
                        Please enter valid coordinates
                      </Text>
                    </View>
                  ) : null}
                </>
              )}
            </View>
          </View>

          {/* Weather Display Section */}
          {hasValidLocation ? (
            <View style={styles.section}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
                <Text style={styles.sectionTitle}>Weather Forecast</Text>
                <View style={{ flexDirection: 'row', gap: spacing.md }}>
                  <TouchableOpacity onPress={handleToggleFavourite}>
                    <Ionicons 
                      name={isFav ? "heart" : "heart-outline"} 
                      size={24} 
                      color={isFav ? colors.error : colors.textMuted} 
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={clearLocation}>
                    <Ionicons name="close-circle" size={24} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>
              </View>

              {loading ? (
                <View style={styles.loadingContainer}>
                  <Ionicons name="cloud-download" size={48} color={colors.textMuted} />
                  <Text style={styles.loadingText}>Loading weather data...</Text>
                </View>
              ) : error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>
                    Failed to load weather data. Please check your connection and try again.
                  </Text>
                </View>
              ) : current ? (
                <>
                  <View style={styles.weatherCard}>
                    <LinearGradient
                      colors={[colors.card, colors.backgroundAlt]}
                      style={styles.gradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <View style={styles.weatherHeader}>
                        <View style={styles.locationInfo}>
                          <Text style={styles.locationNameText}>
                            {selectedLocation?.name || 'Custom Location'}
                          </Text>
                          <Text style={styles.coordinatesText}>
                            {(selectedLocation?.latitude || parsedLat)?.toFixed(4)}°, {(selectedLocation?.longitude || parsedLon)?.toFixed(4)}°
                          </Text>
                        </View>

                        <View style={styles.weatherContainer}>
                          <WeatherSymbol
                            weatherCode={current.weather_code}
                            size={40}
                            latitude={selectedLocation?.latitude || parsedLat || 0}
                            longitude={selectedLocation?.longitude || parsedLon || 0}
                          />
                          <Text style={styles.temperature}>
                            {Math.round(current.temperature)}°
                          </Text>
                        </View>
                      </View>

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

                      {/* 12-Hour Forecast Section */}
                      {hourly && hourly.length > 0 && (
                        <View style={styles.forecastSection}>
                          <TwelveHourForecast
                            hourlyData={hourly}
                            unit={unit === 'metric' ? 'metric' : 'imperial'}
                            latitude={selectedLocation?.latitude || parsedLat || 0}
                            longitude={selectedLocation?.longitude || parsedLon || 0}
                            sunrise={daily?.days?.[0]?.sunrise}
                            sunset={daily?.days?.[0]?.sunset}
                          />
                        </View>
                      )}

                      {/* 7-Day Forecast Section */}
                      {daily && daily.days && daily.days.length > 0 && (
                        <View style={styles.forecastSection}>
                          <Text style={styles.forecastTitle}>7-Day Forecast</Text>
                          <View style={styles.forecastRow}>
                            {daily.days.slice(0, 7).map((day, index) => (
                              <View key={index} style={styles.forecastDay}>
                                <Text style={styles.forecastDayName}>
                                  {day.weekday}
                                </Text>
                                <WeatherSymbol
                                  weatherCode={day.weather_code}
                                  size={24}
                                  latitude={selectedLocation?.latitude || parsedLat || 0}
                                  longitude={selectedLocation?.longitude || parsedLon || 0}
                                />
                                <Text style={styles.forecastTemp}>
                                  {Math.round(day.max)}°
                                </Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}
                    </LinearGradient>
                  </View>

                  {/* Rainfall Radar Section - ENHANCED with better visibility */}
                  <View style={styles.radarSection}>
                    <Text style={styles.radarSectionTitle}>Real-Time Rainfall Radar</Text>
                    {selectedLocation ? (
                      <TrackRainfallRadar
                        latitude={selectedLocation.latitude}
                        longitude={selectedLocation.longitude}
                        circuitName={selectedLocation.name}
                        country={selectedLocation.country || 'Unknown'}
                        category="f1"
                        compact={false}
                        showControls={true}
                        autoStartAnimation={false}
                      />
                    ) : parsedLat !== null && parsedLon !== null ? (
                      <TrackRainfallRadar
                        latitude={parsedLat}
                        longitude={parsedLon}
                        circuitName="Custom Location"
                        country="Unknown"
                        category="f1"
                        compact={false}
                        showControls={true}
                        autoStartAnimation={false}
                      />
                    ) : null}
                  </View>
                </>
              ) : null}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons
                name="location-outline"
                size={64}
                color={colors.textMuted}
                style={styles.emptyIcon}
              />
              <Text style={styles.emptyTitle}>No Location Selected</Text>
              <Text style={styles.emptyText}>
                Search for a location, choose a popular location,{'\n'}
                or enter custom coordinates to view weather
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
