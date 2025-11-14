
import Button from '../../components/Button';
import WindyCloudRadar from '../../components/WindyCloudRadar';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Icon from '../../components/Icon';
import { useUnit } from '../../state/UnitContext';
import ErrorBoundary from '../../components/ErrorBoundary';
import { useWeather } from '../../hooks/useWeather';
import TrackRainfallRadar from '../../components/TrackRainfallRadar';
import BottomSheet, { BottomSheetView, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import EnhancedWeatherForecast from '../../components/EnhancedWeatherForecast';
import WeatherSymbol from '../../components/WeatherSymbol';
import WeatherTextForecast from '../../components/WeatherTextForecast';
import ChartDoughnut from '../../components/ChartDoughnut';
import WeatherChart from '../../components/WeatherChart';
import SafeComponent from '../../components/SafeComponent';
import WindParticleAnimation from '../../components/WindParticleAnimation';
import { getColors, getButtonStyles, spacing, borderRadius, getShadows } from '../../styles/commonStyles';
import { useTheme } from '../../state/ThemeContext';
import WeatherAlerts from '../../components/WeatherAlerts';
import React, { useMemo, useRef, useCallback } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import WindRadarGraph from '../../components/WindRadarGraph';
import { getCircuitBySlug } from '../../data/circuits';
import WindBarGraphs from '../../components/WindBarGraphs';
import Footer from '../../components/Footer';

export default function DetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { unit } = useUnit();
  const { isDark } = useTheme();
  const bottomSheetRef = useRef<BottomSheet>(null);
  
  const colors = getColors(isDark);
  const buttonStyles = getButtonStyles(isDark);
  const shadows = getShadows(isDark);

  const circuit = useMemo(() => {
    if (!slug) return null;
    return getCircuitBySlug(slug);
  }, [slug]);

  const { current, daily, hourly, alerts, loading, error } = useWeather(
    circuit?.latitude || 0,
    circuit?.longitude || 0,
    unit
  );

  const handleOpenBottomSheet = useCallback(() => {
    console.log('DetailScreen: Opening bottom sheet');
    bottomSheetRef.current?.expand();
  }, []);

  const handleCloseBottomSheet = useCallback(() => {
    console.log('DetailScreen: Closing bottom sheet');
    bottomSheetRef.current?.close();
  }, []);

  const getWeatherDescription = (code: number): string => {
    const descriptions: { [key: number]: string } = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Foggy',
      48: 'Depositing rime fog',
      51: 'Light drizzle',
      53: 'Moderate drizzle',
      55: 'Dense drizzle',
      61: 'Slight rain',
      63: 'Moderate rain',
      65: 'Heavy rain',
      71: 'Slight snow',
      73: 'Moderate snow',
      75: 'Heavy snow',
      77: 'Snow grains',
      80: 'Slight rain showers',
      81: 'Moderate rain showers',
      82: 'Violent rain showers',
      85: 'Slight snow showers',
      86: 'Heavy snow showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with slight hail',
      99: 'Thunderstorm with heavy hail',
    };
    return descriptions[code] || 'Unknown';
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingBottom: spacing.massive,
    },
    header: {
      padding: spacing.xl,
      paddingTop: spacing.huge,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
      boxShadow: shadows.md,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    backText: {
      fontSize: 16,
      color: colors.primary,
      marginLeft: spacing.sm,
      fontFamily: 'Roboto_500Medium',
    },
    circuitName: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.xs,
      fontFamily: 'Roboto_700Bold',
    },
    circuitCountry: {
      fontSize: 16,
      color: colors.textSecondary,
      fontFamily: 'Roboto_400Regular',
    },
    currentWeather: {
      padding: spacing.xl,
      backgroundColor: colors.card,
      margin: spacing.lg,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.borderLight,
      boxShadow: shadows.md,
    },
    currentTemp: {
      fontSize: 48,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Roboto_700Bold',
    },
    currentCondition: {
      fontSize: 18,
      color: colors.textSecondary,
      marginTop: spacing.sm,
      fontFamily: 'Roboto_400Regular',
    },
    weatherDetails: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: spacing.lg,
      gap: spacing.md,
    },
    detailItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.backgroundAlt,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      minWidth: '45%',
    },
    detailText: {
      fontSize: 14,
      color: colors.text,
      marginLeft: spacing.sm,
      fontFamily: 'Roboto_400Regular',
    },
    section: {
      padding: spacing.lg,
      marginBottom: spacing.md,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.lg,
      fontFamily: 'Roboto_500Medium',
    },
    errorContainer: {
      padding: spacing.xl,
      alignItems: 'center',
    },
    errorText: {
      fontSize: 16,
      color: colors.error,
      textAlign: 'center',
      fontFamily: 'Roboto_400Regular',
    },
    loadingContainer: {
      padding: spacing.xl,
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 16,
      color: colors.textMuted,
      marginTop: spacing.md,
      fontFamily: 'Roboto_400Regular',
    },
    bottomSheetContent: {
      padding: spacing.xl,
    },
    bottomSheetTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.lg,
      fontFamily: 'Roboto_700Bold',
    },
  });

  if (!circuit) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Circuit not found</Text>
        </View>
      </View>
    );
  }

  console.log('DetailScreen: Rendering circuit:', circuit.name, 'with theme:', isDark ? 'dark' : 'light');

  return (
    <ErrorBoundary>
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Icon name="arrow-back" size={24} color={colors.primary} />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
            
            <Text style={styles.circuitName}>{circuit.name}</Text>
            <Text style={styles.circuitCountry}>{circuit.country}</Text>
          </View>

          {loading && (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading weather data...</Text>
            </View>
          )}

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {current && (
            <View style={styles.currentWeather}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View>
                  <Text style={styles.currentTemp}>
                    {Math.round(current.temperature)}°{unit === 'metric' ? 'C' : 'F'}
                  </Text>
                  <Text style={styles.currentCondition}>
                    {getWeatherDescription(current.weather_code)}
                  </Text>
                </View>
                <WeatherSymbol 
                  weatherCode={current.weather_code} 
                  size={64}
                  latitude={circuit.latitude}
                  longitude={circuit.longitude}
                />
              </View>

              <View style={styles.weatherDetails}>
                <View style={styles.detailItem}>
                  <Icon name="water" size={20} color={colors.info} />
                  <Text style={styles.detailText}>Humidity: {current.humidity}%</Text>
                </View>
                <View style={styles.detailItem}>
                  <Icon name="speedometer" size={20} color={colors.warning} />
                  <Text style={styles.detailText}>
                    Wind: {Math.round(current.wind_speed)} {unit === 'metric' ? 'km/h' : 'mph'}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Icon name="eye" size={20} color={colors.accent} />
                  <Text style={styles.detailText}>
                    Visibility: {Math.round(current.visibility / 1000)} km
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Icon name="thermometer" size={20} color={colors.primary} />
                  <Text style={styles.detailText}>
                    Feels like: {Math.round(current.apparent_temperature)}°
                  </Text>
                </View>
              </View>
            </View>
          )}

          <ErrorBoundary>
            <SafeComponent>
              <WeatherAlerts alerts={alerts} />
            </SafeComponent>
          </ErrorBoundary>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Track Rainfall Radar</Text>
            <ErrorBoundary>
              <SafeComponent>
                <TrackRainfallRadar
                  latitude={circuit.latitude}
                  longitude={circuit.longitude}
                  circuitName={circuit.name}
                  country={circuit.country}
                  category={circuit.category || 'f1'}
                  compact={false}
                  showControls={true}
                  autoStartAnimation={true}
                />
              </SafeComponent>
            </ErrorBoundary>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Wind Conditions</Text>
            <ErrorBoundary>
              <SafeComponent>
                {current && (
                  <WindParticleAnimation
                    windSpeed={current.wind_speed}
                    windDirection={current.wind_direction}
                    width={350}
                    height={300}
                    particleCount={100}
                    showGrid={true}
                    unit={unit}
                    latitude={circuit.latitude}
                    longitude={circuit.longitude}
                  />
                )}
              </SafeComponent>
            </ErrorBoundary>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Weather Forecast</Text>
            <ErrorBoundary>
              <SafeComponent>
                <WeatherTextForecast
                  current={current}
                  hourlyData={hourly}
                  unit={unit}
                  circuitName={circuit.name}
                  latitude={circuit.latitude}
                  longitude={circuit.longitude}
                />
              </SafeComponent>
            </ErrorBoundary>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hourly Forecast</Text>
            <ErrorBoundary>
              <SafeComponent>
                <EnhancedWeatherForecast
                  hourlyData={hourly}
                  unit={unit}
                  latitude={circuit.latitude}
                  longitude={circuit.longitude}
                  showExtended={true}
                />
              </SafeComponent>
            </ErrorBoundary>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Wind Analysis</Text>
            <ErrorBoundary>
              <SafeComponent>
                <WindRadarGraph hourlyData={hourly} unit={unit} />
              </SafeComponent>
            </ErrorBoundary>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Wind Speed & Gusts</Text>
            <ErrorBoundary>
              <SafeComponent>
                <WindBarGraphs hourlyData={hourly} unit={unit} />
              </SafeComponent>
            </ErrorBoundary>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Satellite & Radar</Text>
            <ErrorBoundary>
              <SafeComponent>
                <WindyCloudRadar
                  latitude={circuit.latitude}
                  longitude={circuit.longitude}
                  circuitName={circuit.name}
                  zoom={8}
                  width={350}
                  height={300}
                  compact={false}
                />
              </SafeComponent>
            </ErrorBoundary>
          </View>

          <Footer />
        </ScrollView>

        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          snapPoints={['50%', '90%']}
          enablePanDownToClose={true}
          backgroundStyle={{ backgroundColor: colors.card }}
          handleIndicatorStyle={{ backgroundColor: colors.textMuted }}
        >
          <BottomSheetScrollView style={styles.bottomSheetContent}>
            <Text style={styles.bottomSheetTitle}>Detailed Forecast</Text>
            <ErrorBoundary>
              <SafeComponent>
                <EnhancedWeatherForecast
                  hourlyData={hourly}
                  unit={unit}
                  latitude={circuit.latitude}
                  longitude={circuit.longitude}
                  showExtended={true}
                />
              </SafeComponent>
            </ErrorBoundary>
          </BottomSheetScrollView>
        </BottomSheet>
      </View>
    </ErrorBoundary>
  );
}
