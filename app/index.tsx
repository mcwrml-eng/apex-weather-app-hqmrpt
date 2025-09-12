
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors, commonStyles, spacing, borderRadius, shadows } from '../styles/commonStyles';
import WeatherSymbol from '../components/WeatherSymbol';
import Logo from '../components/Logo';

const { width, height } = Dimensions.get('window');

export default function CoverPage() {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.9));
  const [slideAnim] = useState(new Animated.Value(30));
  const [loadingProgress] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('CoverPage: Starting enhanced animations with M9 logo (no rotation)');
    
    // Start entrance animations with staggered timing
    Animated.stagger(200, [
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 120,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Start pulsing animation for logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Start loading animation
    Animated.timing(loadingProgress, {
      toValue: 1,
      duration: 2800,
      useNativeDriver: false,
    }).start();

    // Navigate to main app after loading
    const timer = setTimeout(() => {
      console.log('CoverPage: Loading complete, navigating to main app');
      setIsLoading(false);
      
      // Fade out animation before navigation
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        router.replace('/(tabs)/f1');
      });
    }, 3200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* Enhanced Background Gradient - Light theme */}
      <LinearGradient
        colors={colors.gradientLight}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Subtle background pattern */}
      <View style={styles.backgroundPattern}>
        <View style={styles.patternDot} />
        <View style={[styles.patternDot, styles.patternDot2]} />
        <View style={[styles.patternDot, styles.patternDot3]} />
        <View style={[styles.patternDot, styles.patternDot4]} />
      </View>

      {/* Enhanced Animated Background Elements */}
      <View style={styles.backgroundElements}>
        {/* Modern racing lines with light theme colors */}
        <Animated.View 
          style={[
            styles.trackLine,
            styles.trackLine1,
            {
              opacity: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.3],
              }),
              transform: [{ 
                translateX: slideAnim.interpolate({
                  inputRange: [0, 30],
                  outputRange: [0, -width * 0.1],
                })
              }]
            }
          ]}
        />
        <Animated.View 
          style={[
            styles.trackLine,
            styles.trackLine2,
            {
              opacity: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.2],
              }),
              transform: [{ 
                translateX: slideAnim.interpolate({
                  inputRange: [0, 30],
                  outputRange: [0, width * 0.1],
                })
              }]
            }
          ]}
        />
        
        {/* Enhanced weather elements with better positioning */}
        <Animated.View 
          style={[
            styles.weatherElement,
            styles.weatherElement1,
            {
              opacity: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.6],
              }),
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <View style={[styles.weatherElementBg, { backgroundColor: colors.primarySoft }]}>
            <WeatherSymbol weatherCode={1} size={32} color={colors.primary} />
          </View>
        </Animated.View>
        
        <Animated.View 
          style={[
            styles.weatherElement,
            styles.weatherElement2,
            {
              opacity: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.5],
              }),
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <View style={[styles.weatherElementBg, { backgroundColor: colors.secondarySoft }]}>
            <WeatherSymbol weatherCode={61} size={28} color={colors.secondary} />
          </View>
        </Animated.View>

        <Animated.View 
          style={[
            styles.weatherElement,
            styles.weatherElement3,
            {
              opacity: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.4],
              }),
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <View style={[styles.weatherElementBg, { backgroundColor: colors.accentSoft }]}>
            <Ionicons name="flash" size={26} color={colors.accent} />
          </View>
        </Animated.View>
      </View>

      {/* Enhanced Main Content */}
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
        {/* M9 Business Logo with enhanced animations (no rotation) */}
        <Animated.View 
          style={[
            styles.businessLogoContainer,
            {
              transform: [
                { scale: pulseAnim }
              ]
            }
          ]}
        >
          <View style={styles.logoWrapper}>
            <Logo size="xlarge" showBackground={true} />
            <View style={styles.logoGlow} />
          </View>
        </Animated.View>

        {/* Enhanced App Logo with pulsing animation */}
        <Animated.View 
          style={[
            styles.logoContainer,
            {
              transform: [{ scale: pulseAnim }]
            }
          ]}
        >
          <LinearGradient
            colors={colors.gradientHero}
            style={styles.logoBackground}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.logoInner}>
              <Ionicons name="speedometer" size={48} color="#FFFFFF" />
            </View>
          </LinearGradient>
          
          {/* Glow effect */}
          <View style={styles.appLogoGlow} />
        </Animated.View>

        {/* Enhanced App Title with better typography */}
        <View style={styles.titleContainer}>
          <Text style={styles.appTitle}>RaceWeather</Text>
          <Text style={styles.appSubtitle}>Professional Motorsport Weather Forecasting</Text>
          <Text style={styles.poweredBy}>Meteorological Services</Text>
          <View style={styles.titleAccent} />
        </View>

        {/* Enhanced Feature Icons with better layout */}
        <View style={styles.featuresContainer}>
          <Animated.View 
            style={[
              styles.featureItem,
              {
                transform: [{
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 30],
                    outputRange: [0, 10],
                  })
                }]
              }
            ]}
          >
            <LinearGradient
              colors={[colors.f1Red, colors.f1RedLight]}
              style={styles.featureIcon}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="car-sport" size={20} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.featureText}>Formula 1</Text>
            <Text style={styles.featureSubtext}>24 Circuits</Text>
          </Animated.View>
          
          <Animated.View 
            style={[
              styles.featureItem,
              {
                transform: [{
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 30],
                    outputRange: [0, 5],
                  })
                }]
              }
            ]}
          >
            <LinearGradient
              colors={[colors.motogpBlue, colors.motogpBlueLight]}
              style={styles.featureIcon}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="bicycle" size={20} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.featureText}>MotoGP</Text>
            <Text style={styles.featureSubtext}>22 Circuits</Text>
          </Animated.View>
          
          <Animated.View 
            style={[
              styles.featureItem,
              {
                transform: [{
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 30],
                    outputRange: [0, 8],
                  })
                }]
              }
            ]}
          >
            <LinearGradient
              colors={[colors.indycarBlue, colors.indycarBlueLight]}
              style={styles.featureIcon}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="speedometer" size={20} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.featureText}>IndyCar</Text>
            <Text style={styles.featureSubtext}>15 Circuits</Text>
          </Animated.View>
          
          <Animated.View 
            style={[
              styles.featureItem,
              {
                transform: [{
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 30],
                    outputRange: [0, 15],
                  })
                }]
              }
            ]}
          >
            <LinearGradient
              colors={[colors.precipitation, colors.precipitationLight]}
              style={styles.featureIcon}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="rainy" size={20} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.featureText}>Weather</Text>
            <Text style={styles.featureSubtext}>Real-time</Text>
          </Animated.View>
        </View>
      </Animated.View>

      {/* Enhanced Loading Section */}
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
        
        {/* Enhanced Loading Bar with gradient */}
        <View style={styles.loadingBarContainer}>
          <Animated.View style={styles.loadingBarTrack} />
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
          >
            <LinearGradient
              colors={colors.gradientPrimary}
              style={styles.loadingBarGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </Animated.View>
        </View>
        
        {/* Loading Percentage with better styling */}
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

      {/* Enhanced Racing Flag Animation */}
      <Animated.View 
        style={[
          styles.flagContainer,
          {
            opacity: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.8],
            }),
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
  backgroundPattern: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  patternDot: {
    position: 'absolute',
    width: 2,
    height: 2,
    backgroundColor: colors.divider,
    borderRadius: 1,
  },
  patternDot2: {
    top: '20%',
    left: '15%',
  },
  patternDot3: {
    top: '60%',
    right: '20%',
  },
  patternDot4: {
    bottom: '30%',
    left: '25%',
  },
  backgroundElements: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  trackLine: {
    position: 'absolute',
    height: 2,
    borderRadius: 1,
  },
  trackLine1: {
    width: width * 0.6,
    top: height * 0.2,
    left: -width * 0.1,
    backgroundColor: colors.primary,
    transform: [{ rotate: '15deg' }],
  },
  trackLine2: {
    width: width * 0.8,
    bottom: height * 0.25,
    right: -width * 0.2,
    backgroundColor: colors.secondary,
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
  weatherElementBg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    zIndex: 1,
  },
  businessLogoContainer: {
    marginBottom: spacing.xl,
    position: 'relative',
  },
  logoWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoGlow: {
    position: 'absolute',
    top: -15,
    left: -15,
    right: -15,
    bottom: -15,
    borderRadius: 50,
    backgroundColor: colors.primarySoft,
    zIndex: -1,
  },
  logoContainer: {
    marginBottom: spacing.xxl,
    position: 'relative',
  },
  logoBackground: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  appLogoGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 60,
    backgroundColor: colors.primarySoft,
    zIndex: -1,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: spacing.huge,
  },
  appTitle: {
    ...commonStyles.displayMedium,
    marginBottom: spacing.sm,
    textAlign: 'center',
    color: colors.text,
  },
  appSubtitle: {
    ...commonStyles.subtitle,
    marginBottom: spacing.sm,
    textAlign: 'center',
    color: colors.textSecondary,
    maxWidth: 280,
  },
  poweredBy: {
    ...commonStyles.caption,
    marginBottom: spacing.md,
    textAlign: 'center',
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  titleAccent: {
    width: 60,
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    maxWidth: 400,
    marginBottom: spacing.massive,
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    boxShadow: shadows.md,
  },
  featureText: {
    ...commonStyles.captionSmall,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  featureSubtext: {
    fontSize: 9,
    color: colors.textMuted,
    textAlign: 'center',
    fontFamily: 'Roboto_400Regular',
  },
  loadingContainer: {
    position: 'absolute',
    bottom: height * 0.12,
    alignItems: 'center',
    width: '80%',
    maxWidth: 280,
  },
  loadingText: {
    ...commonStyles.bodyMedium,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    textAlign: 'center',
    fontWeight: '500',
  },
  loadingBarContainer: {
    width: '100%',
    height: 6,
    position: 'relative',
    marginBottom: spacing.md,
    borderRadius: 3,
    overflow: 'hidden',
  },
  loadingBarTrack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.backgroundTertiary,
    borderRadius: 3,
  },
  loadingBar: {
    height: '100%',
    borderRadius: 3,
    overflow: 'hidden',
  },
  loadingBarGradient: {
    flex: 1,
    borderRadius: 3,
  },
  loadingPercentage: {
    ...commonStyles.caption,
    color: colors.textMuted,
    fontWeight: '500',
  },
  flagContainer: {
    position: 'absolute',
    top: height * 0.08,
    left: width * 0.08,
  },
  checkeredFlag: {
    width: 32,
    height: 24,
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: shadows.sm,
  },
  flagSquare: {
    width: 16,
    height: 12,
  },
  flagBlack: {
    backgroundColor: colors.text,
  },
  flagWhite: {
    backgroundColor: colors.background,
  },
});
