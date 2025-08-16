import firebaseAnalytics from './firebaseAnalytics';

// Game Analytics Integration
// This file provides easy-to-use functions for tracking game events
// All data is collected anonymously without user consent popups

export const GameAnalytics = {
  // Track when a new game starts
  trackGameStart: async (difficulty = 'normal') => {
    await firebaseAnalytics.trackGameEvent('game_start', {
      difficulty,
      timestamp: Date.now(),
    });
  },

  // Track when a game ends
  trackGameEnd: async (score, maxTile, duration, difficulty) => {
    await firebaseAnalytics.trackGameEvent('game_end', {
      final_score: score,
      max_tile_value: maxTile,
      game_duration: duration,
      difficulty,
    });
  },

  // Track tile movements
  trackTileMove: async (direction, tileCount) => {
    await firebaseAnalytics.trackGameEvent('tile_move', {
      direction,
      tiles_moved: tileCount,
    });
  },

  // Track tile merges
  trackTileMerge: async (fromValue, toValue, mergeCount) => {
    await firebaseAnalytics.trackGameEvent('tile_merge', {
      from_value: fromValue,
      to_value: toValue,
      merge_count: mergeCount,
    });
  },

  // Track power-up usage
  trackPowerUp: async (powerUpType, gameState) => {
    await firebaseAnalytics.trackGameEvent('power_up_used', {
      power_up_type: powerUpType,
      score_at_usage: gameState.score,
      max_tile_at_usage: gameState.maxTile,
    });
  },

  // Track achievements
  trackAchievement: async (achievementName, gameState) => {
    await firebaseAnalytics.trackGameEvent('achievement_unlocked', {
      achievement_name: achievementName,
      score_at_achievement: gameState.score,
      max_tile_at_achievement: gameState.maxTile,
    });
  },

  // Track game session
  trackSessionStart: async () => {
    await firebaseAnalytics.trackGameSessionStart();
  },

  trackSessionEnd: async (duration, totalScore) => {
    await firebaseAnalytics.trackGameSessionEnd(duration, totalScore);
  },

  // Track screen views
  trackScreenView: async (screenName) => {
    await firebaseAnalytics.trackScreenView(screenName);
  },

  // Track user preferences
  trackPreferenceChange: async (preferenceName, newValue) => {
    await firebaseAnalytics.trackGameEvent('preference_changed', {
      preference_name: preferenceName,
      new_value: newValue,
    });
  },

  // Track sound settings
  trackSoundSetting: async (settingName, enabled) => {
    await firebaseAnalytics.trackGameEvent('sound_setting_changed', {
      setting_name: settingName,
      enabled,
    });
  },

  // Track performance metrics
  trackPerformance: async (metricName, value) => {
    await firebaseAnalytics.trackGameEvent('performance_metric', {
      metric_name: metricName,
      value,
    });
  },

  // Track errors (without personal data)
  trackError: async (errorType, errorMessage, gameState) => {
    await firebaseAnalytics.trackGameEvent('game_error', {
      error_type: errorType,
      error_message: errorMessage,
      score_at_error: gameState?.score || 0,
      max_tile_at_error: gameState?.maxTile || 0,
    });
  },
};

// Usage examples:
// 
// In your game component:
// import { GameAnalytics } from '../utils/gameAnalytics';
//
// // When game starts
// await GameAnalytics.trackGameStart('easy');
//
// // When tile merges
// await GameAnalytics.trackTileMerge(2, 4, 1);
//
// // When game ends
// await GameAnalytics.trackGameEnd(1024, 64, 300000, 'normal');
//
// // When power-up is used
// await GameAnalytics.trackPowerUp('shuffle', { score: 512, maxTile: 32 });
//
// // Track screen views
// await GameAnalytics.trackScreenView('GameScreen');
// await GameAnalytics.trackScreenView('SettingsScreen');

export default GameAnalytics;
