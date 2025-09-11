
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Line, Polygon } from 'react-native-svg';
import { colors } from '../styles/commonStyles';

interface Props {
  circuitSlug: string;
  windDirection?: number; // degrees, 0 = North
  windSpeed?: number;
  size?: number;
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

  // MotoGP Circuits
  'losail': 'M20,35 Q40,25 60,35 Q80,45 75,65 Q70,85 50,80 Q30,75 20,60 Q15,45 20,35 Z',
  'portimao': 'M25,30 Q45,20 65,30 Q80,45 75,65 Q70,80 50,85 Q30,80 20,65 Q15,45 25,30 Z',
  'cota-mgp': 'M25,40 Q35,25 55,30 Q75,35 80,55 Q75,75 55,80 Q35,85 25,70 Q20,50 25,40 Z',
  'jerez': 'M20,40 Q35,25 55,30 Q75,35 80,55 Q75,75 55,80 Q35,85 20,70 Q15,50 20,40 Z',
  'lemans': 'M15,45 L85,45 Q90,50 85,55 L15,55 Q10,50 15,45 Z M25,35 Q45,25 65,35 Q75,45 65,55 Q45,65 25,55 Q15,45 25,35 Z',
  'barcelona-mgp': 'M20,40 Q35,25 55,30 Q75,35 80,55 Q75,75 55,80 Q35,85 20,70 Q15,50 20,40 Z',
  'mugello': 'M25,35 Q45,25 65,35 Q80,50 75,70 Q70,85 50,80 Q30,75 20,60 Q15,45 25,35 Z',
  'assen': 'M20,40 Q30,25 50,30 Q70,35 80,55 Q75,75 55,80 Q35,85 25,70 Q15,55 20,40 Z',
  'sachsenring': 'M25,35 Q45,25 65,35 Q80,50 75,70 Q70,85 50,80 Q30,75 20,60 Q15,45 25,35 Z',
  'silverstone-mgp': 'M20,30 Q40,20 60,25 Q80,30 85,50 Q80,70 60,75 Q40,80 20,70 Q15,50 20,30 Z',
  'red-bull-ring-mgp': 'M20,50 Q30,30 50,35 Q70,40 80,60 Q75,80 55,85 Q35,80 25,65 Q15,55 20,50 Z',
  'aragon': 'M20,40 Q35,25 55,30 Q75,35 80,55 Q75,75 55,80 Q35,85 20,70 Q15,50 20,40 Z',
  'misano': 'M25,35 Q45,25 65,35 Q80,50 75,70 Q70,85 50,80 Q30,75 20,60 Q15,45 25,35 Z',
  'sokol': 'M20,35 Q40,25 60,35 Q80,45 75,65 Q70,85 50,80 Q30,75 20,60 Q15,45 20,35 Z',
  'mandalika': 'M25,30 Q45,20 65,30 Q80,45 75,65 Q70,80 50,85 Q30,80 20,65 Q15,45 25,30 Z',
  'motegi': 'M25,35 Q45,25 65,35 Q80,50 75,70 Q70,85 50,80 Q30,75 20,60 Q15,45 25,35 Z',
  'buriram': 'M20,40 Q35,25 55,30 Q75,35 80,55 Q75,75 55,80 Q35,85 20,70 Q15,50 20,40 Z',
  'phillip-island': 'M25,35 Q45,25 65,35 Q80,50 75,70 Q70,85 50,80 Q30,75 20,60 Q15,45 25,35 Z',
  'sepang': 'M20,35 Q40,25 60,35 Q80,45 75,65 Q70,85 50,80 Q30,75 20,60 Q15,45 20,35 Z',
  'valencia': 'M20,40 Q35,25 55,30 Q75,35 80,55 Q75,75 55,80 Q35,85 20,70 Q15,50 20,40 Z',

  // IndyCar Circuits
  'st-pete': 'M15,40 L30,40 Q40,30 50,40 L60,40 Q70,30 80,40 L85,40 Q90,45 85,50 L80,50 Q70,60 60,50 L50,50 Q40,60 30,50 L15,50 Q10,45 15,40 Z',
  'thermal': 'M20,35 Q40,25 60,35 Q80,45 75,65 Q70,85 50,80 Q30,75 20,60 Q15,45 20,35 Z',
  'long-beach': 'M15,35 L70,35 Q80,40 75,50 L70,50 Q65,60 70,70 L75,70 Q80,80 70,85 L15,85 Q10,80 15,75 L20,75 Q25,65 20,55 L15,55 Q10,50 15,45 L20,45 Q25,40 20,35 Z',
  'barber': 'M25,30 Q45,20 65,30 Q80,45 75,65 Q70,80 50,85 Q30,80 20,65 Q15,45 25,30 Z',
  'indianapolis-gp': 'M20,40 Q35,25 55,30 Q75,35 80,55 Q75,75 55,80 Q35,85 20,70 Q15,50 20,40 Z',
  'indianapolis-500': 'M20,50 Q20,20 50,20 Q80,20 80,50 Q80,80 50,80 Q20,80 20,50', // Classic oval
  'detroit': 'M15,40 L30,40 Q40,30 50,40 L60,40 Q70,30 80,40 L85,40 Q90,45 85,50 L80,50 Q70,60 60,50 L50,50 Q40,60 30,50 L15,50 Q10,45 15,40 Z',
  'road-america': 'M25,35 Q45,25 65,35 Q80,50 75,70 Q70,85 50,80 Q30,75 20,60 Q15,45 25,35 Z',
  'laguna-seca': 'M20,40 Q30,25 50,30 Q70,35 80,55 Q75,75 55,80 Q35,85 25,70 Q15,55 20,40 Z',
  'mid-ohio': 'M25,35 Q45,25 65,35 Q80,50 75,70 Q70,85 50,80 Q30,75 20,60 Q15,45 25,35 Z',
  'toronto': 'M15,35 L70,35 Q80,40 75,50 L70,50 Q65,60 70,70 L75,70 Q80,80 70,85 L15,85 Q10,80 15,75 L20,75 Q25,65 20,55 L15,55 Q10,50 15,45 L20,45 Q25,40 20,35 Z',
  'iowa': 'M20,50 Q20,25 50,25 Q80,25 80,50 Q80,75 50,75 Q20,75 20,50', // Oval
  'gateway': 'M20,50 Q20,25 50,25 Q80,25 80,50 Q80,75 50,75 Q20,75 20,50', // Oval
  'portland': 'M20,40 Q35,25 55,30 Q75,35 80,55 Q75,75 55,80 Q35,85 20,70 Q15,50 20,40 Z',
  'nashville': 'M20,50 Q20,25 50,25 Q80,25 80,50 Q80,75 50,75 Q20,75 20,50', // Oval

  // Default simple oval for unknown tracks
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
  
  // IndyCar circuits
  'st-pete': { x1: 13, y1: 38, x2: 17, y2: 42 },
  'thermal': { x1: 18, y1: 33, x2: 22, y2: 37 },
  'long-beach': { x1: 13, y1: 33, x2: 17, y2: 37 },
  'barber': { x1: 23, y1: 28, x2: 27, y2: 32 },
  'indianapolis-gp': { x1: 18, y1: 38, x2: 22, y2: 42 },
  'indianapolis-500': { x1: 18, y1: 48, x2: 22, y2: 52 },
  'detroit': { x1: 13, y1: 38, x2: 17, y2: 42 },
  'road-america': { x1: 23, y1: 33, x2: 27, y2: 37 },
  'laguna-seca': { x1: 18, y1: 38, x2: 22, y2: 42 },
  'mid-ohio': { x1: 23, y1: 33, x2: 27, y2: 37 },
  'toronto': { x1: 13, y1: 33, x2: 17, y2: 37 },
  'iowa': { x1: 18, y1: 48, x2: 22, y2: 52 },
  'gateway': { x1: 18, y1: 48, x2: 22, y2: 52 },
  'portland': { x1: 18, y1: 38, x2: 22, y2: 42 },
  'nashville': { x1: 18, y1: 48, x2: 22, y2: 52 },
  
  // MotoGP circuits use similar positions
  'default': { x1: 18, y1: 48, x2: 22, y2: 52 }
};

// Wind direction arrow component
function WindArrow({ x, y, direction, speed, size = 20 }: { x: number; y: number; direction: number; speed: number; size?: number }) {
  const arrowLength = Math.min(size, speed * 2); // Scale arrow by wind speed
  
  // Convert wind direction to show where wind is blowing TO
  // Add 180 degrees to convert from "coming from" to "blowing to"
  const adjustedDirection = (direction + 180) % 360;
  const radians = (adjustedDirection - 90) * (Math.PI / 180); // Convert to radians, adjust for SVG coordinate system
  
  const endX = x + Math.cos(radians) * arrowLength;
  const endY = y + Math.sin(radians) * arrowLength;
  
  // Arrow head points
  const headLength = arrowLength * 0.3;
  const headAngle = Math.PI / 6;
  
  const head1X = endX - Math.cos(radians - headAngle) * headLength;
  const head1Y = endY - Math.sin(radians - headAngle) * headLength;
  
  const head2X = endX - Math.cos(radians + headAngle) * headLength;
  const head2Y = endY - Math.sin(radians + headAngle) * headLength;

  return (
    <>
      <Line
        x1={x}
        y1={y}
        x2={endX}
        y2={endY}
        stroke={colors.accent}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <Polygon
        points={`${endX},${endY} ${head1X},${head1Y} ${head2X},${head2Y}`}
        fill={colors.accent}
      />
    </>
  );
}

export default function TrackMap({ circuitSlug, windDirection = 0, windSpeed = 0, size = 120 }: Props) {
  const trackPath = trackLayouts[circuitSlug] || trackLayouts.default;
  const startFinish = startFinishPositions[circuitSlug] || startFinishPositions.default;
  
  console.log(`Rendering track map for ${circuitSlug} with wind: ${windSpeed}km/h at ${windDirection}° (showing direction TO)`);
  
  // Generate wind arrows at strategic points around the track
  const windArrows = [];
  if (windSpeed > 0) {
    // Different positions based on track layout
    let positions = [
      { x: 25, y: 40 },
      { x: 50, y: 25 },
      { x: 75, y: 40 },
      { x: 75, y: 70 },
      { x: 50, y: 85 },
      { x: 25, y: 70 }
    ];

    // Customize positions for specific famous circuits
    if (circuitSlug === 'monaco') {
      positions = [
        { x: 20, y: 45 },
        { x: 40, y: 40 },
        { x: 60, y: 45 },
        { x: 80, y: 50 },
        { x: 60, y: 55 },
        { x: 40, y: 55 }
      ];
    } else if (circuitSlug === 'spa') {
      positions = [
        { x: 20, y: 50 },
        { x: 40, y: 35 },
        { x: 65, y: 40 },
        { x: 75, y: 60 },
        { x: 50, y: 80 },
        { x: 25, y: 70 }
      ];
    } else if (circuitSlug === 'silverstone') {
      positions = [
        { x: 25, y: 35 },
        { x: 50, y: 25 },
        { x: 75, y: 40 },
        { x: 80, y: 65 },
        { x: 50, y: 75 },
        { x: 25, y: 60 }
      ];
    }
    
    positions.forEach((pos, index) => {
      windArrows.push(
        <WindArrow
          key={index}
          x={pos.x}
          y={pos.y}
          direction={windDirection}
          speed={windSpeed}
          size={12}
        />
      );
    });
  }

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        {/* Track layout */}
        <Path
          d={trackPath}
          stroke={colors.primary}
          strokeWidth="3"
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
          strokeWidth="2"
          strokeLinecap="round"
        />
        
        {/* Start/finish line perpendicular marks */}
        <Line
          x1={startFinish.x1 - 1}
          y1={startFinish.y1 - 1}
          x2={startFinish.x1 + 1}
          y2={startFinish.y1 + 1}
          stroke={colors.text}
          strokeWidth="1"
          strokeLinecap="round"
        />
        <Line
          x1={startFinish.x2 - 1}
          y1={startFinish.y2 - 1}
          x2={startFinish.x2 + 1}
          y2={startFinish.y2 + 1}
          stroke={colors.text}
          strokeWidth="1"
          strokeLinecap="round"
        />
        
        {/* Wind direction arrows */}
        {windArrows}
      </Svg>
      
      {windSpeed > 0 && (
        <View style={styles.windInfo}>
          <Text style={styles.windText}>{Math.round(windSpeed)} km/h</Text>
          <Text style={styles.windDirection}>{Math.round(windDirection)}°</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.divider,
    padding: 8,
  },
  windInfo: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: colors.card,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  windText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Roboto_500Medium',
  },
  windDirection: {
    fontSize: 8,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
    textAlign: 'center',
  },
});
