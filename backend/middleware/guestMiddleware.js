const rateLimit = require('express-rate-limit');
const logger = require('../config/logger');

/**
 * Rate limiter for guest registration endpoint
 * More restrictive than general API rate limiting to prevent abuse
 */
const guestRegisterLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 guest registrations per 15 minutes
  message: {
    success: false,
    message: 'Too many guest accounts created from this IP. Please try again in 15 minutes.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    logger.warn('Guest registration rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
    res.status(429).json({
      success: false,
      message: 'Too many guest accounts created from this IP. Please try again in 15 minutes.',
      code: 'RATE_LIMIT_EXCEEDED'
    });
  }
});

/**
 * Middleware to ensure user is a guest account
 * Use this for routes that should only be accessible to guest users
 */
const requireGuest = (req, res, next) => {
  // Check if user is authenticated (protect middleware should run first)
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      code: 'AUTH_REQUIRED'
    });
  }

  // Check if user is a guest
  if (!req.user.isGuest) {
    logger.warn('Non-guest user attempted to access guest-only endpoint', {
      userId: req.user.id,
      email: req.user.email,
      endpoint: req.originalUrl
    });
    return res.status(403).json({
      success: false,
      message: 'This feature is only available for guest accounts',
      code: 'GUEST_ONLY'
    });
  }

  next();
};

/**
 * Middleware to log guest activity for analytics
 * Non-blocking - logs asynchronously
 */
const logGuestActivity = (action) => {
  return (req, res, next) => {
    if (req.user && req.user.isGuest) {
      // Log asynchronously without blocking the request
      setImmediate(() => {
        logger.info(`Guest activity: ${action}`, {
          guestId: req.user.id,
          email: req.user.email,
          role: req.user.role,
          action,
          ip: req.ip,
          userAgent: req.get('user-agent')
        });
      });
    }
    next();
  };
};

/**
 * Middleware to add guest mode indicator to responses
 * Adds isGuest flag to response data
 */
const addGuestIndicator = (req, res, next) => {
  const originalJson = res.json.bind(res);

  res.json = function(data) {
    if (req.user && req.user.isGuest && data && typeof data === 'object') {
      data.isGuestMode = true;
    }
    return originalJson(data);
  };

  next();
};

module.exports = {
  guestRegisterLimiter,
  requireGuest,
  logGuestActivity,
  addGuestIndicator
};
