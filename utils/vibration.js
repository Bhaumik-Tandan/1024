import { Platform } from 'react-native';
import useGameStore from '../store/gameStore';
import soundManager from './soundManager';

// Only import Vibration on native platforms
let Vibration = null;
if (Platform.OS !== 'web') {
  Vibration = require('react-native').Vibration;
}

// Add debouncing to prevent overlapping sounds
let lastMergeTime = 0;
let lastIntermediateMergeTime = 0;
let lastDropTime = 0;

// Vibration and sound for final merge or single merge
export const vibrateOnMerge = async () => {
  const { vibrationEnabled, soundEnabled } = useGameStore.getState();
  
  // Debounce merge sounds (minimum 150ms between sounds to prevent overlap)
  const now = Date.now();
  if (now - lastMergeTime < 150) {
    return;
  }
  lastMergeTime = now;
  
  if (vibrationEnabled && Platform.OS !== 'web' && Vibration) {
    // Vibrate for 100ms when tiles merge
    Vibration.vibrate(100);
  }
  
  // Only play final merge sound if sound is enabled
  if (soundEnabled) {
    try {
      await soundManager.playMergeSound();
    } catch (error) {
      console.warn('Failed to play merge sound:', error);
    }
  }
};

// Vibration and sound for intermediate merge in chain
export const vibrateOnIntermediateMerge = async () => {
  const { vibrationEnabled, soundEnabled } = useGameStore.getState();
  
  // Debounce intermediate merge sounds (minimum 120ms between sounds to prevent overlap)
  const now = Date.now();
  if (now - lastIntermediateMergeTime < 120) {
    return;
  }
  lastIntermediateMergeTime = now;
  
  if (vibrationEnabled && Platform.OS !== 'web' && Vibration) {
    // Shorter vibration for intermediate merges
    Vibration.vibrate(60);
  }
  
  // Only play intermediate merge sound if sound is enabled
  if (soundEnabled) {
    try {
      await soundManager.playIntermediateMergeSound();
    } catch (error) {
      console.warn('Failed to play intermediate merge sound:', error);
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

export const vibrateOnTouch = async () => {
  const { soundEnabled } = useGameStore.getState();
  
  console.log('🔊 vibrateOnTouch called - Debug Info:', {
    soundEnabled,
    lastDropTime,
    currentTime: Date.now(),
    timeSinceLastDrop: Date.now() - lastDropTime,
    debounceThreshold: 50
  });
  
  // Debounce drop sounds (minimum 50ms between sounds)
  const now = Date.now();
  if (now - lastDropTime < 50) {
    console.log('🔇 Drop sound SKIPPED - too soon since last drop');
    return;
  }
  lastDropTime = now;
  
  console.log('✅ Drop sound will play - conditions met');
  
  // Only play drop/touch sound if sound is enabled
  if (soundEnabled) {
    try {
      console.log('🎵 Playing drop sound...');
      await soundManager.playDropSound();
      console.log('✅ Drop sound played successfully');
    } catch (error) {
      console.warn('❌ Failed to play drop sound:', error);
      
      // Fallback to vibration only if audio fails
      console.log('📳 Audio failed, providing vibration feedback only');
      const { vibrationEnabled } = useGameStore.getState();
      if (vibrationEnabled && Platform.OS !== 'web' && Vibration) {
        Vibration.vibrate(50);
        console.log('✅ Vibration feedback provided as fallback');
      }
    }
  } else {
    console.log('🔇 Drop sound SKIPPED - sound disabled in settings');
    
    // Still provide vibration feedback even if sound is disabled
    const { vibrationEnabled } = useGameStore.getState();
    if (vibrationEnabled && Platform.OS !== 'web' && Vibration) {
      Vibration.vibrate(50);
      console.log('✅ Vibration feedback provided (sound disabled)');
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
      console.warn('Failed to play button press sound:', error);
    }
  }
}; 