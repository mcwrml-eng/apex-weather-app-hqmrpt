
import { Platform } from 'react-native';

let isSetup = false;

export function setupErrorLogging() {
  if (isSetup) {
    console.log('ErrorLogger: Already setup, skipping');
    return;
  }

  console.log('ErrorLogger: Setting up error logging');

  try {
    // Global error handler
    const originalErrorHandler = ErrorUtils.getGlobalHandler();
    
    ErrorUtils.setGlobalHandler((error, isFatal) => {
      console.error('ErrorLogger: Global error caught:', {
        message: error.message,
        stack: error.stack,
        isFatal,
        platform: Platform.OS,
      });

      // Call original handler
      if (originalErrorHandler) {
        originalErrorHandler(error, isFatal);
      }
    });

    // Console error override
    const originalConsoleError = console.error;
    console.error = (...args) => {
      originalConsoleError.apply(console, args);
      
      // Log to error tracking service if needed
      if (args.length > 0 && args[0] instanceof Error) {
        console.log('ErrorLogger: Console error:', args[0].message);
      }
    };

    // Unhandled promise rejections
    if (typeof global !== 'undefined') {
      const originalPromiseRejection = global.onunhandledrejection;
      
      global.onunhandledrejection = (event: any) => {
        console.error('ErrorLogger: Unhandled promise rejection:', {
          reason: event.reason,
          promise: event.promise,
        });

        if (originalPromiseRejection) {
          originalPromiseRejection(event);
        }
      };
    }

    isSetup = true;
    console.log('ErrorLogger: Setup complete');
  } catch (error) {
    console.error('ErrorLogger: Failed to setup error logging:', error);
  }
}

export function logError(error: Error, context?: string) {
  console.error(`ErrorLogger: ${context || 'Error'}:`, {
    message: error.message,
    stack: error.stack,
    name: error.name,
  });
}

export function logWarning(message: string, data?: any) {
  console.warn('ErrorLogger: Warning:', message, data);
}

export function logInfo(message: string, data?: any) {
  console.log('ErrorLogger: Info:', message, data);
}
