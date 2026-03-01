const express = require('express');
const { body } = require('express-validator');
const {
  register,
  login,
  verifyEmail,
  resendVerification,
  getMe,
  logout,
  googleOAuth,
  googleOAuthCallback,
  githubOAuth,
  githubOAuthCallback,
  // Guest features
  guestRegister,
  switchRole,
  upgradeGuest
} = require('../controllers/authController');
const { protect, requireVerification } = require('../middleware/authMiddleware');
const { guestRegisterLimiter, requireGuest } = require('../middleware/guestMiddleware');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const resendVerificationValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
];

// Guest registration validation (minimal requirements)
const guestRegisterValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('role')
    .optional()
    .isIn(['applicant', 'recruiter', 'career_trainer'])
    .withMessage('Role must be one of: applicant, recruiter, career_trainer')
];

const switchRoleValidation = [
  body('newRole')
    .notEmpty()
    .withMessage('New role is required')
    .isIn(['applicant', 'recruiter', 'career_trainer'])
    .withMessage('Role must be one of: applicant, recruiter, career_trainer')
];

const upgradeGuestValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match')
];

// Authentication routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerificationValidation, resendVerification);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

// OAuth routes (placeholders - FR2)
router.get('/google', googleOAuth);
router.get('/google/callback', googleOAuthCallback);
router.get('/github', githubOAuth);
router.get('/github/callback', githubOAuthCallback);

// Guest/Demo account routes
router.post('/guest-register', guestRegisterLimiter, guestRegisterValidation, guestRegister);
router.post('/switch-role', protect, requireGuest, switchRoleValidation, switchRole);
router.post('/upgrade-guest', protect, requireGuest, upgradeGuestValidation, upgradeGuest);

module.exports = router;
