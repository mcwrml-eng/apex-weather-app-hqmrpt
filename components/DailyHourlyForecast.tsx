
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { getColors } from '../styles/commonStyles';
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
  weatherCode: number;
}

interface DayForecast {
  date: string;
  dayName: string;
  hours: HourlyData[];
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

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString([], { 
    weekday: 'long',
    month: 'short',
    day: 'numeric'
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

function formatPrecipitation(value: number, unit: 'metric' | 'imperial'): string {
  const precipUnit = getPrecipitationUnit(unit);
  if (unit === 'imperial') {
    // For imperial, show more decimal places for inches since they're smaller values
    if (value === 0) return `0${precipUnit}`;
    return value < 0.01 ? `<0.01${precipUnit}` : 
           value < 0.1 ? `${Math.round(value * 100) / 100}${precipUnit}` : 
           `${Math.round(value * 10) / 10}${precipUnit}`;
  }
  // For metric (mm)
  if (value === 0) return `0${precipUnit}`;
  return value < 0.1 ? `<0.1${precipUnit}` : `${Math.round(value * 10) / 10}${precipUnit}`;
}

function groupHourlyDataByDay(hourlyData: HourlyData[]): DayForecast[] {
  const dayGroups: { [key: string]: HourlyData[] } = {};
  
  hourlyData.forEach(hour => {
    const date = new Date(hour.time);
    const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    if (!dayGroups[dateKey]) {
      dayGroups[dateKey] = [];
    }
    dayGroups[dateKey].push(hour);
  });
  
  return Object.entries(dayGroups).map(([date, hours]) => ({
    date,
    dayName: formatDate(date + 'T00:00:00'),
    hours: hours.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
  }));
}

export default function DailyHourlyForecast({ hourlyData, unit, latitude, longitude }: Props) {
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  
  console.log('DailyHourlyForecast: Rendering with', hourlyData.length, 'hours of data, unit:', unit);

  if (!hourlyData || hourlyData.length === 0) {
    return (
      <View style={getStyles(colors).container}>
        <Text style={getStyles(colors).noDataText}>No hourly forecast data available</Text>
      </View>
    );
  }

  const dailyForecasts = groupHourlyDataByDay(hourlyData);
  console.log('DailyHourlyForecast: Grouped into', dailyForecasts.length, 'days');

  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hourly Weather Forecast</Text>
      <Text style={styles.subtitle}>
        Weather symbols for each hour by day with rain totals in {getPrecipitationUnit(unit)}
      </Text>
      
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContainer}>
        {dailyForecasts.map((dayForecast, dayIndex) => (
          <View key={dayForecast.date} style={styles.dayContainer}>
            <Text style={styles.dayTitle}>{dayForecast.dayName}</Text>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hourlyScrollContent}
            >
              {dayForecast.hours.map((hour, hourIndex) => {
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
                        size={28}
                        isNight={isNight}
                        latitude={latitude}
                        longitude={longitude}
                      />
                    </View>
                    
                    <Text style={styles.temperature}>
                      {temperature}{tempUnit}
                    </Text>
                    
                    {/* Always show precipitation totals */}
                    <Text style={[styles.precipitation, { 
                      color: hour.precipitation > 0 ? colors.precipitation : colors.textMuted 
                    }]}>
                      {formatPrecipitation(hour.precipitation, unit)}
                    </Text>
                    
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
        ))}
      </ScrollView>
    </View>
  );
}

function getStyles(colors: any) {
  return StyleSheet.create({
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
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Roboto_700Bold',
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      marginBottom: 16,
    },
    scrollContainer: {
      maxHeight: 400,
    },
    dayContainer: {
      marginBottom: 20,
    },
    dayTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      fontFamily: 'Roboto_500Medium',
      marginBottom: 12,
      paddingHorizontal: 4,
    },
    hourlyScrollContent: {
      paddingHorizontal: 4,
      gap: 8,
    },
    hourCard: {
      alignItems: 'center',
      backgroundColor: colors.backgroundAlt,
      borderRadius: 10,
      padding: 10,
      minWidth: 75,
      borderWidth: 1,
      borderColor: colors.divider,
    },
    hourTime: {
      fontSize: 11,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      marginBottom: 6,
    },
    symbolContainer: {
      height: 32,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 6,
    },
    temperature: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Roboto_700Bold',
      marginBottom: 3,
    },
    precipitation: {
      fontSize: 10,
      fontFamily: 'Roboto_500Medium',
      marginBottom: 2,
      fontWeight: '600',
    },
    windSpeed: {
      fontSize: 9,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      marginBottom: 1,
    },
    humidity: {
      fontSize: 9,
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
