
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '../state/ThemeContext';
import { getColors, borderRadius, getShadows } from '../styles/commonStyles';
import Icon from './Icon';

interface WindyCloudRadarProps {
  latitude: number;
  longitude: number;
  circuitName: string;
  zoom?: number;
  width?: number;
  height?: number;
  compact?: boolean;
}

interface ImageryFrame {
  url: string;
  timestamp: number;
  time: string;
  loaded: boolean;
  type: 'cloud' | 'radar';
}

const WindyCloudRadar: React.FC<WindyCloudRadarProps> = ({
  latitude,
  longitude,
  circuitName,
  zoom = 8,
  width = 340,
  height = 340,
  compact = false,
}) => {
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const shadows = getShadows(isDark);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentZoom, setCurrentZoom] = useState(zoom);
  const [activeLayer, setActiveLayer] = useState<'cloud' | 'radar'>('radar');
  const [cloudFrames, setCloudFrames] = useState<ImageryFrame[]>([]);
  const [radarFrames, setRadarFrames] = useState<ImageryFrame[]>([]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [framesReady, setFramesReady] = useState(false);
  const [opacity, setOpacity] = useState(0.8);
  const animationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate tile coordinates from lat/lon
  const getTileCoordinates = useCallback((lat: number, lon: number, zoom: number) => {
    const scale = 1 << zoom;
    const worldCoordX = ((lon + 180) / 360) * scale;
    const latRad = lat * Math.PI / 180;
    const worldCoordY = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * scale;
    
    return {
      x: Math.floor(worldCoordX),
      y: Math.floor(worldCoordY),
      zoom: zoom,
    };
  }, []);

  // Format timestamp to readable time
  const formatTime = useCallback((timestamp: number): string => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }, []);

  // Preload a single image
  const preloadImage = useCallback(async (url: string): Promise<boolean> => {
    try {
      await Image.prefetch([url], {
        cachePolicy: 'memory-disk',
      });
      return true;
    } catch (error) {
      console.error('Error preloading frame:', url, error);
      return false;
    }
  }, []);

  // Fetch cloud imagery frames using OpenWeatherMap
  const fetchCloudFrames = useCallback(async () => {
    console.log('========================================');
    console.log('FETCHING CLOUD IMAGERY');
    console.log('========================================');
    console.log('Location:', { latitude, longitude, zoom: currentZoom });
    
    try {
      const { x, y, zoom: z } = getTileCoordinates(latitude, longitude, currentZoom);
      console.log('Tile coordinates:', { x, y, zoom: z });
      
      const frames: ImageryFrame[] = [];
      
      // OpenWeatherMap provides free cloud tiles
      // Using clouds_new layer which shows cloud coverage
      for (let i = 0; i < 1; i++) {
        const cloudUrl = `https://tile.openweathermap.org/map/clouds_new/${z}/${x}/${y}.png?appid=439d4b804bc8187953eb36d2a8c26a02`;
        
        console.log('Cloud tile URL:', cloudUrl);
        
        frames.push({
          url: cloudUrl,
          timestamp: Date.now(),
          time: formatTime(Date.now()),
          loaded: false,
          type: 'cloud',
        });
      }
      
      console.log(`Generated ${frames.length} cloud frame URLs`);
      
      // Preload frames
      const preloadResults = await Promise.allSettled(
        frames.map((frame, index) => 
          preloadImage(frame.url).then((success) => {
            if (success) {
              frames[index].loaded = true;
              console.log(`✓ Cloud frame ${index + 1}/${frames.length} loaded`);
            } else {
              console.log(`✗ Cloud frame ${index + 1}/${frames.length} failed`);
            }
            return success;
          })
        )
      );
      
      const successCount = preloadResults.filter(
        (result) => result.status === 'fulfilled' && result.value === true
      ).length;
      
      console.log(`Cloud preload complete: ${successCount}/${frames.length} frames loaded`);
      
      if (successCount > 0) {
        setCloudFrames(frames);
        console.log('✓ Cloud frames ready');
      } else {
        console.warn('No cloud frames loaded successfully');
        setCloudFrames(frames); // Still set them to show the attempt
      }
    } catch (error) {
      console.error('Error fetching cloud frames:', error);
      throw error;
    }
  }, [latitude, longitude, currentZoom, getTileCoordinates, formatTime, preloadImage]);

  // Fetch radar imagery frames from RainViewer
  const fetchRadarFrames = useCallback(async () => {
    console.log('========================================');
    console.log('FETCHING RADAR IMAGERY (RainViewer)');
    console.log('========================================');
    console.log('Location:', { latitude, longitude, zoom: currentZoom });
    
    try {
      // First, fetch available radar timestamps from RainViewer API
      const response = await fetch('https://api.rainviewer.com/public/weather-maps.json');
      
      if (!response.ok) {
        throw new Error(`RainViewer API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('RainViewer API response:', data);
      
      if (!data.radar || !data.radar.past || data.radar.past.length === 0) {
        throw new Error('No radar data available from RainViewer');
      }
      
      const { x, y, zoom: z } = getTileCoordinates(latitude, longitude, currentZoom);
      console.log('Tile coordinates:', { x, y, zoom: z });
      
      const frames: ImageryFrame[] = [];
      
      // Use the last 8 available radar frames
      const radarTimestamps = data.radar.past.slice(-8);
      console.log(`Using ${radarTimestamps.length} radar timestamps`);
      
      for (const radarData of radarTimestamps) {
        const timestamp = radarData.time * 1000; // Convert to milliseconds
        const path = radarData.path;
        
        // RainViewer tile URL format
        const radarUrl = `https://tilecache.rainviewer.com${path}/256/${z}/${x}/${y}/2/1_1.png`;
        
        console.log('Radar tile URL:', radarUrl);
        
        frames.push({
          url: radarUrl,
          timestamp: timestamp,
          time: formatTime(timestamp),
          loaded: false,
          type: 'radar',
        });
      }
      
      console.log(`Generated ${frames.length} radar frame URLs`);
      
      // Preload frames
      const preloadResults = await Promise.allSettled(
        frames.map((frame, index) => 
          preloadImage(frame.url).then((success) => {
            if (success) {
              frames[index].loaded = true;
              console.log(`✓ Radar frame ${index + 1}/${frames.length} loaded`);
            } else {
              console.log(`✗ Radar frame ${index + 1}/${frames.length} failed`);
            }
            return success;
          })
        )
      );
      
      const successCount = preloadResults.filter(
        (result) => result.status === 'fulfilled' && result.value === true
      ).length;
      
      console.log(`Radar preload complete: ${successCount}/${frames.length} frames loaded`);
      
      if (successCount > 0) {
        setRadarFrames(frames);
        console.log('✓ Radar frames ready');
      } else {
        throw new Error('Failed to load radar frames');
      }
    } catch (error) {
      console.error('Error fetching radar frames:', error);
      throw error;
    }
  }, [latitude, longitude, currentZoom, getTileCoordinates, formatTime, preloadImage]);

  // Fetch frames when component mounts or settings change
  useEffect(() => {
    const fetchFrames = async () => {
      setLoading(true);
      setError(null);
      setFramesReady(false);
      
      try {
        // Fetch both cloud and radar frames
        await Promise.all([
          fetchCloudFrames().catch(err => {
            console.error('Cloud frames error:', err);
            // Don't fail completely if cloud fails
          }),
          fetchRadarFrames(),
        ]);
        
        setFramesReady(true);
        setCurrentFrameIndex(0);
        setLoading(false);
      } catch (err) {
        console.error('Error loading imagery:', err);
        setError('Unable to load weather imagery. Please check your connection and try again.');
        setLoading(false);
      }
    };
    
    fetchFrames();
  }, [latitude, longitude, currentZoom, fetchCloudFrames, fetchRadarFrames]);

  // Animation loop
  useEffect(() => {
    if (animationIntervalRef.current) {
      clearInterval(animationIntervalRef.current);
      animationIntervalRef.current = null;
    }

    if (!isPlaying || !framesReady) {
      return;
    }

    const currentFrames = activeLayer === 'cloud' ? cloudFrames : radarFrames;
    
    if (currentFrames.length === 0) {
      return;
    }

    const loadedFrames = currentFrames.filter(f => f.loaded);
    
    if (loadedFrames.length === 0) {
      return;
    }

    animationIntervalRef.current = setInterval(() => {
      setCurrentFrameIndex((prev) => {
        const next = (prev + 1) % currentFrames.length;
        return next;
      });
    }, 500); // 500ms per frame for smooth animation

    return () => {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
        animationIntervalRef.current = null;
      }
    };
  }, [isPlaying, framesReady, activeLayer, cloudFrames, radarFrames]);

  // Get current frame
  const currentFrame = useMemo(() => {
    const currentFrames = activeLayer === 'cloud' ? cloudFrames : radarFrames;
    if (currentFrames.length === 0) return null;
    const frame = currentFrames[currentFrameIndex];
    return frame && frame.loaded ? frame : null;
  }, [activeLayer, cloudFrames, radarFrames, currentFrameIndex]);

  const handleZoomIn = () => {
    if (currentZoom < 12) {
      setCurrentZoom(prev => prev + 1);
    }
  };

  const handleZoomOut = () => {
    if (currentZoom > 4) {
      setCurrentZoom(prev => prev - 1);
    }
  };

  const handleReset = () => {
    setCurrentZoom(zoom);
    setCurrentFrameIndex(0);
  };

  const togglePlayPause = () => {
    setIsPlaying(prev => !prev);
  };

  const handleRefresh = () => {
    setCurrentFrameIndex(0);
    setFramesReady(false);
    setCloudFrames([]);
    setRadarFrames([]);
  };

  const switchLayer = (layer: 'cloud' | 'radar') => {
    setActiveLayer(layer);
    setCurrentFrameIndex(0);
  };

  const adjustOpacity = (delta: number) => {
    setOpacity(prev => Math.max(0.3, Math.min(1, prev + delta)));
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
    imageContainer: {
      backgroundColor: colors.backgroundAlt,
      borderRadius: borderRadius.md,
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.divider,
      position: 'relative',
    },
    imageryFrame: {
      width: '100%',
      height: '100%',
    },
    loadingContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.backgroundAlt,
      zIndex: 10,
    },
    loadingText: {
      marginTop: 12,
      fontSize: 14,
      color: colors.text,
      fontFamily: 'Roboto_500Medium',
    },
    errorContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.backgroundAlt,
      padding: 20,
      width: '100%',
      height: '100%',
    },
    errorText: {
      fontSize: 14,
      color: colors.error,
      fontFamily: 'Roboto_500Medium',
      textAlign: 'center',
      marginTop: 12,
      marginBottom: 8,
    },
    retryButton: {
      marginTop: 8,
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
    layerSelector: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 12,
    },
    layerButton: {
      flex: 1,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: borderRadius.md,
      backgroundColor: colors.backgroundAlt,
      borderWidth: 1,
      borderColor: colors.divider,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
    layerButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    layerButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      fontFamily: 'Roboto_600SemiBold',
    },
    layerButtonTextActive: {
      color: '#fff',
    },
    controls: {
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
      backgroundColor: colors.backgroundAlt,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: borderRadius.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      borderWidth: 1,
      borderColor: colors.divider,
    },
    controlButtonDisabled: {
      opacity: 0.4,
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
    zoomLevel: {
      fontSize: 13,
      color: colors.textMuted,
      fontFamily: 'Roboto_500Medium',
    },
    animationControls: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    },
    frameIndicator: {
      fontSize: 12,
      color: colors.textMuted,
      fontFamily: 'Roboto_500Medium',
    },
    timeStamp: {
      position: 'absolute',
      bottom: 8,
      left: 8,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      borderRadius: borderRadius.sm,
      padding: 6,
      zIndex: 6,
    },
    timeStampText: {
      fontSize: 11,
      color: '#fff',
      fontFamily: 'Roboto_600SemiBold',
    },
    layerBadge: {
      position: 'absolute',
      top: 8,
      left: 8,
      backgroundColor: colors.primary,
      borderRadius: borderRadius.sm,
      padding: 6,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      zIndex: 6,
      boxShadow: shadows.sm,
    },
    layerBadgeText: {
      fontSize: 11,
      color: '#fff',
      fontFamily: 'Roboto_600SemiBold',
    },
    opacityControls: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
      justifyContent: 'center',
    },
    opacityLabel: {
      fontSize: 12,
      color: colors.textMuted,
      fontFamily: 'Roboto_500Medium',
    },
    opacityValue: {
      fontSize: 13,
      color: colors.text,
      fontFamily: 'Roboto_600SemiBold',
      minWidth: 40,
      textAlign: 'center',
    },
    infoText: {
      fontSize: 11,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      marginTop: 8,
      fontStyle: 'italic',
      textAlign: 'center',
    },
    locationMarker: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      marginLeft: -12,
      marginTop: -24,
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.error,
      borderWidth: 3,
      borderColor: '#fff',
      boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.3)',
      zIndex: 5,
    },
    baseMapLayer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100%',
      height: '100%',
      zIndex: 1,
    },
    weatherLayer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100%',
      height: '100%',
      zIndex: 2,
    },
  }), [colors, shadows, compact, activeLayer]);

  const imageContainerStyle = useMemo(() => ({
    ...styles.imageContainer,
    width: compact ? 280 : width,
    height: compact ? 280 : height,
  }), [styles.imageContainer, compact, width, height]);

  // Get base map tile URL
  const getBaseMapUrl = useMemo(() => {
    const { x, y, zoom: z } = getTileCoordinates(latitude, longitude, currentZoom);
    // Using OpenStreetMap tiles as base layer
    return `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
  }, [latitude, longitude, currentZoom, getTileCoordinates]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Icon name="cloud" size={20} color={colors.primary} />
          <Text style={styles.title}>Live Cloud & Radar</Text>
        </View>
        <TouchableOpacity 
          onPress={handleReset}
          activeOpacity={0.7}
        >
          <Icon name="refresh" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.subtitle}>
        Real-time cloud imagery and rainfall radar for {circuitName}
      </Text>

      {/* Layer Selector */}
      <View style={styles.layerSelector}>
        <TouchableOpacity
          style={[styles.layerButton, activeLayer === 'cloud' && styles.layerButtonActive]}
          onPress={() => switchLayer('cloud')}
          activeOpacity={0.7}
        >
          <Icon 
            name="cloud" 
            size={16} 
            color={activeLayer === 'cloud' ? '#fff' : colors.text} 
          />
          <Text style={[styles.layerButtonText, activeLayer === 'cloud' && styles.layerButtonTextActive]}>
            Cloud Cover
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.layerButton, activeLayer === 'radar' && styles.layerButtonActive]}
          onPress={() => switchLayer('radar')}
          activeOpacity={0.7}
        >
          <Icon 
            name="rainy" 
            size={16} 
            color={activeLayer === 'radar' ? '#fff' : colors.text} 
          />
          <Text style={[styles.layerButtonText, activeLayer === 'radar' && styles.layerButtonTextActive]}>
            Rainfall Radar
          </Text>
        </TouchableOpacity>
      </View>

      <View style={imageContainerStyle}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading weather imagery...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Icon name="cloud-offline" size={48} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={handleRefresh}
              activeOpacity={0.8}
            >
              <Icon name="refresh" size={16} color="#fff" />
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : framesReady ? (
          <>
            {/* Base map layer */}
            <Image
              source={{ uri: getBaseMapUrl }}
              style={styles.baseMapLayer}
              contentFit="cover"
              cachePolicy="memory-disk"
              priority="high"
            />
            
            {/* Weather overlay layer */}
            {currentFrame && (
              <Image
                key={`${activeLayer}-${currentFrameIndex}`}
                source={{ uri: currentFrame.url }}
                style={[styles.weatherLayer, { opacity }]}
                contentFit="cover"
                transition={200}
                cachePolicy="memory-disk"
                priority="normal"
              />
            )}
            
            {/* Layer Badge */}
            <View style={styles.layerBadge}>
              <Icon 
                name={activeLayer === 'cloud' ? 'cloud' : 'rainy'} 
                size={14} 
                color="#fff" 
              />
              <Text style={styles.layerBadgeText}>
                {activeLayer === 'cloud' ? 'Cloud' : 'Radar'}
              </Text>
            </View>
            
            {/* Timestamp */}
            {currentFrame && (
              <View style={styles.timeStamp}>
                <Text style={styles.timeStampText}>
                  {currentFrame.time}
                </Text>
              </View>
            )}
            
            {/* Location marker */}
            <View style={styles.locationMarker} />
          </>
        ) : null}
      </View>

      {/* Zoom Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlButton, currentZoom >= 12 && styles.controlButtonDisabled]}
          onPress={handleZoomIn}
          disabled={currentZoom >= 12}
          activeOpacity={0.7}
        >
          <Icon name="add" size={16} color={colors.text} />
          <Text style={styles.controlButtonText}>Zoom In</Text>
        </TouchableOpacity>
        
        <Text style={styles.zoomLevel}>Zoom: {currentZoom}</Text>
        
        <TouchableOpacity
          style={[styles.controlButton, currentZoom <= 4 && styles.controlButtonDisabled]}
          onPress={handleZoomOut}
          disabled={currentZoom <= 4}
          activeOpacity={0.7}
        >
          <Icon name="remove" size={16} color={colors.text} />
          <Text style={styles.controlButtonText}>Zoom Out</Text>
        </TouchableOpacity>
      </View>

      {/* Animation Controls */}
      {framesReady && activeLayer === 'radar' && radarFrames.length > 1 && (
        <View style={styles.animationControls}>
          <TouchableOpacity
            style={[styles.controlButton, isPlaying && styles.controlButtonActive]}
            onPress={togglePlayPause}
            activeOpacity={0.7}
          >
            <Icon 
              name={isPlaying ? "pause" : "play"} 
              size={16} 
              color={isPlaying ? '#fff' : colors.text} 
            />
            <Text style={[styles.controlButtonText, isPlaying && styles.controlButtonTextActive]}>
              {isPlaying ? 'Pause' : 'Play'}
            </Text>
          </TouchableOpacity>
          
          <Text style={styles.frameIndicator}>
            Frame {currentFrameIndex + 1} / {radarFrames.length}
          </Text>
          
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleRefresh}
            activeOpacity={0.7}
          >
            <Icon name="refresh" size={16} color={colors.text} />
            <Text style={styles.controlButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Opacity Controls */}
      {framesReady && (
        <View style={styles.opacityControls}>
          <Text style={styles.opacityLabel}>Opacity:</Text>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => adjustOpacity(-0.1)}
            activeOpacity={0.7}
          >
            <Icon name="remove" size={14} color={colors.text} />
          </TouchableOpacity>
          
          <Text style={styles.opacityValue}>{Math.round(opacity * 100)}%</Text>
          
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => adjustOpacity(0.1)}
            activeOpacity={0.7}
          >
            <Icon name="add" size={14} color={colors.text} />
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.infoText}>
        Powered by RainViewer & OpenWeatherMap • Real-time radar and cloud data
      </Text>
    </View>
  );
};

export default WindyCloudRadar;
