
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

// Weather code mapping based on WMO Weather interpretation codes
// https://open-meteo.com/en/docs
function getWeatherSymbol(code: number, isNight: boolean = false): { name: keyof typeof Ionicons.glyphMap; color: string } {
  console.log('WeatherSymbol: Getting symbol for code', code, 'isNight:', isNight);
  
  // Clear sky
  if (code === 0) {
    return { 
      name: isNight ? 'moon' : 'sunny', 
      color: isNight ? colors.secondary : colors.warning 
    };
  }
  
  // Mainly clear, partly cloudy, and overcast
  if (code >= 1 && code <= 3) {
    if (code === 1) {
      return { 
        name: isNight ? 'partly-sunny' : 'partly-sunny', 
        color: isNight ? colors.secondary : colors.warning 
      };
    }
    if (code === 2) {
      return { 
        name: isNight ? 'cloudy-night' : 'cloudy', 
        color: isNight ? colors.secondary : colors.textMuted 
      };
    }
    return { name: 'cloudy', color: colors.textMuted };
  }
  
  // Fog and depositing rime fog
  if (code >= 45 && code <= 48) {
    return { 
      name: isNight ? 'cloudy-night' : 'cloudy', 
      color: isNight ? colors.secondary : colors.textMuted 
    };
  }
  
  // Drizzle: Light, moderate, and dense intensity
  if (code >= 51 && code <= 57) {
    return { 
      name: isNight ? 'rainy' : 'rainy', 
      color: colors.precipitation 
    };
  }
  
  // Rain: Slight, moderate and heavy intensity
  if (code >= 61 && code <= 67) {
    return { 
      name: isNight ? 'rainy' : 'rainy', 
      color: colors.precipitation 
    };
  }
  
  // Snow fall: Slight, moderate, and heavy intensity
  if (code >= 71 && code <= 77) {
    return { 
      name: 'snow', 
      color: colors.precipitation 
    };
  }
  
  // Rain showers: Slight, moderate, and violent
  if (code >= 80 && code <= 82) {
    return { 
      name: isNight ? 'rainy' : 'rainy', 
      color: colors.precipitation 
    };
  }
  
  // Snow showers slight and heavy
  if (code >= 85 && code <= 86) {
    return { 
      name: 'snow', 
      color: colors.precipitation 
    };
  }
  
  // Thunderstorm: Slight or moderate
  if (code >= 95 && code <= 99) {
    return { 
      name: 'thunderstorm', 
      color: colors.error 
    };
  }
  
  // Default fallback
  console.log('WeatherSymbol: Unknown weather code, using default', code);
  return { 
    name: isNight ? 'moon' : 'partly-sunny', 
    color: isNight ? colors.secondary : colors.textMuted 
  };
}

export default function WeatherSymbol({ weatherCode, size = 24, color, isNight, latitude, longitude }: Props) {
  // Determine if it's night time
  const nightTime = isNight !== undefined ? isNight : isNightTime(latitude, longitude);
  
  const symbol = getWeatherSymbol(weatherCode, nightTime);
  const iconColor = color || symbol.color;
  
  console.log('WeatherSymbol: Rendering', symbol.name, 'for code', weatherCode, 'isNight:', nightTime);
  
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
