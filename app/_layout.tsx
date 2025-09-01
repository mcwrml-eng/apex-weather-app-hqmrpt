
import 'react-native-gesture-handler';
import { Stack, useGlobalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, SafeAreaView } from 'react-native';
import { commonStyles, colors } from '../styles/commonStyles';
import { useEffect, useState } from 'react';
import { setupErrorLogging } from '../utils/errorLogger';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts, Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto';
import { UnitProvider } from '../state/UnitContext';

const STORAGE_KEY = 'emulated_device';

export default function RootLayout() {
  const actualInsets = useSafeAreaInsets();
  const { emulate } = useGlobalSearchParams<{ emulate?: string }>();
  const [storedEmulate, setStoredEmulate] = useState<string | null>(null);
  const [fontsLoaded] = useFonts({ Roboto_400Regular, Roboto_500Medium, Roboto_700Bold });

  useEffect(() => {
    console.log('RootLayout: Setting up error logging');
    setupErrorLogging();

    if (Platform.OS === 'web') {
      if (emulate) {
        localStorage.setItem(STORAGE_KEY, emulate);
        setStoredEmulate(emulate);
      } else {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          setStoredEmulate(stored);
        }
      }
    }
  }, [emulate]);

  let insetsToUse = actualInsets;

  if (Platform.OS === 'web') {
    const simulatedInsets = {
      ios: { top: 47, bottom: 20, left: 0, right: 0 },
      android: { top: 40, bottom: 0, left: 0, right: 0 },
    } as const;

    const deviceToEmulate = storedEmulate || emulate;
    insetsToUse = deviceToEmulate ? (simulatedInsets as any)[deviceToEmulate as keyof typeof simulatedInsets] || actualInsets : actualInsets;
  }

  if (!fontsLoaded) {
    console.log('RootLayout: Fonts not loaded yet');
    return null;
  }

  console.log('RootLayout: Rendering app with insets:', insetsToUse);

  return (
    <SafeAreaProvider>
      <UnitProvider>
        <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
          <SafeAreaView style={[commonStyles.wrapper, {
              paddingTop: insetsToUse.top,
              paddingBottom: insetsToUse.bottom,
              paddingLeft: insetsToUse.left,
              paddingRight: insetsToUse.right,
           }]}>
            <StatusBar style="auto" />
            <Stack
              screenOptions={{
                headerShown: false,
                animation: 'default',
              }}
            />
          </SafeAreaView>
        </GestureHandlerRootView>
      </UnitProvider>
    </SafeAreaProvider>
  );
}
