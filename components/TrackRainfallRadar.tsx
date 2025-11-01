
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../state/ThemeContext';
import { getColors, borderRadius, getShadows } from '../styles/commonStyles';
import Icon from './Icon';
import WeatherSymbol from './WeatherSymbol';
import Svg, { Circle, Line, Text as SvgText, Defs, RadialGradient, Stop, G, Path, Polygon } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  interpolate,
  cancelAnimation,
  runOnJS,
} from 'react-native-reanimated';

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
  gridData: PrecipitationZone[][];
  sunrise: string;
  sunset: string;
  rainDirection: number;
  rainSpeed: number;
  hasRain: boolean;
}

interface PrecipitationZone {
  angle: number;
  distance: number;
  intensity: number;
  radius: number;
}

// Create animated Path component
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedPolygon = Animated.createAnimatedComponent(Polygon);
const AnimatedLine = Animated.createAnimatedComponent(Line);

const TrackRainfallRadar: React.FC<TrackRainfallRadarProps> = ({
  latitude,
  longitude,
  circuitName,
  country,
  category,
  compact = false,
  showControls = false,
  autoStartAnimation = true,
}) => {
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const shadows = getShadows(isDark);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [radarData, setRadarData] = useState<RadarData | null>(null);
  const [showMinutelyView, setShowMinutelyView] = useState(false);
  const [isPlaying, setIsPlaying] = useState(autoStartAnimation);
  const [currentFrame, setCurrentFrame] = useState(0);

  // Animation values
  const animationProgress = useSharedValue(0);
  const radarSweepRotation = useSharedValue(0);
  const pulseAnimation = useSharedValue(1);

  // Distance scale in kilometers for each ring
  const distanceRings = [5, 10, 20, 30, 40, 50];

  const fetchRainfallData = useCallback(async () => {
    setLoading(true);
    setError(false);
    setErrorMessage('');

    try {
      console.log(`Fetching detailed projected rain forecast data for ${circuitName} at ${latitude}, ${longitude}`);
      
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=precipitation,weather_code,wind_speed_10m,wind_direction_10m&minutely_15=precipitation,precipitation_probability&hourly=precipitation,precipitation_probability,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m&daily=sunrise,sunset&timezone=auto&forecast_days=2`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Detailed projected rain forecast data received');
      console.log('Current precipitation:', data.current.precipitation);
      
      // Process minutely data
      const minutelyData: PrecipitationData[] = [];
      if (data.minutely_15) {
        const maxMinutes = 96;
        
        for (let i = 0; i < Math.min(maxMinutes, data.minutely_15.time.length); i++) {
          minutelyData.push({
            time: data.minutely_15.time[i],
            precipitation: data.minutely_15.precipitation[i] || 0,
            precipitationProbability: data.minutely_15.precipitation_probability?.[i] || 0,
            weatherCode: 0,
          });
        }
      }
      
      // Process hourly data
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
      
      // Calculate wind direction and speed
      const recentHours = hourlyData.slice(0, 6);
      const avgWindSpeed = recentHours.reduce((sum, h) => sum + (h.windSpeed || 0), 0) / recentHours.length;
      const avgWindDirection = recentHours.reduce((sum, h) => sum + (h.windDirection || 0), 0) / recentHours.length;
      
      // Calculate summary
      const dataToAnalyze = minutelyData.length > 0 ? minutelyData.slice(0, 24) : hourlyData.slice(0, 6);
      const totalPrecipitation = dataToAnalyze.reduce((sum, h) => sum + h.precipitation, 0);
      const maxProbability = Math.max(...dataToAnalyze.map(h => h.precipitationProbability));
      const avgPrecipitation = totalPrecipitation / dataToAnalyze.length;
      const currentPrecip = data.current.precipitation || 0;
      
      const hasRain = currentPrecip > 0.1 || totalPrecipitation > 0.5 || maxProbability > 20;
      
      console.log('Rain detection:', {
        currentPrecip,
        totalPrecipitation,
        maxProbability,
        hasRain
      });
      
      // Generate multiple time frames for animation (8 frames)
      const numFrames = 8;
      const gridDataFrames: PrecipitationZone[][] = [];
      
      for (let frame = 0; frame < numFrames; frame++) {
        const timeOffset = frame * 15; // 15 minutes per frame
        const frameData = minutelyData.length > 0 
          ? minutelyData.slice(timeOffset, timeOffset + 24)
          : hourlyData.slice(Math.floor(timeOffset / 60), Math.floor(timeOffset / 60) + 6);
        
        if (frameData.length > 0) {
          gridDataFrames.push(
            generateEnhancedRadarGrid(
              frameData,
              currentPrecip,
              data.current.wind_speed_10m || 0,
              data.current.wind_direction_10m || 0,
              frame / numFrames
            )
          );
        }
      }
      
      // If no frames generated, create at least one
      if (gridDataFrames.length === 0) {
        gridDataFrames.push(
          generateEnhancedRadarGrid(
            minutelyData.length > 0 ? minutelyData : hourlyData,
            currentPrecip,
            data.current.wind_speed_10m || 0,
            data.current.wind_direction_10m || 0,
            0
          )
        );
      }
      
      let summary = '';
      if (!hasRain) {
        summary = 'No rainfall expected in the forecast period';
      } else if (currentPrecip > 0) {
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
        gridData: gridDataFrames,
        sunrise: data.daily?.sunrise?.[0] || '06:00',
        sunset: data.daily?.sunset?.[0] || '18:00',
        rainDirection: avgWindDirection,
        rainSpeed: avgWindSpeed,
        hasRain,
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching projected rain forecast data:', err);
      setError(true);
      setErrorMessage(err instanceof Error ? err.message : 'Failed to load projected rain forecast');
      setLoading(false);
    }
  }, [latitude, longitude, circuitName]);

  const generateEnhancedRadarGrid = (
    timeData: PrecipitationData[], 
    currentPrecip: number,
    currentWindSpeed: number,
    currentWindDirection: number,
    timeProgress: number
  ): PrecipitationZone[] => {
    const zones: PrecipitationZone[] = [];
    const numAngles = 24;
    const numRings = 6;
    
    for (let ring = 0; ring < numRings; ring++) {
      for (let angle = 0; angle < numAngles; angle++) {
        const angleRad = (angle / numAngles) * 2 * Math.PI;
        const angleDeg = (angle / numAngles) * 360;
        const distance = (ring + 1) / numRings;
        
        const timeIndex = Math.min(Math.floor((ring * numAngles + angle) / 3), timeData.length - 1);
        const baseIntensity = timeData[timeIndex]?.precipitation || 0;
        
        const windInfluence = calculateWindInfluence(angleDeg, currentWindDirection, currentWindSpeed);
        
        // Add time-based movement
        const movementOffset = Math.sin(angleRad + timeProgress * Math.PI * 2) * 0.1;
        const variation = Math.sin(angleRad * 3) * 0.15 + Math.cos(angleRad * 2) * 0.1 + movementOffset;
        
        let distanceFactor = 1;
        if (ring === 0) {
          distanceFactor = 0.9;
        } else if (ring === 1) {
          distanceFactor = 0.6;
        } else if (ring === 2) {
          distanceFactor = 0.3;
        } else {
          distanceFactor = 0.1;
        }
        
        let intensity = 0;
        
        if (ring <= 2) {
          const currentComponent = currentPrecip * distanceFactor;
          const forecastComponent = baseIntensity * (1 - distanceFactor);
          intensity = (currentComponent + forecastComponent) * windInfluence * (1 + variation);
        } else {
          intensity = baseIntensity * (1 - (distance * 0.2)) * windInfluence * (1 + variation);
          
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
    
    return zones;
  };

  const calculateWindInfluence = (angle: number, windDirection: number, windSpeed: number): number => {
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

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // Fetch data on mount and when coordinates change
  useEffect(() => {
    fetchRainfallData();
  }, [fetchRainfallData]);

  // Start/stop animations based on isPlaying state
  useEffect(() => {
    if (isPlaying && radarData?.hasRain) {
      console.log('Starting rain forecast animation');
      
      // Main animation progress (cycles through time frames)
      animationProgress.value = withRepeat(
        withTiming(1, {
          duration: 8000,
          easing: Easing.linear,
        }),
        -1,
        false
      );

      // Radar sweep effect
      radarSweepRotation.value = withRepeat(
        withTiming(360, {
          duration: 4000,
          easing: Easing.linear,
        }),
        -1,
        false
      );

      // Pulse effect for intensity
      pulseAnimation.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    } else {
      console.log('Stopping rain forecast animation');
      cancelAnimation(animationProgress);
      cancelAnimation(radarSweepRotation);
      cancelAnimation(pulseAnimation);
      animationProgress.value = 0;
      radarSweepRotation.value = 0;
      pulseAnimation.value = 1;
    }

    return () => {
      cancelAnimation(animationProgress);
      cancelAnimation(radarSweepRotation);
      cancelAnimation(pulseAnimation);
    };
  }, [isPlaying, radarData?.hasRain, animationProgress, radarSweepRotation, pulseAnimation]);

  // Update current frame based on animation progress
  useEffect(() => {
    if (!radarData?.gridData || radarData.gridData.length === 0) return;
    
    const interval = setInterval(() => {
      if (isPlaying) {
        setCurrentFrame(prev => (prev + 1) % radarData.gridData.length);
      }
    }, 1000); // Update frame every second
    
    return () => clearInterval(interval);
  }, [isPlaying, radarData?.gridData]);

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
    noRainOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.4)',
      borderRadius: borderRadius.md,
    },
    noRainBadge: {
      backgroundColor: isDark ? 'rgba(76, 175, 80, 0.95)' : 'rgba(76, 175, 80, 0.9)',
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: borderRadius.lg,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      borderWidth: 2,
      borderColor: '#fff',
      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.3)',
    },
    noRainText: {
      fontSize: 20,
      fontWeight: '700',
      color: '#fff',
      fontFamily: 'Roboto_700Bold',
    },
    noRainSubtext: {
      fontSize: 14,
      color: '#fff',
      fontFamily: 'Roboto_500Medium',
      opacity: 0.95,
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
    noRainBanner: {
      backgroundColor: isDark ? 'rgba(76, 175, 80, 0.2)' : 'rgba(76, 175, 80, 0.15)',
      padding: 16,
      borderRadius: borderRadius.md,
      marginBottom: 16,
      borderWidth: 2,
      borderColor: isDark ? 'rgba(76, 175, 80, 0.4)' : 'rgba(76, 175, 80, 0.3)',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    noRainBannerContent: {
      flex: 1,
    },
    noRainBannerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: isDark ? 'rgba(76, 175, 80, 1)' : 'rgba(56, 142, 60, 1)',
      fontFamily: 'Roboto_700Bold',
      marginBottom: 4,
    },
    noRainBannerText: {
      fontSize: 14,
      color: colors.text,
      fontFamily: 'Roboto_500Medium',
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
    controlsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 12,
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    },
    controlButton: {
      backgroundColor: colors.primary,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: borderRadius.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    controlButtonText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '600',
      fontFamily: 'Roboto_600SemiBold',
    },
    animationIndicator: {
      fontSize: 11,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      fontStyle: 'italic',
    },
    headerControls: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
  }), [colors, shadows, compact, isDark]);

  const radarSize = compact ? 280 : 340;
  const centerX = radarSize / 2;
  const centerY = radarSize / 2;
  const maxRadius = radarSize / 2 - 30;

  const getIntensityColor = (intensity: number): string => {
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

  // Get current frame data based on animation progress
  const getCurrentFrameData = (): PrecipitationZone[] => {
    if (!radarData?.gridData || radarData.gridData.length === 0) {
      return [];
    }
    
    const numFrames = radarData.gridData.length;
    const frameIndex = Math.floor((currentFrame % numFrames));
    return radarData.gridData[frameIndex] || radarData.gridData[0];
  };

  // Animated precipitation zone component
  const AnimatedPrecipitationZone = ({ zone, index }: { zone: PrecipitationZone; index: number }) => {
    const angleRad = (zone.angle - 90) * (Math.PI / 180);
    const angleSpan = (360 / 24) * (Math.PI / 180);
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
    
    const animatedProps = useAnimatedProps(() => {
      const baseColor = getIntensityColor(zone.intensity);
      
      // Extract RGBA values
      const match = baseColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d.]+)?\)/);
      if (!match) return { fill: baseColor };
      
      const [, r, g, b, a = '1'] = match;
      const baseAlpha = parseFloat(a);
      
      // Animate opacity with pulse
      const animatedAlpha = baseAlpha * pulseAnimation.value;
      
      return {
        fill: `rgba(${r}, ${g}, ${b}, ${animatedAlpha})`,
      };
    });
    
    return (
      <AnimatedPath
        d={pathData}
        animatedProps={animatedProps}
        stroke="none"
      />
    );
  };

  // Animated rain direction arrow
  const AnimatedRainDirectionArrow = () => {
    const arrowLength = maxRadius * 0.6;
    const direction = radarData?.rainDirection || 0;
    
    const angleRad = ((direction - 90) * Math.PI) / 180;
    const endX = centerX + arrowLength * Math.cos(angleRad);
    const endY = centerY + arrowLength * Math.sin(angleRad);
    
    const headLength = 25;
    const headAngle = Math.PI / 6;
    const leftX = endX - headLength * Math.cos(angleRad - headAngle);
    const leftY = endY - headLength * Math.sin(angleRad - headAngle);
    const rightX = endX - headLength * Math.cos(angleRad + headAngle);
    const rightY = endY - headLength * Math.sin(angleRad + headAngle);
    
    const lineAnimatedProps = useAnimatedProps(() => {
      const opacity = interpolate(
        pulseAnimation.value,
        [1, 1.15],
        [0.7, 0.95]
      );
      
      return {
        strokeOpacity: opacity,
      };
    });
    
    const polygonAnimatedProps = useAnimatedProps(() => {
      const opacity = interpolate(
        pulseAnimation.value,
        [1, 1.15],
        [0.8, 1]
      );
      
      return {
        fillOpacity: opacity,
      };
    });
    
    return (
      <G>
        <AnimatedLine
          x1={centerX}
          y1={centerY}
          x2={endX}
          y2={endY}
          stroke={isDark ? 'rgba(100, 150, 255, 0.8)' : 'rgba(50, 100, 200, 0.8)'}
          strokeWidth="4"
          strokeDasharray="8,4"
          animatedProps={lineAnimatedProps}
        />
        
        <AnimatedPolygon
          points={`${endX},${endY} ${leftX},${leftY} ${rightX},${rightY}`}
          fill={isDark ? 'rgba(100, 150, 255, 0.9)' : 'rgba(50, 100, 200, 0.9)'}
          stroke={isDark ? 'rgba(150, 200, 255, 1)' : 'rgba(100, 150, 255, 1)'}
          strokeWidth="2"
          animatedProps={polygonAnimatedProps}
        />
        
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

  const currentGridData = getCurrentFrameData();

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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Icon name="rainy" size={20} color={colors.precipitation} />
          <Text style={styles.title}>Projected Rain Forecast</Text>
        </View>
        <View style={styles.headerControls}>
          {showControls && radarData.hasRain && (
            <TouchableOpacity 
              onPress={togglePlayPause}
              activeOpacity={0.7}
            >
              <Icon 
                name={isPlaying ? 'pause' : 'play'} 
                size={20} 
                color={colors.primary} 
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            onPress={fetchRainfallData}
            activeOpacity={0.7}
          >
            <Icon name="refresh" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={styles.subtitle}>
        High-resolution precipitation forecast for {circuitName}
        {radarData.hasRain && isPlaying && ' • Animating'}
      </Text>

      {!radarData.hasRain && (
        <View style={styles.noRainBanner}>
          <Icon 
            name="sunny" 
            size={40} 
            color={isDark ? 'rgba(76, 175, 80, 1)' : 'rgba(56, 142, 60, 1)'} 
          />
          <View style={styles.noRainBannerContent}>
            <Text style={styles.noRainBannerTitle}>No Rain Expected</Text>
            <Text style={styles.noRainBannerText}>
              Clear conditions forecast for the next 24 hours
            </Text>
          </View>
        </View>
      )}

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

      <View style={styles.radarContainer}>
        <View style={styles.radarDisplay}>
          <Svg width={radarSize} height={radarSize}>
            <Defs>
              <RadialGradient id="radarBg" cx="50%" cy="50%">
                <Stop offset="0%" stopColor={isDark ? '#1a1a1a' : '#f5f5f5'} stopOpacity="1" />
                <Stop offset="100%" stopColor={isDark ? '#0a0a0a' : '#e0e0e0'} stopOpacity="1" />
              </RadialGradient>
            </Defs>
            
            <Circle
              cx={centerX}
              cy={centerY}
              r={maxRadius}
              fill="url(#radarBg)"
              stroke={colors.divider}
              strokeWidth="2"
            />
            
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
            
            <Line x1={centerX} y1={25} x2={centerX} y2={radarSize - 25} stroke={colors.divider} strokeWidth="1" opacity={0.2} />
            <Line x1={25} y1={centerY} x2={radarSize - 25} y2={centerY} stroke={colors.divider} strokeWidth="1" opacity={0.2} />
            <Line x1={centerX - maxRadius * 0.7} y1={centerY - maxRadius * 0.7} x2={centerX + maxRadius * 0.7} y2={centerY + maxRadius * 0.7} stroke={colors.divider} strokeWidth="1" opacity={0.15} />
            <Line x1={centerX - maxRadius * 0.7} y1={centerY + maxRadius * 0.7} x2={centerX + maxRadius * 0.7} y2={centerY - maxRadius * 0.7} stroke={colors.divider} strokeWidth="1" opacity={0.15} />
            
            {radarData.hasRain && currentGridData.map((zone, index) => (
              <AnimatedPrecipitationZone key={`zone-${index}`} zone={zone} index={index} />
            ))}
            
            {radarData.hasRain && radarData.rainSpeed > 2 && <AnimatedRainDirectionArrow />}
            
            <Circle
              cx={centerX}
              cy={centerY}
              r={9}
              fill={colors.primary}
              stroke="#fff"
              strokeWidth="3"
            />
            
            <SvgText x={centerX} y={18} fontSize="12" fontWeight="600" fill={colors.text} textAnchor="middle">N</SvgText>
            <SvgText x={radarSize - 18} y={centerY + 5} fontSize="12" fontWeight="600" fill={colors.text} textAnchor="middle">E</SvgText>
            <SvgText x={centerX} y={radarSize - 8} fontSize="12" fontWeight="600" fill={colors.text} textAnchor="middle">S</SvgText>
            <SvgText x={18} y={centerY + 5} fontSize="12" fontWeight="600" fill={colors.text} textAnchor="middle">W</SvgText>
          </Svg>
          
          {!radarData.hasRain && (
            <View style={styles.noRainOverlay}>
              <View style={styles.noRainBadge}>
                <Icon name="sunny" size={32} color="#fff" />
                <View>
                  <Text style={styles.noRainText}>No Rain</Text>
                  <Text style={styles.noRainSubtext}>Clear Forecast</Text>
                </View>
              </View>
            </View>
          )}
        </View>
        
        <Text style={styles.infoText}>
          Circuit location • Distance rings: {distanceRings.join('km, ')}km
          {radarData.hasRain && isPlaying && ` • Frame ${currentFrame + 1}/${radarData.gridData.length}`}
        </Text>
      </View>

      <View style={styles.currentConditions}>
        <View style={styles.conditionsRow}>
          <Text style={styles.conditionsLabel}>Current Rainfall</Text>
          <Text style={styles.conditionsValue}>
            {radarData.current.precipitation.toFixed(2)} mm/h
          </Text>
        </View>
        
        {radarData.hasRain && (
          <View style={styles.rainDirectionInfo}>
            <Icon name="arrow-forward" size={20} color={isDark ? 'rgba(150, 200, 255, 1)' : 'rgba(50, 100, 200, 1)'} />
            <Text style={styles.rainDirectionText}>
              Rain travelling {getWindDirectionLabel(radarData.rainDirection)} ({radarData.rainDirection.toFixed(0)}°) at {getRainMovementDescription(radarData.rainSpeed).toLowerCase()} speed ({radarData.rainSpeed.toFixed(1)} km/h)
            </Text>
          </View>
        )}
        
        <View style={[
          styles.intensityBadge,
          { backgroundColor: radarData.hasRain 
            ? getRainfallColor(radarData.current.precipitation).replace(/[^,]+(?=\))/, '1')
            : (isDark ? 'rgba(76, 175, 80, 0.8)' : 'rgba(76, 175, 80, 0.7)')
          }
        ]}>
          <Text style={styles.intensityText}>
            {radarData.hasRain ? getRainfallIntensity(radarData.current.precipitation) : 'No Rain'}
          </Text>
        </View>
        
        <Text style={styles.summary}>{radarData.summary}</Text>
      </View>

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
        High-resolution data from Open-Meteo • Animated precipitation zones • Rain direction based on wind patterns
      </Text>
    </View>
  );
};

export default TrackRainfallRadar;
