/**
 * ANALYTICS TEST UTILITY
 * 
 * This file helps test and debug your Firebase Analytics implementation
 * Run these tests to verify analytics are working
 */

import firebaseAnalytics from './firebaseAnalytics';
import comprehensiveGameAnalytics from './comprehensiveGameAnalytics';

export const AnalyticsTester = {
  // Test basic Firebase Analytics
  async testFirebaseAnalytics() {
    try {
      // Check health
      const health = await firebaseAnalytics.checkAnalyticsHealth();
      
      if (health.status === 'healthy') {
        // Test basic event
        await firebaseAnalytics.trackGameEvent('test_event', {
          test: true,
          timestamp: Date.now(),
          message: 'Analytics test successful'
        });
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  },

  // Test comprehensive analytics
  async testComprehensiveAnalytics() {
    try {
      // Test screen view
      await comprehensiveGameAnalytics.trackScreenView('TestScreen');
      
      // Test game event
      await comprehensiveGameAnalytics.trackGameEvent('test_game_event', {
        test: true,
        timestamp: Date.now()
      });
      
      return true;
    } catch (error) {
      return false;
    }
  },

  // Test all analytics systems
  async runAllTests() {
    const results = {
      firebase: await this.testFirebaseAnalytics(),
      comprehensive: await this.testComprehensiveAnalytics()
    };
    
    const allPassed = Object.values(results).every(result => result === true);
    
    return results;
  },

  // Manual test events
  async sendTestEvents() {
    try {
      // Test various event types
      await firebaseAnalytics.trackGameEvent('manual_test', {
        test_type: 'manual',
        timestamp: Date.now(),
        random_value: Math.random()
      });
      
      await comprehensiveGameAnalytics.trackGameStart('test', 'manual');
      await comprehensiveGameAnalytics.trackTileMerge(2, 4, 1, 'test');
      await comprehensiveGameAnalytics.trackScoreChange(0, 100, 'test');
      
      return true;
    } catch (error) {
      return false;
    }
  }
};

// Export for global access in development
if (__DEV__) {
  global.AnalyticsTester = AnalyticsTester;
}

export default AnalyticsTester;
