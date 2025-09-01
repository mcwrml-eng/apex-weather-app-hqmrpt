
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors, commonStyles, spacing, borderRadius, shadows } from '../styles/commonStyles';
import WeatherSymbol from '../components/WeatherSymbol';

const { width, height } = Dimensions.get('window');

export default function CoverPage() {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [slideAnim] = useState(new Animated.Value(50));
  const [loadingProgress] = useState(new Animated.Value(0));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('CoverPage: Starting animations');
    
    // Start entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Start loading animation
    Animated.timing(loadingProgress, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: false,
    }).start();

    // Navigate to main app after loading
    const timer = setTimeout(() => {
      console.log('CoverPage: Loading complete, navigating to main app');
      setIsLoading(false);
      router.replace('/(tabs)/f1');
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={['#0A0E13', '#1A2332', '#0A0E13']}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Animated Background Elements */}
      <View style={styles.backgroundElements}>
        {/* Racing Track Lines */}
        <Animated.View 
          style={[
            styles.trackLine,
            styles.trackLine1,
            {
              opacity: fadeAnim,
              transform: [{ translateX: slideAnim }]
            }
          ]}
        />
        <Animated.View 
          style={[
            styles.trackLine,
            styles.trackLine2,
            {
              opacity: fadeAnim,
              transform: [{ translateX: Animated.multiply(slideAnim, -1) }]
            }
          ]}
        />
        
        {/* Weather Elements */}
        <Animated.View 
          style={[
            styles.weatherElement,
            styles.weatherElement1,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <WeatherSymbol weatherCode={1} size={40} color={colors.accent} />
        </Animated.View>
        
        <Animated.View 
          style={[
            styles.weatherElement,
            styles.weatherElement2,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <WeatherSymbol weatherCode={61} size={30} color={colors.precipitation} />
        </Animated.View>

        <Animated.View 
          style={[
            styles.weatherElement,
            styles.weatherElement3,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <Ionicons name="flash" size={35} color={colors.warning} />
        </Animated.View>
      </View>

      {/* Main Content */}
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: slideAnim }
            ]
          }
        ]}
      >
        {/* App Logo/Icon */}
        <View style={styles.logoContainer}>
          <LinearGradient
            colors={colors.gradientF1}
            style={styles.logoBackground}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="speedometer" size={60} color="#FFFFFF" />
          </LinearGradient>
        </View>

        {/* App Title */}
        <Text style={styles.appTitle}>RaceWeather</Text>
        <Text style={styles.appSubtitle}>Motorsport Weather Forecasting</Text>

        {/* Feature Icons */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: colors.f1Red }]}>
              <Ionicons name="car-sport" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.featureText}>Formula 1</Text>
          </View>
          
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: colors.motogpBlue }]}>
              <Ionicons name="bicycle" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.featureText}>MotoGP</Text>
          </View>
          
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: colors.precipitation }]}>
              <Ionicons name="rainy" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.featureText}>Weather</Text>
          </View>
        </View>
      </Animated.View>

      {/* Loading Section */}
      <Animated.View 
        style={[
          styles.loadingContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <Text style={styles.loadingText}>
          {isLoading ? 'Loading circuits...' : 'Ready to race!'}
        </Text>
        
        {/* Loading Bar */}
        <View style={styles.loadingBarContainer}>
          <Animated.View 
            style={[
              styles.loadingBar,
              {
                width: loadingProgress.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              }
            ]}
          />
        </View>
        
        {/* Loading Percentage */}
        <Animated.Text style={styles.loadingPercentage}>
          {loadingProgress.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 100],
          }).interpolate({
            inputRange: [0, 100],
            outputRange: ['0%', '100%'],
          })}
        </Animated.Text>
      </Animated.View>

      {/* Racing Flag Animation */}
      <Animated.View 
        style={[
          styles.flagContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <View style={styles.checkeredFlag}>
          <View style={[styles.flagSquare, styles.flagBlack]} />
          <View style={[styles.flagSquare, styles.flagWhite]} />
          <View style={[styles.flagSquare, styles.flagWhite]} />
          <View style={[styles.flagSquare, styles.flagBlack]} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  backgroundElements: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  trackLine: {
    position: 'absolute',
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  trackLine1: {
    width: width * 0.6,
    top: height * 0.2,
    left: -width * 0.1,
    transform: [{ rotate: '15deg' }],
  },
  trackLine2: {
    width: width * 0.8,
    bottom: height * 0.25,
    right: -width * 0.2,
    transform: [{ rotate: '-10deg' }],
  },
  weatherElement: {
    position: 'absolute',
  },
  weatherElement1: {
    top: height * 0.15,
    right: width * 0.1,
  },
  weatherElement2: {
    bottom: height * 0.3,
    left: width * 0.1,
  },
  weatherElement3: {
    top: height * 0.4,
    left: width * 0.05,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  logoContainer: {
    marginBottom: spacing.xxl,
  },
  logoBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    ...commonStyles.shadowLg,
  },
  appTitle: {
    ...commonStyles.displayLarge,
    marginBottom: spacing.sm,
    textAlign: 'center',
    color: colors.text,
  },
  appSubtitle: {
    ...commonStyles.subtitle,
    marginBottom: spacing.xxxl,
    textAlign: 'center',
    color: colors.textSecondary,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    maxWidth: 300,
    marginBottom: spacing.huge,
  },
  featureItem: {
    alignItems: 'center',
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    ...commonStyles.shadowMd,
  },
  featureText: {
    ...commonStyles.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
  loadingContainer: {
    position: 'absolute',
    bottom: height * 0.15,
    alignItems: 'center',
    width: '80%',
  },
  loadingText: {
    ...commonStyles.bodyMedium,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  loadingBarContainer: {
    width: '100%',
    height: 4,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 2,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  loadingBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  loadingPercentage: {
    ...commonStyles.caption,
    color: colors.textMuted,
  },
  flagContainer: {
    position: 'absolute',
    top: height * 0.1,
    left: width * 0.1,
  },
  checkeredFlag: {
    width: 40,
    height: 30,
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderRadius: 4,
    overflow: 'hidden',
    ...commonStyles.shadowMd,
  },
  flagSquare: {
    width: 20,
    height: 15,
  },
  flagBlack: {
    backgroundColor: '#000000',
  },
  flagWhite: {
    backgroundColor: '#FFFFFF',
  },
});
