
interface ErrorLog {
  timestamp: Date;
  component: string;
  error: Error | string;
  context?: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userAgent?: string;
  url?: string;
}

class ErrorLogger {
  private logs: ErrorLog[] = [];
  private maxLogs = 100; // Keep only the last 100 errors
  private isEnabled = true;

  constructor() {
    console.log('ErrorLogger: Initialized');
  }

  log(
    component: string,
    error: Error | string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    context?: any
  ) {
    if (!this.isEnabled) return;

    const errorLog: ErrorLog = {
      timestamp: new Date(),
      component,
      error,
      context,
      severity,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location?.href : undefined
    };

    this.logs.push(errorLog);

    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console logging based on severity
    const errorMessage = typeof error === 'string' ? error : error.message;
    const logMessage = `[${component}] ${errorMessage}`;
    
    switch (severity) {
      case 'critical':
        console.error('🚨 CRITICAL:', logMessage, context);
        break;
      case 'high':
        console.error('❌ ERROR:', logMessage, context);
        break;
      case 'medium':
        console.warn('⚠️ WARNING:', logMessage, context);
        break;
      case 'low':
        console.log('ℹ️ INFO:', logMessage, context);
        break;
    }

    // Additional logging for critical errors
    if (severity === 'critical') {
      this.logCriticalError(errorLog);
    }
  }

  private logCriticalError(errorLog: ErrorLog) {
    console.group('🚨 CRITICAL ERROR DETAILS');
    console.error('Component:', errorLog.component);
    console.error('Error:', errorLog.error);
    console.error('Timestamp:', errorLog.timestamp.toISOString());
    console.error('Context:', errorLog.context);
    console.error('User Agent:', errorLog.userAgent);
    console.error('URL:', errorLog.url);
    console.groupEnd();
  }

  getRecentLogs(count = 10): ErrorLog[] {
    return this.logs.slice(-count);
  }

  getLogsByComponent(component: string): ErrorLog[] {
    return this.logs.filter(log => log.component === component);
  }

  getLogsBySeverity(severity: 'low' | 'medium' | 'high' | 'critical'): ErrorLog[] {
    return this.logs.filter(log => log.severity === severity);
  }

  getCriticalErrors(): ErrorLog[] {
    return this.getLogsBySeverity('critical');
  }

  getErrorSummary(): {
    total: number;
    bySeverity: Record<string, number>;
    byComponent: Record<string, number>;
    recentErrors: ErrorLog[];
  } {
    const bySeverity = this.logs.reduce((acc, log) => {
      acc[log.severity] = (acc[log.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byComponent = this.logs.reduce((acc, log) => {
      acc[log.component] = (acc[log.component] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: this.logs.length,
      bySeverity,
      byComponent,
      recentErrors: this.getRecentLogs(5)
    };
  }

  clearLogs() {
    console.log('ErrorLogger: Clearing all logs');
    this.logs = [];
  }

  disable() {
    console.log('ErrorLogger: Disabled');
    this.isEnabled = false;
  }

  enable() {
    console.log('ErrorLogger: Enabled');
    this.isEnabled = true;
  }

  exportLogs(): string {
    return JSON.stringify({
      exportDate: new Date().toISOString(),
      logs: this.logs,
      summary: this.getErrorSummary()
    }, null, 2);
  }

  // Helper methods for common error scenarios
  logNetworkError(component: string, url: string, error: Error | string, context?: any) {
    this.log(component, error, 'high', {
      type: 'network',
      url,
      ...context
    });
  }

  logRenderError(component: string, error: Error | string, props?: any) {
    this.log(component, error, 'high', {
      type: 'render',
      props,
      timestamp: Date.now()
    });
  }

  logAPIError(component: string, endpoint: string, error: Error | string, response?: any) {
    this.log(component, error, 'medium', {
      type: 'api',
      endpoint,
      response,
      timestamp: Date.now()
    });
  }

  logUserInteractionError(component: string, action: string, error: Error | string, context?: any) {
    this.log(component, error, 'low', {
      type: 'user_interaction',
      action,
      ...context
    });
  }

  logPerformanceIssue(component: string, metric: string, value: number, threshold: number) {
    if (value > threshold) {
      this.log(component, `Performance issue: ${metric} (${value}ms > ${threshold}ms)`, 'medium', {
        type: 'performance',
        metric,
        value,
        threshold
      });
    }
  }
}

// Create a singleton instance
const errorLogger = new ErrorLogger();

// Setup function to initialize global error handlers
export const setupErrorLogging = () => {
  console.log('setupErrorLogging: Initializing global error handlers');
  
  // Global error handlers for web
  if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
      errorLogger.log(
        'Global',
        event.error || event.message,
        'critical',
        {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      );
    });

    window.addEventListener('unhandledrejection', (event) => {
      errorLogger.log(
        'Global',
        event.reason,
        'critical',
        {
          type: 'unhandled_promise_rejection'
        }
      );
    });
  }

  // React Native global error handler
  if (typeof global !== 'undefined' && global.ErrorUtils) {
    const originalHandler = global.ErrorUtils.getGlobalHandler();
    
    global.ErrorUtils.setGlobalHandler((error, isFatal) => {
      errorLogger.log(
        'Global',
        error,
        'critical',
        {
          isFatal,
          type: 'react_native_error'
        }
      );
      
      // Call the original handler
      if (originalHandler) {
        originalHandler(error, isFatal);
      }
    });
  }
};

export default errorLogger;

// Helper function for React components
export const withErrorLogging = (component: string) => ({
  logError: (error: Error | string, severity?: 'low' | 'medium' | 'high' | 'critical', context?: any) =>
    errorLogger.log(component, error, severity, context),
  logNetworkError: (url: string, error: Error | string, context?: any) =>
    errorLogger.logNetworkError(component, url, error, context),
  logRenderError: (error: Error | string, props?: any) =>
    errorLogger.logRenderError(component, error, props),
  logAPIError: (endpoint: string, error: Error | string, response?: any) =>
    errorLogger.logAPIError(component, endpoint, error, response),
  logUserInteractionError: (action: string, error: Error | string, context?: any) =>
    errorLogger.logUserInteractionError(component, action, error, context),
  logPerformanceIssue: (metric: string, value: number, threshold: number) =>
    errorLogger.logPerformanceIssue(component, metric, value, threshold)
});
