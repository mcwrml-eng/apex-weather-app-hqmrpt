
import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../state/ThemeContext';
import { getColors, spacing, borderRadius, animations } from '../styles/commonStyles';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  interpolateColor 
} from 'react-native-reanimated';

interface Props {
  size?: number;
  style?: any;
}

export default function ThemeToggle({ size = 28, style }: Props) {
  const { theme, toggleTheme, isDark } = useTheme();
  const colors = getColors(isDark);
  
  const animatedValue = useSharedValue(isDark ? 1 : 0);
  const scaleValue = useSharedValue(1);

  // Calculate container size based on icon size - made larger for better visibility
  const containerSize = Math.max(size * 1.8, 44);
  const isSmall = size < 20;

  React.useEffect(() => {
    console.log('ThemeToggle: Theme changed to', theme);
    animatedValue.value = withSpring(isDark ? 1 : 0, animations.spring);
  }, [isDark, theme, animatedValue]);

  const animatedIconStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      animatedValue.value,
      [0, 1],
      [colors.primarySoft, colors.backgroundTertiary]
    );

    const borderColor = interpolateColor(
      animatedValue.value,
      [0, 1],
      [colors.primary, colors.textMuted]
    );

    return {
      backgroundColor,
      borderColor,
      transform: [
        { scale: scaleValue.value },
        { rotate: `${animatedValue.value * 180}deg` }
      ],
    };
  });

  const handlePress = () => {
    console.log('ThemeToggle: Toggle pressed');
    
    // Scale animation for press feedback
    scaleValue.value = withSpring(0.9, { duration: 100 }, () => {
      scaleValue.value = withSpring(1, { duration: 200 });
    });
    
    toggleTheme();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[
        styles.container, 
        { 
          width: containerSize,
          height: containerSize,
          borderRadius: containerSize / 2,
        }, 
        style
      ]}
      activeOpacity={0.7}
    >
      <Animated.View style={[
        styles.iconContainer, 
        animatedIconStyle,
        {
          borderRadius: containerSize / 2,
          borderWidth: 2,
        }
      ]}>
        <Ionicons
          name={isDark ? 'moon' : 'sunny'}
          size={size}
          color={isDark ? colors.accent : colors.primary}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  iconContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
