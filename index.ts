
// Import polyfills first to ensure compatibility
import './utils/polyfills';

// Import URL polyfill for React Native
import 'react-native-url-polyfill/auto';

// Import gesture handler at the top level
import 'react-native-gesture-handler';

// Import and configure react-native-reanimated
// This ensures proper initialization before any components use it
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Reanimated = require('react-native-reanimated');
  
  if (__DEV__) {
    console.log('[index.ts] React Native Reanimated initialized successfully');
  }
} catch (error) {
  console.error('[index.ts] Error initializing React Native Reanimated:', error);
}

// Import expo-router entry point
import 'expo-router/entry';
