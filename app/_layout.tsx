
import 'react-native-gesture-handler';
import { Stack, useGlobalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, SafeAreaView, View, Text, ActivityIndicator } from 'react-native';
import { getCommonStyles, getColors } from '../styles/commonStyles';
import { useEffect, useState, useCallback } from 'react';
import { setupErrorLogging } from '../utils/errorLogger';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts, Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto';
import { UnitProvider } from '../state/UnitContext';
import { ThemeProvider, useTheme } from '../state/ThemeContext';
import { LanguageProvider } from '../state/LanguageContext';
import ErrorBoundary from '../components/ErrorBoundary';
import * as SplashScreen from 'expo-splash-screen';

const STORAGE_KEY = 'emulated_device';

// Prevent auto-hide of splash screen with error handling
try {
  SplashScreen.preventAutoHideAsync().catch((error) => {
    console.warn('SplashScreen.preventAutoHideAsync error:', error);
  });
} catch (error) {
  console.warn('SplashScreen.preventAutoHideAsync failed:', error);
}

function LoadingScreen() {
  const colors = getColors(false);
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={{ marginTop: 16, color: colors.text, fontSize: 16 }}>Loading GridWeather Pro...</Text>
    </View>
  );
}

function AppContent() {
  const actualInsets = useSafeAreaInsets();
  const { emulate } = useGlobalSearchParams<{ emulate?: string }>();
  const [storedEmulate, setStoredEmulate] = useState<string | null>(null);
  const [fontsLoaded, fontError] = useFonts({ 
    Roboto_400Regular, 
    Roboto_500Medium, 
    Roboto_700Bold 
  });
  const { isDark } = useTheme();
  const [appIsReady, setAppIsReady] = useState(false);
  const [splashHidden, setSplashHidden] = useState(false);
  
  const colors = getColors(isDark);
  const commonStyles = getCommonStyles(isDark);

  // Setup error logging once
  useEffect(() => {
    console.log('AppContent: Setting up error logging');
    try {
      setupErrorLogging();
    } catch (error) {
      console.error('AppContent: Error setting up error logging:', error);
    }
  }, []);

  // Handle web-specific emulation
  useEffect(() => {
    if (Platform.OS === 'web') {
      try {
        if (emulate) {
          localStorage.setItem(STORAGE_KEY, emulate);
          setStoredEmulate(emulate);
        } else {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            setStoredEmulate(stored);
          }
        }
      } catch (error) {
        console.error('AppContent: Error with localStorage:', error);
      }
    }
  }, [emulate]);

  // Hide splash screen with proper error handling
  const hideSplash = useCallback(async () => {
    if (splashHidden) {
      return;
    }

    try {
      console.log('AppContent: Attempting to hide splash screen');
      await SplashScreen.hideAsync();
      setSplashHidden(true);
      console.log('AppContent: Splash screen hidden successfully');
    } catch (error) {
      console.error('AppContent: Error hiding splash screen:', error);
      setSplashHidden(true); // Mark as hidden anyway to prevent blocking
    }
  }, [splashHidden]);

  // Prepare app and hide splash screen
  useEffect(() => {
    async function prepare() {
      try {
        console.log('AppContent: Preparing app...', {
          fontsLoaded,
          fontError: fontError?.message,
          platform: Platform.OS
        });
        
        // Wait for fonts to load or error
        if (fontsLoaded || fontError) {
          console.log('AppContent: Fonts ready, marking app as ready');
          
          // Small delay to ensure everything is mounted (especially important on iOS)
          await new Promise(resolve => setTimeout(resolve, 100));
          
          setAppIsReady(true);
          
          // Hide splash screen after app is ready
          await hideSplash();
        }
      } catch (error) {
        console.error('AppContent: Error during preparation:', error);
        // Continue anyway to prevent app from being stuck
        setAppIsReady(true);
        await hideSplash();
      }
    }

    prepare();
  }, [fontsLoaded, fontError, hideSplash]);

  // Calculate insets
  let insetsToUse = actualInsets;

  if (Platform.OS === 'web') {
    const simulatedInsets = {
      ios: { top: 47, bottom: 20, left: 0, right: 0 },
      android: { top: 40, bottom: 0, left: 0, right: 0 },
    } as const;

    const deviceToEmulate = storedEmulate || emulate;
    insetsToUse = deviceToEmulate ? (simulatedInsets as any)[deviceToEmulate as keyof typeof simulatedInsets] || actualInsets : actualInsets;
  }

  // Show loading screen while app is not ready
  if (!appIsReady) {
    console.log('AppContent: App not ready yet, showing loading screen');
    return <LoadingScreen />;
  }

  if (fontError) {
    console.error('AppContent: Font loading error:', fontError);
    // Continue with system fonts
  }

  console.log('AppContent: Rendering app with theme:', isDark ? 'dark' : 'light');

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
        <SafeAreaView style={[commonStyles.wrapper, {
            paddingTop: insetsToUse.top,
            paddingBottom: insetsToUse.bottom,
            paddingLeft: insetsToUse.left,
            paddingRight: insetsToUse.right,
         }]}>
          <StatusBar style={isDark ? "light" : "dark"} />
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'default',
              contentStyle: { backgroundColor: colors.background }
            }}
          />
        </SafeAreaView>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  console.log('RootLayout: Initializing app', {
    platform: Platform.OS,
    version: Platform.Version,
    isDev: __DEV__
  });
  
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <UnitProvider>
            <ErrorBoundary>
              <AppContent />
            </ErrorBoundary>
          </UnitProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
