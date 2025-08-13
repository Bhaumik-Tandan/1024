const {
  getSentryExpoConfig
} = require("@sentry/react-native/metro");

const config = getSentryExpoConfig(__dirname);

// Add web to the platforms
config.resolver.platforms = ['web', 'ios', 'android', 'ts', 'tsx', 'js', 'jsx'];

module.exports = config;