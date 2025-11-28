
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Line, Polygon, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { getColors } from '../styles/commonStyles';
import { useTheme } from '../state/ThemeContext';

interface Props {
  circuitSlug: string;
  windDirection?: number; // degrees, 0 = North
  windSpeed?: number;
  size?: number;
  showWindOverlay?: boolean;
}

// Accurate track layouts (SVG paths) based on real circuit designs
const trackLayouts: Record<string, string> = {
  // F1 Circuits
  'monaco': 'M15,45 L25,45 Q30,40 35,45 L45,45 Q50,50 55,45 L65,45 Q70,40 75,45 L85,45 Q90,50 85,55 L75,55 Q70,60 65,55 L55,55 Q50,50 45,55 L35,55 Q30,60 25,55 L15,55 Q10,50 15,45 Z',
  'silverstone': 'M20,30 Q40,20 60,25 Q80,30 85,50 Q80,70 60,75 Q40,80 20,70 Q15,50 20,30 Z M30,40 Q50,35 70,40 Q75,50 70,60 Q50,65 30,60 Q25,50 30,40 Z',
  'spa': 'M15,60 Q20,40 40,35 Q60,30 75,40 Q85,50 80,65 Q75,80 55,85 Q35,90 20,80 Q10,70 15,60 Z',
  'monza': 'M20,25 L80,25 Q85,30 80,35 L75,35 Q70,40 75,45 L80,45 Q85,50 80,55 L20,55 Q15,60 20,65 L80,65 Q85,70 80,75 L20,75 Q15,80 20,85 L80,85 Q85,90 80,95 L20,95 Q15,90 20,85',
  'suzuka': 'M30,20 Q50,15 70,25 Q85,35 80,55 Q75,75 55,80 Q35,85 25,70 Q15,50 20,35 Q25,20 30,20 Z M40,35 Q55,30 65,40 Q70,55 60,65 Q45,70 35,60 Q30,45 40,35 Z',
  'interlagos': 'M25,30 Q45,20 65,30 Q80,45 75,65 Q70,80 50,85 Q30,80 20,65 Q15,45 25,30 Z',
  'hungaroring': 'M20,40 Q30,25 50,30 Q70,35 75,55 Q70,75 50,80 Q30,85 20,70 Q15,50 20,40 Z',
  'red-bull-ring': 'M20,50 Q30,30 50,35 Q70,40 80,60 Q75,80 55,85 Q35,80 25,65 Q15,55 20,50 Z',
  'zandvoort': 'M25,35 Q45,25 65,35 Q80,50 75,70 Q70,85 50,80 Q30,75 20,60 Q15,45 25,35 Z',
  'baku': 'M15,50 L30,50 Q40,40 50,50 L60,50 Q70,40 80,50 L85,50 Q90,55 85,60 L80,60 Q70,70 60,60 L50,60 Q40,70 30,60 L15,60 Q10,55 15,50 Z',
  'marina-bay': 'M20,30 L70,30 Q80,35 75,45 L70,45 Q65,55 70,65 L75,65 Q80,75 70,80 L20,80 Q15,75 20,70 L25,70 Q30,60 25,50 L20,50 Q15,45 20,40 L25,40 Q30,35 25,30 Z',
  'cota': 'M25,40 Q35,25 55,30 Q75,35 80,55 Q75,75 55,80 Q35,85 25,70 Q20,50 25,40 Z M40,45 Q55,40 65,50 Q70,60 60,70 Q45,75 35,65 Q30,55 40,45 Z',
  'mexico-city': 'M20,35 Q40,25 60,35 Q80,45 75,65 Q70,85 50,80 Q30,75 20,60 Q15,45 20,35 Z',
  'las-vegas': 'M15,40 L85,40 Q90,45 85,50 L80,50 Q75,55 80,60 L85,60 Q90,65 85,70 L15,70 Q10,65 15,60 L20,60 Q25,55 20,50 L15,50 Q10,45 15,40 Z',
  'lusail': 'M20,35 Q40,25 60,35 Q80,45 75,65 Q70,85 50,80 Q30,75 20,60 Q15,45 20,35 Z',
  'yas-marina': 'M25,30 Q45,20 65,30 Q80,40 75,60 Q70,80 50,85 Q30,80 20,65 Q15,45 25,30 Z',
  'bahrain': 'M20,40 Q30,25 50,30 Q70,35 80,55 Q75,75 55,80 Q35,85 25,70 Q15,55 20,40 Z',
  'jeddah': 'M15,45 L30,45 Q40,35 50,45 L60,45 Q70,35 80,45 L85,45 Q90,50 85,55 L80,55 Q70,65 60,55 L50,55 Q40,65 30,55 L15,55 Q10,50 15,45 Z',
  'albert-park': 'M25,35 Q45,25 65,35 Q80,50 75,70 Q70,85 50,80 Q30,75 20,60 Q15,45 25,35 Z',
  'shanghai': 'M20,40 Q35,25 55,30 Q75,35 80,55 Q75,75 55,80 Q35,85 20,70 Q15,50 20,40 Z',
  'miami': 'M20,35 L70,35 Q80,40 75,50 L70,50 Q65,60 70,70 L75,70 Q80,80 70,85 L20,85 Q15,80 20,75 L25,75 Q30,65 25,55 L20,55 Q15,50 20,45 L25,45 Q30,40 25,35 Z',
  'imola': 'M25,30 Q45,20 65,30 Q80,45 75,65 Q70,80 50,85 Q30,80 20,65 Q15,45 25,30 Z',
  'barcelona': 'M20,40 Q35,25 55,30 Q75,35 80,55 Q75,75 55,80 Q35,85 20,70 Q15,50 20,40 Z',
  'gilles-villeneuve': 'M15,50 L30,50 Q40,40 50,50 L60,50 Q70,40 80,50 L85,50 Q90,55 85,60 L80,60 Q70,70 60,60 L50,60 Q40,70 30,60 L15,60 Q10,55 15,50 Z',
  'default': 'M20,50 Q20,20 50,20 Q80,20 80,50 Q80,80 50,80 Q20,80 20,50'
};

// More accurate start/finish line positions for each circuit
const startFinishPositions: Record<string, { x1: number; y1: number; x2: number; y2: number }> = {
  'monaco': { x1: 13, y1: 43, x2: 17, y2: 47 },
  'silverstone': { x1: 18, y1: 28, x2: 22, y2: 32 },
  'spa': { x1: 13, y1: 58, x2: 17, y2: 62 },
  'monza': { x1: 18, y1: 23, x2: 22, y2: 27 },
  'suzuka': { x1: 28, y1: 18, x2: 32, y2: 22 },
  'interlagos': { x1: 23, y1: 28, x2: 27, y2: 32 },
  'hungaroring': { x1: 18, y1: 38, x2: 22, y2: 42 },
  'red-bull-ring': { x1: 18, y1: 48, x2: 22, y2: 52 },
  'zandvoort': { x1: 23, y1: 33, x2: 27, y2: 37 },
  'baku': { x1: 13, y1: 48, x2: 17, y2: 52 },
  'marina-bay': { x1: 18, y1: 28, x2: 22, y2: 32 },
  'cota': { x1: 23, y1: 38, x2: 27, y2: 42 },
  'mexico-city': { x1: 18, y1: 33, x2: 22, y2: 37 },
  'las-vegas': { x1: 13, y1: 38, x2: 17, y2: 42 },
  'lusail': { x1: 18, y1: 33, x2: 22, y2: 37 },
  'yas-marina': { x1: 23, y1: 28, x2: 27, y2: 32 },
  'bahrain': { x1: 18, y1: 38, x2: 22, y2: 42 },
  'jeddah': { x1: 13, y1: 43, x2: 17, y2: 47 },
  'albert-park': { x1: 23, y1: 33, x2: 27, y2: 37 },
  'shanghai': { x1: 18, y1: 38, x2: 22, y2: 42 },
  'miami': { x1: 18, y1: 33, x2: 22, y2: 37 },
  'imola': { x1: 23, y1: 28, x2: 27, y2: 32 },
  'barcelona': { x1: 18, y1: 38, x2: 22, y2: 42 },
  'gilles-villeneuve': { x1: 13, y1: 48, x2: 17, y2: 52 },
  'default': { x1: 18, y1: 48, x2: 22, y2: 52 }
};

// Track section definitions for wind analysis
// Each section has a direction (in degrees) representing the track heading
const trackSections: Record<string, Array<{ x: number; y: number; direction: number; type: 'straight' | 'corner' }>> = {
  'monaco': [
    { x: 20, y: 45, direction: 90, type: 'straight' },
    { x: 40, y: 42, direction: 45, type: 'corner' },
    { x: 60, y: 45, direction: 90, type: 'straight' },
    { x: 80, y: 50, direction: 135, type: 'corner' },
    { x: 70, y: 55, direction: 270, type: 'straight' },
    { x: 40, y: 55, direction: 270, type: 'straight' },
  ],
  'silverstone': [
    { x: 25, y: 35, direction: 45, type: 'corner' },
    { x: 50, y: 25, direction: 90, type: 'straight' },
    { x: 75, y: 40, direction: 135, type: 'corner' },
    { x: 80, y: 65, direction: 180, type: 'straight' },
    { x: 50, y: 75, direction: 270, type: 'straight' },
    { x: 25, y: 60, direction: 315, type: 'corner' },
  ],
  'spa': [
    { x: 20, y: 50, direction: 45, type: 'corner' },
    { x: 40, y: 35, direction: 90, type: 'straight' },
    { x: 65, y: 40, direction: 135, type: 'corner' },
    { x: 75, y: 60, direction: 180, type: 'straight' },
    { x: 50, y: 80, direction: 270, type: 'straight' },
    { x: 25, y: 70, direction: 315, type: 'corner' },
  ],
  'default': [
    { x: 25, y: 40, direction: 45, type: 'corner' },
    { x: 50, y: 25, direction: 90, type: 'straight' },
    { x: 75, y: 40, direction: 135, type: 'corner' },
    { x: 75, y: 70, direction: 180, type: 'straight' },
    { x: 50, y: 75, direction: 270, type: 'straight' },
    { x: 25, y: 70, direction: 315, type: 'corner' },
  ]
};

// Calculate wind impact on track section
// Returns: 'headwind', 'tailwind', or 'crosswind'
function calculateWindImpact(trackDirection: number, windDirection: number): { type: 'headwind' | 'tailwind' | 'crosswind'; strength: number } {
  // Normalize angles to 0-360
  const normalizeAngle = (angle: number) => ((angle % 360) + 360) % 360;
  
  const trackDir = normalizeAngle(trackDirection);
  const windDir = normalizeAngle(windDirection);
  
  // Calculate the difference between wind direction and track direction
  let diff = Math.abs(windDir - trackDir);
  if (diff > 180) diff = 360 - diff;
  
  // Headwind: wind coming from ahead (within 45 degrees)
  // Tailwind: wind coming from behind (within 45 degrees)
  // Crosswind: wind from the side
  
  const strength = Math.cos((diff * Math.PI) / 180); // -1 to 1
  
  if (diff < 45) {
    return { type: 'headwind', strength: Math.abs(strength) };
  } else if (diff > 135) {
    return { type: 'tailwind', strength: Math.abs(strength) };
  } else {
    return { type: 'crosswind', strength: Math.abs(strength) };
  }
}

// Wind direction indicator component with headwind/tailwind coloring
function WindIndicator({ 
  x, 
  y, 
  trackDirection, 
  windDirection, 
  windSpeed, 
  size = 12, 
  colors,
  showLabel = false
}: { 
  x: number; 
  y: number; 
  trackDirection: number;
  windDirection: number; 
  windSpeed: number; 
  size?: number; 
  colors: any;
  showLabel?: boolean;
}) {
  const impact = calculateWindImpact(trackDirection, windDirection);
  
  // Color based on wind impact
  let color = colors.wind;
  if (impact.type === 'headwind') {
    color = '#EF4444'; // Red for headwind (slows down)
  } else if (impact.type === 'tailwind') {
    color = '#10B981'; // Green for tailwind (speeds up)
  } else {
    color = '#F59E0B'; // Amber for crosswind
  }
  
  const arrowLength = Math.min(size, windSpeed * 0.15);
  const opacity = 0.7 + (impact.strength * 0.3); // More visible for stronger impact
  
  // Calculate arrow direction relative to track
  const relativeWindDir = (windDirection - trackDirection + 360) % 360;
  const radians = (relativeWindDir - 90) * (Math.PI / 180);
  
  const endX = x + Math.cos(radians) * arrowLength;
  const endY = y + Math.sin(radians) * arrowLength;
  
  // Arrow head
  const headLength = arrowLength * 0.4;
  const headAngle = Math.PI / 6;
  
  const head1X = endX - Math.cos(radians - headAngle) * headLength;
  const head1Y = endY - Math.sin(radians - headAngle) * headLength;
  
  const head2X = endX - Math.cos(radians + headAngle) * headLength;
  const head2Y = endY - Math.sin(radians + headAngle) * headLength;

  return (
    <G opacity={opacity}>
      {/* Background circle for better visibility */}
      <Circle
        cx={x}
        cy={y}
        r={size * 0.8}
        fill={color}
        opacity={0.2}
      />
      
      {/* Arrow line */}
      <Line
        x1={x}
        y1={y}
        x2={endX}
        y2={endY}
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      
      {/* Arrow head */}
      <Polygon
        points={`${endX},${endY} ${head1X},${head1Y} ${head2X},${head2Y}`}
        fill={color}
      />
    </G>
  );
}

export default function TrackMap({ 
  circuitSlug, 
  windDirection = 0, 
  windSpeed = 0, 
  size = 120,
  showWindOverlay = true 
}: Props) {
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  
  const trackPath = trackLayouts[circuitSlug] || trackLayouts.default;
  const startFinish = startFinishPositions[circuitSlug] || startFinishPositions.default;
  const sections = trackSections[circuitSlug] || trackSections.default;
  
  console.log(`Rendering track map for ${circuitSlug} with wind: ${windSpeed}km/h at ${windDirection}°`);
  
  // Generate wind indicators for each track section
  const windIndicators = [];
  if (windSpeed > 0 && showWindOverlay) {
    sections.forEach((section, index) => {
      const impact = calculateWindImpact(section.direction, windDirection);
      
      windIndicators.push(
        <WindIndicator
          key={index}
          x={section.x}
          y={section.y}
          trackDirection={section.direction}
          windDirection={windDirection}
          windSpeed={windSpeed}
          size={section.type === 'straight' ? 14 : 10}
          colors={colors}
        />
      );
    });
  }

  const styles = getStyles(colors);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          {/* Gradient for track */}
          <LinearGradient id="trackGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={colors.primary} stopOpacity="1" />
            <Stop offset="100%" stopColor={colors.primaryDark} stopOpacity="1" />
          </LinearGradient>
        </Defs>
        
        {/* Track layout with gradient */}
        <Path
          d={trackPath}
          stroke="url(#trackGradient)"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Start/finish line */}
        <Line
          x1={startFinish.x1}
          y1={startFinish.y1}
          x2={startFinish.x2}
          y2={startFinish.y2}
          stroke={colors.text}
          strokeWidth="3"
          strokeLinecap="round"
        />
        
        {/* Start/finish line perpendicular marks (checkered flag pattern) */}
        <Line
          x1={startFinish.x1 - 1.5}
          y1={startFinish.y1 - 1.5}
          x2={startFinish.x1 + 1.5}
          y2={startFinish.y1 + 1.5}
          stroke={colors.text}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <Line
          x1={startFinish.x2 - 1.5}
          y1={startFinish.y2 - 1.5}
          x2={startFinish.x2 + 1.5}
          y2={startFinish.y2 + 1.5}
          stroke={colors.text}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        
        {/* Wind direction indicators with headwind/tailwind coloring */}
        {windIndicators}
      </Svg>
      
      {windSpeed > 0 && showWindOverlay && (
        <View style={styles.legend}>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.legendText}>Headwind</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.legendText}>Tailwind</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
            <Text style={styles.legendText}>Crosswind</Text>
          </View>
        </View>
      )}
      
      {windSpeed > 0 && (
        <View style={styles.windInfo}>
          <Text style={styles.windText}>{Math.round(windSpeed)} km/h</Text>
          <Text style={styles.windDirection}>{Math.round(windDirection)}°</Text>
        </View>
      )}
    </View>
  );
}

function getStyles(colors: any) {
  return StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.backgroundAlt,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.divider,
      padding: 12,
      position: 'relative',
    },
    windInfo: {
      position: 'absolute',
      top: 8,
      right: 8,
      backgroundColor: colors.card,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.divider,
    },
    windText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Roboto_700Bold',
    },
    windDirection: {
      fontSize: 9,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      textAlign: 'center',
      marginTop: 2,
    },
    legend: {
      position: 'absolute',
      bottom: 8,
      left: 8,
      backgroundColor: colors.card,
      paddingHorizontal: 8,
      paddingVertical: 6,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.divider,
      gap: 4,
    },
    legendRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    legendDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    legendText: {
      fontSize: 9,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
    },
  });
}
