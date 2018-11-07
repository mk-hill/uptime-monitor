/**
 * Create and export configuration variables
 */

// Container for all the environments
const environments = {
  // Default staging env
  staging: {
    httpPort: 3000,
    httpsPort: 3001,
    envName: 'staging',
  },
  production: {
    httpPort: 80,
    httpsPort: 443,
    envName: 'production',
  },
};

// Determine which environment was passed as a CL argument
const currentEnv =
  typeof process.env.NODE_ENV === 'string'
    ? process.env.NODE_ENV.toLowerCase()
    : '';

// Check if environment that was entered is valid key for environments obj above
// default to staging otherwise
const envToExport =
  currentEnv in environments ? environments[currentEnv] : environments.staging;

// Export the module
module.exports = envToExport;
