
import { getColors, getCommonStyles, spacing, borderRadius, getShadows } from '../styles/commonStyles';
import React, { useEffect, useState } from 'react';
import Logo from '../components/Logo';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, Animated, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import WeatherSymbol from '../components/WeatherSymbol';
import { useTheme } from '../state/ThemeContext';
import { useLanguage, Language } from '../state/LanguageContext';
import ThemeToggle from '../components/ThemeToggle';

const LANGUAGES: { code: Language; name: string; flag: string; countryCode: string }[] = [
  { code: 'en', name: 'English', flag: '🇬🇧', countryCode: 'GB' },
  { code: 'es', name: 'Español', flag: '🇪🇸', countryCode: 'ES' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', countryCode: 'FR' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', countryCode: 'DE' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹', countryCode: 'IT' },
  { code: 'pt', name: 'Português', flag: '🇵🇹', countryCode: 'PT' },
  { code: 'ja', name: '日本語', flag: '🇯🇵', countryCode: 'JP' },
  { code: 'zh', name: '中文', flag: '🇨🇳', countryCode: 'CN' },
];

export default function CoverPage() {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [showLanguageSelection, setShowLanguageSelection] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
  const { isDark } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  
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
      top: 48,
      right: spacing.lg,
      zIndex: 10,
    },
    content: {
      alignItems: 'center',
      maxWidth: 500,
      width: '100%',
    },
    logoContainer: {
      marginTop: spacing.xl,
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
    languageSelectionContainer: {
      width: '100%',
      marginBottom: spacing.xl,
    },
    languageTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
      marginBottom: spacing.lg,
      fontFamily: 'Roboto_700Bold',
    },
    languageGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: spacing.md,
      marginBottom: spacing.xl,
    },
    languageButton: {
      backgroundColor: colors.card,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.lg,
      borderWidth: 2,
      borderColor: colors.borderLight,
      minWidth: 140,
      alignItems: 'center',
      boxShadow: shadows.sm,
    },
    languageButtonSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
      boxShadow: `0 4px 12px ${colors.primaryGlow}`,
    },
    languageFlag: {
      fontSize: 32,
      marginBottom: spacing.xs,
    },
    languageName: {
      fontSize: 14,
      color: colors.text,
      fontFamily: 'Roboto_500Medium',
    },
    languageNameSelected: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
    languageCode: {
      fontSize: 10,
      color: isDark ? '#FFFFFF' : colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      marginTop: spacing.xs,
      letterSpacing: 0.5,
      textTransform: 'uppercase',
      opacity: 0.8,
    },
    languageCodeSelected: {
      color: '#FFFFFF',
      opacity: 0.9,
    },
    copyrightText: {
      fontSize: 12,
      color: colors.textMuted,
      textAlign: 'center',
      fontFamily: 'Roboto_400Regular',
      marginTop: spacing.md,
      opacity: 0.7,
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
    continueButtonDisabled: {
      backgroundColor: colors.borderLight,
      boxShadow: 'none',
    },
    continueText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '600',
      fontFamily: 'Roboto_500Medium',
      letterSpacing: 0.3,
    },
    continueTextDisabled: {
      color: colors.textMuted,
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
    backgroundPattern: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: isDark ? 0.03 : 0.02,
    },
  });

  useEffect(() => {
    console.log('CoverPage: Starting fade animation with theme:', isDark ? 'dark' : 'light');
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, isDark]);

  const handleLanguageSelect = async (langCode: Language) => {
    console.log('CoverPage: Language selected:', langCode);
    setSelectedLanguage(langCode);
    await setLanguage(langCode);
    
    // Wait a moment for the selection to be visible
    setTimeout(() => {
      setShowLanguageSelection(false);
      
      // Auto-navigate after showing the main screen briefly
      setTimeout(() => {
        console.log('CoverPage: Auto-navigating to F1 tab');
        router.replace('/(tabs)/f1');
      }, 2000);
    }, 500);
  };

  const handleContinue = () => {
    if (selectedLanguage) {
      console.log('CoverPage: Continuing with language:', selectedLanguage);
      router.replace('/(tabs)/f1');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={isDark ? [colors.background, colors.backgroundAlt] : [colors.backgroundAlt, colors.background]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Subtle background pattern */}
        <LinearGradient
          colors={colors.gradientPrimary}
          style={styles.backgroundPattern}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        
        <View style={styles.themeToggleContainer}>
          <ThemeToggle showLogo={false} />
        </View>
        
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <View style={styles.logoContainer}>
            <Logo />
          </View>

          <Text style={styles.title}>
            {t('app_title')}
          </Text>
          
          <Text style={styles.subtitle}>
            {t('app_subtitle')}
          </Text>

          {showLanguageSelection ? (
            <View style={styles.languageSelectionContainer}>
              <Text style={styles.languageTitle}>
                {t('select_language')}
              </Text>
              
              <View style={styles.languageGrid}>
                {LANGUAGES.map((lang) => {
                  const isSelected = selectedLanguage === lang.code;
                  return (
                    <TouchableOpacity
                      key={lang.code}
                      style={[
                        styles.languageButton,
                        isSelected && styles.languageButtonSelected,
                      ]}
                      onPress={() => handleLanguageSelect(lang.code)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.languageFlag}>{lang.flag}</Text>
                      <Text
                        style={[
                          styles.languageName,
                          isSelected && styles.languageNameSelected,
                          // Explicitly set color based on selection state to ensure visibility
                          { color: isSelected ? '#FFFFFF' : colors.text }
                        ]}
                      >
                        {lang.name}
                      </Text>
                      <Text
                        style={[
                          styles.languageCode,
                          isSelected && styles.languageCodeSelected,
                        ]}
                      >
                        {lang.countryCode}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              
              <Text style={styles.copyrightText}>
                © 2025-2026 GridWeather Pro. All rights reserved.
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.weatherContainer}>
                <View style={styles.weatherItem}>
                  <WeatherSymbol weatherCode={1} size={32} />
                  <Text style={styles.weatherLabel}>{t('weather_clear')}</Text>
                </View>
                <View style={styles.weatherItem}>
                  <WeatherSymbol weatherCode={61} size={32} />
                  <Text style={styles.weatherLabel}>{t('weather_rain')}</Text>
                </View>
                <View style={styles.weatherItem}>
                  <WeatherSymbol weatherCode={71} size={32} />
                  <Text style={styles.weatherLabel}>{t('weather_snow')}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.continueButton}
                onPress={handleContinue}
                activeOpacity={0.8}
              >
                <Text style={styles.continueText}>
                  {t('enter_app')}
                </Text>
              </TouchableOpacity>

              <View style={styles.loadingContainer}>
                <Ionicons 
                  name="time" 
                  size={16} 
                  color={colors.textMuted} 
                />
                <Text style={styles.loadingText}>
                  {t('loading_weather')}
                </Text>
              </View>
            </>
          )}
        </Animated.View>
      </LinearGradient>
    </View>
  );
}
