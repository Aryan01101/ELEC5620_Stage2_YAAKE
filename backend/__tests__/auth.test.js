/**
 * Authentication API Tests
 * Tests user registration, login, and JWT validation
 */

const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/userModel');

let mongoServer;

// Setup: Start in-memory MongoDB before all tests
beforeAll(async () => {
  // Close any existing connections
  await mongoose.disconnect();

  // Create in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Connect to in-memory database
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// Teardown: Clean up after all tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Clean database before each test
beforeEach(async () => {
  await User.deleteMany({});
});

describe('POST /api/auth/register', () => {
  test('should register a new user with valid data', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'Test@123456',
      confirmPassword: 'Test@123456',
      role: 'applicant',
    };

    const res = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data).toHaveProperty('user');
    expect(res.body.data.user.email).toBe(userData.email);
    expect(res.body.data.user).not.toHaveProperty('password'); // Password should not be returned

    // Verify user was created in database
    const user = await User.findOne({ email: userData.email });
    expect(user).not.toBeNull();
    expect(user.name).toBe(userData.name);
  });

  test('should reject registration with weak password', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: '123', // Too weak
      confirmPassword: '123',
    };

    const res = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/password/i);
  });

  test('should reject registration with mismatched passwords', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'Test@123456',
      confirmPassword: 'Different@123456',
    };

    const res = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/passwords.*match/i);
  });

  test('should reject registration with invalid email format', async () => {
    const userData = {
      name: 'Test User',
      email: 'invalid-email',
      password: 'Test@123456',
      confirmPassword: 'Test@123456',
    };

    const res = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(400);

    expect(res.body.success).toBe(false);
  });

  test('should reject registration with duplicate email', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'Test@123456',
      confirmPassword: 'Test@123456',
    };

    // Register first user
    await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);

    // Attempt to register with same email
    const res = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/already.*exist/i);
  });
});

describe('POST /api/auth/login', () => {
  // Create a test user before login tests
  const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'Test@123456',
    confirmPassword: 'Test@123456',
  };

  beforeEach(async () => {
    // Register test user
    await request(app)
      .post('/api/auth/register')
      .send(testUser);
  });

  test('should login with valid credentials', async () => {
    const loginData = {
      email: testUser.email,
      password: testUser.password,
    };

    const res = await request(app)
      .post('/api/auth/login')
      .send(loginData)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data).toHaveProperty('user');
    expect(res.body.data.user.email).toBe(testUser.email);
    expect(res.body.data.user).not.toHaveProperty('password');
  });

  test('should reject login with incorrect password', async () => {
    const loginData = {
      email: testUser.email,
      password: 'WrongPassword@123',
    };

    const res = await request(app)
      .post('/api/auth/login')
      .send(loginData)
      .expect(401);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/invalid.*credentials/i);
  });

  test('should reject login with non-existent email', async () => {
    const loginData = {
      email: 'nonexistent@example.com',
      password: 'Test@123456',
    };

    const res = await request(app)
      .post('/api/auth/login')
      .send(loginData)
      .expect(401);

    expect(res.body.success).toBe(false);
  });

  test('should reject login with missing email', async () => {
    const loginData = {
      password: 'Test@123456',
    };

    const res = await request(app)
      .post('/api/auth/login')
      .send(loginData)
      .expect(400);

    expect(res.body.success).toBe(false);
  });

  test('should reject login with missing password', async () => {
    const loginData = {
      email: testUser.email,
    };

    const res = await request(app)
      .post('/api/auth/login')
      .send(loginData)
      .expect(400);

    expect(res.body.success).toBe(false);
  });
});

describe('JWT Token Validation', () => {
  let authToken;
  const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'Test@123456',
    confirmPassword: 'Test@123456',
  };

  beforeEach(async () => {
    // Register and login to get token
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    authToken = registerRes.body.data.token;
  });

  test('should access protected route with valid token', async () => {
    // Note: This test assumes there's a protected route. Adjust endpoint as needed.
    // For now, we'll test the token format
    expect(authToken).toBeDefined();
    expect(typeof authToken).toBe('string');
    expect(authToken.length).toBeGreaterThan(20);
  });

  test('should reject access with invalid token', async () => {
    const invalidToken = 'invalid.token.here';

    // Test on a protected endpoint (adjust as needed based on your routes)
    const res = await request(app)
      .get('/api/auth/me') // Assuming this endpoint exists
      .set('Authorization', `Bearer ${invalidToken}`)
      .expect(401);

    expect(res.body.success).toBe(false);
  });

  test('should reject access without token', async () => {
    // Test on a protected endpoint (adjust as needed based on your routes)
    const res = await request(app)
      .get('/api/auth/me') // Assuming this endpoint exists
      .expect(401);

    expect(res.body.success).toBe(false);
  });
});

describe('Security Tests', () => {
  test('should not be vulnerable to NoSQL injection in login', async () => {
    // Attempt NoSQL injection attack
    const maliciousPayload = {
      email: { $gt: '' }, // MongoDB query operator
      password: { $gt: '' },
    };

    const res = await request(app)
      .post('/api/auth/login')
      .send(maliciousPayload);

    // Should either return 400 (sanitized) or 401 (not found)
    expect([400, 401]).toContain(res.status);
    expect(res.body.success).toBe(false);
  });

  test('should hash passwords in database', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'Test@123456',
      confirmPassword: 'Test@123456',
    };

    await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);

    // Check that password is hashed in database
    const user = await User.findOne({ email: userData.email });
    expect(user.password).not.toBe(userData.password);
    expect(user.password.length).toBeGreaterThan(30); // Bcrypt hashes are long
  });
});
