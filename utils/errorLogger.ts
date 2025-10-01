
// Global error logging for runtime errors

import { Platform } from "react-native";

// Simple debouncing to prevent duplicate errors
const recentErrors: { [key: string]: number } = {};
const ERROR_DEBOUNCE_MS = 5000;

const clearErrorAfterDelay = (errorKey: string) => {
  setTimeout(() => delete recentErrors[errorKey], ERROR_DEBOUNCE_MS);
};

// Function to send errors to parent window (React frontend)
const sendErrorToParent = (level: string, message: string, data: any) => {
  // Only send actual errors, not warnings or info
  if (level !== 'error') {
    return;
  }

  // Create a simple key to identify duplicate errors
  const errorKey = `${level}:${message}`;
  const now = Date.now();

  // Skip if we've seen this exact error recently
  if (recentErrors[errorKey] && (now - recentErrors[errorKey]) < ERROR_DEBOUNCE_MS) {
    return;
  }

  // Mark this error as seen with timestamp
  recentErrors[errorKey] = now;
  clearErrorAfterDelay(errorKey);

  try {
    if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: 'EXPO_ERROR',
        level: level,
        message: message,
        data: data,
        timestamp: new Date().toISOString(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        source: 'expo-template'
      }, '*');
    }
  } catch (error) {
    // Silently fail to avoid infinite error loops
  }
};

// List of known non-critical error patterns to ignore
const isNonCriticalError = (message: string): boolean => {
  const nonCriticalPatterns = [
    'VirtualizedLists should never be nested',
    'Require cycle:',
    'deprecated',
    'peer dependencies',
    'componentWillReceiveProps',
    'componentWillMount',
    'TabLayout:',
    'ThemeProvider',
    'UnitProvider',
    'AppContent',
    'CoverPage',
    'RootLayout',
    'Logs will appear',
    'Component mounted',
    'Rendering',
    'Theme',
    'Loading',
    'Initializing',
    'Error logging',
    'Polyfills',
    'AppDiagnostics',
    'Navigation',
    'Font',
    'Splash',
    'Setting up',
    'setup complete',
    'mounted at',
    'Resolved entry point',
    'Using app as the root',
    '[ErrorLogger]',
    '[AppContent]',
    '[RootLayout]',
    '[CoverPage]',
    '[Polyfills]',
  ];

  return nonCriticalPatterns.some(pattern => message.includes(pattern));
};

// Check if error is actually critical
const isCriticalError = (message: string): boolean => {
  const criticalPatterns = [
    'TypeError:',
    'ReferenceError:',
    'SyntaxError:',
    'RangeError:',
    'Cannot read property',
    'Cannot read properties',
    'is not a function',
    'is not defined',
    'Uncaught',
    'Unhandled',
    'Failed to',
    'Network request failed',
    'Invariant Violation',
  ];

  return criticalPatterns.some(pattern => message.includes(pattern));
};

export const setupErrorLogging = () => {
  // Only log setup in development
  if (__DEV__) {
    console.log('[ErrorLogger] Setting up error logging...');
  }

  // Capture unhandled errors in web environment
  if (typeof window !== 'undefined') {
    // Override window.onerror to catch JavaScript errors
    const originalOnError = window.onerror;
    
    window.onerror = (message, source, lineno, colno, error) => {
      try {
        const errorMessage = String(message);
        
        // Skip non-critical errors
        if (isNonCriticalError(errorMessage)) {
          return false;
        }

        // Only report critical errors
        if (!isCriticalError(errorMessage)) {
          return false;
        }

        const sourceFile = source ? source.split('/').pop() : 'unknown';
        const errorData = {
          message: errorMessage,
          source: `${sourceFile}:${lineno}:${colno}`,
          line: lineno,
          column: colno,
          stack: error?.stack || 'No stack trace',
          timestamp: new Date().toISOString()
        };

        console.error('[ErrorLogger] Critical Runtime Error:', errorData);
        sendErrorToParent('error', 'JavaScript Runtime Error', errorData);
      } catch (loggingError) {
        // Silently fail
      }

      // Call original handler if it exists
      if (originalOnError && typeof originalOnError === 'function') {
        return originalOnError(message, source, lineno, colno, error);
      }

      return false; // Don't prevent default error handling
    };

    // Capture unhandled promise rejections
    if (Platform.OS === 'web') {
      window.addEventListener('unhandledrejection', (event) => {
        try {
          const reason = String(event.reason);
          
          // Skip non-critical errors
          if (isNonCriticalError(reason)) {
            return;
          }

          // Only report critical errors
          if (!isCriticalError(reason)) {
            return;
          }

          const errorData = {
            reason: event.reason,
            promise: String(event.promise),
            timestamp: new Date().toISOString()
          };

          console.error('[ErrorLogger] Unhandled Promise Rejection:', errorData);
          sendErrorToParent('error', 'Unhandled Promise Rejection', errorData);
        } catch (loggingError) {
          // Silently fail
        }
      });
    }
  }

  // Store original console methods
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;

  // Override console.error to capture only critical errors
  console.error = (...args: any[]) => {
    try {
      const message = args.join(' ');
      
      // Skip non-critical errors
      if (isNonCriticalError(message)) {
        originalConsoleError(...args);
        return;
      }

      // Only send critical errors to parent
      if (isCriticalError(message)) {
        const stack = new Error().stack || '';
        sendErrorToParent('error', 'Console Error', message);
      }
      
      // Always log to console
      originalConsoleError(...args);
    } catch (loggingError) {
      // Fallback to original console.error
      originalConsoleError(...args);
    }
  };

  // Override console.warn - but don't send to parent
  console.warn = (...args: any[]) => {
    try {
      // Just log warnings, don't send to parent
      originalConsoleWarn(...args);
    } catch (loggingError) {
      // Fallback to original console.warn
      originalConsoleWarn(...args);
    }
  };

  // Only log completion in development
  if (__DEV__) {
    console.log('[ErrorLogger] Error logging setup complete');
  }
};
