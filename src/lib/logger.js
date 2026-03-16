/**
 * Simple Logger for Monitoring Application Health and Errors
 */

const isProduction = import.meta.env.PROD;

export const logger = {
  info: (message, data = {}) => {
    console.info(`[INFO] ${message}`, data);
    // In production, you could send this to an external service like LogRocket or Datadog
  },

  error: (message, error = null, data = {}) => {
    console.error(`[ERROR] ${message}`, {
      error: error?.message || error,
      stack: error?.stack,
      ...data,
    });

    // In production, integrate with Sentry or similar error tracking
    if (isProduction) {
      // Example: Sentry.captureException(error);
      console.warn("Production error logged. Integrate with Sentry for real-time alerts.");
    }
  },

  warn: (message, data = {}) => {
    console.warn(`[WARN] ${message}`, data);
  },

  debug: (message, data = {}) => {
    if (!isProduction) {
      console.log(`[DEBUG] ${message}`, data);
    }
  },
};

export default logger;
