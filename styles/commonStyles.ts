
import { StyleSheet } from 'react-native';

export const colors = {
  // Base colors - Clean Light theme with fresh colors
  background: '#FFFFFF',
  backgroundAlt: '#F8FAFC',
  backgroundTertiary: '#F1F5F9',
  card: '#FFFFFF',
  cardElevated: '#FFFFFF',
  text: '#1E293B',
  textSecondary: '#475569',
  textMuted: '#64748B',
  textDisabled: '#94A3B8',
  
  // Fresh primary colors - Modern blue-green
  primary: '#0EA5E9', // Sky Blue
  primaryLight: '#38BDF8',
  primaryDark: '#0284C7',
  primaryGlow: 'rgba(14, 165, 233, 0.2)',
  
  // Secondary colors - Fresh green
  secondary: '#10B981', // Emerald
  secondaryLight: '#34D399',
  secondaryDark: '#059669',
  secondaryGlow: 'rgba(16, 185, 129, 0.2)',
  
  // Accent colors - Warm coral
  accent: '#F97316', // Orange
  accentLight: '#FB923C',
  accentDark: '#EA580C',
  accentGlow: 'rgba(249, 115, 22, 0.2)',
  
  // F1 specific - Clean motorsport colors
  f1Red: '#EF4444',
  f1Silver: '#E2E8F0',
  f1Gold: '#F59E0B',
  f1Carbon: '#64748B',
  
  // MotoGP specific - Fresh motorsport colors
  motogpBlue: '#3B82F6',
  motogpOrange: '#F97316',
  motogpYellow: '#EAB308',
  motogpPurple: '#8B5CF6',
  
  // Weather colors - Clean and distinguishable
  temperature: '#F97316', // Orange
  wind: '#0EA5E9', // Sky Blue
  humidity: '#06B6D4', // Cyan
  precipitation: '#3B82F6', // Blue
  pressure: '#8B5CF6', // Violet
  uv: '#F59E0B', // Amber
  
  // Status colors - Fresh and clear
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#0EA5E9',
  
  // UI colors - Clean light theme
  divider: '#E2E8F0',
  border: '#CBD5E1',
  borderLight: '#E2E8F0',
  shadow: 'rgba(15, 23, 42, 0.08)',
  shadowMedium: 'rgba(15, 23, 42, 0.12)',
  shadowDark: 'rgba(15, 23, 42, 0.16)',
  overlay: 'rgba(15, 23, 42, 0.4)',
  
  // Glass morphism effects
  glass: 'rgba(255, 255, 255, 0.8)',
  glassBorder: 'rgba(255, 255, 255, 0.2)',
  
  // Gradients (for use with expo-linear-gradient)
  gradientPrimary: ['#0EA5E9', '#38BDF8'],
  gradientSecondary: ['#10B981', '#34D399'],
  gradientAccent: ['#F97316', '#FB923C'],
  gradientF1: ['#EF4444', '#F97316'],
  gradientMotoGP: ['#3B82F6', '#F97316'],
  gradientWeather: ['#0EA5E9', '#10B981'],
  gradientSunset: ['#F97316', '#EF4444'],
  gradientNight: ['#64748B', '#475569'],
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
};

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  round: 9999,
};

export const shadows = {
  sm: `0 1px 3px ${colors.shadow}`,
  md: `0 4px 12px ${colors.shadow}`,
  lg: `0 8px 24px ${colors.shadowMedium}`,
  xl: `0 12px 32px ${colors.shadowDark}`,
  glow: (color: string) => `0 0 20px ${color}`,
  glowLarge: (color: string) => `0 0 40px ${color}`,
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
  
  // Enhanced shadow system
  shadowSm: {
    boxShadow: shadows.sm,
  },
  shadowMd: {
    boxShadow: shadows.md,
  },
  shadowLg: {
    boxShadow: shadows.lg,
  },
  shadowXl: {
    boxShadow: shadows.xl,
  },
  
  // Enhanced card system
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.divider,
    boxShadow: shadows.sm,
  },
  cardElevated: {
    backgroundColor: colors.cardElevated,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: shadows.md,
  },
  cardGlass: {
    backgroundColor: colors.glass,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    boxShadow: shadows.sm,
  },
  
  // Enhanced Typography system
  displayLarge: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.text,
    fontFamily: 'Roboto_700Bold',
    letterSpacing: -1,
    lineHeight: 44,
  },
  displayMedium: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Roboto_700Bold',
    letterSpacing: -0.8,
    lineHeight: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Roboto_700Bold',
    letterSpacing: -0.6,
    lineHeight: 36,
  },
  titleMedium: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Roboto_500Medium',
    letterSpacing: -0.4,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
    fontFamily: 'Roboto_500Medium',
    letterSpacing: -0.2,
    lineHeight: 26,
  },
  heading: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Roboto_500Medium',
    letterSpacing: -0.3,
    lineHeight: 28,
  },
  headingSmall: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Roboto_500Medium',
    letterSpacing: -0.1,
    lineHeight: 24,
  },
  body: {
    fontSize: 16,
    color: colors.text,
    fontFamily: 'Roboto_400Regular',
    lineHeight: 24,
    letterSpacing: 0.1,
  },
  bodyMedium: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Roboto_400Regular',
    lineHeight: 22,
    letterSpacing: 0.1,
  },
  caption: {
    fontSize: 12,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
    lineHeight: 18,
    letterSpacing: 0.2,
  },
  captionSmall: {
    fontSize: 10,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
    lineHeight: 16,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
});

export const buttonStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `0 4px 12px ${colors.primaryGlow}`,
    borderWidth: 0,
  },
  primaryPressed: {
    backgroundColor: colors.primaryDark,
    transform: [{ scale: 0.97 }],
    boxShadow: `0 2px 8px ${colors.primaryGlow}`,
  },
  secondary: {
    backgroundColor: colors.backgroundAlt,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: shadows.sm,
  },
  secondaryPressed: {
    backgroundColor: colors.backgroundTertiary,
    borderColor: colors.primary,
    transform: [{ scale: 0.97 }],
  },
  accent: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `0 4px 12px ${colors.accentGlow}`,
    borderWidth: 0,
  },
  accentPressed: {
    backgroundColor: colors.accentDark,
    transform: [{ scale: 0.97 }],
  },
  ghost: {
    backgroundColor: 'transparent',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.divider,
  },
  ghostPressed: {
    backgroundColor: colors.backgroundAlt,
    borderColor: colors.border,
  },
  
  // Text styles
  text: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    fontFamily: 'Roboto_500Medium',
    letterSpacing: 0.3,
  },
  textSecondary: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 16,
    fontFamily: 'Roboto_500Medium',
    letterSpacing: 0.3,
  },
  textAccent: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    fontFamily: 'Roboto_500Medium',
    letterSpacing: 0.3,
  },
  textGhost: {
    color: colors.text,
    fontWeight: '500',
    fontSize: 14,
    fontFamily: 'Roboto_500Medium',
    letterSpacing: 0.2,
  },
});

// Enhanced animation presets
export const animations = {
  spring: {
    tension: 400,
    friction: 25,
  },
  springBouncy: {
    tension: 300,
    friction: 15,
  },
  timing: {
    duration: 250,
  },
  timingFast: {
    duration: 150,
  },
  timingSlow: {
    duration: 400,
  },
  scale: {
    pressed: 0.96,
    normal: 1,
    hover: 1.02,
  },
  opacity: {
    pressed: 0.8,
    normal: 1,
    disabled: 0.5,
  },
};

// Layout helpers
export const layout = {
  screenPadding: spacing.lg,
  cardSpacing: spacing.md,
  sectionSpacing: spacing.xxl,
  itemSpacing: spacing.sm,
};
