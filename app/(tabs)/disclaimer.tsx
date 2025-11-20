
import React, { useMemo, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, Animated, Linking, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getColors, getCommonStyles, spacing, borderRadius, getShadows, layout } from '../../styles/commonStyles';
import { useTheme } from '../../state/ThemeContext';
import { useLanguage } from '../../state/LanguageContext';
import AppHeader from '../../components/AppHeader';
import Logo from '../../components/Logo';

export default function DisclaimerScreen() {
  const scrollY = useRef(new Animated.Value(0)).current;
  const { isDark } = useTheme();
  const { t } = useLanguage();
  
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
    copyrightSection: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.xl,
      marginBottom: spacing.lg,
      borderWidth: 1,
      borderColor: colors.borderLight,
      boxShadow: shadows.sm,
      alignItems: 'center',
    },
    copyrightText: {
      fontSize: 15,
      color: colors.text,
      fontFamily: 'Roboto_500Medium',
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    copyrightSubtext: {
      fontSize: 14,
      color: colors.textSecondary,
      fontFamily: 'Roboto_400Regular',
      textAlign: 'center',
      lineHeight: 20,
    },
    versionText: {
      fontSize: 14,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      textAlign: 'center',
      marginTop: spacing.xl,
      marginBottom: spacing.xl,
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
        title={t('legal_info')}
        subtitle={t('terms_privacy')}
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
              {t('privacy_data')}
            </Text>
            <Text style={styles.sectionText}>
              {t('privacy_description')}
            </Text>
            <Text style={styles.bulletPoint}>• {t('privacy_point_1')}</Text>
            <Text style={styles.bulletPoint}>• {t('privacy_point_2')}</Text>
            <Text style={styles.bulletPoint}>• {t('privacy_point_3')}</Text>
            <Text style={styles.bulletPoint}>• {t('privacy_point_4')}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="document-text" size={24} color={colors.info} style={styles.sectionIcon} />
              {t('terms_of_use')}
            </Text>
            <Text style={styles.sectionText}>
              {t('terms_description')}
            </Text>
            <Text style={styles.bulletPoint}>• {t('terms_point_1')}</Text>
            <Text style={styles.bulletPoint}>• {t('terms_point_2')}</Text>
            <Text style={styles.bulletPoint}>• {t('terms_point_3')}</Text>
            <Text style={styles.bulletPoint}>• {t('terms_point_4')}</Text>
            <Text style={styles.bulletPoint}>• {t('terms_point_5')}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="warning" size={24} color={colors.warning} style={styles.sectionIcon} />
              {t('disclaimer_title')}
            </Text>
            <Text style={styles.sectionText}>
              {t('disclaimer_description')}
            </Text>
            <Text style={styles.bulletPoint}>• {t('disclaimer_point_1')}</Text>
            <Text style={styles.bulletPoint}>• {t('disclaimer_point_2')}</Text>
            <Text style={styles.bulletPoint}>• {t('disclaimer_point_3')}</Text>
            <Text style={styles.bulletPoint}>• {t('disclaimer_point_4')}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="cloud" size={24} color={colors.primary} style={styles.sectionIcon} />
              {t('weather_data_sources')}
            </Text>
            <Text style={styles.sectionText}>
              {t('weather_sources_description')}
            </Text>
            <Text style={styles.bulletPoint}>• {t('weather_source_1')}</Text>
            <Text style={styles.bulletPoint}>• {t('weather_source_2')}</Text>
            <Text style={styles.bulletPoint}>• {t('weather_source_3')}</Text>
            <Text style={styles.bulletPoint}>• {t('weather_source_4')}</Text>
          </View>

          <View style={styles.copyrightSection}>
            <Ionicons name="shield-checkmark-outline" size={32} color={colors.primary} style={{ marginBottom: spacing.md }} />
            <Text style={styles.copyrightText}>
              {t('copyright_title')}
            </Text>
            <Text style={styles.copyrightSubtext}>
              {t('copyright_text')}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="help-circle" size={24} color={colors.accent} style={styles.sectionIcon} />
              {t('support_contact')}
            </Text>
            <Text style={styles.sectionText}>
              {t('support_description')}
            </Text>
            <TouchableOpacity style={styles.contactButton} onPress={handleEmailPress}>
              <Text style={styles.contactButtonText}>{t('contact_support')}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.versionText}>
            Motorsport Weather App v1.1
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
