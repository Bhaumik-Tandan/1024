import analytics from '@react-native-firebase/analytics';

class FirebaseAnalyticsService {
  constructor() {
    this.isInitialized = false;
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
        console.log('📊 Firebase Analytics only enabled on iOS');
        return;
      }

      // Disable analytics collection for users under 13 (COPPA compliance)
      await analytics().setAnalyticsCollectionEnabled(true);
      
      // Set user properties for anonymous analytics
      await analytics().setUserProperty('user_type', 'anonymous');
      await analytics().setUserProperty('app_version', '1.0.2');
      await analytics().setUserProperty('platform', 'ios');
      
      this.isInitialized = true;
      console.log('📊 Firebase Analytics initialized successfully on iOS');
    } catch (error) {
      console.error('Failed to initialize Firebase Analytics:', error);
    }
  }

  // Track game events without personal data
  async trackGameEvent(eventName, parameters = {}) {
    if (!this.isInitialized) {
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

      await analytics().logEvent(eventName, safeParameters);
      console.log(`Analytics event logged: ${eventName}`, safeParameters);
    } catch (error) {
      console.error(`Failed to log analytics event ${eventName}:`, error);
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
      await analytics().logScreenView({
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
      await analytics().setUserProperty(key, value);
    } catch (error) {
      console.error(`Failed to set user property ${key}:`, error);
    }
  }

  // Get analytics instance for advanced usage
  getAnalyticsInstance() {
    return analytics();
  }
}

// Export singleton instance
export default new FirebaseAnalyticsService();
