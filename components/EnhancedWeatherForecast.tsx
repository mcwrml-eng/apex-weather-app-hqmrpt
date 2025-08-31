
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../styles/commonStyles';
import WeatherSymbol from './WeatherSymbol';
import { getPrecipitationUnit } from '../hooks/useWeather';

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

function formatTimeWithScale(timeString: string, index: number, totalHours: number): { main: string; sub: string; isNewDay: boolean; dayName: string } {
  const date = new Date(timeString);
  const hour = date.getHours();
  const minute = date.getMinutes();
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const isNewDay = hour === 0 || index === 0;
  
  // Get day name for better visibility
  const dayName = date.toLocaleDateString([], { weekday: 'short' });
  
  // Different time scale formats based on data length and position
  if (totalHours <= 12) {
    // For short periods, show hour:minute
    return {
      main: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
      sub: index === 0 ? `${dayName} ${day}/${month}` : '',
      isNewDay,
      dayName
    };
  } else if (totalHours <= 24) {
    // For 24 hours, show hour with day context
    return {
      main: `${hour.toString().padStart(2, '0')}h`,
      sub: hour === 0 || index === 0 ? `${dayName} ${day}/${month}` : '',
      isNewDay,
      dayName
    };
  } else {
    // For longer periods (72-hour), show selective hours with prominent day context
    const isKeyHour = hour % 6 === 0; // Show every 6 hours
    
    if (isNewDay || isKeyHour) {
      return {
        main: `${hour.toString().padStart(2, '0')}h`,
        sub: isNewDay ? `${dayName} ${day}/${month}` : '',
        isNewDay,
        dayName
      };
    }
    return { main: '', sub: '', isNewDay, dayName };
  }
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

export default function EnhancedWeatherForecast({ hourlyData, unit, latitude, longitude, showExtended = false }: Props) {
  console.log('EnhancedWeatherForecast: Rendering with', hourlyData.length, 'hours of enhanced data with visible day intervals, unit:', unit);

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
        {showExtended ? '72-Hour Extended Forecast' : '24-Hour Enhanced Forecast'}
      </Text>
      <Text style={styles.subtitle}>
        Detailed conditions with clear day intervals, rain totals in {getPrecipitationUnit(unit)}, UV index, visibility, and pressure
      </Text>
      
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContainer}>
        {dailyForecasts.map((dayForecast, dayIndex) => (
          <View key={dayForecast.date} style={styles.dayContainer}>
            <View style={styles.dayHeader}>
              <Text style={styles.dayTitle}>{dayForecast.displayDate}</Text>
              <Text style={styles.daySubtitle}>
                {dayForecast.hours.length} hour{dayForecast.hours.length !== 1 ? 's' : ''} of data
              </Text>
            </View>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hourlyScrollContent}
            >
              {dayForecast.hours.map((hour, hourIndex) => {
                const isNight = isNightTime(hour.time, latitude, longitude);
                const timeScale = formatTimeWithScale(hour.time, hourIndex, dayForecast.hours.length);
                const temperature = Math.round(hour.temperature);
                const tempUnit = unit === 'metric' ? '°C' : '°F';
                const windDir = getWindDirection(hour.windDirection);
                const uvLevel = getUVIndexLevel(hour.uvIndex);
                const visibilityKm = Math.round(hour.visibility / 1000);
                
                // Show more hours for extended view, fewer for 24-hour view
                const shouldShow = showExtended || timeScale.main !== '' || hourIndex === 0 || hourIndex === dayForecast.hours.length - 1;
                
                if (!shouldShow && dayForecast.hours.length > 12) {
                  return null; // Skip this hour for dense datasets
                }
                
                return (
                  <View key={hour.time} style={[
                    styles.hourCard,
                    timeScale.isNewDay && styles.newDayCard
                  ]}>
                    {/* Day interval separator for new days */}
                    {timeScale.isNewDay && hourIndex > 0 && (
                      <View style={styles.dayIntervalSeparator}>
                        <View style={styles.separatorLine} />
                        <Text style={styles.separatorText}>NEW DAY</Text>
                        <View style={styles.separatorLine} />
                      </View>
                    )}
                    
                    {/* Enhanced time display with prominent day intervals */}
                    <View style={[
                      styles.timeContainer,
                      timeScale.isNewDay && styles.newDayTimeContainer
                    ]}>
                      <Text style={[
                        styles.hourTime,
                        timeScale.isNewDay && styles.newDayTime
                      ]}>
                        {timeScale.main || formatHour(hour.time)}
                      </Text>
                      {timeScale.sub && (
                        <Text style={[
                          styles.timeContext,
                          timeScale.isNewDay && styles.newDayContext
                        ]}>
                          {timeScale.sub}
                        </Text>
                      )}
                      {timeScale.isNewDay && (
                        <View style={styles.newDayIndicator}>
                          <Text style={styles.newDayLabel}>📅</Text>
                        </View>
                      )}
                    </View>
                    
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
                    
                    {/* Always show precipitation section with rain totals */}
                    <View style={styles.precipitationContainer}>
                      <Text style={[styles.precipitation, { 
                        color: hour.precipitation > 0 ? colors.precipitation : colors.textMuted 
                      }]}>
                        🌧️ {formatPrecipitation(hour.precipitation, unit)}
                      </Text>
                      <Text style={styles.precipitationProb}>
                        {Math.round(hour.precipitationProbability)}% chance
                      </Text>
                    </View>
                    
                    <View style={styles.windContainer}>
                      <Text style={styles.windSpeed}>
                        💨 {Math.round(hour.windSpeed)} {unit === 'metric' ? 'km/h' : 'mph'}
                      </Text>
                      <Text style={styles.windDirection}>{windDir}</Text>
                    </View>
                    
                    <Text style={styles.humidity}>
                      💧 {Math.round(hour.humidity)}%
                    </Text>
                    
                    {hour.uvIndex > 0 && (
                      <View style={styles.uvContainer}>
                        <Text style={[styles.uvIndex, { color: uvLevel.color }]}>
                          ☀️ UV {Math.round(hour.uvIndex)}
                        </Text>
                        <Text style={styles.uvLevel}>{uvLevel.level}</Text>
                      </View>
                    )}
                    
                    <Text style={styles.pressure}>
                      🌡️ {Math.round(hour.pressure)} hPa
                    </Text>
                    
                    {visibilityKm < 10 && (
                      <Text style={styles.visibility}>
                        👁️ {visibilityKm}km
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
      
      {/* Enhanced time scale legend with day interval information */}
      <View style={styles.timeScaleLegend}>
        <Text style={styles.legendTitle}>📅 Day Intervals & Time Scale Guide</Text>
        <View style={styles.legendContent}>
          <View style={styles.legendRow}>
            <Text style={styles.legendLabel}>Day Changes:</Text>
            <Text style={styles.legendText}>
              Highlighted with calendar icon and "NEW DAY" separator
            </Text>
          </View>
          <View style={styles.legendRow}>
            <Text style={styles.legendLabel}>Time Format:</Text>
            <Text style={styles.legendText}>
              {displayData.length <= 12 ? 'HH:MM (precise timing)' : 
               displayData.length <= 24 ? 'HHh (hourly)' : 
               'Key hours every 6h with day names'}
            </Text>
          </View>
          <View style={styles.legendRow}>
            <Text style={styles.legendLabel}>Data Period:</Text>
            <Text style={styles.legendText}>
              {showExtended ? '72-hour extended forecast with clear day boundaries' : '24-hour detailed forecast'}
            </Text>
          </View>
        </View>
      </View>
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
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Roboto_500Medium',
  },
  daySubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
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
    minWidth: 100,
    borderWidth: 1,
    borderColor: colors.divider,
    position: 'relative',
  },
  newDayCard: {
    backgroundColor: colors.accent + '10',
    borderColor: colors.accent,
    borderWidth: 2,
  },
  dayIntervalSeparator: {
    position: 'absolute',
    top: -15,
    left: -10,
    right: -10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    paddingVertical: 4,
    borderRadius: 8,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.accent,
    marginHorizontal: 8,
  },
  separatorText: {
    fontSize: 8,
    fontWeight: '700',
    color: colors.accent,
    fontFamily: 'Roboto_700Bold',
    paddingHorizontal: 6,
  },
  timeContainer: {
    alignItems: 'center',
    marginBottom: 8,
    minHeight: 32,
  },
  newDayTimeContainer: {
    backgroundColor: colors.accent + '15',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 8,
  },
  hourTime: {
    fontSize: 11,
    color: colors.text,
    fontFamily: 'Roboto_500Medium',
    fontWeight: '600',
  },
  newDayTime: {
    fontSize: 12,
    color: colors.accent,
    fontWeight: '700',
  },
  timeContext: {
    fontSize: 9,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
    marginTop: 1,
  },
  newDayContext: {
    fontSize: 10,
    color: colors.accent,
    fontWeight: '600',
  },
  newDayIndicator: {
    marginTop: 2,
  },
  newDayLabel: {
    fontSize: 12,
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
    marginBottom: 6,
    minHeight: 32,
    justifyContent: 'center',
  },
  precipitation: {
    fontSize: 12,
    fontFamily: 'Roboto_500Medium',
    fontWeight: '600',
  },
  precipitationProb: {
    fontSize: 9,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
    marginTop: 2,
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
  timeScaleLegend: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.accent + '30',
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Roboto_500Medium',
    marginBottom: 8,
  },
  legendContent: {
    gap: 4,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendLabel: {
    fontSize: 11,
    color: colors.text,
    fontFamily: 'Roboto_500Medium',
    minWidth: 80,
  },
  legendText: {
    fontSize: 11,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
    flex: 1,
  },
  noDataText: {
    fontSize: 14,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
    textAlign: 'center',
    padding: 20,
  },
});
