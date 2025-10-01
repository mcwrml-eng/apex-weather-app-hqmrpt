
import 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform, View, ActivityIndicator } from 'react-native';
import { getCommonStyles, getColors } from '../styles/commonStyles';
import { useEffect } from 'react';
import { setupErrorLogging } from '../utils/errorLogger';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts, Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto';
import { UnitProvider } from '../state/UnitContext';
import { ThemeProvider, useTheme } from '../state/ThemeContext';
import * as SplashScreen from 'expo-splash-screen';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().catch(() => {
  console.log('SplashScreen.preventAutoHideAsync failed');
});

function AppContent() {
  const [fontsLoaded, fontError] = useFonts({ 
    Roboto_400Regular, 
    Roboto_500Medium, 
    Roboto_700Bold 
  });
  const { isDark } = useTheme();
  
  const colors = getColors(isDark);
  const commonStyles = getCommonStyles(isDark);

  useEffect(() => {
    console.log('AppContent: Setting up error logging');
    setupErrorLogging();
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      console.log('AppContent: Fonts loaded or error occurred, hiding splash screen');
      SplashScreen.hideAsync().catch(() => {
        console.log('SplashScreen.hideAsync failed');
      });
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    console.log('AppContent: Fonts not loaded yet, showing loading indicator');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (fontError) {
    console.error('AppContent: Font loading error:', fontError);
  }

  console.log('AppContent: Rendering app with theme:', isDark ? 'dark' : 'light');

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={[commonStyles.wrapper, { flex: 1 }]}>
          <StatusBar style={isDark ? "light" : "dark"} />
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'default',
              contentStyle: {
                backgroundColor: colors.background,
              },
            }}
          />
        </View>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  console.log('RootLayout: Initializing app');
  
  return (
    <ThemeProvider>
      <UnitProvider>
        <AppContent />
      </UnitProvider>
    </ThemeProvider>
  );
}
