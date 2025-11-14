
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
import Footer from '../components/Footer';

const LANGUAGES: { code: Language; name: string; flag: string }[] = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
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
      top: 60,
      right: spacing.lg,
      zIndex: 10,
    },
    content: {
      alignItems: 'center',
      maxWidth: 500,
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
    footerContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
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
          <ThemeToggle />
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
                {LANGUAGES.map((lang) => (
                  <TouchableOpacity
                    key={lang.code}
                    style={[
                      styles.languageButton,
                      selectedLanguage === lang.code && styles.languageButtonSelected,
                    ]}
                    onPress={() => handleLanguageSelect(lang.code)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.languageFlag}>{lang.flag}</Text>
                    <Text
                      style={[
                        styles.languageName,
                        selectedLanguage === lang.code && styles.languageNameSelected,
                      ]}
                    >
                      {lang.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
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

        <View style={styles.footerContainer}>
          <Footer />
        </View>
      </LinearGradient>
    </View>
  );
}
