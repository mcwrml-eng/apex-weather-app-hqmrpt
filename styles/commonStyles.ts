
import { StyleSheet } from 'react-native';

export const colors = {
  // Dark theme colors
  background: '#0F0F0F',
  backgroundAlt: '#1A1A1A',
  card: '#1E1E1E',
  text: '#FFFFFF',
  textMuted: '#A0A0A0',
  divider: '#2A2A2A',
  
  // Brand colors
  primary: '#007AFF',
  accent: '#FF6B35',
  
  // Weather-specific colors
  temperature: '#FF6B35',
  wind: '#007AFF',
  humidity: '#34C759',
  precipitation: '#5AC8FA',
  warning: '#FF9500',
  error: '#FF3B30',
};

export const animations = {
  spring: {
    damping: 15,
    stiffness: 150,
  },
  timing: {
    duration: 200,
  },
};

export const buttonStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondary: {
    backgroundColor: colors.backgroundAlt,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.divider,
  },
  text: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Roboto_500Medium',
  },
});
