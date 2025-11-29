
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useWeather } from '../hooks/useWeather';
import WeatherSymbol from './WeatherSymbol';
import { getColors, spacing, borderRadius, getShadows } from '../styles/commonStyles';
import { useUnit } from '../state/UnitContext';
import { useTheme } from '../state/ThemeContext';
import { useLanguage } from '../state/LanguageContext';
import { Circuit, Category } from './CircuitCard';

interface Props {
  circuit: Circuit;
  category: Category;
  enhanced?: boolean;
}

export default function EnhancedCircuitCard({ circuit, category, enhanced = true }: Props) {
  const { current, loading } = useWeather(circuit.latitude, circuit.longitude, 'metric');
  const { unit } = useUnit();
  const { isDark } = useTheme();
  const { t } = useLanguage();
  
  const colors = getColors(isDark);
  const shadows = getShadows(isDark);
  
  const scaleAnim = useMemo(() => new Animated.Value(1), []);

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.xl,
      marginBottom: spacing.lg,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.borderLight,
      boxShadow: shadows.lg,
    },
    gradient: {
      padding: spacing.xl,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.md,
    },
    titleContainer: {
      flex: 1,
      marginRight: spacing.lg,
    },
    categoryBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: borderRadius.round,
      marginBottom: spacing.xs,
      alignSelf: 'flex-start',
    },
    categoryBadgeF2: {
      backgroundColor: isDark ? '#1565C0' : '#90CAF9',
    },
    categoryBadgeF3: {
      backgroundColor: isDark ? '#C62828' : '#EF9A9A',
    },
    categoryText: {
      fontSize: 11,
      fontWeight: '700',
      fontFamily: 'Roboto_700Bold',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    categoryTextF2: {
      color: isDark ? '#FFFFFF' : '#0D47A1',
    },
    categoryTextF3: {
      color: isDark ? '#FFFFFF' : '#B71C1C',
    },
    circuitName: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Roboto_700Bold',
      marginBottom: 4,
      lineHeight: 26,
    },
    country: {
      fontSize: 15,
      color: colors.textSecondary,
      fontFamily: 'Roboto_500Medium',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    weatherContainer: {
      alignItems: 'center',
      backgroundColor: colors.backgroundAlt,
      padding: spacing.md,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.borderLight,
      minWidth: 80,
    },
    temperature: {
      fontSize: 28,
      fontWeight: '800',
      color: colors.temperature,
      fontFamily: 'Roboto_700Bold',
      textAlign: 'center',
      marginTop: spacing.xs,
    },
    weatherInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: spacing.md,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
      gap: spacing.sm,
    },
    infoItem: {
      alignItems: 'center',
      flex: 1,
      backgroundColor: colors.backgroundAlt,
      padding: spacing.sm,
      borderRadius: borderRadius.md,
    },
    infoIcon: {
      marginBottom: 4,
    },
    infoLabel: {
      fontSize: 10,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 2,
    },
    infoValue: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Roboto_700Bold',
    },
    loadingContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 60,
    },
    loadingText: {
      fontSize: 12,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      marginTop: spacing.xs,
    },
    chevron: {
      position: 'absolute',
      right: spacing.lg,
      bottom: spacing.lg,
      backgroundColor: colors.primary,
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: shadows.md,
    },
  });

  const getCategoryGradient = () => {
    switch (category) {
      case 'f2':
        return isDark ? ['#1A237E', '#0D47A1'] : ['#E3F2FD', '#BBDEFB'];
      case 'f3':
        return isDark ? ['#B71C1C', '#C62828'] : ['#FFEBEE', '#FFCDD2'];
      default:
        return [colors.card, colors.backgroundAlt];
    }
  };

  const onPressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    console.log('EnhancedCircuitCard: Navigating to circuit:', circuit.slug, 'category:', category);
    router.push(`/circuit/${circuit.slug}?category=${category}`);
  };

  if (!enhanced) {
    // Fallback to simple card
    return null;
  }

  return (
    <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
      >
        <LinearGradient
          colors={getCategoryGradient()}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <View style={[
                styles.categoryBadge,
                category === 'f2' ? styles.categoryBadgeF2 : styles.categoryBadgeF3
              ]}>
                <Ionicons 
                  name="trophy" 
                  size={12} 
                  color={category === 'f2' 
                    ? (isDark ? '#FFFFFF' : '#0D47A1')
                    : (isDark ? '#FFFFFF' : '#B71C1C')
                  } 
                />
                <Text style={[
                  styles.categoryText,
                  category === 'f2' ? styles.categoryTextF2 : styles.categoryTextF3
                ]}>
                  {category.toUpperCase()}
                </Text>
              </View>
              
              <Text style={styles.circuitName} numberOfLines={2}>
                {circuit.name}
              </Text>
              
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons name="location" size={14} color={colors.textSecondary} />
                <Text style={styles.country}>
                  {circuit.country}
                </Text>
              </View>
            </View>
            
            <View style={styles.weatherContainer}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <WeatherSymbol weatherCode={1} size={36} />
                  <Text style={styles.loadingText}>{t('loading')}</Text>
                </View>
              ) : current ? (
                <>
                  <WeatherSymbol 
                    weatherCode={current.weather_code} 
                    size={36}
                    latitude={circuit.latitude}
                    longitude={circuit.longitude}
                  />
                  <Text style={styles.temperature}>
                    {Math.round(current.temperature)}°
                  </Text>
                </>
              ) : (
                <WeatherSymbol weatherCode={1} size={36} />
              )}
            </View>
          </View>

          {current && !loading && (
            <View style={styles.weatherInfo}>
              <View style={styles.infoItem}>
                <Ionicons name="flag" size={16} color={colors.wind} style={styles.infoIcon} />
                <Text style={styles.infoLabel}>{t('wind')}</Text>
                <Text style={styles.infoValue}>
                  {Math.round(current.wind_speed)}
                </Text>
                <Text style={styles.infoLabel}>
                  {unit === 'metric' ? 'km/h' : 'mph'}
                </Text>
              </View>
              
              <View style={styles.infoItem}>
                <Ionicons name="water" size={16} color={colors.humidity} style={styles.infoIcon} />
                <Text style={styles.infoLabel}>{t('humidity')}</Text>
                <Text style={styles.infoValue}>
                  {Math.round(current.humidity)}%
                </Text>
              </View>
              
              <View style={styles.infoItem}>
                <Ionicons name="rainy" size={16} color={colors.precipitation} style={styles.infoIcon} />
                <Text style={styles.infoLabel}>Rain</Text>
                <Text style={styles.infoValue}>
                  {current.weather_code >= 51 ? 'Yes' : 'No'}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.chevron}>
            <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}
