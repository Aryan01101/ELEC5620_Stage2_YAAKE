import { getAPIBaseURL } from '../services/api';

/**
 * Health Check Utility
 * Verifies API connectivity on app load to catch configuration issues early
 */

/**
 * Check if the backend API is reachable
 * @returns {Promise<{success: boolean, url: string, message: string, latency?: number}>}
 */
export const checkAPIConnection = async () => {
  const apiURL = getAPIBaseURL();
  const healthEndpoint = apiURL.replace('/api', '/api/health');

  const startTime = performance.now();

  try {
    const response = await fetch(healthEndpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Don't send credentials for health check
      credentials: 'omit',
      // 10 second timeout
      signal: AbortSignal.timeout(10000),
    });

    const endTime = performance.now();
    const latency = Math.round(endTime - startTime);

    if (response.ok) {
      return {
        success: true,
        url: healthEndpoint,
        message: `API is healthy (${latency}ms)`,
        latency,
      };
    } else {
      return {
        success: false,
        url: healthEndpoint,
        message: `API returned status ${response.status}`,
      };
    }
  } catch (error) {
    return {
      success: false,
      url: healthEndpoint,
      message: `Cannot connect to API: ${error.message}`,
      error: error.message,
    };
  }
};

/**
 * Run health check and log results to console
 * Useful for debugging production issues
 */
export const logAPIHealth = async () => {
  console.log('🏥 Running API health check...');
  console.log('📍 API Base URL:', getAPIBaseURL());

  const result = await checkAPIConnection();

  if (result.success) {
    console.log('✅ API Health Check PASSED', result);
  } else {
    console.error('❌ API Health Check FAILED', result);
    console.error(
      '\n🔧 Troubleshooting:\n' +
      '1. Verify REACT_APP_API_BASE_URL is set correctly\n' +
      '2. Check if backend is running and accessible\n' +
      '3. Verify CORS is configured to allow your domain\n' +
      '4. Check browser console for CORS or network errors'
    );
  }

  return result;
};

/**
 * Display health check banner in console on app load
 */
export const displayHealthBanner = async () => {
  console.log(
    '%c YAAKE Health Check ',
    'background: #4CAF50; color: white; padding: 5px 10px; font-weight: bold; font-size: 14px;'
  );

  const result = await logAPIHealth();

  // Show alert in production if API is unreachable
  if (!result.success && process.env.NODE_ENV === 'production') {
    console.warn(
      '⚠️ Production mode detected with failed API connection.\n' +
      'Users may experience errors. Please check your deployment configuration.'
    );
  }

  return result;
};

const healthCheck = {
  checkAPIConnection,
  logAPIHealth,
  displayHealthBanner,
};

export default healthCheck;
