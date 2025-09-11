
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  interpolate,
  Easing,
  withSpring,
} from 'react-native-reanimated';
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

// Enhanced weather code mapping with better light theme colors
function getWeatherSymbol(code: number, isNight: boolean = false): { 
  name: keyof typeof Ionicons.glyphMap; 
  color: string; 
  description: string;
  animationType: 'pulse' | 'rotate' | 'bounce' | 'float' | 'shake' | 'glow' | 'none';
} {
  console.log('WeatherSymbol: Getting enhanced symbol for code', code, 'isNight:', isNight);
  
  // Clear sky (0)
  if (code === 0) {
    return { 
      name: isNight ? 'moon' : 'sunny', 
      color: isNight ? colors.textMuted : colors.warning,
      description: isNight ? 'Clear night' : 'Clear sky',
      animationType: isNight ? 'glow' : 'rotate'
    };
  }
  
  // Mainly clear (1)
  if (code === 1) {
    return { 
      name: isNight ? 'partly-sunny' : 'partly-sunny', 
      color: isNight ? colors.textSecondary : colors.warningLight,
      description: isNight ? 'Mostly clear night' : 'Mostly clear',
      animationType: 'float'
    };
  }
  
  // Partly cloudy (2)
  if (code === 2) {
    return { 
      name: isNight ? 'cloudy-night' : 'partly-sunny', 
      color: isNight ? colors.textMuted : colors.info,
      description: 'Partly cloudy',
      animationType: 'float'
    };
  }
  
  // Overcast (3)
  if (code === 3) {
    return { 
      name: 'cloudy', 
      color: colors.textSecondary,
      description: 'Overcast',
      animationType: 'float'
    };
  }
  
  // Fog (45, 48)
  if (code >= 45 && code <= 48) {
    return { 
      name: isNight ? 'cloudy-night' : 'cloudy', 
      color: isNight ? colors.textMuted : colors.textSecondary,
      description: code === 48 ? 'Depositing rime fog' : 'Fog',
      animationType: 'pulse'
    };
  }
  
  // Drizzle: Light (51), moderate (53), dense (55)
  if (code >= 51 && code <= 55) {
    const intensity = code === 51 ? 'Light' : code === 53 ? 'Moderate' : 'Dense';
    const colorMap = { 
      51: colors.infoLight, 
      53: colors.info, 
      55: colors.infoDark 
    };
    return { 
      name: 'rainy', 
      color: colorMap[code as keyof typeof colorMap],
      description: `${intensity} drizzle`,
      animationType: 'bounce'
    };
  }
  
  // Freezing drizzle: Light (56), dense (57)
  if (code >= 56 && code <= 57) {
    return { 
      name: 'rainy', 
      color: colors.precipitationLight,
      description: code === 56 ? 'Light freezing drizzle' : 'Dense freezing drizzle',
      animationType: 'shake'
    };
  }
  
  // Rain: Slight (61), moderate (63), heavy (65)
  if (code >= 61 && code <= 65) {
    const intensity = code === 61 ? 'Light' : code === 63 ? 'Moderate' : 'Heavy';
    const colorMap = { 
      61: colors.precipitationLight, 
      63: colors.precipitation, 
      65: colors.precipitationDark 
    };
    return { 
      name: 'rainy', 
      color: colorMap[code as keyof typeof colorMap],
      description: `${intensity} rain`,
      animationType: 'bounce'
    };
  }
  
  // Freezing rain: Light (66), heavy (67)
  if (code >= 66 && code <= 67) {
    return { 
      name: 'rainy', 
      color: code === 66 ? colors.precipitation : colors.precipitationDark,
      description: code === 66 ? 'Light freezing rain' : 'Heavy freezing rain',
      animationType: 'shake'
    };
  }
  
  // Snow fall: Slight (71), moderate (73), heavy (75)
  if (code >= 71 && code <= 75) {
    const intensity = code === 71 ? 'Light' : code === 73 ? 'Moderate' : 'Heavy';
    const colorMap = { 
      71: colors.textDisabled, 
      73: colors.textMuted, 
      75: colors.textSecondary 
    };
    return { 
      name: 'snow', 
      color: colorMap[code as keyof typeof colorMap],
      description: `${intensity} snow`,
      animationType: 'float'
    };
  }
  
  // Snow grains (77)
  if (code === 77) {
    return { 
      name: 'snow', 
      color: colors.textMuted,
      description: 'Snow grains',
      animationType: 'shake'
    };
  }
  
  // Rain showers: Slight (80), moderate (81), violent (82)
  if (code >= 80 && code <= 82) {
    const intensity = code === 80 ? 'Light' : code === 81 ? 'Moderate' : 'Heavy';
    const colorMap = { 
      80: colors.precipitationLight, 
      81: colors.precipitation, 
      82: colors.precipitationDark 
    };
    return { 
      name: 'rainy', 
      color: colorMap[code as keyof typeof colorMap],
      description: `${intensity} rain showers`,
      animationType: 'bounce'
    };
  }
  
  // Snow showers: Slight (85), heavy (86)
  if (code >= 85 && code <= 86) {
    return { 
      name: 'snow', 
      color: code === 85 ? colors.textDisabled : colors.textMuted,
      description: code === 85 ? 'Light snow showers' : 'Heavy snow showers',
      animationType: 'float'
    };
  }
  
  // Thunderstorm: Slight/moderate (95), with slight hail (96), with heavy hail (99)
  if (code >= 95 && code <= 99) {
    const severity = code === 95 ? 'Moderate' : code === 96 ? 'With light hail' : 'With heavy hail';
    const colorMap = { 
      95: colors.pressureLight, 
      96: colors.pressure, 
      99: colors.pressureDark 
    };
    return { 
      name: 'thunderstorm', 
      color: colorMap[code as keyof typeof colorMap],
      description: `Thunderstorm ${severity.toLowerCase()}`,
      animationType: 'shake'
    };
  }
  
  // Default fallback
  console.log('WeatherSymbol: Unknown weather code, using default', code);
  return { 
    name: isNight ? 'moon' : 'partly-sunny', 
    color: isNight ? colors.textMuted : colors.textSecondary,
    description: 'Unknown conditions',
    animationType: 'none'
  };
}

// Animation hook for different weather effects
function useWeatherAnimation(animationType: string) {
  const animationValue = useSharedValue(0);
  const rotationValue = useSharedValue(0);
  const scaleValue = useSharedValue(1);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    console.log('WeatherSymbol: Starting animation type:', animationType);
    
    switch (animationType) {
      case 'rotate':
        // Continuous slow rotation for sun
        rotationValue.value = withRepeat(
          withTiming(360, { 
            duration: 12000, 
            easing: Easing.linear 
          }),
          -1,
          false
        );
        break;
        
      case 'pulse':
        // Gentle pulsing for fog/mist
        scaleValue.value = withRepeat(
          withSequence(
            withTiming(1.08, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
            withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          false
        );
        opacity.value = withRepeat(
          withSequence(
            withTiming(0.8, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
            withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          false
        );
        break;
        
      case 'bounce':
        // Bouncing for rain
        translateY.value = withRepeat(
          withSequence(
            withSpring(-2, { damping: 12, stiffness: 150 }),
            withSpring(0, { damping: 12, stiffness: 150 })
          ),
          -1,
          false
        );
        break;
        
      case 'float':
        // Gentle floating for clouds and snow
        translateY.value = withRepeat(
          withSequence(
            withTiming(-1.5, { duration: 3500, easing: Easing.inOut(Easing.ease) }),
            withTiming(1.5, { duration: 3500, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );
        scaleValue.value = withRepeat(
          withSequence(
            withTiming(1.02, { duration: 3500, easing: Easing.inOut(Easing.ease) }),
            withTiming(0.98, { duration: 3500, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );
        break;
        
      case 'shake':
        // Shaking for thunderstorms and freezing conditions
        animationValue.value = withRepeat(
          withSequence(
            withTiming(0.8, { duration: 80 }),
            withTiming(-0.8, { duration: 80 }),
            withTiming(0.8, { duration: 80 }),
            withTiming(0, { duration: 80 })
          ),
          -1,
          false
        );
        break;
        
      case 'glow':
        // Gentle glow for moon
        opacity.value = withRepeat(
          withSequence(
            withTiming(0.6, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
            withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          false
        );
        scaleValue.value = withRepeat(
          withSequence(
            withTiming(0.95, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
            withTiming(1.05, { duration: 3000, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          false
        );
        break;
        
      default:
        // No animation
        break;
    }
  }, [animationType, animationValue, opacity, rotationValue, scaleValue, translateY]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${rotationValue.value}deg` },
        { scale: scaleValue.value },
        { translateY: translateY.value },
        { translateX: animationValue.value },
      ],
      opacity: opacity.value,
    };
  });

  return animatedStyle;
}

export default function WeatherSymbol({ weatherCode, size = 24, color, isNight, latitude, longitude, time }: Props) {
  // Determine if it's night time with enhanced detection
  const nightTime = isNight !== undefined ? isNight : isNightTime(latitude, longitude, time);
  
  const symbol = getWeatherSymbol(weatherCode, nightTime);
  const iconColor = color || symbol.color;
  
  // Get animation style based on weather type
  const animatedStyle = useWeatherAnimation(symbol.animationType);
  
  console.log('WeatherSymbol: Rendering enhanced', symbol.name, 'for code', weatherCode, 'isNight:', nightTime, 'animation:', symbol.animationType);
  
  return (
    <View style={styles.container}>
      <Animated.View style={[animatedStyle]}>
        <Ionicons 
          name={symbol.name} 
          size={size} 
          color={iconColor}
          accessibilityLabel={symbol.description}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
