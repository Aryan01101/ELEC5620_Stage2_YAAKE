const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { validationResult } = require("express-validator");
const UserController = require("./userController");
const { sendVerificationEmail, sendWelcomeEmail } = require("../utils/emailService");

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "24h",
  });
};

// @desc    Register new user (FR1: Email/Password Registration)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

  const { email, password, role, companyName } = req.body;

    // FR4: Check if user already exists (duplicate email handling)
    const existingUser = await UserController.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Create new user (FR3: pending verification status)
  const userRole = role || 'applicant'; // Fixed: changed from 'candidate' to match schema
  const user = await UserController.create(email, password, false, userRole, companyName);
    // FR3: Generate verification token

    console.log('Newly created user:', user);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    await UserController.setVerificationToken(user._id || user.id, verificationToken);

    // FR3: Send verification email (SMTP placeholder)
    const emailResult = await sendVerificationEmail(email, verificationToken);

    // Generate JWT token
    const token = generateToken(user._id || user.id);

    // Convert user to plain object and remove password
    const userObj = user.toObject ? user.toObject() : user;
    delete userObj.password;

    res.status(201).json({
      success: true,
      message: "User registered successfully. Please check your email to verify your account.",
      data: {
        user: userObj,
        token,
        emailSent: emailResult.success,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
      error: error.message,
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await UserController.findByEmail(email);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check password
    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT token
    const token = generateToken(user._id || user.id);

    // Convert user to plain object and remove password
    const userObj = user.toObject ? user.toObject() : user;
    delete userObj.password;

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: userObj,
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
      error: error.message,
    });
  }
};

// @desc    Verify email (FR3: Email Verification)
// @route   GET /api/auth/verify-email/:token
// @access  Public
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Find user by verification token
    const user = await UserController.findByVerificationToken(token);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }

    // Update user verification status
    await UserController.update(user._id || user.id, {
      isVerified: true,
      verificationToken: null,
    });

    // Send welcome email
    await sendWelcomeEmail(user.email);

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during email verification",
      error: error.message,
    });
  }
};

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Public
const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await UserController.findByEmail(email);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if already verified
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    await UserController.setVerificationToken(user._id || user.id, verificationToken);

    // Send verification email
    const emailResult = await sendVerificationEmail(email, verificationToken);

    res.status(200).json({
      success: true,
      message: "Verification email sent successfully",
      emailSent: emailResult.success,
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while resending verification email",
      error: error.message,
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await UserController.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Convert user to plain object and remove password
    const userObj = user.toObject ? user.toObject() : user;
    delete userObj.password;

    res.status(200).json({
      success: true,
      data: {
        user: userObj,
      },
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching user profile",
      error: error.message,
    });
  }
};

// @desc    Logout user (client-side token removal)
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Logout successful. Please remove the token from client storage.",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during logout",
      error: error.message,
    });
  }
};

// @desc    OAuth placeholder endpoints (FR2: OAuth Integration Placeholders)
// @route   GET /api/auth/google
// @access  Public
const googleOAuth = async (req, res) => {
  res.status(501).json({
    success: false,
    message: "Google OAuth integration is not yet implemented. This is a placeholder for future development.",
  });
};

// @desc    OAuth callback placeholder
// @route   GET /api/auth/google/callback
// @access  Public
const googleOAuthCallback = async (req, res) => {
  res.status(501).json({
    success: false,
    message: "Google OAuth callback is not yet implemented. This is a placeholder for future development.",
  });
};

// @desc    GitHub OAuth placeholder
// @route   GET /api/auth/github
// @access  Public
const githubOAuth = async (req, res) => {
  res.status(501).json({
    success: false,
    message: "GitHub OAuth integration is not yet implemented. This is a placeholder for future development.",
  });
};

// @desc    GitHub OAuth callback placeholder
// @route   GET /api/auth/github/callback
// @access  Public
const githubOAuthCallback = async (req, res) => {
  res.status(501).json({
    success: false,
    message: "GitHub OAuth callback is not yet implemented. This is a placeholder for future development.",
  });
};

// ============================================
// GUEST/DEMO ACCOUNT FEATURES
// ============================================

const logger = require('../config/logger');

// @desc    Quick guest registration for networking events/demos
// @route   POST /api/auth/guest-register
// @access  Public
const guestRegister = async (req, res) => {
  try {
    const { name, role } = req.body;

    // Validate role (applicant, recruiter, career_trainer)
    const validRoles = ['applicant', 'recruiter', 'career_trainer'];
    const guestRole = role && validRoles.includes(role) ? role : 'applicant';

    // Generate unique guest email based on timestamp and random string
    const timestamp = Date.now();
    const randomStr = crypto.randomBytes(4).toString('hex');
    const guestEmail = `guest-${timestamp}-${randomStr}@demo.yaake.com`;

    // Use simple password for guests
    const guestPassword = 'Guest2024!';

    // Create guest user with special settings
    const guestName = name || `Demo ${guestRole.charAt(0).toUpperCase() + guestRole.slice(1)}`;
    const companyName = guestRole === 'recruiter' ? 'Demo Company' : undefined;

    // Create user
    const user = await UserController.create(
      guestEmail,
      guestPassword,
      true, // isVerified = true (skip email verification)
      guestRole,
      companyName
    );

    // Update user to mark as guest
    await UserController.update(user._id || user.id, {
      isGuest: true,
      name: guestName,
      guestMetadata: {
        createdAt: new Date(),
        originalRole: guestRole,
        roleSwitchCount: 0,
        upgradedAt: null,
      },
    });

    // Generate JWT token
    const token = generateToken(user._id || user.id);

    // Get updated user
    const updatedUser = await UserController.findById(user._id || user.id);
    const userObj = updatedUser.toObject ? updatedUser.toObject() : updatedUser;
    delete userObj.password;

    // Log guest creation for analytics
    logger.info('Guest account created', {
      guestId: user._id || user.id,
      role: guestRole,
      name: guestName,
    });

    res.status(201).json({
      success: true,
      message: "Guest account created successfully! You're now in demo mode.",
      data: {
        user: userObj,
        token,
        credentials: {
          email: guestEmail,
          password: guestPassword,
        },
        isGuest: true,
      },
    });
  } catch (error) {
    logger.error('Guest registration error:', error);
    res.status(500).json({
      success: false,
      message: "Server error during guest registration",
      error: error.message,
    });
  }
};

// @desc    Switch role (guest accounts only)
// @route   POST /api/auth/switch-role
// @access  Private (Guest only)
const switchRole = async (req, res) => {
  try {
    const { newRole } = req.body;

    // Check if user is a guest
    if (!req.user.isGuest) {
      return res.status(403).json({
        success: false,
        message: "Role switching is only available for guest accounts",
      });
    }

    // Validate new role
    const validRoles = ['applicant', 'recruiter', 'career_trainer'];
    if (!newRole || !validRoles.includes(newRole)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Must be one of: applicant, recruiter, career_trainer",
      });
    }

    // Update role and increment switch count
    const currentSwitchCount = req.user.guestMetadata?.roleSwitchCount || 0;
    const updates = {
      role: newRole,
      'guestMetadata.roleSwitchCount': currentSwitchCount + 1,
    };

    // Add company name for recruiters
    if (newRole === 'recruiter' && !req.user.companyName) {
      updates.companyName = 'Demo Company';
    }

    await UserController.update(req.user.id, updates);

    // Generate new token with updated role
    const newToken = generateToken(req.user.id);

    // Get updated user
    const updatedUser = await UserController.findById(req.user.id);
    const userObj = updatedUser.toObject ? updatedUser.toObject() : updatedUser;
    delete userObj.password;

    // Log role switch for analytics
    logger.info('Guest role switched', {
      guestId: req.user.id,
      oldRole: req.user.role,
      newRole: newRole,
      switchCount: currentSwitchCount + 1,
    });

    res.status(200).json({
      success: true,
      message: `Role switched to ${newRole} successfully`,
      data: {
        user: userObj,
        token: newToken,
      },
    });
  } catch (error) {
    logger.error('Role switch error:', error);
    res.status(500).json({
      success: false,
      message: "Server error during role switch",
      error: error.message,
    });
  }
};

// @desc    Upgrade guest account to full account
// @route   POST /api/auth/upgrade-guest
// @access  Private (Guest only)
const upgradeGuest = async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    // Check if user is a guest
    if (!req.user.isGuest) {
      return res.status(403).json({
        success: false,
        message: "This endpoint is only for guest accounts",
      });
    }

    // Validate input
    if (!email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, password, and confirmPassword are required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Check if email already exists (different from current guest email)
    if (email.toLowerCase() !== req.user.email.toLowerCase()) {
      const existingUser = await UserController.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already registered",
        });
      }
    }

    // Hash new password
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Update user to full account
    const updates = {
      email: email.toLowerCase(),
      password: hashedPassword,
      isGuest: false,
      isVerified: false,
      verificationToken: verificationToken,
      'guestMetadata.upgradedAt': new Date(),
    };

    await UserController.update(req.user.id, updates);

    // Send verification email
    const emailResult = await sendVerificationEmail(email, verificationToken);

    // Get updated user
    const updatedUser = await UserController.findById(req.user.id);
    const userObj = updatedUser.toObject ? updatedUser.toObject() : updatedUser;
    delete userObj.password;

    // Generate new token
    const newToken = generateToken(req.user.id);

    // Log upgrade for analytics
    logger.info('Guest account upgraded', {
      userId: req.user.id,
      newEmail: email,
      originalRole: req.user.guestMetadata?.originalRole,
    });

    res.status(200).json({
      success: true,
      message: "Account upgraded successfully! Please check your email to verify your account.",
      data: {
        user: userObj,
        token: newToken,
        emailSent: emailResult.success,
      },
    });
  } catch (error) {
    logger.error('Guest upgrade error:', error);
    res.status(500).json({
      success: false,
      message: "Server error during account upgrade",
      error: error.message,
    });
  }
};

module.exports = {
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
  upgradeGuest,
};
