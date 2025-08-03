import { Platform } from 'react-native';
import useGameStore from '../store/gameStore';
import soundManager from './soundManager';

// Only import Vibration on native platforms
let Vibration = null;
if (Platform.OS !== 'web') {
  Vibration = require('react-native').Vibration;
}

// Vibration and sound for final merge or single merge
export const vibrateOnMerge = async () => {
  const { vibrationEnabled, soundEnabled } = useGameStore.getState();
  
  if (vibrationEnabled && Platform.OS !== 'web' && Vibration) {
    // Vibrate for 100ms when tiles merge
    Vibration.vibrate(100);
  }
  
  // Only play final merge sound if sound is enabled
  if (soundEnabled) {
    await soundManager.playMergeSound();
  }
};

// Vibration and sound for intermediate merge in chain
export const vibrateOnIntermediateMerge = async () => {
  const { vibrationEnabled, soundEnabled } = useGameStore.getState();
  
  if (vibrationEnabled && Platform.OS !== 'web' && Vibration) {
    // Shorter vibration for intermediate merges
    Vibration.vibrate(60);
  }
  
  // Only play intermediate merge sound if sound is enabled
  if (soundEnabled) {
    await soundManager.playIntermediateMergeSound();
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
  
  // Only play drop/touch sound if sound is enabled
  if (soundEnabled) {
    await soundManager.playDropSound();
  }
};

export const vibrateOnButtonPress = () => {
  const { vibrationEnabled } = useGameStore.getState();
  
  if (vibrationEnabled && Platform.OS !== 'web' && Vibration) {
    // Short vibration for button presses
    Vibration.vibrate(50);
  }
}; 