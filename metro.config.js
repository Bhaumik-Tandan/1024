const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add web to the platforms
config.resolver.platforms = ['web', 'ios', 'android', 'ts', 'tsx', 'js', 'jsx'];

module.exports = config; 