import AsyncStorage from '@react-native-async-storage/async-storage';

const TUTORIAL_STORAGE_KEY = 'tutorial_completed';

/**
 * Check if the user has completed the onboarding tutorial
 */
export const getHasCompletedOnboarding = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(TUTORIAL_STORAGE_KEY);
    return value === 'true';
  } catch (error) {
    // Failed to get tutorial completion status
    return false; // Default to false if storage fails
  }
};

/**
 * Mark the onboarding tutorial as completed
 */
export const setHasCompletedOnboarding = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
  } catch (error) {
    // Failed to save tutorial completion status
  }
};

/**
 * Reset tutorial completion status (for testing)
 */
export const resetTutorialCompletion = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(TUTORIAL_STORAGE_KEY);
  } catch (error) {
    // Failed to reset tutorial completion status
  }
};

/**
 * Clear all tutorial-related storage
 */
export const clearTutorialStorage = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(TUTORIAL_STORAGE_KEY);
  } catch (error) {
    // Failed to clear tutorial storage
  }
};

/**
 * Check if user has existing data (indicating they're updating from old version)
 * Returns true if user has any non-default data
 */
export const hasExistingUserData = async (): Promise<boolean> => {
  try {
    // Check for high score
    const highScore = await AsyncStorage.getItem('game_high_score');
    if (highScore && parseInt(highScore) > 0) {
      return true; // User has played before
    }

    // Check for saved game state
    const savedGame = await AsyncStorage.getItem('game_saved_state');
    if (savedGame) {
      return true; // User has saved games
    }

    // Check for total sessions
    const totalSessions = await AsyncStorage.getItem('game_total_sessions');
    if (totalSessions && parseInt(totalSessions) > 0) {
      return true; // User has played multiple sessions
    }

    // Check for analytics user ID
    const analyticsUserId = await AsyncStorage.getItem('analytics_user_id');
    if (analyticsUserId) {
      return true; // User has analytics data
    }

    // Check for first launch timestamp
    const firstLaunch = await AsyncStorage.getItem('analytics_first_launch');
    if (firstLaunch) {
      return true; // User has been tracked before
    }

    // Check for comprehensive analytics state
    const analyticsState = await AsyncStorage.getItem('comprehensive_analytics_state');
    if (analyticsState) {
      return true; // User has analytics data
    }

    // No existing data found - user is truly new
    return false;
  } catch (error) {
    // If we can't check, assume user is new (safer)
    return false;
  }
};
