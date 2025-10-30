
import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../state/ThemeContext';
import { getColors, borderRadius, getShadows } from '../styles/commonStyles';
import Icon from './Icon';

interface TrackRainfallRadarProps {
  latitude: number;
  longitude: number;
  circuitName: string;
  country: string;
  category: 'f1' | 'motogp' | 'indycar';
  compact?: boolean;
  showControls?: boolean;
  autoStartAnimation?: boolean;
  radarOpacity?: number;
}

interface PrecipitationData {
  time: string;
  precipitation: number;
  precipitationProbability: number;
  weatherCode: number;
}

interface RadarData {
  current: {
    precipitation: number;
    weatherCode: number;
  };
  hourly: PrecipitationData[];
  summary: string;
}

const TrackRainfallRadar: React.FC<TrackRainfallRadarProps> = ({
  latitude,
  longitude,
  circuitName,
  country,
  category,
  compact = false,
}) => {
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const shadows = getShadows(isDark);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [radarData, setRadarData] = useState<RadarData | null>(null);

  useEffect(() => {
    fetchRainfallData();
  }, [latitude, longitude]);

  const fetchRainfallData = async () => {
    setLoading(true);
    setError(false);
    setErrorMessage('');

    try {
      console.log(`Fetching rainfall data for ${circuitName} at ${latitude}, ${longitude}`);
      
      // Fetch precipitation data from Open-Meteo API
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=precipitation,weather_code&hourly=precipitation,precipitation_probability,weather_code&timezone=auto&forecast_days=3`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Rainfall data received:', data);
      
      // Process the data
      const hourlyData: PrecipitationData[] = [];
      const maxHours = 48; // Show next 48 hours
      
      for (let i = 0; i < Math.min(maxHours, data.hourly.time.length); i++) {
        hourlyData.push({
          time: data.hourly.time[i],
          precipitation: data.hourly.precipitation[i] || 0,
          precipitationProbability: data.hourly.precipitation_probability[i] || 0,
          weatherCode: data.hourly.weather_code[i] || 0,
        });
      }
      
      // Calculate summary
      const totalPrecipitation = hourlyData.slice(0, 24).reduce((sum, h) => sum + h.precipitation, 0);
      const maxProbability = Math.max(...hourlyData.slice(0, 24).map(h => h.precipitationProbability));
      const hasRain = totalPrecipitation > 0 || maxProbability > 30;
      
      let summary = '';
      if (!hasRain) {
        summary = 'No significant rainfall expected in the next 24 hours';
      } else if (totalPrecipitation < 1) {
        summary = 'Light rainfall possible in the next 24 hours';
      } else if (totalPrecipitation < 5) {
        summary = 'Moderate rainfall expected in the next 24 hours';
      } else {
        summary = 'Heavy rainfall expected in the next 24 hours';
      }
      
      setRadarData({
        current: {
          precipitation: data.current.precipitation || 0,
          weatherCode: data.current.weather_code || 0,
        },
        hourly: hourlyData,
        summary,
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching rainfall data:', err);
      setError(true);
      setErrorMessage(err instanceof Error ? err.message : 'Failed to load rainfall data');
      setLoading(false);
    }
  };

  const getRainfallIntensity = (precipitation: number): string => {
    if (precipitation === 0) return 'None';
    if (precipitation < 0.5) return 'Trace';
    if (precipitation < 2.5) return 'Light';
    if (precipitation < 7.5) return 'Moderate';
    if (precipitation < 15) return 'Heavy';
    return 'Intense';
  };

  const getRainfallColor = (precipitation: number): string => {
    if (precipitation === 0) return colors.divider;
    if (precipitation < 0.5) return '#90EE90';
    if (precipitation < 2.5) return '#4CAF50';
    if (precipitation < 7.5) return '#FFC107';
    if (precipitation < 15) return '#FF9800';
    return '#F44336';
  };

  const getWeatherIcon = (weatherCode: number): string => {
    if (weatherCode >= 95) return 'thunderstorm';
    if (weatherCode >= 80) return 'rainy';
    if (weatherCode >= 71) return 'snow';
    if (weatherCode >= 61) return 'rainy';
    if (weatherCode >= 51) return 'rainy';
    if (weatherCode >= 45) return 'cloudy';
    if (weatherCode >= 3) return 'cloudy';
    if (weatherCode >= 1) return 'partly-sunny';
    return 'sunny';
  };

  const formatTime = (timeString: string): string => {
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    } catch {
      return timeString;
    }
  };

  const formatDate = (timeString: string): string => {
    try {
      const date = new Date(timeString);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      if (date.toDateString() === today.toDateString()) {
        return 'Today';
      } else if (date.toDateString() === tomorrow.toDateString()) {
        return 'Tomorrow';
      } else {
        return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
      }
    } catch {
      return timeString;
    }
  };

  const styles = useMemo(() => StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: compact ? 12 : 16,
      borderWidth: 1,
      borderColor: colors.divider,
      boxShadow: shadows.md,
      marginBottom: 16,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flex: 1,
    },
    title: {
      fontSize: compact ? 16 : 18,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Roboto_700Bold',
    },
    subtitle: {
      fontSize: 13,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      marginBottom: 12,
    },
    loadingContainer: {
      height: compact ? 200 : 300,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.backgroundAlt,
      borderRadius: borderRadius.md,
    },
    loadingText: {
      marginTop: 12,
      fontSize: 14,
      color: colors.text,
      fontFamily: 'Roboto_500Medium',
    },
    errorContainer: {
      height: compact ? 200 : 300,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.backgroundAlt,
      borderRadius: borderRadius.md,
      padding: 20,
    },
    errorText: {
      fontSize: 14,
      color: colors.error,
      fontFamily: 'Roboto_500Medium',
      textAlign: 'center',
      marginTop: 12,
    },
    errorDetails: {
      fontSize: 12,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      textAlign: 'center',
      marginTop: 6,
    },
    retryButton: {
      marginTop: 16,
      paddingVertical: 10,
      paddingHorizontal: 20,
      backgroundColor: colors.primary,
      borderRadius: borderRadius.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    retryButtonText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '600',
      fontFamily: 'Roboto_600SemiBold',
    },
    currentRainfall: {
      backgroundColor: colors.backgroundAlt,
      borderRadius: borderRadius.md,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.divider,
    },
    currentRainfallHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    currentRainfallTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
      fontFamily: 'Roboto_600SemiBold',
    },
    currentRainfallValue: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Roboto_700Bold',
      textAlign: 'center',
      marginBottom: 4,
    },
    currentRainfallIntensity: {
      fontSize: 14,
      color: colors.textMuted,
      fontFamily: 'Roboto_500Medium',
      textAlign: 'center',
    },
    summary: {
      fontSize: 13,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      marginTop: 8,
      fontStyle: 'italic',
      textAlign: 'center',
    },
    chartContainer: {
      marginBottom: 16,
    },
    chartTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
      fontFamily: 'Roboto_600SemiBold',
      marginBottom: 12,
    },
    chartScroll: {
      paddingVertical: 8,
    },
    hourCard: {
      backgroundColor: colors.backgroundAlt,
      borderRadius: borderRadius.md,
      padding: 12,
      marginRight: 12,
      minWidth: 80,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.divider,
    },
    hourTime: {
      fontSize: 11,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      marginBottom: 8,
    },
    hourDate: {
      fontSize: 10,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      marginBottom: 8,
    },
    hourBar: {
      width: 40,
      height: 80,
      backgroundColor: colors.divider,
      borderRadius: 4,
      justifyContent: 'flex-end',
      overflow: 'hidden',
      marginBottom: 8,
    },
    hourBarFill: {
      width: '100%',
      borderRadius: 4,
    },
    hourValue: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
      fontFamily: 'Roboto_600SemiBold',
      marginBottom: 4,
    },
    hourProb: {
      fontSize: 10,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
    },
    legend: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginTop: 8,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    legendColor: {
      width: 16,
      height: 16,
      borderRadius: 4,
    },
    legendText: {
      fontSize: 11,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
    },
    infoText: {
      fontSize: 11,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      marginTop: 8,
      fontStyle: 'italic',
    },
  }), [colors, shadows, compact]);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Icon name="rainy" size={20} color={colors.precipitation} />
            <Text style={styles.title}>Rainfall Radar</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading rainfall data...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Icon name="rainy" size={20} color={colors.precipitation} />
            <Text style={styles.title}>Rainfall Radar</Text>
          </View>
        </View>
        <View style={styles.errorContainer}>
          <Icon name="cloud-offline" size={48} color={colors.error} />
          <Text style={styles.errorText}>Unable to load rainfall data</Text>
          {errorMessage ? (
            <Text style={styles.errorDetails}>{errorMessage}</Text>
          ) : null}
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchRainfallData}
            activeOpacity={0.8}
          >
            <Icon name="refresh" size={16} color="#fff" />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!radarData) {
    return null;
  }

  // Group hourly data by day
  const groupedByDay: { [key: string]: PrecipitationData[] } = {};
  radarData.hourly.forEach(hour => {
    const date = formatDate(hour.time);
    if (!groupedByDay[date]) {
      groupedByDay[date] = [];
    }
    groupedByDay[date].push(hour);
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Icon name="rainy" size={20} color={colors.precipitation} />
          <Text style={styles.title}>Rainfall Radar</Text>
        </View>
        <TouchableOpacity 
          onPress={fetchRainfallData}
          activeOpacity={0.7}
        >
          <Icon name="refresh" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.subtitle}>
        Live precipitation data for {circuitName}
      </Text>

      {/* Current Rainfall */}
      <View style={styles.currentRainfall}>
        <View style={styles.currentRainfallHeader}>
          <Text style={styles.currentRainfallTitle}>Current Conditions</Text>
          <Icon 
            name={getWeatherIcon(radarData.current.weatherCode)} 
            size={24} 
            color={colors.text} 
          />
        </View>
        <Text style={styles.currentRainfallValue}>
          {radarData.current.precipitation.toFixed(1)} mm
        </Text>
        <Text style={styles.currentRainfallIntensity}>
          {getRainfallIntensity(radarData.current.precipitation)}
        </Text>
        <Text style={styles.summary}>{radarData.summary}</Text>
      </View>

      {/* Hourly Forecast by Day */}
      {Object.entries(groupedByDay).map(([day, hours]) => (
        <View key={day} style={styles.chartContainer}>
          <Text style={styles.chartTitle}>{day}</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chartScroll}
          >
            {hours.map((hour, index) => {
              const maxPrecipitation = 15; // mm
              const barHeight = Math.min((hour.precipitation / maxPrecipitation) * 80, 80);
              const barColor = getRainfallColor(hour.precipitation);
              
              return (
                <View key={index} style={styles.hourCard}>
                  <Text style={styles.hourTime}>{formatTime(hour.time)}</Text>
                  <View style={styles.hourBar}>
                    <View 
                      style={[
                        styles.hourBarFill, 
                        { 
                          height: barHeight,
                          backgroundColor: barColor,
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.hourValue}>
                    {hour.precipitation.toFixed(1)}mm
                  </Text>
                  <Text style={styles.hourProb}>
                    {hour.precipitationProbability}%
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        </View>
      ))}

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#90EE90' }]} />
          <Text style={styles.legendText}>Trace</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#4CAF50' }]} />
          <Text style={styles.legendText}>Light</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#FFC107' }]} />
          <Text style={styles.legendText}>Moderate</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#FF9800' }]} />
          <Text style={styles.legendText}>Heavy</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#F44336' }]} />
          <Text style={styles.legendText}>Intense</Text>
        </View>
      </View>

      <Text style={styles.infoText}>
        Data from Open-Meteo • Updated every 10 minutes
      </Text>
    </View>
  );
};

export default TrackRainfallRadar;
