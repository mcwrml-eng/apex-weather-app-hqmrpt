
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import Svg, { Circle, Line, Polygon, G } from 'react-native-svg';
import { getColors } from '../styles/commonStyles';
import { useTheme } from '../state/ThemeContext';

interface Props {
  circuitSlug: string;
  windDirection?: number; // degrees, 0 = North
  windSpeed?: number;
  size?: number;
  showWindOverlay?: boolean;
}

// Satellite image URLs for each circuit (using Google Maps Static API style URLs)
// These are high-resolution satellite images centered on each circuit
const satelliteImages: Record<string, string> = {
  'monaco': 'https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/7.4206,43.7347,15,0/600x600@2x?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw',
  'silverstone': 'https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/-1.0142,52.0733,14.5,0/600x600@2x?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw',
  'spa': 'https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/5.9714,50.4372,14,0/600x600@2x?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw',
  'monza': 'https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/9.2811,45.6183,14.5,0/600x600@2x?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw',
  'suzuka': 'https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/136.5419,34.8431,14.5,0/600x600@2x?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw',
  'interlagos': 'https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/-46.6988,-23.701,14.5,0/600x600@2x?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw',
  'hungaroring': 'https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/19.2486,47.5789,14.5,0/600x600@2x?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw',
  'red-bull-ring': 'https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/14.7647,47.2197,14.5,0/600x600@2x?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw',
  'zandvoort': 'https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/4.5402,52.3885,14.5,0/600x600@2x?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw',
  'baku': 'https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/49.8533,40.3725,14,0/600x600@2x?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw',
  'marina-bay': 'https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/103.864,1.2914,14.5,0/600x600@2x?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw',
  'cota': 'https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/-97.6411,30.1328,14.5,0/600x600@2x?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw',
  'mexico-city': 'https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/-99.0907,19.4042,14.5,0/600x600@2x?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw',
  'las-vegas': 'https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/-115.173,36.1147,14,0/600x600@2x?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw',
  'lusail': 'https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/51.4542,25.4889,14.5,0/600x600@2x?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw',
  'yas-marina': 'https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/54.6031,24.4672,14.5,0/600x600@2x?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw',
  'bahrain': 'https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/50.5106,26.0325,14.5,0/600x600@2x?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw',
  'jeddah': 'https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/39.1044,21.6319,14,0/600x600@2x?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw',
  'albert-park': 'https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/144.968,-37.8497,14.5,0/600x600@2x?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw',
  'shanghai': 'https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/121.2206,31.3389,14.5,0/600x600@2x?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw',
  'miami': 'https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/-80.2389,25.958,14.5,0/600x600@2x?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw',
  'imola': 'https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/11.7167,44.3439,14.5,0/600x600@2x?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw',
  'barcelona': 'https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/2.2611,41.57,14.5,0/600x600@2x?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw',
  'gilles-villeneuve': 'https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/-73.5228,45.5,14.5,0/600x600@2x?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw',
  'madrid': 'https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/-3.7038,40.4168,14.5,0/600x600@2x?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw',
  'default': 'https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/0,0,2,0/600x600@2x?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw',
};

// Track section definitions for wind analysis
// Each section has a position (x, y as percentage of image) and direction (in degrees) representing the track heading
const trackSections: Record<string, Array<{ x: number; y: number; direction: number; type: 'straight' | 'corner' }>> = {
  'monaco': [
    { x: 22, y: 50, direction: 90, type: 'straight' },
    { x: 31, y: 43, direction: 45, type: 'corner' },
    { x: 47, y: 37, direction: 90, type: 'straight' },
    { x: 60, y: 45, direction: 135, type: 'corner' },
    { x: 65, y: 59, direction: 180, type: 'straight' },
    { x: 56, y: 71, direction: 225, type: 'corner' },
    { x: 40, y: 70, direction: 270, type: 'straight' },
    { x: 30, y: 61, direction: 315, type: 'corner' },
  ],
  'silverstone': [
    { x: 32, y: 68, direction: 45, type: 'corner' },
    { x: 52, y: 59, direction: 90, type: 'straight' },
    { x: 68, y: 64, direction: 135, type: 'corner' },
    { x: 73, y: 78, direction: 180, type: 'straight' },
    { x: 63, y: 90, direction: 225, type: 'corner' },
    { x: 48, y: 86, direction: 270, type: 'straight' },
    { x: 34, y: 77, direction: 315, type: 'corner' },
    { x: 30, y: 62, direction: 0, type: 'straight' },
  ],
  'spa': [
    { x: 27, y: 52, direction: 45, type: 'corner' },
    { x: 47, y: 40, direction: 90, type: 'straight' },
    { x: 67, y: 44, direction: 135, type: 'corner' },
    { x: 77, y: 62, direction: 180, type: 'straight' },
    { x: 68, y: 79, direction: 225, type: 'corner' },
    { x: 48, y: 77, direction: 270, type: 'straight' },
    { x: 31, y: 63, direction: 315, type: 'corner' },
  ],
  'monza': [
    { x: 25, y: 50, direction: 90, type: 'straight' },
    { x: 55, y: 46, direction: 90, type: 'straight' },
    { x: 76, y: 40, direction: 135, type: 'corner' },
    { x: 78, y: 50, direction: 180, type: 'straight' },
    { x: 73, y: 65, direction: 225, type: 'corner' },
    { x: 55, y: 76, direction: 270, type: 'straight' },
    { x: 35, y: 68, direction: 315, type: 'corner' },
  ],
  'suzuka': [
    { x: 37, y: 67, direction: 45, type: 'corner' },
    { x: 52, y: 57, direction: 90, type: 'straight' },
    { x: 67, y: 56, direction: 135, type: 'corner' },
    { x: 79, y: 71, direction: 180, type: 'straight' },
    { x: 70, y: 82, direction: 225, type: 'corner' },
    { x: 50, y: 77, direction: 270, type: 'straight' },
    { x: 38, y: 63, direction: 315, type: 'corner' },
    { x: 52, y: 52, direction: 0, type: 'corner' },
  ],
  'default': [
    { x: 27, y: 52, direction: 45, type: 'corner' },
    { x: 47, y: 40, direction: 90, type: 'straight' },
    { x: 67, y: 44, direction: 135, type: 'corner' },
    { x: 70, y: 56, direction: 180, type: 'straight' },
    { x: 62, y: 66, direction: 225, type: 'corner' },
    { x: 45, y: 66, direction: 270, type: 'straight' },
    { x: 35, y: 58, direction: 315, type: 'corner' },
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
  const opacity = 0.8 + (impact.strength * 0.2); // More visible for stronger impact
  
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
        r={size * 0.9}
        fill={color}
        opacity={0.3}
      />
      
      {/* Arrow line */}
      <Line
        x1={x}
        y1={y}
        x2={endX}
        y2={endY}
        stroke={color}
        strokeWidth="3"
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
  
  const satelliteImage = satelliteImages[circuitSlug] || satelliteImages.default;
  const sections = trackSections[circuitSlug] || trackSections.default;
  
  console.log(`Rendering satellite track map for ${circuitSlug} with wind: ${windSpeed}km/h at ${windDirection}°`);
  
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
          size={section.type === 'straight' ? 16 : 12}
          colors={colors}
        />
      );
    });
  }

  const styles = getStyles(colors);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Satellite Image Base Layer */}
      <Image
        source={{ uri: satelliteImage }}
        style={styles.satelliteImage}
        contentFit="cover"
        transition={300}
        placeholder={require('../assets/images/natively-dark.png')}
      />
      
      {/* Wind Overlay Layer */}
      {windSpeed > 0 && showWindOverlay && (
        <View style={styles.overlayContainer}>
          <Svg width={size} height={size} viewBox="0 0 100 100" style={styles.svgOverlay}>
            {windIndicators}
          </Svg>
        </View>
      )}
      
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
      overflow: 'hidden',
      position: 'relative',
    },
    satelliteImage: {
      width: '100%',
      height: '100%',
      borderRadius: 16,
    },
    overlayContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
    },
    svgOverlay: {
      position: 'absolute',
    },
    windInfo: {
      position: 'absolute',
      top: 8,
      right: 8,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    windText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#FFFFFF',
      fontFamily: 'Roboto_700Bold',
    },
    windDirection: {
      fontSize: 10,
      color: 'rgba(255, 255, 255, 0.8)',
      fontFamily: 'Roboto_400Regular',
      textAlign: 'center',
      marginTop: 2,
    },
    legend: {
      position: 'absolute',
      bottom: 8,
      left: 8,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
      gap: 6,
    },
    legendRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    legendDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    legendText: {
      fontSize: 10,
      color: '#FFFFFF',
      fontFamily: 'Roboto_500Medium',
    },
  });
}
