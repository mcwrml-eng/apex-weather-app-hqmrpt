
import { StyleSheet } from 'react-native';

// Light theme colors
const lightColors = {
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
  
  // Enhanced NASCAR specific colors
  nascarYellow: '#FCD34D',
  nascarYellowLight: '#FDE68A',
  nascarYellowDark: '#F59E0B',
  nascarBlack: '#1F2937',
  nascarRed: '#DC2626',
  nascarBlue: '#2563EB',
  
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

// Dark theme colors
const darkColors = {
  // Base colors - Dark theme with good contrast
  background: '#0F172A',
  backgroundAlt: '#1E293B',
  backgroundTertiary: '#334155',
  backgroundQuaternary: '#475569',
  card: '#1E293B',
  cardElevated: '#334155',
  text: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textMuted: '#94A3B8',
  textDisabled: '#64748B',
  
  // Enhanced primary colors - Brighter for dark theme
  primary: '#38BDF8', // Lighter Sky Blue
  primaryLight: '#7DD3FC',
  primaryDark: '#0EA5E9',
  primaryGlow: 'rgba(56, 189, 248, 0.25)',
  primarySoft: 'rgba(56, 189, 248, 0.15)',
  
  // Enhanced secondary colors - Brighter emerald
  secondary: '#34D399', // Lighter Emerald
  secondaryLight: '#6EE7B7',
  secondaryDark: '#10B981',
  secondaryGlow: 'rgba(52, 211, 153, 0.25)',
  secondarySoft: 'rgba(52, 211, 153, 0.15)',
  
  // Enhanced accent colors - Brighter orange
  accent: '#FB923C', // Lighter Orange
  accentLight: '#FDBA74',
  accentDark: '#F97316',
  accentGlow: 'rgba(251, 146, 60, 0.25)',
  accentSoft: 'rgba(251, 146, 60, 0.15)',
  
  // Enhanced F1 specific colors - Adjusted for dark theme
  f1Red: '#EF4444',
  f1RedLight: '#F87171',
  f1RedDark: '#DC2626',
  f1Silver: '#94A3B8',
  f1Gold: '#FBBF24',
  f1Carbon: '#475569',
  
  // Enhanced MotoGP specific colors - Adjusted for dark theme
  motogpBlue: '#3B82F6',
  motogpBlueLight: '#60A5FA',
  motogpBlueDark: '#2563EB',
  motogpOrange: '#FB923C',
  motogpYellow: '#FDE047',
  motogpPurple: '#A78BFA',
  
  // Enhanced IndyCar specific colors - Adjusted for dark theme
  indycarBlue: '#3B82F6',
  indycarBlueLight: '#60A5FA',
  indycarBlueDark: '#2563EB',
  indycarRed: '#EF4444',
  indycarWhite: '#F8FAFC',
  indycarSilver: '#CBD5E1',
  
  // Enhanced NASCAR specific colors - Adjusted for dark theme
  nascarYellow: '#FDE047',
  nascarYellowLight: '#FEF08A',
  nascarYellowDark: '#FBBF24',
  nascarBlack: '#374151',
  nascarRed: '#EF4444',
  nascarBlue: '#3B82F6',
  
  // Enhanced weather colors - Brighter for dark theme
  temperature: '#FB923C', // Brighter Orange
  temperatureLight: '#FDBA74',
  temperatureDark: '#F97316',
  wind: '#38BDF8', // Brighter Sky Blue
  windLight: '#7DD3FC',
  windDark: '#0EA5E9',
  humidity: '#22D3EE', // Brighter Cyan
  humidityLight: '#67E8F9',
  humidityDark: '#06B6D4',
  precipitation: '#60A5FA', // Brighter Blue
  precipitationLight: '#93C5FD',
  precipitationDark: '#3B82F6',
  pressure: '#A78BFA', // Brighter Violet
  pressureLight: '#C4B5FD',
  pressureDark: '#8B5CF6',
  uv: '#FBBF24', // Brighter Amber
  uvLight: '#FDE047',
  uvDark: '#F59E0B',
  
  // Enhanced status colors - Adjusted for dark theme
  success: '#34D399',
  successLight: '#6EE7B7',
  successDark: '#10B981',
  warning: '#FBBF24',
  warningLight: '#FDE047',
  warningDark: '#F59E0B',
  error: '#EF4444',
  errorLight: '#F87171',
  errorDark: '#DC2626',
  info: '#38BDF8',
  infoLight: '#7DD3FC',
  infoDark: '#0EA5E9',
  
  // Enhanced UI colors - Adjusted for dark theme
  divider: '#475569',
  dividerLight: '#334155',
  border: '#64748B',
  borderLight: '#475569',
  borderDark: '#94A3B8',
  shadow: 'rgba(0, 0, 0, 0.3)',
  shadowMedium: 'rgba(0, 0, 0, 0.4)',
  shadowDark: 'rgba(0, 0, 0, 0.5)',
  shadowStrong: 'rgba(0, 0, 0, 0.6)',
  overlay: 'rgba(0, 0, 0, 0.6)',
  overlayLight: 'rgba(0, 0, 0, 0.4)',
  
  // Enhanced glass morphism effects - Adjusted for dark theme
  glass: 'rgba(30, 41, 59, 0.85)',
  glassBorder: 'rgba(148, 163, 184, 0.3)',
  glassOverlay: 'rgba(15, 23, 42, 0.6)',
  
  // Enhanced gradients - Adjusted for dark theme
  gradientPrimary: ['#38BDF8', '#7DD3FC'],
  gradientSecondary: ['#34D399', '#6EE7B7'],
  gradientAccent: ['#FB923C', '#FDBA74'],
  gradientF1: ['#EF4444', '#FB923C'],
  gradientMotoGP: ['#3B82F6', '#FB923C'],
  gradientIndyCar: ['#3B82F6', '#EF4444'],
  gradientWeather: ['#38BDF8', '#34D399'],
  gradientSunset: ['#FB923C', '#EF4444'],
  gradientNight: ['#1E293B', '#0F172A'],
  gradientLight: ['#334155', '#1E293B'],
  gradientSoft: ['#1E293B', '#334155'],
  
  // New enhanced gradients for dark theme
  gradientHero: ['#38BDF8', '#34D399', '#FB923C'],
  gradientCard: ['#1E293B', '#334155'],
  gradientButton: ['#38BDF8', '#0EA5E9'],
  gradientSuccess: ['#34D399', '#10B981'],
  gradientWarning: ['#FBBF24', '#F59E0B'],
  gradientError: ['#EF4444', '#DC2626'],
};

// Export colors based on theme
export const getColors = (isDark: boolean) => isDark ? darkColors : lightColors;

// Default to light theme for backward compatibility
export const colors = lightColors;

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

export const getShadows = (isDark: boolean) => {
  const themeColors = getColors(isDark);
  return {
    xs: `0 1px 2px ${themeColors.shadow}`,
    sm: `0 1px 3px ${themeColors.shadow}`,
    md: `0 4px 12px ${themeColors.shadowMedium}`,
    lg: `0 8px 24px ${themeColors.shadowDark}`,
    xl: `0 12px 32px ${themeColors.shadowStrong}`,
    xxl: `0 16px 40px ${themeColors.shadowStrong}`,
    glow: (color: string) => `0 0 20px ${color}`,
    glowLarge: (color: string) => `0 0 40px ${color}`,
    glowSoft: (color: string) => `0 0 12px ${color}`,
  };
};

// Default shadows for backward compatibility
export const shadows = getShadows(false);

export const getCommonStyles = (isDark: boolean) => {
  const themeColors = getColors(isDark);
  const themeShadows = getShadows(isDark);
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background,
    },
    wrapper: {
      flex: 1,
      backgroundColor: themeColors.background,
    },
    safeArea: {
      flex: 1,
      backgroundColor: themeColors.background,
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
      boxShadow: themeShadows.xs,
    },
    shadowSm: {
      boxShadow: themeShadows.sm,
    },
    shadowMd: {
      boxShadow: themeShadows.md,
    },
    shadowLg: {
      boxShadow: themeShadows.lg,
    },
    shadowXl: {
      boxShadow: themeShadows.xl,
    },
    shadowXxl: {
      boxShadow: themeShadows.xxl,
    },
    
    // Enhanced card system with more variants
    card: {
      backgroundColor: themeColors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: themeColors.borderLight,
      boxShadow: themeShadows.sm,
    },
    cardElevated: {
      backgroundColor: themeColors.cardElevated,
      borderRadius: borderRadius.lg,
      padding: spacing.xl,
      borderWidth: 1,
      borderColor: themeColors.border,
      boxShadow: themeShadows.md,
    },
    cardHero: {
      backgroundColor: themeColors.cardElevated,
      borderRadius: borderRadius.xl,
      padding: spacing.xxl,
      borderWidth: 1,
      borderColor: themeColors.border,
      boxShadow: themeShadows.lg,
    },
    cardGlass: {
      backgroundColor: themeColors.glass,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: themeColors.glassBorder,
      boxShadow: themeShadows.sm,
    },
    cardCompact: {
      backgroundColor: themeColors.card,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: themeColors.borderLight,
      boxShadow: themeShadows.xs,
    },
    
    // Enhanced Typography system with better hierarchy
    displayLarge: {
      fontSize: 40,
      fontWeight: '800',
      color: themeColors.text,
      fontFamily: 'Roboto_700Bold',
      letterSpacing: -1.2,
      lineHeight: 48,
    },
    displayMedium: {
      fontSize: 36,
      fontWeight: '700',
      color: themeColors.text,
      fontFamily: 'Roboto_700Bold',
      letterSpacing: -1,
      lineHeight: 44,
    },
    displaySmall: {
      fontSize: 32,
      fontWeight: '700',
      color: themeColors.text,
      fontFamily: 'Roboto_700Bold',
      letterSpacing: -0.8,
      lineHeight: 40,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: themeColors.text,
      fontFamily: 'Roboto_700Bold',
      letterSpacing: -0.6,
      lineHeight: 36,
    },
    titleMedium: {
      fontSize: 24,
      fontWeight: '600',
      color: themeColors.text,
      fontFamily: 'Roboto_500Medium',
      letterSpacing: -0.4,
      lineHeight: 32,
    },
    titleSmall: {
      fontSize: 20,
      fontWeight: '600',
      color: themeColors.text,
      fontFamily: 'Roboto_500Medium',
      letterSpacing: -0.3,
      lineHeight: 28,
    },
    subtitle: {
      fontSize: 18,
      fontWeight: '600',
      color: themeColors.textSecondary,
      fontFamily: 'Roboto_500Medium',
      letterSpacing: -0.2,
      lineHeight: 26,
    },
    heading: {
      fontSize: 20,
      fontWeight: '600',
      color: themeColors.text,
      fontFamily: 'Roboto_500Medium',
      letterSpacing: -0.3,
      lineHeight: 28,
    },
    headingSmall: {
      fontSize: 16,
      fontWeight: '600',
      color: themeColors.text,
      fontFamily: 'Roboto_500Medium',
      letterSpacing: -0.1,
      lineHeight: 24,
    },
    body: {
      fontSize: 16,
      color: themeColors.text,
      fontFamily: 'Roboto_400Regular',
      lineHeight: 24,
      letterSpacing: 0.1,
    },
    bodyMedium: {
      fontSize: 14,
      color: themeColors.textSecondary,
      fontFamily: 'Roboto_400Regular',
      lineHeight: 22,
      letterSpacing: 0.1,
    },
    bodySmall: {
      fontSize: 12,
      color: themeColors.textMuted,
      fontFamily: 'Roboto_400Regular',
      lineHeight: 18,
      letterSpacing: 0.2,
    },
    caption: {
      fontSize: 12,
      color: themeColors.textMuted,
      fontFamily: 'Roboto_400Regular',
      lineHeight: 18,
      letterSpacing: 0.2,
    },
    captionSmall: {
      fontSize: 10,
      color: themeColors.textMuted,
      fontFamily: 'Roboto_400Regular',
      lineHeight: 16,
      letterSpacing: 0.3,
      textTransform: 'uppercase',
    },
    label: {
      fontSize: 11,
      color: themeColors.textMuted,
      fontFamily: 'Roboto_500Medium',
      lineHeight: 16,
      letterSpacing: 0.5,
      textTransform: 'uppercase',
      fontWeight: '500',
    },
  });
};

// Default styles for backward compatibility
export const commonStyles = getCommonStyles(false);

export const getButtonStyles = (isDark: boolean) => {
  const themeColors = getColors(isDark);
  
  return StyleSheet.create({
    primary: {
      backgroundColor: themeColors.primary,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: `0 4px 12px ${themeColors.primaryGlow}`,
      borderWidth: 0,
    },
    primaryPressed: {
      backgroundColor: themeColors.primaryDark,
      transform: [{ scale: 0.97 }],
      boxShadow: `0 2px 8px ${themeColors.primaryGlow}`,
    },
    primaryLarge: {
      backgroundColor: themeColors.primary,
      paddingHorizontal: spacing.xxl,
      paddingVertical: spacing.lg,
      borderRadius: borderRadius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: `0 6px 16px ${themeColors.primaryGlow}`,
      borderWidth: 0,
    },
    secondary: {
      backgroundColor: themeColors.backgroundAlt,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: themeColors.border,
      boxShadow: getShadows(isDark).sm,
    },
    secondaryPressed: {
      backgroundColor: themeColors.backgroundTertiary,
      borderColor: themeColors.primary,
      transform: [{ scale: 0.97 }],
    },
    accent: {
      backgroundColor: themeColors.accent,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: `0 4px 12px ${themeColors.accentGlow}`,
      borderWidth: 0,
    },
    accentPressed: {
      backgroundColor: themeColors.accentDark,
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
      borderColor: themeColors.divider,
    },
    ghostPressed: {
      backgroundColor: themeColors.backgroundAlt,
      borderColor: themeColors.border,
    },
    outline: {
      backgroundColor: 'transparent',
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: themeColors.primary,
    },
    outlinePressed: {
      backgroundColor: themeColors.primarySoft,
      borderColor: themeColors.primaryDark,
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
      color: themeColors.text,
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
      color: themeColors.text,
      fontWeight: '500',
      fontSize: 14,
      fontFamily: 'Roboto_500Medium',
      letterSpacing: 0.2,
    },
    textOutline: {
      color: themeColors.primary,
      fontWeight: '600',
      fontSize: 16,
      fontFamily: 'Roboto_500Medium',
      letterSpacing: 0.3,
    },
  });
};

// Default button styles for backward compatibility
export const buttonStyles = getButtonStyles(false);

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
export const getUtilities = (isDark: boolean) => {
  const themeColors = getColors(isDark);
  
  return StyleSheet.create({
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
    borderTop: { borderTopWidth: 1, borderTopColor: themeColors.border },
    borderBottom: { borderBottomWidth: 1, borderBottomColor: themeColors.border },
    borderLeft: { borderLeftWidth: 1, borderLeftColor: themeColors.border },
    borderRight: { borderRightWidth: 1, borderRightColor: themeColors.border },
    
    // Background utilities
    bgTransparent: { backgroundColor: 'transparent' },
    bgPrimary: { backgroundColor: themeColors.primary },
    bgSecondary: { backgroundColor: themeColors.secondary },
    bgAccent: { backgroundColor: themeColors.accent },
    bgCard: { backgroundColor: themeColors.card },
    bgBackground: { backgroundColor: themeColors.background },
    bgBackgroundAlt: { backgroundColor: themeColors.backgroundAlt },
    
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
};

// Default utilities for backward compatibility
export const utilities = getUtilities(false);
