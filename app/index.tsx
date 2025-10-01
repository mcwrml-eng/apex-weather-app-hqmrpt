
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '../state/ThemeContext';
import { getColors, getCommonStyles, spacing, borderRadius } from '../styles/commonStyles';
import { LinearGradient } from 'expo-linear-gradient';
import Logo from '../components/Logo';
import { useEffect, useState } from 'react';

export default function IntroScreen() {
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const commonStyles = getCommonStyles(isDark);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    console.log('IntroScreen: Component mounted');
    // Small delay to ensure everything is loaded
    const timer = setTimeout(() => {
      console.log('IntroScreen: Setting ready state');
      setIsReady(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const handleGetStarted = () => {
    console.log('IntroScreen: Get Started pressed, navigating to tabs');
    try {
      router.replace('/(tabs)/f1');
    } catch (error) {
      console.error('IntroScreen: Navigation error:', error);
    }
  };

  if (!isReady) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  console.log('IntroScreen: Rendering intro screen');

  return (
    <LinearGradient
      colors={isDark ? ['#1a1a2e', '#16213e', '#0f3460'] : ['#e8f4f8', '#d4e9f2', '#b8dce8']}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Logo size={120} />
        </View>
        
        <Text style={[styles.title, { color: colors.text }]}>
          Meteorological Services
        </Text>
        
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Professional weather forecasting for motorsport circuits
        </Text>

        <View style={styles.features}>
          <View style={styles.featureItem}>
            <Text style={[styles.featureIcon, { color: colors.primary }]}>🏎️</Text>
            <Text style={[styles.featureText, { color: colors.text }]}>Formula 1</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={[styles.featureIcon, { color: colors.primary }]}>🏍️</Text>
            <Text style={[styles.featureText, { color: colors.text }]}>MotoGP</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={[styles.featureIcon, { color: colors.primary }]}>🏁</Text>
            <Text style={[styles.featureText, { color: colors.text }]}>IndyCar</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={handleGetStarted}
          activeOpacity={0.8}
        >
          <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
            Get Started
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    maxWidth: 500,
    width: '100%',
  },
  logoContainer: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: spacing.md,
    fontFamily: 'Roboto_700Bold',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: spacing.xl * 2,
    lineHeight: 24,
    fontFamily: 'Roboto_400Regular',
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: spacing.xl * 2,
  },
  featureItem: {
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  featureText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Roboto_500Medium',
  },
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl * 2,
    borderRadius: borderRadius.lg,
    minWidth: 200,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Roboto_700Bold',
  },
});
