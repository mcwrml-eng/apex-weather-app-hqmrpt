
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  withSpring,
} from 'react-native-reanimated';
import { getColors } from '../styles/commonStyles';
import { useTheme } from '../state/ThemeContext';

interface Props {
  weatherCode: number;
  size?: number;
  color?: string;
  isNight?: boolean;
  latitude?: number;
  longitude?: number;
  time?: string;
  sunrise?: string;
  sunset?: string;
}

// Custom Thunderstorm Icon Component - Grey cloud with yellow thunderbolt
function ThunderstormIcon({ size = 24, isNight = false }: { size?: number; isNight?: boolean }) {
  const cloudColor = isNight ? '#64748B' : '#9CA3AF';
  const boltColor = '#FCD34D';
  
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M18.5 12c0-3.31-2.69-6-6-6-.55 0-1.07.08-1.57.23C9.84 4.45 8.22 3.5 6.5 3.5c-2.48 0-4.5 2.02-4.5 4.5 0 .34.04.67.11.98C.84 9.59 0 10.71 0 12c0 1.66 1.34 3 3 3h15c1.1 0 2-.9 2-2s-.9-2-1.5-2z"
        fill={cloudColor}
      />
      <Path
        d="M14 10h-2l1.5-3h-3l-2 5h2l-1.5 4z"
        fill={boltColor}
        stroke={boltColor}
        strokeWidth="0.5"
      />
    </Svg>
  );
}

// Enhanced function to determine if it's nighttime
function isNightTime(latitude?: number, longitude?: number, time?: string, sunrise?: string, sunset?: string): boolean {
  try {
    const currentTime = time ? new Date(time) : new Date();
    
    if (sunrise && sunset) {
      const currentDate = currentTime.toISOString().split('T')[0];
      const sunriseTime = new Date(`${currentDate}T${sunrise}`);
      const sunsetTime = new Date(`${currentDate}T${sunset}`);
      
      return currentTime < sunriseTime || currentTime > sunsetTime;
    }
    
    const hour = currentTime.getHours();
    return hour < 6 || hour > 18;
  } catch (error) {
    console.error('[WeatherSymbol] Error determining night time:', error);
    return false;
  }
}

// Weather code mapping
function getWeatherSymbol(code: number, isNight: boolean = false): { 
  name: keyof typeof Ionicons.glyphMap | 'custom-thunderstorm'; 
  color: string; 
  description: string;
  animationType: 'pulse' | 'rotate' | 'bounce' | 'float' | 'shake' | 'glow' | 'none';
} {
  if (code === 0) {
    return { 
      name: isNight ? 'moon' : 'sunny', 
      color: isNight ? '#E2E8F0' : '#FCD34D',
      description: isNight ? 'Clear night' : 'Clear sky',
      animationType: isNight ? 'glow' : 'rotate'
    };
  }
  
  if (code === 1) {
    return { 
      name: isNight ? 'moon' : 'partly-sunny', 
      color: isNight ? '#CBD5E1' : '#FBBF24',
      description: isNight ? 'Mostly clear night' : 'Mostly clear',
      animationType: isNight ? 'glow' : 'float'
    };
  }
  
  if (code === 2) {
    return { 
      name: isNight ? 'cloudy-night' : 'partly-sunny', 
      color: isNight ? '#94A3B8' : '#F59E0B',
      description: 'Partly cloudy',
      animationType: 'float'
    };
  }
  
  if (code === 3) {
    return { 
      name: 'cloudy', 
      color: isNight ? '#64748B' : '#6B7280',
      description: 'Overcast',
      animationType: 'float'
    };
  }
  
  if (code >= 45 && code <= 48) {
    return { 
      name: isNight ? 'cloudy-night' : 'cloudy', 
      color: isNight ? '#9CA3AF' : '#D1D5DB',
      description: code === 48 ? 'Depositing rime fog' : 'Fog',
      animationType: 'pulse'
    };
  }
  
  if (code >= 51 && code <= 55) {
    const colorMap = { 
      51: isNight ? '#64748B' : '#7DD3FC',
      53: isNight ? '#475569' : '#38BDF8',
      55: isNight ? '#334155' : '#0EA5E9'
    };
    return { 
      name: 'rainy', 
      color: colorMap[code as keyof typeof colorMap],
      description: 'Drizzle',
      animationType: 'bounce'
    };
  }
  
  if (code >= 56 && code <= 57) {
    return { 
      name: 'rainy', 
      color: isNight ? '#64748B' : '#A5F3FC',
      description: 'Freezing drizzle',
      animationType: 'shake'
    };
  }
  
  if (code >= 61 && code <= 65) {
    const colorMap = { 
      61: isNight ? '#64748B' : '#60A5FA',
      63: isNight ? '#475569' : '#3B82F6',
      65: isNight ? '#334155' : '#1D4ED8'
    };
    return { 
      name: 'rainy', 
      color: colorMap[code as keyof typeof colorMap],
      description: 'Rain',
      animationType: 'bounce'
    };
  }
  
  if (code >= 66 && code <= 67) {
    return { 
      name: 'rainy', 
      color: isNight ? '#64748B' : (code === 66 ? '#67E8F9' : '#22D3EE'),
      description: 'Freezing rain',
      animationType: 'shake'
    };
  }
  
  if (code >= 71 && code <= 75) {
    const colorMap = { 
      71: isNight ? '#E2E8F0' : '#F8FAFC',
      73: isNight ? '#CBD5E1' : '#E2E8F0',
      75: isNight ? '#94A3B8' : '#CBD5E1'
    };
    return { 
      name: 'snow', 
      color: colorMap[code as keyof typeof colorMap],
      description: 'Snow',
      animationType: 'float'
    };
  }
  
  if (code === 77) {
    return { 
      name: 'snow', 
      color: isNight ? '#94A3B8' : '#E5E7EB',
      description: 'Snow grains',
      animationType: 'shake'
    };
  }
  
  if (code >= 80 && code <= 82) {
    const colorMap = { 
      80: isNight ? '#64748B' : '#7DD3FC',
      81: isNight ? '#475569' : '#0EA5E9',
      82: isNight ? '#334155' : '#0284C7'
    };
    return { 
      name: 'rainy', 
      color: colorMap[code as keyof typeof colorMap],
      description: 'Rain showers',
      animationType: 'bounce'
    };
  }
  
  if (code >= 85 && code <= 86) {
    return { 
      name: 'snow', 
      color: isNight ? (code === 85 ? '#CBD5E1' : '#94A3B8') : (code === 85 ? '#F1F5F9' : '#E2E8F0'),
      description: 'Snow showers',
      animationType: 'float'
    };
  }
  
  if (code >= 95 && code <= 99) {
    return { 
      name: 'custom-thunderstorm', 
      color: '',
      description: 'Thunderstorm',
      animationType: 'shake'
    };
  }
  
  return { 
    name: isNight ? 'moon' : 'partly-sunny', 
    color: isNight ? '#94A3B8' : '#6B7280',
    description: 'Unknown conditions',
    animationType: 'none'
  };
}

// Simplified animation hook
function useWeatherAnimation(animationType: string) {
  const rotationValue = useSharedValue(0);
  const scaleValue = useSharedValue(1);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const translateX = useSharedValue(0);

  useEffect(() => {
    try {
      switch (animationType) {
        case 'rotate':
          rotationValue.value = withRepeat(
            withTiming(360, { duration: 12000, easing: Easing.linear }),
            -1,
            false
          );
          break;
          
        case 'pulse':
          scaleValue.value = withRepeat(
            withSequence(
              withTiming(1.08, { duration: 2500 }),
              withTiming(1, { duration: 2500 })
            ),
            -1,
            false
          );
          opacity.value = withRepeat(
            withSequence(
              withTiming(0.8, { duration: 2500 }),
              withTiming(1, { duration: 2500 })
            ),
            -1,
            false
          );
          break;
          
        case 'bounce':
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
          translateY.value = withRepeat(
            withSequence(
              withTiming(-1.5, { duration: 3500 }),
              withTiming(1.5, { duration: 3500 })
            ),
            -1,
            true
          );
          scaleValue.value = withRepeat(
            withSequence(
              withTiming(1.02, { duration: 3500 }),
              withTiming(0.98, { duration: 3500 })
            ),
            -1,
            true
          );
          break;
          
        case 'shake':
          translateX.value = withRepeat(
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
          opacity.value = withRepeat(
            withSequence(
              withTiming(0.6, { duration: 3000 }),
              withTiming(1, { duration: 3000 })
            ),
            -1,
            false
          );
          scaleValue.value = withRepeat(
            withSequence(
              withTiming(0.95, { duration: 3000 }),
              withTiming(1.05, { duration: 3000 })
            ),
            -1,
            false
          );
          break;
          
        default:
          break;
      }
    } catch (error) {
      console.error('[WeatherSymbol] Animation error:', error);
    }
  }, [animationType, rotationValue, scaleValue, translateY, opacity, translateX]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${rotationValue.value}deg` },
        { scale: scaleValue.value },
        { translateY: translateY.value },
        { translateX: translateX.value },
      ],
      opacity: opacity.value,
    };
  });

  return animatedStyle;
}

export default function WeatherSymbol({ 
  weatherCode, 
  size = 24, 
  color, 
  isNight, 
  latitude, 
  longitude, 
  time, 
  sunrise, 
  sunset 
}: Props) {
  const { isDark } = useTheme();
  
  const nightTime = isNight !== undefined ? isNight : isNightTime(latitude, longitude, time, sunrise, sunset);
  const symbol = getWeatherSymbol(weatherCode, nightTime);
  const iconColor = color || symbol.color;
  
  const animatedStyle = useWeatherAnimation(symbol.animationType);
  
  return (
    <View style={styles.container}>
      <Animated.View style={[animatedStyle]}>
        {symbol.name === 'custom-thunderstorm' ? (
          <ThunderstormIcon size={size} isNight={nightTime} />
        ) : (
          <Ionicons 
            name={symbol.name as keyof typeof Ionicons.glyphMap} 
            size={size} 
            color={iconColor}
            accessibilityLabel={symbol.description}
          />
        )}
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
