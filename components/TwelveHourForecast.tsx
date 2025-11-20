
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { getColors, spacing, borderRadius } from '../styles/commonStyles';
import WeatherSymbol from './WeatherSymbol';
import { getPrecipitationUnit } from '../hooks/useWeather';
import { useTheme } from '../state/ThemeContext';

interface HourlyData {
  time: string;
  temperature: number;
  windSpeed: number;
  windDirection: number;
  windGusts: number;
  humidity: number;
  precipitation: number;
  precipitationProbability?: number;
  weatherCode: number;
  pressure?: number;
  visibility?: number;
  uvIndex?: number;
  dewPoint?: number;
  cloudCover?: number;
}

interface Props {
  hourlyData: HourlyData[];
  unit: 'metric' | 'imperial';
  latitude: number;
  longitude: number;
  sunrise?: string;
  sunset?: string;
}

function formatHour(timeString: string): string {
  const date = new Date(timeString);
  return date.toLocaleTimeString([], { 
    hour: 'numeric', 
    hour12: true 
  });
}

function formatPrecipitation(value: number, unit: 'metric' | 'imperial'): string {
  const precipUnit = getPrecipitationUnit(unit);
  if (unit === 'imperial') {
    if (value === 0) return `0${precipUnit}`;
    return value < 0.01 ? `<0.01${precipUnit}` : 
           value < 0.1 ? `${Math.round(value * 100) / 100}${precipUnit}` : 
           `${Math.round(value * 10) / 10}${precipUnit}`;
  }
  if (value === 0) return `0${precipUnit}`;
  return value < 0.1 ? `<0.1${precipUnit}` : `${Math.round(value * 10) / 10}${precipUnit}`;
}

export default function TwelveHourForecast({ hourlyData, unit, latitude, longitude, sunrise, sunset }: Props) {
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  
  console.log('TwelveHourForecast: Rendering with', hourlyData.length, 'hours of data, unit:', unit);

  if (!hourlyData || hourlyData.length === 0) {
    return (
      <View style={getStyles(colors).container}>
        <Text style={getStyles(colors).noDataText}>No hourly forecast data available</Text>
      </View>
    );
  }

  // Get next 12 hours
  const next12Hours = hourlyData.slice(0, 12);
  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Next 12 Hours</Text>
      <Text style={styles.subtitle}>
        Hourly forecast with temperature, precipitation, and wind
      </Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {next12Hours.map((hour, index) => {
          const temperature = Math.round(hour.temperature);
          const tempUnit = unit === 'metric' ? '°C' : '°F';
          
          return (
            <View key={hour.time} style={styles.hourCard}>
              <Text style={styles.hourTime}>{formatHour(hour.time)}</Text>
              
              <View style={styles.symbolContainer}>
                <WeatherSymbol 
                  weatherCode={hour.weatherCode}
                  size={32}
                  latitude={latitude}
                  longitude={longitude}
                  time={hour.time}
                  sunrise={sunrise}
                  sunset={sunset}
                />
              </View>
              
              <Text style={styles.temperature}>
                {temperature}{tempUnit}
              </Text>
              
              <View style={styles.precipitationContainer}>
                <Text style={[styles.precipitation, { 
                  color: hour.precipitation > 0 ? colors.precipitation : colors.textMuted 
                }]}>
                  {formatPrecipitation(hour.precipitation, unit)}
                </Text>
                {hour.precipitationProbability !== undefined && (
                  <Text style={styles.precipitationProb}>
                    {Math.round(hour.precipitationProbability)}%
                  </Text>
                )}
              </View>
              
              <Text style={styles.windSpeed}>
                {Math.round(hour.windSpeed)} {unit === 'metric' ? 'km/h' : 'mph'}
              </Text>
              
              <Text style={styles.humidity}>
                {Math.round(hour.humidity)}%
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

function getStyles(colors: any) {
  return StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: colors.divider,
      boxShadow: '0 4px 12px rgba(16,24,40,0.06)',
      marginBottom: spacing.md,
    },
    title: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      fontFamily: 'Roboto_500Medium',
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 12,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      marginBottom: spacing.md,
    },
    scrollContent: {
      paddingHorizontal: 4,
      gap: spacing.sm,
    },
    hourCard: {
      alignItems: 'center',
      backgroundColor: colors.backgroundAlt,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      minWidth: 80,
      borderWidth: 1,
      borderColor: colors.divider,
    },
    hourTime: {
      fontSize: 12,
      color: colors.text,
      fontFamily: 'Roboto_500Medium',
      fontWeight: '600',
      marginBottom: spacing.sm,
    },
    symbolContainer: {
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    temperature: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Roboto_700Bold',
      marginBottom: 4,
    },
    precipitationContainer: {
      alignItems: 'center',
      marginBottom: 4,
      minHeight: 28,
      justifyContent: 'center',
    },
    precipitation: {
      fontSize: 11,
      fontFamily: 'Roboto_500Medium',
      fontWeight: '600',
    },
    precipitationProb: {
      fontSize: 9,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      marginTop: 1,
    },
    windSpeed: {
      fontSize: 10,
      color: colors.wind,
      fontFamily: 'Roboto_400Regular',
      marginBottom: 2,
    },
    humidity: {
      fontSize: 10,
      color: colors.humidity,
      fontFamily: 'Roboto_400Regular',
    },
    noDataText: {
      fontSize: 14,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      textAlign: 'center',
      padding: 20,
    },
  });
}
