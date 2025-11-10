
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import Svg, { Circle, Line, Path, G, Text as SvgText, Defs, RadialGradient, Stop } from 'react-native-svg';
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
  particleCount = 150,
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

  // Zoom and pan values
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedScale = useSharedValue(1);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  const focalX = useSharedValue(0);
  const focalY = useSharedValue(0);

  // Distance scale in kilometers for each ring
  const distanceRings = [5, 10, 20, 30, 40, 50];

  // Calculate particle velocity based on wind speed and direction
  const calculateVelocity = useCallback((speed: number, direction: number) => {
    // Convert wind direction to radians (wind direction is where wind is coming FROM)
    // So we need to add 180 degrees to get the direction wind is going TO
    const angleRad = ((direction + 180) % 360) * (Math.PI / 180);
    
    // Normalize speed for animation (scale down for visual effect)
    const normalizedSpeed = speed / 50; // Adjust divisor for desired animation speed
    
    return {
      vx: Math.sin(angleRad) * normalizedSpeed,
      vy: -Math.cos(angleRad) * normalizedSpeed,
    };
  }, []);

  // Initialize particles
  const initializeParticles = useCallback(() => {
    const newParticles: Particle[] = [];
    const { vx, vy } = calculateVelocity(windSpeed, windDirection);
    
    for (let i = 0; i < particleCount; i++) {
      const maxLife = 100 + Math.random() * 100;
      newParticles.push({
        id: i,
        x: Math.random() * width,
        y: Math.random() * height,
        vx: vx * (0.8 + Math.random() * 0.4), // Add some variation
        vy: vy * (0.8 + Math.random() * 0.4),
        life: Math.random() * maxLife,
        maxLife: maxLife,
        opacity: Math.random() * 0.5 + 0.3,
        speed: windSpeed,
      });
    }
    
    return newParticles;
  }, [windSpeed, windDirection, particleCount, width, height, calculateVelocity]);

  // Update particle positions
  const updateParticles = useCallback(() => {
    const now = Date.now();
    const deltaTime = (now - lastUpdateRef.current) / 16.67; // Normalize to 60fps
    lastUpdateRef.current = now;

    const { vx, vy } = calculateVelocity(windSpeed, windDirection);
    
    const updatedParticles = particlesRef.current.map(particle => {
      let newX = particle.x + particle.vx * deltaTime;
      let newY = particle.y + particle.vy * deltaTime;
      let newLife = particle.life - deltaTime;
      
      // Reset particle if it goes off screen or life expires
      if (newX < -10 || newX > width + 10 || newY < -10 || newY > height + 10 || newLife <= 0) {
        const maxLife = 100 + Math.random() * 100;
        return {
          ...particle,
          x: Math.random() * width,
          y: Math.random() * height,
          vx: vx * (0.8 + Math.random() * 0.4),
          vy: vy * (0.8 + Math.random() * 0.4),
          life: maxLife,
          maxLife: maxLife,
          opacity: Math.random() * 0.5 + 0.3,
        };
      }
      
      // Update velocity to match current wind
      const velocityBlend = 0.05; // How quickly particles adapt to wind changes
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
  }, [windSpeed, windDirection, width, height, calculateVelocity]);

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

  // Calculate particle color based on wind speed
  const getParticleColor = useCallback((speed: number): string => {
    if (particleColor) return particleColor;
    
    // Color gradient based on wind speed
    if (speed < 10) return isDark ? 'rgba(100, 200, 255, 0.6)' : 'rgba(50, 150, 255, 0.6)';
    if (speed < 20) return isDark ? 'rgba(100, 255, 200, 0.6)' : 'rgba(50, 200, 150, 0.6)';
    if (speed < 30) return isDark ? 'rgba(255, 255, 100, 0.6)' : 'rgba(200, 200, 50, 0.6)';
    if (speed < 40) return isDark ? 'rgba(255, 200, 100, 0.6)' : 'rgba(255, 150, 50, 0.6)';
    return isDark ? 'rgba(255, 100, 100, 0.6)' : 'rgba(255, 50, 50, 0.6)';
  }, [particleColor, isDark]);

  const particleColorValue = getParticleColor(windSpeed);

  // Calculate opacity based on particle life
  const getParticleOpacity = useCallback((particle: Particle): number => {
    const lifeRatio = particle.life / particle.maxLife;
    return particle.opacity * lifeRatio;
  }, []);

  // Draw wind flow lines (streamlines)
  const streamlines = useMemo(() => {
    if (!showGrid) return [];
    
    const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
    const { vx, vy } = calculateVelocity(windSpeed, windDirection);
    const gridSpacing = 40;
    const lineLength = 30;
    
    for (let x = gridSpacing; x < width; x += gridSpacing) {
      for (let y = gridSpacing; y < height; y += gridSpacing) {
        const magnitude = Math.sqrt(vx * vx + vy * vy);
        if (magnitude > 0.01) {
          const normalizedVx = (vx / magnitude) * lineLength;
          const normalizedVy = (vy / magnitude) * lineLength;
          
          lines.push({
            x1: x,
            y1: y,
            x2: x + normalizedVx,
            y2: y + normalizedVy,
          });
        }
      }
    }
    
    return lines;
  }, [windSpeed, windDirection, width, height, showGrid, calculateVelocity]);

  // Reset zoom and pan
  const handleResetZoom = useCallback(() => {
    console.log('Resetting zoom and pan for wind animation');
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
    translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
    translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
    savedScale.value = 1;
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  }, [scale, translateX, translateY, savedScale, savedTranslateX, savedTranslateY]);

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
      console.log('Wind animation: Pinch gesture update - scale:', scale.value);
    })
    .onEnd(() => {
      console.log('Wind animation: Pinch gesture end - saving scale');
      savedScale.value = scale.value;
    });

  // Pan gesture for dragging
  const panGesture = Gesture.Pan()
    .minDistance(5)
    .onStart(() => {
      console.log('Wind animation: Pan gesture started');
    })
    .onUpdate((event) => {
      console.log('Wind animation: Pan gesture update - translationX:', event.translationX, 'translationY:', event.translationY);
      translateX.value = savedTranslateX.value + event.translationX;
      translateY.value = savedTranslateY.value + event.translationY;
    })
    .onEnd(() => {
      console.log('Wind animation: Pan gesture end - saving position - translateX:', translateX.value, 'translateY:', translateY.value);
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  // Combine gestures - simultaneous allows both to work together
  const composedGesture = Gesture.Simultaneous(pinchGesture, panGesture);

  // Animated style for container with proper transform order
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
  }), [width, height, colors, isDark]);

  const centerX = width / 2;
  const centerY = height / 2;
  const maxRadius = Math.min(width, height) / 2 - 30;

  return (
    <View>
      <View style={styles.container}>
        <GestureDetector gesture={composedGesture}>
          <AnimatedView style={[styles.mapWrapper, animatedStyle]}>
            <Svg 
              width={width} 
              height={height}
              viewBox={`0 0 ${width} ${height}`}
              pointerEvents="box-none"
            >
              <Defs>
                <RadialGradient id="windMapBg" cx="50%" cy="50%">
                  <Stop offset="0%" stopColor={isDark ? '#1a1a1a' : '#f5f5f5'} stopOpacity="1" />
                  <Stop offset="100%" stopColor={isDark ? '#0a0a0a' : '#e0e0e0'} stopOpacity="1" />
                </RadialGradient>
              </Defs>
              
              {/* Background circle */}
              <Circle
                cx={centerX}
                cy={centerY}
                r={maxRadius}
                fill="url(#windMapBg)"
                stroke={colors.divider}
                strokeWidth="2"
              />
              
              {/* Distance rings */}
              {distanceRings.map((distance, i) => {
                const ringScale = (i + 1) / distanceRings.length;
                const ringRadius = maxRadius * ringScale;
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
              
              {/* Crosshairs */}
              <Line 
                x1={centerX} 
                y1={30} 
                x2={centerX} 
                y2={height - 30} 
                stroke={colors.divider} 
                strokeWidth="1" 
                opacity={0.2} 
              />
              <Line 
                x1={30} 
                y1={centerY} 
                x2={width - 30} 
                y2={centerY} 
                stroke={colors.divider} 
                strokeWidth="1" 
                opacity={0.2} 
              />
              <Line 
                x1={centerX - maxRadius * 0.7} 
                y1={centerY - maxRadius * 0.7} 
                x2={centerX + maxRadius * 0.7} 
                y2={centerY + maxRadius * 0.7} 
                stroke={colors.divider} 
                strokeWidth="1" 
                opacity={0.15} 
              />
              <Line 
                x1={centerX - maxRadius * 0.7} 
                y1={centerY + maxRadius * 0.7} 
                x2={centerX + maxRadius * 0.7} 
                y2={centerY - maxRadius * 0.7} 
                stroke={colors.divider} 
                strokeWidth="1" 
                opacity={0.15} 
              />
              
              {/* Draw streamlines */}
              {streamlines.map((line, index) => (
                <Line
                  key={`streamline-${index}`}
                  x1={line.x1}
                  y1={line.y1}
                  x2={line.x2}
                  y2={line.y2}
                  stroke={isDark ? 'rgba(100, 150, 255, 0.2)' : 'rgba(50, 100, 200, 0.2)'}
                  strokeWidth="2"
                  strokeDasharray="4,4"
                />
              ))}
              
              {/* Draw particles */}
              {particles.map((particle) => {
                const opacity = getParticleOpacity(particle);
                const radius = 1.5 + (windSpeed / 50) * 1.5; // Larger particles for stronger winds
                
                return (
                  <Circle
                    key={`particle-${particle.id}`}
                    cx={particle.x}
                    cy={particle.y}
                    r={radius}
                    fill={particleColorValue}
                    opacity={opacity}
                  />
                );
              })}
              
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
                x={width - 18} 
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
                y={height - 8} 
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
              
              {/* Center marker */}
              <Circle
                cx={centerX}
                cy={centerY}
                r={4}
                fill={colors.primary}
                stroke="#fff"
                strokeWidth="2"
              />
            </Svg>
          </AnimatedView>
        </GestureDetector>
      </View>
      
      {/* Zoom controls */}
      <View style={styles.zoomControls}>
        <TouchableOpacity
          style={styles.zoomButton}
          onPress={handleResetZoom}
          activeOpacity={0.7}
        >
          <Icon name="contract" size={16} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.zoomButtonText}>
          Pinch to zoom • Drag to pan
        </Text>
      </View>
      
      <Text style={styles.infoText}>
        {latitude && longitude 
          ? `Wind flow visualization at Lat: ${latitude.toFixed(4)}°, Lon: ${longitude.toFixed(4)}° • Distance rings: ${distanceRings.join('km, ')}km`
          : `Wind flow visualization • Distance rings: ${distanceRings.join('km, ')}km`
        }
      </Text>
    </View>
  );
};

export default WindParticleAnimation;
