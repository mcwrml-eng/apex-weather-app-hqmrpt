
import React, { useMemo, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useWeather } from '../../hooks/useWeather';
import { useUnit } from '../../state/UnitContext';
import { getCircuitBySlug } from '../../data/circuits';
import { getWeekendSchedule, WeekendSession } from '../../data/schedules';
import { colors, buttonStyles } from '../../styles/commonStyles';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';

// Components
import Button from '../../components/Button';
import EnhancedWeatherForecast from '../../components/EnhancedWeatherForecast';
import WindRadarGraph from '../../components/WindRadarGraph';
import WeatherSymbol from '../../components/WeatherSymbol';
import WeatherAlerts from '../../components/WeatherAlerts';
import RainfallRadar from '../../components/RainfallRadar';
import WindBarGraphs from '../../components/WindBarGraphs';
import Icon from '../../components/Icon';
import WeatherChart from '../../components/WeatherChart';
import ChartDoughnut from '../../components/ChartDoughnut';
import WeatherTextForecast from '../../components/WeatherTextForecast';
import ErrorBoundary from '../../components/ErrorBoundary';

const DetailScreen: React.FC = () => {
  const params = useLocalSearchParams<{ slug: string; category?: string }>();
  const { unit } = useUnit();
  const bottomSheetRef = useRef<BottomSheet>(null);

  console.log('DetailScreen: Received params:', params);

  const circuit = useMemo(() => {
    try {
      const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
      const category = Array.isArray(params.category) ? params.category[0] : params.category;
      
      if (!slug) {
        console.log('DetailScreen: No slug provided in params');
        return null;
      }
      
      // Determine category from route or default to f1
      const circuitCategory = (category as 'f1' | 'motogp') || 'f1';
      console.log('DetailScreen: Looking up circuit', slug, 'in category', circuitCategory);
      
      const foundCircuit = getCircuitBySlug(slug, circuitCategory);
      if (!foundCircuit) {
        console.log('DetailScreen: Circuit not found for slug:', slug, 'category:', circuitCategory);
        // Try the other category as fallback
        const fallbackCategory = circuitCategory === 'f1' ? 'motogp' : 'f1';
        console.log('DetailScreen: Trying fallback category:', fallbackCategory);
        const fallbackCircuit = getCircuitBySlug(slug, fallbackCategory);
        if (fallbackCircuit) {
          console.log('DetailScreen: Found circuit in fallback category');
          return fallbackCircuit;
        }
        console.log('DetailScreen: Circuit not found in either category');
        return null;
      }
      console.log('DetailScreen: Found circuit:', foundCircuit.name);
      return foundCircuit;
    } catch (error) {
      console.error('DetailScreen: Error looking up circuit:', error);
      return null;
    }
  }, [params.slug, params.category]);

  // Only call weather hook if we have a valid circuit
  const { data: weather, loading, error } = useWeather(
    circuit?.latitude || 0,
    circuit?.longitude || 0,
    unit
  );

  const weekendSchedule = useMemo(() => {
    if (!circuit) return [];
    try {
      return getWeekendSchedule(circuit.slug);
    } catch (error) {
      console.error('DetailScreen: Error getting weekend schedule:', error);
      return [];
    }
  }, [circuit]);

  const handleSheetChanges = useCallback((index: number) => {
    console.log('Bottom sheet changed to index:', index);
  }, []);

  const handleBackPress = useCallback(() => {
    console.log('DetailScreen: Back button pressed');
    try {
      router.back();
    } catch (error) {
      console.error('DetailScreen: Error navigating back:', error);
      router.push('/');
    }
  }, []);

  if (!circuit) {
    return (
      <ErrorBoundary>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
              <Icon name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.title}>Circuit Not Found</Text>
          </View>
          <View style={styles.errorContainer}>
            <Icon name="warning" size={48} color={colors.error} />
            <Text style={styles.errorText}>Circuit not found</Text>
            <Text style={styles.errorSubtext}>
              The requested circuit could not be loaded. Please check the URL or try again.
            </Text>
            <Button 
              title="Go Back" 
              onPress={handleBackPress} 
              style={styles.backButtonStyle}
            />
          </View>
        </View>
      </ErrorBoundary>
    );
  }

  const getWeatherDescription = (code: number): string => {
    const descriptions: { [key: number]: string } = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Fog',
      48: 'Depositing rime fog',
      51: 'Light drizzle',
      53: 'Moderate drizzle',
      55: 'Dense drizzle',
      56: 'Light freezing drizzle',
      57: 'Dense freezing drizzle',
      61: 'Slight rain',
      63: 'Moderate rain',
      65: 'Heavy rain',
      66: 'Light freezing rain',
      67: 'Heavy freezing rain',
      71: 'Slight snow fall',
      73: 'Moderate snow fall',
      75: 'Heavy snow fall',
      77: 'Snow grains',
      80: 'Slight rain showers',
      81: 'Moderate rain showers',
      82: 'Violent rain showers',
      85: 'Slight snow showers',
      86: 'Heavy snow showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with slight hail',
      99: 'Thunderstorm with heavy hail'
    };
    return descriptions[code] || 'Unknown';
  };

  const getSessionTypeStyle = (sessionKey: string) => {
    const category = circuit.category || 'f1';
    
    if (category === 'f1') {
      switch (sessionKey.toLowerCase()) {
        case 'practice1':
        case 'fp1':
          return { backgroundColor: colors.primary + '20', color: colors.primary };
        case 'practice2':
        case 'fp2':
          return { backgroundColor: colors.secondary + '20', color: colors.secondary };
        case 'practice3':
        case 'fp3':
          return { backgroundColor: colors.accent + '20', color: colors.accent };
        case 'qualifying':
        case 'quali':
          return { backgroundColor: colors.warning + '20', color: colors.warning };
        case 'sprint':
          return { backgroundColor: colors.success + '20', color: colors.success };
        case 'race':
          return { backgroundColor: colors.error + '20', color: colors.error };
        default:
          return { backgroundColor: colors.textMuted + '20', color: colors.textMuted };
      }
    } else if (category === 'motogp') {
      switch (sessionKey.toLowerCase()) {
        case 'practice1':
        case 'fp1':
          return { backgroundColor: '#FF6B35' + '20', color: '#FF6B35' };
        case 'practice2':
        case 'fp2':
          return { backgroundColor: '#F7931E' + '20', color: '#F7931E' };
        case 'qualifying':
        case 'quali':
          return { backgroundColor: '#FFD23F' + '20', color: '#FFD23F' };
        case 'sprint':
          return { backgroundColor: '#06FFA5' + '20', color: '#06FFA5' };
        case 'race':
          return { backgroundColor: '#FF073A' + '20', color: '#FF073A' };
        default:
          return { backgroundColor: colors.textMuted + '20', color: colors.textMuted };
      }
    }
    
    return { backgroundColor: colors.textMuted + '20', color: colors.textMuted };
  };

  const getSessionIcon = (sessionKey: string): string => {
    switch (sessionKey.toLowerCase()) {
      case 'practice1':
      case 'practice2':
      case 'practice3':
      case 'fp1':
      case 'fp2':
        return 'speedometer';
      case 'qualifying':
      case 'quali':
        return 'timer';
      case 'sprint':
        return 'flash';
      case 'race':
        return 'trophy';
      default:
        return 'calendar';
    }
  };

  const getSessionIconColor = (sessionKey: string): string => {
    const style = getSessionTypeStyle(sessionKey);
    return style.color;
  };

  const formatDateForDisplay = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('DetailScreen: Error formatting date:', error);
      return dateStr;
    }
  };

  const getRelativeDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffTime = date.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Tomorrow';
      if (diffDays === -1) return 'Yesterday';
      if (diffDays > 1) return `In ${diffDays} days`;
      if (diffDays < -1) return `${Math.abs(diffDays)} days ago`;
      return formatDateForDisplay(dateStr);
    } catch (error) {
      console.error('DetailScreen: Error calculating relative date:', error);
      return formatDateForDisplay(dateStr);
    }
  };

  return (
    <ErrorBoundary>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.title}>{circuit.name}</Text>
            <Text style={styles.subtitle}>{circuit.country}</Text>
          </View>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Current Weather */}
          {weather.current && (
            <ErrorBoundary fallback={
              <View style={styles.errorCard}>
                <Text style={styles.errorText}>Weather data unavailable</Text>
              </View>
            }>
              <View style={styles.currentWeatherCard}>
                <View style={styles.currentWeatherHeader}>
                  <Text style={styles.currentWeatherTitle}>Current Conditions</Text>
                  <WeatherSymbol 
                    weatherCode={weather.current.weather_code} 
                    size={32}
                    latitude={circuit.latitude}
                    longitude={circuit.longitude}
                  />
                </View>
                <View style={styles.currentWeatherContent}>
                  <Text style={styles.temperature}>
                    {Math.round(weather.current.temperature)}°{unit === 'metric' ? 'C' : 'F'}
                  </Text>
                  <Text style={styles.weatherDescription}>
                    {getWeatherDescription(weather.current.weather_code)}
                  </Text>
                  <Text style={styles.feelsLike}>
                    Feels like {Math.round(weather.current.apparent_temperature)}°
                  </Text>
                </View>
                <View style={styles.weatherDetails}>
                  <View style={styles.weatherDetailItem}>
                    <Icon name="water" size={16} color={colors.textMuted} />
                    <Text style={styles.weatherDetailText}>{weather.current.humidity}%</Text>
                  </View>
                  <View style={styles.weatherDetailItem}>
                    <Icon name="eye" size={16} color={colors.textMuted} />
                    <Text style={styles.weatherDetailText}>
                      {(weather.current.visibility / 1000).toFixed(1)}km
                    </Text>
                  </View>
                  <View style={styles.weatherDetailItem}>
                    <Icon name="speedometer" size={16} color={colors.textMuted} />
                    <Text style={styles.weatherDetailText}>
                      {Math.round(weather.current.wind_speed)} {unit === 'metric' ? 'km/h' : 'mph'}
                    </Text>
                  </View>
                </View>
              </View>
            </ErrorBoundary>
          )}

          {/* Weather Alerts */}
          {weather.alerts && weather.alerts.length > 0 && (
            <ErrorBoundary>
              <WeatherAlerts alerts={weather.alerts} />
            </ErrorBoundary>
          )}

          {/* Weather Text Forecast */}
          {weather.current && weather.hourly.length > 0 && (
            <ErrorBoundary>
              <WeatherTextForecast
                current={weather.current}
                hourlyData={weather.hourly}
                unit={unit}
                circuitName={circuit.name}
                latitude={circuit.latitude}
                longitude={circuit.longitude}
              />
            </ErrorBoundary>
          )}

          {/* Weekend Schedule */}
          {weekendSchedule.length > 0 && (
            <ErrorBoundary fallback={
              <View style={styles.errorCard}>
                <Text style={styles.errorText}>Schedule unavailable</Text>
              </View>
            }>
              <View style={styles.scheduleCard}>
                <Text style={styles.sectionTitle}>Weekend Schedule</Text>
                {weekendSchedule.map((session: WeekendSession, index: number) => {
                  const sessionStyle = getSessionTypeStyle(session.type);
                  const sessionIcon = getSessionIcon(session.type);
                  const sessionIconColor = getSessionIconColor(session.type);
                  
                  return (
                    <View key={index} style={styles.sessionItem}>
                      <View style={styles.sessionHeader}>
                        <View style={styles.sessionTypeContainer}>
                          <View style={[styles.sessionTypeIndicator, { backgroundColor: sessionStyle.backgroundColor }]}>
                            <Icon name={sessionIcon} size={14} color={sessionIconColor} />
                          </View>
                          <Text style={[styles.sessionType, { color: sessionStyle.color }]}>
                            {session.name}
                          </Text>
                        </View>
                        <Text style={styles.sessionDate}>
                          {getRelativeDate(session.date)}
                        </Text>
                      </View>
                      <View style={styles.sessionDetails}>
                        <Text style={styles.sessionTime}>{session.time}</Text>
                        <Text style={styles.sessionDuration}>({session.duration})</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </ErrorBoundary>
          )}

          {/* Enhanced Rainfall Radar */}
          <ErrorBoundary fallback={
            <View style={styles.errorCard}>
              <Text style={styles.errorText}>Radar unavailable</Text>
              <Text style={styles.errorSubtext}>The rainfall radar service is currently unavailable</Text>
            </View>
          }>
            <RainfallRadar
              latitude={circuit.latitude}
              longitude={circuit.longitude}
              circuitName={circuit.name}
              alwaysVisible={false}
              autoStartAnimation={true}
            />
          </ErrorBoundary>

          {/* 72-Hour Forecast */}
          {weather.hourly.length > 0 && (
            <ErrorBoundary>
              <EnhancedWeatherForecast
                hourlyData={weather.hourly}
                unit={unit}
                latitude={circuit.latitude}
                longitude={circuit.longitude}
                showExtended={true}
              />
            </ErrorBoundary>
          )}

          {/* Wind Analysis */}
          {weather.hourly.length > 0 && (
            <ErrorBoundary>
              <WindRadarGraph
                hourlyData={weather.hourly}
                unit={unit}
              />
            </ErrorBoundary>
          )}

          {/* Wind Bar Graphs */}
          {weather.hourly.length > 0 && (
            <ErrorBoundary>
              <WindBarGraphs
                hourlyData={weather.hourly}
                unit={unit}
              />
            </ErrorBoundary>
          )}

          {/* Weather Charts */}
          {weather.hourly.length > 0 && (
            <ErrorBoundary>
              <View style={styles.chartsContainer}>
                <WeatherChart
                  data={weather.hourly.slice(0, 24)}
                  type="temperature"
                  unit={unit}
                  height={200}
                />
                <WeatherChart
                  data={weather.hourly.slice(0, 24)}
                  type="precipitation"
                  unit={unit}
                  height={200}
                />
              </View>
            </ErrorBoundary>
          )}

          {/* Humidity Doughnut Chart */}
          {weather.current && (
            <ErrorBoundary>
              <View style={styles.humidityCard}>
                <Text style={styles.sectionTitle}>Current Humidity</Text>
                <ChartDoughnut
                  percentage={weather.current.humidity}
                  size={120}
                  strokeWidth={12}
                  color={colors.primary}
                  backgroundColor={colors.backgroundAlt}
                />
                <Text style={styles.humidityText}>{weather.current.humidity}%</Text>
              </View>
            </ErrorBoundary>
          )}

          <View style={styles.bottomPadding} />
        </ScrollView>

        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          snapPoints={['25%', '50%', '90%']}
          onChange={handleSheetChanges}
          enablePanDownToClose={true}
        >
          <BottomSheetView style={styles.bottomSheetContent}>
            <Text style={styles.bottomSheetTitle}>Circuit Details</Text>
            <Text style={styles.bottomSheetText}>
              Additional information about {circuit.name} would be displayed here.
            </Text>
          </BottomSheetView>
        </BottomSheet>
      </View>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
    borderRadius: 8,
    backgroundColor: colors.backgroundAlt,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  currentWeatherCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.divider,
    boxShadow: '0 6px 24px rgba(16,24,40,0.06)',
  },
  currentWeatherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  currentWeatherTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  currentWeatherContent: {
    alignItems: 'center',
    marginBottom: 20,
  },
  temperature: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.text,
  },
  weatherDescription: {
    fontSize: 16,
    color: colors.textMuted,
    marginTop: 4,
  },
  feelsLike: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 4,
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  weatherDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  weatherDetailText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  scheduleCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.divider,
    boxShadow: '0 6px 24px rgba(16,24,40,0.06)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  sessionItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sessionTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sessionTypeIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sessionType: {
    fontSize: 14,
    fontWeight: '600',
  },
  sessionDate: {
    fontSize: 12,
    color: colors.textMuted,
  },
  sessionDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 36,
  },
  sessionTime: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  sessionDuration: {
    fontSize: 12,
    color: colors.textMuted,
  },
  chartsContainer: {
    gap: 16,
    marginBottom: 16,
  },
  humidityCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.divider,
    boxShadow: '0 6px 24px rgba(16,24,40,0.06)',
  },
  humidityText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.error + '20',
    boxShadow: '0 6px 24px rgba(255,59,48,0.06)',
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  backButtonStyle: {
    marginTop: 16,
  },
  bottomPadding: {
    height: 100,
  },
  bottomSheetContent: {
    flex: 1,
    padding: 20,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  bottomSheetText: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
});

export default DetailScreen;
