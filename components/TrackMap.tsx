
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

// Simplified track layouts (SVG paths)
const trackLayouts: Record<string, string> = {
  'monaco': 'M20,80 Q30,70 50,75 Q70,80 80,60 Q85,40 70,30 Q50,25 40,35 Q30,45 25,60 Q20,70 20,80',
  'silverstone': 'M20,50 Q40,30 60,35 Q80,40 85,60 Q80,80 60,85 Q40,80 30,70 Q20,60 20,50',
  'spa': 'M15,70 Q25,50 45,45 Q65,40 75,55 Q80,70 70,80 Q50,85 30,80 Q15,75 15,70',
  'monza': 'M20,40 L80,40 Q85,45 80,50 L20,50 Q15,55 20,60 L80,60 Q85,65 80,70 L20,70 Q15,75 20,80 L80,80 Q85,85 80,90 L20,90 Q15,85 20,80',
  'suzuka': 'M30,20 Q50,15 70,25 Q85,40 80,60 Q75,80 55,85 Q35,80 25,65 Q20,45 30,30 Q40,20 30,20',
  'interlagos': 'M25,30 Q45,20 65,30 Q80,45 75,65 Q70,80 50,85 Q30,80 20,65 Q15,45 25,30',
  // Default simple oval for unknown tracks
  'default': 'M20,50 Q20,20 50,20 Q80,20 80,50 Q80,80 50,80 Q20,80 20,50'
};

// Wind direction arrow component
function WindArrow({ x, y, direction, speed, size = 20 }: { x: number; y: number; direction: number; speed: number; size?: number }) {
  const arrowLength = Math.min(size, speed * 2); // Scale arrow by wind speed
  const radians = (direction - 90) * (Math.PI / 180); // Convert to radians, adjust for SVG coordinate system
  
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
  
  // Generate wind arrows at multiple points around the track
  const windArrows = [];
  if (windSpeed > 0) {
    const positions = [
      { x: 25, y: 40 },
      { x: 50, y: 25 },
      { x: 75, y: 40 },
      { x: 75, y: 70 },
      { x: 50, y: 85 },
      { x: 25, y: 70 }
    ];
    
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
          x1="18"
          y1="48"
          x2="22"
          y2="52"
          stroke={colors.text}
          strokeWidth="2"
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
