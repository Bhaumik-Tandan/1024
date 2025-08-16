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

  async updateFromStore() {
    try {
      const store = useGameStore.getState();
      const newEnabledState = store.backgroundMusicEnabled;
      const newVolumeState = store.backgroundMusicVolume;
      
      // Check if state actually changed
      const enabledChanged = this.isEnabled !== newEnabledState;
      const volumeChanged = this.currentVolume !== newVolumeState;
      
      // Update local state
      this.isEnabled = newEnabledState !== false; // Default to true
      this.currentVolume = newVolumeState || 0.6; // Use store volume or default
      
      // If music was disabled and we're currently playing, stop it
      if (!this.isEnabled && this.isPlaying) {
        this.pause();
      }
      
      // If music was enabled and we're not playing, start it (if initialized)
      if (this.isEnabled && !this.isPlaying && this.isInitialized) {
        this.play();
      }
      
      // Update volume if changed
      if (volumeChanged && this.musicPlayer && this.isInitialized) {
        try {
          await this.musicPlayer.setVolumeAsync(this.currentVolume);
        } catch (volumeError) {
          console.warn('BackgroundMusicManager: Failed to update volume:', volumeError);
        }
      }
      
    } catch (error) {
      console.warn('BackgroundMusicManager: Failed to get store values:', error);
      // Fallback defaults
      this.currentVolume = 0.6;
      this.isEnabled = true;
    }
  }

  async initialize() {
    if (this.isWebPlatform) {
      this.isInitialized = true;
      return;
    }

    try {
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
      }
      
      // Create and load music player - wait for completion
      await this.createMusicPlayer();
      
      // Only mark as initialized if music player was created successfully
      if (this.musicPlayer) {
        this.isInitialized = true;
        console.log('BackgroundMusicManager: Successfully initialized');
      } else {
        console.warn('BackgroundMusicManager: Music player creation failed, not initialized');
        this.isInitialized = false;
      }
    } catch (error) {
      console.warn('Background music initialization failed:', error);
      this.isInitialized = false;
      // Don't throw - just log and continue
    }
  }

  async createMusicPlayer() {
    if (this.isWebPlatform) {
      return;
    }

    try {
      console.log('🎵 Creating music player...');
      
      // Create sound object with expo-av
      this.musicPlayer = new Audio.Sound();
      console.log('🎵 Music player created:', this.musicPlayer);
      
      // Set up event listeners
      this.musicPlayer.setOnPlaybackStatusUpdate((status) => {
        console.log('🎵 Playback status update:', status);
        if (status.isLoaded && status.didJustFinish) {
          // Loop the music when it ends
          if (this.musicPlayer && this.isPlaying) {
            this.musicPlayer.replayAsync().catch(error => {
              console.warn('BackgroundMusicManager: Failed to replay music:', error);
            });
          }
        }
      });
      
      // Load the background music and wait for completion
      console.log('🎵 Loading background music...');
      await this.loadBackgroundMusic();
      console.log('🎵 Background music loaded successfully');
    } catch (error) {
      console.warn('Failed to create music player:', error);
      this.musicPlayer = null;
      throw error; // Re-throw to handle in initialize
    }
  }

  async loadBackgroundMusic() {
    if (this.isWebPlatform || !this.musicPlayer) {
      return;
    }

    try {
      console.log('🎵 Loading audio file: ../assets/audio/background.mp3');
      await this.musicPlayer.loadAsync(
        require('../assets/audio/background.mp3'),
        { shouldPlay: false, isLooping: true }
      );
      console.log('🎵 Audio file loaded successfully');
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
    // Always update from store first to get latest state
    await this.updateFromStore();
    
    if (!this.isEnabled) {
      return;
    }
    
    if (!this.isInitialized) {
      await this.initialize();
      if (!this.isInitialized) {
        return;
      }
    }

    if (this.isWebPlatform) {
      // Web fallback - just set playing state
      this.isPlaying = true;
      return;
    }

    if (!this.musicPlayer) {
      await this.createMusicPlayer();
      if (!this.musicPlayer) {
        return;
      }
    }

    try {
      // Check if music is already loaded
      const status = await this.musicPlayer.getStatusAsync();
      
      if (!status.isLoaded) {
        await this.loadBackgroundMusic();
      }
      
      // Set volume only if player exists
      if (this.musicPlayer) {
        try {
          await this.musicPlayer.setVolumeAsync(this.currentVolume);
          
          // Play the music
          const playResult = await this.musicPlayer.playAsync();
          console.log('🎵 Background music play result:', playResult);
          
          // Set playing state to true only if play was successful
          this.isPlaying = true;
        } catch (volumeError) {
          console.warn('BackgroundMusicManager: Volume or play failed:', volumeError);
          // Continue without volume setting
          this.isPlaying = false;
        }
      } else {
        console.warn('BackgroundMusicManager: No music player available');
        this.isPlaying = false;
      }
      
      // Verify it's actually playing
      setTimeout(async () => {
        try {
          await this.musicPlayer.getStatusAsync();
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
      // Reset initialization state to allow retry
      this.isInitialized = false;
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
      
      if (this.musicPlayer) {
        await this.musicPlayer.setVolumeAsync(0);
        await this.musicPlayer.playAsync();
      }
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
    await this.updateFromStore();
    
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

  // Simple test method to verify functionality
  async testPlay() {
    console.log('BackgroundMusicManager: Testing play functionality...');
    
    try {
      // Force initialization if needed
      if (!this.isInitialized) {
        console.log('BackgroundMusicManager: Initializing for test...');
        await this.initialize();
      }
      
      // Try to play
      await this.play();
      
      // Check status after play attempt
      const status = this.getStatus();
      console.log('BackgroundMusicManager: Test play completed, status:', status);
      
      return status;
    } catch (error) {
      console.error('BackgroundMusicManager: Test play failed:', error);
      throw error;
    }
  }

  // Get current status for debugging
  getStatus() {
    return {
      isEnabled: this.isEnabled,
      isPlaying: this.isPlaying,
      isInitialized: this.isInitialized,
      isWebPlatform: this.isWebPlatform,
      currentVolume: this.currentVolume,
      hasMusicPlayer: !!this.musicPlayer,
      audioModeSet: this.audioModeSet
    };
  }

  // Check if music manager is synced with store
  isSyncedWithStore() {
    try {
      const store = useGameStore.getState();
      const storeEnabled = store.backgroundMusicEnabled;
      const storeVolume = store.backgroundMusicVolume;
      
      const enabledSynced = this.isEnabled === (storeEnabled !== false);
      const volumeSynced = Math.abs(this.currentVolume - (storeVolume || 0.7)) < 0.01;
      const playingSynced = this.isEnabled ? this.isPlaying : !this.isPlaying;
      
      console.log('BackgroundMusicManager: Sync check - enabled:', enabledSynced, 'volume:', volumeSynced, 'playing:', playingSynced);
      
      return enabledSynced && volumeSynced && playingSynced;
    } catch (error) {
      console.warn('BackgroundMusicManager: Failed to check sync status:', error);
      return false;
    }
  }

  // Force sync with store state
  async forceSyncWithStore() {
    console.log('BackgroundMusicManager: Force syncing with store...');
    
    try {
      // Get latest state from store
      const store = useGameStore.getState();
      const storeEnabled = store.backgroundMusicEnabled;
      const storeVolume = store.backgroundMusicVolume;
      
      console.log('BackgroundMusicManager: Store state - enabled:', storeEnabled, 'volume:', storeVolume);
      console.log('BackgroundMusicManager: Current local state - enabled:', this.isEnabled, 'playing:', this.isPlaying);
      
      // Update local state
      this.isEnabled = storeEnabled !== false;
      this.currentVolume = storeVolume || 0.7;
      
      console.log('BackgroundMusicManager: Updated local state - enabled:', this.isEnabled, 'volume:', this.currentVolume);
      
      // Take action based on store state
      if (this.isEnabled) {
        if (!this.isPlaying) {
          console.log('BackgroundMusicManager: Store says music should be playing, starting...');
          await this.play();
        } else {
          console.log('BackgroundMusicManager: Music is already playing, no action needed');
        }
      } else {
        if (this.isPlaying) {
          console.log('BackgroundMusicManager: Store says music should be stopped, stopping...');
          await this.pause();
        } else {
          console.log('BackgroundMusicManager: Music is already stopped, no action needed');
        }
      }
      
      console.log('BackgroundMusicManager: Force sync completed successfully');
    } catch (error) {
      console.warn('BackgroundMusicManager: Force sync failed:', error);
      throw error; // Re-throw to let caller handle
    }
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
