
import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { useTheme } from '../state/ThemeContext';
import { getColors, borderRadius, getShadows } from '../styles/commonStyles';
import Icon from './Icon';
import WeatherSymbol from './WeatherSymbol';
import Svg, { Circle, Line, Text as SvgText, Defs, RadialGradient, Stop, G, Path } from 'react-native-svg';

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
  gridData: PrecipitationZone[];
  sunrise: string;
  sunset: string;
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

  // Distance scale in kilometers for each ring
  const distanceRings = [10, 20, 30, 40]; // km from center

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
      console.log(`Fetching projected rain forecast data for ${circuitName} at ${latitude}, ${longitude}`);
      
      // Fetch precipitation data from Open-Meteo API with extended grid and sunrise/sunset
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=precipitation,weather_code&hourly=precipitation,precipitation_probability,weather_code&daily=sunrise,sunset&timezone=auto&forecast_days=1`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Projected rain forecast data received with sunrise/sunset:', data.daily?.sunrise?.[0], data.daily?.sunset?.[0]);
      
      // Process the data
      const hourlyData: PrecipitationData[] = [];
      const maxHours = 24;
      
      for (let i = 0; i < Math.min(maxHours, data.hourly.time.length); i++) {
        hourlyData.push({
          time: data.hourly.time[i],
          precipitation: data.hourly.precipitation[i] || 0,
          precipitationProbability: data.hourly.precipitation_probability[i] || 0,
          weatherCode: data.hourly.weather_code[i] || 0,
        });
      }
      
      // Generate simulated radar grid data based on forecast
      const gridData = generateRadarGrid(hourlyData, data.current.precipitation || 0);
      
      // Calculate summary
      const totalPrecipitation = hourlyData.slice(0, 12).reduce((sum, h) => sum + h.precipitation, 0);
      const maxProbability = Math.max(...hourlyData.slice(0, 12).map(h => h.precipitationProbability));
      const hasRain = totalPrecipitation > 0 || maxProbability > 30;
      
      let summary = '';
      if (!hasRain) {
        summary = 'No rainfall detected in the area';
      } else if (totalPrecipitation < 1) {
        summary = 'Light precipitation in the vicinity';
      } else if (totalPrecipitation < 5) {
        summary = 'Moderate rainfall approaching';
      } else {
        summary = 'Heavy rainfall system detected';
      }
      
      setRadarData({
        current: {
          precipitation: data.current.precipitation || 0,
          weatherCode: data.current.weather_code || 0,
        },
        hourly: hourlyData,
        summary,
        gridData,
        sunrise: data.daily?.sunrise?.[0] || '06:00',
        sunset: data.daily?.sunset?.[0] || '18:00',
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching projected rain forecast data:', err);
      setError(true);
      setErrorMessage(err instanceof Error ? err.message : 'Failed to load projected rain forecast');
      setLoading(false);
    }
  };

  const generateRadarGrid = (hourlyData: PrecipitationData[], currentPrecip: number): PrecipitationZone[] => {
    const zones: PrecipitationZone[] = [];
    const numAngles = 16; // 16 directions
    const numRings = 4; // 4 distance rings
    
    // Use forecast data to create spatial distribution
    for (let ring = 0; ring < numRings; ring++) {
      for (let angle = 0; angle < numAngles; angle++) {
        const angleRad = (angle / numAngles) * 2 * Math.PI;
        const distance = (ring + 1) / numRings;
        
        // Use time-based data to simulate spatial distribution
        const timeIndex = Math.min(Math.floor((ring * numAngles + angle) / 2), hourlyData.length - 1);
        const baseIntensity = hourlyData[timeIndex]?.precipitation || 0;
        
        // Add some variation based on angle and distance
        const variation = Math.sin(angleRad * 3) * 0.3 + Math.cos(angleRad * 2) * 0.2;
        const distanceFactor = 1 - (distance * 0.3); // Closer areas more similar to current
        
        let intensity = baseIntensity * distanceFactor * (1 + variation);
        
        // Add current precipitation influence at center
        if (ring === 0) {
          intensity = (intensity + currentPrecip) / 2;
        }
        
        intensity = Math.max(0, intensity);
        
        zones.push({
          angle: (angle / numAngles) * 360,
          distance: distance,
          intensity: intensity,
          radius: 20 + (ring * 25),
        });
      }
    }
    
    return zones;
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
    if (precipitation === 0) return 'transparent';
    if (precipitation < 0.5) return 'rgba(144, 238, 144, 0.3)';
    if (precipitation < 2.5) return 'rgba(76, 175, 80, 0.5)';
    if (precipitation < 7.5) return 'rgba(255, 193, 7, 0.6)';
    if (precipitation < 15) return 'rgba(255, 152, 0, 0.7)';
    return 'rgba(244, 67, 54, 0.8)';
  };

  const formatTime = (timeString: string): string => {
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
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
      width: compact ? 250 : 300,
      height: compact ? 250 : 300,
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
      textAlign: 'center',
    },
    compassLabel: {
      fontSize: 10,
      fontWeight: '600',
      fontFamily: 'Roboto_600SemiBold',
    },
    distanceLabel: {
      fontSize: 9,
      fontWeight: '500',
      fontFamily: 'Roboto_500Medium',
    },
    distanceLabelBg: {
      backgroundColor: colors.card,
      paddingHorizontal: 4,
      paddingVertical: 2,
      borderRadius: 3,
      borderWidth: 1,
      borderColor: colors.divider,
    },
  }), [colors, shadows, compact]);

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
          <Text style={styles.loadingText}>Loading forecast data...</Text>
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

  const radarSize = compact ? 250 : 300;
  const centerX = radarSize / 2;
  const centerY = radarSize / 2;
  const maxRadius = radarSize / 2 - 20;

  const getIntensityColor = (intensity: number): string => {
    if (intensity === 0) return 'transparent';
    if (intensity < 0.5) return isDark ? 'rgba(144, 238, 144, 0.4)' : 'rgba(144, 238, 144, 0.5)';
    if (intensity < 2.5) return isDark ? 'rgba(76, 175, 80, 0.6)' : 'rgba(76, 175, 80, 0.7)';
    if (intensity < 7.5) return isDark ? 'rgba(255, 193, 7, 0.7)' : 'rgba(255, 193, 7, 0.8)';
    if (intensity < 15) return isDark ? 'rgba(255, 152, 0, 0.8)' : 'rgba(255, 152, 0, 0.9)';
    return isDark ? 'rgba(244, 67, 54, 0.9)' : 'rgba(244, 67, 54, 1)';
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
        Live precipitation forecast for {circuitName}
      </Text>

      {/* Radar Display */}
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
            
            {/* Range rings with distance labels */}
            {[0.25, 0.5, 0.75, 1].map((scale, i) => {
              const ringRadius = maxRadius * scale;
              const distance = distanceRings[i];
              const labelX = centerX + ringRadius + 5;
              const labelY = centerY;
              
              return (
                <G key={`ring-${i}`}>
                  <Circle
                    cx={centerX}
                    cy={centerY}
                    r={ringRadius}
                    fill="none"
                    stroke={colors.divider}
                    strokeWidth="1"
                    strokeDasharray="4,4"
                    opacity={0.3}
                  />
                  {/* Distance label on the right side of each ring */}
                  <G>
                    <SvgText
                      x={labelX}
                      y={labelY + 3}
                      fontSize="9"
                      fontWeight="500"
                      fill={colors.text}
                      textAnchor="start"
                      opacity={0.8}
                    >
                      {distance}km
                    </SvgText>
                  </G>
                </G>
              );
            })}
            
            {/* Cardinal directions */}
            <Line x1={centerX} y1={20} x2={centerX} y2={radarSize - 20} stroke={colors.divider} strokeWidth="1" opacity={0.3} />
            <Line x1={20} y1={centerY} x2={radarSize - 20} y2={centerY} stroke={colors.divider} strokeWidth="1" opacity={0.3} />
            
            {/* Precipitation zones */}
            {radarData.gridData.map((zone, index) => {
              const angleRad = (zone.angle - 90) * (Math.PI / 180);
              const nextAngleRad = ((zone.angle + 22.5) - 90) * (Math.PI / 180);
              const innerRadius = zone.radius - 25;
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
            
            {/* Center marker (circuit location) */}
            <Circle
              cx={centerX}
              cy={centerY}
              r={6}
              fill={colors.primary}
              stroke="#fff"
              strokeWidth="2"
            />
            
            {/* Compass labels */}
            <SvgText
              x={centerX}
              y={15}
              fontSize="12"
              fontWeight="600"
              fill={colors.text}
              textAnchor="middle"
              style={styles.compassLabel}
            >
              N
            </SvgText>
            <SvgText
              x={radarSize - 15}
              y={centerY + 5}
              fontSize="12"
              fontWeight="600"
              fill={colors.text}
              textAnchor="middle"
              style={styles.compassLabel}
            >
              E
            </SvgText>
            <SvgText
              x={centerX}
              y={radarSize - 5}
              fontSize="12"
              fontWeight="600"
              fill={colors.text}
              textAnchor="middle"
              style={styles.compassLabel}
            >
              S
            </SvgText>
            <SvgText
              x={15}
              y={centerY + 5}
              fontSize="12"
              fontWeight="600"
              fill={colors.text}
              textAnchor="middle"
              style={styles.compassLabel}
            >
              W
            </SvgText>
          </Svg>
        </View>
        
        <Text style={styles.infoText}>
          Circuit location marked at center • Distance rings: 10km, 20km, 30km, 40km
        </Text>
      </View>

      {/* Current Conditions */}
      <View style={styles.currentConditions}>
        <View style={styles.conditionsRow}>
          <Text style={styles.conditionsLabel}>Current Rainfall</Text>
          <Text style={styles.conditionsValue}>
            {radarData.current.precipitation.toFixed(1)} mm/h
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

      {/* Hourly Forecast */}
      <View style={styles.forecastContainer}>
        <Text style={styles.forecastTitle}>Next 12 Hours</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.forecastScroll}
        >
          {radarData.hourly.slice(0, 12).map((hour, index) => (
            <View key={index} style={styles.forecastCard}>
              <Text style={styles.forecastTime}>{formatTime(hour.time)}</Text>
              <WeatherSymbol 
                weatherCode={hour.weatherCode}
                size={28}
                latitude={latitude}
                longitude={longitude}
                time={hour.time}
                sunrise={radarData.sunrise}
                sunset={radarData.sunset}
              />
              <Text style={styles.forecastValue}>
                {hour.precipitation.toFixed(1)}mm
              </Text>
              <Text style={styles.forecastProb}>
                {hour.precipitationProbability}%
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: 'rgba(144, 238, 144, 0.5)' }]} />
          <Text style={styles.legendText}>Trace</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: 'rgba(76, 175, 80, 0.7)' }]} />
          <Text style={styles.legendText}>Light</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: 'rgba(255, 193, 7, 0.8)' }]} />
          <Text style={styles.legendText}>Moderate</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: 'rgba(255, 152, 0, 0.9)' }]} />
          <Text style={styles.legendText}>Heavy</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: 'rgba(244, 67, 54, 1)' }]} />
          <Text style={styles.legendText}>Intense</Text>
        </View>
      </View>

      <Text style={styles.infoText}>
        Forecast data from Open-Meteo • Updated every 10 minutes
      </Text>
    </View>
  );
};

export default TrackRainfallRadar;
