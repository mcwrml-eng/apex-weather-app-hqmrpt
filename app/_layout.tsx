
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

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().catch(() => {
  console.log('SplashScreen.preventAutoHideAsync failed');
});

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
    console.log('[AppContent] Component mounted');
  }, []);

  useEffect(() => {
    async function prepare() {
      try {
        console.log('[AppContent] Preparing app...');
        
        // Wait for fonts to load
        if (fontsLoaded || fontError) {
          console.log('[AppContent] Fonts status - loaded:', fontsLoaded, 'error:', fontError);
          
          // Small delay to ensure everything is ready
          await new Promise(resolve => setTimeout(resolve, 100));
          
          setAppIsReady(true);
          console.log('[AppContent] App is ready');
        }
      } catch (e) {
        console.error('[AppContent] Error preparing app:', e);
        // Continue anyway
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
          console.log('[AppContent] Splash screen hidden');
        } catch (e) {
          console.warn('[AppContent] Error hiding splash screen:', e);
        }
      }
    }

    hideSplash();
  }, [appIsReady]);

  // Show loading screen while app is not ready
  if (!appIsReady) {
    console.log('[AppContent] Waiting for app to be ready...');
    return <LoadingScreen isDark={isDark} />;
  }

  console.log('[AppContent] Rendering app with theme:', isDark ? 'dark' : 'light');

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
              }}
            />
          </ErrorBoundary>
        </View>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  console.log('[RootLayout] Initializing app...');
  
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <UnitProvider>
          <AppContent />
        </UnitProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
