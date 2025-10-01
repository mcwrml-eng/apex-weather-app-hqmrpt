
// Polyfills for compatibility with React Native 0.80.0 and React 19

console.log('[Polyfills] Loading polyfills...');

// Ensure Reflect.construct is available and works correctly
if (typeof Reflect === 'undefined' || !Reflect.construct) {
  console.warn('[Polyfills] Reflect.construct not available, adding polyfill');
  
  // @ts-ignore
  global.Reflect = global.Reflect || {};
  
  // @ts-ignore
  if (!global.Reflect.construct) {
    // @ts-ignore
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
        console.error('[Polyfills] Error in Reflect.construct:', error);
        throw error;
      }
    };
  }
}

// Ensure Reflect.apply is available
if (typeof Reflect === 'undefined' || !Reflect.apply) {
  console.warn('[Polyfills] Reflect.apply not available, adding polyfill');
  
  // @ts-ignore
  global.Reflect = global.Reflect || {};
  
  // @ts-ignore
  if (!global.Reflect.apply) {
    // @ts-ignore
    global.Reflect.apply = function(target: any, thisArgument: any, argumentsList: any[]) {
      try {
        return Function.prototype.apply.call(target, thisArgument, argumentsList || []);
      } catch (error) {
        console.error('[Polyfills] Error in Reflect.apply:', error);
        throw error;
      }
    };
  }
}

// Ensure Object.setPrototypeOf is available
if (!Object.setPrototypeOf) {
  console.warn('[Polyfills] Object.setPrototypeOf not available, adding polyfill');
  
  // @ts-ignore
  Object.setPrototypeOf = function(obj: any, proto: any) {
    try {
      // @ts-ignore
      obj.__proto__ = proto;
      return obj;
    } catch (error) {
      console.error('[Polyfills] Error in Object.setPrototypeOf:', error);
      return obj;
    }
  };
}

// Ensure Object.getPrototypeOf is available
if (!Object.getPrototypeOf) {
  console.warn('[Polyfills] Object.getPrototypeOf not available, adding polyfill');
  
  Object.getPrototypeOf = function(obj: any) {
    try {
      // @ts-ignore
      return obj.__proto__ || Object.prototype;
    } catch (error) {
      console.error('[Polyfills] Error in Object.getPrototypeOf:', error);
      return Object.prototype;
    }
  };
}

// Patch Function.prototype.apply to be more robust
const originalApply = Function.prototype.apply;
if (originalApply) {
  Function.prototype.apply = function(thisArg: any, argArray?: any) {
    try {
      // Ensure argArray is an array or undefined
      const args = argArray === null || argArray === undefined ? [] : Array.from(argArray);
      return originalApply.call(this, thisArg, args);
    } catch (error) {
      console.error('[Polyfills] Error in Function.prototype.apply:', error);
      throw error;
    }
  };
}

// Add global error handler to catch any uncaught errors
if (typeof global !== 'undefined') {
  const originalErrorHandler = (global as any).ErrorUtils?.getGlobalHandler?.();
  
  if ((global as any).ErrorUtils && (global as any).ErrorUtils.setGlobalHandler) {
    (global as any).ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
      console.error('[Polyfills] Global error caught:', {
        error: error.toString(),
        stack: error.stack,
        isFatal,
        timestamp: new Date().toISOString(),
      });
      
      // Call original handler if it exists
      if (originalErrorHandler && typeof originalErrorHandler === 'function') {
        try {
          originalErrorHandler(error, isFatal);
        } catch (handlerError) {
          console.error('[Polyfills] Error in original error handler:', handlerError);
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

console.log('[Polyfills] All polyfills loaded successfully');

export {};
