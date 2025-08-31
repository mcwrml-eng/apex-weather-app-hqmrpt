
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

export default function HourlyWeatherForecast({ hourlyData, unit, latitude, longitude }: Props) {
  console.log('HourlyWeatherForecast: Rendering with', hourlyData.length, 'hours of enhanced data with visible day intervals on x-axis, unit:', unit);

  if (!hourlyData || hourlyData.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>No hourly forecast data available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>24-Hour Enhanced Forecast</Text>
      <Text style={styles.subtitle}>
        Including rain totals in {getPrecipitationUnit(unit)} with clear day intervals on x-axis
      </Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {hourlyData.map((hour, index) => {
          const isNight = isNightTime(hour.time, latitude, longitude);
          const timeScale = formatTimeWithScale(hour.time, index, hourlyData.length);
          const temperature = Math.round(hour.temperature);
          const tempUnit = unit === 'metric' ? '°C' : '°F';
          
          // Show more hours for extended view, fewer for 24-hour view
          const shouldShow = timeScale.main !== '' || index === 0 || index === hourlyData.length - 1;
          
          if (!shouldShow && hourlyData.length > 24) {
            return null; // Skip this hour for very long datasets
          }
          
          return (
            <View key={hour.time} style={[
              styles.hourCard,
              timeScale.isNewDay && styles.newDayCard
            ]}>
              {/* Day interval separator for new days on x-axis */}
              {timeScale.isNewDay && index > 0 && (
                <View style={styles.dayIntervalSeparator}>
                  <View style={styles.separatorLine} />
                  <Text style={styles.separatorText}>NEW DAY</Text>
                  <View style={styles.separatorLine} />
                </View>
              )}
              
              {/* Enhanced time display with prominent day intervals for x-axis */}
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
                    styles.dateContext,
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
              
              {/* Always show precipitation totals */}
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
              
              {hour.uvIndex !== undefined && hour.uvIndex > 0 && (
                <Text style={styles.uvIndex}>
                  UV {Math.round(hour.uvIndex)}
                </Text>
              )}
            </View>
          );
        })}
      </ScrollView>
      
      {/* Enhanced time scale legend with day interval information for x-axis */}
      <View style={styles.timeScaleLegend}>
        <Text style={styles.legendTitle}>📅 X-Axis Day Intervals & Time Scale Guide</Text>
        <View style={styles.legendContent}>
          <View style={styles.legendRow}>
            <Text style={styles.legendLabel}>Day Changes:</Text>
            <Text style={styles.legendText}>
              Highlighted with calendar icon and "NEW DAY" separator on x-axis
            </Text>
          </View>
          <View style={styles.legendRow}>
            <Text style={styles.legendLabel}>Time Format:</Text>
            <Text style={styles.legendText}>
              {hourlyData.length <= 12 ? 'HH:MM (precise timing)' : 
               hourlyData.length <= 24 ? 'HHh (hourly with day context)' : 
               'Key hours every 6h with prominent day names'}
            </Text>
          </View>
          <View style={styles.legendRow}>
            <Text style={styles.legendLabel}>X-Axis Scale:</Text>
            <Text style={styles.legendText}>
              Day intervals clearly marked for easy time navigation
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
    minWidth: 90,
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
    fontSize: 12,
    color: colors.text,
    fontFamily: 'Roboto_500Medium',
    fontWeight: '600',
  },
  newDayTime: {
    fontSize: 13,
    color: colors.accent,
    fontWeight: '700',
  },
  dateContext: {
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
    fontSize: 10,
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
    marginBottom: 2,
  },
  uvIndex: {
    fontSize: 9,
    color: colors.warning,
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
