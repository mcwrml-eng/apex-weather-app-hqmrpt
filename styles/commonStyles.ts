
import { StyleSheet } from 'react-native';

export const colors = {
  primary: '#0D47A1',
  secondary: '#1565C0',
  accent: '#FF8F00',
  background: '#F7FAFD',
  backgroundAlt: '#FFFFFF',
  text: '#1A1D21',
  textMuted: '#5F6B7A',
  divider: '#E6ECF2',
  card: '#FFFFFF',
  success: '#2E7D32',
  warning: '#F9A825',
  danger: '#C62828',
};

export const buttonStyles = StyleSheet.create({
  instructionsButton: {
    backgroundColor: colors.primary,
    alignSelf: 'center',
    width: '100%',
  },
  backButton: {
    backgroundColor: colors.primary,
    alignSelf: 'center',
    width: '100%',
  },
});

export const commonStyles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 880,
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    color: colors.text,
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textMuted,
    marginBottom: 8,
    lineHeight: 24,
    textAlign: 'center',
  },
  section: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.divider,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginVertical: 10,
    width: '100%',
    boxShadow: '0 6px 24px rgba(16, 24, 40, 0.08)',
  },
  icon: {
    width: 60,
    height: 60,
  },
});
