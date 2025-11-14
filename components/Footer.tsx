
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getColors, spacing } from '../styles/commonStyles';
import { useTheme } from '../state/ThemeContext';

export default function Footer() {
  const { isDark } = useTheme();
  const colors = getColors(isDark);

  const styles = StyleSheet.create({
    footer: {
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      alignItems: 'center',
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.borderLight,
    },
    copyrightText: {
      fontSize: 11,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.footer}>
      <Text style={styles.copyrightText}>
        © 2025-2026 GridWeather Pro. All rights reserved
      </Text>
    </View>
  );
}
