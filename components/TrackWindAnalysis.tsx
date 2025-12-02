
import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getColors, getShadows } from '../styles/commonStyles';
import { useTheme } from '../state/ThemeContext';
import Icon from './Icon';
import { analyzeWindForTrack, getRelativeWindDirection } from '../utils/windAnalysis';

interface Props {
  windSpeed: number;
  windDirection: number;
  trackDirection?: number;
  unit: 'metric' | 'imperial';
  circuitName: string;
}

function TrackWindAnalysis({ windSpeed, windDirection, trackDirection, unit, circuitName }: Props) {
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const shadows = getShadows(isDark);

  // If no track direction is available, don't show the analysis
  if (trackDirection === undefined) {
    return null;
  }

  const analysis = analyzeWindForTrack(windSpeed, windDirection, trackDirection, unit);
  const relativeDirection = getRelativeWindDirection(windDirection, trackDirection);
  const speedUnit = unit === 'metric' ? 'km/h' : 'mph';

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.divider,
      boxShadow: shadows.md,
      marginBottom: 16,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 12,
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Roboto_700Bold',
    },
    subtitle: {
      fontSize: 14,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      marginBottom: 16,
      lineHeight: 20,
    },
    mainMetric: {
      backgroundColor: colors.backgroundAlt,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      alignItems: 'center',
    },
    windTypeLabel: {
      fontSize: 12,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 8,
    },
    windTypeValue: {
      fontSize: 32,
      fontWeight: '700',
      fontFamily: 'Roboto_700Bold',
      marginBottom: 4,
    },
    windTypeUnit: {
      fontSize: 14,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      marginBottom: 8,
    },
    relativeDirection: {
      fontSize: 13,
      color: colors.text,
      fontFamily: 'Roboto_500Medium',
      textAlign: 'center',
    },
    metricsGrid: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 16,
    },
    metricCard: {
      flex: 1,
      backgroundColor: colors.backgroundAlt,
      borderRadius: 10,
      padding: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.divider,
    },
    metricLabel: {
      fontSize: 11,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      marginBottom: 6,
      textAlign: 'center',
    },
    metricValue: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Roboto_700Bold',
      marginBottom: 2,
    },
    metricUnit: {
      fontSize: 10,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
    },
    impactBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      marginBottom: 12,
      alignSelf: 'center',
    },
    impactText: {
      fontSize: 12,
      fontWeight: '600',
      fontFamily: 'Roboto_600SemiBold',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    description: {
      fontSize: 14,
      color: colors.text,
      fontFamily: 'Roboto_400Regular',
      lineHeight: 20,
      textAlign: 'center',
    },
    infoBox: {
      backgroundColor: colors.backgroundAlt,
      borderRadius: 10,
      padding: 12,
      marginTop: 12,
      borderLeftWidth: 3,
      borderLeftColor: colors.primary,
    },
    infoTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
      fontFamily: 'Roboto_600SemiBold',
      marginBottom: 6,
    },
    infoText: {
      fontSize: 12,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      lineHeight: 18,
    },
  });

  // Get color based on wind type
  const getWindTypeColor = () => {
    switch (analysis.windType) {
      case 'headwind':
        return colors.error;
      case 'tailwind':
        return colors.success;
      case 'crosswind':
        return colors.warning;
      default:
        return colors.textMuted;
    }
  };

  // Get impact badge color
  const getImpactColor = () => {
    switch (analysis.impactLevel) {
      case 'severe':
        return { bg: colors.error + '20', text: colors.error };
      case 'high':
        return { bg: colors.warning + '20', text: colors.warning };
      case 'moderate':
        return { bg: colors.primary + '20', text: colors.primary };
      default:
        return { bg: colors.textMuted + '20', text: colors.textMuted };
    }
  };

  const impactColors = getImpactColor();
  const windTypeColor = getWindTypeColor();

  // Get icon based on wind type
  const getWindIcon = () => {
    switch (analysis.windType) {
      case 'headwind':
        return 'arrow-down';
      case 'tailwind':
        return 'arrow-up';
      case 'crosswind':
        return 'swap-horizontal';
      default:
        return 'leaf-outline';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icon name="flag" size={20} color={colors.wind} />
        <Text style={styles.title}>Track Wind Analysis</Text>
      </View>

      <Text style={styles.subtitle}>
        Wind impact on the main straight at {circuitName}
      </Text>

      {/* Main Wind Metric */}
      <View style={styles.mainMetric}>
        <Text style={styles.windTypeLabel}>
          {analysis.windType === 'calm' ? 'Wind Conditions' : analysis.windType.toUpperCase()}
        </Text>
        <Text style={[styles.windTypeValue, { color: windTypeColor }]}>
          {analysis.windType === 'calm' 
            ? 'Calm' 
            : `${Math.abs(Math.round(analysis.headTailwind))} ${speedUnit}`}
        </Text>
        {analysis.windType !== 'calm' && (
          <>
            <Text style={styles.windTypeUnit}>
              {analysis.windType === 'headwind' ? 'Against Direction' : 
               analysis.windType === 'tailwind' ? 'With Direction' : 'Perpendicular'}
            </Text>
            <Text style={styles.relativeDirection}>{relativeDirection}</Text>
          </>
        )}
      </View>

      {/* Impact Badge */}
      {analysis.windType !== 'calm' && (
        <View style={[styles.impactBadge, { backgroundColor: impactColors.bg }]}>
          <Icon name="alert-circle" size={14} color={impactColors.text} />
          <Text style={[styles.impactText, { color: impactColors.text }]}>
            {analysis.impactLevel} Impact
          </Text>
        </View>
      )}

      {/* Metrics Grid */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>
            {analysis.headTailwind >= 0 ? 'Tailwind' : 'Headwind'}
          </Text>
          <Text style={[styles.metricValue, { color: windTypeColor }]}>
            {Math.abs(Math.round(analysis.headTailwind))}
          </Text>
          <Text style={styles.metricUnit}>{speedUnit}</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Crosswind</Text>
          <Text style={styles.metricValue}>
            {Math.round(analysis.crosswind)}
          </Text>
          <Text style={styles.metricUnit}>{speedUnit}</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Total Wind</Text>
          <Text style={styles.metricValue}>
            {Math.round(windSpeed)}
          </Text>
          <Text style={styles.metricUnit}>{speedUnit}</Text>
        </View>
      </View>

      {/* Description */}
      <Text style={styles.description}>{analysis.description}</Text>

      {/* Info Box */}
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Racing Impact</Text>
        <Text style={styles.infoText}>
          {analysis.windType === 'headwind' && 
            'Headwinds reduce top speed on straights but improve braking stability and downforce. Expect longer acceleration zones and more stable high-speed corners.'}
          {analysis.windType === 'tailwind' && 
            'Tailwinds increase top speed but reduce aerodynamic grip and braking stability. Drivers may need to brake earlier and be cautious in high-speed sections.'}
          {analysis.windType === 'crosswind' && 
            'Crosswinds can significantly affect vehicle balance, especially through fast corners and on straights. Drivers need to compensate with steering inputs and may experience unpredictable handling.'}
          {analysis.windType === 'calm' && 
            'Minimal wind impact allows for consistent lap times and predictable vehicle behavior. Ideal conditions for racing.'}
        </Text>
      </View>
    </View>
  );
}

export default memo(TrackWindAnalysis);
