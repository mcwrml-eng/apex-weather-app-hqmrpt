
import { StyleSheet } from 'react-native';

export const colors = {
  // Base colors - Enhanced Dark theme with better contrast
  background: '#0A0E13',
  backgroundAlt: '#151B23',
  backgroundTertiary: '#1F2937',
  card: '#1A2332',
  cardElevated: '#212B3D',
  text: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textMuted: '#94A3B8',
  textDisabled: '#64748B',
  
  // Enhanced Motorsport-inspired primary colors
  primary: '#DC2626', // Enhanced Ferrari Red
  primaryLight: '#EF4444',
  primaryDark: '#B91C1C',
  primaryGlow: 'rgba(220, 38, 38, 0.3)',
  
  // Secondary colors with better saturation
  secondary: '#059669', // Enhanced Emerald
  secondaryLight: '#10B981',
  secondaryDark: '#047857',
  secondaryGlow: 'rgba(5, 150, 105, 0.3)',
  
  // Accent colors
  accent: '#F59E0B', // Enhanced Amber
  accentLight: '#FBBF24',
  accentDark: '#D97706',
  accentGlow: 'rgba(245, 158, 11, 0.3)',
  
  // F1 specific - Enhanced
  f1Red: '#DC2626',
  f1Silver: '#E5E7EB',
  f1Gold: '#F59E0B',
  f1Carbon: '#374151',
  
  // MotoGP specific - Enhanced
  motogpBlue: '#2563EB',
  motogpOrange: '#EA580C',
  motogpYellow: '#EAB308',
  motogpPurple: '#7C3AED',
  
  // Weather colors - Enhanced with better visibility
  temperature: '#F97316', // Enhanced Orange
  wind: '#0EA5E9', // Enhanced Sky Blue
  humidity: '#06B6D4', // Enhanced Cyan
  precipitation: '#3B82F6', // Enhanced Blue
  pressure: '#8B5CF6', // Enhanced Violet
  uv: '#F59E0B', // Enhanced Amber
  
  // Status colors - Enhanced
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // UI colors - Enhanced Dark theme
  divider: '#334155',
  border: '#475569',
  borderLight: '#64748B',
  shadow: 'rgba(0, 0, 0, 0.4)',
  shadowMedium: 'rgba(0, 0, 0, 0.6)',
  shadowDark: 'rgba(0, 0, 0, 0.8)',
  overlay: 'rgba(0, 0, 0, 0.5)',
  
  // Glass morphism effects
  glass: 'rgba(255, 255, 255, 0.05)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
  
  // Gradients (for use with expo-linear-gradient)
  gradientPrimary: ['#DC2626', '#EF4444'],
  gradientSecondary: ['#059669', '#10B981'],
  gradientAccent: ['#F59E0B', '#FBBF24'],
  gradientF1: ['#DC2626', '#F59E0B'],
  gradientMotoGP: ['#2563EB', '#EA580C'],
  gradientWeather: ['#0EA5E9', '#3B82F6'],
  gradientSunset: ['#F59E0B', '#DC2626'],
  gradientNight: ['#1E293B', '#0F172A'],
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
  sm: `0 2px 8px ${colors.shadow}`,
  md: `0 4px 16px ${colors.shadow}`,
  lg: `0 8px 32px ${colors.shadowMedium}`,
  xl: `0 12px 48px ${colors.shadowDark}`,
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
    boxShadow: shadows.md,
  },
  cardElevated: {
    backgroundColor: colors.cardElevated,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: shadows.lg,
  },
  cardGlass: {
    backgroundColor: colors.glass,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    boxShadow: shadows.md,
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
    boxShadow: `0 6px 20px ${colors.primaryGlow}`,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  primaryPressed: {
    backgroundColor: colors.primaryDark,
    transform: [{ scale: 0.97 }],
    boxShadow: `0 4px 16px ${colors.primaryGlow}`,
  },
  secondary: {
    backgroundColor: colors.backgroundAlt,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    boxShadow: shadows.md,
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
    boxShadow: `0 6px 20px ${colors.accentGlow}`,
    borderWidth: 1,
    borderColor: colors.accentLight,
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
