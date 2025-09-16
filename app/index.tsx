
import { getColors, getCommonStyles, spacing, borderRadius, getShadows } from '../styles/commonStyles';
import React, { useEffect, useState } from 'react';
import Logo from '../components/Logo';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import WeatherSymbol from '../components/WeatherSymbol';
import { useTheme } from '../state/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';

export default function CoverPage() {
  const [fadeAnim] = useState(new Animated.Value(0));
  const { isDark } = useTheme();
  
  const colors = getColors(isDark);
  const commonStyles = getCommonStyles(isDark);
  const shadows = getShadows(isDark);
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    gradient: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
    },
    themeToggleContainer: {
      position: 'absolute',
      top: 60,
      right: spacing.lg,
      zIndex: 10,
    },
    content: {
      alignItems: 'center',
      maxWidth: 400,
      width: '100%',
    },
    logoContainer: {
      marginBottom: spacing.huge,
      alignItems: 'center',
    },
    title: {
      fontSize: 42,
      fontWeight: '800',
      color: colors.text,
      textAlign: 'center',
      marginBottom: spacing.md,
      fontFamily: 'Roboto_700Bold',
      letterSpacing: -1.5,
    },
    subtitle: {
      fontSize: 18,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: spacing.massive,
      fontFamily: 'Roboto_400Regular',
      lineHeight: 26,
    },
    weatherContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
      marginBottom: spacing.massive,
    },
    weatherItem: {
      alignItems: 'center',
      padding: spacing.lg,
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.borderLight,
      boxShadow: shadows.sm,
      minWidth: 80,
    },
    weatherLabel: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: spacing.sm,
      fontFamily: 'Roboto_400Regular',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    continueButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.xxxl,
      paddingVertical: spacing.lg,
      borderRadius: borderRadius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: `0 6px 20px ${colors.primaryGlow}`,
      borderWidth: 0,
      minWidth: 200,
    },
    continueText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '600',
      fontFamily: 'Roboto_500Medium',
      letterSpacing: 0.3,
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: spacing.xl,
    },
    loadingText: {
      color: colors.textMuted,
      fontSize: 14,
      marginLeft: spacing.sm,
      fontFamily: 'Roboto_400Regular',
    },
  });

  useEffect(() => {
    console.log('CoverPage: Starting fade animation with theme:', isDark ? 'dark' : 'light');
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Auto-navigate after 3 seconds
    const timer = setTimeout(() => {
      console.log('CoverPage: Auto-navigating to F1 tab');
      router.replace('/(tabs)/f1');
    }, 3000);

    return () => clearTimeout(timer);
  }, [fadeAnim]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={colors.gradientHero}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.themeToggleContainer}>
          <ThemeToggle />
        </View>
        
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <View style={styles.logoContainer}>
            <Logo />
          </View>

          <Text style={styles.title}>
            RaceWeather Pro
          </Text>
          
          <Text style={styles.subtitle}>
            Professional weather forecasting for motorsport circuits worldwide
          </Text>

          <View style={styles.weatherContainer}>
            <View style={styles.weatherItem}>
              <WeatherSymbol weatherCode={1} size={32} />
              <Text style={styles.weatherLabel}>Clear</Text>
            </View>
            <View style={styles.weatherItem}>
              <WeatherSymbol weatherCode={61} size={32} />
              <Text style={styles.weatherLabel}>Rain</Text>
            </View>
            <View style={styles.weatherItem}>
              <WeatherSymbol weatherCode={71} size={32} />
              <Text style={styles.weatherLabel}>Snow</Text>
            </View>
          </View>

          <Animated.View style={[styles.continueButton, { opacity: fadeAnim }]}>
            <Text style={styles.continueText}>
              Enter App
            </Text>
          </Animated.View>

          <View style={styles.loadingContainer}>
            <Ionicons 
              name="time" 
              size={16} 
              color={colors.textMuted} 
            />
            <Text style={styles.loadingText}>
              Loading weather data...
            </Text>
          </View>
        </Animated.View>
      </LinearGradient>
    </View>
  );
}
