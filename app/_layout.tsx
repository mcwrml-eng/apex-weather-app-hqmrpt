
// Import polyfills FIRST before anything else
import '../utils/polyfills';
import 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, ActivityIndicator } from 'react-native';
import { getCommonStyles, getColors } from '../styles/commonStyles';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts, Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto';
import * as SplashScreen from 'expo-splash-screen';
import { UnitProvider } from '../state/UnitContext';
import { ThemeProvider, useTheme } from '../state/ThemeContext';
import ErrorBoundary from '../components/ErrorBoundary';
import { setupErrorLogging } from '../utils/errorLogger';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().catch(() => {
  // Silently handle error
});

// Setup error logging as early as possible
try {
  setupErrorLogging();
} catch (error) {
  console.error('[RootLayout] Failed to setup error logging:', error);
}

function LoadingScreen({ isDark }: { isDark: boolean }) {
  const colors = getColors(isDark);
  
  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: colors.background, 
      justifyContent: 'center', 
      alignItems: 'center' 
    }}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={{ 
        marginTop: 16, 
        color: colors.textSecondary, 
        fontSize: 16,
        fontFamily: 'System'
      }}>
        Loading RaceWeather Pro...
      </Text>
    </View>
  );
}

function AppContent() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [fontsLoaded, fontError] = useFonts({ 
    Roboto_400Regular, 
    Roboto_500Medium, 
    Roboto_700Bold 
  });
  const { isDark } = useTheme();
  
  const colors = getColors(isDark);
  const commonStyles = getCommonStyles(isDark);

  useEffect(() => {
    // Add global error handler for uncaught errors
    const errorHandler = (error: any) => {
      console.error('[AppContent] Uncaught error:', error);
      return true; // Prevent default error handling
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('error', errorHandler);
      return () => window.removeEventListener('error', errorHandler);
    }
  }, []);

  useEffect(() => {
    async function prepare() {
      try {
        // Wait for fonts to load or error
        if (fontsLoaded || fontError) {
          if (fontError) {
            console.warn('[AppContent] Font loading error, continuing anyway');
          }
          
          // Small delay to ensure everything is ready
          await new Promise(resolve => setTimeout(resolve, 150));
          
          setAppIsReady(true);
        }
      } catch (e) {
        console.error('[AppContent] Error preparing app:', e);
        // Continue anyway to prevent app from being stuck
        setAppIsReady(true);
      }
    }

    prepare();
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    async function hideSplash() {
      if (appIsReady) {
        try {
          await SplashScreen.hideAsync();
        } catch (e) {
          console.warn('[AppContent] Error hiding splash screen:', e);
        }
      }
    }

    hideSplash();
  }, [appIsReady]);

  // Show loading screen while app is not ready
  if (!appIsReady) {
    return <LoadingScreen isDark={isDark} />;
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={[commonStyles.wrapper, { flex: 1 }]}>
          <StatusBar style={isDark ? "light" : "dark"} />
          <ErrorBoundary>
            <Stack
              screenOptions={{
                headerShown: false,
                animation: 'default',
                contentStyle: { backgroundColor: colors.background },
              }}
            />
          </ErrorBoundary>
        </View>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <UnitProvider>
          <ErrorBoundary>
            <AppContent />
          </ErrorBoundary>
        </UnitProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
