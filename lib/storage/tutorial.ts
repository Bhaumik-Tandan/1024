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
    console.warn('Failed to get tutorial completion status:', error);
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
    console.warn('Failed to save tutorial completion status:', error);
  }
};

/**
 * Reset tutorial completion status (for testing)
 */
export const resetTutorialCompletion = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(TUTORIAL_STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to reset tutorial completion status:', error);
  }
};

/**
 * Clear all tutorial-related storage
 */
export const clearTutorialStorage = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(TUTORIAL_STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear tutorial storage:', error);
  }
};
