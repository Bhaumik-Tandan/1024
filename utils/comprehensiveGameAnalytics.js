import firebaseAnalytics from './firebaseAnalytics';
import gameMetricsAnalytics from './gameMetricsAnalytics';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * COMPREHENSIVE GAME ANALYTICS SERVICE
 * 
 * This service tracks EVERY important event in your game:
 * - Game mechanics (tiles, merges, scores)
 * - Audio events (music, sounds, settings)
 * - Navigation (screen views, user flow)
 * - User behavior (achievements, power-ups)
 * - Performance (crashes, errors, timing)
 * - Monetization (LTV, purchases, ads)
 * - Retention (D1, D7, engagement)
 */

class ComprehensiveGameAnalytics {
  constructor() {
    this.sessionStartTime = null;
    this.sessionId = null;
    this.userId = null;
    this.currentScreen = null;
    this.gameState = {
      currentScore: 0,
      highestTile: 0,
      tilesPlaced: 0,
      mergesPerformed: 0,
      chainReactions: 0,
      powerUpsUsed: 0,
      achievementsUnlocked: 0,
      gameDuration: 0,
      pauseCount: 0,
      resumeCount: 0,
      crashCount: 0,
      errorCount: 0
    };
    
    this.audioState = {
      soundEnabled: true,
      backgroundMusicEnabled: true,
      vibrationEnabled: true,
      soundVolume: 0.7,
      musicVolume: 0.7,
      lastAudioToggle: null,
      audioToggleCount: 0
    };
    
    this.navigationState = {
      screensVisited: [],
      navigationPath: [],
      timeOnEachScreen: {},
      screenStartTimes: {}
    };
    
    this.init();
  }

  async init() {
    try {
      // Initialize base analytics
      await gameMetricsAnalytics.init();
      
      // Load existing state
      await this.loadAnalyticsState();
      
  
    } catch (error) {
      console.error('Failed to initialize Comprehensive Game Analytics:', error);
    }
  }

  // ========================================
  // GAME MECHANICS ANALYTICS
  // ========================================

  // Track tile drop
  async trackTileDrop(tileValue, column, row, success, error = null) {
    try {
      this.gameState.tilesPlaced++;
      
      await firebaseAnalytics.trackGameEvent('tile_drop', {
        tile_value: tileValue,
        column: column,
        row: row,
        success: success,
        error: error,
        tiles_placed_total: this.gameState.tilesPlaced,
        current_score: this.gameState.currentScore,
        highest_tile: this.gameState.highestTile
      });

      if (!success && error) {
        await this.trackError('tile_drop_failed', error);
      }
    } catch (error) {
      console.error('Error tracking tile drop:', error);
    }
  }

  // Track tile merge
  async trackTileMerge(fromValue, toValue, mergeCount, mergeType, chainReaction = false) {
    try {
      this.gameState.mergesPerformed++;
      
      await firebaseAnalytics.trackGameEvent('tile_merge', {
        from_value: fromValue,
        to_value: toValue,
        merge_count: mergeCount,
        merge_type: mergeType, // 'adjacent', 'connected', 'row', 'column'
        chain_reaction: chainReaction,
        merges_performed_total: this.gameState.mergesPerformed,
        current_score: this.gameState.currentScore,
        highest_tile: this.gameState.highestTile
      });

      // Track special merge types
      if (mergeCount >= 4) {
        await firebaseAnalytics.trackGameEvent('large_merge', {
          merge_count: mergeCount,
          new_value: toValue,
          merge_type: mergeType
        });
      }

      if (chainReaction) {
        this.gameState.chainReactions++;
        await firebaseAnalytics.trackGameEvent('chain_reaction', {
          chain_reaction_number: this.gameState.chainReactions,
          merge_count: mergeCount,
          new_value: toValue
        });
      }
    } catch (error) {
      console.error('Error tracking tile merge:', error);
    }
  }

  // Track score changes
  async trackScoreChange(oldScore, newScore, scoreSource, additionalData = {}) {
    try {
      this.gameState.currentScore = newScore;
      
      await firebaseAnalytics.trackGameEvent('score_change', {
        old_score: oldScore,
        new_score: newScore,
        score_difference: newScore - oldScore,
        score_source: scoreSource, // 'merge', 'bonus', 'achievement', 'power_up'
        current_score: newScore,
        highest_score_ever: await this.getHighestScore(),
        ...additionalData
      });

      // Track score milestones
      const milestones = [100, 500, 1000, 5000, 10000, 50000, 100000];
      milestones.forEach(milestone => {
        if (oldScore < milestone && newScore >= milestone) {
          this.trackScoreMilestone(milestone, newScore);
        }
      });
    } catch (error) {
      console.error('Error tracking score change:', error);
    }
  }

  // Track score milestones
  async trackScoreMilestone(milestone, currentScore) {
    try {
      await firebaseAnalytics.trackGameEvent('score_milestone', {
        milestone: milestone,
        current_score: currentScore,
        milestone_type: this.getMilestoneType(milestone)
      });
    } catch (error) {
      console.error('Error tracking score milestone:', error);
    }
  }

  // Track highest tile achievements
  async trackHighestTileAchievement(oldHighest, newHighest) {
    try {
      this.gameState.highestTile = newHighest;
      
      await firebaseAnalytics.trackGameEvent('highest_tile_achievement', {
        old_highest: oldHighest,
        new_highest: newHighest,
        improvement: newHighest - oldHighest,
        current_score: this.gameState.currentScore,
        tiles_placed: this.gameState.tilesPlaced
      });

      // Track special tile milestones
      const tileMilestones = [16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192];
      tileMilestones.forEach(milestone => {
        if (oldHighest < milestone && newHighest >= milestone) {
          this.trackTileMilestone(milestone, newHighest);
        }
      });
    } catch (error) {
      console.error('Error tracking highest tile achievement:', error);
    }
  }

  // Track tile milestones
  async trackTileMilestone(milestone, currentHighest) {
    try {
      const planetName = this.getPlanetName(milestone);
      
      await firebaseAnalytics.trackGameEvent('tile_milestone', {
        milestone: milestone,
        planet_name: planetName,
        current_highest: currentHighest,
        current_score: this.gameState.currentScore
      });
    } catch (error) {
      console.error('Error tracking tile milestone:', error);
    }
  }

  // ========================================
  // AUDIO ANALYTICS
  // ========================================

  // Track audio setting changes
  async trackAudioSettingChange(settingType, oldValue, newValue) {
    try {
      this.audioState[settingType] = newValue;
      this.audioState.lastAudioToggle = Date.now();
      this.audioState.audioToggleCount++;

      await firebaseAnalytics.trackGameEvent('audio_setting_change', {
        setting_type: settingType, // 'sound', 'backgroundMusic', 'vibration', 'soundVolume', 'musicVolume'
        old_value: oldValue,
        new_value: newValue,
        toggle_count: this.audioState.audioToggleCount,
        time_since_last_toggle: this.audioState.lastAudioToggle ? Date.now() - this.audioState.lastAudioToggle : null
      });

      // Track specific audio events
      if (settingType === 'sound') {
        await this.trackSoundToggle(newValue);
      } else if (settingType === 'backgroundMusic') {
        await this.trackBackgroundMusicToggle(newValue);
      } else if (settingType === 'vibration') {
        await this.trackVibrationToggle(newValue);
      }
    } catch (error) {
      console.error('Error tracking audio setting change:', error);
    }
  }

  // Track sound toggle
  async trackSoundToggle(enabled) {
    try {
      await firebaseAnalytics.trackGameEvent('sound_toggle', {
        enabled: enabled,
        current_score: this.gameState.currentScore,
        game_duration: this.gameState.gameDuration
      });
    } catch (error) {
      console.error('Error tracking sound toggle:', error);
    }
  }

  // Track background music toggle
  async trackBackgroundMusicToggle(enabled) {
    try {
      await firebaseAnalytics.trackGameEvent('background_music_toggle', {
        enabled: enabled,
        current_score: this.gameState.currentScore,
        game_duration: this.gameState.gameDuration,
        time_in_session: Date.now() - (this.sessionStartTime || Date.now())
      });
    } catch (error) {
      console.error('Error tracking background music toggle:', error);
    }
  }

  // Track vibration toggle
  async trackVibrationToggle(enabled) {
    try {
      await firebaseAnalytics.trackGameEvent('vibration_toggle', {
        enabled: enabled,
        current_score: this.gameState.currentScore,
        game_duration: this.gameState.gameDuration
      });
    } catch (error) {
      console.error('Error tracking vibration toggle:', error);
    }
  }

  // Track audio playback events
  async trackAudioPlayback(eventType, audioType, success = true, error = null) {
    try {
      await firebaseAnalytics.trackGameEvent('audio_playback', {
        event_type: eventType, // 'play', 'pause', 'resume', 'stop', 'error'
        audio_type: audioType, // 'background_music', 'sound_effect', 'merge_sound', 'drop_sound'
        success: success,
        error: error,
        current_score: this.gameState.currentScore,
        game_duration: this.gameState.gameDuration
      });

      if (!success && error) {
        await this.trackError('audio_playback_failed', error);
      }
    } catch (error) {
      console.error('Error tracking audio playback:', error);
    }
  }

  // ========================================
  // NAVIGATION ANALYTICS
  // ========================================

  // Track screen view
  async trackScreenView(screenName, previousScreen = null) {
    try {
      const now = Date.now();
      
      // End timing for previous screen
      if (this.currentScreen && this.navigationState.screenStartTimes[this.currentScreen]) {
        const timeOnScreen = now - this.navigationState.screenStartTimes[this.currentScreen];
        this.navigationState.timeOnEachScreen[this.currentScreen] = 
          (this.navigationState.timeOnEachScreen[this.currentScreen] || 0) + timeOnScreen;
      }

      // Start timing for new screen
      this.currentScreen = screenName;
      this.navigationState.screenStartTimes[screenName] = now;
      
      // Add to navigation path
      this.navigationState.navigationPath.push({
        screen: screenName,
        timestamp: now,
        previousScreen: previousScreen
      });

      // Track screen view
      await firebaseAnalytics.trackGameEvent('screen_view', {
        screen_name: screenName,
        previous_screen: previousScreen,
        navigation_path_length: this.navigationState.navigationPath.length,
        time_on_previous_screen: previousScreen ? this.navigationState.timeOnEachScreen[previousScreen] || 0 : null
      });

      // Track specific screen events
      if (screenName === 'Drop Number Board') {
        await this.trackGameScreenView();
      } else if (screenName === 'Settings') {
        await this.trackSettingsScreenView();
      } else if (screenName === 'Home') {
        await this.trackHomeScreenView();
      }
    } catch (error) {
      console.error('Error tracking screen view:', error);
    }
  }

  // Track game screen view
  async trackGameScreenView() {
    try {
      await firebaseAnalytics.trackGameEvent('game_screen_view', {
        current_score: this.gameState.currentScore,
        highest_tile: this.gameState.highestTile,
        tiles_placed: this.gameState.tilesPlaced,
        merges_performed: this.gameState.mergesPerformed,
        game_duration: this.gameState.gameDuration
      });
    } catch (error) {
      console.error('Error tracking game screen view:', error);
    }
  }

  // Track settings screen view
  async trackSettingsScreenView() {
    try {
      await firebaseAnalytics.trackGameEvent('settings_screen_view', {
        sound_enabled: this.audioState.soundEnabled,
        background_music_enabled: this.audioState.backgroundMusicEnabled,
        vibration_enabled: this.audioState.vibrationEnabled,
        current_score: this.gameState.currentScore,
        highest_score: await this.getHighestScore()
      });
    } catch (error) {
      console.error('Error tracking settings screen view:', error);
    }
  }

  // Track home screen view
  async trackHomeScreenView() {
    try {
      await firebaseAnalytics.trackGameEvent('home_screen_view', {
        has_saved_game: await this.hasSavedGame(),
        high_score: await this.getHighestScore(),
        highest_tile: this.gameState.highestTile,
        total_sessions: await this.getTotalSessions()
      });
    } catch (error) {
      console.error('Error tracking home screen view:', error);
    }
  }

  // ========================================
  // GAME STATE ANALYTICS
  // ========================================

  // Track game start
  async trackGameStart(difficulty = 'normal', gameMode = 'standard') {
    try {
      await firebaseAnalytics.trackGameEvent('game_start', {
        difficulty: difficulty,
        game_mode: gameMode,
        current_score: this.gameState.currentScore,
        highest_tile: this.gameState.highestTile,
        session_number: await this.getSessionNumber()
      });
    } catch (error) {
      console.error('Error tracking game start:', error);
    }
  }

  // Track game pause
  async trackGamePause() {
    try {
      this.gameState.pauseCount++;
      
      await firebaseAnalytics.trackGameEvent('game_pause', {
        pause_count: this.gameState.pauseCount,
        current_score: this.gameState.currentScore,
        highest_tile: this.gameState.highestTile,
        tiles_placed: this.gameState.tilesPlaced,
        merges_performed: this.gameState.mergesPerformed,
        game_duration: this.gameState.gameDuration,
        time_in_session: Date.now() - (this.sessionStartTime || Date.now())
      });
    } catch (error) {
      console.error('Error tracking game pause:', error);
    }
  }

  // Track game resume
  async trackGameResume() {
    try {
      this.gameState.resumeCount++;
      
      await firebaseAnalytics.trackGameEvent('game_resume', {
        resume_count: this.gameState.resumeCount,
        current_score: this.gameState.currentScore,
        highest_tile: this.gameState.highestTile,
        tiles_placed: this.gameState.tilesPlaced,
        merges_performed: this.gameState.mergesPerformed,
        game_duration: this.gameState.gameDuration,
        time_since_pause: Date.now() - (this.sessionStartTime || Date.now())
      });
    } catch (error) {
      console.error('Error tracking game resume:', error);
    }
  }

  // Track game restart
  async trackGameRestart() {
    try {
      await firebaseAnalytics.trackGameEvent('game_restart', {
        previous_score: this.gameState.currentScore,
        previous_highest_tile: this.gameState.highestTile,
        tiles_placed: this.gameState.tilesPlaced,
        merges_performed: this.gameState.mergesPerformed,
        game_duration: this.gameState.gameDuration,
        pause_count: this.gameState.pauseCount,
        resume_count: this.gameState.resumeCount
      });

      // Reset game state
      this.resetGameState();
    } catch (error) {
      console.error('Error tracking game restart:', error);
    }
  }

  // Track game end
  async trackGameEnd(finalScore, maxTile, gameDuration, endReason = 'normal') {
    try {
      this.gameState.gameDuration = gameDuration;
      
      await firebaseAnalytics.trackGameEvent('game_end', {
        final_score: finalScore,
        max_tile_value: maxTile,
        game_duration: gameDuration,
        end_reason: endReason, // 'normal', 'game_over', 'user_quit', 'crash'
        tiles_placed: this.gameState.tilesPlaced,
        merges_performed: this.gameState.mergesPerformed,
        chain_reactions: this.gameState.chainReactions,
        pause_count: this.gameState.pauseCount,
        resume_count: this.gameState.resumeCount,
        power_ups_used: this.gameState.powerUpsUsed,
        achievements_unlocked: this.gameState.achievementsUnlocked
      });

      // Track game performance metrics
      await this.trackGamePerformance(finalScore, maxTile, gameDuration);
    } catch (error) {
      console.error('Error tracking game end:', error);
    }
  }

  // Track game performance
  async trackGamePerformance(finalScore, maxTile, gameDuration) {
    try {
      const scorePerMinute = finalScore / (gameDuration / 60000);
      const tilesPerMinute = this.gameState.tilesPlaced / (gameDuration / 60000);
      const mergesPerMinute = this.gameState.mergesPerformed / (gameDuration / 60000);

      await firebaseAnalytics.trackGameEvent('game_performance', {
        final_score: finalScore,
        max_tile_value: maxTile,
        game_duration: gameDuration,
        score_per_minute: scorePerMinute,
        tiles_per_minute: tilesPerMinute,
        merges_per_minute: mergesPerMinute,
        efficiency_score: (finalScore / gameDuration) * 1000,
        engagement_score: (this.gameState.tilesPlaced + this.gameState.mergesPerformed) / gameDuration * 1000
      });
    } catch (error) {
      console.error('Error tracking game performance:', error);
    }
  }

  // ========================================
  // POWER-UP & ACHIEVEMENT ANALYTICS
  // ========================================

  // Track power-up usage
  async trackPowerUpUsage(powerUpType, gameState, success = true) {
    try {
      this.gameState.powerUpsUsed++;
      
      await firebaseAnalytics.trackGameEvent('power_up_usage', {
        power_up_type: powerUpType,
        success: success,
        power_ups_used_total: this.gameState.powerUpsUsed,
        score_at_usage: gameState.score || this.gameState.currentScore,
        max_tile_at_usage: gameState.maxTile || this.gameState.highestTile,
        tiles_placed_at_usage: gameState.tilesPlaced || this.gameState.tilesPlaced,
        merges_at_usage: gameState.mergesPerformed || this.gameState.mergesPerformed
      });
    } catch (error) {
      console.error('Error tracking power-up usage:', error);
    }
  }

  // Track achievement unlock
  async trackAchievementUnlock(achievementName, achievementData, gameState) {
    try {
      this.gameState.achievementsUnlocked++;
      
      await firebaseAnalytics.trackGameEvent('achievement_unlocked', {
        achievement_name: achievementName,
        achievement_data: achievementData,
        achievements_unlocked_total: this.gameState.achievementsUnlocked,
        score_at_achievement: gameState.score || this.gameState.currentScore,
        max_tile_at_achievement: gameState.maxTile || this.gameState.highestTile,
        tiles_placed_at_achievement: gameState.tilesPlaced || this.gameState.tilesPlaced,
        merges_at_achievement: gameState.mergesPerformed || this.gameState.mergesPerformed,
        game_duration_at_achievement: gameState.gameDuration || this.gameState.gameDuration
      });
    } catch (error) {
      console.error('Error tracking achievement unlock:', error);
    }
  }

  // ========================================
  // ERROR & CRASH ANALYTICS
  // ========================================

  // Track errors
  async trackError(errorType, errorMessage, additionalData = {}) {
    try {
      this.gameState.errorCount++;
      
      await firebaseAnalytics.trackGameEvent('game_error', {
        error_type: errorType,
        error_message: errorMessage,
        error_count: this.gameState.errorCount,
        current_score: this.gameState.currentScore,
        highest_tile: this.gameState.highestTile,
        game_duration: this.gameState.gameDuration,
        ...additionalData
      });
    } catch (error) {
      console.error('Error tracking error:', error);
    }
  }

  // Track crashes
  async trackCrash(crashType, crashMessage, crashData = {}) {
    try {
      this.gameState.crashCount++;
      
      await firebaseAnalytics.trackGameEvent('game_crash', {
        crash_type: crashType,
        crash_message: crashMessage,
        crash_count: this.gameState.crashCount,
        current_score: this.gameState.currentScore,
        highest_tile: this.gameState.highestTile,
        game_duration: this.gameState.gameDuration,
        session_duration: Date.now() - (this.sessionStartTime || Date.now()),
        ...crashData
      });
    } catch (error) {
      console.error('Error tracking crash:', error);
    }
  }

  // ========================================
  // MONETIZATION ANALYTICS
  // ========================================

  // Track monetization events
  async trackMonetizationEvent(eventType, value = 0, currency = 'USD', additionalData = {}) {
    try {
      await firebaseAnalytics.trackGameEvent('monetization_event', {
        event_type: eventType, // 'purchase', 'ad_watch', 'premium_feature', 'subscription'
        value: value,
        currency: currency,
        current_score: this.gameState.currentScore,
        highest_tile: this.gameState.highestTile,
        game_duration: this.gameState.gameDuration,
        session_duration: Date.now() - (this.sessionStartTime || Date.now()),
        ...additionalData
      });
    } catch (error) {
      console.error('Error tracking monetization event:', error);
    }
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  // Get milestone type
  getMilestoneType(milestone) {
    if (milestone < 1000) return 'beginner';
    if (milestone < 10000) return 'intermediate';
    if (milestone < 100000) return 'advanced';
    return 'expert';
  }

  // Get planet name
  getPlanetName(value) {
    const planets = {
      2: 'Moon',
      4: 'Mercury',
      8: 'Venus',
      16: 'Earth',
      32: 'Mars',
      64: 'Jupiter',
      128: 'Saturn',
      256: 'Uranus',
      512: 'Neptune',
      1024: 'Pluto',
      2048: 'Eris',
      4096: 'Sedna',
      8192: 'Sun'
    };
    return planets[value] || `Cosmic Body (${value})`;
  }

  // Reset game state
  resetGameState() {
    this.gameState = {
      currentScore: 0,
      highestTile: 0,
      tilesPlaced: 0,
      mergesPerformed: 0,
      chainReactions: 0,
      powerUpsUsed: 0,
      achievementsUnlocked: 0,
      gameDuration: 0,
      pauseCount: 0,
      resumeCount: 0,
      crashCount: 0,
      errorCount: 0
    };
  }

  // Load analytics state
  async loadAnalyticsState() {
    try {
      const state = await AsyncStorage.getItem('comprehensive_analytics_state');
      if (state) {
        const parsed = JSON.parse(state);
        this.audioState = { ...this.audioState, ...parsed.audioState };
        this.navigationState = { ...this.navigationState, ...parsed.navigationState };
      }
    } catch (error) {
      console.error('Error loading analytics state:', error);
    }
  }

  // Save analytics state
  async saveAnalyticsState() {
    try {
      const state = {
        audioState: this.audioState,
        navigationState: this.navigationState,
        lastUpdated: Date.now()
      };
      await AsyncStorage.setItem('comprehensive_analytics_state', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving analytics state:', error);
    }
  }

  // Get highest score
  async getHighestScore() {
    try {
      const score = await AsyncStorage.getItem('game_high_score');
      return score ? parseInt(score) : 0;
    } catch (error) {
      return 0;
    }
  }

  // Get total sessions
  async getTotalSessions() {
    try {
      const sessions = await AsyncStorage.getItem('game_total_sessions');
      return sessions ? parseInt(sessions) : 0;
    } catch (error) {
      return 0;
    }
  }

  // Get session number
  async getSessionNumber() {
    try {
      const sessions = await this.getTotalSessions();
      return sessions + 1;
    } catch (error) {
      return 1;
    }
  }

  // Check if has saved game
  async hasSavedGame() {
    try {
      const savedGame = await AsyncStorage.getItem('game_saved_state');
      return !!savedGame;
    } catch (error) {
      return false;
    }
  }

  // Get comprehensive analytics summary
  async getAnalyticsSummary() {
    try {
      const baseSummary = await gameMetricsAnalytics.getMetricsSummary();
      
      return {
        ...baseSummary,
        audioState: this.audioState,
        navigationState: this.navigationState,
        gameState: this.gameState,
        comprehensiveMetrics: {
          totalPowerUpsUsed: this.gameState.powerUpsUsed,
          totalAchievementsUnlocked: this.gameState.achievementsUnlocked,
          totalPauses: this.gameState.pauseCount,
          totalResumes: this.gameState.resumeCount,
          totalErrors: this.gameState.errorCount,
          totalCrashes: this.gameState.crashCount,
          screensVisited: this.navigationState.screensVisited.length,
          navigationPathLength: this.navigationState.navigationPath.length
        }
      };
    } catch (error) {
      console.error('Error getting analytics summary:', error);
      return null;
    }
  }
}

export default new ComprehensiveGameAnalytics();
