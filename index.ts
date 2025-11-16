
// Import polyfills first to ensure compatibility
import './utils/polyfills';

// Import URL polyfill for React Native
import 'react-native-url-polyfill/auto';

// Import gesture handler at the top level
import 'react-native-gesture-handler';

// Import and configure react-native-reanimated
// This ensures proper initialization before any components use it
import * as Reanimated from 'react-native-reanimated';

if (__DEV__) {
  console.log('[index.ts] React Native Reanimated initialized successfully');
}

// Import expo-router entry point
import 'expo-router/entry';
