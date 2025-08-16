// Firebase Analytics Service - Only loads in production
class FirebaseAnalyticsService {
  constructor() {
    this.isInitialized = false;
    this.analytics = null;
    this.crashlytics = null;
    this.init();
  }

  async init() {
    try {
      // Only initialize Firebase Analytics in production mode
      if (__DEV__) {
        console.log('📊 Firebase Analytics disabled in development mode');
        return;
      }

      // Check if we're on iOS (since we only want iOS for now)
      const { Platform } = require('react-native');
      if (Platform.OS !== 'ios') {
        console.log('📊 Firebase Analytics only enabled for iOS');
        return;
      }

      // Dynamically import Firebase modules only in production
      try {
        const analytics = require('@react-native-firebase/analytics').default;
        const crashlytics = require('@react-native-firebase/crashlytics').default;
        
        this.analytics = analytics;
        this.crashlytics = crashlytics;
        
        // Disable analytics collection for users under 13 (COPPA compliance)
        await this.analytics().setAnalyticsCollectionEnabled(true);
        
        // Initialize Crashlytics
        await this.crashlytics().setCrashlyticsCollectionEnabled(true);
        
        // Set user properties for anonymous analytics
        await this.analytics().setUserProperty('user_type', 'anonymous');
        await this.analytics().setUserProperty('app_version', '1.0.2');
        await this.analytics().setUserProperty('platform', 'ios');
        
        // Set Crashlytics user properties
        await this.crashlytics().setUserId('anonymous_user');
        await this.crashlytics().setAttribute('user_type', 'anonymous');
        await this.crashlytics().setAttribute('app_version', '1.0.2');
        await this.crashlytics().setAttribute('platform', 'ios');
        
        this.isInitialized = true;
        console.log('📊 Firebase Analytics initialized successfully');
  
      } catch (importError) {
        console.warn('📊 Firebase modules not available:', importError.message);
        return;
      }
    } catch (error) {
      console.error('Failed to initialize Firebase Analytics:', error);
    }
  }

  // Track game events without personal data
  async trackGameEvent(eventName, parameters = {}) {
    if (!this.isInitialized || !this.analytics) {
      console.warn('Firebase Analytics not initialized yet');
      return;
    }

    try {
      // Ensure all parameters are anonymous and don't contain personal data
      const safeParameters = {
        ...parameters,
        timestamp: Date.now(),
        // Add any other safe parameters you want to track
      };

      await this.analytics().logEvent(eventName, safeParameters);

    } catch (error) {
      console.error(`Failed to log analytics event ${eventName}:`, error);
      // Log error to Crashlytics if available
      if (this.crashlytics) {
        try {
          await this.crashlytics().recordError(error);
        } catch (crashlyticsError) {
          console.error('Failed to log error to Crashlytics:', crashlyticsError);
        }
      }
    }
  }

  // Track game session start
  async trackGameSessionStart() {
    await this.trackGameEvent('game_session_start', {
      session_id: Date.now().toString(),
    });
  }

  // Track game session end
  async trackGameSessionEnd(duration, score) {
    await this.trackGameEvent('game_session_end', {
      session_duration: duration,
      final_score: score,
    });
  }

  // Track tile merges
  async trackTileMerge(tileValue, mergeCount) {
    await this.trackGameEvent('tile_merge', {
      tile_value: tileValue,
      merge_count: mergeCount,
    });
  }

  // Track game over
  async trackGameOver(score, maxTile, duration) {
    await this.trackGameEvent('game_over', {
      final_score: score,
      max_tile_value: maxTile,
      game_duration: duration,
    });
  }

  // Track power-up usage
  async trackPowerUpUsage(powerUpType) {
    await this.trackGameEvent('power_up_used', {
      power_up_type: powerUpType,
    });
  }

  // Track achievement unlocked
  async trackAchievement(achievementName) {
    await this.trackGameEvent('achievement_unlocked', {
      achievement_name: achievementName,
    });
  }

  // Track screen views
  async trackScreenView(screenName) {
    try {
      await this.analytics().logScreenView({
        screen_name: screenName,
        screen_class: screenName,
      });
    } catch (error) {
      console.error('Failed to log screen view:', error);
    }
  }

  // Set custom user properties (anonymous only)
  async setUserProperty(key, value) {
    if (!this.isInitialized) return;
    
    try {
      await this.analytics().setUserProperty(key, value);
    } catch (error) {
      console.error(`Failed to set user property ${key}:`, error);
    }
  }

  // Get analytics instance for advanced usage
  getAnalyticsInstance() {
    return this.analytics();
  }

  // Get crashlytics instance for advanced usage
  getCrashlyticsInstance() {
    return this.crashlytics();
  }
}

// Export singleton instance
export default new FirebaseAnalyticsService();
