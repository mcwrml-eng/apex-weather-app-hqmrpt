
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/commonStyles';

interface Props {
  weatherCode: number;
  size?: number;
  color?: string;
}

// Weather code mapping based on WMO Weather interpretation codes
// https://open-meteo.com/en/docs
function getWeatherSymbol(code: number): { name: keyof typeof Ionicons.glyphMap; color: string } {
  console.log('WeatherSymbol: Getting symbol for code', code);
  
  // Clear sky
  if (code === 0) {
    return { name: 'sunny', color: colors.warning };
  }
  
  // Mainly clear, partly cloudy, and overcast
  if (code >= 1 && code <= 3) {
    if (code === 1) return { name: 'partly-sunny', color: colors.warning };
    if (code === 2) return { name: 'cloudy', color: colors.textMuted };
    return { name: 'cloudy', color: colors.textMuted };
  }
  
  // Fog and depositing rime fog
  if (code >= 45 && code <= 48) {
    return { name: 'cloudy', color: colors.textMuted };
  }
  
  // Drizzle: Light, moderate, and dense intensity
  if (code >= 51 && code <= 57) {
    return { name: 'rainy', color: colors.precipitation };
  }
  
  // Rain: Slight, moderate and heavy intensity
  if (code >= 61 && code <= 67) {
    if (code <= 63) return { name: 'rainy', color: colors.precipitation };
    return { name: 'rainy', color: colors.precipitation };
  }
  
  // Snow fall: Slight, moderate, and heavy intensity
  if (code >= 71 && code <= 77) {
    return { name: 'snow', color: colors.precipitation };
  }
  
  // Rain showers: Slight, moderate, and violent
  if (code >= 80 && code <= 82) {
    return { name: 'rainy', color: colors.precipitation };
  }
  
  // Snow showers slight and heavy
  if (code >= 85 && code <= 86) {
    return { name: 'snow', color: colors.precipitation };
  }
  
  // Thunderstorm: Slight or moderate
  if (code >= 95 && code <= 99) {
    return { name: 'thunderstorm', color: colors.error };
  }
  
  // Default fallback
  console.log('WeatherSymbol: Unknown weather code, using default', code);
  return { name: 'partly-sunny', color: colors.textMuted };
}

export default function WeatherSymbol({ weatherCode, size = 24, color }: Props) {
  const symbol = getWeatherSymbol(weatherCode);
  const iconColor = color || symbol.color;
  
  console.log('WeatherSymbol: Rendering', symbol.name, 'for code', weatherCode);
  
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
