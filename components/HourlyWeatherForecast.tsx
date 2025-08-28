
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../styles/commonStyles';
import WeatherSymbol from './WeatherSymbol';

interface HourlyData {
  time: string;
  temperature: number;
  windSpeed: number;
  windDirection: number;
  humidity: number;
  precipitation: number;
  weatherCode: number;
}

interface Props {
  hourlyData: HourlyData[];
  unit: 'metric' | 'imperial';
  latitude: number;
  longitude: number;
}

function formatHour(timeString: string): string {
  const date = new Date(timeString);
  return date.toLocaleTimeString([], { 
    hour: 'numeric', 
    hour12: true 
  });
}

function isNightTime(timeString: string, latitude: number, longitude: number): boolean {
  const date = new Date(timeString);
  const hour = date.getHours();
  
  // Rough approximation: adjust for longitude (each 15 degrees = 1 hour)
  const timeZoneOffset = longitude / 15;
  const localHour = (hour + timeZoneOffset + 24) % 24;
  
  // Consider it night between 7 PM and 6 AM
  return localHour < 6 || localHour > 19;
}

export default function HourlyWeatherForecast({ hourlyData, unit, latitude, longitude }: Props) {
  console.log('HourlyWeatherForecast: Rendering with', hourlyData.length, 'hours of data');

  if (!hourlyData || hourlyData.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>No hourly forecast data available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>24-Hour Forecast</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {hourlyData.map((hour, index) => {
          const isNight = isNightTime(hour.time, latitude, longitude);
          const hourLabel = formatHour(hour.time);
          const temperature = Math.round(hour.temperature);
          const tempUnit = unit === 'metric' ? '°C' : '°F';
          
          return (
            <View key={hour.time} style={styles.hourCard}>
              <Text style={styles.hourTime}>{hourLabel}</Text>
              
              <View style={styles.symbolContainer}>
                <WeatherSymbol 
                  weatherCode={hour.weatherCode}
                  size={32}
                  isNight={isNight}
                  latitude={latitude}
                  longitude={longitude}
                />
              </View>
              
              <Text style={styles.temperature}>
                {temperature}{tempUnit}
              </Text>
              
              {hour.precipitation > 0 && (
                <Text style={styles.precipitation}>
                  {Math.round(hour.precipitation)}mm
                </Text>
              )}
              
              <Text style={styles.windSpeed}>
                {Math.round(hour.windSpeed)} {unit === 'metric' ? 'km/h' : 'mph'}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.divider,
    boxShadow: '0 6px 24px rgba(16,24,40,0.06)',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Roboto_500Medium',
    marginBottom: 12,
  },
  scrollContent: {
    paddingHorizontal: 4,
    gap: 12,
  },
  hourCard: {
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    padding: 12,
    minWidth: 80,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  hourTime: {
    fontSize: 12,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
    marginBottom: 8,
  },
  symbolContainer: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  temperature: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Roboto_700Bold',
    marginBottom: 4,
  },
  precipitation: {
    fontSize: 11,
    color: colors.precipitation,
    fontFamily: 'Roboto_400Regular',
    marginBottom: 2,
  },
  windSpeed: {
    fontSize: 10,
    color: colors.textMuted,
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
