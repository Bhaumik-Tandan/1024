import { Vibration, Platform } from 'react-native';

/**
 * Haptic feedback utility for game interactions
 */

// Vibration patterns (duration in milliseconds)
const VIBRATION_PATTERNS = {
  light: Platform.OS === 'ios' ? [50] : [0, 50],
  medium: Platform.OS === 'ios' ? [100] : [0, 100],
  heavy: Platform.OS === 'ios' ? [200] : [0, 200],
  success: [0, 50, 100, 50],
  error: [0, 100, 50, 100, 50, 100],
};

/**
 * Vibrate on touch interaction
 */
export const vibrateOnTouch = async () => {
  try {
    if (Platform.OS === 'ios') {
      // iOS uses ImpactFeedbackGenerator for better haptics
      // Fallback to Vibration if not available
      Vibration.vibrate(VIBRATION_PATTERNS.light);
    } else {
      // Android vibration
      Vibration.vibrate(VIBRATION_PATTERNS.light);
    }
  } catch (error) {
    // Vibration error
  }
};

/**
 * Vibrate on successful merge
 */
export const vibrateOnMerge = async () => {
  try {
    Vibration.vibrate(VIBRATION_PATTERNS.success);
  } catch (error) {
    // Merge vibration error
  }
};

/**
 * Vibrate on game over
 */
export const vibrateOnGameOver = async () => {
  try {
    Vibration.vibrate(VIBRATION_PATTERNS.error);
  } catch (error) {
    // Game over vibration error
  }
};

/**
 * Light vibration for UI feedback
 */
export const vibrateLight = async () => {
  try {
    Vibration.vibrate(VIBRATION_PATTERNS.light);
  } catch (error) {
    // Light vibration error
  }
};

/**
 * Medium vibration for important actions
 */
export const vibrateMedium = async () => {
  try {
    Vibration.vibrate(VIBRATION_PATTERNS.medium);
  } catch (error) {
    // Medium vibration error
  }
}; 