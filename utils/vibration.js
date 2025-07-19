import { Vibration } from 'react-native';
import useGameStore from '../store/gameStore';
import soundManager from './soundManager';

// Simple vibration utility using React Native's built-in Vibration API
export const vibrateOnMerge = async () => {
  const { vibrationEnabled } = useGameStore.getState();
  
  if (vibrationEnabled) {
    // Vibrate for 100ms when tiles merge
    Vibration.vibrate(100);
  }
  
  // Play merge sound
  await soundManager.playMergeSound();
};

export const vibrateOnTouch = async () => {
  // Play drop/touch sound (no vibration for drop)
  await soundManager.playDropSound();
};

export const vibrateOnButtonPress = () => {
  const { vibrationEnabled } = useGameStore.getState();
  
  if (vibrationEnabled) {
    // Short vibration for button presses
    Vibration.vibrate(50);
  }
}; 