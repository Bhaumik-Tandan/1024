import { Platform } from 'react-native';
import useGameStore from '../store/gameStore';

// Only import Audio on native platforms
let createAudioPlayer = null;
let setAudioModeAsync = null;
if (Platform.OS !== 'web') {
  const audio = require('expo-audio');
  createAudioPlayer = audio.createAudioPlayer;
  setAudioModeAsync = audio.setAudioModeAsync;
}

class SoundManager {
  constructor() {
    this.mergePlayer = null;
    this.intermediateMergePlayer = null;
    this.dropPlayer = null;
    this.gameOverPlayer = null;
    this.isInitialized = false;
    this.isWebPlatform = Platform.OS === 'web';
  }

  async initialize() {
    // Skip audio initialization on web
    if (this.isWebPlatform) {
      this.isInitialized = true;
      return;
    }

    try {
      // Configure audio mode for playback only (no permissions needed)
      await setAudioModeAsync({
        allowsRecording: false,
        shouldPlayInBackground: false,
        playsInSilentMode: true,
        shouldDuckAndroid: true,
        shouldRouteThroughEarpiece: false,
      });
      
      // Create audio players
      this.createAudioPlayers();
      
      this.isInitialized = true;
      // Sound manager initialized successfully
    } catch (error) {
      // Failed to initialize sound manager
    }
  }

  createAudioPlayers() {
    if (this.isWebPlatform || !createAudioPlayer) return;
    
    try {
      // Create audio players for each sound
      this.mergePlayer = createAudioPlayer(require('../assets/audio/mergeSound.wav'));
      this.intermediateMergePlayer = createAudioPlayer(require('../assets/audio/intermediateMerge.wav'));
      this.dropPlayer = createAudioPlayer(require('../assets/audio/drop.wav'));
      this.gameOverPlayer = createAudioPlayer(require('../assets/audio/gameOver.wav'));
      
      // Set volume levels
      if (this.mergePlayer) this.mergePlayer.volume = 0.7;
      if (this.intermediateMergePlayer) this.intermediateMergePlayer.volume = 0.6;
      if (this.dropPlayer) this.dropPlayer.volume = 0.5;
      if (this.gameOverPlayer) this.gameOverPlayer.volume = 0.8;
      
    } catch (error) {
      // Failed to create audio players
    }
  }

  // Legacy methods to maintain compatibility - these are now no-ops for individual loading
  async loadMergeSound() {
    // No longer needed with expo-audio, players are created in initialize
  }

  async loadIntermediateMergeSound() {
    // No longer needed with expo-audio, players are created in initialize
  }

  async loadDropSound() {
    // No longer needed with expo-audio, players are created in initialize
  }

  async playMergeSound() {
    if (this.isWebPlatform || !this.mergePlayer) return;
    
    try {
      this.mergePlayer.seekTo(0); // Reset to beginning
      this.mergePlayer.play();
    } catch (error) {
      // Failed to play merge sound
    }
  }

  async playIntermediateMergeSound() {
    if (this.isWebPlatform || !this.intermediateMergePlayer) return;
    
    try {
      this.intermediateMergePlayer.seekTo(0); // Reset to beginning
      this.intermediateMergePlayer.play();
    } catch (error) {
      // Failed to play intermediate merge sound
    }
  }

  async playDropSound() {
    if (this.isWebPlatform || !this.dropPlayer) return;
    
    try {
      this.dropPlayer.seekTo(0); // Reset to beginning
      this.dropPlayer.play();
    } catch (error) {
      // Failed to play drop sound
    }
  }

  async playGameOverSound() {
    if (this.isWebPlatform || !this.gameOverPlayer) return;
    
    try {
      this.gameOverPlayer.seekTo(0); // Reset to beginning
      this.gameOverPlayer.play();
    } catch (error) {
      // Failed to play game over sound
    }
  }

  async stopAllSounds() {
    if (this.isWebPlatform) return;
    
    try {
      if (this.mergePlayer) {
        this.mergePlayer.pause();
      }
      if (this.intermediateMergePlayer) {
        this.intermediateMergePlayer.pause();
      }
      if (this.dropPlayer) {
        this.dropPlayer.pause();
      }
      if (this.gameOverPlayer) {
        this.gameOverPlayer.pause();
      }
    } catch (error) {
      // Failed to stop sounds
    }
  }

  async unloadAllSounds() {
    if (this.isWebPlatform) return;
    
    try {
      if (this.mergePlayer) {
        this.mergePlayer.remove();
        this.mergePlayer = null;
      }
      if (this.intermediateMergePlayer) {
        this.intermediateMergePlayer.remove();
        this.intermediateMergePlayer = null;
      }
      if (this.dropPlayer) {
        this.dropPlayer.remove();
        this.dropPlayer = null;
      }
      if (this.gameOverPlayer) {
        this.gameOverPlayer.remove();
        this.gameOverPlayer = null;
      }
    } catch (error) {
      // Failed to unload sounds
    }
  }

  async setVolume(volume) {
    if (this.isWebPlatform) return;
    
    try {
      if (this.mergePlayer) {
        this.mergePlayer.volume = volume * 0.7; // Maintain relative volume levels
      }
      if (this.intermediateMergePlayer) {
        this.intermediateMergePlayer.volume = volume * 0.6;
      }
      if (this.dropPlayer) {
        this.dropPlayer.volume = volume * 0.5;
      }
      if (this.gameOverPlayer) {
        this.gameOverPlayer.volume = volume * 0.8;
      }
    } catch (error) {
      // Failed to set volume
    }
  }

  playSound(soundType) {
    if (!this.isInitialized || this.isWebPlatform) return;
    
    switch (soundType) {
      case 'merge':
        this.playMergeSound();
        break;
      case 'intermediateMerge':
        this.playIntermediateMergeSound();
        break;
      case 'drop':
        this.playDropSound();
        break;
      case 'gameOver':
        this.playGameOverSound();
        break;
      default:
        break;
    }
  }

  checkSoundEnabled() {
    const state = useGameStore.getState();
    return state.soundEnabled;
  }

  playSoundIfEnabled(soundType) {
    if (this.checkSoundEnabled()) {
      this.playSound(soundType);
    }
  }
}

const soundManager = new SoundManager();
export default soundManager; 