
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '../state/ThemeContext';
import { getColors, borderRadius, getShadows } from '../styles/commonStyles';
import Icon from './Icon';
import Svg, { Circle, Text as SvgText, G, Path, Line } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  useAnimatedGestureHandler,
  runOnJS,
} from 'react-native-reanimated';
import { GestureDetector, Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';
import { f1Circuits, motogpCircuits, indycarCircuits, nascarCircuits } from '../data/circuits';

interface InteractiveGlobeProps {
  category?: 'f1' | 'motogp' | 'indycar' | 'nascar' | 'all';
  onTrackSelect?: (slug: string, category: 'f1' | 'motogp' | 'indycar' | 'nascar') => void;
}

interface TrackMarker {
  slug: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  category: 'f1' | 'motogp' | 'indycar' | 'nascar';
  x: number;
  y: number;
}

interface RadarData {
  slug: string;
  precipitation: number;
  intensity: 'none' | 'light' | 'moderate' | 'heavy';
  color: string;
  loading: boolean;
}

const AnimatedView = Animated.createAnimatedComponent(View);

const InteractiveGlobe: React.FC<InteractiveGlobeProps> = ({
  category = 'all',
  onTrackSelect,
}) => {
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const shadows = getShadows(isDark);
  
  const [selectedTrack, setSelectedTrack] = useState<TrackMarker | null>(null);
  const [radarData, setRadarData] = useState<Map<string, RadarData>>(new Map());
  const [showRadar, setShowRadar] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [mapDimensions, setMapDimensions] = useState({ width: 0, height: 0 });
  
  // Animation values for pan and zoom
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedScale = useSharedValue(1);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  // Get screen dimensions
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const mapWidth = screenWidth - 32;
  const mapHeight = Math.min(screenHeight * 0.6, 500);

  // Convert lat/lon to x/y coordinates (Mercator projection)
  const latLonToXY = useCallback((lat: number, lon: number, width: number, height: number) => {
    const x = ((lon + 180) / 360) * width;
    const latRad = (lat * Math.PI) / 180;
    const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
    const y = (height / 2) - (width * mercN / (2 * Math.PI));
    return { x, y };
  }, []);

  // Get all tracks based on category
  const allTracks = useMemo(() => {
    let circuits = [];
    if (category === 'all') {
      circuits = [
        ...f1Circuits.map(c => ({ ...c, category: 'f1' as const })),
        ...motogpCircuits.map(c => ({ ...c, category: 'motogp' as const })),
        ...indycarCircuits.map(c => ({ ...c, category: 'indycar' as const })),
        ...nascarCircuits.map(c => ({ ...c, category: 'nascar' as const })),
      ];
    } else if (category === 'f1') {
      circuits = f1Circuits.map(c => ({ ...c, category: 'f1' as const }));
    } else if (category === 'motogp') {
      circuits = motogpCircuits.map(c => ({ ...c, category: 'motogp' as const }));
    } else if (category === 'indycar') {
      circuits = indycarCircuits.map(c => ({ ...c, category: 'indycar' as const }));
    } else if (category === 'nascar') {
      circuits = nascarCircuits.map(c => ({ ...c, category: 'nascar' as const }));
    }

    return circuits.map(circuit => {
      const { x, y } = latLonToXY(circuit.latitude, circuit.longitude, mapWidth, mapHeight);
      return {
        ...circuit,
        x,
        y,
      };
    });
  }, [category, mapWidth, mapHeight, latLonToXY]);

  // Fetch rainfall data for a track
  const fetchTrackRainfall = useCallback(async (track: TrackMarker) => {
    const key = `${track.slug}-${track.category}`;
    
    // Set loading state
    setRadarData(prev => new Map(prev).set(key, {
      slug: key,
      precipitation: 0,
      intensity: 'none',
      color: 'transparent',
      loading: true,
    }));

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${track.latitude}&longitude=${track.longitude}&current=precipitation&timezone=auto`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      const precipitation = data.current?.precipitation || 0;
      
      let intensity: 'none' | 'light' | 'moderate' | 'heavy' = 'none';
      let color = 'transparent';
      
      if (precipitation > 0) {
        if (precipitation < 2.5) {
          intensity = 'light';
          color = isDark ? 'rgba(76, 175, 80, 0.7)' : 'rgba(76, 175, 80, 0.8)';
        } else if (precipitation < 7.5) {
          intensity = 'moderate';
          color = isDark ? 'rgba(255, 193, 7, 0.8)' : 'rgba(255, 193, 7, 0.9)';
        } else {
          intensity = 'heavy';
          color = isDark ? 'rgba(244, 67, 54, 0.9)' : 'rgba(244, 67, 54, 1)';
        }
      }
      
      setRadarData(prev => new Map(prev).set(key, {
        slug: key,
        precipitation,
        intensity,
        color,
        loading: false,
      }));
    } catch (error) {
      console.error(`Error fetching rainfall for ${track.name}:`, error);
      setRadarData(prev => new Map(prev).set(key, {
        slug: key,
        precipitation: 0,
        intensity: 'none',
        color: 'transparent',
        loading: false,
      }));
    }
  }, [isDark]);

  // Fetch rainfall data for all tracks
  const fetchAllRainfall = useCallback(async () => {
    console.log('Fetching rainfall data for all tracks...');
    for (const track of allTracks) {
      await fetchTrackRainfall(track);
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }, [allTracks, fetchTrackRainfall]);

  // Initial fetch
  useEffect(() => {
    if (allTracks.length > 0) {
      fetchAllRainfall();
    }
  }, [allTracks, fetchAllRainfall]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      console.log('Auto-refreshing rainfall data...');
      fetchAllRainfall();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [autoRefresh, fetchAllRainfall]);

  // Handle track selection
  const handleTrackPress = useCallback((track: TrackMarker) => {
    setSelectedTrack(track);
    if (onTrackSelect) {
      onTrackSelect(track.slug, track.category);
    }
  }, [onTrackSelect]);

  // Reset zoom and pan
  const handleReset = useCallback(() => {
    scale.value = withSpring(1);
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
    savedScale.value = 1;
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  }, [scale, translateX, translateY, savedScale, savedTranslateX, savedTranslateY]);

  // Zoom in
  const handleZoomIn = useCallback(() => {
    const newScale = Math.min(scale.value * 1.5, 5);
    scale.value = withSpring(newScale);
    savedScale.value = newScale;
  }, [scale, savedScale]);

  // Zoom out
  const handleZoomOut = useCallback(() => {
    const newScale = Math.max(scale.value / 1.5, 0.5);
    scale.value = withSpring(newScale);
    savedScale.value = newScale;
  }, [scale, savedScale]);

  // Pinch gesture for zoom
  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = savedScale.value * event.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  // Pan gesture for dragging
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = savedTranslateX.value + event.translationX;
      translateY.value = savedTranslateY.value + event.translationY;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const composedGesture = Gesture.Simultaneous(pinchGesture, panGesture);

  // Animated style for map container
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  // Get category color
  const getCategoryColor = (cat: 'f1' | 'motogp' | 'indycar' | 'nascar') => {
    switch (cat) {
      case 'f1':
        return '#E10600';
      case 'motogp':
        return '#FF6600';
      case 'indycar':
        return '#0066CC';
      case 'nascar':
        return '#FCD34D';
      default:
        return colors.primary;
    }
  };

  // Get marker size based on radar intensity
  const getMarkerSize = (track: TrackMarker) => {
    const key = `${track.slug}-${track.category}`;
    const radar = radarData.get(key);
    
    if (!radar || !showRadar) return 8;
    
    switch (radar.intensity) {
      case 'light':
        return 12;
      case 'moderate':
        return 16;
      case 'heavy':
        return 20;
      default:
        return 8;
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
    mapContainer: {
      backgroundColor: isDark ? '#1a1a1a' : '#e8f4f8',
      borderRadius: borderRadius.md,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.divider,
      marginBottom: 16,
    },
    mapWrapper: {
      width: '100%',
      height: mapHeight,
      position: 'relative',
    },
    map: {
      width: '100%',
      height: '100%',
    },
    markersOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    marker: {
      position: 'absolute',
      borderRadius: 50,
      borderWidth: 2,
      borderColor: '#fff',
      boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.3)',
    },
    markerPulse: {
      position: 'absolute',
      borderRadius: 50,
      borderWidth: 2,
      opacity: 0.5,
    },
    selectedMarker: {
      borderWidth: 3,
      borderColor: colors.primary,
      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.5)',
    },
    controls: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 8,
      marginBottom: 16,
    },
    controlGroup: {
      flexDirection: 'row',
      gap: 8,
    },
    controlButton: {
      backgroundColor: colors.backgroundAlt,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: borderRadius.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      borderWidth: 1,
      borderColor: colors.divider,
    },
    controlButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    controlButtonText: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '600',
      fontFamily: 'Roboto_600SemiBold',
    },
    controlButtonTextActive: {
      color: '#fff',
    },
    legend: {
      backgroundColor: colors.backgroundAlt,
      borderRadius: borderRadius.md,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.divider,
      marginBottom: 16,
    },
    legendTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      fontFamily: 'Roboto_600SemiBold',
      marginBottom: 8,
    },
    legendGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
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
      borderWidth: 2,
      borderColor: '#fff',
    },
    legendText: {
      fontSize: 11,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
    },
    selectedTrackCard: {
      backgroundColor: colors.backgroundAlt,
      borderRadius: borderRadius.md,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.divider,
      marginBottom: 16,
    },
    selectedTrackHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    selectedTrackName: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Roboto_700Bold',
      flex: 1,
    },
    selectedTrackCountry: {
      fontSize: 13,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      marginBottom: 8,
    },
    selectedTrackRainfall: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: colors.background,
      padding: 10,
      borderRadius: borderRadius.sm,
    },
    rainfallValue: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Roboto_700Bold',
    },
    rainfallLabel: {
      fontSize: 12,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
    },
    closeButton: {
      padding: 4,
    },
    infoText: {
      fontSize: 11,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      fontStyle: 'italic',
      textAlign: 'center',
    },
    loadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
    },
    loadingText: {
      marginTop: 8,
      fontSize: 13,
      color: '#fff',
      fontFamily: 'Roboto_500Medium',
    },
  }), [colors, shadows, isDark, mapHeight]);

  const isLoading = Array.from(radarData.values()).some(r => r.loading);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Icon name="globe-outline" size={20} color={colors.primary} />
          <Text style={styles.title}>Global Rainfall Radar</Text>
        </View>
        <TouchableOpacity 
          onPress={fetchAllRainfall}
          activeOpacity={0.7}
        >
          <Icon name="refresh" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.subtitle}>
        Interactive world map showing live rainfall at {allTracks.length} track locations
      </Text>

      {/* Controls */}
      <View style={styles.controls}>
        <View style={styles.controlGroup}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleZoomIn}
            activeOpacity={0.7}
          >
            <Icon name="add" size={16} color={colors.text} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleZoomOut}
            activeOpacity={0.7}
          >
            <Icon name="remove" size={16} color={colors.text} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleReset}
            activeOpacity={0.7}
          >
            <Icon name="contract" size={16} color={colors.text} />
            <Text style={styles.controlButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.controlButton, showRadar && styles.controlButtonActive]}
          onPress={() => setShowRadar(!showRadar)}
          activeOpacity={0.7}
        >
          <Icon name="rainy" size={16} color={showRadar ? '#fff' : colors.text} />
          <Text style={[styles.controlButtonText, showRadar && styles.controlButtonTextActive]}>
            Radar
          </Text>
        </TouchableOpacity>
      </View>

      {/* Selected Track Info */}
      {selectedTrack && (
        <View style={styles.selectedTrackCard}>
          <View style={styles.selectedTrackHeader}>
            <Text style={styles.selectedTrackName}>{selectedTrack.name}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedTrack(null)}
              activeOpacity={0.7}
            >
              <Icon name="close" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
          <Text style={styles.selectedTrackCountry}>
            {selectedTrack.country} • {selectedTrack.category.toUpperCase()}
          </Text>
          {(() => {
            const key = `${selectedTrack.slug}-${selectedTrack.category}`;
            const radar = radarData.get(key);
            return (
              <View style={styles.selectedTrackRainfall}>
                <Icon name="rainy" size={20} color={colors.precipitation} />
                <View style={{ flex: 1 }}>
                  {radar?.loading ? (
                    <Text style={styles.rainfallLabel}>Loading...</Text>
                  ) : (
                    <>
                      <Text style={styles.rainfallValue}>
                        {radar?.precipitation.toFixed(2) || '0.00'} mm/h
                      </Text>
                      <Text style={styles.rainfallLabel}>
                        {radar?.intensity === 'none' ? 'No rainfall' :
                         radar?.intensity === 'light' ? 'Light rain' :
                         radar?.intensity === 'moderate' ? 'Moderate rain' :
                         'Heavy rain'}
                      </Text>
                    </>
                  )}
                </View>
              </View>
            );
          })()}
        </View>
      )}

      {/* Map Container */}
      <GestureHandlerRootView style={styles.mapContainer}>
        <GestureDetector gesture={composedGesture}>
          <View 
            style={styles.mapWrapper}
            onLayout={(event) => {
              const { width, height } = event.nativeEvent.layout;
              setMapDimensions({ width, height });
            }}
          >
            <AnimatedView style={[styles.map, animatedStyle]}>
              {/* World Map Background */}
              <Svg width={mapWidth} height={mapHeight} viewBox={`0 0 ${mapWidth} ${mapHeight}`}>
                {/* Simple world map outline */}
                <Path
                  d={`M 0 ${mapHeight / 2} Q ${mapWidth / 4} ${mapHeight / 3}, ${mapWidth / 2} ${mapHeight / 2} T ${mapWidth} ${mapHeight / 2}`}
                  stroke={colors.divider}
                  strokeWidth="1"
                  fill="none"
                />
                
                {/* Grid lines */}
                {[...Array(9)].map((_, i) => (
                  <Line
                    key={`lat-${i}`}
                    x1={0}
                    y1={(i + 1) * (mapHeight / 10)}
                    x2={mapWidth}
                    y2={(i + 1) * (mapHeight / 10)}
                    stroke={colors.divider}
                    strokeWidth="0.5"
                    opacity={0.3}
                  />
                ))}
                {[...Array(17)].map((_, i) => (
                  <Line
                    key={`lon-${i}`}
                    x1={(i + 1) * (mapWidth / 18)}
                    y1={0}
                    x2={(i + 1) * (mapWidth / 18)}
                    y2={mapHeight}
                    stroke={colors.divider}
                    strokeWidth="0.5"
                    opacity={0.3}
                  />
                ))}

                {/* Track markers */}
                {allTracks.map((track) => {
                  const key = `${track.slug}-${track.category}`;
                  const radar = radarData.get(key);
                  const markerSize = getMarkerSize(track);
                  const isSelected = selectedTrack?.slug === track.slug && selectedTrack?.category === track.category;
                  
                  return (
                    <G key={key}>
                      {/* Radar pulse effect for active rainfall */}
                      {showRadar && radar && radar.intensity !== 'none' && (
                        <Circle
                          cx={track.x}
                          cy={track.y}
                          r={markerSize * 2}
                          fill={radar.color}
                          opacity={0.3}
                        />
                      )}
                      
                      {/* Main marker */}
                      <Circle
                        cx={track.x}
                        cy={track.y}
                        r={markerSize}
                        fill={showRadar && radar && radar.intensity !== 'none' ? radar.color : getCategoryColor(track.category)}
                        stroke={isSelected ? colors.primary : '#fff'}
                        strokeWidth={isSelected ? 3 : 2}
                        onPress={() => runOnJS(handleTrackPress)(track)}
                      />
                      
                      {/* Track name label (only for selected) */}
                      {isSelected && (
                        <SvgText
                          x={track.x}
                          y={track.y - markerSize - 8}
                          fontSize="10"
                          fontWeight="700"
                          fill={colors.text}
                          textAnchor="middle"
                        >
                          {track.name.length > 20 ? track.name.substring(0, 20) + '...' : track.name}
                        </SvgText>
                      )}
                    </G>
                  );
                })}
              </Svg>
            </AnimatedView>

            {/* Loading overlay */}
            {isLoading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.loadingText}>Loading rainfall data...</Text>
              </View>
            )}
          </View>
        </GestureDetector>
      </GestureHandlerRootView>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Legend</Text>
        <View style={styles.legendGrid}>
          {category === 'all' && (
            <>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#E10600' }]} />
                <Text style={styles.legendText}>F1</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#FF6600' }]} />
                <Text style={styles.legendText}>MotoGP</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#0066CC' }]} />
                <Text style={styles.legendText}>IndyCar</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#FCD34D' }]} />
                <Text style={styles.legendText}>NASCAR</Text>
              </View>
            </>
          )}
          {showRadar && (
            <>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: 'rgba(76, 175, 80, 0.8)' }]} />
                <Text style={styles.legendText}>Light Rain</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: 'rgba(255, 193, 7, 0.9)' }]} />
                <Text style={styles.legendText}>Moderate</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: 'rgba(244, 67, 54, 1)' }]} />
                <Text style={styles.legendText}>Heavy Rain</Text>
              </View>
            </>
          )}
        </View>
      </View>

      <Text style={styles.infoText}>
        Pinch to zoom • Drag to pan • Tap markers for details • Auto-refreshes every 5 minutes
      </Text>
    </View>
  );
};

export default InteractiveGlobe;
