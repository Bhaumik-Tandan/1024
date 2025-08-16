// Environment configuration
// This file can be used to set environment variables for different build configurations

const ENV = {
  development: {
    ENV: 'development',
    SENTRY_ENABLED: false,
    SENTRY_DSN: '',
  },
  production: {
    ENV: 'production',
    SENTRY_ENABLED: true,
    SENTRY_DSN: 'https://your-sentry-dsn-here.sentry.io/4509838404812800',
  },
  staging: {
    ENV: 'staging',
    SENTRY_ENABLED: false,
    SENTRY_DSN: '',
  },
};

// Default to development if no environment is specified
const getEnvVars = (env = 'development') => {
  return ENV[env] || ENV.development;
};

module.exports = getEnvVars;
