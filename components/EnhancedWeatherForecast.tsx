
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../styles/commonStyles';
import WeatherSymbol from './WeatherSymbol';

interface HourlyData {
  time: string;
  temperature: number;
  windSpeed: number;
  windDirection: number;
  windGusts: number;
  humidity: number;
  precipitation: number;
  precipitationProbability: number;
  weatherCode: number;
  pressure: number;
  visibility: number;
  uvIndex: number;
  dewPoint: number;
  cloudCover: number;
}

interface Props {
  hourlyData: HourlyData[];
  unit: 'metric' | 'imperial';
  latitude: number;
  longitude: number;
  showExtended?: boolean;
}

function formatHour(timeString: string): string {
  const date = new Date(timeString);
  return date.toLocaleTimeString([], { 
    hour: 'numeric', 
    hour12: true 
  });
}

function formatDate(timeString: string): string {
  const date = new Date(timeString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  } else {
    return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  }
}

function isNightTime(timeString: string, latitude: number, longitude: number): boolean {
  const date = new Date(timeString);
  const hour = date.getHours();
  
  // Enhanced calculation with seasonal adjustment
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  const seasonalOffset = Math.sin((dayOfYear - 81) * 2 * Math.PI / 365) * 2;
  
  const timeZoneOffset = longitude / 15;
  const localHour = (hour + timeZoneOffset + 24) % 24;
  
  const sunriseHour = 6 - seasonalOffset;
  const sunsetHour = 18 + seasonalOffset;
  
  return localHour < sunriseHour || localHour > sunsetHour;
}

function groupHourlyDataByDay(hourlyData: HourlyData[]): { date: string; displayDate: string; hours: HourlyData[] }[] {
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
    displayDate: formatDate(hours[0].time),
    hours: hours.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
  }));
}

function getWindDirection(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

function getUVIndexLevel(uvIndex: number): { level: string; color: string } {
  if (uvIndex <= 2) return { level: 'Low', color: colors.success };
  if (uvIndex <= 5) return { level: 'Moderate', color: colors.warning };
  if (uvIndex <= 7) return { level: 'High', color: colors.accent };
  if (uvIndex <= 10) return { level: 'Very High', color: colors.error };
  return { level: 'Extreme', color: '#8B0000' };
}

export default function EnhancedWeatherForecast({ hourlyData, unit, latitude, longitude, showExtended = false }: Props) {
  console.log('EnhancedWeatherForecast: Rendering with', hourlyData.length, 'hours of enhanced data');

  if (!hourlyData || hourlyData.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>No enhanced forecast data available</Text>
      </View>
    );
  }

  const displayData = showExtended ? hourlyData : hourlyData.slice(0, 24);
  const dailyForecasts = groupHourlyDataByDay(displayData);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {showExtended ? 'Extended Weather Forecast' : '24-Hour Enhanced Forecast'}
      </Text>
      <Text style={styles.subtitle}>
        Detailed conditions including UV index, visibility, and pressure
      </Text>
      
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContainer}>
        {dailyForecasts.map((dayForecast, dayIndex) => (
          <View key={dayForecast.date} style={styles.dayContainer}>
            <Text style={styles.dayTitle}>{dayForecast.displayDate}</Text>
            
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
                const windDir = getWindDirection(hour.windDirection);
                const uvLevel = getUVIndexLevel(hour.uvIndex);
                const visibilityKm = Math.round(hour.visibility / 1000);
                
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
                        time={hour.time}
                      />
                    </View>
                    
                    <Text style={styles.temperature}>
                      {temperature}{tempUnit}
                    </Text>
                    
                    {hour.precipitation > 0 && (
                      <View style={styles.precipitationContainer}>
                        <Text style={styles.precipitation}>
                          {Math.round(hour.precipitation)}mm
                        </Text>
                        <Text style={styles.precipitationProb}>
                          {Math.round(hour.precipitationProbability)}%
                        </Text>
                      </View>
                    )}
                    
                    <View style={styles.windContainer}>
                      <Text style={styles.windSpeed}>
                        {Math.round(hour.windSpeed)} {unit === 'metric' ? 'km/h' : 'mph'}
                      </Text>
                      <Text style={styles.windDirection}>{windDir}</Text>
                    </View>
                    
                    <Text style={styles.humidity}>
                      💧 {Math.round(hour.humidity)}%
                    </Text>
                    
                    {hour.uvIndex > 0 && (
                      <View style={styles.uvContainer}>
                        <Text style={[styles.uvIndex, { color: uvLevel.color }]}>
                          UV {Math.round(hour.uvIndex)}
                        </Text>
                        <Text style={styles.uvLevel}>{uvLevel.level}</Text>
                      </View>
                    )}
                    
                    <Text style={styles.pressure}>
                      {Math.round(hour.pressure)} hPa
                    </Text>
                    
                    {visibilityKm < 10 && (
                      <Text style={styles.visibility}>
                        👁 {visibilityKm}km
                      </Text>
                    )}
                    
                    <Text style={styles.cloudCover}>
                      ☁️ {Math.round(hour.cloudCover)}%
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
    maxHeight: 500,
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
    borderRadius: 12,
    padding: 12,
    minWidth: 90,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  hourTime: {
    fontSize: 11,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
    marginBottom: 8,
  },
  symbolContainer: {
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  temperature: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Roboto_700Bold',
    marginBottom: 6,
  },
  precipitationContainer: {
    alignItems: 'center',
    marginBottom: 4,
  },
  precipitation: {
    fontSize: 11,
    color: colors.precipitation,
    fontFamily: 'Roboto_500Medium',
  },
  precipitationProb: {
    fontSize: 9,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
  },
  windContainer: {
    alignItems: 'center',
    marginBottom: 4,
  },
  windSpeed: {
    fontSize: 10,
    color: colors.wind,
    fontFamily: 'Roboto_500Medium',
  },
  windDirection: {
    fontSize: 9,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
  },
  humidity: {
    fontSize: 9,
    color: colors.humidity,
    fontFamily: 'Roboto_400Regular',
    marginBottom: 3,
  },
  uvContainer: {
    alignItems: 'center',
    marginBottom: 3,
  },
  uvIndex: {
    fontSize: 10,
    fontFamily: 'Roboto_500Medium',
  },
  uvLevel: {
    fontSize: 8,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
  },
  pressure: {
    fontSize: 9,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
    marginBottom: 2,
  },
  visibility: {
    fontSize: 9,
    color: colors.warning,
    fontFamily: 'Roboto_400Regular',
    marginBottom: 2,
  },
  cloudCover: {
    fontSize: 9,
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
