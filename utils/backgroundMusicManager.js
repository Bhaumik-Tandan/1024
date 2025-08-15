/**
 * BACKGROUND MUSIC MANAGER
 * 
 * Handles background music playback with proper controls
 * and integration with the game store settings
 * 
 * UPDATED: Now uses expo-av for better compatibility with Expo SDK 53
 */

import { Platform } from 'react-native';
import { Audio } from 'expo-av';
import useGameStore from '../store/gameStore';

class BackgroundMusicManager {
  constructor() {
    this.musicPlayer = null;
    this.isInitialized = false;
    this.isWebPlatform = Platform.OS === 'web';
    this.isPlaying = false;
    this.currentVolume = 0.7; // Fixed volume - no volume control needed
    this.fadeInterval = null;
    this.audioModeSet = false;
    
    // Get initial state from store
    this.updateFromStore();
  }

  updateFromStore() {
    try {
      const store = useGameStore.getState();
      console.log('BackgroundMusicManager: Store values - backgroundMusicEnabled:', store.backgroundMusicEnabled);
      // Use fixed volume since volume control is removed from settings
      this.currentVolume = 0.7; // Fixed volume - no longer controlled from settings
      this.isEnabled = store.backgroundMusicEnabled !== false; // Default to true
      console.log('BackgroundMusicManager: Updated values - isEnabled:', this.isEnabled, 'currentVolume:', this.currentVolume);
    } catch (error) {
      console.warn('BackgroundMusicManager: Failed to get store values:', error);
      // Fallback defaults
      this.currentVolume = 0.7; // Fixed volume
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
      
      // Set audio mode only once
      if (!this.audioModeSet) {
        await Audio.setAudioModeAsync({
          allowsRecording: false,
          shouldPlayInBackground: true,
          playsInSilentMode: true,
          shouldDuckAndroid: true,
          shouldRouteThroughEarpiece: false,
        });
        this.audioModeSet = true;
        console.log('BackgroundMusicManager: Audio mode set successfully');
      }
      
      // Create and load music player - wait for completion
      await this.createMusicPlayer();
      
      // Only mark as initialized if music player was created successfully
      if (this.musicPlayer) {
        this.isInitialized = true;
        console.log('BackgroundMusicManager: Initialization complete');
      } else {
        console.warn('BackgroundMusicManager: Music player creation failed, not initialized');
        this.isInitialized = false;
      }
    } catch (error) {
      console.warn('Background music initialization failed:', error);
      this.isInitialized = false;
    }
  }

  async createMusicPlayer() {
    if (this.isWebPlatform) {
      console.log('BackgroundMusicManager: Cannot create music player - web platform');
      return;
    }

    try {
      console.log('BackgroundMusicManager: Creating music player...');
      
      // Create sound object with expo-av
      this.musicPlayer = new Audio.Sound();
      console.log('BackgroundMusicManager: Music player created:', this.musicPlayer);
      
      // Set up event listeners
      this.musicPlayer.setOnPlaybackStatusUpdate((status) => {
        console.log('BackgroundMusicManager: Playback status update:', status);
        if (status.isLoaded && status.didJustFinish) {
          // Loop the music when it ends
          if (this.musicPlayer && this.isPlaying) {
            console.log('BackgroundMusicManager: Music finished, replaying...');
            this.musicPlayer.replayAsync().catch(error => {
              console.warn('BackgroundMusicManager: Failed to replay music:', error);
            });
          }
        }
      });
      console.log('BackgroundMusicManager: Playback status listener set');
      
      // Load the background music and wait for completion
      await this.loadBackgroundMusic();
      
      console.log('BackgroundMusicManager: Music player setup complete');
    } catch (error) {
      console.warn('Failed to create music player:', error);
      this.musicPlayer = null;
      throw error; // Re-throw to handle in initialize
    }
  }

  async loadBackgroundMusic() {
    if (this.isWebPlatform || !this.musicPlayer) {
      console.log('BackgroundMusicManager: Cannot load music - web platform or no music player');
      return;
    }

    try {
      console.log('BackgroundMusicManager: Loading background music...');
      
      await this.musicPlayer.loadAsync(
        require('../assets/audio/background.mp3'),
        { shouldPlay: false, isLooping: true }
      );
      console.log('BackgroundMusicManager: Background music loaded successfully');
    } catch (error) {
      console.warn('Failed to load background music:', error);
      // Try to unload and recreate if loading fails
      if (this.musicPlayer) {
        try {
          await this.musicPlayer.unloadAsync();
        } catch (unloadError) {
          // Ignore unload errors
        }
        this.musicPlayer = null;
      }
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
      
      // Check if music is already loaded
      const status = await this.musicPlayer.getStatusAsync();
      console.log('BackgroundMusicManager: Current music status:', status);
      
      if (!status.isLoaded) {
        console.log('BackgroundMusicManager: Music not loaded, loading now...');
        await this.loadBackgroundMusic();
      }
      
      // Set volume
      console.log('BackgroundMusicManager: Setting volume to:', this.currentVolume);
      await this.musicPlayer.setVolumeAsync(this.currentVolume);
      
      // Play the music
      console.log('BackgroundMusicManager: Starting playback...');
      const playResult = await this.musicPlayer.playAsync();
      console.log('BackgroundMusicManager: Play result:', playResult);
      
      this.isPlaying = true;
      console.log('BackgroundMusicManager: Music started successfully');
      
      // Verify it's actually playing
      setTimeout(async () => {
        try {
          const currentStatus = await this.musicPlayer.getStatusAsync();
          console.log('BackgroundMusicManager: Music status after 1 second:', currentStatus);
        } catch (error) {
          console.warn('BackgroundMusicManager: Failed to get status after play:', error);
        }
      }, 1000);
      
    } catch (error) {
      console.warn('Failed to play background music:', error);
      // Try to recreate player if play fails
      if (this.musicPlayer) {
        try {
          await this.musicPlayer.unloadAsync();
        } catch (unloadError) {
          // Ignore unload errors
        }
        this.musicPlayer = null;
      }
    }
  }

  async pause() {
    if (this.isWebPlatform) {
      this.isPlaying = false;
      return;
    }

    if (!this.musicPlayer) return;

    try {
      await this.musicPlayer.pauseAsync();
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
      await this.musicPlayer.stopAsync();
      this.isPlaying = false;
    } catch (error) {
      console.warn('Failed to stop background music:', error);
    }
  }

  async fadeIn(duration = 2000) {
    if (this.isWebPlatform) return;

    if (!this.musicPlayer) return;

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
          if (this.musicPlayer) {
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

    if (!this.musicPlayer) return;

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
          if (this.musicPlayer) {
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
    
    if (this.musicPlayer) {
      try {
        this.musicPlayer.unloadAsync();
      } catch (error) {
        console.warn('Failed to unload music player:', error);
      }
      this.musicPlayer = null;
    }
    
    this.isInitialized = false;
    this.audioModeSet = false;
  }

  // Enhanced error recovery
  async recoverFromError() {
    console.log('BackgroundMusicManager: Attempting error recovery...');
    
    try {
      // Clean up existing player
      if (this.musicPlayer) {
        try {
          await this.musicPlayer.unloadAsync();
        } catch (error) {
          // Ignore cleanup errors
        }
        this.musicPlayer = null;
      }
      
      // Reset state
      this.isInitialized = false;
      this.audioModeSet = false;
      this.isPlaying = false;
      
      // Reinitialize
      await this.initialize();
      
      if (this.isEnabled && this.isInitialized) {
        await this.play();
      }
      
      console.log('BackgroundMusicManager: Error recovery completed');
    } catch (error) {
      console.warn('BackgroundMusicManager: Error recovery failed:', error);
    }
  }

  // Diagnostic method to check system status
  async diagnoseSystem() {
    console.log('=== Background Music System Diagnosis ===');
    
    try {
      // Check platform
      console.log('Platform:', this.isWebPlatform ? 'Web' : 'Native');
      console.log('Enabled:', this.isEnabled);
      console.log('Initialized:', this.isInitialized);
      console.log('Audio mode set:', this.audioModeSet);
      console.log('Music player exists:', !!this.musicPlayer);
      console.log('Currently playing:', this.isPlaying);
      console.log('Volume:', this.currentVolume);
      
      if (!this.isWebPlatform && this.musicPlayer) {
        try {
          const status = await this.musicPlayer.getStatusAsync();
          console.log('Music player status:', status);
        } catch (error) {
          console.log('Failed to get music player status:', error.message);
        }
      }
      
      // Check store values
      try {
        const store = useGameStore.getState();
        console.log('Store values:');
        console.log('  - backgroundMusicEnabled:', store.backgroundMusicEnabled);
        console.log('  - backgroundMusicVolume:', store.backgroundMusicVolume);
      } catch (error) {
        console.log('Failed to get store values:', error.message);
      }
      
      console.log('=== Diagnosis Complete ===');
    } catch (error) {
      console.error('Diagnosis failed:', error);
    }
  }

  // Force play method for testing
  async forcePlay() {
    console.log('BackgroundMusicManager: Force play requested...');
    
    try {
      // Force initialization
      if (!this.isInitialized) {
        console.log('BackgroundMusicManager: Force initializing...');
        await this.initialize();
      }
      
      // Force play
      if (this.musicPlayer) {
        console.log('BackgroundMusicManager: Force playing...');
        await this.musicPlayer.playAsync();
        this.isPlaying = true;
        console.log('BackgroundMusicManager: Force play successful');
      } else {
        console.warn('BackgroundMusicManager: No music player available for force play');
      }
    } catch (error) {
      console.error('BackgroundMusicManager: Force play failed:', error);
    }
  }
}

// Create singleton instance
const backgroundMusicManager = new BackgroundMusicManager();

export default backgroundMusicManager;
