/**
 * BACKGROUND MUSIC MANAGER
 * 
 * Handles background music playback with proper controls
 * and integration with the game store settings
 */

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

class BackgroundMusicManager {
  constructor() {
    this.musicPlayer = null;
    this.isInitialized = false;
    this.isWebPlatform = Platform.OS === 'web';
    this.isPlaying = false;
    this.currentVolume = 0.7;
    this.fadeInterval = null;
    
    // Get initial state from store
    this.updateFromStore();
  }

  updateFromStore() {
    try {
      const store = useGameStore.getState();
      console.log('BackgroundMusicManager: Store values - backgroundMusicEnabled:', store.backgroundMusicEnabled, 'backgroundMusicVolume:', store.backgroundMusicVolume);
      this.currentVolume = store.backgroundMusicVolume || 0.7;
      this.isEnabled = store.backgroundMusicEnabled !== false; // Default to true
      console.log('BackgroundMusicManager: Updated values - isEnabled:', this.isEnabled, 'currentVolume:', this.currentVolume);
    } catch (error) {
      console.warn('BackgroundMusicManager: Failed to get store values:', error);
      // Fallback defaults
      this.currentVolume = 0.7;
      this.isEnabled = true;
    }
  }

  async initialize() {
    if (this.isWebPlatform) {
      console.log('BackgroundMusicManager: Web platform detected, skipping initialization');
      this.isInitialized = true;
      return;
    }

    try {
      console.log('BackgroundMusicManager: Initializing audio mode...');
      
      // Check if expo-audio is available
      if (!setAudioModeAsync) {
        console.warn('BackgroundMusicManager: setAudioModeAsync not available');
        this.isInitialized = false;
        return;
      }
      
      await setAudioModeAsync({
        allowsRecording: false,
        shouldPlayInBackground: true,
        playsInSilentMode: true,
        shouldDuckAndroid: true,
        shouldRouteThroughEarpiece: false,
      });
      console.log('BackgroundMusicManager: Audio mode set successfully');
      
      this.createMusicPlayer();
      this.isInitialized = true;
      console.log('BackgroundMusicManager: Initialization complete');
    } catch (error) {
      console.warn('Background music initialization failed:', error);
      this.isInitialized = false;
    }
  }

  createMusicPlayer() {
    if (this.isWebPlatform || !createAudioPlayer) {
      console.log('BackgroundMusicManager: Cannot create music player - web platform or no createAudioPlayer');
      return;
    }

    try {
      console.log('BackgroundMusicManager: Creating music player...');
      
      // Check if createAudioPlayer is a function
      if (typeof createAudioPlayer !== 'function') {
        console.warn('BackgroundMusicManager: createAudioPlayer is not a function:', typeof createAudioPlayer);
        return;
      }
      
      this.musicPlayer = createAudioPlayer();
      console.log('BackgroundMusicManager: Music player created:', this.musicPlayer);
      
      // Verify the music player has the required methods
      if (!this.musicPlayer) {
        console.warn('BackgroundMusicManager: createAudioPlayer returned null/undefined');
        return;
      }
      
      // Check what methods are actually available
      const availableMethods = Object.getOwnPropertyNames(this.musicPlayer);
      console.log('BackgroundMusicManager: Available methods:', availableMethods);
      
      // Set up event listeners if available
      if (this.musicPlayer && typeof this.musicPlayer.setOnPlaybackStatusUpdate === 'function') {
        this.musicPlayer.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            // Loop the music when it ends
            if (this.musicPlayer && typeof this.musicPlayer.replayAsync === 'function') {
              this.musicPlayer.replayAsync();
            }
          }
        });
        console.log('BackgroundMusicManager: Playback status listener set');
      } else {
        console.warn('BackgroundMusicManager: Music player missing setOnPlaybackStatusUpdate method');
      }
      
      // Load the background music
      this.loadBackgroundMusic();
    } catch (error) {
      console.warn('Failed to create music player:', error);
      this.musicPlayer = null;
    }
  }

  async loadBackgroundMusic() {
    if (this.isWebPlatform || !this.musicPlayer) {
      console.log('BackgroundMusicManager: Cannot load music - web platform or no music player');
      return;
    }

    try {
      console.log('BackgroundMusicManager: Loading background music...');
      
      // Try standard loadAsync method first
      if (this.musicPlayer && typeof this.musicPlayer.loadAsync === 'function') {
        await this.musicPlayer.loadAsync(
          require('../assets/audio/background.mp3'),
          { shouldPlay: false, isLooping: true }
        );
        console.log('BackgroundMusicManager: Background music loaded successfully');
        return;
      }
      
      // Fallback: try alternative loading methods
      if (this.musicPlayer && typeof this.musicPlayer.load === 'function') {
        await this.musicPlayer.load(
          require('../assets/audio/background.mp3'),
          { shouldPlay: false, isLooping: true }
        );
        console.log('BackgroundMusicManager: Background music loaded with fallback method');
        return;
      }
      
      // Check if there are any other loading methods
      const loadingMethods = ['loadAsync', 'load', 'loadFromUri', 'loadFromFile'];
      const availableLoadingMethod = loadingMethods.find(method => 
        this.musicPlayer && typeof this.musicPlayer[method] === 'function'
      );
      
      if (availableLoadingMethod) {
        console.log('BackgroundMusicManager: Found alternative loading method:', availableLoadingMethod);
        await this.musicPlayer[availableLoadingMethod](
          require('../assets/audio/background.mp3'),
          { shouldPlay: false, isLooping: true }
        );
        console.log('BackgroundMusicManager: Background music loaded with alternative method');
        return;
      }
      
      console.log('BackgroundMusicManager: No loading methods available');
    } catch (error) {
      console.warn('Failed to load background music:', error);
    }
  }

  async play() {
    console.log('BackgroundMusicManager: Play requested, enabled:', this.isEnabled, 'initialized:', this.isInitialized);
    if (!this.isEnabled || !this.isInitialized) {
      console.log('BackgroundMusicManager: Cannot play - not enabled or not initialized');
      return;
    }

    this.updateFromStore();
    console.log('BackgroundMusicManager: Volume from store:', this.currentVolume);
    
    if (this.isWebPlatform) {
      // Web fallback - just set playing state
      this.isPlaying = true;
      console.log('BackgroundMusicManager: Web platform - setting playing state to true');
      return;
    }

    if (!this.musicPlayer) {
      console.log('BackgroundMusicManager: No music player, initializing...');
      await this.initialize();
      if (!this.musicPlayer) {
        console.log('BackgroundMusicManager: Failed to create music player');
        return;
      }
    }

    try {
      console.log('BackgroundMusicManager: Playing music with volume:', this.currentVolume);
      
      // Try to set volume with various methods
      if (this.musicPlayer && typeof this.musicPlayer.setVolumeAsync === 'function') {
        await this.musicPlayer.setVolumeAsync(this.currentVolume);
      } else if (this.musicPlayer && typeof this.musicPlayer.setVolume === 'function') {
        await this.musicPlayer.setVolume(this.currentVolume);
      }
      
      // Try to play with various methods
      if (this.musicPlayer && typeof this.musicPlayer.playAsync === 'function') {
        await this.musicPlayer.playAsync();
      } else if (this.musicPlayer && typeof this.musicPlayer.play === 'function') {
        await this.musicPlayer.play();
      } else if (this.musicPlayer && typeof this.musicPlayer.start === 'function') {
        await this.musicPlayer.start();
      } else {
        console.warn('BackgroundMusicManager: No play method available');
        return;
      }
      
      this.isPlaying = true;
      console.log('BackgroundMusicManager: Music started successfully');
    } catch (error) {
      console.warn('Failed to play background music:', error);
    }
  }

  async pause() {
    if (this.isWebPlatform) {
      this.isPlaying = false;
      return;
    }

    if (!this.musicPlayer) return;

    try {
      if (this.musicPlayer && typeof this.musicPlayer.pauseAsync === 'function') {
        await this.musicPlayer.pauseAsync();
      }
      this.isPlaying = false;
    } catch (error) {
      console.warn('Failed to pause background music:', error);
    }
  }

  async stop() {
    if (this.isWebPlatform) {
      this.isPlaying = false;
      return;
    }

    if (!this.musicPlayer) return;

    try {
      if (this.musicPlayer && typeof this.musicPlayer.stopAsync === 'function') {
        await this.musicPlayer.stopAsync();
      }
      this.isPlaying = false;
    } catch (error) {
      console.warn('Failed to stop background music:', error);
    }
  }

  async setVolume(volume) {
    this.currentVolume = Math.max(0, Math.min(1, volume));
    
    if (this.isWebPlatform) return;

    if (this.musicPlayer && typeof this.musicPlayer.setVolumeAsync === 'function') {
      try {
        await this.musicPlayer.setVolumeAsync(this.currentVolume);
      } catch (error) {
        console.warn('Failed to set music volume:', error);
      }
    }
  }

  async fadeIn(duration = 2000) {
    if (this.isWebPlatform) return;

    if (!this.musicPlayer || !this.musicPlayer.setVolumeAsync || !this.musicPlayer.playAsync) return;

    try {
      const steps = 20;
      const stepDuration = duration / steps;
      const volumeStep = this.currentVolume / steps;
      
      await this.musicPlayer.setVolumeAsync(0);
      await this.musicPlayer.playAsync();
      this.isPlaying = true;
      
      let currentVolume = 0;
      
      this.fadeInterval = setInterval(async () => {
        currentVolume += volumeStep;
        if (currentVolume >= this.currentVolume) {
          currentVolume = this.currentVolume;
          clearInterval(this.fadeInterval);
          this.fadeInterval = null;
        }
        
        try {
          if (this.musicPlayer && this.musicPlayer.setVolumeAsync) {
            await this.musicPlayer.setVolumeAsync(currentVolume);
          }
        } catch (error) {
          // Ignore errors during fade
        }
      }, stepDuration);
    } catch (error) {
      console.warn('Failed to fade in music:', error);
    }
  }

  async fadeOut(duration = 2000) {
    if (this.isWebPlatform) return;

    if (!this.musicPlayer || !this.musicPlayer.setVolumeAsync) return;

    try {
      const steps = 20;
      const stepDuration = duration / steps;
      const volumeStep = this.currentVolume / steps;
      
      let currentVolume = this.currentVolume;
      
      this.fadeInterval = setInterval(async () => {
        currentVolume -= volumeStep;
        if (currentVolume <= 0) {
          currentVolume = 0;
          clearInterval(this.fadeInterval);
          this.fadeInterval = null;
          await this.pause();
        }
        
        try {
          if (this.musicPlayer && this.musicPlayer.setVolumeAsync) {
            await this.musicPlayer.setVolumeAsync(currentVolume);
          }
        } catch (error) {
          // Ignore errors during fade
        }
      }, stepDuration);
    } catch (error) {
      console.warn('Failed to fade out music:', error);
    }
  }

  async toggle() {
    if (this.isPlaying) {
      await this.pause();
    } else {
      await this.play();
    }
  }

  async updateSettings() {
    this.updateFromStore();
    
    if (this.isEnabled) {
      if (!this.isPlaying) {
        await this.play();
      }
    } else {
      if (this.isPlaying) {
        await this.pause();
      }
    }
  }

  cleanup() {
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }
    
    if (this.musicPlayer && typeof this.musicPlayer.unloadAsync === 'function') {
      try {
        this.musicPlayer.unloadAsync();
      } catch (error) {
        console.warn('Failed to unload music player:', error);
      }
      this.musicPlayer = null;
    }
  }
}

// Create singleton instance
const backgroundMusicManager = new BackgroundMusicManager();

export default backgroundMusicManager;
