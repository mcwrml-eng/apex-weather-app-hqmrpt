
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withRepeat,
  Easing,
  cancelAnimation,
  runOnJS,
} from 'react-native-reanimated';
import { useTheme } from '../state/ThemeContext';
import { getColors } from '../styles/commonStyles';

interface WindParticleAnimationProps {
  windSpeed: number; // in km/h or mph
  windDirection: number; // in degrees (0-360)
  width?: number;
  height?: number;
  particleCount?: number;
  particleColor?: string;
  showGrid?: boolean;
  unit?: 'metric' | 'imperial';
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

const WindParticleAnimation: React.FC<WindParticleAnimationProps> = ({
  windSpeed,
  windDirection,
  width = 320,
  height = 320,
  particleCount = 150,
  particleColor,
  showGrid = true,
  unit = 'metric',
}) => {
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const [particles, setParticles] = useState<Particle[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const lastUpdateRef = useRef<number>(Date.now());

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

  const styles = useMemo(() => StyleSheet.create({
    container: {
      width,
      height,
      backgroundColor: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)',
      borderRadius: 8,
      overflow: 'hidden',
    },
  }), [width, height, isDark]);

  return (
    <View style={styles.container}>
      <Svg width={width} height={height}>
        {/* Draw streamlines */}
        {streamlines.map((line, index) => (
          <Line
            key={`streamline-${index}`}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke={isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
            strokeWidth="1"
            strokeDasharray="2,2"
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
      </Svg>
    </View>
  );
};

export default WindParticleAnimation;
