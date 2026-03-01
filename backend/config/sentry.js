const Sentry = require('@sentry/node');
const { nodeProfilingIntegration } = require('@sentry/profiling-node');

/**
 * Initialize Sentry for error tracking and performance monitoring
 *
 * To use Sentry:
 * 1. Sign up at https://sentry.io
 * 2. Create a new Node.js project
 * 3. Add SENTRY_DSN to your .env file
 * 4. Optionally set SENTRY_ENVIRONMENT (defaults to NODE_ENV)
 */
function initSentry(app) {
  const sentryDSN = process.env.SENTRY_DSN;

  // Only initialize if Sentry DSN is provided
  if (!sentryDSN) {
    console.warn('⚠️  Sentry DSN not configured. Error tracking disabled.');
    console.warn('   Add SENTRY_DSN to your .env file to enable Sentry');
    return;
  }

  Sentry.init({
    dsn: sentryDSN,
    environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',

    // Performance monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Profiling
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    integrations: [
      // HTTP integration for Express (v10+ API)
      Sentry.httpIntegration({ tracing: true }),
      // Express integration (v10+ API)
      Sentry.expressIntegration({ app }),
      // Profiling
      nodeProfilingIntegration(),
    ],

    // Before sending to Sentry, remove sensitive data
    beforeSend(event, hint) {
      // Remove sensitive headers
      if (event.request?.headers) {
        delete event.request.headers.authorization;
        delete event.request.headers.cookie;
      }

      // Remove passwords from request data
      if (event.request?.data && typeof event.request.data === 'object') {
        const data = { ...event.request.data };
        if (data.password) data.password = '[REDACTED]';
        if (data.confirmPassword) data.confirmPassword = '[REDACTED]';
        event.request.data = data;
      }

      return event;
    },
  });

  console.log('✅ Sentry error tracking initialized');
}

/**
 * Get Sentry request handler middleware
 * Add this BEFORE your routes
 */
function getRequestHandler() {
  if (!process.env.SENTRY_DSN) {
    return (req, res, next) => next();
  }
  return Sentry.Handlers.requestHandler();
}

/**
 * Get Sentry tracing middleware
 * Add this BEFORE your routes
 */
function getTracingHandler() {
  if (!process.env.SENTRY_DSN) {
    return (req, res, next) => next();
  }
  return Sentry.Handlers.tracingHandler();
}

/**
 * Get Sentry error handler middleware
 * Add this AFTER your routes but BEFORE other error handlers
 */
function getErrorHandler() {
  if (!process.env.SENTRY_DSN) {
    return (err, req, res, next) => next(err);
  }
  return Sentry.Handlers.errorHandler({
    shouldHandleError(error) {
      // Send all errors to Sentry except 404s
      return error.status !== 404;
    },
  });
}

/**
 * Manually capture an exception
 */
function captureException(error, context = {}) {
  if (!process.env.SENTRY_DSN) {
    console.error('Error (Sentry not configured):', error);
    return;
  }

  Sentry.captureException(error, {
    contexts: { custom: context },
  });
}

/**
 * Manually capture a message
 */
function captureMessage(message, level = 'info', context = {}) {
  if (!process.env.SENTRY_DSN) {
    console.log(`Message (Sentry not configured): ${message}`);
    return;
  }

  Sentry.captureMessage(message, {
    level,
    contexts: { custom: context },
  });
}

module.exports = {
  initSentry,
  getRequestHandler,
  getTracingHandler,
  getErrorHandler,
  captureException,
  captureMessage,
  Sentry,
};
