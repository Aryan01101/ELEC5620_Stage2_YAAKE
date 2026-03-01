/**
 * Modern CSRF Protection Middleware
 *
 * Implements CSRF protection using:
 * 1. Double Submit Cookie pattern
 * 2. Custom header validation
 * 3. SameSite cookies
 *
 * This approach is suitable for SPA applications using JWT authentication.
 */

const crypto = require('crypto');
const logger = require('../config/logger');

/**
 * Generate a random CSRF token
 */
function generateCsrfToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * CSRF token generation middleware
 * Sets a CSRF token as a cookie that the frontend can read
 */
const setCsrfToken = (req, res, next) => {
  // Skip if CSRF is disabled
  if (process.env.DISABLE_CSRF === 'true') {
    return next();
  }

  // Check if token already exists in cookie
  let csrfToken = req.cookies?.['XSRF-TOKEN'];

  // Generate new token if doesn't exist
  if (!csrfToken) {
    csrfToken = generateCsrfToken();

    // Set cookie with SameSite protection
    res.cookie('XSRF-TOKEN', csrfToken, {
      httpOnly: false, // Must be false so JavaScript can read it
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'strict', // Prevents CSRF attacks
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    logger.debug('CSRF token generated', { token: csrfToken.substring(0, 8) + '...' });
  }

  next();
};

/**
 * CSRF token validation middleware
 * Validates that the token in the header matches the token in the cookie
 */
const validateCsrfToken = (req, res, next) => {
  // Skip CSRF check if disabled
  if (process.env.DISABLE_CSRF === 'true') {
    return next();
  }

  // Skip CSRF check for safe methods (GET, HEAD, OPTIONS)
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  // Get token from cookie
  const cookieToken = req.cookies?.['XSRF-TOKEN'];

  // Get token from custom header (two possible header names)
  const headerToken = req.headers['x-xsrf-token'] || req.headers['x-csrf-token'];

  // Check if both tokens exist
  if (!cookieToken || !headerToken) {
    logger.warn('CSRF validation failed: Missing token', {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      hasCookie: !!cookieToken,
      hasHeader: !!headerToken,
    });

    return res.status(403).json({
      success: false,
      message: 'CSRF token missing',
      code: 'CSRF_TOKEN_MISSING',
    });
  }

  // Compare tokens using constant-time comparison to prevent timing attacks
  const tokensMatch = crypto.timingSafeEqual(
    Buffer.from(cookieToken),
    Buffer.from(headerToken)
  );

  if (!tokensMatch) {
    logger.warn('CSRF validation failed: Token mismatch', {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
    });

    return res.status(403).json({
      success: false,
      message: 'Invalid CSRF token',
      code: 'CSRF_TOKEN_INVALID',
    });
  }

  // Tokens match - proceed with request
  logger.debug('CSRF token validated successfully', {
    method: req.method,
    url: req.originalUrl,
  });

  next();
};

/**
 * Middleware to set CSRF token on specific routes
 * Use this on public routes where users might start their session (e.g., login page)
 */
const csrfProtection = [setCsrfToken, validateCsrfToken];

module.exports = {
  generateCsrfToken,
  setCsrfToken,
  validateCsrfToken,
  csrfProtection,
};
