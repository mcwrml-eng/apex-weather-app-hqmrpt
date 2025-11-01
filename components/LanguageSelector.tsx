
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useLanguage, Language } from '../state/LanguageContext';
import { useTheme } from '../state/ThemeContext';
import { getColors, spacing, borderRadius, getShadows } from '../styles/commonStyles';
import { Ionicons } from '@expo/vector-icons';

const LANGUAGES: { code: Language; name: string; flag: string; nativeName: string }[] = [
  { code: 'en', name: 'English', flag: '🇬🇧', nativeName: 'English' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸', nativeName: 'Español' },
  { code: 'fr', name: 'French', flag: '🇫🇷', nativeName: 'Français' },
  { code: 'de', name: 'German', flag: '🇩🇪', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italian', flag: '🇮🇹', nativeName: 'Italiano' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹', nativeName: 'Português' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵', nativeName: '日本語' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳', nativeName: '中文' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦', nativeName: 'العربية' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺', nativeName: 'Русский' },
];

interface LanguageSelectorProps {
  compact?: boolean;
  onLanguageChange?: (language: Language) => void;
}

export default function LanguageSelector({ compact = false, onLanguageChange }: LanguageSelectorProps) {
  const { language, setLanguage, t } = useLanguage();
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const shadows = getShadows(isDark);

  const styles = StyleSheet.create({
    container: {
      width: '100%',
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.md,
      fontFamily: 'Roboto_500Medium',
    },
    languageList: {
      gap: spacing.sm,
    },
    languageItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.card,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.borderLight,
      boxShadow: shadows.xs,
    },
    languageItemSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
      boxShadow: `0 2px 8px ${colors.primaryGlow}`,
    },
    languageItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    languageFlag: {
      fontSize: 28,
      marginRight: spacing.md,
    },
    languageTextContainer: {
      flex: 1,
    },
    languageName: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.text,
      fontFamily: 'Roboto_500Medium',
    },
    languageNameSelected: {
      color: '#FFFFFF',
    },
    languageNativeName: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 2,
      fontFamily: 'Roboto_400Regular',
    },
    languageNativeNameSelected: {
      color: 'rgba(255, 255, 255, 0.8)',
    },
    checkIcon: {
      marginLeft: spacing.sm,
    },
    compactContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    compactItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.borderLight,
      minWidth: 100,
    },
    compactItemSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    compactFlag: {
      fontSize: 20,
      marginRight: spacing.xs,
    },
    compactName: {
      fontSize: 14,
      color: colors.text,
      fontFamily: 'Roboto_400Regular',
    },
    compactNameSelected: {
      color: '#FFFFFF',
      fontWeight: '500',
    },
  });

  const handleLanguageSelect = async (langCode: Language) => {
    console.log('LanguageSelector: Changing language to:', langCode);
    await setLanguage(langCode);
    if (onLanguageChange) {
      onLanguageChange(langCode);
    }
  };

  if (compact) {
    return (
      <View style={styles.container}>
        <View style={styles.compactContainer}>
          {LANGUAGES.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.compactItem,
                language === lang.code && styles.compactItemSelected,
              ]}
              onPress={() => handleLanguageSelect(lang.code)}
              activeOpacity={0.7}
            >
              <Text style={styles.compactFlag}>{lang.flag}</Text>
              <Text
                style={[
                  styles.compactName,
                  language === lang.code && styles.compactNameSelected,
                ]}
              >
                {lang.nativeName}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('select_language')}</Text>
      <ScrollView style={styles.languageList} showsVerticalScrollIndicator={false}>
        {LANGUAGES.map((lang) => (
          <TouchableOpacity
            key={lang.code}
            style={[
              styles.languageItem,
              language === lang.code && styles.languageItemSelected,
            ]}
            onPress={() => handleLanguageSelect(lang.code)}
            activeOpacity={0.7}
          >
            <View style={styles.languageItemLeft}>
              <Text style={styles.languageFlag}>{lang.flag}</Text>
              <View style={styles.languageTextContainer}>
                <Text
                  style={[
                    styles.languageName,
                    language === lang.code && styles.languageNameSelected,
                  ]}
                >
                  {lang.name}
                </Text>
                <Text
                  style={[
                    styles.languageNativeName,
                    language === lang.code && styles.languageNativeNameSelected,
                  ]}
                >
                  {lang.nativeName}
                </Text>
              </View>
            </View>
            {language === lang.code && (
              <Ionicons
                name="checkmark-circle"
                size={24}
                color="#FFFFFF"
                style={styles.checkIcon}
              />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
