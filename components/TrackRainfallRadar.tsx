
import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { useTheme } from '../state/ThemeContext';
import { getColors, borderRadius, getShadows } from '../styles/commonStyles';
import Icon from './Icon';
import WeatherSymbol from './WeatherSymbol';
import Svg, { Circle, Line, Text as SvgText, Defs, RadialGradient, Stop, G, Path, Polygon } from 'react-native-svg';

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
  windSpeed?: number;
  windDirection?: number;
}

interface RadarData {
  current: {
    precipitation: number;
    weatherCode: number;
    windSpeed: number;
    windDirection: number;
  };
  hourly: PrecipitationData[];
  minutely: PrecipitationData[];
  summary: string;
  gridData: PrecipitationZone[];
  sunrise: string;
  sunset: string;
  rainDirection: number; // Direction rain is travelling (based on wind)
  rainSpeed: number; // Speed of rain movement
}

interface PrecipitationZone {
  angle: number;
  distance: number;
  intensity: number;
  radius: number;
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
  const [animatedValue] = useState(new Animated.Value(0));
  const [showMinutelyView, setShowMinutelyView] = useState(false);

  // Distance scale in kilometers for each ring (more detailed)
  const distanceRings = [5, 10, 20, 30, 40, 50]; // km from center

  useEffect(() => {
    fetchRainfallData();
    
    // Start radar sweep animation
    Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: true,
      })
    ).start();
  }, [latitude, longitude]);

  const fetchRainfallData = async () => {
    setLoading(true);
    setError(false);
    setErrorMessage('');

    try {
      console.log(`Fetching detailed projected rain forecast data for ${circuitName} at ${latitude}, ${longitude}`);
      
      // Fetch precipitation data with minutely resolution and wind data
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=precipitation,weather_code,wind_speed_10m,wind_direction_10m&minutely_15=precipitation,precipitation_probability&hourly=precipitation,precipitation_probability,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m&daily=sunrise,sunset&timezone=auto&forecast_days=2`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Detailed projected rain forecast data received');
      console.log('Current precipitation:', data.current.precipitation);
      
      // Process minutely data (15-minute intervals)
      const minutelyData: PrecipitationData[] = [];
      if (data.minutely_15) {
        const maxMinutes = 96; // 24 hours in 15-minute intervals
        
        for (let i = 0; i < Math.min(maxMinutes, data.minutely_15.time.length); i++) {
          minutelyData.push({
            time: data.minutely_15.time[i],
            precipitation: data.minutely_15.precipitation[i] || 0,
            precipitationProbability: data.minutely_15.precipitation_probability?.[i] || 0,
            weatherCode: 0, // Not available in minutely data
          });
        }
      }
      
      // Process hourly data with wind information
      const hourlyData: PrecipitationData[] = [];
      const maxHours = 48;
      
      for (let i = 0; i < Math.min(maxHours, data.hourly.time.length); i++) {
        hourlyData.push({
          time: data.hourly.time[i],
          precipitation: data.hourly.precipitation[i] || 0,
          precipitationProbability: data.hourly.precipitation_probability[i] || 0,
          weatherCode: data.hourly.weather_code[i] || 0,
          windSpeed: data.hourly.wind_speed_10m[i] || 0,
          windDirection: data.hourly.wind_direction_10m[i] || 0,
        });
      }
      
      // Calculate average wind direction and speed for rain movement
      const recentHours = hourlyData.slice(0, 6);
      const avgWindSpeed = recentHours.reduce((sum, h) => sum + (h.windSpeed || 0), 0) / recentHours.length;
      const avgWindDirection = recentHours.reduce((sum, h) => sum + (h.windDirection || 0), 0) / recentHours.length;
      
      // Generate enhanced radar grid data with wind information and current precipitation
      const gridData = generateEnhancedRadarGrid(
        minutelyData.length > 0 ? minutelyData : hourlyData, 
        data.current.precipitation || 0,
        data.current.wind_speed_10m || 0,
        data.current.wind_direction_10m || 0
      );
      
      // Calculate detailed summary
      const dataToAnalyze = minutelyData.length > 0 ? minutelyData.slice(0, 24) : hourlyData.slice(0, 6);
      const totalPrecipitation = dataToAnalyze.reduce((sum, h) => sum + h.precipitation, 0);
      const maxProbability = Math.max(...dataToAnalyze.map(h => h.precipitationProbability));
      const avgPrecipitation = totalPrecipitation / dataToAnalyze.length;
      const currentPrecip = data.current.precipitation || 0;
      const hasRain = currentPrecip > 0 || totalPrecipitation > 0 || maxProbability > 30;
      
      let summary = '';
      if (!hasRain) {
        summary = 'No rainfall detected in the area';
      } else if (currentPrecip > 0) {
        // Prioritize current conditions in summary
        if (currentPrecip < 0.3) {
          summary = 'Light rain currently over circuit';
        } else if (currentPrecip < 1) {
          summary = 'Light precipitation currently falling';
        } else if (currentPrecip < 3) {
          summary = 'Moderate rainfall currently over circuit';
        } else if (currentPrecip < 7) {
          summary = 'Heavy rainfall currently affecting circuit';
        } else {
          summary = 'Intense precipitation currently over circuit';
        }
      } else if (avgPrecipitation < 0.3) {
        summary = 'Trace precipitation with scattered light showers';
      } else if (avgPrecipitation < 1) {
        summary = 'Light precipitation in the vicinity';
      } else if (avgPrecipitation < 3) {
        summary = 'Moderate rainfall approaching';
      } else if (avgPrecipitation < 7) {
        summary = 'Heavy rainfall system detected';
      } else {
        summary = 'Intense precipitation with severe weather conditions';
      }
      
      setRadarData({
        current: {
          precipitation: data.current.precipitation || 0,
          weatherCode: data.current.weather_code || 0,
          windSpeed: data.current.wind_speed_10m || 0,
          windDirection: data.current.wind_direction_10m || 0,
        },
        hourly: hourlyData,
        minutely: minutelyData,
        summary,
        gridData,
        sunrise: data.daily?.sunrise?.[0] || '06:00',
        sunset: data.daily?.sunset?.[0] || '18:00',
        rainDirection: avgWindDirection,
        rainSpeed: avgWindSpeed,
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching projected rain forecast data:', err);
      setError(true);
      setErrorMessage(err instanceof Error ? err.message : 'Failed to load projected rain forecast');
      setLoading(false);
    }
  };

  const generateEnhancedRadarGrid = (
    timeData: PrecipitationData[], 
    currentPrecip: number,
    currentWindSpeed: number,
    currentWindDirection: number
  ): PrecipitationZone[] => {
    const zones: PrecipitationZone[] = [];
    const numAngles = 24; // 24 directions for more detail (15° each)
    const numRings = 6; // 6 distance rings for finer granularity
    
    console.log('Generating radar grid with current precipitation:', currentPrecip);
    
    // Use forecast data to create spatial distribution with wind influence
    for (let ring = 0; ring < numRings; ring++) {
      for (let angle = 0; angle < numAngles; angle++) {
        const angleRad = (angle / numAngles) * 2 * Math.PI;
        const angleDeg = (angle / numAngles) * 360;
        const distance = (ring + 1) / numRings;
        
        // Use time-based data to simulate spatial distribution
        const timeIndex = Math.min(Math.floor((ring * numAngles + angle) / 3), timeData.length - 1);
        const baseIntensity = timeData[timeIndex]?.precipitation || 0;
        
        // Add wind-based directional influence
        const windInfluence = calculateWindInfluence(angleDeg, currentWindDirection, currentWindSpeed);
        
        // Add some variation based on angle and distance
        const variation = Math.sin(angleRad * 3) * 0.15 + Math.cos(angleRad * 2) * 0.1;
        
        // Distance factor - innermost ring heavily influenced by current conditions
        let distanceFactor = 1;
        if (ring === 0) {
          // Innermost ring (0-5km) - 90% current precipitation
          distanceFactor = 0.9;
        } else if (ring === 1) {
          // Second ring (5-10km) - 60% current, 40% forecast
          distanceFactor = 0.6;
        } else if (ring === 2) {
          // Third ring (10-20km) - 30% current, 70% forecast
          distanceFactor = 0.3;
        } else {
          // Outer rings - mostly forecast data
          distanceFactor = 0.1;
        }
        
        // Calculate intensity with proper blending of current and forecast
        let intensity = 0;
        
        if (ring <= 2) {
          // Inner rings: blend current precipitation with forecast
          const currentComponent = currentPrecip * distanceFactor;
          const forecastComponent = baseIntensity * (1 - distanceFactor);
          intensity = (currentComponent + forecastComponent) * windInfluence * (1 + variation);
        } else {
          // Outer rings: primarily forecast data with slight current influence
          intensity = baseIntensity * (1 - (distance * 0.2)) * windInfluence * (1 + variation);
          
          // Add minimal current precipitation influence even to outer rings
          if (currentPrecip > 0) {
            intensity += currentPrecip * 0.1 * (1 - distance);
          }
        }
        
        intensity = Math.max(0, intensity);
        
        zones.push({
          angle: angleDeg,
          distance: distance,
          intensity: intensity,
          radius: 15 + (ring * 20),
        });
      }
    }
    
    console.log('Generated', zones.length, 'precipitation zones');
    console.log('Sample innermost zone intensity:', zones[0]?.intensity);
    
    return zones;
  };

  const calculateWindInfluence = (angle: number, windDirection: number, windSpeed: number): number => {
    // Calculate how wind direction affects precipitation distribution
    const angleDiff = Math.abs(((angle - windDirection + 180) % 360) - 180);
    const windFactor = 1 + (windSpeed / 50) * (1 - angleDiff / 180) * 0.3;
    return Math.max(0.7, Math.min(1.3, windFactor));
  };

  const getRainfallIntensity = (precipitation: number): string => {
    if (precipitation === 0) return 'None';
    if (precipitation < 0.2) return 'Trace';
    if (precipitation < 0.5) return 'Very Light';
    if (precipitation < 1.5) return 'Light';
    if (precipitation < 4) return 'Light-Moderate';
    if (precipitation < 7.5) return 'Moderate';
    if (precipitation < 12) return 'Moderate-Heavy';
    if (precipitation < 20) return 'Heavy';
    if (precipitation < 30) return 'Very Heavy';
    return 'Extreme';
  };

  const getRainfallColor = (precipitation: number): string => {
    // Enhanced color gradations for more detail
    if (precipitation === 0) return 'transparent';
    if (precipitation < 0.2) return 'rgba(200, 255, 200, 0.3)';
    if (precipitation < 0.5) return 'rgba(144, 238, 144, 0.4)';
    if (precipitation < 1.5) return 'rgba(76, 175, 80, 0.5)';
    if (precipitation < 4) return 'rgba(139, 195, 74, 0.6)';
    if (precipitation < 7.5) return 'rgba(255, 235, 59, 0.7)';
    if (precipitation < 12) return 'rgba(255, 193, 7, 0.75)';
    if (precipitation < 20) return 'rgba(255, 152, 0, 0.8)';
    if (precipitation < 30) return 'rgba(255, 87, 34, 0.85)';
    return 'rgba(244, 67, 54, 0.9)';
  };

  const formatTime = (timeString: string): string => {
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    } catch {
      return timeString;
    }
  };

  const getWindDirectionLabel = (degrees: number): string => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  };

  const getRainMovementDescription = (speed: number): string => {
    if (speed < 5) return 'Stationary';
    if (speed < 15) return 'Slow';
    if (speed < 30) return 'Moderate';
    if (speed < 50) return 'Fast';
    return 'Very Fast';
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
      marginBottom: 16,
    },
    loadingContainer: {
      height: compact ? 250 : 350,
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
      height: compact ? 250 : 350,
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
    radarContainer: {
      backgroundColor: colors.backgroundAlt,
      borderRadius: borderRadius.md,
      padding: 16,
      marginBottom: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.divider,
    },
    radarDisplay: {
      width: compact ? 280 : 340,
      height: compact ? 280 : 340,
      alignItems: 'center',
      justifyContent: 'center',
    },
    currentConditions: {
      backgroundColor: colors.backgroundAlt,
      borderRadius: borderRadius.md,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.divider,
    },
    conditionsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    conditionsLabel: {
      fontSize: 14,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
    },
    conditionsValue: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Roboto_700Bold',
    },
    rainDirectionInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 8,
      backgroundColor: isDark ? 'rgba(100, 150, 255, 0.15)' : 'rgba(100, 150, 255, 0.1)',
      padding: 12,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(100, 150, 255, 0.3)' : 'rgba(100, 150, 255, 0.2)',
    },
    rainDirectionText: {
      fontSize: 13,
      color: colors.text,
      fontFamily: 'Roboto_500Medium',
      flex: 1,
    },
    intensityBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: borderRadius.sm,
      alignSelf: 'flex-start',
    },
    intensityText: {
      fontSize: 13,
      fontWeight: '600',
      color: '#fff',
      fontFamily: 'Roboto_600SemiBold',
    },
    summary: {
      fontSize: 13,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      marginTop: 12,
      fontStyle: 'italic',
      textAlign: 'center',
    },
    viewToggle: {
      flexDirection: 'row',
      backgroundColor: colors.backgroundAlt,
      borderRadius: borderRadius.md,
      padding: 4,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.divider,
    },
    viewToggleButton: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: borderRadius.sm,
      alignItems: 'center',
    },
    viewToggleButtonActive: {
      backgroundColor: colors.primary,
    },
    viewToggleText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textMuted,
      fontFamily: 'Roboto_600SemiBold',
    },
    viewToggleTextActive: {
      color: '#fff',
    },
    forecastContainer: {
      marginBottom: 16,
    },
    forecastTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
      fontFamily: 'Roboto_600SemiBold',
      marginBottom: 12,
    },
    forecastScroll: {
      paddingVertical: 8,
    },
    forecastCard: {
      backgroundColor: colors.backgroundAlt,
      borderRadius: borderRadius.md,
      padding: 12,
      marginRight: 12,
      minWidth: 100,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.divider,
    },
    forecastTime: {
      fontSize: 12,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      marginBottom: 8,
    },
    forecastValue: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      fontFamily: 'Roboto_600SemiBold',
      marginTop: 8,
    },
    forecastProb: {
      fontSize: 11,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      marginTop: 4,
    },
    legend: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 8,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    legendColor: {
      width: 14,
      height: 14,
      borderRadius: 3,
    },
    legendText: {
      fontSize: 10,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
    },
    infoText: {
      fontSize: 11,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      marginTop: 8,
      fontStyle: 'italic',
      textAlign: 'center',
    },
    compassLabel: {
      fontSize: 11,
      fontWeight: '600',
      fontFamily: 'Roboto_600SemiBold',
    },
    distanceLabel: {
      fontSize: 8,
      fontWeight: '500',
      fontFamily: 'Roboto_500Medium',
    },
  }), [colors, shadows, compact, isDark]);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Icon name="rainy" size={20} color={colors.precipitation} />
            <Text style={styles.title}>Projected Rain Forecast</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading detailed forecast data...</Text>
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
            <Text style={styles.title}>Projected Rain Forecast</Text>
          </View>
        </View>
        <View style={styles.errorContainer}>
          <Icon name="cloud-offline" size={48} color={colors.error} />
          <Text style={styles.errorText}>Unable to load forecast data</Text>
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

  const radarSize = compact ? 280 : 340;
  const centerX = radarSize / 2;
  const centerY = radarSize / 2;
  const maxRadius = radarSize / 2 - 30;

  const getIntensityColor = (intensity: number): string => {
    // Enhanced color gradations with better visibility
    if (intensity === 0) return 'transparent';
    if (intensity < 0.2) return isDark ? 'rgba(200, 255, 200, 0.35)' : 'rgba(200, 255, 200, 0.4)';
    if (intensity < 0.5) return isDark ? 'rgba(144, 238, 144, 0.45)' : 'rgba(144, 238, 144, 0.5)';
    if (intensity < 1.5) return isDark ? 'rgba(76, 175, 80, 0.55)' : 'rgba(76, 175, 80, 0.6)';
    if (intensity < 4) return isDark ? 'rgba(139, 195, 74, 0.65)' : 'rgba(139, 195, 74, 0.7)';
    if (intensity < 7.5) return isDark ? 'rgba(255, 235, 59, 0.75)' : 'rgba(255, 235, 59, 0.8)';
    if (intensity < 12) return isDark ? 'rgba(255, 193, 7, 0.8)' : 'rgba(255, 193, 7, 0.85)';
    if (intensity < 20) return isDark ? 'rgba(255, 152, 0, 0.85)' : 'rgba(255, 152, 0, 0.9)';
    if (intensity < 30) return isDark ? 'rgba(255, 87, 34, 0.9)' : 'rgba(255, 87, 34, 0.95)';
    return isDark ? 'rgba(244, 67, 54, 0.95)' : 'rgba(244, 67, 54, 1)';
  };

  // Render rain direction arrow (large, prominent)
  const renderRainDirectionArrow = () => {
    const arrowLength = maxRadius * 0.6;
    const arrowWidth = 20;
    const direction = radarData.rainDirection;
    
    // Calculate arrow points
    const angleRad = ((direction - 90) * Math.PI) / 180;
    const endX = centerX + arrowLength * Math.cos(angleRad);
    const endY = centerY + arrowLength * Math.sin(angleRad);
    
    // Arrow head points
    const headLength = 25;
    const headAngle = Math.PI / 6;
    const leftX = endX - headLength * Math.cos(angleRad - headAngle);
    const leftY = endY - headLength * Math.sin(angleRad - headAngle);
    const rightX = endX - headLength * Math.cos(angleRad + headAngle);
    const rightY = endY - headLength * Math.sin(angleRad + headAngle);
    
    return (
      <G>
        {/* Arrow shaft */}
        <Line
          x1={centerX}
          y1={centerY}
          x2={endX}
          y2={endY}
          stroke={isDark ? 'rgba(100, 150, 255, 0.8)' : 'rgba(50, 100, 200, 0.8)'}
          strokeWidth="4"
          strokeDasharray="8,4"
        />
        
        {/* Arrow head */}
        <Polygon
          points={`${endX},${endY} ${leftX},${leftY} ${rightX},${rightY}`}
          fill={isDark ? 'rgba(100, 150, 255, 0.9)' : 'rgba(50, 100, 200, 0.9)'}
          stroke={isDark ? 'rgba(150, 200, 255, 1)' : 'rgba(100, 150, 255, 1)'}
          strokeWidth="2"
        />
        
        {/* Direction label */}
        <SvgText
          x={endX}
          y={endY - 30}
          fontSize="11"
          fontWeight="700"
          fill={isDark ? 'rgba(150, 200, 255, 1)' : 'rgba(50, 100, 200, 1)'}
          textAnchor="middle"
        >
          Rain Direction
        </SvgText>
      </G>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Icon name="rainy" size={20} color={colors.precipitation} />
          <Text style={styles.title}>Projected Rain Forecast</Text>
        </View>
        <TouchableOpacity 
          onPress={fetchRainfallData}
          activeOpacity={0.7}
        >
          <Icon name="refresh" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.subtitle}>
        High-resolution precipitation forecast for {circuitName}
      </Text>

      {/* View Toggle for Minutely/Hourly */}
      {radarData.minutely.length > 0 && (
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.viewToggleButton, !showMinutelyView && styles.viewToggleButtonActive]}
            onPress={() => setShowMinutelyView(false)}
            activeOpacity={0.7}
          >
            <Text style={[styles.viewToggleText, !showMinutelyView && styles.viewToggleTextActive]}>
              Hourly
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewToggleButton, showMinutelyView && styles.viewToggleButtonActive]}
            onPress={() => setShowMinutelyView(true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.viewToggleText, showMinutelyView && styles.viewToggleTextActive]}>
              15-Minute
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Enhanced Radar Display */}
      <View style={styles.radarContainer}>
        <View style={styles.radarDisplay}>
          <Svg width={radarSize} height={radarSize}>
            <Defs>
              <RadialGradient id="radarBg" cx="50%" cy="50%">
                <Stop offset="0%" stopColor={isDark ? '#1a1a1a' : '#f5f5f5'} stopOpacity="1" />
                <Stop offset="100%" stopColor={isDark ? '#0a0a0a' : '#e0e0e0'} stopOpacity="1" />
              </RadialGradient>
            </Defs>
            
            {/* Background */}
            <Circle
              cx={centerX}
              cy={centerY}
              r={maxRadius}
              fill="url(#radarBg)"
              stroke={colors.divider}
              strokeWidth="2"
            />
            
            {/* Enhanced range rings with distance labels */}
            {distanceRings.map((distance, i) => {
              const scale = (i + 1) / distanceRings.length;
              const ringRadius = maxRadius * scale;
              const labelX = centerX + ringRadius * Math.cos(Math.PI / 4);
              const labelY = centerY + ringRadius * Math.sin(Math.PI / 4);
              
              return (
                <G key={`ring-${i}`}>
                  <Circle
                    cx={centerX}
                    cy={centerY}
                    r={ringRadius}
                    fill="none"
                    stroke={colors.divider}
                    strokeWidth="1"
                    strokeDasharray="3,3"
                    opacity={0.25}
                  />
                  {/* Distance label */}
                  <SvgText
                    x={labelX}
                    y={labelY}
                    fontSize="8"
                    fontWeight="500"
                    fill={colors.text}
                    textAnchor="middle"
                    opacity={0.7}
                  >
                    {distance}km
                  </SvgText>
                </G>
              );
            })}
            
            {/* Cardinal and intercardinal directions */}
            <Line x1={centerX} y1={25} x2={centerX} y2={radarSize - 25} stroke={colors.divider} strokeWidth="1" opacity={0.2} />
            <Line x1={25} y1={centerY} x2={radarSize - 25} y2={centerY} stroke={colors.divider} strokeWidth="1" opacity={0.2} />
            <Line x1={centerX - maxRadius * 0.7} y1={centerY - maxRadius * 0.7} x2={centerX + maxRadius * 0.7} y2={centerY + maxRadius * 0.7} stroke={colors.divider} strokeWidth="1" opacity={0.15} />
            <Line x1={centerX - maxRadius * 0.7} y1={centerY + maxRadius * 0.7} x2={centerX + maxRadius * 0.7} y2={centerY - maxRadius * 0.7} stroke={colors.divider} strokeWidth="1" opacity={0.15} />
            
            {/* Enhanced precipitation zones with finer detail */}
            {radarData.gridData.map((zone, index) => {
              const angleRad = (zone.angle - 90) * (Math.PI / 180);
              const angleSpan = (360 / 24) * (Math.PI / 180); // 15° per segment
              const nextAngleRad = angleRad + angleSpan;
              const innerRadius = zone.radius - 20;
              const outerRadius = zone.radius;
              
              const x1 = centerX + innerRadius * Math.cos(angleRad);
              const y1 = centerY + innerRadius * Math.sin(angleRad);
              const x2 = centerX + outerRadius * Math.cos(angleRad);
              const y2 = centerY + outerRadius * Math.sin(angleRad);
              const x3 = centerX + outerRadius * Math.cos(nextAngleRad);
              const y3 = centerY + outerRadius * Math.sin(nextAngleRad);
              const x4 = centerX + innerRadius * Math.cos(nextAngleRad);
              const y4 = centerY + innerRadius * Math.sin(nextAngleRad);
              
              const pathData = `M ${x1} ${y1} L ${x2} ${y2} A ${outerRadius} ${outerRadius} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${innerRadius} ${innerRadius} 0 0 0 ${x1} ${y1} Z`;
              
              return (
                <Path
                  key={`zone-${index}`}
                  d={pathData}
                  fill={getIntensityColor(zone.intensity)}
                  stroke="none"
                />
              );
            })}
            
            {/* Rain direction arrow */}
            {radarData.rainSpeed > 2 && renderRainDirectionArrow()}
            
            {/* Center marker (circuit location) with enhanced visibility */}
            <Circle
              cx={centerX}
              cy={centerY}
              r={9}
              fill={colors.primary}
              stroke="#fff"
              strokeWidth="3"
            />
            
            {/* Compass labels */}
            <SvgText
              x={centerX}
              y={18}
              fontSize="12"
              fontWeight="600"
              fill={colors.text}
              textAnchor="middle"
            >
              N
            </SvgText>
            <SvgText
              x={radarSize - 18}
              y={centerY + 5}
              fontSize="12"
              fontWeight="600"
              fill={colors.text}
              textAnchor="middle"
            >
              E
            </SvgText>
            <SvgText
              x={centerX}
              y={radarSize - 8}
              fontSize="12"
              fontWeight="600"
              fill={colors.text}
              textAnchor="middle"
            >
              S
            </SvgText>
            <SvgText
              x={18}
              y={centerY + 5}
              fontSize="12"
              fontWeight="600"
              fill={colors.text}
              textAnchor="middle"
            >
              W
            </SvgText>
          </Svg>
        </View>
        
        <Text style={styles.infoText}>
          Circuit location • Distance rings: {distanceRings.join('km, ')}km
        </Text>
      </View>

      {/* Current Conditions with Rain Direction */}
      <View style={styles.currentConditions}>
        <View style={styles.conditionsRow}>
          <Text style={styles.conditionsLabel}>Current Rainfall</Text>
          <Text style={styles.conditionsValue}>
            {radarData.current.precipitation.toFixed(2)} mm/h
          </Text>
        </View>
        
        {/* Rain Direction Information */}
        <View style={styles.rainDirectionInfo}>
          <Icon name="arrow-forward" size={20} color={isDark ? 'rgba(150, 200, 255, 1)' : 'rgba(50, 100, 200, 1)'} />
          <Text style={styles.rainDirectionText}>
            Rain travelling {getWindDirectionLabel(radarData.rainDirection)} ({radarData.rainDirection.toFixed(0)}°) at {getRainMovementDescription(radarData.rainSpeed).toLowerCase()} speed ({radarData.rainSpeed.toFixed(1)} km/h)
          </Text>
        </View>
        
        <View style={[
          styles.intensityBadge,
          { backgroundColor: getRainfallColor(radarData.current.precipitation).replace(/[^,]+(?=\))/, '1') }
        ]}>
          <Text style={styles.intensityText}>
            {getRainfallIntensity(radarData.current.precipitation)}
          </Text>
        </View>
        
        <Text style={styles.summary}>{radarData.summary}</Text>
      </View>

      {/* Detailed Forecast */}
      <View style={styles.forecastContainer}>
        <Text style={styles.forecastTitle}>
          {showMinutelyView && radarData.minutely.length > 0 ? 'Next 6 Hours (15-min intervals)' : 'Next 24 Hours'}
        </Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.forecastScroll}
        >
          {(showMinutelyView && radarData.minutely.length > 0 
            ? radarData.minutely.slice(0, 24) 
            : radarData.hourly.slice(0, 24)
          ).map((item, index) => (
            <View key={index} style={styles.forecastCard}>
              <Text style={styles.forecastTime}>{formatTime(item.time)}</Text>
              {!showMinutelyView && (
                <WeatherSymbol 
                  weatherCode={item.weatherCode}
                  size={28}
                  latitude={latitude}
                  longitude={longitude}
                  time={item.time}
                  sunrise={radarData.sunrise}
                  sunset={radarData.sunset}
                />
              )}
              <Text style={styles.forecastValue}>
                {item.precipitation.toFixed(2)}mm
              </Text>
              <Text style={styles.forecastProb}>
                {item.precipitationProbability}%
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Enhanced Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: 'rgba(200, 255, 200, 0.4)' }]} />
          <Text style={styles.legendText}>Trace</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: 'rgba(144, 238, 144, 0.5)' }]} />
          <Text style={styles.legendText}>V.Light</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: 'rgba(76, 175, 80, 0.6)' }]} />
          <Text style={styles.legendText}>Light</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: 'rgba(139, 195, 74, 0.7)' }]} />
          <Text style={styles.legendText}>Lt-Mod</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: 'rgba(255, 235, 59, 0.8)' }]} />
          <Text style={styles.legendText}>Moderate</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: 'rgba(255, 193, 7, 0.85)' }]} />
          <Text style={styles.legendText}>Mod-Hvy</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: 'rgba(255, 152, 0, 0.9)' }]} />
          <Text style={styles.legendText}>Heavy</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: 'rgba(255, 87, 34, 0.95)' }]} />
          <Text style={styles.legendText}>V.Heavy</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: 'rgba(244, 67, 54, 1)' }]} />
          <Text style={styles.legendText}>Extreme</Text>
        </View>
      </View>

      <Text style={styles.infoText}>
        High-resolution data from Open-Meteo • 15-minute intervals available • Rain direction based on wind patterns
      </Text>
    </View>
  );
};

export default TrackRainfallRadar;
