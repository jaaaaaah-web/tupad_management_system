// Logger utility for consistent error handling and logging
// Can be expanded to integrate with services like Sentry in production

/**
 * Log levels:
 * - info: General information
 * - warn: Warning that might need attention
 * - error: Error that needs immediate attention
 * - debug: Debug information (only shown in development)
 */

const isProduction = process.env.NODE_ENV === 'production';

export const logger = {
  info: (message, metadata = {}) => {
    console.log(`[INFO] ${message}`, metadata);
  },
  
  warn: (message, metadata = {}) => {
    console.warn(`[WARNING] ${message}`, metadata);
    
    // In production, you could send warnings to a monitoring service
    if (isProduction) {
      // Example: sendToMonitoringService('warning', message, metadata);
    }
  },
  
  error: (message, error = null, metadata = {}) => {
    console.error(`[ERROR] ${message}`, error?.message || '', metadata);
    
    // In production, you should send errors to a monitoring service like Sentry
    if (isProduction) {
      // Uncomment and configure when you add Sentry or similar service
      // Sentry.captureException(error || new Error(message), {
      //   extra: metadata
      // });
    }
  },
  
  debug: (message, metadata = {}) => {
    // Only log debug messages in development
    if (!isProduction) {
      console.debug(`[DEBUG] ${message}`, metadata);
    }
  }
};

// Helper function to create a formatted error with status code
export const createError = (message, statusCode = 500, metadata = {}) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.metadata = metadata;
  return error;
};

// Middleware to handle API errors consistently
export const errorHandler = (err, res) => {
  const statusCode = err.statusCode || 500;
  logger.error('API Error', err, { path: res.req?.url, statusCode });
  
  return res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};