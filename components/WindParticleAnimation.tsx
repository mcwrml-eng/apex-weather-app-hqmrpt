
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import Svg, { Circle, Line, Path, G, Text as SvgText, Defs, RadialGradient, Stop, LinearGradient } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withRepeat,
  Easing,
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useTheme } from '../state/ThemeContext';
import { getColors, borderRadius, getShadows } from '../styles/commonStyles';
import Icon from './Icon';
import { Image } from 'expo-image';

interface WindParticleAnimationProps {
  windSpeed: number; // in km/h or mph
  windDirection: number; // in degrees (0-360)
  width?: number;
  height?: number;
  particleCount?: number;
  particleColor?: string;
  showGrid?: boolean;
  unit?: 'metric' | 'imperial';
  latitude?: number;
  longitude?: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  opacity: number;
  speed: number;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedLine = Animated.createAnimatedComponent(Line);
const AnimatedView = Animated.createAnimatedComponent(View);

const WindParticleAnimation: React.FC<WindParticleAnimationProps> = ({
  windSpeed,
  windDirection,
  width = 320,
  height = 320,
  particleCount = 800, // SIGNIFICANTLY INCREASED from 200 to 800
  particleColor,
  showGrid = true,
  unit = 'metric',
  latitude,
  longitude,
}) => {
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const shadows = getShadows(isDark);
  const [particles, setParticles] = useState<Particle[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const lastUpdateRef = useRef<number>(Date.now());
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);

  // Zoom and pan values
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedScale = useSharedValue(1);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  const focalX = useSharedValue(0);
  const focalY = useSharedValue(0);

  // Track current transform state for particle calculations
  const [currentScale, setCurrentScale] = useState(1);
  const [currentTranslateX, setCurrentTranslateX] = useState(0);
  const [currentTranslateY, setCurrentTranslateY] = useState(0);

  // Map tile configuration
  const [mapZoom, setMapZoom] = useState(10);
  const mapTileSize = 256;

  // Distance scale in kilometers for each ring
  const distanceRings = [5, 10, 20, 30, 40, 50];

  // Calculate pixel offset within tile for precise positioning
  const getPixelOffset = useCallback((lat: number, lon: number, zoom: number) => {
    const scale = Math.pow(2, zoom);
    const worldCoordX = (lon + 180) / 360 * scale;
    const worldCoordY = (1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * scale;
    
    const tileX = Math.floor(worldCoordX);
    const tileY = Math.floor(worldCoordY);
    
    const pixelX = (worldCoordX - tileX) * mapTileSize;
    const pixelY = (worldCoordY - tileY) * mapTileSize;
    
    return { pixelX, pixelY };
  }, [mapTileSize]);

  // Calculate the pixel offset for centering
  const mapOffset = useMemo(() => {
    if (!latitude || !longitude) return { pixelX: 0, pixelY: 0 };
    return getPixelOffset(latitude, longitude, mapZoom);
  }, [latitude, longitude, mapZoom, getPixelOffset]);

  // Calculate the precise marker position on the canvas (this is where the track should be)
  const markerPosition = useMemo(() => {
    if (!latitude || !longitude) {
      return { x: width / 2, y: height / 2 };
    }

    // The marker should always be at the center of the visible area
    // We calculate the offset needed to position the track location at the center
    const centerX = width / 2;
    const centerY = height / 2;
    
    console.log('Marker position calculation:', {
      latitude,
      longitude,
      mapZoom,
      mapOffset,
      centerX,
      centerY,
    });
    
    return { x: centerX, y: centerY };
  }, [latitude, longitude, mapZoom, mapOffset, width, height]);

  // Calculate initial translation to center the map on the track location
  const initialMapTranslation = useMemo(() => {
    if (!latitude || !longitude) {
      return { x: 0, y: 0 };
    }

    // Calculate the offset from the center tile to the exact track position
    const offsetX = mapOffset.pixelX - mapTileSize / 2;
    const offsetY = mapOffset.pixelY - mapTileSize / 2;
    
    console.log('Initial map translation:', {
      offsetX,
      offsetY,
      mapOffset,
    });
    
    return { x: -offsetX, y: -offsetY };
  }, [latitude, longitude, mapOffset, mapTileSize]);

  // Initialize translation values when component mounts or location changes
  useEffect(() => {
    if (latitude && longitude) {
      console.log('Setting initial translation for track location:', initialMapTranslation);
      translateX.value = initialMapTranslation.x;
      translateY.value = initialMapTranslation.y;
      savedTranslateX.value = initialMapTranslation.x;
      savedTranslateY.value = initialMapTranslation.y;
      setCurrentTranslateX(initialMapTranslation.x);
      setCurrentTranslateY(initialMapTranslation.y);
    }
  }, [latitude, longitude, initialMapTranslation, translateX, translateY, savedTranslateX, savedTranslateY]);

  // Calculate visible bounds based on current transform with extended coverage
  const getVisibleBounds = useCallback(() => {
    // Calculate the inverse transform to get world coordinates from screen coordinates
    const invScale = 1 / currentScale;
    
    // Screen corners in world space
    const left = -currentTranslateX * invScale;
    const top = -currentTranslateY * invScale;
    const right = left + width * invScale;
    const bottom = top + height * invScale;
    
    // Add significant padding to ensure particles spawn well outside visible area
    // This creates a "buffer zone" for seamless particle flow
    const paddingMultiplier = 1.5; // 150% padding on all sides
    const paddingX = (right - left) * paddingMultiplier;
    const paddingY = (bottom - top) * paddingMultiplier;
    
    return {
      left: left - paddingX,
      top: top - paddingY,
      right: right + paddingX,
      bottom: bottom + paddingY,
      width: (right - left) + paddingX * 2,
      height: (bottom - top) + paddingY * 2,
    };
  }, [currentScale, currentTranslateX, currentTranslateY, width, height]);

  // Calculate the SVG viewBox based on current transform
  const svgViewBox = useMemo(() => {
    const invScale = 1 / currentScale;
    const viewBoxX = -currentTranslateX * invScale;
    const viewBoxY = -currentTranslateY * invScale;
    const viewBoxWidth = width * invScale;
    const viewBoxHeight = height * invScale;
    
    return `${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`;
  }, [currentScale, currentTranslateX, currentTranslateY, width, height]);

  // Calculate particle velocity based on wind speed and direction
  const calculateVelocity = useCallback((speed: number, direction: number) => {
    // Convert wind direction to radians (wind direction is where wind is coming FROM)
    // So we need to add 180 degrees to get the direction wind is going TO
    const angleRad = ((direction + 180) % 360) * (Math.PI / 180);
    
    // Normalize speed for animation (scale down for visual effect)
    const normalizedSpeed = speed / 40; // Adjusted for better visual flow
    
    return {
      vx: Math.sin(angleRad) * normalizedSpeed,
      vy: -Math.cos(angleRad) * normalizedSpeed,
    };
  }, []);

  // ENHANCED: Get color based on wind speed with MORE VIBRANT and PROMINENT gradient transitions
  const getWindSpeedColor = useCallback((speed: number): string => {
    if (particleColor) return particleColor;
    
    // ENHANCED color gradient with MORE SATURATED and VIBRANT colors
    // Increased opacity from 0.9 to 1.0 for maximum prominence
    if (speed < 5) return 'rgba(100, 200, 255, 1.0)'; // Bright cyan-blue - calm
    if (speed < 10) return 'rgba(50, 180, 255, 1.0)'; // Vivid blue - gentle breeze
    if (speed < 15) return 'rgba(0, 220, 255, 1.0)'; // Electric cyan - light wind
    if (speed < 20) return 'rgba(0, 255, 200, 1.0)'; // Bright turquoise - moderate wind
    if (speed < 25) return 'rgba(100, 255, 100, 1.0)'; // Vivid green - fresh wind
    if (speed < 30) return 'rgba(200, 255, 0, 1.0)'; // Bright yellow-green - strong wind
    if (speed < 35) return 'rgba(255, 240, 0, 1.0)'; // Pure yellow - near gale
    if (speed < 40) return 'rgba(255, 200, 0, 1.0)'; // Bright orange - gale
    if (speed < 50) return 'rgba(255, 150, 0, 1.0)'; // Vivid orange - strong gale
    if (speed < 60) return 'rgba(255, 80, 80, 1.0)'; // Bright red - storm
    return 'rgba(255, 0, 150, 1.0)'; // Hot pink - violent storm
  }, [particleColor]);

  // Get gradient color stops for streamlines with enhanced visibility
  const getStreamlineGradient = useCallback((speed: number) => {
    const baseColor = getWindSpeedColor(speed);
    // Extract RGB values from rgba string
    const match = baseColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!match) return { start: baseColor, end: baseColor };
    
    const [_, r, g, b] = match;
    const startOpacity = 0.8; // Increased from 0.6 for more prominence
    const endOpacity = 0.2; // Increased from 0.1 for better visibility
    
    return {
      start: `rgba(${r}, ${g}, ${b}, ${startOpacity})`,
      end: `rgba(${r}, ${g}, ${b}, ${endOpacity})`,
    };
  }, [getWindSpeedColor]);

  // Initialize particles based on visible bounds
  const initializeParticles = useCallback(() => {
    const bounds = getVisibleBounds();
    const newParticles: Particle[] = [];
    const { vx, vy } = calculateVelocity(windSpeed, windDirection);
    
    console.log('Initializing particles with extended bounds:', bounds, 'Particle count:', particleCount);
    
    for (let i = 0; i < particleCount; i++) {
      const maxLife = 120 + Math.random() * 180; // Longer life for smoother flow
      const speedVariation = 0.7 + Math.random() * 0.6; // More variation
      
      newParticles.push({
        id: i,
        x: bounds.left + Math.random() * bounds.width,
        y: bounds.top + Math.random() * bounds.height,
        vx: vx * speedVariation,
        vy: vy * speedVariation,
        life: Math.random() * maxLife,
        maxLife: maxLife,
        opacity: 0.6 + Math.random() * 0.4, // Increased base opacity from 0.4 to 0.6
        speed: windSpeed * speedVariation,
      });
    }
    
    return newParticles;
  }, [windSpeed, windDirection, particleCount, getVisibleBounds, calculateVelocity]);

  // Update particle positions
  const updateParticles = useCallback(() => {
    const now = Date.now();
    const deltaTime = (now - lastUpdateRef.current) / 16.67; // Normalize to 60fps
    lastUpdateRef.current = now;

    const { vx, vy } = calculateVelocity(windSpeed, windDirection);
    const bounds = getVisibleBounds();
    
    const updatedParticles = particlesRef.current.map(particle => {
      let newX = particle.x + particle.vx * deltaTime;
      let newY = particle.y + particle.vy * deltaTime;
      let newLife = particle.life - deltaTime;
      
      // Reset particle if it goes off extended bounds or life expires
      if (newX < bounds.left || newX > bounds.right || 
          newY < bounds.top || newY > bounds.bottom || 
          newLife <= 0) {
        const maxLife = 120 + Math.random() * 180;
        const speedVariation = 0.7 + Math.random() * 0.6;
        
        return {
          ...particle,
          x: bounds.left + Math.random() * bounds.width,
          y: bounds.top + Math.random() * bounds.height,
          vx: vx * speedVariation,
          vy: vy * speedVariation,
          life: maxLife,
          maxLife: maxLife,
          opacity: 0.6 + Math.random() * 0.4, // Increased base opacity
          speed: windSpeed * speedVariation,
        };
      }
      
      // Update velocity to match current wind with smooth blending
      const velocityBlend = 0.03; // Slower adaptation for smoother flow
      const newVx = particle.vx + (vx - particle.vx) * velocityBlend;
      const newVy = particle.vy + (vy - particle.vy) * velocityBlend;
      
      return {
        ...particle,
        x: newX,
        y: newY,
        vx: newVx,
        vy: newVy,
        life: newLife,
      };
    });
    
    particlesRef.current = updatedParticles;
    setParticles([...updatedParticles]);
  }, [windSpeed, windDirection, calculateVelocity, getVisibleBounds]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      updateParticles();
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [updateParticles]);

  // Initialize particles when component mounts or wind changes significantly
  useEffect(() => {
    const newParticles = initializeParticles();
    particlesRef.current = newParticles;
    setParticles(newParticles);
  }, [initializeParticles]);

  // Reinitialize particles when transform changes significantly
  useEffect(() => {
    console.log('Transform changed - reinitializing particles:', {
      scale: currentScale,
      translateX: currentTranslateX,
      translateY: currentTranslateY,
    });
    
    const newParticles = initializeParticles();
    particlesRef.current = newParticles;
    setParticles(newParticles);
  }, [currentScale, currentTranslateX, currentTranslateY, initializeParticles]);

  // Calculate map tile coordinates from lat/lon
  const getTileCoordinates = useCallback((lat: number, lon: number, zoom: number) => {
    const x = Math.floor((lon + 180) / 360 * Math.pow(2, zoom));
    const y = Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));
    return { x, y };
  }, []);

  // Generate map tile URL (using OpenStreetMap)
  const getMapTileUrl = useCallback((lat: number, lon: number, zoom: number) => {
    const { x, y } = getTileCoordinates(lat, lon, zoom);
    // Using CartoDB Positron (light) or Dark Matter (dark) tiles for better visibility
    const style = isDark ? 'dark_all' : 'light_all';
    return `https://cartodb-basemaps-a.global.ssl.fastly.net/${style}/${zoom}/${x}/${y}.png`;
  }, [getTileCoordinates, isDark]);

  // Map tile URL for the center location
  const mapTileUrl = useMemo(() => {
    if (!latitude || !longitude) return null;
    return getMapTileUrl(latitude, longitude, mapZoom);
  }, [latitude, longitude, mapZoom, getMapTileUrl]);

  // Calculate opacity based on particle life with smooth fade
  const getParticleOpacity = useCallback((particle: Particle): number => {
    const lifeRatio = particle.life / particle.maxLife;
    // Smooth fade in and out
    const fadeIn = Math.min(1, lifeRatio * 3);
    const fadeOut = Math.min(1, (1 - lifeRatio) * 3);
    return particle.opacity * Math.min(fadeIn, fadeOut);
  }, []);

  // Draw wind flow lines (streamlines) with gradient colors
  const streamlines = useMemo(() => {
    if (!showGrid) return [];
    
    const bounds = getVisibleBounds();
    const lines: { x1: number; y1: number; x2: number; y2: number; gradient: { start: string; end: string } }[] = [];
    const { vx, vy } = calculateVelocity(windSpeed, windDirection);
    const gridSpacing = 50 / currentScale; // Adjusted spacing
    const lineLength = 35 / currentScale;
    
    for (let x = bounds.left; x < bounds.right; x += gridSpacing) {
      for (let y = bounds.top; y < bounds.bottom; y += gridSpacing) {
        const magnitude = Math.sqrt(vx * vx + vy * vy);
        if (magnitude > 0.01) {
          const normalizedVx = (vx / magnitude) * lineLength;
          const normalizedVy = (vy / magnitude) * lineLength;
          
          lines.push({
            x1: x,
            y1: y,
            x2: x + normalizedVx,
            y2: y + normalizedVy,
            gradient: getStreamlineGradient(windSpeed),
          });
        }
      }
    }
    
    return lines;
  }, [windSpeed, windDirection, showGrid, calculateVelocity, getVisibleBounds, currentScale, getStreamlineGradient]);

  // Reset zoom and pan
  const handleResetZoom = useCallback(() => {
    console.log('Resetting zoom and pan for wind animation');
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
    translateX.value = withSpring(initialMapTranslation.x, { damping: 15, stiffness: 150 });
    translateY.value = withSpring(initialMapTranslation.y, { damping: 15, stiffness: 150 });
    savedScale.value = 1;
    savedTranslateX.value = initialMapTranslation.x;
    savedTranslateY.value = initialMapTranslation.y;
    setMapZoom(10);
    
    setCurrentScale(1);
    setCurrentTranslateX(initialMapTranslation.x);
    setCurrentTranslateY(initialMapTranslation.y);
  }, [scale, translateX, translateY, savedScale, savedTranslateX, savedTranslateY, initialMapTranslation]);

  // Pinch gesture for zoom with focal point
  const pinchGesture = Gesture.Pinch()
    .onStart((event) => {
      console.log('Wind animation: Pinch gesture started');
      focalX.value = event.focalX;
      focalY.value = event.focalY;
    })
    .onUpdate((event) => {
      const newScale = savedScale.value * event.scale;
      scale.value = Math.max(1, Math.min(5, newScale));
    })
    .onEnd(() => {
      console.log('Wind animation: Pinch gesture end - saving scale');
      savedScale.value = scale.value;
      runOnJS(setCurrentScale)(scale.value);
    });

  // Pan gesture for dragging
  const panGesture = Gesture.Pan()
    .minDistance(5)
    .onStart(() => {
      console.log('Wind animation: Pan gesture started');
    })
    .onUpdate((event) => {
      translateX.value = savedTranslateX.value + event.translationX;
      translateY.value = savedTranslateY.value + event.translationY;
    })
    .onEnd(() => {
      console.log('Wind animation: Pan gesture end - saving position');
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
      runOnJS(setCurrentTranslateX)(translateX.value);
      runOnJS(setCurrentTranslateY)(translateY.value);
    });

  // Combine gestures
  const composedGesture = Gesture.Simultaneous(pinchGesture, panGesture);

  // Animated style for container
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
    };
  });

  const styles = useMemo(() => StyleSheet.create({
    container: {
      width,
      height,
      backgroundColor: colors.backgroundAlt,
      borderRadius: borderRadius.md,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.divider,
    },
    mapWrapper: {
      width,
      height,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    mapTileContainer: {
      position: 'absolute',
      width: mapTileSize * 3,
      height: mapTileSize * 3,
      top: '50%',
      left: '50%',
      marginLeft: -(mapTileSize * 1.5),
      marginTop: -(mapTileSize * 1.5),
    },
    mapTile: {
      width: mapTileSize,
      height: mapTileSize,
      position: 'absolute',
    },
    svgOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      width,
      height,
    },
    loadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: borderRadius.md,
    },
    loadingText: {
      marginTop: 8,
      fontSize: 12,
      color: colors.text,
      fontFamily: 'Roboto_500Medium',
    },
    zoomControls: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
      marginTop: 8,
    },
    zoomButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.divider,
    },
    zoomButtonText: {
      fontSize: 11,
      color: colors.text,
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
    legendContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 8,
      gap: 12,
      flexWrap: 'wrap',
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    legendDot: {
      width: 10, // Increased from 8 to 10 for better visibility
      height: 10,
      borderRadius: 5,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)',
    },
    legendText: {
      fontSize: 10,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      fontWeight: '600', // Made text bolder
    },
  }), [width, height, colors, isDark, mapTileSize]);

  const centerX = width / 2;
  const centerY = height / 2;

  // Generate surrounding tiles for seamless panning
  const mapTiles = useMemo(() => {
    if (!latitude || !longitude || !mapTileUrl) return [];
    
    const { x: centerTileX, y: centerTileY } = getTileCoordinates(latitude, longitude, mapZoom);
    const tiles = [];
    
    // Generate 3x3 grid of tiles centered on location
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const tileX = centerTileX + dx;
        const tileY = centerTileY + dy;
        const style = isDark ? 'dark_all' : 'light_all';
        const url = `https://cartodb-basemaps-a.global.ssl.fastly.net/${style}/${mapZoom}/${tileX}/${tileY}.png`;
        
        tiles.push({
          url,
          x: dx,
          y: dy,
          key: `${tileX}-${tileY}`,
        });
      }
    }
    
    return tiles;
  }, [latitude, longitude, mapZoom, mapTileUrl, getTileCoordinates, isDark]);

  // Wind speed legend data with enhanced colors
  const windSpeedLegend = [
    { speed: 5, label: 'Calm', color: getWindSpeedColor(5) },
    { speed: 15, label: 'Light', color: getWindSpeedColor(15) },
    { speed: 25, label: 'Moderate', color: getWindSpeedColor(25) },
    { speed: 35, label: 'Strong', color: getWindSpeedColor(35) },
    { speed: 50, label: 'Gale', color: getWindSpeedColor(50) },
    { speed: 70, label: 'Storm', color: getWindSpeedColor(70) },
  ];

  return (
    <View>
      <View style={styles.container}>
        <GestureDetector gesture={composedGesture}>
          <AnimatedView style={[styles.mapWrapper, animatedStyle]}>
            {/* Map tiles background */}
            {latitude && longitude && mapTiles.length > 0 && (
              <View style={styles.mapTileContainer}>
                {mapTiles.map((tile) => (
                  <Image
                    key={tile.key}
                    source={{ uri: tile.url }}
                    style={[
                      styles.mapTile,
                      {
                        left: (tile.x + 1) * mapTileSize,
                        top: (tile.y + 1) * mapTileSize,
                      },
                    ]}
                    contentFit="cover"
                    onLoad={() => setMapLoaded(true)}
                    onError={() => {
                      console.log('Map tile failed to load:', tile.url);
                      setMapError(true);
                    }}
                  />
                ))}
              </View>
            )}
            
            {/* SVG overlay for wind visualization */}
            <Svg 
              width={width} 
              height={height}
              viewBox={svgViewBox}
              style={styles.svgOverlay}
              pointerEvents="box-none"
            >
              <Defs>
                {/* Gradient definitions for streamlines */}
                {streamlines.slice(0, 10).map((_, index) => (
                  <LinearGradient
                    key={`gradient-${index}`}
                    id={`streamlineGradient-${index}`}
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <Stop offset="0%" stopColor={getStreamlineGradient(windSpeed).start} />
                    <Stop offset="100%" stopColor={getStreamlineGradient(windSpeed).end} />
                  </LinearGradient>
                ))}
              </Defs>
              
              {/* Semi-transparent overlay for better particle visibility */}
              <Circle
                cx={centerX}
                cy={centerY}
                r={Math.min(width, height) / 2}
                fill={isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)'}
              />
              
              {/* Distance rings */}
              {distanceRings.map((distance, i) => {
                const ringScale = (i + 1) / distanceRings.length;
                const ringRadius = (Math.min(width, height) / 2 - 30) * ringScale;
                const labelX = markerPosition.x + ringRadius * Math.cos(Math.PI / 4);
                const labelY = markerPosition.y + ringRadius * Math.sin(Math.PI / 4);
                
                return (
                  <G key={`ring-${i}`}>
                    <Circle
                      cx={markerPosition.x}
                      cy={markerPosition.y}
                      r={ringRadius}
                      fill="none"
                      stroke={isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'}
                      strokeWidth={1 / currentScale}
                      strokeDasharray={`${3 / currentScale},${3 / currentScale}`}
                      opacity={0.4}
                    />
                    <SvgText
                      x={labelX}
                      y={labelY}
                      fontSize={9 / currentScale}
                      fontWeight="600"
                      fill={isDark ? '#fff' : '#000'}
                      textAnchor="middle"
                      opacity={0.8}
                      stroke={isDark ? '#000' : '#fff'}
                      strokeWidth={2 / currentScale}
                      paintOrder="stroke"
                    >
                      {distance}km
                    </SvgText>
                  </G>
                );
              })}
              
              {/* Draw streamlines with gradient colors - ENHANCED VISIBILITY */}
              {streamlines.map((line, index) => (
                <Line
                  key={`streamline-${index}`}
                  x1={line.x1}
                  y1={line.y1}
                  x2={line.x2}
                  y2={line.y2}
                  stroke={line.gradient.start}
                  strokeWidth={2.5 / currentScale} // Increased from 2 to 2.5
                  strokeLinecap="round"
                  opacity={0.75} // Increased from 0.6 to 0.75
                />
              ))}
              
              {/* Draw particles with ENHANCED color, size, and glow effects */}
              {particles.map((particle) => {
                const opacity = getParticleOpacity(particle);
                const baseRadius = (3.5 + (particle.speed / 60) * 3) / currentScale; // INCREASED from 2.5 to 3.5
                const particleColor = getWindSpeedColor(particle.speed);
                
                return (
                  <G key={`particle-${particle.id}`}>
                    {/* ENHANCED outer glow effect - larger and more visible */}
                    <Circle
                      cx={particle.x}
                      cy={particle.y}
                      r={baseRadius * 3.5} // Increased from 2 to 3.5
                      fill={particleColor}
                      opacity={opacity * 0.35} // Increased from 0.2 to 0.35
                    />
                    {/* ENHANCED middle glow layer */}
                    <Circle
                      cx={particle.x}
                      cy={particle.y}
                      r={baseRadius * 2}
                      fill={particleColor}
                      opacity={opacity * 0.5}
                    />
                    {/* Main particle - LARGER and MORE PROMINENT */}
                    <Circle
                      cx={particle.x}
                      cy={particle.y}
                      r={baseRadius}
                      fill={particleColor}
                      opacity={opacity}
                      stroke={isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.3)'}
                      strokeWidth={0.8 / currentScale} // Increased from 0.5 to 0.8
                    />
                  </G>
                );
              })}
              
              {/* Compass labels */}
              <SvgText 
                x={centerX} 
                y={20 / currentScale} 
                fontSize={14 / currentScale} 
                fontWeight="700" 
                fill={isDark ? '#fff' : '#000'}
                textAnchor="middle"
                stroke={isDark ? '#000' : '#fff'}
                strokeWidth={3 / currentScale}
                paintOrder="stroke"
              >
                N
              </SvgText>
              <SvgText 
                x={width - 20 / currentScale} 
                y={centerY + 5 / currentScale} 
                fontSize={14 / currentScale} 
                fontWeight="700" 
                fill={isDark ? '#fff' : '#000'}
                textAnchor="middle"
                stroke={isDark ? '#000' : '#fff'}
                strokeWidth={3 / currentScale}
                paintOrder="stroke"
              >
                E
              </SvgText>
              <SvgText 
                x={centerX} 
                y={height - 10 / currentScale} 
                fontSize={14 / currentScale} 
                fontWeight="700" 
                fill={isDark ? '#fff' : '#000'}
                textAnchor="middle"
                stroke={isDark ? '#000' : '#fff'}
                strokeWidth={3 / currentScale}
                paintOrder="stroke"
              >
                S
              </SvgText>
              <SvgText 
                x={20 / currentScale} 
                y={centerY + 5 / currentScale} 
                fontSize={14 / currentScale} 
                fontWeight="700" 
                fill={isDark ? '#fff' : '#000'}
                textAnchor="middle"
                stroke={isDark ? '#000' : '#fff'}
                strokeWidth={3 / currentScale}
                paintOrder="stroke"
              >
                W
              </SvgText>
              
              {/* Center marker (circuit location) - Always at screen center */}
              <Circle
                cx={markerPosition.x}
                cy={markerPosition.y}
                r={8 / currentScale}
                fill={colors.primary}
                stroke="#fff"
                strokeWidth={3 / currentScale}
                opacity={0.9}
              />
              <Circle
                cx={markerPosition.x}
                cy={markerPosition.y}
                r={4 / currentScale}
                fill="#fff"
              />
              
              {/* Crosshair for precise positioning */}
              <Line
                x1={markerPosition.x - 12 / currentScale}
                y1={markerPosition.y}
                x2={markerPosition.x - 4 / currentScale}
                y2={markerPosition.y}
                stroke="#fff"
                strokeWidth={2 / currentScale}
              />
              <Line
                x1={markerPosition.x + 4 / currentScale}
                y1={markerPosition.y}
                x2={markerPosition.x + 12 / currentScale}
                y2={markerPosition.y}
                stroke="#fff"
                strokeWidth={2 / currentScale}
              />
              <Line
                x1={markerPosition.x}
                y1={markerPosition.y - 12 / currentScale}
                x2={markerPosition.x}
                y2={markerPosition.y - 4 / currentScale}
                stroke="#fff"
                strokeWidth={2 / currentScale}
              />
              <Line
                x1={markerPosition.x}
                y1={markerPosition.y + 4 / currentScale}
                x2={markerPosition.x}
                y2={markerPosition.y + 12 / currentScale}
                stroke="#fff"
                strokeWidth={2 / currentScale}
              />
            </Svg>
            
            {/* Loading overlay */}
            {!mapLoaded && !mapError && latitude && longitude && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Loading map...</Text>
              </View>
            )}
          </AnimatedView>
        </GestureDetector>
      </View>
      
      {/* Wind speed color legend - ENHANCED with better visibility */}
      <View style={styles.legendContainer}>
        {windSpeedLegend.map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: item.color }]} />
            <Text style={styles.legendText}>{item.label}</Text>
          </View>
        ))}
      </View>
      
      {/* Zoom controls */}
      <View style={styles.zoomControls}>
        <TouchableOpacity
          style={styles.zoomButton}
          onPress={() => setMapZoom(prev => Math.max(8, prev - 1))}
          activeOpacity={0.7}
        >
          <Icon name="remove" size={16} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.zoomButton}
          onPress={handleResetZoom}
          activeOpacity={0.7}
        >
          <Icon name="contract" size={16} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.zoomButton}
          onPress={() => setMapZoom(prev => Math.min(14, prev + 1))}
          activeOpacity={0.7}
        >
          <Icon name="add" size={16} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.zoomButtonText}>
          Pinch to zoom • Drag to pan
        </Text>
      </View>
      
      <Text style={styles.infoText}>
        {latitude && longitude 
          ? `Centered on track location • ${windSpeed.toFixed(1)} ${unit === 'metric' ? 'km/h' : 'mph'} from ${windDirection}° • Particles: ${particleCount} • Scale: ${currentScale.toFixed(2)}x`
          : `Global wind flow visualization • ${windSpeed.toFixed(1)} ${unit === 'metric' ? 'km/h' : 'mph'} from ${windDirection}°`
        }
      </Text>
      
      {mapError && (
        <Text style={[styles.infoText, { color: colors.error, marginTop: 4 }]}>
          Map tiles failed to load. Showing visualization only.
        </Text>
      )}
    </View>
  );
};

export default WindParticleAnimation;
