
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import Svg, { Circle, Line, Polygon, G, Path } from 'react-native-svg';
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
  const n = Math.pow(2, zoom);
  const xtile = Math.floor((lon + 180) / 360 * n);
  const ytile = Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * n);
  
  return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoom}/${ytile}/${xtile}`;
}

// Generate Google Maps Static API URL (requires API key - user needs to add their own)
function getGoogleMapsUrl(lat: number, lon: number, zoom: number, width: number, height: number): string {
  const apiKey = 'YOUR_GOOGLE_MAPS_API_KEY'; // Replace with actual API key
  
  if (apiKey === 'YOUR_GOOGLE_MAPS_API_KEY') {
    return '';
  }
  
  return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lon}&zoom=${zoom}&size=${width}x${height}&maptype=satellite&key=${apiKey}`;
}

// Enhanced track section definitions with more granular points
// Each section has a position (x, y as percentage of image) and direction (in degrees) representing the track heading
const trackSections: Record<string, Array<{ x: number; y: number; direction: number; type: 'straight' | 'corner'; importance: number }>> = {
  'monaco': [
    // Start/Finish straight
    { x: 20, y: 50, direction: 90, type: 'straight', importance: 1.0 },
    { x: 25, y: 48, direction: 85, type: 'straight', importance: 0.8 },
    // Sainte Devote
    { x: 30, y: 45, direction: 60, type: 'corner', importance: 0.9 },
    { x: 33, y: 42, direction: 45, type: 'corner', importance: 0.7 },
    // Beau Rivage
    { x: 38, y: 39, direction: 75, type: 'straight', importance: 0.9 },
    { x: 43, y: 38, direction: 85, type: 'straight', importance: 1.0 },
    { x: 48, y: 37, direction: 90, type: 'straight', importance: 1.0 },
    // Massenet
    { x: 53, y: 38, direction: 110, type: 'corner', importance: 0.7 },
    { x: 57, y: 41, direction: 130, type: 'corner', importance: 0.8 },
    // Casino Square
    { x: 60, y: 45, direction: 145, type: 'corner', importance: 0.9 },
    { x: 62, y: 50, direction: 160, type: 'corner', importance: 0.7 },
    // Mirabeau
    { x: 64, y: 55, direction: 175, type: 'corner', importance: 0.8 },
    { x: 65, y: 59, direction: 180, type: 'straight', importance: 0.9 },
    // Portier
    { x: 64, y: 64, direction: 195, type: 'corner', importance: 0.7 },
    { x: 61, y: 68, direction: 215, type: 'corner', importance: 0.8 },
    // Tunnel
    { x: 56, y: 71, direction: 235, type: 'straight', importance: 1.0 },
    { x: 50, y: 72, direction: 255, type: 'straight', importance: 1.0 },
    { x: 44, y: 71, direction: 265, type: 'straight', importance: 1.0 },
    { x: 40, y: 70, direction: 270, type: 'straight', importance: 1.0 },
    // Nouvelle Chicane
    { x: 36, y: 68, direction: 285, type: 'corner', importance: 0.7 },
    { x: 33, y: 65, direction: 305, type: 'corner', importance: 0.8 },
    // Tabac
    { x: 30, y: 61, direction: 320, type: 'corner', importance: 0.9 },
    { x: 28, y: 57, direction: 340, type: 'corner', importance: 0.7 },
    // Swimming Pool
    { x: 26, y: 53, direction: 0, type: 'corner', importance: 0.8 },
    { x: 23, y: 51, direction: 20, type: 'corner', importance: 0.7 },
  ],
  'silverstone': [
    // Abbey
    { x: 30, y: 65, direction: 30, type: 'corner', importance: 0.9 },
    { x: 34, y: 62, direction: 45, type: 'corner', importance: 0.8 },
    // Farm Curve
    { x: 40, y: 60, direction: 70, type: 'corner', importance: 0.7 },
    { x: 46, y: 59, direction: 85, type: 'straight', importance: 0.9 },
    // Wellington Straight
    { x: 52, y: 59, direction: 90, type: 'straight', importance: 1.0 },
    { x: 58, y: 59, direction: 90, type: 'straight', importance: 1.0 },
    { x: 64, y: 60, direction: 95, type: 'straight', importance: 1.0 },
    // Brooklands
    { x: 68, y: 62, direction: 115, type: 'corner', importance: 0.9 },
    { x: 71, y: 66, direction: 135, type: 'corner', importance: 0.8 },
    // Luffield
    { x: 73, y: 72, direction: 160, type: 'corner', importance: 0.9 },
    { x: 73, y: 78, direction: 180, type: 'straight', importance: 0.8 },
    // Woodcote
    { x: 71, y: 83, direction: 200, type: 'corner', importance: 0.9 },
    { x: 67, y: 87, direction: 220, type: 'corner', importance: 0.8 },
    // Copse
    { x: 60, y: 89, direction: 245, type: 'corner', importance: 1.0 },
    { x: 54, y: 88, direction: 260, type: 'straight', importance: 0.9 },
    { x: 48, y: 86, direction: 270, type: 'straight', importance: 1.0 },
    // Maggotts
    { x: 42, y: 84, direction: 285, type: 'corner', importance: 0.9 },
    { x: 38, y: 80, direction: 305, type: 'corner', importance: 0.8 },
    // Becketts
    { x: 34, y: 77, direction: 320, type: 'corner', importance: 1.0 },
    { x: 32, y: 72, direction: 340, type: 'corner', importance: 0.8 },
    // Chapel
    { x: 30, y: 68, direction: 355, type: 'corner', importance: 0.7 },
    { x: 30, y: 62, direction: 10, type: 'straight', importance: 0.8 },
  ],
  'spa': [
    // La Source
    { x: 25, y: 55, direction: 30, type: 'corner', importance: 0.9 },
    { x: 28, y: 51, direction: 45, type: 'corner', importance: 0.8 },
    // Eau Rouge
    { x: 33, y: 47, direction: 65, type: 'corner', importance: 1.0 },
    { x: 38, y: 44, direction: 80, type: 'corner', importance: 1.0 },
    // Raidillon
    { x: 43, y: 42, direction: 85, type: 'straight', importance: 1.0 },
    { x: 48, y: 40, direction: 90, type: 'straight', importance: 1.0 },
    // Kemmel Straight
    { x: 54, y: 40, direction: 90, type: 'straight', importance: 1.0 },
    { x: 60, y: 41, direction: 95, type: 'straight', importance: 1.0 },
    { x: 65, y: 43, direction: 105, type: 'straight', importance: 1.0 },
    // Les Combes
    { x: 69, y: 46, direction: 125, type: 'corner', importance: 0.9 },
    { x: 72, y: 51, direction: 145, type: 'corner', importance: 0.8 },
    // Malmedy
    { x: 74, y: 56, direction: 165, type: 'corner', importance: 0.7 },
    { x: 75, y: 61, direction: 175, type: 'straight', importance: 0.8 },
    // Rivage
    { x: 74, y: 66, direction: 190, type: 'corner', importance: 0.8 },
    { x: 72, y: 71, direction: 210, type: 'corner', importance: 0.7 },
    // Pouhon
    { x: 69, y: 75, direction: 225, type: 'corner', importance: 1.0 },
    { x: 65, y: 78, direction: 240, type: 'corner', importance: 0.9 },
    // Fagnes
    { x: 60, y: 79, direction: 255, type: 'straight', importance: 0.8 },
    { x: 54, y: 78, direction: 265, type: 'straight', importance: 0.9 },
    // Stavelot
    { x: 48, y: 77, direction: 270, type: 'corner', importance: 0.9 },
    { x: 43, y: 75, direction: 285, type: 'corner', importance: 0.8 },
    // Blanchimont
    { x: 38, y: 72, direction: 295, type: 'straight', importance: 1.0 },
    { x: 34, y: 68, direction: 305, type: 'straight', importance: 1.0 },
    // Bus Stop Chicane
    { x: 31, y: 63, direction: 320, type: 'corner', importance: 0.8 },
    { x: 29, y: 59, direction: 340, type: 'corner', importance: 0.7 },
  ],
  'monza': [
    // Start/Finish
    { x: 22, y: 50, direction: 90, type: 'straight', importance: 1.0 },
    { x: 30, y: 49, direction: 90, type: 'straight', importance: 1.0 },
    { x: 38, y: 48, direction: 90, type: 'straight', importance: 1.0 },
    { x: 46, y: 47, direction: 90, type: 'straight', importance: 1.0 },
    { x: 55, y: 46, direction: 90, type: 'straight', importance: 1.0 },
    // Variante del Rettifilo
    { x: 62, y: 45, direction: 100, type: 'corner', importance: 0.8 },
    { x: 68, y: 43, direction: 115, type: 'corner', importance: 0.7 },
    // Curva Grande
    { x: 73, y: 42, direction: 125, type: 'corner', importance: 0.9 },
    { x: 76, y: 44, direction: 140, type: 'corner', importance: 0.8 },
    // Variante della Roggia
    { x: 78, y: 48, direction: 160, type: 'corner', importance: 0.7 },
    { x: 78, y: 53, direction: 175, type: 'straight', importance: 0.8 },
    // Lesmo 1
    { x: 77, y: 58, direction: 195, type: 'corner', importance: 0.9 },
    { x: 75, y: 62, direction: 210, type: 'corner', importance: 0.8 },
    // Lesmo 2
    { x: 73, y: 66, direction: 225, type: 'corner', importance: 0.9 },
    { x: 70, y: 69, direction: 240, type: 'corner', importance: 0.8 },
    // Ascari
    { x: 65, y: 72, direction: 255, type: 'corner', importance: 0.9 },
    { x: 60, y: 74, direction: 265, type: 'corner', importance: 0.8 },
    { x: 55, y: 76, direction: 270, type: 'straight', importance: 0.9 },
    // Parabolica
    { x: 48, y: 76, direction: 280, type: 'corner', importance: 1.0 },
    { x: 42, y: 74, direction: 295, type: 'corner', importance: 1.0 },
    { x: 37, y: 71, direction: 310, type: 'corner', importance: 1.0 },
    { x: 33, y: 67, direction: 325, type: 'corner', importance: 0.9 },
    { x: 30, y: 62, direction: 340, type: 'corner', importance: 0.8 },
    { x: 28, y: 56, direction: 355, type: 'corner', importance: 0.7 },
  ],
  'suzuka': [
    // Turn 1
    { x: 35, y: 70, direction: 30, type: 'corner', importance: 0.9 },
    { x: 38, y: 66, direction: 45, type: 'corner', importance: 0.8 },
    // Turn 2
    { x: 42, y: 63, direction: 65, type: 'corner', importance: 0.8 },
    { x: 46, y: 61, direction: 80, type: 'corner', importance: 0.7 },
    // S Curves
    { x: 50, y: 59, direction: 90, type: 'corner', importance: 0.9 },
    { x: 54, y: 58, direction: 95, type: 'straight', importance: 0.8 },
    { x: 58, y: 57, direction: 90, type: 'straight', importance: 0.9 },
    // Dunlop Curve
    { x: 62, y: 56, direction: 105, type: 'corner', importance: 0.9 },
    { x: 66, y: 57, direction: 125, type: 'corner', importance: 0.8 },
    // Degner Curve
    { x: 70, y: 60, direction: 145, type: 'corner', importance: 0.9 },
    { x: 73, y: 64, direction: 160, type: 'corner', importance: 0.8 },
    // Hairpin
    { x: 76, y: 68, direction: 175, type: 'corner', importance: 0.8 },
    { x: 78, y: 73, direction: 185, type: 'corner', importance: 0.7 },
    // Spoon Curve
    { x: 77, y: 78, direction: 200, type: 'corner', importance: 1.0 },
    { x: 74, y: 82, direction: 220, type: 'corner', importance: 0.9 },
    // 130R
    { x: 68, y: 84, direction: 245, type: 'corner', importance: 1.0 },
    { x: 62, y: 83, direction: 260, type: 'straight', importance: 1.0 },
    { x: 56, y: 81, direction: 265, type: 'straight', importance: 1.0 },
    // Casio Triangle
    { x: 50, y: 79, direction: 275, type: 'corner', importance: 0.8 },
    { x: 46, y: 76, direction: 290, type: 'corner', importance: 0.7 },
    // Crossover
    { x: 42, y: 72, direction: 305, type: 'corner', importance: 0.8 },
    { x: 40, y: 68, direction: 320, type: 'corner', importance: 0.7 },
    // Final Corner
    { x: 38, y: 63, direction: 340, type: 'corner', importance: 0.9 },
    { x: 37, y: 58, direction: 355, type: 'corner', importance: 0.8 },
  ],
  'default': [
    { x: 25, y: 50, direction: 45, type: 'corner', importance: 0.8 },
    { x: 35, y: 42, direction: 70, type: 'straight', importance: 0.9 },
    { x: 45, y: 40, direction: 90, type: 'straight', importance: 1.0 },
    { x: 55, y: 42, direction: 110, type: 'straight', importance: 0.9 },
    { x: 65, y: 48, direction: 135, type: 'corner', importance: 0.8 },
    { x: 70, y: 56, direction: 160, type: 'straight', importance: 0.9 },
    { x: 68, y: 64, direction: 200, type: 'corner', importance: 0.8 },
    { x: 60, y: 68, direction: 225, type: 'corner', importance: 0.8 },
    { x: 50, y: 68, direction: 250, type: 'straight', importance: 0.9 },
    { x: 40, y: 66, direction: 270, type: 'straight', importance: 1.0 },
    { x: 32, y: 62, direction: 300, type: 'corner', importance: 0.8 },
    { x: 28, y: 56, direction: 330, type: 'corner', importance: 0.8 },
  ]
};

// Calculate precise wind impact using vector decomposition
// Returns headwind, tailwind, and crosswind components
function calculateWindComponents(trackDirection: number, windDirection: number, windSpeed: number): {
  headwind: number;
  tailwind: number;
  crosswind: number;
  type: 'headwind' | 'tailwind' | 'crosswind';
  strength: number;
} {
  // Normalize angles to 0-360
  const normalizeAngle = (angle: number) => ((angle % 360) + 360) % 360;
  
  const trackDir = normalizeAngle(trackDirection);
  const windDir = normalizeAngle(windDirection);
  
  // Calculate relative wind angle (wind direction relative to track direction)
  // Wind direction is where wind is coming FROM
  // Track direction is where vehicle is going TO
  let relativeAngle = windDir - trackDir;
  if (relativeAngle > 180) relativeAngle -= 360;
  if (relativeAngle < -180) relativeAngle += 360;
  
  // Convert to radians for calculation
  const relativeRad = (relativeAngle * Math.PI) / 180;
  
  // Decompose wind into parallel (headwind/tailwind) and perpendicular (crosswind) components
  // Positive parallel = headwind (opposing motion), Negative = tailwind (assisting motion)
  const parallelComponent = windSpeed * Math.cos(relativeRad);
  const perpendicularComponent = windSpeed * Math.sin(relativeRad);
  
  // Determine headwind vs tailwind
  const headwind = Math.max(0, parallelComponent);
  const tailwind = Math.max(0, -parallelComponent);
  const crosswind = Math.abs(perpendicularComponent);
  
  // Determine dominant type based on component magnitudes
  let type: 'headwind' | 'tailwind' | 'crosswind';
  let strength: number;
  
  if (headwind > tailwind && headwind > crosswind * 0.7) {
    type = 'headwind';
    strength = headwind / windSpeed; // Normalized 0-1
  } else if (tailwind > headwind && tailwind > crosswind * 0.7) {
    type = 'tailwind';
    strength = tailwind / windSpeed; // Normalized 0-1
  } else {
    type = 'crosswind';
    strength = crosswind / windSpeed; // Normalized 0-1
  }
  
  return {
    headwind,
    tailwind,
    crosswind,
    type,
    strength: Math.min(1, strength), // Clamp to 0-1
  };
}

// Enhanced wind indicator component with accurate vector visualization
function WindIndicator({ 
  x, 
  y, 
  trackDirection, 
  windDirection, 
  windSpeed, 
  size = 12, 
  colors,
  importance = 1.0,
}: { 
  x: number; 
  y: number; 
  trackDirection: number;
  windDirection: number; 
  windSpeed: number; 
  size?: number; 
  colors: any;
  importance?: number;
}) {
  const components = calculateWindComponents(trackDirection, windDirection, windSpeed);
  
  // Color based on wind impact type with gradient
  let color: string;
  let backgroundColor: string;
  
  if (components.type === 'headwind') {
    // Red gradient for headwind (slows down)
    const intensity = Math.floor(components.strength * 255);
    color = `rgb(${Math.min(255, 200 + intensity * 0.2)}, ${Math.max(0, 100 - intensity * 0.4)}, ${Math.max(0, 100 - intensity * 0.4)})`;
    backgroundColor = 'rgba(239, 68, 68, 0.3)';
  } else if (components.type === 'tailwind') {
    // Green gradient for tailwind (speeds up)
    const intensity = Math.floor(components.strength * 255);
    color = `rgb(${Math.max(0, 100 - intensity * 0.4)}, ${Math.min(255, 180 + intensity * 0.3)}, ${Math.max(0, 100 - intensity * 0.4)})`;
    backgroundColor = 'rgba(16, 185, 129, 0.3)';
  } else {
    // Amber gradient for crosswind (affects handling)
    const intensity = Math.floor(components.strength * 255);
    color = `rgb(${Math.min(255, 220 + intensity * 0.15)}, ${Math.max(100, 180 - intensity * 0.3)}, ${Math.max(0, 50 - intensity * 0.2)})`;
    backgroundColor = 'rgba(245, 158, 11, 0.3)';
  }
  
  // Scale arrow based on wind strength and importance
  const baseArrowLength = size * (0.8 + components.strength * 0.4);
  const arrowLength = baseArrowLength * importance;
  const opacity = 0.7 + (components.strength * 0.3);
  
  // Calculate arrow direction (wind direction relative to track)
  const relativeWindDir = (windDirection - trackDirection + 360) % 360;
  const radians = (relativeWindDir - 90) * (Math.PI / 180);
  
  const endX = x + Math.cos(radians) * arrowLength;
  const endY = y + Math.sin(radians) * arrowLength;
  
  // Arrow head proportional to arrow length
  const headLength = arrowLength * 0.35;
  const headAngle = Math.PI / 5.5;
  
  const head1X = endX - Math.cos(radians - headAngle) * headLength;
  const head1Y = endY - Math.sin(radians - headAngle) * headLength;
  
  const head2X = endX - Math.cos(radians + headAngle) * headLength;
  const head2Y = endY - Math.sin(radians + headAngle) * headLength;
  
  // Scale circle based on importance and strength
  const circleRadius = size * 0.85 * importance * (0.7 + components.strength * 0.3);
  const strokeWidth = 2.5 + components.strength * 1.5;

  return (
    <G opacity={opacity}>
      {/* Background circle for better visibility */}
      <Circle
        cx={x}
        cy={y}
        r={circleRadius}
        fill={backgroundColor}
        opacity={0.6}
      />
      
      {/* Outer ring to emphasize important sections */}
      {importance > 0.85 && (
        <Circle
          cx={x}
          cy={y}
          r={circleRadius + 2}
          fill="none"
          stroke={color}
          strokeWidth="1"
          opacity={0.4}
        />
      )}
      
      {/* Arrow line with variable thickness */}
      <Line
        x1={x}
        y1={y}
        x2={endX}
        y2={endY}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      
      {/* Arrow head */}
      <Polygon
        points={`${endX},${endY} ${head1X},${head1Y} ${head2X},${head2Y}`}
        fill={color}
      />
      
      {/* Small center dot for reference */}
      <Circle
        cx={x}
        cy={y}
        r={1.5}
        fill={color}
        opacity={0.8}
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
  
  console.log(`Rendering enhanced track map for ${circuitSlug} with wind: ${windSpeed}km/h at ${windDirection}°`);
  console.log(`Track sections: ${sections.length} points`);
  
  // Calculate overall wind impact statistics
  let totalHeadwind = 0;
  let totalTailwind = 0;
  let totalCrosswind = 0;
  let headwindCount = 0;
  let tailwindCount = 0;
  let crosswindCount = 0;
  
  // Generate wind indicators for each track section
  const windIndicators = [];
  if (windSpeed > 0 && showWindOverlay) {
    sections.forEach((section, index) => {
      const components = calculateWindComponents(section.direction, windDirection, windSpeed);
      
      // Accumulate statistics
      if (components.type === 'headwind') {
        totalHeadwind += components.headwind;
        headwindCount++;
      } else if (components.type === 'tailwind') {
        totalTailwind += components.tailwind;
        tailwindCount++;
      } else {
        totalCrosswind += components.crosswind;
        crosswindCount++;
      }
      
      windIndicators.push(
        <WindIndicator
          key={index}
          x={section.x}
          y={section.y}
          trackDirection={section.direction}
          windDirection={windDirection}
          windSpeed={windSpeed}
          size={section.type === 'straight' ? 16 : 13}
          colors={colors}
          importance={section.importance}
        />
      );
    });
    
    console.log(`Wind analysis: ${headwindCount} headwind sections, ${tailwindCount} tailwind sections, ${crosswindCount} crosswind sections`);
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
            {headwindCount > 0 && (
              <Text style={styles.legendCount}>({headwindCount})</Text>
            )}
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.legendText}>Tailwind</Text>
            {tailwindCount > 0 && (
              <Text style={styles.legendCount}>({tailwindCount})</Text>
            )}
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
            <Text style={styles.legendText}>Crosswind</Text>
            {crosswindCount > 0 && (
              <Text style={styles.legendCount}>({crosswindCount})</Text>
            )}
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
    legendCount: {
      fontSize: 9,
      color: 'rgba(255, 255, 255, 0.7)',
      fontFamily: 'Roboto_400Regular',
      marginLeft: 2,
    },
  });
}
