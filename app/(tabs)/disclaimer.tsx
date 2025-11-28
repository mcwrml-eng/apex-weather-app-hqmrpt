
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getColors, getCommonStyles, spacing, borderRadius, getShadows, layout } from '../../styles/commonStyles';
import { useTheme } from '../../state/ThemeContext';
import { useLanguage } from '../../state/LanguageContext';
import AppHeader from '../../components/AppHeader';

export default function DisclaimerScreen() {
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
      paddingBottom: 100,
    },
    section: {
      marginBottom: spacing.xxl,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
      fontFamily: 'Roboto_500Medium',
      marginBottom: spacing.md,
    },
    sectionDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      fontFamily: 'Roboto_400Regular',
      lineHeight: 22,
      marginBottom: spacing.lg,
    },
    pointContainer: {
      flexDirection: 'row',
      marginBottom: spacing.md,
      alignItems: 'flex-start',
    },
    pointIcon: {
      marginRight: spacing.md,
      marginTop: 2,
    },
    pointText: {
      flex: 1,
      fontSize: 14,
      color: colors.text,
      fontFamily: 'Roboto_400Regular',
      lineHeight: 22,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      borderWidth: 1,
      borderColor: colors.borderLight,
      boxShadow: shadows.sm,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      fontFamily: 'Roboto_500Medium',
      marginBottom: spacing.sm,
    },
    cardText: {
      fontSize: 14,
      color: colors.textSecondary,
      fontFamily: 'Roboto_400Regular',
      lineHeight: 22,
    },
    versionText: {
      fontSize: 14,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      textAlign: 'center',
      lineHeight: 22,
      marginTop: spacing.xl,
    },
    copyrightText: {
      fontSize: 12,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      textAlign: 'center',
      marginTop: spacing.md,
    },
  });

  console.log('DisclaimerScreen: Rendering with theme:', isDark ? 'dark' : 'light');

  return (
    <View style={styles.container}>
      <AppHeader
        title={t('disclaimer_title')}
        subtitle={t('legal_info')}
        icon={<Ionicons name="information-circle" size={32} color={colors.primary} />}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.scrollContent}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('disclaimer_title')}</Text>
            <Text style={styles.sectionDescription}>{t('disclaimer_description')}</Text>
            
            <View style={styles.pointContainer}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} style={styles.pointIcon} />
              <Text style={styles.pointText}>{t('disclaimer_point_1')}</Text>
            </View>
            
            <View style={styles.pointContainer}>
              <Ionicons name="alert-circle" size={20} color={colors.warning} style={styles.pointIcon} />
              <Text style={styles.pointText}>{t('disclaimer_point_2')}</Text>
            </View>
            
            <View style={styles.pointContainer}>
              <Ionicons name="shield-checkmark" size={20} color={colors.info} style={styles.pointIcon} />
              <Text style={styles.pointText}>{t('disclaimer_point_3')}</Text>
            </View>
            
            <View style={styles.pointContainer}>
              <Ionicons name="information-circle" size={20} color={colors.textMuted} style={styles.pointIcon} />
              <Text style={styles.pointText}>{t('disclaimer_point_4')}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('privacy_data')}</Text>
            <Text style={styles.sectionDescription}>{t('privacy_description')}</Text>
            
            <View style={styles.pointContainer}>
              <Ionicons name="location" size={20} color={colors.primary} style={styles.pointIcon} />
              <Text style={styles.pointText}>{t('privacy_point_1')}</Text>
            </View>
            
            <View style={styles.pointContainer}>
              <Ionicons name="lock-closed" size={20} color={colors.success} style={styles.pointIcon} />
              <Text style={styles.pointText}>{t('privacy_point_2')}</Text>
            </View>
            
            <View style={styles.pointContainer}>
              <Ionicons name="shield" size={20} color={colors.info} style={styles.pointIcon} />
              <Text style={styles.pointText}>{t('privacy_point_3')}</Text>
            </View>
            
            <View style={styles.pointContainer}>
              <Ionicons name="settings" size={20} color={colors.textMuted} style={styles.pointIcon} />
              <Text style={styles.pointText}>{t('privacy_point_4')}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('terms_of_use')}</Text>
            <Text style={styles.sectionDescription}>{t('terms_description')}</Text>
            
            <View style={styles.pointContainer}>
              <Ionicons name="document-text" size={20} color={colors.primary} style={styles.pointIcon} />
              <Text style={styles.pointText}>{t('terms_point_1')}</Text>
            </View>
            
            <View style={styles.pointContainer}>
              <Ionicons name="alert-circle" size={20} color={colors.warning} style={styles.pointIcon} />
              <Text style={styles.pointText}>{t('terms_point_2')}</Text>
            </View>
            
            <View style={styles.pointContainer}>
              <Ionicons name="business" size={20} color={colors.info} style={styles.pointIcon} />
              <Text style={styles.pointText}>{t('terms_point_3')}</Text>
            </View>
            
            <View style={styles.pointContainer}>
              <Ionicons name="calendar" size={20} color={colors.textMuted} style={styles.pointIcon} />
              <Text style={styles.pointText}>{t('terms_point_4')}</Text>
            </View>
            
            <View style={styles.pointContainer}>
              <Ionicons name="warning" size={20} color={colors.error} style={styles.pointIcon} />
              <Text style={styles.pointText}>{t('terms_point_5')}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('weather_data_sources')}</Text>
            <Text style={styles.sectionDescription}>{t('weather_sources_description')}</Text>
            
            <View style={styles.pointContainer}>
              <Ionicons name="cloud" size={20} color={colors.primary} style={styles.pointIcon} />
              <Text style={styles.pointText}>{t('weather_source_1')}</Text>
            </View>
            
            <View style={styles.pointContainer}>
              <Ionicons name="refresh" size={20} color={colors.success} style={styles.pointIcon} />
              <Text style={styles.pointText}>{t('weather_source_2')}</Text>
            </View>
            
            <View style={styles.pointContainer}>
              <Ionicons name="time" size={20} color={colors.info} style={styles.pointIcon} />
              <Text style={styles.pointText}>{t('weather_source_3')}</Text>
            </View>
            
            <View style={styles.pointContainer}>
              <Ionicons name="speedometer" size={20} color={colors.accent} style={styles.pointIcon} />
              <Text style={styles.pointText}>{t('weather_source_4')}</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('copyright_title')}</Text>
            <Text style={styles.cardText}>{t('copyright_text')}</Text>
          </View>

          <Text style={styles.versionText}>Motorsport Weather App v1.2</Text>
          <Text style={styles.copyrightText}>Built with ❤️ for racing fans worldwide</Text>
        </View>
      </ScrollView>
    </View>
  );
}
