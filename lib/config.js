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
    hashingSecret: 'placeholder',
    maxChecks: 5,
    twilio: {
      accountSid: 'ACb32d411ad7fe886aac54c665d25e5c5d',
      authToken: '9455e3eb3109edc12e3d8c92768f7a67',
      fromPhone: '+15005550006',
    },
    templateGlobals: {
      appName: 'Uptime Monitor',
      companyName: 'Not A Real Company, Inc',
      yearCreated: '2018',
      baseUrl: 'http://localhost:3000/',
    },
  },
  testing: {
    httpPort: 4000,
    httpsPort: 4001,
    envName: 'testing',
    hashingSecret: 'placeholder',
    maxChecks: 5,
    twilio: {
      accountSid: 'ACb32d411ad7fe886aac54c665d25e5c5d',
      authToken: '9455e3eb3109edc12e3d8c92768f7a67',
      fromPhone: '+15005550006',
    },
    templateGlobals: {
      appName: 'Uptime Monitor',
      companyName: 'Not A Real Company, Inc',
      yearCreated: '2018',
      baseUrl: 'http://localhost:3000/',
    },
  },
  production: {
    httpPort: 5000, //80
    httpsPort: 5001, //443
    envName: 'production',
    hashingSecret: 'anotherPlaceholder',
    maxChecks: 5,
    twilio: {
      accountSid: '',
      authToken: '',
      fromPhone: '',
    },
    templateGlobals: {
      appName: 'Uptime Monitor',
      companyName: '...',
      yearCreated: '2018',
      baseUrl: '...',
    },
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
