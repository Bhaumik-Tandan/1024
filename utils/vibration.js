import { Platform } from 'react-native';
import useGameStore from '../store/gameStore';
import soundManager from './soundManager';

// Only import Vibration on native platforms
let Vibration = null;
if (Platform.OS !== 'web') {
  Vibration = require('react-native').Vibration;
}

// Vibration and sound for final merge or single merge
export const vibrateOnMerge = async (isChainReaction = false) => {
  const { vibrationEnabled, soundEnabled } = useGameStore.getState();
  
  if (vibrationEnabled && Platform.OS !== 'web' && Vibration) {
    // Vibrate for 100ms when tiles merge
    Vibration.vibrate(100);
  }
  
  // Only play final merge sound if sound is enabled
  if (soundEnabled) {
    try {
      await soundManager.playMergeSound(isChainReaction);
    } catch (error) {
      // Failed to play merge sound silently
    }
  }
};

// Vibration and sound for intermediate merge in chain
export const vibrateOnIntermediateMerge = async (isChainReaction = true) => {
  const { vibrationEnabled, soundEnabled } = useGameStore.getState();
  
  if (vibrationEnabled && Platform.OS !== 'web' && Vibration) {
    // Shorter vibration for intermediate merges - optimized for large chains
    Vibration.vibrate(40); // Reduced from 60ms for faster feedback
  }
  
  // Only play intermediate merge sound if sound is enabled
  if (soundEnabled) {
    try {
      await soundManager.playIntermediateMergeSound(isChainReaction);
    } catch (error) {
      // console.warn('Failed to play intermediate merge sound:', error);
    }
  }
};

// Just vibration without sound (for cases where sound is handled separately)
export const vibrateOnly = () => {
  const { vibrationEnabled } = useGameStore.getState();
  
  if (vibrationEnabled && Platform.OS !== 'web' && Vibration) {
    // Vibrate for 100ms when tiles merge
    Vibration.vibrate(100);
  }
};

// Sound only for drops/touches (no vibration)
export const vibrateOnTouch = async (forcePlay = false) => {
  const { soundEnabled } = useGameStore.getState();
  
  // Only play drop/touch sound if sound is enabled
  // NO VIBRATION for drops to reduce excessive feedback
  if (soundEnabled) {
    try {
      await soundManager.playDropSound(forcePlay);
    } catch (error) {
      // console.warn('Failed to play drop sound:', error);
    }
  }
};

export const vibrateOnButtonPress = async () => {
  const { vibrationEnabled, soundEnabled } = useGameStore.getState();
  
  if (vibrationEnabled && Platform.OS !== 'web' && Vibration) {
    // Short vibration for button presses
    Vibration.vibrate(50);
  }
  
  // Play button press sound if enabled
  if (soundEnabled) {
    try {
      await soundManager.playDropSound(); // Reuse drop sound for button press
    } catch (error) {
      // console.warn('Failed to play button press sound:', error);
    }
  }
}; 