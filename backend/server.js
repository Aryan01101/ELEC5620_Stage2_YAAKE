const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Initialize logger (must be early for console override)
const logger = require('./config/logger');

// Validate environment variables before starting
const { validateOrExit } = require('./config/env.validation');
validateOrExit();

const sentry = require('./config/sentry');
const authRoutes = require('./routes/authRoutes');
const coverLetterRoutes = require('./routes/coverLetterRoutes');
const exportRoutes = require('./routes/exportRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const resumeroutes = require("./routes/resumeRoutes")

const uc7Routes = require('./routes/uc7-mockInterview');
const coursesRoutes = require('./routes/coursesRoutes');
const outreachRoutes = require('./routes/outreachRoutes');
const questionRoutes = require('./routes/questionRoutes');
const jobPostRoutes = require('./routes/jobPostRoutes');
const recommenderRoutes = require('./routes/recommenderRoutes');
const atsRoutes = require('./routes/atsRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const UserController = require('./controllers/userController');
const dbService = require('./services/db.service');
const mongoose = require('mongoose');

// Initialize Express app
const app = express();

// Initialize Sentry (must be before other middleware)
sentry.initSentry(app);

// Sentry request tracking (must be first middleware)
app.use(sentry.getRequestHandler());
app.use(sentry.getTracingHandler());

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  exposedHeaders: ['X-CSRF-Token'] // Allow frontend to read CSRF token header
}));

// Cookie parser middleware (required for CSRF protection)
app.use(cookieParser());

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Trust proxy - needed for Render.com and other reverse proxies
// This allows Express to trust X-Forwarded-* headers for correct client IP detection
app.set('trust proxy', 1);

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Compression middleware for response compression
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6 // Compression level (0-9, 6 is default)
}));

// HTTP request logging with Morgan
const morganFormat = process.env.NODE_ENV === 'production'
  ? 'combined' // Apache combined format for production
  : 'dev';     // Colored dev format for development
app.use(morgan(morganFormat, { stream: logger.stream }));

// Rate limiting (NFR: Performance optimization)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', limiter);

// CSRF Protection (set token on all responses, validate on state-changing requests)
const { setCsrfToken, validateCsrfToken } = require('./middleware/csrfMiddleware');
app.use(setCsrfToken);      // Set CSRF token cookie on all requests
app.use(validateCsrfToken); // Validate CSRF token on POST/PUT/PATCH/DELETE

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cover-letters', coverLetterRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/files', uploadRoutes);
app.use("/api/resume", resumeroutes)
app.use('/api/uc7', uc7Routes);
app.use('/api/courses', coursesRoutes);
app.use('/api/outreach', outreachRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/jobposts', jobPostRoutes);
app.use('/api/ats', atsRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/recommender', recommenderRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const healthCheck = {
    success: true,
    message: 'YAAKE Backend is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      api: 'healthy',
      database: 'unknown',
    },
  };

  // Check database connection
  try {
    if (mongoose.connection.readyState === 1) {
      // Connected
      await mongoose.connection.db.admin().ping();
      healthCheck.services.database = 'healthy';
    } else {
      healthCheck.services.database = 'disconnected';
      healthCheck.success = false;
      healthCheck.message = 'Database is not connected';
    }
  } catch (error) {
    healthCheck.services.database = 'unhealthy';
    healthCheck.success = false;
    healthCheck.message = 'Database health check failed';
    healthCheck.error = error.message;
  }

  const statusCode = healthCheck.success ? 200 : 503;
  res.status(statusCode).json(healthCheck);
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Sentry error handler (must be before other error handlers)
app.use(sentry.getErrorHandler());

// Global error handler
app.use((err, req, res, next) => {
  // Log error with context
  logger.logError(err, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userId: req.user?.id,
    body: req.body,
  });

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
});

// Note: super user is initialized after DB connect via UserController.initializeSuperUser()

// Server configuration
const PORT = process.env.PORT || 5000;
const HTTPS_ENABLED = process.env.HTTPS_ENABLED === 'true';

// Start server
const startServer = () => {
  if (HTTPS_ENABLED) {
    // HTTPS server configuration
    const sslKeyPath = process.env.SSL_KEY_PATH || './config/ssl/key.pem';
    const sslCertPath = process.env.SSL_CERT_PATH || './config/ssl/cert.pem';

    // Check if SSL certificates exist
    if (fs.existsSync(sslKeyPath) && fs.existsSync(sslCertPath)) {
      const httpsOptions = {
        key: fs.readFileSync(sslKeyPath),
        cert: fs.readFileSync(sslCertPath)
      };

      https.createServer(httpsOptions, app).listen(PORT, () => {
        logger.info('===========================================');
        logger.info(`YAAKE Backend Server (HTTPS)`);
        logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
        logger.info(`Server running on https://localhost:${PORT}`);
        logger.info(`Health check: https://localhost:${PORT}/api/health`);
        logger.info('===========================================');
      });
    } else {
      logger.warn('⚠️  SSL certificates not found. Falling back to HTTP.');
      logger.warn(`Expected SSL key at: ${sslKeyPath}`);
      logger.warn(`Expected SSL cert at: ${sslCertPath}`);
      logger.warn('To generate self-signed certificates, run:');
      logger.warn('mkdir -p backend/config/ssl && openssl req -x509 -newkey rsa:4096 -keyout backend/config/ssl/key.pem -out backend/config/ssl/cert.pem -days 365 -nodes');

      // Start HTTP server as fallback
      http.createServer(app).listen(PORT, () => {
        logger.info('===========================================');
        logger.info(`YAAKE Backend Server (HTTP - Fallback)`);
        logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
        logger.info(`Server running on http://localhost:${PORT}`);
        logger.info(`Health check: http://localhost:${PORT}/api/health`);
        logger.info('===========================================');
      });
    }
  } else {
    // HTTP server
    http.createServer(app).listen(PORT, () => {
      logger.info('===========================================');
      logger.info(`YAAKE Backend Server (HTTP)`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`Server running on http://localhost:${PORT}`);
      logger.info(`Health check: http://localhost:${PORT}/api/health`);
      logger.info('===========================================');
    });
  }
};

// Connect to DB then start the server
dbService.connect()
  .then(() => {
    // Initialize super user after DB is ready (controller handles creation)
    UserController.initializeSuperUser()
      .then(() => startServer())
      .catch((err) => {
        logger.error('Failed to initialize super user:', err);
        process.exit(1);
      });
  })
  .catch((err) => {
    logger.error('Failed to connect to MongoDB. Server not started.');
    logger.error(err);
    process.exit(1);
  });
// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

module.exports = app;
