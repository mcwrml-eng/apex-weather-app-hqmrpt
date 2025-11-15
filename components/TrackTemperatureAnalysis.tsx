
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { getColors, borderRadius, getShadows } from '../styles/commonStyles';
import { useTheme } from '../state/ThemeContext';
import Icon from './Icon';
import { LineChart } from 'react-native-svg-charts';
import * as shape from 'd3-shape';

interface HourlyData {
  time: string;
  temperature: number;
  uvIndex: number;
  cloudCover: number;
  windSpeed: number;
}

interface TrackTemperatureAnalysisProps {
  hourlyData: HourlyData[];
  unit: 'metric' | 'imperial';
  circuitName: string;
  sunrise?: string;
  sunset?: string;
  compact?: boolean;
  latitude?: number;
}

// Determine season based on month and hemisphere
function getSeason(date: Date, latitude: number): 'summer' | 'autumn' | 'winter' | 'spring' {
  const month = date.getMonth(); // 0-11
  const isNorthernHemisphere = latitude >= 0;
  
  if (isNorthernHemisphere) {
    // Northern Hemisphere
    if (month >= 5 && month <= 7) return 'summer'; // Jun, Jul, Aug
    if (month >= 8 && month <= 10) return 'autumn'; // Sep, Oct, Nov
    if (month === 11 || month <= 1) return 'winter'; // Dec, Jan, Feb
    return 'spring'; // Mar, Apr, May
  } else {
    // Southern Hemisphere (seasons are reversed)
    if (month >= 11 || month <= 1) return 'summer'; // Dec, Jan, Feb
    if (month >= 2 && month <= 4) return 'autumn'; // Mar, Apr, May
    if (month >= 5 && month <= 7) return 'winter'; // Jun, Jul, Aug
    return 'spring'; // Sep, Oct, Nov
  }
}

// Calculate estimated track surface temperature with realistic heating
function calculateTrackTemperature(
  airTemp: number,
  uvIndex: number,
  cloudCover: number,
  windSpeed: number,
  isDaytime: boolean,
  unit: 'metric' | 'imperial',
  timeString: string,
  latitude: number = 0
): number {
  // Convert to Celsius for calculations if needed
  const airTempC = unit === 'metric' ? airTemp : (airTemp - 32) * 5 / 9;
  let trackTempC = airTempC;
  
  // Log input values for debugging
  console.log(`Track Temp Calc - Time: ${timeString}, Air: ${airTempC.toFixed(1)}°C, UV: ${uvIndex}, Cloud: ${cloudCover}%, Wind: ${windSpeed}, Daytime: ${isDaytime}`);
  
  if (isDaytime) {
    // Determine season and time of day for realistic adjustments
    const date = new Date(timeString);
    const season = getSeason(date, latitude);
    const hour = date.getHours();
    
    console.log(`  Season: ${season}, Hour: ${hour}`);
    
    // REVISED APPROACH: Start with a strong base increase that represents
    // the fundamental heat absorption of dark asphalt
    let baseIncrease: number;
    
    if (season === 'summer') {
      // Summer: Asphalt can easily be 20-25°C hotter even before peak sun
      baseIncrease = 22;
    } else if (season === 'spring' || season === 'autumn') {
      // Transitional seasons: Still significant heating
      baseIncrease = 16;
    } else {
      // Winter: Reduced but still present
      baseIncrease = 10;
    }
    
    // Time of day multiplier - this is the PRIMARY driver of track heating
    // Peak hours should add substantial additional heat
    let timeMultiplier = 1.0;
    let peakBonus = 0; // Additional flat bonus for peak hours
    
    if (hour >= 12 && hour <= 15) {
      // Peak sun hours (12 PM - 3 PM) - maximum heating
      // This is when track temps should be 40-50°C when air is 30°C
      timeMultiplier = 2.2;
      peakBonus = 12; // Extra flat bonus
    } else if (hour >= 11 && hour < 12) {
      // Late morning - strong heating building up
      timeMultiplier = 1.9;
      peakBonus = 8;
    } else if (hour >= 15 && hour < 16) {
      // Mid afternoon - still very hot
      timeMultiplier = 2.0;
      peakBonus = 10;
    } else if (hour >= 10 && hour < 11) {
      // Mid morning - moderate heating
      timeMultiplier = 1.6;
      peakBonus = 5;
    } else if (hour >= 16 && hour < 17) {
      // Late afternoon - declining but still warm
      timeMultiplier = 1.7;
      peakBonus = 6;
    } else if (hour >= 9 && hour < 10) {
      // Early-mid morning
      timeMultiplier = 1.3;
      peakBonus = 3;
    } else if (hour >= 17 && hour < 19) {
      // Evening - cooling down
      timeMultiplier = 1.4;
      peakBonus = 2;
    } else if (hour >= 7 && hour < 9) {
      // Early morning - minimal heating
      timeMultiplier = 0.9;
      peakBonus = 0;
    } else {
      // Very early or late - minimal
      timeMultiplier = 0.7;
      peakBonus = 0;
    }
    
    // UV factor - represents solar radiation intensity
    // Even moderate UV (5-6) should contribute significantly
    // High UV (8+) should add substantial heat
    const normalizedUV = Math.min(uvIndex / 11, 1);
    const uvBonus = normalizedUV * 15; // Can add up to 15°C for maximum UV
    
    // Cloud cover factor - clouds reduce heating but asphalt still absorbs heat
    // Even with 50% clouds, track should still be much hotter than air
    const cloudReduction = (cloudCover / 100) * 8; // Max 8°C reduction at 100% clouds
    
    // Wind cooling - wind does cool the track but effect is limited
    // Convert to m/s for consistent calculation
    const windSpeedMS = unit === 'metric' ? windSpeed / 3.6 : windSpeed / 2.237;
    const windCooling = Math.min(windSpeedMS * 0.4, 3); // Max 3°C cooling, reduced factor
    
    // Calculate total heating
    const totalHeating = (baseIncrease * timeMultiplier) + peakBonus + uvBonus - cloudReduction - windCooling;
    
    console.log(`  Base: ${baseIncrease}°C, Time: ${timeMultiplier.toFixed(2)}x, Peak: +${peakBonus}°C`);
    console.log(`  UV Bonus: +${uvBonus.toFixed(1)}°C, Cloud: -${cloudReduction.toFixed(1)}°C, Wind: -${windCooling.toFixed(1)}°C`);
    console.log(`  Total Heating: ${totalHeating.toFixed(1)}°C`);
    
    // Apply heating to air temperature
    trackTempC = airTempC + totalHeating;
    
    // CRITICAL: Enforce realistic minimum differences based on conditions
    // These are absolute minimums that must be met
    let minDifference: number;
    
    if (hour >= 11 && hour <= 16) {
      // Peak and near-peak hours: Track MUST be significantly hotter
      if (season === 'summer') {
        minDifference = 18; // Minimum 18°C hotter in summer peak hours
      } else if (season === 'spring' || season === 'autumn') {
        minDifference = 14; // Minimum 14°C hotter in transitional seasons
      } else {
        minDifference = 10; // Minimum 10°C hotter in winter
      }
      
      // Additional boost for very sunny conditions during peak hours
      if (uvIndex > 6 && cloudCover < 40) {
        minDifference += 8; // Add 8°C for excellent sun conditions
      }
    } else if (hour >= 9 && hour < 11) {
      // Morning hours
      if (season === 'summer') {
        minDifference = 12;
      } else if (season === 'spring' || season === 'autumn') {
        minDifference = 10;
      } else {
        minDifference = 7;
      }
    } else if (hour >= 16 && hour < 19) {
      // Afternoon/evening hours
      if (season === 'summer') {
        minDifference = 14;
      } else if (season === 'spring' || season === 'autumn') {
        minDifference = 11;
      } else {
        minDifference = 8;
      }
    } else {
      // Early morning or late evening
      if (season === 'summer') {
        minDifference = 8;
      } else if (season === 'spring' || season === 'autumn') {
        minDifference = 6;
      } else {
        minDifference = 4;
      }
    }
    
    // Apply minimum difference guarantee
    if (trackTempC - airTempC < minDifference) {
      console.log(`  Applying minimum difference: ${minDifference}°C (was ${(trackTempC - airTempC).toFixed(1)}°C)`);
      trackTempC = airTempC + minDifference;
    }
    
    // Additional boost for high air temperatures (heat accumulation effect)
    // When air temp is already high (25°C+), track heats up even more
    if (airTempC >= 25 && hour >= 11 && hour <= 16) {
      const heatAccumulationBonus = (airTempC - 25) * 0.5; // 0.5°C per degree above 25°C
      console.log(`  Heat accumulation bonus: +${heatAccumulationBonus.toFixed(1)}°C`);
      trackTempC += heatAccumulationBonus;
    }
    
  } else {
    // At night, track cools down but retains some heat initially
    // Track is typically 2-4°C cooler than air at night due to radiation cooling
    const nightCoolingFactor = 3;
    trackTempC = airTempC - nightCoolingFactor;
    console.log(`  Night time - cooling by ${nightCoolingFactor}°C`);
  }
  
  // Convert back to Fahrenheit if needed
  let trackTemp = unit === 'metric' ? trackTempC : (trackTempC * 9 / 5) + 32;
  
  // Ensure track temperature is within realistic bounds
  const minTemp = unit === 'metric' ? -20 : -4;
  const maxTemp = unit === 'metric' ? 75 : 167;
  
  trackTemp = Math.max(minTemp, Math.min(maxTemp, trackTemp));
  
  console.log(`  Final Track Temp: ${trackTemp.toFixed(1)}°${unit === 'metric' ? 'C' : 'F'}, Difference: +${(trackTemp - airTemp).toFixed(1)}°`);
  
  return trackTemp;
}

// Determine if it's daytime based on time and sun times
function isDaytime(timeString: string, sunrise?: string, sunset?: string): boolean {
  if (!sunrise || !sunset) {
    // Fallback: assume daytime is 6 AM to 8 PM
    const hour = new Date(timeString).getHours();
    return hour >= 6 && hour < 20;
  }
  
  try {
    const time = new Date(timeString);
    const timeDate = time.toDateString();
    
    // Parse sunrise and sunset times
    // They might be in format "HH:MM" or full ISO string
    let sunriseTime: Date;
    let sunsetTime: Date;
    
    if (sunrise.includes('T')) {
      // Full ISO string
      sunriseTime = new Date(sunrise);
    } else {
      // Just time string like "06:30"
      sunriseTime = new Date(timeDate + ' ' + sunrise);
    }
    
    if (sunset.includes('T')) {
      // Full ISO string
      sunsetTime = new Date(sunset);
    } else {
      // Just time string like "18:45"
      sunsetTime = new Date(timeDate + ' ' + sunset);
    }
    
    return time >= sunriseTime && time < sunsetTime;
  } catch (err) {
    console.error('Error determining daytime:', err);
    // Fallback
    const hour = new Date(timeString).getHours();
    return hour >= 6 && hour < 20;
  }
}

// Get track condition based on temperature
function getTrackCondition(trackTemp: number, unit: 'metric' | 'imperial'): {
  condition: string;
  color: string;
  description: string;
  gripLevel: string;
} {
  const tempC = unit === 'metric' ? trackTemp : (trackTemp - 32) * 5 / 9;
  
  if (tempC < 10) {
    return {
      condition: 'Very Cold',
      color: '#2196F3',
      description: 'Difficult to generate tire temperature',
      gripLevel: 'Low'
    };
  } else if (tempC < 20) {
    return {
      condition: 'Cold',
      color: '#03A9F4',
      description: 'Tires need warm-up laps',
      gripLevel: 'Moderate'
    };
  } else if (tempC < 30) {
    return {
      condition: 'Optimal',
      color: '#4CAF50',
      description: 'Ideal conditions for grip',
      gripLevel: 'High'
    };
  } else if (tempC < 40) {
    return {
      condition: 'Warm',
      color: '#FF9800',
      description: 'Good grip, watch tire degradation',
      gripLevel: 'High'
    };
  } else if (tempC < 50) {
    return {
      condition: 'Hot',
      color: '#FF5722',
      description: 'High tire wear, overheating risk',
      gripLevel: 'Moderate'
    };
  } else {
    return {
      condition: 'Very Hot',
      color: '#D32F2F',
      description: 'Extreme tire degradation',
      gripLevel: 'Low'
    };
  }
}

// Format time for display
function formatTime(timeString: string): string {
  const date = new Date(timeString);
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

// Format date for display
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

export default function TrackTemperatureAnalysis({
  hourlyData,
  unit,
  circuitName,
  sunrise,
  sunset,
  compact = false,
  latitude = 0
}: TrackTemperatureAnalysisProps) {
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const shadows = getShadows(isDark);
  
  // Calculate track temperatures for all hours
  const trackTemperatures = useMemo(() => {
    console.log('=== Track Temperature Analysis ===');
    console.log(`Circuit: ${circuitName}, Latitude: ${latitude}`);
    console.log(`Sunrise: ${sunrise}, Sunset: ${sunset}`);
    console.log(`Processing ${hourlyData.length} hours of data`);
    
    return hourlyData.map((hour, index) => {
      const isDay = isDaytime(hour.time, sunrise, sunset);
      const trackTemp = calculateTrackTemperature(
        hour.temperature,
        hour.uvIndex,
        hour.cloudCover,
        hour.windSpeed,
        isDay,
        unit,
        hour.time,
        latitude
      );
      
      if (index < 3) {
        console.log(`Hour ${index}: Air ${hour.temperature}°, Track ${trackTemp.toFixed(1)}°, Diff: +${(trackTemp - hour.temperature).toFixed(1)}°`);
      }
      
      return {
        time: hour.time,
        airTemp: hour.temperature,
        trackTemp: trackTemp,
        difference: trackTemp - hour.temperature,
        condition: getTrackCondition(trackTemp, unit),
        isDaytime: isDay,
        uvIndex: hour.uvIndex,
        cloudCover: hour.cloudCover,
        windSpeed: hour.windSpeed,
        season: getSeason(new Date(hour.time), latitude)
      };
    });
  }, [hourlyData, unit, sunrise, sunset, latitude, circuitName]);
  
  // Calculate statistics
  const stats = useMemo(() => {
    const trackTemps = trackTemperatures.map(t => t.trackTemp);
    const differences = trackTemperatures.map(t => t.difference);
    
    const statsData = {
      minTrackTemp: Math.min(...trackTemps),
      maxTrackTemp: Math.max(...trackTemps),
      avgTrackTemp: trackTemps.reduce((sum, t) => sum + t, 0) / trackTemps.length,
      minDifference: Math.min(...differences),
      maxDifference: Math.max(...differences),
      avgDifference: differences.reduce((sum, d) => sum + d, 0) / differences.length,
      optimalHours: trackTemperatures.filter(t => t.condition.condition === 'Optimal').length,
      hotHours: trackTemperatures.filter(t => 
        t.condition.condition === 'Hot' || t.condition.condition === 'Very Hot'
      ).length
    };
    
    console.log('=== Statistics ===');
    console.log(`Avg Difference: ${statsData.avgDifference.toFixed(1)}°`);
    console.log(`Min/Max Difference: ${statsData.minDifference.toFixed(1)}° / ${statsData.maxDifference.toFixed(1)}°`);
    
    return statsData;
  }, [trackTemperatures]);
  
  // Group by day for better organization
  const dailyGroups = useMemo(() => {
    const groups: { [key: string]: typeof trackTemperatures } = {};
    
    trackTemperatures.forEach(temp => {
      const dateKey = new Date(temp.time).toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(temp);
    });
    
    return Object.entries(groups).map(([date, temps]) => ({
      date,
      displayDate: formatDate(temps[0].time),
      temperatures: temps
    }));
  }, [trackTemperatures]);
  
  const tempUnit = unit === 'metric' ? '°C' : '°F';
  const styles = getStyles(colors, shadows);
  
  if (compact) {
    // Compact view for dashboard
    const currentTemp = trackTemperatures[0];
    
    return (
      <View style={styles.compactContainer}>
        <View style={styles.compactHeader}>
          <Icon name="thermometer" size={20} color={colors.accent} />
          <Text style={styles.compactTitle}>Track Temperature</Text>
        </View>
        
        <View style={styles.compactContent}>
          <View style={styles.compactTempContainer}>
            <Text style={styles.compactTrackTemp}>
              {Math.round(currentTemp.trackTemp)}{tempUnit}
            </Text>
            <Text style={styles.compactAirTemp}>
              Air: {Math.round(currentTemp.airTemp)}{tempUnit}
            </Text>
          </View>
          
          <View style={[styles.compactCondition, { backgroundColor: currentTemp.condition.color + '20' }]}>
            <Text style={[styles.compactConditionText, { color: currentTemp.condition.color }]}>
              {currentTemp.condition.condition}
            </Text>
            <Text style={styles.compactGripLevel}>
              Grip: {currentTemp.condition.gripLevel}
            </Text>
          </View>
        </View>
      </View>
    );
  }
  
  // Full detailed view
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Icon name="thermometer" size={24} color={colors.accent} />
          <View>
            <Text style={styles.title}>Track Temperature Analysis</Text>
            <Text style={styles.subtitle}>Estimated surface temperature for {circuitName}</Text>
          </View>
        </View>
      </View>
      
      {/* Statistics Overview */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Current Track</Text>
          <Text style={styles.statValue}>
            {Math.round(trackTemperatures[0].trackTemp)}{tempUnit}
          </Text>
          <Text style={styles.statSub}>
            +{Math.round(trackTemperatures[0].difference)}{tempUnit} vs air
          </Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Range</Text>
          <Text style={styles.statValue}>
            {Math.round(stats.minTrackTemp)}-{Math.round(stats.maxTrackTemp)}{tempUnit}
          </Text>
          <Text style={styles.statSub}>
            Avg: {Math.round(stats.avgTrackTemp)}{tempUnit}
          </Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Optimal Hours</Text>
          <Text style={styles.statValue}>
            {stats.optimalHours}
          </Text>
          <Text style={styles.statSub}>
            {stats.hotHours} hot hours
          </Text>
        </View>
      </View>
      
      {/* Temperature Chart */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Track vs Air Temperature</Text>
        <View style={styles.chartLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.accent }]} />
            <Text style={styles.legendText}>Track Surface</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.textMuted }]} />
            <Text style={styles.legendText}>Air Temperature</Text>
          </View>
        </View>
        
        <View style={styles.chart}>
          <LineChart
            style={{ flex: 1, height: 140 }}
            data={trackTemperatures.map(t => t.trackTemp)}
            contentInset={{ top: 20, bottom: 20, left: 10, right: 10 }}
            curve={shape.curveMonotoneX}
            svg={{
              stroke: colors.accent,
              strokeWidth: 3,
            }}
          />
          <LineChart
            style={{ flex: 1, height: 140, position: 'absolute', width: '100%' }}
            data={trackTemperatures.map(t => t.airTemp)}
            contentInset={{ top: 20, bottom: 20, left: 10, right: 10 }}
            curve={shape.curveMonotoneX}
            svg={{
              stroke: colors.textMuted,
              strokeWidth: 2,
              strokeDasharray: [5, 5],
            }}
          />
        </View>
      </View>
      
      {/* Hourly Breakdown */}
      <View style={styles.hourlyContainer}>
        <Text style={styles.sectionTitle}>Hourly Track Conditions</Text>
        
        <ScrollView showsVerticalScrollIndicator={false}>
          {dailyGroups.map((day, dayIndex) => (
            <View key={day.date} style={styles.dayGroup}>
              <Text style={styles.dayTitle}>{day.displayDate}</Text>
              
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.hourlyScroll}
              >
                {day.temperatures.map((temp, index) => (
                  <View 
                    key={temp.time} 
                    style={[
                      styles.hourCard,
                      { borderLeftColor: temp.condition.color, borderLeftWidth: 4 }
                    ]}
                  >
                    <Text style={styles.hourTime}>{formatTime(temp.time)}</Text>
                    
                    <View style={styles.hourTempContainer}>
                      <Text style={styles.hourTrackTemp}>
                        {Math.round(temp.trackTemp)}{tempUnit}
                      </Text>
                      <Text style={styles.hourAirTemp}>
                        Air: {Math.round(temp.airTemp)}{tempUnit}
                      </Text>
                      <Text style={styles.hourDifference}>
                        Δ {temp.difference > 0 ? '+' : ''}{Math.round(temp.difference)}{tempUnit}
                      </Text>
                    </View>
                    
                    <View style={[styles.conditionBadge, { backgroundColor: temp.condition.color + '20' }]}>
                      <Text style={[styles.conditionText, { color: temp.condition.color }]}>
                        {temp.condition.condition}
                      </Text>
                    </View>
                    
                    <Text style={styles.gripLevel}>
                      Grip: {temp.condition.gripLevel}
                    </Text>
                    
                    <View style={styles.factorsContainer}>
                      <Text style={styles.factorText}>
                        ☀️ UV {Math.round(temp.uvIndex)}
                      </Text>
                      <Text style={styles.factorText}>
                        ☁️ {Math.round(temp.cloudCover)}%
                      </Text>
                      <Text style={styles.factorText}>
                        💨 {Math.round(temp.windSpeed)} {unit === 'metric' ? 'km/h' : 'mph'}
                      </Text>
                    </View>
                    
                    <Text style={styles.description}>
                      {temp.condition.description}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          ))}
        </ScrollView>
      </View>
      
      {/* Information Panel */}
      <View style={styles.infoPanel}>
        <Text style={styles.infoTitle}>ℹ️ About Track Temperature</Text>
        <Text style={styles.infoText}>
          Track surface temperature is estimated based on air temperature, solar radiation (UV index), 
          cloud cover, wind speed, time of day, and seasonal variations. Asphalt surfaces absorb 
          significant heat and are typically much hotter than air temperature in direct sunlight.
        </Text>
        <Text style={styles.infoText}>
          • <Text style={styles.infoBold}>Peak Hours (12-3 PM):</Text> Track typically 18-30°C (32-54°F) above ambient{'\n'}
          • <Text style={styles.infoBold}>Morning/Evening:</Text> Track typically 10-18°C (18-32°F) above ambient{'\n'}
          • <Text style={styles.infoBold}>Example:</Text> 30°C air at 2 PM → 45-50°C track temperature{'\n'}
          • <Text style={styles.infoBold}>Optimal:</Text> 20-30°C (68-86°F) - Best grip and tire performance
        </Text>
      </View>
    </View>
  );
}

function getStyles(colors: any, shadows: any) {
  return StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.divider,
      boxShadow: shadows.md,
      marginBottom: 16,
    },
    compactContainer: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.divider,
      boxShadow: shadows.sm,
      marginBottom: 12,
    },
    header: {
      marginBottom: 16,
    },
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
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
      marginTop: 2,
    },
    compactHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 12,
    },
    compactTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
      fontFamily: 'Roboto_500Medium',
    },
    compactContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    compactTempContainer: {
      flex: 1,
    },
    compactTrackTemp: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Roboto_700Bold',
    },
    compactAirTemp: {
      fontSize: 12,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      marginTop: 2,
    },
    compactCondition: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      alignItems: 'center',
    },
    compactConditionText: {
      fontSize: 13,
      fontWeight: '600',
      fontFamily: 'Roboto_500Medium',
    },
    compactGripLevel: {
      fontSize: 10,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      marginTop: 2,
    },
    statsContainer: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 16,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.backgroundAlt,
      borderRadius: 10,
      padding: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.divider,
    },
    statLabel: {
      fontSize: 11,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      marginBottom: 4,
    },
    statValue: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Roboto_700Bold',
      marginBottom: 2,
    },
    statSub: {
      fontSize: 10,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
    },
    chartContainer: {
      backgroundColor: colors.backgroundAlt,
      borderRadius: 10,
      padding: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.divider,
    },
    chartTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      fontFamily: 'Roboto_500Medium',
      marginBottom: 8,
    },
    chartLegend: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 20,
      marginBottom: 12,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    legendDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
    },
    legendText: {
      fontSize: 11,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
    },
    chart: {
      height: 140,
      position: 'relative',
    },
    hourlyContainer: {
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      fontFamily: 'Roboto_500Medium',
      marginBottom: 12,
    },
    dayGroup: {
      marginBottom: 16,
    },
    dayTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      fontFamily: 'Roboto_500Medium',
      marginBottom: 8,
      paddingHorizontal: 4,
    },
    hourlyScroll: {
      paddingHorizontal: 4,
      gap: 10,
    },
    hourCard: {
      backgroundColor: colors.background,
      borderRadius: 10,
      padding: 12,
      minWidth: 140,
      borderWidth: 1,
      borderColor: colors.divider,
    },
    hourTime: {
      fontSize: 12,
      color: colors.textMuted,
      fontFamily: 'Roboto_500Medium',
      marginBottom: 8,
    },
    hourTempContainer: {
      marginBottom: 8,
    },
    hourTrackTemp: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Roboto_700Bold',
    },
    hourAirTemp: {
      fontSize: 11,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      marginTop: 2,
    },
    hourDifference: {
      fontSize: 11,
      color: colors.accent,
      fontFamily: 'Roboto_500Medium',
      marginTop: 2,
    },
    conditionBadge: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 6,
      alignSelf: 'flex-start',
      marginBottom: 6,
    },
    conditionText: {
      fontSize: 12,
      fontWeight: '600',
      fontFamily: 'Roboto_500Medium',
    },
    gripLevel: {
      fontSize: 11,
      color: colors.text,
      fontFamily: 'Roboto_500Medium',
      marginBottom: 8,
    },
    factorsContainer: {
      gap: 4,
      marginBottom: 8,
    },
    factorText: {
      fontSize: 10,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
    },
    description: {
      fontSize: 10,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      fontStyle: 'italic',
    },
    infoPanel: {
      backgroundColor: colors.backgroundAlt,
      borderRadius: 10,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.accent + '30',
    },
    infoTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
      fontFamily: 'Roboto_500Medium',
      marginBottom: 8,
    },
    infoText: {
      fontSize: 11,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      lineHeight: 16,
      marginBottom: 6,
    },
    infoBold: {
      fontWeight: '600',
      color: colors.text,
      fontFamily: 'Roboto_500Medium',
    },
  });
}
