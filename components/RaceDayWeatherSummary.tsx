
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../state/ThemeContext';
import { useUnit } from '../state/UnitContext';
import { getColors, borderRadius, getShadows } from '../styles/commonStyles';
import Icon from './Icon';
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

interface RaceDayWeatherSummaryProps {
  hourlyData: HourlyData[];
  unit: 'metric' | 'imperial';
  circuitName: string;
  raceStartTime?: string;
  sessionDuration?: number;
}

const RaceDayWeatherSummary: React.FC<RaceDayWeatherSummaryProps> = ({
  hourlyData,
  unit,
  circuitName,
  raceStartTime,
  sessionDuration = 2,
}) => {
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const shadows = getShadows(isDark);

  // Find optimal time windows for track sessions
  const optimalWindows = useMemo(() => {
    const windows: {
      startTime: string;
      endTime: string;
      score: number;
      conditions: string;
      avgTemp: number;
      avgWind: number;
      rainChance: number;
    }[] = [];

    // Analyze 3-hour windows
    for (let i = 0; i < hourlyData.length - 3; i++) {
      const window = hourlyData.slice(i, i + 3);
      
      // Calculate score (0-100, higher is better)
      let score = 100;
      
      // Penalize for rain
      const avgRainChance = window.reduce((sum, h) => sum + h.precipitationProbability, 0) / window.length;
      score -= avgRainChance * 0.5;
      
      // Penalize for high winds
      const avgWind = window.reduce((sum, h) => sum + h.windSpeed, 0) / window.length;
      if (avgWind > 40) score -= (avgWind - 40) * 0.5;
      
      // Penalize for extreme temperatures
      const avgTemp = window.reduce((sum, h) => sum + h.temperature, 0) / window.length;
      if (unit === 'metric') {
        if (avgTemp > 35) score -= (avgTemp - 35) * 2;
        if (avgTemp < 10) score -= (10 - avgTemp) * 2;
      } else {
        if (avgTemp > 95) score -= (avgTemp - 95) * 2;
        if (avgTemp < 50) score -= (50 - avgTemp) * 2;
      }
      
      // Penalize for poor visibility
      const avgVisibility = window.reduce((sum, h) => sum + h.visibility, 0) / window.length;
      if (avgVisibility < 5000) score -= (5000 - avgVisibility) / 100;
      
      let conditions = 'Excellent';
      if (score >= 90) conditions = 'Excellent';
      else if (score >= 75) conditions = 'Good';
      else if (score >= 60) conditions = 'Fair';
      else if (score >= 40) conditions = 'Challenging';
      else conditions = 'Difficult';
      
      windows.push({
        startTime: window[0].time,
        endTime: window[window.length - 1].time,
        score: Math.max(0, Math.min(100, score)),
        conditions,
        avgTemp,
        avgWind,
        rainChance: avgRainChance,
      });
    }
    
    // Sort by score
    return windows.sort((a, b) => b.score - a.score).slice(0, 5);
  }, [hourlyData, unit]);

  // Analyze race start time conditions if provided
  const raceStartConditions = useMemo(() => {
    if (!raceStartTime) return null;
    
    const raceStart = new Date(raceStartTime);
    const raceHourData = hourlyData.find(h => {
      const hourTime = new Date(h.time);
      return Math.abs(hourTime.getTime() - raceStart.getTime()) < 3600000; // Within 1 hour
    });
    
    if (!raceHourData) return null;
    
    // Get session duration data
    const raceStartIndex = hourlyData.findIndex(h => h.time === raceHourData.time);
    const sessionData = hourlyData.slice(raceStartIndex, raceStartIndex + sessionDuration);
    
    return {
      start: raceHourData,
      session: sessionData,
      avgTemp: sessionData.reduce((sum, h) => sum + h.temperature, 0) / sessionData.length,
      maxWind: Math.max(...sessionData.map(h => h.windSpeed)),
      maxRainChance: Math.max(...sessionData.map(h => h.precipitationProbability)),
      totalPrecipitation: sessionData.reduce((sum, h) => sum + h.precipitation, 0),
    };
  }, [raceStartTime, hourlyData, sessionDuration]);

  const formatTime = (timeString: string): string => {
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    } catch {
      return timeString;
    }
  };

  const getConditionColor = (conditions: string): string => {
    switch (conditions) {
      case 'Excellent': return colors.success;
      case 'Good': return colors.warning;
      case 'Fair': return colors.textMuted;
      case 'Challenging': return colors.error;
      case 'Difficult': return colors.error;
      default: return colors.text;
    }
  };

  const styles = useMemo(() => StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.divider,
      boxShadow: shadows.md,
      marginBottom: 16,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 12,
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Roboto_700Bold',
    },
    subtitle: {
      fontSize: 13,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      marginBottom: 16,
    },
    section: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
      fontFamily: 'Roboto_600SemiBold',
      marginBottom: 12,
    },
    raceStartCard: {
      backgroundColor: colors.primary + '15',
      borderRadius: borderRadius.md,
      padding: 16,
      borderWidth: 2,
      borderColor: colors.primary + '30',
      marginBottom: 16,
    },
    raceStartHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    raceStartTime: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.primary,
      fontFamily: 'Roboto_700Bold',
    },
    raceStartGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    raceStartMetric: {
      flex: 1,
      minWidth: '45%',
      backgroundColor: colors.backgroundAlt,
      borderRadius: borderRadius.sm,
      padding: 10,
    },
    metricLabel: {
      fontSize: 11,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      marginBottom: 4,
    },
    metricValue: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Roboto_700Bold',
    },
    windowCard: {
      backgroundColor: colors.backgroundAlt,
      borderRadius: borderRadius.md,
      padding: 14,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.divider,
    },
    windowHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    windowTime: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      fontFamily: 'Roboto_600SemiBold',
    },
    windowScore: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    scoreBar: {
      width: 60,
      height: 6,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      borderRadius: 3,
      overflow: 'hidden',
    },
    scoreBarFill: {
      height: '100%',
      borderRadius: 3,
    },
    scoreText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text,
      fontFamily: 'Roboto_600SemiBold',
    },
    conditionsBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: borderRadius.sm,
      alignSelf: 'flex-start',
      marginBottom: 10,
    },
    conditionsText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#fff',
      fontFamily: 'Roboto_600SemiBold',
    },
    windowDetails: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    windowDetail: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    windowDetailText: {
      fontSize: 12,
      color: colors.text,
      fontFamily: 'Roboto_400Regular',
    },
    bestWindowBadge: {
      position: 'absolute',
      top: 10,
      right: 10,
      backgroundColor: colors.success,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: borderRadius.sm,
    },
    bestWindowText: {
      fontSize: 10,
      fontWeight: '700',
      color: '#fff',
      fontFamily: 'Roboto_700Bold',
    },
  }), [colors, shadows, isDark]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icon name="flag" size={20} color={colors.primary} />
        <Text style={styles.title}>Race Day Analysis</Text>
      </View>
      
      <Text style={styles.subtitle}>
        Optimal track conditions for {circuitName}
      </Text>

      {raceStartConditions && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Race Start Conditions</Text>
          <View style={styles.raceStartCard}>
            <View style={styles.raceStartHeader}>
              <Text style={styles.raceStartTime}>
                {formatTime(raceStartConditions.start.time)}
              </Text>
              <WeatherSymbol
                weatherCode={raceStartConditions.start.weatherCode}
                size={32}
              />
            </View>
            
            <View style={styles.raceStartGrid}>
              <View style={styles.raceStartMetric}>
                <Text style={styles.metricLabel}>Temperature</Text>
                <Text style={styles.metricValue}>
                  {Math.round(raceStartConditions.avgTemp)}°{unit === 'metric' ? 'C' : 'F'}
                </Text>
              </View>
              
              <View style={styles.raceStartMetric}>
                <Text style={styles.metricLabel}>Max Wind</Text>
                <Text style={styles.metricValue}>
                  {Math.round(raceStartConditions.maxWind)} {unit === 'metric' ? 'km/h' : 'mph'}
                </Text>
              </View>
              
              <View style={styles.raceStartMetric}>
                <Text style={styles.metricLabel}>Rain Chance</Text>
                <Text style={styles.metricValue}>
                  {Math.round(raceStartConditions.maxRainChance)}%
                </Text>
              </View>
              
              <View style={styles.raceStartMetric}>
                <Text style={styles.metricLabel}>Total Rain</Text>
                <Text style={styles.metricValue}>
                  {raceStartConditions.totalPrecipitation.toFixed(1)}mm
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Optimal Time Windows</Text>
        <ScrollView showsVerticalScrollIndicator={false}>
          {optimalWindows.map((window, index) => (
            <View key={index} style={styles.windowCard}>
              {index === 0 && (
                <View style={styles.bestWindowBadge}>
                  <Text style={styles.bestWindowText}>BEST</Text>
                </View>
              )}
              
              <View style={styles.windowHeader}>
                <Text style={styles.windowTime}>
                  {formatTime(window.startTime)} - {formatTime(window.endTime)}
                </Text>
                <View style={styles.windowScore}>
                  <View style={styles.scoreBar}>
                    <View 
                      style={[
                        styles.scoreBarFill, 
                        { 
                          width: `${window.score}%`,
                          backgroundColor: getConditionColor(window.conditions),
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.scoreText}>{Math.round(window.score)}</Text>
                </View>
              </View>
              
              <View 
                style={[
                  styles.conditionsBadge,
                  { backgroundColor: getConditionColor(window.conditions) }
                ]}
              >
                <Text style={styles.conditionsText}>{window.conditions}</Text>
              </View>
              
              <View style={styles.windowDetails}>
                <View style={styles.windowDetail}>
                  <Icon name="thermometer" size={14} color={colors.temperature} />
                  <Text style={styles.windowDetailText}>
                    {Math.round(window.avgTemp)}°{unit === 'metric' ? 'C' : 'F'}
                  </Text>
                </View>
                
                <View style={styles.windowDetail}>
                  <Icon name="flag" size={14} color={colors.wind} />
                  <Text style={styles.windowDetailText}>
                    {Math.round(window.avgWind)} {unit === 'metric' ? 'km/h' : 'mph'}
                  </Text>
                </View>
                
                <View style={styles.windowDetail}>
                  <Icon name="rainy" size={14} color={colors.precipitation} />
                  <Text style={styles.windowDetailText}>
                    {Math.round(window.rainChance)}% chance
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

export default RaceDayWeatherSummary;
