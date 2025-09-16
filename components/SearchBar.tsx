
import React, { useMemo, useRef } from 'react';
import { View, TextInput, StyleSheet, TextInputProps, TouchableOpacity, Platform, Animated } from 'react-native';
import { getColors, spacing, borderRadius, getShadows, getCommonStyles } from '../styles/commonStyles';
import { useTheme } from '../state/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface Props extends Omit<TextInputProps, 'onChange'> {
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
}

export default function SearchBar({ value, onChangeText, onClear, placeholder = 'Search circuits...', ...rest }: Props) {
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const shadows = getShadows(isDark);
  const commonStyles = getCommonStyles(isDark);
  
  const showClear = value.length > 0;
  const isFocused = value.length > 0;
  
  const focusAnimation = useRef(new Animated.Value(0)).current;
  const scaleAnimation = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.timing(focusAnimation, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, focusAnimation]);

  const handleFocus = () => {
    Animated.parallel([
      Animated.timing(focusAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.spring(scaleAnimation, {
        toValue: 1.02,
        tension: 300,
        friction: 20,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleBlur = () => {
    if (!value) {
      Animated.timing(focusAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
    
    Animated.spring(scaleAnimation, {
      toValue: 1,
      tension: 300,
      friction: 20,
      useNativeDriver: true,
    }).start();
  };

  const borderColor = focusAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.divider, colors.primary],
  });

  const glowOpacity = focusAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.3],
  });

  return (
    <Animated.View style={[
      styles.container,
      { 
        transform: [{ scale: scaleAnimation }],
        borderColor: borderColor,
      }
    ]}>
      {/* Glow effect */}
      <Animated.View 
        style={[
          styles.glowEffect,
          { opacity: glowOpacity }
        ]}
      />
      
      {/* Gradient background */}
      <LinearGradient
        colors={[colors.card, colors.cardElevated]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      />
      
      {/* Search icon */}
      <View style={styles.iconContainer}>
        <Animated.View style={{
          transform: [{
            scale: focusAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.1],
            })
          }]
        }}>
          <Ionicons 
            name="search" 
            size={20} 
            color={isFocused ? colors.primary : colors.textMuted} 
          />
        </Animated.View>
      </View>
      
      {/* Text input */}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        returnKeyType="search"
        clearButtonMode={Platform.OS === 'ios' ? 'while-editing' : 'never'}
        selectionColor={colors.primary}
        {...rest}
      />
      
      {/* Clear button */}
      {showClear && Platform.OS !== 'ios' && (
        <Animated.View
          style={{
            opacity: focusAnimation,
            transform: [{
              scale: focusAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              })
            }]
          }}
        >
          <TouchableOpacity
            accessibilityRole="button"
            onPress={onClear}
            style={styles.clearBtn}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={[colors.backgroundAlt, colors.backgroundTertiary]}
              style={styles.clearBtnGradient}
            >
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      )}
    </Animated.View>
  );
}

  const styles = StyleSheet.create({
    container: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderRadius: borderRadius.xl,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      marginBottom: spacing.xl,
      position: 'relative',
      overflow: 'hidden',
      boxShadow: shadows.md,
    },
    glowEffect: {
      position: 'absolute',
      top: -2,
      left: -2,
      right: -2,
      bottom: -2,
      borderRadius: borderRadius.xl + 2,
      backgroundColor: colors.primary,
      zIndex: -2,
    },
    gradientBackground: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: -1,
    },
    iconContainer: {
      width: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    input: {
      flex: 1,
      color: colors.text,
      fontFamily: 'Roboto_400Regular',
      fontSize: 16,
      lineHeight: 20,
      paddingVertical: 0, // Remove default padding
    } as any,
    clearBtn: {
      borderRadius: borderRadius.md,
      overflow: 'hidden',
    },
    clearBtnGradient: {
      padding: spacing.xs,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
