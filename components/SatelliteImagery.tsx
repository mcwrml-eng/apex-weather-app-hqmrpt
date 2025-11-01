
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '../state/ThemeContext';
import { getColors, borderRadius, getShadows } from '../styles/commonStyles';
import Icon from './Icon';
import { useWeather } from '../hooks/useWeather';
import { useUnit } from '../state/UnitContext';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  cancelAnimation,
  runOnJS,
} from 'react-native-reanimated';

interface SatelliteImageryProps {
  latitude: number;
  longitude: number;
  circuitName: string;
  zoom?: number;
  width?: number;
  height?: number;
  compact?: boolean;
}

interface CloudFrame {
  url: string;
  timestamp: number;
  time: string;
  loaded: boolean;
}

const SatelliteImagery: React.FC<SatelliteImageryProps> = ({
  latitude,
  longitude,
  circuitName,
  zoom = 15,
  width = 340,
  height = 340,
  compact = false,
}) => {
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const shadows = getShadows(isDark);
  const { unit } = useUnit();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(zoom);
  const [retryCount, setRetryCount] = useState(0);
  const [useAlternative, setUseAlternative] = useState(false);
  const [showCloudCover, setShowCloudCover] = useState(true);
  const [cloudFrames, setCloudFrames] = useState<CloudFrame[]>([]);
  const [cloudLoading, setCloudLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [framesReady, setFramesReady] = useState(false);
  const [cloudError, setCloudError] = useState<string | null>(null);
  const animationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Animation values
  const animationProgress = useSharedValue(0);
  const cloudOpacity = useSharedValue(0.7);

  // Fetch weather data for cloud cover
  const { current, loading: weatherLoading } = useWeather(latitude, longitude, unit);

  // Calculate tile coordinates from lat/lon for tile-based services
  const getTileCoordinates = (lat: number, lon: number, zoom: number) => {
    const scale = 1 << zoom;
    const worldCoordX = ((lon + 180) / 360) * scale;
    const worldCoordY = ((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2) * scale;
    
    return {
      x: Math.floor(worldCoordX),
      y: Math.floor(worldCoordY),
    };
  };

  // Primary: Esri World Imagery (free, no API key required, reliable)
  const primaryImageUrl = useMemo(() => {
    const { x, y } = getTileCoordinates(latitude, longitude, currentZoom);
    return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${currentZoom}/${y}/${x}`;
  }, [latitude, longitude, currentZoom]);

  // Alternative: USGS Imagery (another free option)
  const alternativeImageUrl = useMemo(() => {
    const { x, y } = getTileCoordinates(latitude, longitude, currentZoom);
    return `https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/${currentZoom}/${y}/${x}`;
  }, [latitude, longitude, currentZoom]);

  const currentImageUrl = useMemo(() => {
    if (useAlternative) {
      return alternativeImageUrl;
    }
    return primaryImageUrl;
  }, [useAlternative, primaryImageUrl, alternativeImageUrl]);

  // Format timestamp to readable time
  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Preload a single image using expo-image prefetch
  const preloadImage = useCallback(async (url: string): Promise<boolean> => {
    try {
      console.log('Preloading cloud frame:', url);
      
      // Image.prefetch returns a promise that resolves to true on success
      // or rejects on failure
      await Image.prefetch([url], {
        cachePolicy: 'memory-disk',
      });
      
      console.log('Successfully preloaded cloud frame:', url);
      return true;
    } catch (error) {
      console.error('Error preloading cloud frame:', url, error);
      return false;
    }
  }, []);

  // Fetch cloud cover frames from RainViewer API
  const fetchCloudFrames = useCallback(async () => {
    if (!showCloudCover) return;
    
    setCloudLoading(true);
    setFramesReady(false);
    setCloudError(null);
    console.log('========================================');
    console.log('FETCHING CLOUD COVER FRAMES');
    console.log('========================================');
    console.log('Circuit location:', { latitude, longitude, zoom: currentZoom });
    
    try {
      // Fetch available timestamps from RainViewer
      console.log('Requesting RainViewer API...');
      const response = await fetch('https://api.rainviewer.com/public/weather-maps.json');
      
      if (!response.ok) {
        throw new Error(`RainViewer API returned ${response.status}`);
      }
      
      const data = await response.json();
      
      console.log('RainViewer API response received');
      console.log('Available data types:', Object.keys(data));
      
      if (!data.satellite || !data.satellite.infrared) {
        console.error('No satellite infrared data available from RainViewer');
        throw new Error('No satellite data available');
      }

      const { x, y } = getTileCoordinates(latitude, longitude, currentZoom);
      console.log('Tile coordinates for cloud overlay:', { x, y, zoom: currentZoom });
      
      const frames: CloudFrame[] = [];
      
      // Get the last 10 frames for animation (about 30 minutes of data)
      const infraredFrames = data.satellite.infrared.slice(-10);
      
      console.log(`Processing ${infraredFrames.length} infrared satellite frames`);
      
      for (const frame of infraredFrames) {
        const timestamp = frame.time;
        const path = frame.path;
        
        // RainViewer tile URL format: https://tilecache.rainviewer.com{path}/256/{z}/{x}/{y}/2/1_1.png
        // The "2" is for infrared, "1_1" is for color scheme and smooth
        const cloudUrl = `https://tilecache.rainviewer.com${path}/256/${currentZoom}/${x}/${y}/2/1_1.png`;
        
        frames.push({
          url: cloudUrl,
          timestamp: timestamp,
          time: formatTime(timestamp),
          loaded: false,
        });
      }
      
      console.log(`Generated ${frames.length} cloud frame URLs`);
      console.log('Sample URL:', frames[0]?.url);
      
      // Preload all frames before setting them
      console.log('========================================');
      console.log('PRELOADING CLOUD FRAMES');
      console.log('========================================');
      
      const preloadResults = await Promise.allSettled(
        frames.map((frame, index) => 
          preloadImage(frame.url).then((success) => {
            if (success) {
              frames[index].loaded = true;
              console.log(`✓ Frame ${index + 1}/${frames.length} loaded successfully`);
            } else {
              console.error(`✗ Frame ${index + 1}/${frames.length} failed to load`);
            }
            return success;
          })
        )
      );
      
      const successCount = preloadResults.filter(
        (result) => result.status === 'fulfilled' && result.value === true
      ).length;
      
      console.log('========================================');
      console.log(`PRELOAD COMPLETE: ${successCount}/${frames.length} frames loaded`);
      console.log('========================================');
      
      if (successCount > 0) {
        setCloudFrames(frames);
        setCurrentFrameIndex(0);
        setFramesReady(true);
        console.log('✓ Cloud frames ready for animation');
      } else {
        console.error('✗ Failed to preload any cloud frames');
        throw new Error('Failed to load cloud frames');
      }
      
      setCloudLoading(false);
    } catch (error) {
      console.error('========================================');
      console.error('RAINVIEWER FAILED:', error);
      console.error('========================================');
      setCloudError('RainViewer failed, trying OpenWeatherMap...');
      
      // Fallback to OpenWeatherMap if RainViewer fails
      try {
        console.log('========================================');
        console.log('FALLBACK: TRYING OPENWEATHERMAP');
        console.log('========================================');
        
        const { x, y } = getTileCoordinates(latitude, longitude, currentZoom);
        const frames: CloudFrame[] = [];
        
        // OpenWeatherMap clouds layer - using free tier
        const now = Math.floor(Date.now() / 1000);
        
        // Create multiple frames with slight time offsets to simulate animation
        for (let i = 0; i < 8; i++) {
          const timestamp = now - (i * 300); // 5 minute intervals
          // OpenWeatherMap clouds layer URL format
          const cloudUrl = `https://tile.openweathermap.org/map/clouds_new/${currentZoom}/${x}/${y}.png?appid=439d4b804bc8187953eb36d2a8c26a02`;
          
          frames.push({
            url: cloudUrl,
            timestamp: timestamp,
            time: formatTime(timestamp),
            loaded: false,
          });
        }
        
        console.log(`Generated ${frames.length} fallback cloud frame URLs`);
        console.log('Sample URL:', frames[0]?.url);
        
        // Preload fallback frames
        console.log('Preloading fallback cloud frames...');
        const preloadResults = await Promise.allSettled(
          frames.map((frame, index) => 
            preloadImage(frame.url).then((success) => {
              if (success) {
                frames[index].loaded = true;
                console.log(`✓ Fallback frame ${index + 1}/${frames.length} loaded`);
              }
              return success;
            })
          )
        );
        
        const successCount = preloadResults.filter(
          (result) => result.status === 'fulfilled' && result.value === true
        ).length;
        
        console.log(`Fallback preload complete: ${successCount}/${frames.length} frames loaded`);
        
        if (successCount > 0) {
          setCloudFrames(frames);
          setCurrentFrameIndex(0);
          setFramesReady(true);
          setCloudError(null);
          console.log('✓ Fallback cloud frames ready');
        } else {
          throw new Error('Fallback also failed');
        }
        
        setCloudLoading(false);
      } catch (fallbackError) {
        console.error('========================================');
        console.error('FALLBACK ALSO FAILED:', fallbackError);
        console.error('========================================');
        setCloudError('Unable to load cloud data from any source');
        setCloudLoading(false);
      }
    }
  }, [latitude, longitude, currentZoom, showCloudCover, preloadImage]);

  // Fetch cloud frames when component mounts or location changes
  useEffect(() => {
    if (showCloudCover && !loading && !error) {
      console.log('Triggering cloud frame fetch...');
      fetchCloudFrames();
    }
  }, [showCloudCover, loading, error, latitude, longitude, currentZoom, fetchCloudFrames]);

  // Animation loop for cloud frames
  useEffect(() => {
    // Clear any existing interval
    if (animationIntervalRef.current) {
      clearInterval(animationIntervalRef.current);
      animationIntervalRef.current = null;
    }

    if (!isPlaying || !framesReady || cloudFrames.length === 0) {
      console.log('Animation not starting:', { isPlaying, framesReady, frameCount: cloudFrames.length });
      return;
    }

    console.log('========================================');
    console.log('STARTING CLOUD ANIMATION');
    console.log('========================================');
    console.log('Total frames:', cloudFrames.length);
    
    // Filter to only loaded frames
    const loadedFrames = cloudFrames.filter(f => f.loaded);
    console.log(`${loadedFrames.length} frames are loaded and ready`);

    if (loadedFrames.length === 0) {
      console.error('✗ No loaded frames available for animation');
      return;
    }

    // Animate through frames
    animationIntervalRef.current = setInterval(() => {
      setCurrentFrameIndex((prev) => {
        const next = (prev + 1) % cloudFrames.length;
        const frame = cloudFrames[next];
        if (frame && frame.loaded) {
          console.log(`→ Showing cloud frame ${next + 1}/${cloudFrames.length} at ${frame.time}`);
        } else {
          console.warn(`⚠ Frame ${next + 1} not loaded, skipping`);
        }
        return next;
      });
    }, 700); // 700ms per frame for smooth animation

    return () => {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
        animationIntervalRef.current = null;
      }
    };
  }, [isPlaying, framesReady, cloudFrames]);

  // Get cloud cover description
  const getCloudCoverDescription = (cloudCover: number): string => {
    if (cloudCover === 0) return 'Clear';
    if (cloudCover < 25) return 'Mostly Clear';
    if (cloudCover < 50) return 'Partly Cloudy';
    if (cloudCover < 75) return 'Mostly Cloudy';
    return 'Overcast';
  };

  useEffect(() => {
    setLoading(true);
    setError(false);
    console.log(`Loading satellite imagery for ${circuitName} at ${latitude}, ${longitude}, zoom ${currentZoom}`);
    console.log(`Image URL: ${currentImageUrl}`);
  }, [latitude, longitude, currentZoom, circuitName, currentImageUrl]);

  const handleImageLoad = () => {
    console.log('✓ Satellite imagery loaded successfully');
    setLoading(false);
    setError(false);
    setRetryCount(0);
  };

  const handleImageError = (error: any) => {
    console.error('✗ Failed to load satellite imagery:', error);
    setLoading(false);
    
    // Try alternative source on first error
    if (!useAlternative && retryCount === 0) {
      console.log('Trying alternative imagery source...');
      setUseAlternative(true);
      setRetryCount(1);
      setLoading(true);
      return;
    }
    
    setError(true);
  };

  const handleZoomIn = () => {
    if (currentZoom < 18) {
      setCurrentZoom(prev => prev + 1);
      setError(false);
      setUseAlternative(false);
      setRetryCount(0);
    }
  };

  const handleZoomOut = () => {
    if (currentZoom > 10) {
      setCurrentZoom(prev => prev - 1);
      setError(false);
      setUseAlternative(false);
      setRetryCount(0);
    }
  };

  const handleReset = () => {
    setCurrentZoom(zoom);
    setError(false);
    setUseAlternative(false);
    setRetryCount(0);
    setLoading(true);
  };

  const handleRetry = () => {
    console.log('Retrying satellite imagery load...');
    setError(false);
    setLoading(true);
    setRetryCount(prev => prev + 1);
    
    // Toggle between sources on retry
    setUseAlternative(prev => !prev);
  };

  const toggleCloudCover = () => {
    const newState = !showCloudCover;
    setShowCloudCover(newState);
    console.log('Cloud cover overlay toggled:', newState);
    
    if (newState && cloudFrames.length === 0) {
      // Fetch cloud frames if toggling on and no frames exist
      fetchCloudFrames();
    }
  };

  const togglePlayPause = () => {
    setIsPlaying(prev => {
      const newState = !prev;
      console.log('Cloud animation:', newState ? 'playing' : 'paused');
      return newState;
    });
  };

  const handleRefreshClouds = () => {
    console.log('Refreshing cloud data...');
    setCurrentFrameIndex(0);
    setFramesReady(false);
    setCloudFrames([]);
    fetchCloudFrames();
  };

  // Animated style for cloud opacity with fade transition
  const cloudAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(cloudOpacity.value, {
        duration: 300,
        easing: Easing.inOut(Easing.ease),
      }),
    };
  });

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
    satelliteImage: {
      width: '100%',
      height: '100%',
    },
    cloudOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100%',
      height: '100%',
      zIndex: 2,
    },
    cloudFrameImage: {
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
    errorSubtext: {
      fontSize: 12,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      textAlign: 'center',
      marginBottom: 16,
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
    locationMarkerPulse: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      marginLeft: -20,
      marginTop: -32,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.error,
      opacity: 0.3,
      zIndex: 4,
    },
    coordinatesInfo: {
      backgroundColor: colors.backgroundAlt,
      borderRadius: borderRadius.md,
      padding: 12,
      marginTop: 12,
      borderWidth: 1,
      borderColor: colors.divider,
    },
    coordinatesRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    coordinatesLabel: {
      fontSize: 12,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
    },
    coordinatesValue: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
      fontFamily: 'Roboto_600SemiBold',
    },
    headerControls: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    sourceIndicator: {
      fontSize: 10,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      marginTop: 4,
      textAlign: 'center',
    },
    cloudCoverInfo: {
      backgroundColor: colors.backgroundAlt,
      borderRadius: borderRadius.md,
      padding: 12,
      marginTop: 12,
      borderWidth: 1,
      borderColor: colors.divider,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    cloudCoverLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      flex: 1,
    },
    cloudCoverIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    cloudCoverTextContainer: {
      flex: 1,
    },
    cloudCoverLabel: {
      fontSize: 12,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      marginBottom: 2,
    },
    cloudCoverValue: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Roboto_700Bold',
    },
    cloudCoverDescription: {
      fontSize: 11,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      marginTop: 2,
    },
    toggleButton: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: borderRadius.sm,
      backgroundColor: showCloudCover ? colors.primary : colors.backgroundAlt,
      borderWidth: 1,
      borderColor: showCloudCover ? colors.primary : colors.divider,
    },
    toggleButtonText: {
      fontSize: 11,
      fontWeight: '600',
      color: showCloudCover ? '#fff' : colors.text,
      fontFamily: 'Roboto_600SemiBold',
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
    animationButton: {
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
    animationButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    animationButtonText: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '600',
      fontFamily: 'Roboto_600SemiBold',
    },
    animationButtonTextActive: {
      color: '#fff',
    },
    frameIndicator: {
      fontSize: 12,
      color: colors.textMuted,
      fontFamily: 'Roboto_500Medium',
    },
    cloudLoadingIndicator: {
      position: 'absolute',
      top: 8,
      right: 8,
      backgroundColor: colors.card,
      borderRadius: borderRadius.sm,
      padding: 6,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      zIndex: 6,
      boxShadow: shadows.sm,
    },
    cloudLoadingText: {
      fontSize: 11,
      color: colors.text,
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
    framesReadyIndicator: {
      position: 'absolute',
      top: 8,
      left: 8,
      backgroundColor: colors.success || '#10b981',
      borderRadius: borderRadius.sm,
      padding: 6,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      zIndex: 6,
      boxShadow: shadows.sm,
    },
    framesReadyText: {
      fontSize: 11,
      color: '#fff',
      fontFamily: 'Roboto_600SemiBold',
    },
    cloudErrorIndicator: {
      position: 'absolute',
      top: 8,
      right: 8,
      backgroundColor: colors.error,
      borderRadius: borderRadius.sm,
      padding: 6,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      zIndex: 6,
      boxShadow: shadows.sm,
      maxWidth: '80%',
    },
    cloudErrorText: {
      fontSize: 10,
      color: '#fff',
      fontFamily: 'Roboto_500Medium',
      flexShrink: 1,
    },
  }), [colors, shadows, compact, isDark, showCloudCover]);

  const imageContainerStyle = useMemo(() => ({
    ...styles.imageContainer,
    width: compact ? 280 : width,
    height: compact ? 280 : height,
  }), [styles.imageContainer, compact, width, height]);

  // Get current frame that is loaded
  const currentFrame = useMemo(() => {
    if (cloudFrames.length === 0) return null;
    const frame = cloudFrames[currentFrameIndex];
    return frame && frame.loaded ? frame : null;
  }, [cloudFrames, currentFrameIndex]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Icon name="globe" size={20} color={colors.primary} />
          <Text style={styles.title}>Live Satellite View</Text>
        </View>
        <View style={styles.headerControls}>
          <TouchableOpacity 
            onPress={handleReset}
            activeOpacity={0.7}
          >
            <Icon name="refresh" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={styles.subtitle}>
        Satellite imagery with live cloud cover for {circuitName}
      </Text>

      <View style={imageContainerStyle}>
        {!error ? (
          <>
            <Image
              source={{ uri: currentImageUrl }}
              style={styles.satelliteImage}
              contentFit="cover"
              transition={300}
              onLoad={handleImageLoad}
              onError={handleImageError}
              cachePolicy="memory-disk"
              priority="high"
            />
            
            {/* Animated cloud cover overlay */}
            {!loading && showCloudCover && framesReady && currentFrame && (
              <Animated.View style={[styles.cloudOverlay, cloudAnimatedStyle]}>
                <Image
                  key={`cloud-frame-${currentFrameIndex}-${currentFrame.timestamp}`}
                  source={{ uri: currentFrame.url }}
                  style={styles.cloudFrameImage}
                  contentFit="cover"
                  transition={200}
                  cachePolicy="memory-disk"
                  priority="normal"
                  onLoad={() => {
                    console.log(`✓ Cloud frame ${currentFrameIndex + 1} rendered successfully`);
                  }}
                  onError={(e) => {
                    console.error(`✗ Cloud frame ${currentFrameIndex + 1} failed to render:`, currentFrame.url, e);
                  }}
                />
              </Animated.View>
            )}
            
            {/* Frames ready indicator */}
            {!loading && showCloudCover && framesReady && cloudFrames.length > 0 && !cloudError && (
              <View style={styles.framesReadyIndicator}>
                <Icon name="checkmark-circle" size={14} color="#fff" />
                <Text style={styles.framesReadyText}>
                  Live
                </Text>
              </View>
            )}
            
            {/* Cloud error indicator */}
            {!loading && showCloudCover && cloudError && (
              <View style={styles.cloudErrorIndicator}>
                <Icon name="alert-circle" size={14} color="#fff" />
                <Text style={styles.cloudErrorText} numberOfLines={2}>
                  {cloudError}
                </Text>
              </View>
            )}
            
            {/* Timestamp overlay */}
            {!loading && showCloudCover && framesReady && currentFrame && (
              <View style={styles.timeStamp}>
                <Text style={styles.timeStampText}>
                  {currentFrame.time}
                </Text>
              </View>
            )}
            
            {/* Cloud loading indicator */}
            {cloudLoading && (
              <View style={styles.cloudLoadingIndicator}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.cloudLoadingText}>Loading clouds...</Text>
              </View>
            )}
            
            {/* Location marker */}
            {!loading && (
              <>
                <View style={styles.locationMarkerPulse} />
                <View style={styles.locationMarker} />
              </>
            )}
            
            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Loading satellite imagery...</Text>
                {retryCount > 0 && (
                  <Text style={styles.sourceIndicator}>
                    Trying alternative source...
                  </Text>
                )}
              </View>
            )}
          </>
        ) : (
          <View style={styles.errorContainer}>
            <Icon name="image-outline" size={48} color={colors.error} />
            <Text style={styles.errorText}>Unable to load satellite imagery</Text>
            <Text style={styles.errorSubtext}>
              The imagery service may be temporarily unavailable.{'\n'}
              Try adjusting the zoom level or retry.
            </Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={handleRetry}
              activeOpacity={0.8}
            >
              <Icon name="refresh" size={16} color="#fff" />
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlButton, currentZoom >= 18 && styles.controlButtonDisabled]}
          onPress={handleZoomIn}
          disabled={currentZoom >= 18}
          activeOpacity={0.7}
        >
          <Icon name="add" size={16} color={colors.text} />
          <Text style={styles.controlButtonText}>Zoom In</Text>
        </TouchableOpacity>
        
        <Text style={styles.zoomLevel}>Zoom: {currentZoom}</Text>
        
        <TouchableOpacity
          style={[styles.controlButton, currentZoom <= 10 && styles.controlButtonDisabled]}
          onPress={handleZoomOut}
          disabled={currentZoom <= 10}
          activeOpacity={0.7}
        >
          <Icon name="remove" size={16} color={colors.text} />
          <Text style={styles.controlButtonText}>Zoom Out</Text>
        </TouchableOpacity>
      </View>

      {/* Cloud animation controls */}
      {showCloudCover && framesReady && cloudFrames.length > 0 && (
        <View style={styles.animationControls}>
          <TouchableOpacity
            style={[styles.animationButton, isPlaying && styles.animationButtonActive]}
            onPress={togglePlayPause}
            activeOpacity={0.7}
          >
            <Icon 
              name={isPlaying ? "pause" : "play"} 
              size={16} 
              color={isPlaying ? '#fff' : colors.text} 
            />
            <Text style={[styles.animationButtonText, isPlaying && styles.animationButtonTextActive]}>
              {isPlaying ? 'Pause' : 'Play'}
            </Text>
          </TouchableOpacity>
          
          <Text style={styles.frameIndicator}>
            Frame {currentFrameIndex + 1} / {cloudFrames.length}
          </Text>
          
          <TouchableOpacity
            style={styles.animationButton}
            onPress={handleRefreshClouds}
            activeOpacity={0.7}
          >
            <Icon name="refresh" size={16} color={colors.text} />
            <Text style={styles.animationButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Cloud Cover Information */}
      {!weatherLoading && current && (
        <View style={styles.cloudCoverInfo}>
          <View style={styles.cloudCoverLeft}>
            <View style={styles.cloudCoverIcon}>
              <Icon 
                name={current.cloud_cover > 50 ? "cloud" : current.cloud_cover > 25 ? "partly-sunny" : "sunny"} 
                size={24} 
                color={colors.primary} 
              />
            </View>
            <View style={styles.cloudCoverTextContainer}>
              <Text style={styles.cloudCoverLabel}>Live Cloud Cover</Text>
              <Text style={styles.cloudCoverValue}>{Math.round(current.cloud_cover)}%</Text>
              <Text style={styles.cloudCoverDescription}>
                {getCloudCoverDescription(current.cloud_cover)}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={toggleCloudCover}
            activeOpacity={0.7}
          >
            <Text style={styles.toggleButtonText}>
              {showCloudCover ? 'Hide' : 'Show'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.coordinatesInfo}>
        <View style={styles.coordinatesRow}>
          <Text style={styles.coordinatesLabel}>Latitude</Text>
          <Text style={styles.coordinatesValue}>{latitude.toFixed(6)}°</Text>
        </View>
        <View style={styles.coordinatesRow}>
          <Text style={styles.coordinatesLabel}>Longitude</Text>
          <Text style={styles.coordinatesValue}>{longitude.toFixed(6)}°</Text>
        </View>
        <View style={styles.coordinatesRow}>
          <Text style={styles.coordinatesLabel}>Tile Coordinates</Text>
          <Text style={styles.coordinatesValue}>
            {getTileCoordinates(latitude, longitude, currentZoom).x}, {getTileCoordinates(latitude, longitude, currentZoom).y}
          </Text>
        </View>
      </View>

      <Text style={styles.infoText}>
        {useAlternative ? 'USGS Imagery' : 'Esri World Imagery'} • RainViewer Satellite • Zoom: 10-18
      </Text>
      {showCloudCover && framesReady && cloudFrames.length > 0 && (
        <Text style={styles.infoText}>
          Showing live infrared satellite cloud movement (last {Math.floor(cloudFrames.length * 3)} minutes)
        </Text>
      )}
      {showCloudCover && cloudError && (
        <Text style={[styles.infoText, { color: colors.error }]}>
          {cloudError}
        </Text>
      )}
      {retryCount > 0 && (
        <Text style={styles.sourceIndicator}>
          Using alternative imagery source (attempt {retryCount})
        </Text>
      )}
    </View>
  );
};

export default SatelliteImagery;
