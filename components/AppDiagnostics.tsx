
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getColors, spacing, borderRadius } from '../styles/commonStyles';
import { useTheme } from '../state/ThemeContext';
import { useUnit } from '../state/UnitContext';

export default function AppDiagnostics() {
  const { isDark, theme } = useTheme();
  const { unit } = useUnit();
  const [mountTime] = useState(new Date().toISOString());
  const colors = getColors(isDark);

  useEffect(() => {
    // Only log in development mode
    if (__DEV__) {
      console.log('AppDiagnostics: Component mounted at', mountTime);
      console.log('AppDiagnostics: Theme:', theme);
      console.log('AppDiagnostics: Unit:', unit);
    }
  }, [mountTime, theme, unit]);

  const styles = StyleSheet.create({
    container: {
      padding: spacing.lg,
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      margin: spacing.lg,
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.md,
      fontFamily: 'Roboto_500Medium',
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    label: {
      fontSize: 14,
      color: colors.textSecondary,
      fontFamily: 'Roboto_400Regular',
    },
    value: {
      fontSize: 14,
      color: colors.text,
      fontFamily: 'Roboto_500Medium',
    },
    success: {
      color: colors.success,
    },
  });

  const diagnostics = [
    { label: 'Theme', value: theme },
    { label: 'Dark Mode', value: isDark ? 'Yes' : 'No' },
    { label: 'Unit System', value: unit },
    { label: 'Mount Time', value: mountTime },
    { label: 'Status', value: 'Running' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>App Diagnostics</Text>
      {diagnostics.map((item, index) => (
        <View key={index} style={styles.row}>
          <Text style={styles.label}>{item.label}</Text>
          <Text style={[styles.value, item.label === 'Status' && styles.success]}>
            {item.value}
          </Text>
        </View>
      ))}
    </View>
  );
}
