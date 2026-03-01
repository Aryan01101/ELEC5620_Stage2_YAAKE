/**
 * Jest Setup File
 * Runs before each test suite
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only';
process.env.JWT_EXPIRE = '1h';
process.env.GEMINI_API_KEY = 'test-api-key';
process.env.RESEND_API_KEY = 'test-resend-key';
process.env.OUTREACH_FROM_EMAIL = 'test@example.com';
process.env.FRONTEND_URL = 'http://localhost:3000';

// Increase timeout for integration tests
jest.setTimeout(30000);

// Silence console.log during tests (optional - comment out to see logs)
global.console = {
  ...console,
  log: jest.fn(), // Mock console.log
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(), // Keep errors visible
};
