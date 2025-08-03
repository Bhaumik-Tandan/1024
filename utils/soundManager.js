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
    
    // Add sound queuing to prevent overlaps
    this.isPlayingMerge = false;
    this.isPlayingIntermediate = false;
    this.isPlayingDrop = false;
    this.isPlayingGameOver = false;
  }

  async initialize() {
    console.log('🔧 SoundManager: Starting initialization...');
    
    // Skip audio initialization on web
    if (this.isWebPlatform) {
      this.isInitialized = true;
      console.log('✅ SoundManager: Initialized for web platform (audio disabled)');
      return;
    }

    try {
      console.log('🔧 SoundManager: Starting audio initialization...');
      
      // Configure audio mode for playback only (no permissions needed)
      await setAudioModeAsync({
        allowsRecording: false,
        shouldPlayInBackground: false,
        playsInSilentMode: true,
        shouldDuckAndroid: true,
        shouldRouteThroughEarpiece: false,
      });
      
      console.log('✅ SoundManager: Audio mode configured');
      
      // Create audio players
      this.createAudioPlayers();
      
      this.isInitialized = true;
      console.log('✅ SoundManager: Audio initialization completed successfully');
    } catch (error) {
      console.warn('❌ SoundManager: Failed to initialize audio system:', error);
      this.isInitialized = false;
    }
  }

  createAudioPlayers() {
    console.log('🔧 SoundManager: Creating audio players...');
    
    if (this.isWebPlatform || !createAudioPlayer) {
      console.log('🔇 SoundManager: Skipping audio player creation (web platform or missing createAudioPlayer)');
      return;
    }
    
    try {
      console.log('🔧 SoundManager: Creating audio players...');
      
      // Create audio players for each sound
      this.mergePlayer = createAudioPlayer(require('../assets/audio/mergeSound.wav'));
      console.log('✅ Merge player created');
      
      this.intermediateMergePlayer = createAudioPlayer(require('../assets/audio/intermediateMerge.wav'));
      console.log('✅ Intermediate merge player created');
      
      console.log('🔧 Loading drop sound file...');
      this.dropPlayer = createAudioPlayer(require('../assets/audio/drop.wav'));
      console.log('✅ Drop player created with file size check');
      
      // Test drop player immediately after creation
      if (this.dropPlayer) {
        console.log('🔍 Drop player initial status:', {
          volume: this.dropPlayer.volume,
          isPlaying: this.dropPlayer.isPlaying,
          status: this.dropPlayer.status,
          duration: this.dropPlayer.duration
        });
      }
      
      this.gameOverPlayer = createAudioPlayer(require('../assets/audio/gameOver.wav'));
      console.log('✅ Game over player created');
      
      // Get volume from store and set initial volumes
      const { soundVolume } = useGameStore.getState();
      this.updateVolumeLevels(soundVolume);
      
      console.log('✅ SoundManager: Audio players created successfully');
    } catch (error) {
      console.warn('❌ SoundManager: Failed to create audio players:', error);
    }
  }

  updateVolumeLevels(volume) {
    if (this.isWebPlatform) return;
    
    try {
      const baseVolume = Math.max(0, Math.min(1, volume || 0.7));
      console.log('🔊 Updating volume levels:', {
        baseVolume,
        mergeVolume: baseVolume * 0.7,
        intermediateVolume: baseVolume * 0.6,
        dropVolume: baseVolume * 0.9, // INCREASED from 0.5 to 0.9
        gameOverVolume: baseVolume * 0.8
      });
      
      if (this.mergePlayer) this.mergePlayer.volume = baseVolume * 0.7;
      if (this.intermediateMergePlayer) this.intermediateMergePlayer.volume = baseVolume * 0.6;
      if (this.dropPlayer) {
        this.dropPlayer.volume = baseVolume * 0.9; // INCREASED from 0.5 to 0.9
        console.log('🔊 Drop player volume set to:', this.dropPlayer.volume);
      }
      if (this.gameOverPlayer) this.gameOverPlayer.volume = baseVolume * 0.8;
    } catch (error) {
      console.warn('❌ SoundManager: Failed to update volume levels:', error);
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
    if (this.isWebPlatform || !this.mergePlayer) {
      if (!this.isWebPlatform && !this.mergePlayer) {
        console.warn('SoundManager: Merge sound player not initialized');
      }
      return;
    }
    
    if (!this.isInitialized) {
      console.warn('SoundManager: Not initialized yet, skipping merge sound');
      return;
    }
    
    if (!this.checkSoundEnabled()) {
      return; // Sound disabled in settings
    }
    
    // Prevent overlapping merge sounds
    if (this.isPlayingMerge) {
      return;
    }
    
    try {
      this.isPlayingMerge = true;
      this.mergePlayer.seekTo(0); // Reset to beginning
      this.mergePlayer.play();
      
      // Reset flag after sound duration (reduced to 150ms to match animation timing)
      setTimeout(() => {
        this.isPlayingMerge = false;
      }, 150);
    } catch (error) {
      console.warn('SoundManager: Failed to play merge sound:', error);
      this.isPlayingMerge = false;
    }
  }

  async playIntermediateMergeSound() {
    if (this.isWebPlatform || !this.intermediateMergePlayer) {
      if (!this.isWebPlatform && !this.intermediateMergePlayer) {
        console.warn('SoundManager: Intermediate merge sound player not initialized');
      }
      return;
    }
    
    if (!this.isInitialized) {
      console.warn('SoundManager: Not initialized yet, skipping intermediate merge sound');
      return;
    }
    
    if (!this.checkSoundEnabled()) {
      return; // Sound disabled in settings
    }
    
    // Prevent overlapping intermediate merge sounds
    if (this.isPlayingIntermediate) {
      return;
    }
    
    try {
      this.isPlayingIntermediate = true;
      this.intermediateMergePlayer.seekTo(0); // Reset to beginning
      this.intermediateMergePlayer.play();
      
      // Reset flag after sound duration (reduced to 100ms to match chain animation timing)
      setTimeout(() => {
        this.isPlayingIntermediate = false;
      }, 100);
    } catch (error) {
      console.warn('SoundManager: Failed to play intermediate merge sound:', error);
      this.isPlayingIntermediate = false;
    }
  }

  async playDropSound() {
    console.log('🎵 playDropSound called - Debug Info:', {
      isWebPlatform: this.isWebPlatform,
      hasDropPlayer: !!this.dropPlayer,
      isInitialized: this.isInitialized,
      soundEnabled: this.checkSoundEnabled(),
      isPlayingDrop: this.isPlayingDrop
    });
    
    if (this.isWebPlatform || !this.dropPlayer) {
      if (!this.isWebPlatform && !this.dropPlayer) {
        console.warn('❌ SoundManager: Drop sound player not initialized');
      }
      console.log('🔇 Drop sound SKIPPED - web platform or missing player');
      return;
    }
    
    if (!this.isInitialized) {
      console.warn('❌ SoundManager: Not initialized yet, skipping drop sound');
      return;
    }
    
    if (!this.checkSoundEnabled()) {
      console.log('🔇 Drop sound SKIPPED - sound disabled in settings');
      return; // Sound disabled in settings
    }
    
    // Prevent overlapping drop sounds
    if (this.isPlayingDrop) {
      console.log('🔇 Drop sound SKIPPED - already playing');
      return;
    }
    
    try {
      console.log('🎵 Starting drop sound playback...');
      console.log('🔍 Drop player details:', {
        volume: this.dropPlayer.volume,
        duration: this.dropPlayer.duration,
        isPlaying: this.dropPlayer.isPlaying,
        status: this.dropPlayer.status
      });
      
      this.isPlayingDrop = true;
      
      // Reset to beginning
      console.log('🔄 Seeking to beginning...');
      this.dropPlayer.seekTo(0);
      
      // Start playback
      console.log('▶️ Starting playback...');
      const playResult = await this.dropPlayer.play();
      console.log('📊 Play result:', playResult);
      
      // Check if play was successful
      if (playResult === undefined || playResult === null) {
        console.warn('⚠️ Play result is undefined - audio player may not be working correctly');
        // Try to force play without await
        try {
          this.dropPlayer.play();
          console.log('🔄 Attempted play without await');
        } catch (forceError) {
          console.warn('❌ Force play also failed:', forceError);
        }
      }
      
      // Check if actually playing after a short delay
      setTimeout(() => {
        console.log('🔍 Post-playback check:', {
          isPlaying: this.dropPlayer.isPlaying,
          status: this.dropPlayer.status,
          volume: this.dropPlayer.volume
        });
        
        // Only trigger fallback if we're certain the drop sound failed
        // Don't trigger fallback if isPlaying is undefined (API issue)
        if (this.dropPlayer.isPlaying === false && this.mergePlayer) {
          console.log('🔄 Drop sound confirmed failed, trying merge sound as fallback...');
          try {
            this.mergePlayer.seekTo(0);
            this.mergePlayer.play().then(() => {
              console.log('✅ Fallback merge sound played successfully');
            }).catch(err => {
              console.warn('❌ Fallback merge sound also failed:', err);
            });
          } catch (fallbackError) {
            console.warn('❌ Fallback merge sound error:', fallbackError);
          }
        } else if (this.dropPlayer.isPlaying === undefined) {
          console.log('⚠️ Drop sound isPlaying is undefined - API issue, not triggering fallback');
        }
      }, 50);
      
      // Reset flag after sound duration (approximately 100ms)
      setTimeout(() => {
        console.log('🔄 Resetting drop sound flag');
        this.isPlayingDrop = false;
      }, 100);
      
      console.log('✅ Drop sound playback started successfully');
    } catch (error) {
      console.warn('❌ SoundManager: Failed to play drop sound:', error);
      this.isPlayingDrop = false;
      
      // Only try fallback on actual errors, not undefined play results
      if (error && this.mergePlayer) {
        console.log('🔄 Trying merge sound as fallback due to error...');
        try {
          this.mergePlayer.seekTo(0);
          await this.mergePlayer.play();
          console.log('✅ Fallback merge sound played successfully');
        } catch (fallbackError) {
          console.warn('❌ Fallback merge sound also failed:', fallbackError);
          
          // If all audio fails, at least provide vibration feedback
          console.log('📳 Audio failed, providing vibration feedback only');
          const { vibrationEnabled } = useGameStore.getState();
          if (vibrationEnabled && Platform.OS !== 'web') {
            const Vibration = require('react-native').Vibration;
            if (Vibration) {
              Vibration.vibrate(50);
              console.log('✅ Vibration feedback provided');
            }
          }
        }
      } else {
        console.log('⚠️ No fallback triggered - play result was undefined, not an error');
      }
      
      // Run debug report when drop sound fails
      this.debugDropSound();
    }
  }

  async playGameOverSound() {
    if (this.isWebPlatform || !this.gameOverPlayer) {
      if (!this.isWebPlatform && !this.gameOverPlayer) {
        console.warn('SoundManager: Game over sound player not initialized');
      }
      return;
    }
    
    if (!this.isInitialized) {
      console.warn('SoundManager: Not initialized yet, skipping game over sound');
      return;
    }
    
    if (!this.checkSoundEnabled()) {
      return; // Sound disabled in settings
    }
    
    // Prevent overlapping game over sounds
    if (this.isPlayingGameOver) {
      return;
    }
    
    try {
      this.isPlayingGameOver = true;
      this.gameOverPlayer.seekTo(0); // Reset to beginning
      this.gameOverPlayer.play();
      
      // Reset flag after sound duration (reduced from 3000ms to 2000ms for better UX)
      setTimeout(() => {
        this.isPlayingGameOver = false;
      }, 2000);
    } catch (error) {
      console.warn('SoundManager: Failed to play game over sound:', error);
      this.isPlayingGameOver = false;
    }
  }

  async playPauseResumeSound() {
    if (this.isWebPlatform || !this.dropPlayer) {
      if (!this.isWebPlatform && !this.dropPlayer) {
        console.warn('SoundManager: Drop sound player not initialized');
      }
      return;
    }
    
    if (!this.isInitialized) {
      console.warn('SoundManager: Not initialized yet, skipping pause/resume sound');
      return;
    }
    
    if (!this.checkSoundEnabled()) {
      return; // Sound disabled in settings
    }
    
    // Prevent overlapping pause/resume sounds
    if (this.isPlayingDrop) {
      return;
    }
    
    try {
      this.isPlayingDrop = true;
      this.dropPlayer.seekTo(0); // Reset to beginning
      this.dropPlayer.play();
      
      // Reset flag after sound duration (approximately 100ms)
      setTimeout(() => {
        this.isPlayingDrop = false;
      }, 100);
    } catch (error) {
      console.warn('SoundManager: Failed to play pause/resume sound:', error);
      this.isPlayingDrop = false;
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
      
      // Reset all playing flags
      this.isPlayingMerge = false;
      this.isPlayingIntermediate = false;
      this.isPlayingDrop = false;
      this.isPlayingGameOver = false;
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
      this.updateVolumeLevels(volume);
    } catch (error) {
      console.warn('SoundManager: Failed to set volume:', error);
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
      case 'pauseResume':
        this.playPauseResumeSound();
        break;
      default:
        break;
    }
  }

  checkSoundEnabled() {
    const state = useGameStore.getState();
    return state.soundEnabled;
  }

  isReady() {
    return this.isInitialized && !this.isWebPlatform;
  }

  isAnySoundPlaying() {
    return this.isPlayingMerge || this.isPlayingIntermediate || this.isPlayingDrop || this.isPlayingGameOver;
  }

  getStatus() {
    return {
      isInitialized: this.isInitialized,
      isWebPlatform: this.isWebPlatform,
      hasPlayers: {
        merge: !!this.mergePlayer,
        intermediateMerge: !!this.intermediateMergePlayer,
        drop: !!this.dropPlayer,
        gameOver: !!this.gameOverPlayer,
      },
      soundEnabled: this.checkSoundEnabled(),
      isPlaying: {
        merge: this.isPlayingMerge,
        intermediate: this.isPlayingIntermediate,
        drop: this.isPlayingDrop,
        gameOver: this.isPlayingGameOver,
      },
      volume: useGameStore.getState().soundVolume,
    };
  }

  // Test if sound system is working properly
  async testSoundSystem() {
    const status = this.getStatus();
    console.log('🔍 SoundManager Test Results:', status);
    
    if (!status.isInitialized) {
      console.warn('❌ SoundManager: Not initialized');
      return false;
    }
    
    if (status.isWebPlatform) {
      console.log('✅ SoundManager: Web platform - audio disabled');
      return true; // Not an error on web
    }
    
    // Test if all players are created
    const allPlayersExist = Object.values(status.hasPlayers).every(exists => exists);
    if (!allPlayersExist) {
      console.warn('❌ SoundManager: Some audio players are missing');
      return false;
    }
    
    // Test if sound is enabled
    if (!status.soundEnabled) {
      console.log('🔇 SoundManager: Sound is disabled in settings');
      return true; // Not an error, just disabled
    }
    
    return true;
  }

  // Comprehensive debug function for drop sound issues
  async debugDropSound() {
    console.log('🔍 Drop Sound Debug Report:');
    console.log('  - isWebPlatform:', this.isWebPlatform);
    console.log('  - isInitialized:', this.isInitialized);
    console.log('  - hasDropPlayer:', !!this.dropPlayer);
    console.log('  - soundEnabled:', this.checkSoundEnabled());
    console.log('  - isPlayingDrop:', this.isPlayingDrop);
    console.log('  - store state:', useGameStore.getState());
    
    if (this.dropPlayer) {
      console.log('  - dropPlayer status:', {
        volume: this.dropPlayer.volume,
        isPlaying: this.dropPlayer.isPlaying,
        duration: this.dropPlayer.duration,
        status: this.dropPlayer.status
      });
    }
  }

  // Test drop sound specifically
  async testDropSound() {
    console.log('🧪 Testing drop sound specifically...');
    
    if (!this.dropPlayer) {
      console.log('❌ No drop player available');
      return false;
    }
    
    try {
      console.log('🔍 Drop player before test:', {
        volume: this.dropPlayer.volume,
        isPlaying: this.dropPlayer.isPlaying,
        status: this.dropPlayer.status
      });
      
      // Set volume to maximum for testing
      const originalVolume = this.dropPlayer.volume;
      this.dropPlayer.volume = 1.0;
      console.log('🔊 Set volume to maximum for testing');
      
      // Try to play
      this.dropPlayer.seekTo(0);
      const playResult = await this.dropPlayer.play();
      console.log('📊 Test play result:', playResult);
      
      // Check after a short delay
      setTimeout(() => {
        console.log('🔍 Test playback check:', {
          isPlaying: this.dropPlayer.isPlaying,
          status: this.dropPlayer.status,
          volume: this.dropPlayer.volume
        });
        
        // If drop sound isn't working, test merge sound
        if (this.dropPlayer.isPlaying === false && this.mergePlayer) {
          console.log('🧪 Testing merge sound as alternative...');
          this.mergePlayer.volume = 1.0;
          this.mergePlayer.seekTo(0);
          this.mergePlayer.play().then(() => {
            console.log('✅ Merge sound test successful');
          }).catch(err => {
            console.error('❌ Merge sound test failed:', err);
          });
        } else if (this.dropPlayer.isPlaying === undefined) {
          console.log('⚠️ Drop sound isPlaying is undefined - API issue');
        }
        
        // Restore original volume
        this.dropPlayer.volume = originalVolume;
        console.log('🔊 Restored original volume:', originalVolume);
      }, 100);
      
      return true;
    } catch (error) {
      console.error('❌ Drop sound test failed:', error);
      
      // Try merge sound as fallback
      if (this.mergePlayer) {
        console.log('🧪 Trying merge sound as fallback test...');
        try {
          this.mergePlayer.volume = 1.0;
          this.mergePlayer.seekTo(0);
          await this.mergePlayer.play();
          console.log('✅ Merge sound fallback test successful');
        } catch (fallbackError) {
          console.error('❌ Merge sound fallback test also failed:', fallbackError);
        }
      }
      
      return false;
    }
  }

  // Test if drop sound file is actually audible
  async testDropSoundAudibility() {
    console.log('🔊 Testing drop sound audibility...');
    
    if (!this.dropPlayer) {
      console.log('❌ No drop player available');
      return false;
    }
    
    try {
      // Set volume to maximum
      const originalVolume = this.dropPlayer.volume;
      this.dropPlayer.volume = 1.0;
      console.log('🔊 Volume set to maximum (1.0)');
      
      // Try to play drop sound
      this.dropPlayer.seekTo(0);
      const playResult = await this.dropPlayer.play();
      console.log('📊 Drop sound play result:', playResult);
      
      // Wait a moment then check if it's playing
      setTimeout(() => {
        console.log('🔍 Drop sound playback status:', {
          isPlaying: this.dropPlayer.isPlaying,
          volume: this.dropPlayer.volume,
          duration: this.dropPlayer.duration
        });
        
        // If drop sound isn't playing, try merge sound for comparison
        if (this.dropPlayer.isPlaying === false && this.mergePlayer) {
          console.log('🔄 Drop sound not playing, testing merge sound for comparison...');
          this.mergePlayer.volume = 1.0;
          this.mergePlayer.seekTo(0);
          this.mergePlayer.play().then(() => {
            console.log('✅ Merge sound comparison successful');
          }).catch(err => {
            console.error('❌ Merge sound comparison failed:', err);
          });
        }
        
        // Restore volume
        this.dropPlayer.volume = originalVolume;
        console.log('🔊 Restored original volume:', originalVolume);
      }, 150);
      
      return true;
    } catch (error) {
      console.error('❌ Drop sound audibility test failed:', error);
      return false;
    }
  }

  // Simple audio system test - try to play any sound
  async testAudioSystem() {
    console.log('🧪 Testing entire audio system...');
    
    const tests = [
      { name: 'Drop Sound', player: this.dropPlayer, method: () => this.playDropSound() },
      { name: 'Merge Sound', player: this.mergePlayer, method: () => this.playMergeSound() },
      { name: 'Intermediate Sound', player: this.intermediateMergePlayer, method: () => this.playIntermediateMergeSound() },
      { name: 'Game Over Sound', player: this.gameOverPlayer, method: () => this.playGameOverSound() }
    ];
    
    for (const test of tests) {
      if (test.player) {
        console.log(`🧪 Testing ${test.name}...`);
        try {
          // Set maximum volume for testing
          const originalVolume = test.player.volume;
          test.player.volume = 1.0;
          
          // Try to play
          test.player.seekTo(0);
          const playResult = await test.player.play();
          console.log(`✅ ${test.name} test successful:`, playResult);
          
          // Restore volume
          test.player.volume = originalVolume;
          
          // Wait a bit before next test
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
          console.error(`❌ ${test.name} test failed:`, error);
        }
      } else {
        console.log(`🔇 ${test.name} not available`);
      }
    }
    
    console.log('🧪 Audio system test completed');
  }

  // Test if basic audio API is working
  async testBasicAudioAPI() {
    console.log('🧪 Testing basic audio API...');
    
    if (!this.dropPlayer) {
      console.log('❌ No audio players available');
      return false;
    }
    
    try {
      // Test basic player properties
      console.log('🔍 Player properties:', {
        volume: this.dropPlayer.volume,
        duration: this.dropPlayer.duration,
        status: this.dropPlayer.status,
        isPlaying: this.dropPlayer.isPlaying
      });
      
      // Test if we can set volume
      const originalVolume = this.dropPlayer.volume;
      this.dropPlayer.volume = 1.0;
      console.log('✅ Volume can be set');
      
      // Test if we can seek
      this.dropPlayer.seekTo(0);
      console.log('✅ Seek works');
      
      // Test if play method exists
      if (typeof this.dropPlayer.play === 'function') {
        console.log('✅ Play method exists');
      } else {
        console.log('❌ Play method does not exist');
        return false;
      }
      
      // Restore volume
      this.dropPlayer.volume = originalVolume;
      
      console.log('✅ Basic audio API test passed');
      return true;
    } catch (error) {
      console.error('❌ Basic audio API test failed:', error);
      return false;
    }
  }

  logStatus() {
    console.log('SoundManager Status:', this.getStatus());
  }

  playSoundIfEnabled(soundType) {
    if (this.checkSoundEnabled()) {
      this.playSound(soundType);
    }
  }
}

const soundManager = new SoundManager();
export default soundManager; 