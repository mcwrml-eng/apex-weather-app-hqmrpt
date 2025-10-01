
// Polyfills for compatibility with React Native 0.80.0 and React 19

// Ensure global is defined
if (typeof global === 'undefined') {
  // @ts-expect-error - Define global for web environments
  window.global = window;
}

// Ensure process is defined for web
if (typeof process === 'undefined') {
  // @ts-expect-error - Define process for web environments
  global.process = { env: { NODE_ENV: __DEV__ ? 'development' : 'production' } };
}

// Ensure Reflect.construct is available and works correctly
if (typeof Reflect === 'undefined' || !Reflect.construct) {
  // @ts-expect-error - Polyfill for missing Reflect API
  global.Reflect = global.Reflect || {};
  
  // @ts-expect-error - Polyfill for missing Reflect.construct
  if (!global.Reflect.construct) {
    // @ts-expect-error - Polyfill implementation
    global.Reflect.construct = function(Target: any, args: any[], newTarget?: any) {
      try {
        // Use the new operator with spread args
        const instance = new Target(...(args || []));
        
        // If newTarget is provided and different from Target, set the prototype
        if (newTarget && newTarget !== Target && typeof Object.setPrototypeOf === 'function') {
          Object.setPrototypeOf(instance, newTarget.prototype);
        }
        
        return instance;
      } catch (error) {
        if (__DEV__) {
          console.error('[Polyfills] Error in Reflect.construct:', error);
        }
        throw error;
      }
    };
  }
}

// Ensure Reflect.apply is available
if (typeof Reflect === 'undefined' || !Reflect.apply) {
  // @ts-expect-error - Polyfill for missing Reflect API
  global.Reflect = global.Reflect || {};
  
  // @ts-expect-error - Polyfill for missing Reflect.apply
  if (!global.Reflect.apply) {
    // @ts-expect-error - Polyfill implementation
    global.Reflect.apply = function(target: any, thisArgument: any, argumentsList: any[]) {
      try {
        return Function.prototype.apply.call(target, thisArgument, argumentsList || []);
      } catch (error) {
        if (__DEV__) {
          console.error('[Polyfills] Error in Reflect.apply:', error);
        }
        throw error;
      }
    };
  }
}

// Ensure Object.setPrototypeOf is available
if (!Object.setPrototypeOf) {
  // @ts-expect-error - Polyfill for missing Object.setPrototypeOf
  Object.setPrototypeOf = function(obj: any, proto: any) {
    try {
      // @ts-expect-error - Using __proto__ for polyfill
      obj.__proto__ = proto;
      return obj;
    } catch (error) {
      if (__DEV__) {
        console.error('[Polyfills] Error in Object.setPrototypeOf:', error);
      }
      return obj;
    }
  };
}

// Ensure Object.getPrototypeOf is available
if (!Object.getPrototypeOf) {
  // @ts-expect-error - Polyfill for missing Object.getPrototypeOf
  Object.getPrototypeOf = function(obj: any) {
    try {
      // @ts-expect-error - Using __proto__ for polyfill
      return obj.__proto__ || Object.prototype;
    } catch (error) {
      if (__DEV__) {
        console.error('[Polyfills] Error in Object.getPrototypeOf:', error);
      }
      return Object.prototype;
    }
  };
}

// React 19 compatibility: Ensure Symbol.for is available
if (typeof Symbol !== 'undefined' && typeof Symbol.for === 'function') {
  // Ensure React symbols are properly defined
  const REACT_ELEMENT_TYPE = Symbol.for('react.element');
  const REACT_PORTAL_TYPE = Symbol.for('react.portal');
  const REACT_FRAGMENT_TYPE = Symbol.for('react.fragment');
  
  // Store them on global for React Native compatibility
  if (typeof global !== 'undefined') {
    // @ts-expect-error - Adding React symbols to global
    global.REACT_ELEMENT_TYPE = REACT_ELEMENT_TYPE;
    // @ts-expect-error - Adding React symbols to global
    global.REACT_PORTAL_TYPE = REACT_PORTAL_TYPE;
    // @ts-expect-error - Adding React symbols to global
    global.REACT_FRAGMENT_TYPE = REACT_FRAGMENT_TYPE;
  }
}

// Patch Function.prototype.apply to be more robust
const originalApply = Function.prototype.apply;
if (originalApply) {
  // eslint-disable-next-line no-extend-native
  Function.prototype.apply = function(thisArg: any, argArray?: any) {
    try {
      // Ensure argArray is an array or undefined
      const args = argArray === null || argArray === undefined ? [] : Array.from(argArray);
      return originalApply.call(this, thisArg, args);
    } catch (error) {
      if (__DEV__) {
        console.error('[Polyfills] Error in Function.prototype.apply:', error);
      }
      throw error;
    }
  };
}

// Add global error handler to catch any uncaught errors
if (typeof global !== 'undefined') {
  const originalErrorHandler = (global as any).ErrorUtils?.getGlobalHandler?.();
  
  if ((global as any).ErrorUtils && (global as any).ErrorUtils.setGlobalHandler) {
    (global as any).ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
      if (__DEV__) {
        console.error('[Polyfills] Global error caught:', {
          error: error.toString(),
          stack: error.stack,
          isFatal,
          timestamp: new Date().toISOString(),
        });
      }
      
      // Call original handler if it exists
      if (originalErrorHandler && typeof originalErrorHandler === 'function') {
        try {
          originalErrorHandler(error, isFatal);
        } catch (handlerError) {
          if (__DEV__) {
            console.error('[Polyfills] Error in original error handler:', handlerError);
          }
        }
      }
    });
  }
}

// Patch console methods to catch errors in logging
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = function(...args: any[]) {
  try {
    originalConsoleError.apply(console, args);
  } catch (error) {
    // Fallback to basic logging if console.error fails
    if (typeof console.log === 'function') {
      console.log('[Polyfills] Error in console.error:', error, 'Original args:', args);
    }
  }
};

console.warn = function(...args: any[]) {
  try {
    originalConsoleWarn.apply(console, args);
  } catch (error) {
    // Fallback to basic logging if console.warn fails
    if (typeof console.log === 'function') {
      console.log('[Polyfills] Error in console.warn:', error, 'Original args:', args);
    }
  }
};

// Log polyfills loaded
if (__DEV__) {
  console.log('[Polyfills] Compatibility polyfills loaded for React 19 + React Native 0.80');
}

export {};
