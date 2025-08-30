
import { StyleSheet } from 'react-native';

export const colors = {
  // Base colors - Dark theme
  background: '#0F1419',
  backgroundAlt: '#1A1F26',
  card: '#1E2328',
  cardHighlight: '#252A30',
  text: '#E8EAED',
  textMuted: '#9AA0A6',
  
  // Motorsport-inspired primary colors
  primary: '#E10600', // Ferrari Red / Racing Red
  primaryLight: '#FF2B2B',
  primaryDark: '#B30500',
  
  // Secondary colors
  secondary: '#00D4AA', // Petronas Teal
  secondaryLight: '#26E5C7',
  secondaryDark: '#00B894',
  
  // Accent colors
  accent: '#FF6B35', // McLaren Orange
  accentLight: '#FF8A5B',
  accentDark: '#E55A2B',
  
  // F1 specific
  f1Red: '#E10600',
  f1Silver: '#C0C0C0',
  f1Gold: '#FFD700',
  
  // MotoGP specific
  motogpBlue: '#0066CC',
  motogpOrange: '#FF6600',
  motogpYellow: '#FFCC00',
  
  // Weather colors
  temperature: '#FF6B35',
  wind: '#4FC3F7',
  humidity: '#00D4AA',
  precipitation: '#64B5F6',
  
  // Status colors
  success: '#00D4AA',
  warning: '#FFB800',
  error: '#E10600',
  
  // UI colors - Dark theme
  divider: '#2D3748',
  border: '#374151',
  shadow: 'rgba(0, 0, 0, 0.3)',
  shadowDark: 'rgba(0, 0, 0, 0.5)',
  
  // Gradients (for use with expo-linear-gradient)
  gradientPrimary: ['#E10600', '#FF2B2B'],
  gradientSecondary: ['#00D4AA', '#26E5C7'],
  gradientAccent: ['#FF6B35', '#FF8A5B'],
  gradientF1: ['#E10600', '#FFD700'],
  gradientMotoGP: ['#0066CC', '#FF6600'],
};

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  wrapper: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shadow: {
    boxShadow: `0 4px 16px ${colors.shadow}`,
  },
  shadowLarge: {
    boxShadow: `0 8px 32px ${colors.shadowDark}`,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.divider,
    boxShadow: `0 6px 24px ${colors.shadow}`,
  },
  cardElevated: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.divider,
    boxShadow: `0 12px 40px ${colors.shadowDark}`,
  },
  // Typography
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Roboto_700Bold',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
    lineHeight: 24,
  },
  heading: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Roboto_500Medium',
    letterSpacing: -0.3,
  },
  body: {
    fontSize: 16,
    color: colors.text,
    fontFamily: 'Roboto_400Regular',
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
    lineHeight: 20,
  },
});

export const buttonStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `0 6px 20px ${colors.primary}40`,
  },
  primaryPressed: {
    backgroundColor: colors.primaryDark,
    transform: [{ scale: 0.98 }],
  },
  secondary: {
    backgroundColor: colors.backgroundAlt,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    boxShadow: `0 4px 12px ${colors.shadow}`,
  },
  secondaryPressed: {
    backgroundColor: colors.divider,
    borderColor: colors.primary,
    transform: [{ scale: 0.98 }],
  },
  accent: {
    backgroundColor: colors.accent,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `0 6px 20px ${colors.accent}40`,
  },
  accentPressed: {
    backgroundColor: colors.accentDark,
    transform: [{ scale: 0.98 }],
  },
  text: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    fontFamily: 'Roboto_500Medium',
    letterSpacing: 0.2,
  },
  textSecondary: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 16,
    fontFamily: 'Roboto_500Medium',
    letterSpacing: 0.2,
  },
  textAccent: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    fontFamily: 'Roboto_500Medium',
    letterSpacing: 0.2,
  },
});

// Animation presets
export const animations = {
  spring: {
    tension: 300,
    friction: 20,
  },
  timing: {
    duration: 200,
  },
  scale: {
    pressed: 0.96,
    normal: 1,
  },
};
