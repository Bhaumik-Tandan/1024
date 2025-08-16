import firebaseAnalytics from './firebaseAnalytics';
import AsyncStorage from '@react-native-async-storage/async-storage';

class GameMetricsAnalytics {
  constructor() {
    this.sessionStartTime = null;
    this.sessionId = null;
    this.userId = null;
    this.firstLaunchDate = null;
    this.totalSessions = 0;
    this.totalPlayTime = 0;
    this.totalScore = 0;
    this.crashCount = 0;
    this.init();
  }

  async init() {
    try {
      // Generate or retrieve user ID
      this.userId = await this.getOrCreateUserId();
      
      // Get first launch date
      this.firstLaunchDate = await this.getFirstLaunchDate();
      
      // Get existing metrics
      await this.loadExistingMetrics();
      
      console.log('📊 Game Metrics Analytics initialized');
    } catch (error) {
      console.error('Failed to initialize Game Metrics Analytics:', error);
    }
  }

  // Generate unique user ID for anonymous tracking
  async getOrCreateUserId() {
    try {
      let userId = await AsyncStorage.getItem('analytics_user_id');
      if (!userId) {
        userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await AsyncStorage.setItem('analytics_user_id', userId);
      }
      return userId;
    } catch (error) {
      console.error('Error getting user ID:', error);
      return `user_${Date.now()}`;
    }
  }

  // Track first launch date for retention calculations
  async getFirstLaunchDate() {
    try {
      let firstLaunch = await AsyncStorage.getItem('analytics_first_launch');
      if (!firstLaunch) {
        firstLaunch = new Date().toISOString();
        await AsyncStorage.setItem('analytics_first_launch', firstLaunch);
      }
      return firstLaunch;
    } catch (error) {
      console.error('Error getting first launch date:', error);
      return new Date().toISOString();
    }
  }

  // Load existing metrics from storage
  async loadExistingMetrics() {
    try {
      const metrics = await AsyncStorage.getItem('analytics_metrics');
      if (metrics) {
        const parsed = JSON.parse(metrics);
        this.totalSessions = parsed.totalSessions || 0;
        this.totalPlayTime = parsed.totalPlayTime || 0;
        this.totalScore = parsed.totalScore || 0;
        this.crashCount = parsed.crashCount || 0;
      }
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  }

  // Save metrics to storage
  async saveMetrics() {
    try {
      const metrics = {
        totalSessions: this.totalSessions,
        totalPlayTime: this.totalPlayTime,
        totalScore: this.totalScore,
        crashCount: this.crashCount,
        lastUpdated: new Date().toISOString()
      };
      await AsyncStorage.setItem('analytics_metrics', JSON.stringify(metrics));
    } catch (error) {
      console.error('Error saving metrics:', error);
    }
  }

  // Start a new session
  async startSession() {
    try {
      this.sessionStartTime = Date.now();
      this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      this.totalSessions++;

      // Track session start
      await firebaseAnalytics.trackGameEvent('session_start', {
        session_id: this.sessionId,
        user_id: this.userId,
        session_number: this.totalSessions,
        first_launch_date: this.firstLaunchDate,
        total_previous_sessions: this.totalSessions - 1,
        total_previous_play_time: this.totalPlayTime,
        total_previous_score: this.totalScore
      });

      // Track retention metrics
      await this.trackRetentionMetrics();

      console.log('📊 Session started:', this.sessionId);
    } catch (error) {
      console.error('Error starting session:', error);
    }
  }

  // End current session
  async endSession(finalScore = 0, maxTile = 0, gameDuration = 0) {
    try {
      if (!this.sessionStartTime) return;

      const sessionDuration = Date.now() - this.sessionStartTime;
      const sessionDurationMinutes = sessionDuration / (1000 * 60);
      
      this.totalPlayTime += sessionDuration;
      this.totalScore += finalScore;

      // Track session end
      await firebaseAnalytics.trackGameEvent('session_end', {
        session_id: this.sessionId,
        user_id: this.userId,
        session_duration_ms: sessionDuration,
        session_duration_minutes: sessionDurationMinutes,
        final_score: finalScore,
        max_tile_value: maxTile,
        game_duration: gameDuration,
        total_play_time: this.totalPlayTime,
        total_score: this.totalScore,
        average_session_length: this.totalPlayTime / this.totalSessions
      });

      // Track engagement metrics
      await this.trackEngagementMetrics(sessionDurationMinutes);

      // Save updated metrics
      await this.saveMetrics();

      console.log('📊 Session ended:', this.sessionId, 'Duration:', sessionDurationMinutes.toFixed(2), 'minutes');
    } catch (error) {
      console.error('Error ending session:', error);
    }
  }

  // Track retention metrics (D1, D7)
  async trackRetentionMetrics() {
    try {
      const firstLaunch = new Date(this.firstLaunchDate);
      const now = new Date();
      const daysSinceFirstLaunch = Math.floor((now - firstLaunch) / (1000 * 60 * 60 * 24));

      // Day 1 Retention
      if (daysSinceFirstLaunch === 1) {
        await firebaseAnalytics.trackGameEvent('retention_day_1', {
          user_id: this.userId,
          days_since_first_launch: daysSinceFirstLaunch,
          total_sessions: this.totalSessions
        });
      }

      // Day 7 Retention
      if (daysSinceFirstLaunch === 7) {
        await firebaseAnalytics.trackGameEvent('retention_day_7', {
          user_id: this.userId,
          days_since_first_launch: daysSinceFirstLaunch,
          total_sessions: this.totalSessions,
          total_play_time: this.totalPlayTime
        });
      }

      // Track return user (any day after first)
      if (daysSinceFirstLaunch > 0) {
        await firebaseAnalytics.trackGameEvent('return_user', {
          user_id: this.userId,
          days_since_first_launch: daysSinceFirstLaunch,
          return_visit_number: this.totalSessions - 1
        });
      }

      // Track churn detection - days since last session
      const lastSessionDate = await this.getLastSessionDate();
      if (lastSessionDate) {
        const daysSinceLastSession = Math.floor((now - new Date(lastSessionDate)) / (1000 * 60 * 60 * 24));
        
        // Track churn risk levels
        if (daysSinceLastSession >= 3) {
          await firebaseAnalytics.trackGameEvent('churn_risk_3_days', {
            user_id: this.userId,
            days_since_last_session: daysSinceLastSession,
            churn_risk_level: 'high'
          });
        } else if (daysSinceLastSession >= 1) {
          await firebaseAnalytics.trackGameEvent('churn_risk_1_day', {
            user_id: this.userId,
            days_since_last_session: daysSinceLastSession,
            churn_risk_level: 'medium'
          });
        }

        // Track comeback users (returning after 7+ days inactive)
        if (daysSinceLastSession >= 7) {
          await firebaseAnalytics.trackGameEvent('comeback_user', {
            user_id: this.userId,
            days_since_last_session: daysSinceLastSession,
            comeback_category: this.getComebackCategory(daysSinceLastSession),
            total_sessions: this.totalSessions,
            previous_engagement: await this.getPreviousEngagement()
          });
        }
      }
    } catch (error) {
      console.error('Error tracking retention:', error);
    }
  }

  // Track engagement metrics
  async trackEngagementMetrics(sessionDurationMinutes) {
    try {
      // Track session length categories
      let sessionCategory = 'short';
      if (sessionDurationMinutes >= 5) sessionCategory = 'medium';
      if (sessionDurationMinutes >= 15) sessionCategory = 'long';
      if (sessionDurationMinutes >= 30) sessionCategory = 'extended';

      await firebaseAnalytics.trackGameEvent('session_engagement', {
        user_id: this.userId,
        session_duration_minutes: sessionDurationMinutes,
        session_category: sessionCategory,
        meets_target_5min: sessionDurationMinutes >= 5,
        total_play_time: this.totalPlayTime,
        average_session_length: this.totalPlayTime / this.totalSessions
      });

      // Track if user meets 5-minute target
      if (sessionDurationMinutes >= 5) {
        await firebaseAnalytics.trackGameEvent('target_achieved_5min_session', {
          user_id: this.userId,
          session_duration: sessionDurationMinutes,
          session_id: this.sessionId
        });
      }
    } catch (error) {
      console.error('Error tracking engagement:', error);
    }
  }

  // Track crash or error
  async trackCrash(errorType, errorMessage) {
    try {
      this.crashCount++;
      
      await firebaseAnalytics.trackGameEvent('app_crash', {
        user_id: this.userId,
        session_id: this.sessionId,
        error_type: errorType,
        error_message: errorMessage,
        crash_count: this.crashCount,
        total_sessions: this.totalSessions,
        crash_rate: (this.crashCount / this.totalSessions) * 100
      });

      // Track crash-free sessions
      const crashFreeRate = ((this.totalSessions - this.crashCount) / this.totalSessions) * 100;
      await firebaseAnalytics.trackGameEvent('crash_free_rate', {
        user_id: this.userId,
        crash_free_rate: crashFreeRate,
        total_sessions: this.totalSessions,
        crash_count: this.crashCount,
        meets_target_99: crashFreeRate >= 99
      });

      await this.saveMetrics();
    } catch (error) {
      console.error('Error tracking crash:', error);
    }
  }

  // Track monetization events (for LTV calculation)
  async trackMonetizationEvent(eventType, value = 0, currency = 'USD') {
    try {
      await firebaseAnalytics.trackGameEvent('monetization_event', {
        user_id: this.userId,
        event_type: eventType,
        value: value,
        currency: currency,
        session_id: this.sessionId,
        total_previous_value: await this.getTotalMonetizationValue()
      });
    } catch (error) {
      console.error('Error tracking monetization:', error);
    }
  }

  // Get total monetization value for LTV calculation
  async getTotalMonetizationValue() {
    try {
      const value = await AsyncStorage.getItem('analytics_monetization_value');
      return parseFloat(value) || 0;
    } catch (error) {
      return 0;
    }
  }

  // Track game-specific events
  async trackGameEvent(eventName, parameters = {}) {
    try {
      const enhancedParams = {
        ...parameters,
        user_id: this.userId,
        session_id: this.sessionId,
        session_number: this.totalSessions,
        total_play_time: this.totalPlayTime,
        total_score: this.totalScore
      };

      await firebaseAnalytics.trackGameEvent(eventName, enhancedParams);
    } catch (error) {
      console.error(`Error tracking game event ${eventName}:`, error);
    }
  }

  // Get current metrics summary
  async getMetricsSummary() {
    try {
      const crashFreeRate = ((this.totalSessions - this.crashCount) / this.totalSessions) * 100;
      const averageSessionLength = this.totalPlayTime / this.totalSessions;
      
      return {
        userId: this.userId,
        firstLaunchDate: this.firstLaunchDate,
        totalSessions: this.totalSessions,
        totalPlayTime: this.totalPlayTime,
        totalScore: this.totalScore,
        crashCount: this.crashCount,
        crashFreeRate: crashFreeRate,
        averageSessionLength: averageSessionLength,
        averageSessionLengthMinutes: averageSessionLength / (1000 * 60),
        meetsTargets: {
          d1Retention: this.totalSessions > 1,
          d7Retention: this.totalSessions > 1,
          sessionLength5min: averageSessionLength >= 5 * 60 * 1000,
          crashFree99: crashFreeRate >= 99
        }
      };
    } catch (error) {
      console.error('Error getting metrics summary:', error);
      return null;
    }
  }

  // Reset metrics (for testing)
  async resetMetrics() {
    try {
      this.totalSessions = 0;
      this.totalPlayTime = 0;
      this.totalScore = 0;
      this.crashCount = 0;
      await AsyncStorage.removeItem('analytics_metrics');
      await AsyncStorage.removeItem('analytics_user_id');
      await AsyncStorage.removeItem('analytics_first_launch');
      console.log('📊 Metrics reset');
    } catch (error) {
      console.error('Error resetting metrics:', error);
    }
  }
}

export default new GameMetricsAnalytics();
