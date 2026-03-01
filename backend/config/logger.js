/**
 * Winston Logger Configuration
 * Provides structured logging for development and production environments
 */

const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston about our colors
winston.addColors(colors);

// Determine log level based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'info';
};

// Define log format
const format = winston.format.combine(
  // Add timestamp
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  // Add custom format
  winston.format.printf((info) => {
    const { timestamp, level, message, ...meta } = info;

    // Format metadata
    let metaString = '';
    if (Object.keys(meta).length > 0) {
      // Filter out error stack traces for cleaner logs
      const { stack, ...cleanMeta } = meta;
      if (Object.keys(cleanMeta).length > 0) {
        metaString = ` ${JSON.stringify(cleanMeta)}`;
      }
      // Add stack trace on separate line if present
      if (stack) {
        metaString += `\n${stack}`;
      }
    }

    return `${timestamp} [${level.toUpperCase()}]: ${message}${metaString}`;
  })
);

// Console format with colors for development
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  format
);

// Define transports
const transports = [];

// Console transport (always enabled)
transports.push(
  new winston.transports.Console({
    format: consoleFormat,
  })
);

// File transports (only in production or if LOG_TO_FILE is true)
if (process.env.NODE_ENV === 'production' || process.env.LOG_TO_FILE === 'true') {
  const logsDir = process.env.LOGS_DIR || path.join(__dirname, '../logs');

  // Error logs - separate file for errors only
  transports.push(
    new DailyRotateFile({
      filename: path.join(logsDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '14d', // Keep logs for 14 days
      format: format,
    })
  );

  // Combined logs - all levels
  transports.push(
    new DailyRotateFile({
      filename: path.join(logsDir, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d', // Keep logs for 14 days
      format: format,
    })
  );

  // HTTP request logs
  transports.push(
    new DailyRotateFile({
      filename: path.join(logsDir, 'http-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'http',
      maxSize: '20m',
      maxFiles: '7d', // Keep HTTP logs for 7 days
      format: format,
    })
  );
}

// Create logger instance
const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
  // Don't exit on error
  exitOnError: false,
});

// Create a stream object for Morgan HTTP logging
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

// Helper methods for common logging patterns
logger.logRequest = (req, message) => {
  logger.http(message, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userId: req.user?.id,
  });
};

logger.logError = (error, context = {}) => {
  logger.error(error.message, {
    stack: error.stack,
    ...context,
  });
};

logger.logValidationError = (errors, context = {}) => {
  logger.warn('Validation error', {
    errors: errors,
    ...context,
  });
};

// Override console methods in production
if (process.env.NODE_ENV === 'production' && process.env.REPLACE_CONSOLE !== 'false') {
  console.log = (...args) => logger.info(args.join(' '));
  console.info = (...args) => logger.info(args.join(' '));
  console.warn = (...args) => logger.warn(args.join(' '));
  console.error = (...args) => logger.error(args.join(' '));
  console.debug = (...args) => logger.debug(args.join(' '));
}

module.exports = logger;
