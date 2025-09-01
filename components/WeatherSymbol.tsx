
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

// Enhanced weather code mapping with animation types
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
      color: isNight ? '#E6E6FA' : '#FFD700',
      description: isNight ? 'Clear night' : 'Clear sky',
      animationType: isNight ? 'glow' : 'rotate'
    };
  }
  
  // Mainly clear (1)
  if (code === 1) {
    return { 
      name: isNight ? 'partly-sunny' : 'partly-sunny', 
      color: isNight ? '#B0C4DE' : '#FFA500',
      description: isNight ? 'Mostly clear night' : 'Mostly clear',
      animationType: 'float'
    };
  }
  
  // Partly cloudy (2)
  if (code === 2) {
    return { 
      name: isNight ? 'cloudy-night' : 'partly-sunny', 
      color: isNight ? '#708090' : '#87CEEB',
      description: 'Partly cloudy',
      animationType: 'float'
    };
  }
  
  // Overcast (3)
  if (code === 3) {
    return { 
      name: 'cloudy', 
      color: '#696969',
      description: 'Overcast',
      animationType: 'float'
    };
  }
  
  // Fog (45, 48)
  if (code >= 45 && code <= 48) {
    return { 
      name: isNight ? 'cloudy-night' : 'cloudy', 
      color: isNight ? '#A9A9A9' : '#D3D3D3',
      description: code === 48 ? 'Depositing rime fog' : 'Fog',
      animationType: 'pulse'
    };
  }
  
  // Drizzle: Light (51), moderate (53), dense (55)
  if (code >= 51 && code <= 55) {
    const intensity = code === 51 ? 'Light' : code === 53 ? 'Moderate' : 'Dense';
    return { 
      name: 'rainy', 
      color: code === 51 ? '#87CEEB' : code === 53 ? '#4682B4' : '#5F9EA0',
      description: `${intensity} drizzle`,
      animationType: 'bounce'
    };
  }
  
  // Freezing drizzle: Light (56), dense (57)
  if (code >= 56 && code <= 57) {
    return { 
      name: 'rainy', 
      color: '#B0E0E6',
      description: code === 56 ? 'Light freezing drizzle' : 'Dense freezing drizzle',
      animationType: 'shake'
    };
  }
  
  // Rain: Slight (61), moderate (63), heavy (65)
  if (code >= 61 && code <= 65) {
    const intensity = code === 61 ? 'Light' : code === 63 ? 'Moderate' : 'Heavy';
    const colorMap = { 61: '#5F9EA0', 63: '#4682B4', 65: '#191970' };
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
      color: code === 66 ? '#4169E1' : '#0000CD',
      description: code === 66 ? 'Light freezing rain' : 'Heavy freezing rain',
      animationType: 'shake'
    };
  }
  
  // Snow fall: Slight (71), moderate (73), heavy (75)
  if (code >= 71 && code <= 75) {
    const intensity = code === 71 ? 'Light' : code === 73 ? 'Moderate' : 'Heavy';
    const colorMap = { 71: '#F0F8FF', 73: '#E0E0E0', 75: '#D3D3D3' };
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
      color: '#DCDCDC',
      description: 'Snow grains',
      animationType: 'shake'
    };
  }
  
  // Rain showers: Slight (80), moderate (81), violent (82)
  if (code >= 80 && code <= 82) {
    const intensity = code === 80 ? 'Light' : code === 81 ? 'Moderate' : 'Heavy';
    const colorMap = { 80: '#6495ED', 81: '#4169E1', 82: '#0000CD' };
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
      color: code === 85 ? '#F5F5F5' : '#E0E0E0',
      description: code === 85 ? 'Light snow showers' : 'Heavy snow showers',
      animationType: 'float'
    };
  }
  
  // Thunderstorm: Slight/moderate (95), with slight hail (96), with heavy hail (99)
  if (code >= 95 && code <= 99) {
    const severity = code === 95 ? 'Moderate' : code === 96 ? 'With light hail' : 'With heavy hail';
    const colorMap = { 95: '#8B008B', 96: '#4B0082', 99: '#2E0854' };
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
    color: isNight ? '#C0C0C0' : '#D3D3D3',
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
            duration: 8000, 
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
            withTiming(1.1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
            withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          false
        );
        break;
        
      case 'bounce':
        // Bouncing for rain
        translateY.value = withRepeat(
          withSequence(
            withSpring(-3, { damping: 8, stiffness: 100 }),
            withSpring(0, { damping: 8, stiffness: 100 })
          ),
          -1,
          false
        );
        break;
        
      case 'float':
        // Gentle floating for clouds and snow
        translateY.value = withRepeat(
          withSequence(
            withTiming(-2, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
            withTiming(2, { duration: 3000, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );
        break;
        
      case 'shake':
        // Shaking for thunderstorms and freezing conditions
        animationValue.value = withRepeat(
          withSequence(
            withTiming(1, { duration: 100 }),
            withTiming(-1, { duration: 100 }),
            withTiming(1, { duration: 100 }),
            withTiming(0, { duration: 100 })
          ),
          -1,
          false
        );
        break;
        
      case 'glow':
        // Gentle glow for moon
        opacity.value = withRepeat(
          withSequence(
            withTiming(0.7, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
            withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          false
        );
        break;
        
      default:
        // No animation
        break;
    }
  }, [animationType, animationValue, rotationValue, scaleValue, translateY, opacity]);

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
  // Validate and sanitize inputs
  const validatedCode = typeof weatherCode === 'number' && !isNaN(weatherCode) ? weatherCode : 0;
  const validatedSize = typeof size === 'number' && size > 0 ? size : 24;
  
  // Determine if it's night time with enhanced detection
  const nightTime = isNight !== undefined ? isNight : isNightTime(latitude, longitude, time);
  
  const symbol = getWeatherSymbol(validatedCode, nightTime);
  const iconColor = color || symbol.color;
  
  // Always call the hook unconditionally - Fixed: moved outside of try-catch
  const animatedStyle = useWeatherAnimation(symbol.animationType);
  
  try {
    console.log('WeatherSymbol: Rendering animated', symbol.name, 'for code', validatedCode, 'isNight:', nightTime, 'animation:', symbol.animationType);
    
    return (
      <View style={styles.container}>
        <Animated.View style={[animatedStyle]}>
          <Ionicons 
            name={symbol.name} 
            size={validatedSize} 
            color={iconColor}
            accessibilityLabel={symbol.description}
          />
        </Animated.View>
      </View>
    );
  } catch (error) {
    console.error('WeatherSymbol: Error rendering symbol:', error);
    // Fallback to a simple cloud icon
    return (
      <View style={styles.container}>
        <Ionicons 
          name="cloud-outline" 
          size={size || 24} 
          color={color || colors.textMuted} 
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
