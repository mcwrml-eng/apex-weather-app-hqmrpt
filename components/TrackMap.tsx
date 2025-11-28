
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

// Circuit coordinates for satellite imagery
const circuitCoordinates: Record<string, { lat: number; lon: number; zoom: number }> = {
  'monaco': { lat: 43.7347, lon: 7.4206, zoom: 15 },
  'silverstone': { lat: 52.0733, lon: -1.0142, zoom: 14 },
  'spa': { lat: 50.4372, lon: 5.9714, zoom: 14 },
  'monza': { lat: 45.6183, lon: 9.2811, zoom: 14 },
  'suzuka': { lat: 34.8431, lon: 136.5419, zoom: 14 },
  'interlagos': { lat: -23.701, lon: -46.6988, zoom: 14 },
  'hungaroring': { lat: 47.5789, lon: 19.2486, zoom: 14 },
  'red-bull-ring': { lat: 47.2197, lon: 14.7647, zoom: 14 },
  'zandvoort': { lat: 52.3885, lon: 4.5402, zoom: 14 },
  'baku': { lat: 40.3725, lon: 49.8533, zoom: 14 },
  'marina-bay': { lat: 1.2914, lon: 103.864, zoom: 14 },
  'cota': { lat: 30.1328, lon: -97.6411, zoom: 14 },
  'mexico-city': { lat: 19.4042, lon: -99.0907, zoom: 14 },
  'las-vegas': { lat: 36.1147, lon: -115.173, zoom: 14 },
  'lusail': { lat: 25.4889, lon: 51.4542, zoom: 14 },
  'yas-marina': { lat: 24.4672, lon: 54.6031, zoom: 14 },
  'bahrain': { lat: 26.0325, lon: 50.5106, zoom: 14 },
  'jeddah': { lat: 21.6319, lon: 39.1044, zoom: 14 },
  'albert-park': { lat: -37.8497, lon: 144.968, zoom: 14 },
  'shanghai': { lat: 31.3389, lon: 121.2206, zoom: 14 },
  'miami': { lat: 25.958, lon: -80.2389, zoom: 14 },
  'imola': { lat: 44.3439, lon: 11.7167, zoom: 14 },
  'barcelona': { lat: 41.57, lon: 2.2611, zoom: 14 },
  'gilles-villeneuve': { lat: 45.5, lon: -73.5228, zoom: 14 },
  'madrid': { lat: 40.4168, lon: -3.7038, zoom: 14 },
  'default': { lat: 0, lon: 0, zoom: 2 },
};

// Generate OpenStreetMap satellite tile URL
function getOpenStreetMapUrl(lat: number, lon: number, zoom: number, width: number, height: number): string {
  // Using Esri World Imagery tiles (free, no API key required)
  // Calculate tile coordinates
  const n = Math.pow(2, zoom);
  const xtile = Math.floor((lon + 180) / 360 * n);
  const ytile = Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * n);
  
  // Use Esri World Imagery service
  return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoom}/${ytile}/${xtile}`;
}

// Generate Google Maps Static API URL (requires API key - user needs to add their own)
function getGoogleMapsUrl(lat: number, lon: number, zoom: number, width: number, height: number): string {
  // Note: This requires a Google Maps Static API key
  // Users should replace YOUR_GOOGLE_MAPS_API_KEY with their actual key
  const apiKey = 'YOUR_GOOGLE_MAPS_API_KEY'; // Replace with actual API key
  
  if (apiKey === 'YOUR_GOOGLE_MAPS_API_KEY') {
    // If no API key is set, return empty string to trigger fallback
    return '';
  }
  
  return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lon}&zoom=${zoom}&size=${width}x${height}&maptype=satellite&key=${apiKey}`;
}

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
  
  const coords = circuitCoordinates[circuitSlug] || circuitCoordinates.default;
  const sections = trackSections[circuitSlug] || trackSections.default;
  
  // Try Google Maps first, fallback to OpenStreetMap
  const googleMapsUrl = getGoogleMapsUrl(coords.lat, coords.lon, coords.zoom, 600, 600);
  const osmUrl = getOpenStreetMapUrl(coords.lat, coords.lon, coords.zoom, 600, 600);
  
  // Use OpenStreetMap as primary since it doesn't require API key
  const satelliteImage = osmUrl;
  
  console.log(`Rendering satellite track map for ${circuitSlug} with wind: ${windSpeed}km/h at ${windDirection}°`);
  console.log(`Using satellite image URL: ${satelliteImage}`);
  
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
        cachePolicy="memory-disk"
      />
      
      {/* Fallback text if image fails to load */}
      <View style={styles.fallbackContainer}>
        <Text style={styles.fallbackText}>
          Satellite imagery from OpenStreetMap
        </Text>
        <Text style={styles.fallbackSubtext}>
          For Google Maps, add API key in TrackMap.tsx
        </Text>
      </View>
      
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
    fallbackContainer: {
      position: 'absolute',
      bottom: 40,
      left: 8,
      right: 8,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      paddingHorizontal: 8,
      paddingVertical: 6,
      borderRadius: 6,
      alignItems: 'center',
    },
    fallbackText: {
      fontSize: 9,
      color: 'rgba(255, 255, 255, 0.9)',
      fontFamily: 'Roboto_500Medium',
      textAlign: 'center',
    },
    fallbackSubtext: {
      fontSize: 8,
      color: 'rgba(255, 255, 255, 0.6)',
      fontFamily: 'Roboto_400Regular',
      textAlign: 'center',
      marginTop: 2,
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
