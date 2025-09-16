
import React, { useMemo, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, Animated, Linking, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getColors, getCommonStyles, spacing, borderRadius, getShadows, layout } from '../../styles/commonStyles';
import { useTheme } from '../../state/ThemeContext';
import AppHeader from '../../components/AppHeader';
import Logo from '../../components/Logo';

export default function DisclaimerScreen() {
  const scrollY = useRef(new Animated.Value(0)).current;
  const { isDark } = useTheme();
  
  const colors = getColors(isDark);
  const commonStyles = getCommonStyles(isDark);
  const shadows = getShadows(isDark);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
    },
    scrollContent: {
      padding: layout.screenPadding,
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: spacing.xl,
      paddingVertical: spacing.xl,
    },
    section: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.xl,
      marginBottom: spacing.lg,
      borderWidth: 1,
      borderColor: colors.borderLight,
      boxShadow: shadows.sm,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
      fontFamily: 'Roboto_500Medium',
      marginBottom: spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
    },
    sectionIcon: {
      marginRight: spacing.md,
    },
    sectionText: {
      fontSize: 16,
      color: colors.textSecondary,
      fontFamily: 'Roboto_400Regular',
      lineHeight: 24,
      marginBottom: spacing.md,
    },
    bulletPoint: {
      fontSize: 16,
      color: colors.textSecondary,
      fontFamily: 'Roboto_400Regular',
      lineHeight: 24,
      marginBottom: spacing.sm,
      paddingLeft: spacing.lg,
    },
    contactButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.lg,
      borderRadius: borderRadius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: spacing.lg,
      boxShadow: shadows.md,
    },
    contactButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
      fontFamily: 'Roboto_500Medium',
    },
    versionText: {
      fontSize: 14,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      textAlign: 'center',
      marginTop: spacing.xl,
      marginBottom: spacing.lg,
    },
  });

  const handleEmailPress = () => {
    console.log('DisclaimerScreen: Opening email client');
    Linking.openURL('mailto:support@raceweather.uk?subject=Weather App Support');
  };

  const scrollToSection = (sectionY: number) => {
    console.log('DisclaimerScreen: Scrolling to section at Y:', sectionY);
  };

  console.log('DisclaimerScreen: Rendering with theme:', isDark ? 'dark' : 'light');

  return (
    <View style={styles.container}>
      <AppHeader
        title="Legal & Info"
        subtitle="Terms, Privacy & Support"
        icon={<Ionicons name="information-circle" size={32} color={colors.primary} />}
      />

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        <View style={styles.scrollContent}>
          <View style={styles.logoContainer}>
            <Logo size={80} />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="shield-checkmark" size={24} color={colors.success} style={styles.sectionIcon} />
              Privacy & Data
            </Text>
            <Text style={styles.sectionText}>
              Your privacy is important to us. This app collects minimal data to provide weather forecasts for motorsport circuits.
            </Text>
            <Text style={styles.bulletPoint}>• Location data is used only for weather services</Text>
            <Text style={styles.bulletPoint}>• No personal information is stored or shared</Text>
            <Text style={styles.bulletPoint}>• All data is processed securely</Text>
            <Text style={styles.bulletPoint}>• You can disable location services anytime</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="document-text" size={24} color={colors.info} style={styles.sectionIcon} />
              Terms of Use
            </Text>
            <Text style={styles.sectionText}>
              By using this app, you agree to the following terms and conditions:
            </Text>
            <Text style={styles.bulletPoint}>• Weather data is provided for informational purposes only</Text>
            <Text style={styles.bulletPoint}>• Forecasts may not be 100% accurate</Text>
            <Text style={styles.bulletPoint}>• Use professional weather services for critical decisions</Text>
            <Text style={styles.bulletPoint}>• Circuit information is subject to change</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="warning" size={24} color={colors.warning} style={styles.sectionIcon} />
              Disclaimer
            </Text>
            <Text style={styles.sectionText}>
              This weather forecasting app is designed for motorsport enthusiasts and provides weather information for racing circuits.
            </Text>
            <Text style={styles.bulletPoint}>• Weather data is sourced from reliable meteorological services</Text>
            <Text style={styles.bulletPoint}>• Forecasts are estimates and may vary from actual conditions</Text>
            <Text style={styles.bulletPoint}>• Always consult official race weather services for competition decisions</Text>
            <Text style={styles.bulletPoint}>• The app is not affiliated with F1, MotoGP, or IndyCar organizations</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="cloud" size={24} color={colors.primary} style={styles.sectionIcon} />
              Weather Data Sources
            </Text>
            <Text style={styles.sectionText}>
              Our weather forecasts are powered by multiple reliable sources:
            </Text>
            <Text style={styles.bulletPoint}>• Open-Meteo API for global weather data</Text>
            <Text style={styles.bulletPoint}>• Real-time updates every 15 minutes</Text>
            <Text style={styles.bulletPoint}>• 7-day detailed forecasts</Text>
            <Text style={styles.bulletPoint}>• Specialized motorsport weather parameters</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="help-circle" size={24} color={colors.accent} style={styles.sectionIcon} />
              Support & Contact
            </Text>
            <Text style={styles.sectionText}>
              Need help or have questions? We&apos;re here to assist you with any issues or feedback.
            </Text>
            <TouchableOpacity style={styles.contactButton} onPress={handleEmailPress}>
              <Text style={styles.contactButtonText}>Contact Support</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.versionText}>
            Motorsport Weather App v1.0.0{'\n'}
            Built with ❤️ for racing fans worldwide
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
