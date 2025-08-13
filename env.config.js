// Environment configuration
// This file can be used to set environment variables for different build configurations

const ENV = {
  development: {
    ENV: 'development',
    SENTRY_ENABLED: false,
  },
  production: {
    ENV: 'production',
    SENTRY_ENABLED: true,
  },
  staging: {
    ENV: 'staging',
    SENTRY_ENABLED: false,
  },
};

// Default to development if no environment is specified
const getEnvVars = (env = 'development') => {
  return ENV[env] || ENV.development;
};

module.exports = getEnvVars;
