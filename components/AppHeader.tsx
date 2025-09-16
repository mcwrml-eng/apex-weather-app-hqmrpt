
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getColors, getCommonStyles, spacing, borderRadius, getShadows, layout } from '../styles/commonStyles';
import { useTheme } from '../state/ThemeContext';
import ThemeToggle from './ThemeToggle';

interface Props {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  showThemeToggle?: boolean;
}

export default function AppHeader({ title, subtitle, icon, showThemeToggle = true }: Props) {
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const shadows = getShadows(isDark);

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
      boxShadow: shadows.sm,
    },
    content: {
      paddingHorizontal: layout.screenPadding,
      paddingTop: spacing.md,
      paddingBottom: spacing.lg,
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    title: {
      fontSize: 32,
      fontWeight: '800',
      color: colors.text,
      fontFamily: 'Roboto_700Bold',
      marginLeft: icon ? spacing.md : 0,
      letterSpacing: -1,
      flex: 1,
    },
    themeToggleContainer: {
      marginLeft: spacing.lg,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      fontFamily: 'Roboto_400Regular',
      marginTop: spacing.xs,
    },
  });

  console.log('AppHeader: Rendering header with title:', title, 'theme:', isDark ? 'dark' : 'light');

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.titleContainer}>
            {icon}
            <Text style={styles.title}>{title}</Text>
          </View>
          {showThemeToggle && (
            <View style={styles.themeToggleContainer}>
              <ThemeToggle size={24} />
            </View>
          )}
        </View>
        {subtitle && (
          <Text style={styles.subtitle}>{subtitle}</Text>
        )}
      </View>
    </SafeAreaView>
  );
}
