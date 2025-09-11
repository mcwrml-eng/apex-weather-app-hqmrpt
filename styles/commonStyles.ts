
import { StyleSheet } from 'react-native';

export const colors = {
  // Base colors - Enhanced Clean Light theme with improved contrast
  background: '#FFFFFF',
  backgroundAlt: '#F8FAFC',
  backgroundTertiary: '#F1F5F9',
  backgroundQuaternary: '#E2E8F0',
  card: '#FFFFFF',
  cardElevated: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#334155',
  textMuted: '#64748B',
  textDisabled: '#94A3B8',
  
  // Enhanced primary colors - Modern sky blue with better gradients
  primary: '#0EA5E9', // Sky Blue
  primaryLight: '#38BDF8',
  primaryDark: '#0284C7',
  primaryGlow: 'rgba(14, 165, 233, 0.15)',
  primarySoft: 'rgba(14, 165, 233, 0.08)',
  
  // Enhanced secondary colors - Fresh emerald green
  secondary: '#10B981', // Emerald
  secondaryLight: '#34D399',
  secondaryDark: '#059669',
  secondaryGlow: 'rgba(16, 185, 129, 0.15)',
  secondarySoft: 'rgba(16, 185, 129, 0.08)',
  
  // Enhanced accent colors - Warm orange
  accent: '#F97316', // Orange
  accentLight: '#FB923C',
  accentDark: '#EA580C',
  accentGlow: 'rgba(249, 115, 22, 0.15)',
  accentSoft: 'rgba(249, 115, 22, 0.08)',
  
  // Enhanced F1 specific colors
  f1Red: '#DC2626',
  f1RedLight: '#EF4444',
  f1RedDark: '#B91C1C',
  f1Silver: '#E2E8F0',
  f1Gold: '#F59E0B',
  f1Carbon: '#64748B',
  
  // Enhanced MotoGP specific colors
  motogpBlue: '#2563EB',
  motogpBlueLight: '#3B82F6',
  motogpBlueDark: '#1D4ED8',
  motogpOrange: '#F97316',
  motogpYellow: '#EAB308',
  motogpPurple: '#8B5CF6',
  
  // Enhanced IndyCar specific colors
  indycarBlue: '#1E40AF',
  indycarBlueLight: '#3B82F6',
  indycarBlueDark: '#1E3A8A',
  indycarRed: '#DC2626',
  indycarWhite: '#FFFFFF',
  indycarSilver: '#94A3B8',
  
  // Enhanced weather colors with better contrast
  temperature: '#F97316', // Orange
  temperatureLight: '#FB923C',
  temperatureDark: '#EA580C',
  wind: '#0EA5E9', // Sky Blue
  windLight: '#38BDF8',
  windDark: '#0284C7',
  humidity: '#06B6D4', // Cyan
  humidityLight: '#22D3EE',
  humidityDark: '#0891B2',
  precipitation: '#3B82F6', // Blue
  precipitationLight: '#60A5FA',
  precipitationDark: '#2563EB',
  pressure: '#8B5CF6', // Violet
  pressureLight: '#A78BFA',
  pressureDark: '#7C3AED',
  uv: '#F59E0B', // Amber
  uvLight: '#FBBF24',
  uvDark: '#D97706',
  
  // Enhanced status colors
  success: '#10B981',
  successLight: '#34D399',
  successDark: '#059669',
  warning: '#F59E0B',
  warningLight: '#FBBF24',
  warningDark: '#D97706',
  error: '#DC2626',
  errorLight: '#EF4444',
  errorDark: '#B91C1C',
  info: '#0EA5E9',
  infoLight: '#38BDF8',
  infoDark: '#0284C7',
  
  // Enhanced UI colors with better hierarchy
  divider: '#E2E8F0',
  dividerLight: '#F1F5F9',
  border: '#CBD5E1',
  borderLight: '#E2E8F0',
  borderDark: '#94A3B8',
  shadow: 'rgba(15, 23, 42, 0.04)',
  shadowMedium: 'rgba(15, 23, 42, 0.08)',
  shadowDark: 'rgba(15, 23, 42, 0.12)',
  shadowStrong: 'rgba(15, 23, 42, 0.16)',
  overlay: 'rgba(15, 23, 42, 0.4)',
  overlayLight: 'rgba(15, 23, 42, 0.2)',
  
  // Enhanced glass morphism effects
  glass: 'rgba(255, 255, 255, 0.85)',
  glassBorder: 'rgba(255, 255, 255, 0.3)',
  glassOverlay: 'rgba(248, 250, 252, 0.6)',
  
  // Enhanced gradients (for use with expo-linear-gradient)
  gradientPrimary: ['#0EA5E9', '#38BDF8'],
  gradientSecondary: ['#10B981', '#34D399'],
  gradientAccent: ['#F97316', '#FB923C'],
  gradientF1: ['#DC2626', '#F97316'],
  gradientMotoGP: ['#2563EB', '#F97316'],
  gradientIndyCar: ['#1E40AF', '#DC2626'],
  gradientWeather: ['#0EA5E9', '#10B981'],
  gradientSunset: ['#F97316', '#DC2626'],
  gradientNight: ['#64748B', '#334155'],
  gradientLight: ['#FFFFFF', '#F8FAFC'],
  gradientSoft: ['#F8FAFC', '#F1F5F9'],
  
  // New enhanced gradients for better visual appeal
  gradientHero: ['#0EA5E9', '#10B981', '#F97316'],
  gradientCard: ['#FFFFFF', '#F8FAFC'],
  gradientButton: ['#0EA5E9', '#0284C7'],
  gradientSuccess: ['#10B981', '#059669'],
  gradientWarning: ['#F59E0B', '#D97706'],
  gradientError: ['#DC2626', '#B91C1C'],
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
  massive: 48,
};

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  round: 9999,
};

export const shadows = {
  xs: `0 1px 2px ${colors.shadow}`,
  sm: `0 1px 3px ${colors.shadow}`,
  md: `0 4px 12px ${colors.shadowMedium}`,
  lg: `0 8px 24px ${colors.shadowDark}`,
  xl: `0 12px 32px ${colors.shadowStrong}`,
  xxl: `0 16px 40px ${colors.shadowStrong}`,
  glow: (color: string) => `0 0 20px ${color}`,
  glowLarge: (color: string) => `0 0 40px ${color}`,
  glowSoft: (color: string) => `0 0 12px ${color}`,
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
  
  // Enhanced shadow system with more options
  shadowXs: {
    boxShadow: shadows.xs,
  },
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
  shadowXxl: {
    boxShadow: shadows.xxl,
  },
  
  // Enhanced card system with more variants
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
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
  cardHero: {
    backgroundColor: colors.cardElevated,
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
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
    boxShadow: shadows.sm,
  },
  cardCompact: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    boxShadow: shadows.xs,
  },
  
  // Enhanced Typography system with better hierarchy
  displayLarge: {
    fontSize: 40,
    fontWeight: '800',
    color: colors.text,
    fontFamily: 'Roboto_700Bold',
    letterSpacing: -1.2,
    lineHeight: 48,
  },
  displayMedium: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Roboto_700Bold',
    letterSpacing: -1,
    lineHeight: 44,
  },
  displaySmall: {
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
  titleSmall: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Roboto_500Medium',
    letterSpacing: -0.3,
    lineHeight: 28,
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
  bodySmall: {
    fontSize: 12,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
    lineHeight: 18,
    letterSpacing: 0.2,
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
  label: {
    fontSize: 11,
    color: colors.textMuted,
    fontFamily: 'Roboto_500Medium',
    lineHeight: 16,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    fontWeight: '500',
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
  primaryLarge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `0 6px 16px ${colors.primaryGlow}`,
    borderWidth: 0,
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
  outline: {
    backgroundColor: 'transparent',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  outlinePressed: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primaryDark,
  },
  
  // Text styles with enhanced hierarchy
  text: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    fontFamily: 'Roboto_500Medium',
    letterSpacing: 0.3,
  },
  textLarge: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 18,
    fontFamily: 'Roboto_500Medium',
    letterSpacing: 0.2,
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
  textOutline: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 16,
    fontFamily: 'Roboto_500Medium',
    letterSpacing: 0.3,
  },
});

// Enhanced animation presets with more options
export const animations = {
  spring: {
    tension: 400,
    friction: 25,
  },
  springBouncy: {
    tension: 300,
    friction: 15,
  },
  springGentle: {
    tension: 200,
    friction: 20,
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
  timingVeryFast: {
    duration: 100,
  },
  timingVerySlow: {
    duration: 600,
  },
  scale: {
    pressed: 0.96,
    normal: 1,
    hover: 1.02,
    active: 1.05,
  },
  opacity: {
    pressed: 0.8,
    normal: 1,
    disabled: 0.5,
    subtle: 0.7,
  },
};

// Enhanced layout helpers
export const layout = {
  screenPadding: spacing.lg,
  screenPaddingLarge: spacing.xl,
  cardSpacing: spacing.md,
  cardSpacingLarge: spacing.lg,
  sectionSpacing: spacing.xxl,
  sectionSpacingLarge: spacing.xxxl,
  itemSpacing: spacing.sm,
  itemSpacingLarge: spacing.md,
  headerHeight: 60,
  tabBarHeight: 80,
  buttonHeight: 48,
  buttonHeightLarge: 56,
  inputHeight: 48,
};

// New utility styles for common patterns
export const utilities = StyleSheet.create({
  // Flex utilities
  flex1: { flex: 1 },
  flexRow: { flexDirection: 'row' },
  flexColumn: { flexDirection: 'column' },
  flexCenter: { justifyContent: 'center', alignItems: 'center' },
  flexBetween: { justifyContent: 'space-between' },
  flexAround: { justifyContent: 'space-around' },
  flexEvenly: { justifyContent: 'space-evenly' },
  flexStart: { justifyContent: 'flex-start' },
  flexEnd: { justifyContent: 'flex-end' },
  alignCenter: { alignItems: 'center' },
  alignStart: { alignItems: 'flex-start' },
  alignEnd: { alignItems: 'flex-end' },
  alignStretch: { alignItems: 'stretch' },
  
  // Position utilities
  absolute: { position: 'absolute' },
  relative: { position: 'relative' },
  
  // Size utilities
  fullWidth: { width: '100%' },
  fullHeight: { height: '100%' },
  
  // Margin utilities
  m0: { margin: 0 },
  mt0: { marginTop: 0 },
  mb0: { marginBottom: 0 },
  ml0: { marginLeft: 0 },
  mr0: { marginRight: 0 },
  
  // Padding utilities
  p0: { padding: 0 },
  pt0: { paddingTop: 0 },
  pb0: { paddingBottom: 0 },
  pl0: { paddingLeft: 0 },
  pr0: { paddingRight: 0 },
  
  // Border utilities
  borderTop: { borderTopWidth: 1, borderTopColor: colors.border },
  borderBottom: { borderBottomWidth: 1, borderBottomColor: colors.border },
  borderLeft: { borderLeftWidth: 1, borderLeftColor: colors.border },
  borderRight: { borderRightWidth: 1, borderRightColor: colors.border },
  
  // Background utilities
  bgTransparent: { backgroundColor: 'transparent' },
  bgPrimary: { backgroundColor: colors.primary },
  bgSecondary: { backgroundColor: colors.secondary },
  bgAccent: { backgroundColor: colors.accent },
  bgCard: { backgroundColor: colors.card },
  bgBackground: { backgroundColor: colors.background },
  bgBackgroundAlt: { backgroundColor: colors.backgroundAlt },
  
  // Text utilities
  textCenter: { textAlign: 'center' },
  textLeft: { textAlign: 'left' },
  textRight: { textAlign: 'right' },
  textUppercase: { textTransform: 'uppercase' },
  textLowercase: { textTransform: 'lowercase' },
  textCapitalize: { textTransform: 'capitalize' },
  
  // Overflow utilities
  overflowHidden: { overflow: 'hidden' },
  overflowVisible: { overflow: 'visible' },
});
