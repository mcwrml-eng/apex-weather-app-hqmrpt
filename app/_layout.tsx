
import 'react-native-gesture-handler';
import { Stack, useGlobalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, SafeAreaView, View, Text, ActivityIndicator } from 'react-native';
import { getCommonStyles, getColors } from '../styles/commonStyles';
import { useEffect, useState } from 'react';
import { setupErrorLogging } from '../utils/errorLogger';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts, Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto';
import { UnitProvider } from '../state/UnitContext';
import { ThemeProvider, useTheme } from '../state/ThemeContext';
import { LanguageProvider } from '../state/LanguageContext';
import ErrorBoundary from '../components/ErrorBoundary';
import * as SplashScreen from 'expo-splash-screen';

const STORAGE_KEY = 'emulated_device';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().catch((error) => {
  console.warn('SplashScreen.preventAutoHideAsync error:', error);
});

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
  
  const colors = getColors(isDark);
  const commonStyles = getCommonStyles(isDark);

  useEffect(() => {
    console.log('AppContent: Setting up error logging');
    try {
      setupErrorLogging();
    } catch (error) {
      console.error('AppContent: Error setting up error logging:', error);
    }

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

  useEffect(() => {
    async function prepare() {
      try {
        console.log('AppContent: Preparing app...');
        
        // Wait for fonts to load
        if (fontsLoaded || fontError) {
          console.log('AppContent: Fonts loaded or error occurred');
          setAppIsReady(true);
          
          // Hide splash screen
          await SplashScreen.hideAsync();
          console.log('AppContent: Splash screen hidden');
        }
      } catch (error) {
        console.error('AppContent: Error during preparation:', error);
        setAppIsReady(true); // Continue anyway
      }
    }

    prepare();
  }, [fontsLoaded, fontError]);

  let insetsToUse = actualInsets;

  if (Platform.OS === 'web') {
    const simulatedInsets = {
      ios: { top: 47, bottom: 20, left: 0, right: 0 },
      android: { top: 40, bottom: 0, left: 0, right: 0 },
    } as const;

    const deviceToEmulate = storedEmulate || emulate;
    insetsToUse = deviceToEmulate ? (simulatedInsets as any)[deviceToEmulate as keyof typeof simulatedInsets] || actualInsets : actualInsets;
  }

  if (!appIsReady) {
    console.log('AppContent: App not ready yet, showing loading screen');
    return <LoadingScreen />;
  }

  if (fontError) {
    console.error('AppContent: Font loading error:', fontError);
    // Continue with system fonts
  }

  console.log('AppContent: Rendering app with theme:', isDark ? 'dark' : 'light', 'and insets:', insetsToUse);

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
            }}
          />
        </SafeAreaView>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  console.log('RootLayout: Initializing app');
  
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
