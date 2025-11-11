
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../../state/ThemeContext';
import { getColors, borderRadius, spacing } from '../../../styles/commonStyles';
import InteractiveGlobe from '../../../components/InteractiveGlobe';
import { router } from 'expo-router';

export default function HomeScreen() {
  const { isDark } = useTheme();
  const colors = getColors(isDark);

  const handleTrackSelect = (slug: string, category: 'f1' | 'motogp' | 'indycar' | 'nascar') => {
    console.log('Track selected:', slug, category);
    router.push(`/circuit/${slug}`);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      padding: spacing.md,
    },
    header: {
      marginBottom: spacing.lg,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.xs,
      fontFamily: 'Roboto_700Bold',
    },
    subtitle: {
      fontSize: 16,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
    },
    globeContainer: {
      marginBottom: spacing.lg,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.md,
      fontFamily: 'Roboto_600SemiBold',
    },
    infoCard: {
      backgroundColor: colors.backgroundAlt,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: colors.divider,
    },
    infoText: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
      fontFamily: 'Roboto_400Regular',
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Global Weather</Text>
          <Text style={styles.subtitle}>
            Real-time weather conditions at motorsport circuits worldwide
          </Text>
        </View>

        <View style={styles.globeContainer}>
          <Text style={styles.sectionTitle}>Interactive Circuit Map</Text>
          <InteractiveGlobe 
            category="all"
            onTrackSelect={handleTrackSelect}
          />
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            Tap on any circuit marker to view detailed weather forecasts, wind patterns, and precipitation data. 
            The map shows real-time rainfall intensity with color-coded indicators.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
