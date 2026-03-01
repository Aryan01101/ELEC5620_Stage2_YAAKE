/**
 * Environment Variable Validation
 *
 * Validates that all required environment variables are set before the application starts.
 * This prevents runtime errors due to missing configuration.
 */

// Note: chalk removed - not needed (using emoji symbols for visual distinction)

/**
 * Required environment variables for all environments
 */
const REQUIRED_VARS = [
  'MONGO_URI',
  'JWT_SECRET',
];

/**
 * Required environment variables for production only
 */
const PRODUCTION_REQUIRED_VARS = [
  'SENTRY_DSN', // Error tracking is critical in production
  'FRONTEND_URL', // CORS must be properly configured
];

/**
 * Recommended environment variables (warnings if missing)
 */
const RECOMMENDED_VARS = [
  'GEMINI_API_KEY', // Required for AI features
  'RESEND_API_KEY', // Required for email functionality
  'OUTREACH_FROM_EMAIL', // Required for sending emails
];

/**
 * Validate an individual environment variable
 */
function validateVar(varName, value, isRequired = true) {
  if (!value || value.trim() === '') {
    if (isRequired) {
      console.error(`❌ FATAL: Missing required environment variable: ${varName}`);
      return false;
    } else {
      console.warn(`⚠️  WARNING: Recommended environment variable not set: ${varName}`);
      return true; // Not fatal
    }
  }
  return true;
}

/**
 * Validate JWT secret strength
 */
function validateJWTSecret(secret) {
  if (!secret) return false;

  if (secret.length < 32) {
    console.error(`❌ FATAL: JWT_SECRET is too short (${secret.length} chars). Minimum 32 characters required.`);
    return false;
  }

  if (secret === 'your-super-secret-jwt-key-change-this-in-production') {
    console.error(`❌ FATAL: JWT_SECRET is set to the default example value. Change it to a secure random string!`);
    console.error(`   Generate a secure secret: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`);
    return false;
  }

  return true;
}

/**
 * Validate MongoDB URI format
 */
function validateMongoURI(uri) {
  if (!uri) return false;

  if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
    console.error(`❌ FATAL: MONGO_URI must start with 'mongodb://' or 'mongodb+srv://'`);
    return false;
  }

  return true;
}

/**
 * Main validation function
 */
function validateEnvironment() {
  console.log('\n📋 Validating environment configuration...\n');

  const env = process.env.NODE_ENV || 'development';
  const isProduction = env === 'production';

  let isValid = true;
  let warningsCount = 0;

  // Validate required variables
  console.log('Checking required variables:');
  for (const varName of REQUIRED_VARS) {
    const value = process.env[varName];
    const valid = validateVar(varName, value, true);

    if (valid) {
      console.log(`  ✅ ${varName}`);

      // Additional validation for specific variables
      if (varName === 'JWT_SECRET' && !validateJWTSecret(value)) {
        isValid = false;
      }
      if (varName === 'MONGO_URI' && !validateMongoURI(value)) {
        isValid = false;
      }
    } else {
      isValid = false;
    }
  }

  // Validate production-specific variables
  if (isProduction) {
    console.log('\nChecking production-specific variables:');
    for (const varName of PRODUCTION_REQUIRED_VARS) {
      const value = process.env[varName];
      const valid = validateVar(varName, value, true);

      if (valid) {
        console.log(`  ✅ ${varName}`);
      } else {
        isValid = false;
      }
    }

    // In production, HTTPS should be enabled
    if (process.env.HTTPS_ENABLED !== 'true') {
      console.warn(`⚠️  WARNING: HTTPS_ENABLED is not set to 'true' in production`);
      warningsCount++;
    }
  }

  // Validate recommended variables (non-fatal)
  console.log('\nChecking recommended variables:');
  for (const varName of RECOMMENDED_VARS) {
    const value = process.env[varName];
    const valid = validateVar(varName, value, false);

    if (valid && value) {
      console.log(`  ✅ ${varName}`);
    } else {
      warningsCount++;
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  if (isValid) {
    if (warningsCount > 0) {
      console.log(`✅ Environment validation passed with ${warningsCount} warning(s)`);
      console.log('   The application can start, but some features may not work.');
    } else {
      console.log('✅ Environment validation passed! All checks successful.');
    }
    console.log('='.repeat(50) + '\n');
    return true;
  } else {
    console.error('❌ Environment validation FAILED!');
    console.error('   Please fix the errors above before starting the application.');
    console.error('   See backend/.env.example for configuration examples.');
    console.log('='.repeat(50) + '\n');
    return false;
  }
}

/**
 * Run validation and exit if failed
 */
function validateOrExit() {
  const isValid = validateEnvironment();
  if (!isValid) {
    console.error('Exiting due to configuration errors...\n');
    process.exit(1);
  }
}

module.exports = {
  validateEnvironment,
  validateOrExit,
};
