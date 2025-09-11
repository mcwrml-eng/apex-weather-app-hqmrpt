
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

function formatTimeWithScale(timeString: string, index: number, totalHours: number): { main: string; sub: string } {
  const date = new Date(timeString);
  const hour = date.getHours();
  const minute = date.getMinutes();
  const day = date.getDate();
  const month = date.getMonth() + 1;
  
  // Different time scale formats based on data length and position
  if (totalHours <= 12) {
    // For short periods, show hour:minute
    return {
      main: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
      sub: index === 0 ? `${day}/${month}` : ''
    };
  } else if (totalHours <= 24) {
    // For 24 hours, show hour with day context
    return {
      main: `${hour.toString().padStart(2, '0')}h`,
      sub: hour === 0 || index === 0 ? `${day}/${month}` : ''
    };
  } else {
    // For longer periods, show selective hours with day context
    const isNewDay = hour === 0 || index === 0;
    const isKeyHour = hour % 6 === 0; // Show every 6 hours
    
    if (isNewDay || isKeyHour) {
      return {
        main: `${hour.toString().padStart(2, '0')}h`,
        sub: isNewDay ? `${day}/${month}` : ''
      };
    }
    return { main: '', sub: '' };
  }
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

export default function HourlyWeatherForecast({ hourlyData, unit, latitude, longitude, sunrise, sunset }: Props) {
  console.log('HourlyWeatherForecast: Rendering with', hourlyData.length, 'hours of enhanced data with time scales, unit:', unit);
  console.log('HourlyWeatherForecast: Using sunrise/sunset times:', sunrise, sunset);

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
        Including rain totals in {getPrecipitationUnit(unit)} with precise time scales
      </Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {hourlyData.map((hour, index) => {
          const timeScale = formatTimeWithScale(hour.time, index, hourlyData.length);
          const temperature = Math.round(hour.temperature);
          const tempUnit = unit === 'metric' ? '°C' : '°F';
          
          // Only show cards that have time labels or are important hours
          const shouldShow = timeScale.main !== '' || index === 0 || index === hourlyData.length - 1;
          
          if (!shouldShow && hourlyData.length > 24) {
            return null; // Skip this hour for very long datasets
          }
          
          return (
            <View key={hour.time} style={styles.hourCard}>
              {/* Enhanced time display with scale context */}
              <View style={styles.timeContainer}>
                <Text style={styles.hourTime}>{timeScale.main || formatHour(hour.time)}</Text>
                {timeScale.sub && (
                  <Text style={styles.dateContext}>{timeScale.sub}</Text>
                )}
              </View>
              
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
      
      {/* Time scale legend */}
      <View style={styles.timeScaleLegend}>
        <Text style={styles.legendTitle}>Time Scale Guide</Text>
        <View style={styles.legendRow}>
          <Text style={styles.legendText}>
            {hourlyData.length <= 12 ? 'HH:MM format' : 
             hourlyData.length <= 24 ? 'Hour format (HHh)' : 
             'Key hours every 6h'}
          </Text>
          <Text style={styles.legendSubtext}>
            Day/Month shown for context
          </Text>
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
  },
  timeContainer: {
    alignItems: 'center',
    marginBottom: 8,
    minHeight: 28,
  },
  hourTime: {
    fontSize: 12,
    color: colors.text,
    fontFamily: 'Roboto_500Medium',
    fontWeight: '600',
  },
  dateContext: {
    fontSize: 9,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
    marginTop: 1,
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
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Roboto_500Medium',
    marginBottom: 4,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  legendText: {
    fontSize: 11,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
  },
  legendSubtext: {
    fontSize: 10,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
    fontStyle: 'italic',
  },
  noDataText: {
    fontSize: 14,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
    textAlign: 'center',
    padding: 20,
  },
});
