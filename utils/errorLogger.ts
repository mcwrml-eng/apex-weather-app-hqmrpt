
// Global error logging for runtime errors

import { Platform } from "react-native";

// Simple debouncing to prevent duplicate errors
const recentErrors: { [key: string]: number } = {};
const ERROR_DEBOUNCE_MS = 1000;

const clearErrorAfterDelay = (errorKey: string) => {
  setTimeout(() => delete recentErrors[errorKey], ERROR_DEBOUNCE_MS);
};

// Function to send errors to parent window (React frontend)
const sendErrorToParent = (level: string, message: string, data: any) => {
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
    console.warn('[ErrorLogger] Failed to send error to parent:', error);
  }
};

// Function to extract meaningful source location from stack trace
const extractSourceLocation = (stack: string): string => {
  if (!stack) return '';

  // Look for various patterns in the stack trace
  const patterns = [
    // Pattern for app files: app/filename.tsx:line:column
    /at .+\/(app\/[^:)]+):(\d+):(\d+)/,
    // Pattern for components: components/filename.tsx:line:column
    /at .+\/(components\/[^:)]+):(\d+):(\d+)/,
    // Pattern for any .tsx/.ts files
    /at .+\/([^/]+\.tsx?):(\d+):(\d+)/,
  ];

  for (const pattern of patterns) {
    const match = stack.match(pattern);
    if (match) {
      return ` | Source: ${match[1]}:${match[2]}:${match[3]}`;
    }
  }

  return '';
};

export const setupErrorLogging = () => {
  console.log('[ErrorLogger] Setting up error logging...');

  // Capture unhandled errors in web environment
  if (typeof window !== 'undefined') {
    // Override window.onerror to catch JavaScript errors
    const originalOnError = window.onerror;
    
    window.onerror = (message, source, lineno, colno, error) => {
      try {
        const sourceFile = source ? source.split('/').pop() : 'unknown';
        const errorData = {
          message: String(message),
          source: `${sourceFile}:${lineno}:${colno}`,
          line: lineno,
          column: colno,
          stack: error?.stack || 'No stack trace',
          timestamp: new Date().toISOString()
        };

        console.error('[ErrorLogger] 🚨 RUNTIME ERROR:', errorData);
        sendErrorToParent('error', 'JavaScript Runtime Error', errorData);
      } catch (loggingError) {
        console.warn('[ErrorLogger] Error while logging error:', loggingError);
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
          const errorData = {
            reason: event.reason,
            promise: String(event.promise),
            timestamp: new Date().toISOString()
          };

          console.error('[ErrorLogger] 🚨 UNHANDLED PROMISE REJECTION:', errorData);
          sendErrorToParent('error', 'Unhandled Promise Rejection', errorData);
        } catch (loggingError) {
          console.warn('[ErrorLogger] Error while logging promise rejection:', loggingError);
        }
      });
    }
  }

  // Store original console methods
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;

  // Override console.error to capture more detailed information
  console.error = (...args: any[]) => {
    try {
      const stack = new Error().stack || '';
      const sourceInfo = extractSourceLocation(stack);
      
      // Filter out known non-critical errors
      const message = args.join(' ');
      const isKnownNonCritical = 
        message.includes('VirtualizedLists should never be nested') ||
        message.includes('Require cycle:') ||
        message.includes('deprecated') ||
        message.includes('peer dependencies');

      if (!isKnownNonCritical) {
        // Create enhanced message with source information
        const enhancedMessage = message + sourceInfo;
        
        // Add timestamp and make it stand out in Metro logs
        originalConsoleError('[ErrorLogger] 🔥 ERROR:', new Date().toISOString(), enhancedMessage);
        
        // Also send to parent
        sendErrorToParent('error', 'Console Error', enhancedMessage);
      } else {
        // Just log normally for non-critical errors
        originalConsoleError(...args);
      }
    } catch (loggingError) {
      // Fallback to original console.error
      originalConsoleError(...args);
    }
  };

  // Override console.warn to capture warnings with source location
  console.warn = (...args: any[]) => {
    try {
      const message = args.join(' ');
      
      // Filter out known non-critical warnings
      const isKnownNonCritical = 
        message.includes('componentWillReceiveProps') ||
        message.includes('componentWillMount') ||
        message.includes('deprecated') ||
        message.includes('peer dependencies');

      if (!isKnownNonCritical) {
        const stack = new Error().stack || '';
        const sourceInfo = extractSourceLocation(stack);
        const enhancedMessage = message + sourceInfo;

        originalConsoleWarn('[ErrorLogger] ⚠️ WARNING:', new Date().toISOString(), enhancedMessage);
        sendErrorToParent('warn', 'Console Warning', enhancedMessage);
      } else {
        // Just log normally for non-critical warnings
        originalConsoleWarn(...args);
      }
    } catch (loggingError) {
      // Fallback to original console.warn
      originalConsoleWarn(...args);
    }
  };

  console.log('[ErrorLogger] Error logging setup complete');
};
