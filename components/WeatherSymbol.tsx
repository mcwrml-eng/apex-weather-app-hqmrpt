
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
}

// Simple function to determine if it's nighttime based on current time and location
function isNightTime(latitude?: number, longitude?: number): boolean {
  if (!latitude || !longitude) {
    // Fallback to local time if no coordinates provided
    const hour = new Date().getHours();
    return hour < 6 || hour > 18; // Simple nighttime check
  }
  
  // More accurate calculation based on location
  const now = new Date();
  const hour = now.getHours();
  
  // Rough approximation: adjust for longitude (each 15 degrees = 1 hour)
  const timeZoneOffset = longitude / 15;
  const localHour = (hour + timeZoneOffset + 24) % 24;
  
  // Consider it night between 7 PM and 6 AM
  return localHour < 6 || localHour > 19;
}

// Weather code mapping based on WMO Weather interpretation codes with realistic colors
// https://open-meteo.com/en/docs
function getWeatherSymbol(code: number, isNight: boolean = false): { name: keyof typeof Ionicons.glyphMap; color: string } {
  console.log('WeatherSymbol: Getting symbol for code', code, 'isNight:', isNight);
  
  // Clear sky
  if (code === 0) {
    return { 
      name: isNight ? 'moon' : 'sunny', 
      color: isNight ? '#E6E6FA' : '#FFD700' // Lavender for moon, Gold for sun
    };
  }
  
  // Mainly clear, partly cloudy, and overcast
  if (code >= 1 && code <= 3) {
    if (code === 1) {
      return { 
        name: isNight ? 'partly-sunny' : 'partly-sunny', 
        color: isNight ? '#B0C4DE' : '#FFA500' // Light steel blue for night, Orange for day
      };
    }
    if (code === 2) {
      return { 
        name: isNight ? 'cloudy-night' : 'cloudy', 
        color: isNight ? '#708090' : '#87CEEB' // Slate gray for night clouds, Sky blue for day clouds
      };
    }
    return { 
      name: 'cloudy', 
      color: '#696969' // Dim gray for overcast
    };
  }
  
  // Fog and depositing rime fog
  if (code >= 45 && code <= 48) {
    return { 
      name: isNight ? 'cloudy-night' : 'cloudy', 
      color: isNight ? '#A9A9A9' : '#D3D3D3' // Dark gray for night fog, Light gray for day fog
    };
  }
  
  // Drizzle: Light, moderate, and dense intensity
  if (code >= 51 && code <= 57) {
    return { 
      name: isNight ? 'rainy' : 'rainy', 
      color: '#4682B4' // Steel blue for drizzle
    };
  }
  
  // Rain: Slight, moderate and heavy intensity
  if (code >= 61 && code <= 67) {
    const intensity = code <= 63 ? 'light' : code <= 65 ? 'moderate' : 'heavy';
    return { 
      name: isNight ? 'rainy' : 'rainy', 
      color: intensity === 'light' ? '#5F9EA0' : 
             intensity === 'moderate' ? '#4682B4' : '#191970' // Cadet blue to Navy blue based on intensity
    };
  }
  
  // Snow fall: Slight, moderate, and heavy intensity
  if (code >= 71 && code <= 77) {
    return { 
      name: 'snow', 
      color: '#F0F8FF' // Alice blue for snow
    };
  }
  
  // Rain showers: Slight, moderate, and violent
  if (code >= 80 && code <= 82) {
    const intensity = code === 80 ? 'light' : code === 81 ? 'moderate' : 'heavy';
    return { 
      name: isNight ? 'rainy' : 'rainy', 
      color: intensity === 'light' ? '#6495ED' : 
             intensity === 'moderate' ? '#4169E1' : '#0000CD' // Cornflower blue to Medium blue based on intensity
    };
  }
  
  // Snow showers slight and heavy
  if (code >= 85 && code <= 86) {
    return { 
      name: 'snow', 
      color: code === 85 ? '#F5F5F5' : '#E0E0E0' // White smoke for light snow, Light gray for heavy snow
    };
  }
  
  // Thunderstorm: Slight or moderate
  if (code >= 95 && code <= 99) {
    return { 
      name: 'thunderstorm', 
      color: code <= 96 ? '#8B008B' : '#4B0082' // Dark magenta for slight, Indigo for severe thunderstorms
    };
  }
  
  // Default fallback
  console.log('WeatherSymbol: Unknown weather code, using default', code);
  return { 
    name: isNight ? 'moon' : 'partly-sunny', 
    color: isNight ? '#C0C0C0' : '#D3D3D3' // Silver for unknown conditions
  };
}

export default function WeatherSymbol({ weatherCode, size = 24, color, isNight, latitude, longitude }: Props) {
  // Determine if it's night time
  const nightTime = isNight !== undefined ? isNight : isNightTime(latitude, longitude);
  
  const symbol = getWeatherSymbol(weatherCode, nightTime);
  const iconColor = color || symbol.color;
  
  console.log('WeatherSymbol: Rendering', symbol.name, 'for code', weatherCode, 'isNight:', nightTime, 'color:', iconColor);
  
  return (
    <View style={styles.container}>
      <Ionicons 
        name={symbol.name} 
        size={size} 
        color={iconColor}
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
