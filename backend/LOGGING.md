# Logging Guide - YAAKE Backend

## Overview

YAAKE uses **Winston** for structured logging with automatic file rotation and different log levels for development and production environments.

---

## Quick Start

### Import the logger

```javascript
const logger = require('./config/logger');
```

### Basic usage

```javascript
// Info level (general information)
logger.info('User logged in successfully', { userId: user.id, email: user.email });

// Warning level (something unexpected but not critical)
logger.warn('API rate limit approaching', { ip: req.ip, requests: 95 });

// Error level (errors that need attention)
logger.error('Payment processing failed', { userId: user.id, error: err.message });

// Debug level (detailed debugging information - only in development)
logger.debug('Processing resume upload', { filename: file.originalname, size: file.size });

// HTTP level (HTTP requests - use Morgan middleware instead)
logger.http('GET /api/users');
```

---

## Log Levels

Winston uses the following log levels (in order of priority):

1. **error** (0) - Errors that need immediate attention
2. **warn** (1) - Warning messages about potential issues
3. **info** (2) - General informational messages
4. **http** (3) - HTTP request logs (handled by Morgan)
5. **debug** (4) - Detailed debugging information

**Environment-based logging:**
- **Development**: Logs all levels (debug and above)
- **Production**: Logs info and above (debug is excluded)

---

## Helper Methods

The logger includes helper methods for common patterns:

### 1. Log Errors with Context

```javascript
try {
  await processPayment(user.id, amount);
} catch (error) {
  logger.logError(error, {
    userId: user.id,
    amount: amount,
    operation: 'payment-processing'
  });
  throw error;
}
```

### 2. Log HTTP Requests

```javascript
app.get('/api/users', (req, res) => {
  logger.logRequest(req, 'Fetching user list');
  // ... handle request
});
```

### 3. Log Validation Errors

```javascript
const errors = validationResult(req);
if (!errors.isEmpty()) {
  logger.logValidationError(errors.array(), {
    endpoint: req.originalUrl,
    method: req.method
  });
  return res.status(400).json({ errors: errors.array() });
}
```

---

## File Logging

### Log Files Location

Logs are written to files in production (or when `LOG_TO_FILE=true`):

```
backend/logs/
├── error-2024-03-02.log      # Error logs only
├── combined-2024-03-02.log   # All log levels
└── http-2024-03-02.log       # HTTP request logs
```

### File Rotation

- **Daily rotation**: New file created each day (format: `YYYY-MM-DD`)
- **Max size**: 20MB per file
- **Retention**:
  - Error logs: 14 days
  - Combined logs: 14 days
  - HTTP logs: 7 days

### Configuration

Set in `.env`:

```env
# Enable file logging (automatically enabled in production)
LOG_TO_FILE=true

# Custom logs directory (optional)
LOGS_DIR=/var/log/yaake

# Replace console.log with logger in production (default: true)
REPLACE_CONSOLE=true
```

---

## HTTP Request Logging

HTTP requests are automatically logged using **Morgan** middleware:

### Development Format (colorized)

```
GET /api/users 200 45ms - 1.2kb
POST /api/auth/login 401 120ms - 234b
```

### Production Format (Apache Combined)

```
::1 - - [02/Mar/2024:10:30:45 +0000] "GET /api/users HTTP/1.1" 200 1234 "-" "Mozilla/5.0..."
```

All HTTP logs are piped through Winston for consistent logging.

---

## Best Practices

### 1. Always Include Context

**Bad:**
```javascript
logger.error('Payment failed');
```

**Good:**
```javascript
logger.error('Payment failed', {
  userId: user.id,
  amount: payment.amount,
  paymentMethod: payment.method,
  errorCode: error.code
});
```

### 2. Use Appropriate Log Levels

```javascript
// ✅ DO: Use appropriate levels
logger.info('User registered', { userId: user.id });          // Info
logger.warn('Database connection slow', { responseTime });    // Warning
logger.error('Database connection failed', { error });        // Error

// ❌ DON'T: Use wrong levels
logger.error('User logged in');  // This is info, not error!
logger.info('Database crashed'); // This is error, not info!
```

### 3. Never Log Sensitive Data

```javascript
// ❌ DON'T: Log sensitive information
logger.info('User login', { password: req.body.password });
logger.debug('Processing payment', { creditCard: card.number });

// ✅ DO: Sanitize or omit sensitive data
logger.info('User login', { email: req.body.email });
logger.debug('Processing payment', { last4: card.number.slice(-4) });
```

### 4. Structure Your Logs

```javascript
// ✅ DO: Use consistent structure
logger.info('Operation completed', {
  operation: 'user-registration',
  userId: user.id,
  duration: Date.now() - startTime,
  success: true
});

// ❌ DON'T: Use unstructured strings
logger.info(`User ${user.id} registered in ${duration}ms successfully`);
```

### 5. Log Performance Metrics

```javascript
const startTime = Date.now();

try {
  const result = await heavyOperation();

  logger.info('Heavy operation completed', {
    operation: 'data-processing',
    duration: Date.now() - startTime,
    recordsProcessed: result.length
  });
} catch (error) {
  logger.error('Heavy operation failed', {
    operation: 'data-processing',
    duration: Date.now() - startTime,
    error: error.message
  });
}
```

---

## Migrating from console.log

### Replace console.log calls

**Before:**
```javascript
console.log('User created:', user.id);
console.error('Error:', error);
console.warn('Warning: Rate limit approaching');
```

**After:**
```javascript
logger.info('User created', { userId: user.id });
logger.error('Error occurred', { error: error.message, stack: error.stack });
logger.warn('Rate limit approaching', { remaining: 5 });
```

### Automatic console override

In production, console methods are automatically redirected to Winston:

```javascript
// In production, these are automatically converted to logger calls
console.log('Hello');    // → logger.info('Hello')
console.error('Error');  // → logger.error('Error')
console.warn('Warning'); // → logger.warn('Warning')
```

Disable this with `REPLACE_CONSOLE=false` in `.env`.

---

## Querying Logs

### Using grep

```bash
# Find all error logs from today
grep "ERROR" backend/logs/error-2024-03-02.log

# Find logs for specific user
grep "userId.*123" backend/logs/combined-2024-03-02.log

# Find slow requests (>1000ms)
grep -E "duration.*[0-9]{4,}" backend/logs/combined-2024-03-02.log
```

### Using JSON tools (for structured logs)

If using JSON format (can be configured in logger.js):

```bash
# Extract all error messages
cat backend/logs/error-2024-03-02.log | jq '.message'

# Find errors from specific user
cat backend/logs/combined-2024-03-02.log | jq 'select(.userId == "123")'
```

---

## Integration with Monitoring Tools

### Sentry

Errors logged with `logger.error()` are automatically sent to Sentry if configured.

### Log Aggregation Services

Winston logs can be sent to external services:

```javascript
// Example: Add Papertrail transport (optional)
const { Papertrail } = require('winston-papertrail');

transports.push(new Papertrail({
  host: 'logs.papertrailapp.com',
  port: 12345
}));
```

Popular services:
- **Papertrail** - Simple log aggregation
- **Datadog** - Full observability platform
- **LogDNA / Mezmo** - Log management
- **ELK Stack** - Self-hosted (Elasticsearch, Logstash, Kibana)

---

## Testing

### Mocking logger in tests

```javascript
// In your test file
jest.mock('./config/logger');
const logger = require('./config/logger');

// Mock specific methods
logger.error = jest.fn();
logger.info = jest.fn();

// Test
it('should log error on failure', async () => {
  await failingOperation();

  expect(logger.error).toHaveBeenCalledWith(
    expect.stringContaining('Operation failed'),
    expect.objectContaining({ userId: '123' })
  );
});
```

### Disabling logs in tests

Logs are automatically mocked in test environment (see `jest.setup.js`).

---

## Troubleshooting

### Logs not appearing in files

Check:
1. `NODE_ENV=production` or `LOG_TO_FILE=true` is set
2. Logs directory exists and is writable
3. Disk space available

### Too many log files

Adjust retention in `config/logger.js`:

```javascript
maxFiles: '7d',  // Keep for 7 days instead of 14
```

### Performance impact

If logging impacts performance:
1. Reduce log level in production (info instead of debug)
2. Disable file logging for high-throughput endpoints
3. Use async transports (already configured)

---

## Environment Variables

```env
# Node environment (affects log level)
NODE_ENV=production

# Force file logging in development
LOG_TO_FILE=true

# Custom logs directory
LOGS_DIR=/var/log/yaake

# Disable console override in production
REPLACE_CONSOLE=false
```

---

## Example: Complete Request Handler

```javascript
const logger = require('./config/logger');

const processPayment = async (req, res) => {
  const startTime = Date.now();
  const { userId, amount } = req.body;

  // Log request
  logger.info('Payment processing started', {
    userId,
    amount,
    method: 'credit-card'
  });

  try {
    // Process payment
    const result = await paymentService.charge(userId, amount);

    // Log success
    logger.info('Payment processed successfully', {
      userId,
      amount,
      transactionId: result.id,
      duration: Date.now() - startTime
    });

    res.json({ success: true, transactionId: result.id });

  } catch (error) {
    // Log error with full context
    logger.logError(error, {
      userId,
      amount,
      operation: 'payment-processing',
      duration: Date.now() - startTime
    });

    res.status(500).json({
      success: false,
      message: 'Payment processing failed'
    });
  }
};
```

---

## Next Steps

1. **Migrate existing console.log calls** to logger
2. **Add context** to all log messages
3. **Set up log aggregation** (Papertrail, Datadog, etc.)
4. **Create alerts** for critical errors
5. **Monitor log volume** and adjust retention as needed

---

**Questions?** Check the Winston documentation: https://github.com/winstonjs/winston
