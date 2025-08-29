
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/commonStyles';

interface Props {
  weatherCode: number;
  size?: number;
  color?: string;
  isNight?: boolean;
  latitude?: number;
  longitude?: number;
  time?: string;
}

// Enhanced function to determine if it's nighttime based on time and location
function isNightTime(latitude?: number, longitude?: number, time?: string): boolean {
  if (!latitude || !longitude) {
    // Fallback to local time if no coordinates provided
    const hour = time ? new Date(time).getHours() : new Date().getHours();
    return hour < 6 || hour > 18; // Simple nighttime check
  }
  
  const date = time ? new Date(time) : new Date();
  const hour = date.getHours();
  
  // More accurate calculation based on location
  // Rough approximation: adjust for longitude (each 15 degrees = 1 hour)
  const timeZoneOffset = longitude / 15;
  const localHour = (hour + timeZoneOffset + 24) % 24;
  
  // Enhanced night detection: consider seasonal variations
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  const seasonalOffset = Math.sin((dayOfYear - 81) * 2 * Math.PI / 365) * 2; // +/- 2 hours seasonal variation
  
  const sunriseHour = 6 - seasonalOffset;
  const sunsetHour = 18 + seasonalOffset;
  
  return localHour < sunriseHour || localHour > sunsetHour;
}

// Enhanced weather code mapping with more detailed conditions and realistic colors
// Based on WMO Weather interpretation codes with motorsport-specific considerations
function getWeatherSymbol(code: number, isNight: boolean = false): { name: keyof typeof Ionicons.glyphMap; color: string; description: string } {
  console.log('WeatherSymbol: Getting enhanced symbol for code', code, 'isNight:', isNight);
  
  // Clear sky (0)
  if (code === 0) {
    return { 
      name: isNight ? 'moon' : 'sunny', 
      color: isNight ? '#E6E6FA' : '#FFD700', // Lavender for moon, Gold for sun
      description: isNight ? 'Clear night' : 'Clear sky'
    };
  }
  
  // Mainly clear (1)
  if (code === 1) {
    return { 
      name: isNight ? 'partly-sunny' : 'partly-sunny', 
      color: isNight ? '#B0C4DE' : '#FFA500', // Light steel blue for night, Orange for day
      description: isNight ? 'Mostly clear night' : 'Mostly clear'
    };
  }
  
  // Partly cloudy (2)
  if (code === 2) {
    return { 
      name: isNight ? 'cloudy-night' : 'partly-sunny', 
      color: isNight ? '#708090' : '#87CEEB', // Slate gray for night clouds, Sky blue for day clouds
      description: 'Partly cloudy'
    };
  }
  
  // Overcast (3)
  if (code === 3) {
    return { 
      name: 'cloudy', 
      color: '#696969', // Dim gray for overcast
      description: 'Overcast'
    };
  }
  
  // Fog (45, 48)
  if (code >= 45 && code <= 48) {
    return { 
      name: isNight ? 'cloudy-night' : 'cloudy', 
      color: isNight ? '#A9A9A9' : '#D3D3D3', // Dark gray for night fog, Light gray for day fog
      description: code === 48 ? 'Depositing rime fog' : 'Fog'
    };
  }
  
  // Drizzle: Light (51), moderate (53), dense (55)
  if (code >= 51 && code <= 55) {
    const intensity = code === 51 ? 'Light' : code === 53 ? 'Moderate' : 'Dense';
    return { 
      name: 'rainy', 
      color: code === 51 ? '#87CEEB' : code === 53 ? '#4682B4' : '#5F9EA0', // Sky blue to Steel blue
      description: `${intensity} drizzle`
    };
  }
  
  // Freezing drizzle: Light (56), dense (57)
  if (code >= 56 && code <= 57) {
    return { 
      name: 'rainy', 
      color: '#B0E0E6', // Powder blue for freezing conditions
      description: code === 56 ? 'Light freezing drizzle' : 'Dense freezing drizzle'
    };
  }
  
  // Rain: Slight (61), moderate (63), heavy (65)
  if (code >= 61 && code <= 65) {
    const intensity = code === 61 ? 'Light' : code === 63 ? 'Moderate' : 'Heavy';
    const colorMap = { 61: '#5F9EA0', 63: '#4682B4', 65: '#191970' }; // Cadet blue to Navy blue
    return { 
      name: 'rainy', 
      color: colorMap[code as keyof typeof colorMap],
      description: `${intensity} rain`
    };
  }
  
  // Freezing rain: Light (66), heavy (67)
  if (code >= 66 && code <= 67) {
    return { 
      name: 'rainy', 
      color: code === 66 ? '#4169E1' : '#0000CD', // Royal blue to Medium blue
      description: code === 66 ? 'Light freezing rain' : 'Heavy freezing rain'
    };
  }
  
  // Snow fall: Slight (71), moderate (73), heavy (75)
  if (code >= 71 && code <= 75) {
    const intensity = code === 71 ? 'Light' : code === 73 ? 'Moderate' : 'Heavy';
    const colorMap = { 71: '#F0F8FF', 73: '#E0E0E0', 75: '#D3D3D3 }; // Alice blue to Light gray
    return { 
      name: 'snow', 
      color: colorMap[code as keyof typeof colorMap],
      description: `${intensity} snow`
    };
  }
  
  // Snow grains (77)
  if (code === 77) {
    return { 
      name: 'snow', 
      color: '#DCDCDC', // Gainsboro
      description: 'Snow grains'
    };
  }
  
  // Rain showers: Slight (80), moderate (81), violent (82)
  if (code >= 80 && code <= 82) {
    const intensity = code === 80 ? 'Light' : code === 81 ? 'Moderate' : 'Heavy';
    const colorMap = { 80: '#6495ED', 81: '#4169E1', 82: '#0000CD }; // Cornflower blue to Medium blue
    return { 
      name: 'rainy', 
      color: colorMap[code as keyof typeof colorMap],
      description: `${intensity} rain showers`
    };
  }
  
  // Snow showers: Slight (85), heavy (86)
  if (code >= 85 && code <= 86) {
    return { 
      name: 'snow', 
      color: code === 85 ? '#F5F5F5' : '#E0E0E0', // White smoke for light, Light gray for heavy
      description: code === 85 ? 'Light snow showers' : 'Heavy snow showers'
    };
  }
  
  // Thunderstorm: Slight/moderate (95), with slight hail (96), with heavy hail (99)
  if (code >= 95 && code <= 99) {
    const severity = code === 95 ? 'Moderate' : code === 96 ? 'With light hail' : 'With heavy hail';
    const colorMap = { 95: '#8B008B', 96: '#4B0082', 99: '#2E0854' }; // Dark magenta to Dark indigo
    return { 
      name: 'thunderstorm', 
      color: colorMap[code as keyof typeof colorMap],
      description: `Thunderstorm ${severity.toLowerCase()}`
    };
  }
  
  // Default fallback
  console.log('WeatherSymbol: Unknown weather code, using default', code);
  return { 
    name: isNight ? 'moon' : 'partly-sunny', 
    color: isNight ? '#C0C0C0' : '#D3D3D3', // Silver for unknown conditions
    description: 'Unknown conditions'
  };
}

export default function WeatherSymbol({ weatherCode, size = 24, color, isNight, latitude, longitude, time }: Props) {
  // Determine if it's night time with enhanced detection
  const nightTime = isNight !== undefined ? isNight : isNightTime(latitude, longitude, time);
  
  const symbol = getWeatherSymbol(weatherCode, nightTime);
  const iconColor = color || symbol.color;
  
  console.log('WeatherSymbol: Rendering', symbol.name, 'for code', weatherCode, 'isNight:', nightTime, 'description:', symbol.description);
  
  return (
    <View style={styles.container}>
      <Ionicons 
        name={symbol.name} 
        size={size} 
        color={iconColor}
        accessibilityLabel={symbol.description}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
