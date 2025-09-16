
import React, { useRef } from 'react';
import { Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle, Animated } from 'react-native';
import { getColors, getButtonStyles, animations, spacing, borderRadius } from '../styles/commonStyles';
import { useTheme } from '../state/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

interface ButtonProps {
  text: string;
  onPress: () => void;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle;
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
}

export default function Button({ 
  text, 
  onPress, 
  style, 
  textStyle, 
  variant = 'primary',
  disabled = false,
  loading = false 
}: ButtonProps) {
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const buttonStyles = getButtonStyles(isDark);
  
  const scaleValue = useRef(new Animated.Value(1)).current;
  const opacityValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled || loading) return;
    
    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: animations.scale.pressed,
        tension: animations.spring.tension,
        friction: animations.spring.friction,
        useNativeDriver: true,
      }),
      Animated.timing(opacityValue, {
        toValue: animations.opacity.pressed,
        duration: animations.timingFast.duration,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    if (disabled || loading) return;
    
    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: animations.scale.normal,
        tension: animations.spring.tension,
        friction: animations.spring.friction,
        useNativeDriver: true,
      }),
      Animated.timing(opacityValue, {
        toValue: animations.opacity.normal,
        duration: animations.timingFast.duration,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const getButtonStyle = () => {
    switch (variant) {
      case 'primary':
        return buttonStyles.primary;
      case 'secondary':
        return buttonStyles.secondary;
      case 'accent':
        return buttonStyles.accent;
      case 'ghost':
        return buttonStyles.ghost;
      default:
        return buttonStyles.primary;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'primary':
        return buttonStyles.text;
      case 'secondary':
        return buttonStyles.textSecondary;
      case 'accent':
        return buttonStyles.textAccent;
      case 'ghost':
        return buttonStyles.textGhost;
      default:
        return buttonStyles.text;
    }
  };

  const getGradientColors = () => {
    switch (variant) {
      case 'primary':
        return [colors.primary, colors.primaryLight];
      case 'accent':
        return [colors.accent, colors.accentLight];
      case 'secondary':
      case 'ghost':
        return [colors.backgroundAlt, colors.backgroundTertiary];
      default:
        return [colors.primary, colors.primaryLight];
    }
  };

  const shouldUseGradient = variant === 'primary' || variant === 'accent';

  return (
    <Animated.View style={[
      { transform: [{ scale: scaleValue }], opacity: opacityValue },
      disabled && { opacity: animations.opacity.disabled }
    ]}>
      <TouchableOpacity
        style={[
          styles.button,
          getButtonStyle(),
          style,
          disabled && styles.disabled,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        disabled={disabled || loading}
      >
        {shouldUseGradient ? (
          <LinearGradient
            colors={getGradientColors()}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientBackground}
          >
            <Text style={[getTextStyle(), textStyle, disabled && styles.disabledText]}>
              {loading ? 'Loading...' : text}
            </Text>
          </LinearGradient>
        ) : (
          <Text style={[getTextStyle(), textStyle, disabled && styles.disabledText]}>
            {loading ? 'Loading...' : text}
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    overflow: 'hidden',
    position: 'relative',
  },
  gradientBackground: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
  },
  disabled: {
    opacity: animations.opacity.disabled,
  },
  disabledText: {
    opacity: animations.opacity.disabled,
  },
});
