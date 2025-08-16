// Firebase configuration for anonymous analytics
// This file contains the configuration needed for Firebase Analytics
// You'll need to add your actual Firebase project configuration here

const firebaseConfig = {
  // Firebase project configuration for iOS
  apiKey: "AIzaSyCOpzqSgthWhgV2ccjB6Bh4b6OYy7Iv5M4",
  projectId: "game-analytics-e5eff",
  storageBucket: "game-analytics-e5eff.firebasestorage.app",
  messagingSenderId: "803666454811",
  appId: "1:803666454811:ios:6f03cafc482c9e7e408bbe",
  bundleId: "com.space.drop"
};

module.exports = { firebaseConfig };

// Analytics configuration
export const analyticsConfig = {
  // Enable analytics collection by default
  analyticsCollectionEnabled: true,
  
  // Disable personalized ads (for privacy)
  personalizedAdsEnabled: false,
  
  // Enable crashlytics if you want crash reporting
  crashlyticsEnabled: false,
  
  // Performance monitoring
  performanceMonitoringEnabled: false,
};

// Privacy settings for anonymous analytics
export const privacySettings = {
  // Don't collect user identifiers
  collectUserId: false,
  
  // Don't collect device identifiers
  collectDeviceId: false,
  
  // Don't collect location data
  collectLocation: false,
  
  // Only collect anonymous usage data
  dataCollectionLevel: 'anonymous',
};
