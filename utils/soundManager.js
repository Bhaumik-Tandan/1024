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
    
    // Enhanced sound queuing system
    this.soundQueue = [];
    this.isProcessingQueue = false;
    this.lastSoundTimes = {
      merge: 0,
      intermediateMerge: 0,
      drop: 0,
      gameOver: 0,
      pauseResume: 0
    };
    
    // Minimum intervals between sounds (in milliseconds)
    this.soundIntervals = {
      merge: 180,           // Reduced from 200ms for faster feedback
      intermediateMerge: 120, // Reduced from 150ms for better chain timing
      drop: 80,             // Reduced from 100ms for faster drops
      gameOver: 3000,       // Game over sound is longer
      pauseResume: 150      // New interval for pause/resume
    };
    
    // Sound priority system (higher number = higher priority)
    this.soundPriorities = {
      gameOver: 5,          // Highest priority
      merge: 3,             // Medium priority
      intermediateMerge: 2,  // Lower priority
      drop: 1,              // Lowest priority
      pauseResume: 1        // Same as drop
    };
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

  // Enhanced sound queuing system
  async queueSound(soundType, priority = 1) {
    console.log(`🎵 queueSound called - Type: ${soundType}, Priority: ${priority}`);
    console.log(`🔍 Queue Debug Info:`, {
      isInitialized: this.isInitialized,
      isWebPlatform: this.isWebPlatform,
      soundEnabled: this.checkSoundEnabled(),
      queueLength: this.soundQueue.length,
      isProcessingQueue: this.isProcessingQueue
    });
    
    if (!this.isInitialized || this.isWebPlatform) {
      console.log(`🔇 ${soundType} sound SKIPPED - Not initialized or web platform`);
      return;
    }
    
    if (!this.checkSoundEnabled()) {
      console.log(`🔇 ${soundType} sound SKIPPED - Sound disabled in settings`);
      return;
    }
    
    const now = Date.now();
    const lastTime = this.lastSoundTimes[soundType] || 0;
    const minInterval = this.soundIntervals[soundType] || 100;
    
    // Check if enough time has passed since last sound of this type
    if (now - lastTime < minInterval) {
      console.log(`🔇 ${soundType} sound skipped - too soon (${now - lastTime}ms < ${minInterval}ms)`);
      return;
    }
    
    // Add to queue with priority
    const soundRequest = {
      type: soundType,
      priority: this.soundPriorities[soundType] || 1,
      timestamp: now,
      id: Math.random().toString(36).substr(2, 9)
    };
    
    this.soundQueue.push(soundRequest);
    
    // Sort queue by priority (highest first)
    this.soundQueue.sort((a, b) => b.priority - a.priority);
    
    console.log(`✅ ${soundType} sound queued successfully (priority: ${soundRequest.priority})`);
    console.log(`📊 Queue status after adding:`, {
      queueLength: this.soundQueue.length,
      isProcessingQueue: this.isProcessingQueue
    });
    
    // Process queue if not already processing
    if (!this.isProcessingQueue) {
      console.log('🔄 Starting queue processing...');
      this.processSoundQueue();
    }
  }
  
  async processSoundQueue() {
    if (this.isProcessingQueue || this.soundQueue.length === 0) {
      console.log('🔇 Queue processing skipped:', {
        isProcessingQueue: this.isProcessingQueue,
        queueLength: this.soundQueue.length
      });
      return;
    }
    
    this.isProcessingQueue = true;
    console.log('🔄 Processing sound queue...');
    
    while (this.soundQueue.length > 0) {
      const soundRequest = this.soundQueue.shift();
      const now = Date.now();
      
      console.log(`🎵 Processing sound: ${soundRequest.type} (priority: ${soundRequest.priority})`);
      
      // Check if enough time has passed
      const lastTime = this.lastSoundTimes[soundRequest.type] || 0;
      const minInterval = this.soundIntervals[soundRequest.type] || 100;
      
      if (now - lastTime < minInterval) {
        console.log(`⏳ ${soundRequest.type} sound delayed - too soon (${now - lastTime}ms < ${minInterval}ms)`);
        // Put it back in queue for later
        this.soundQueue.push(soundRequest);
        await new Promise(resolve => setTimeout(resolve, minInterval - (now - lastTime)));
        continue;
      }
      
      // Update last sound time
      this.lastSoundTimes[soundRequest.type] = now;
      
      // Play the sound
      try {
        console.log(`▶️ Attempting to play ${soundRequest.type} sound...`);
        await this.playSoundDirectly(soundRequest.type);
        console.log(`✅ Queued ${soundRequest.type} sound played successfully`);
      } catch (error) {
        console.warn(`❌ Failed to play queued ${soundRequest.type} sound:`, error);
      }
      
      // Small delay between sounds to prevent overlap
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    this.isProcessingQueue = false;
    console.log('✅ Queue processing complete');
  }
  
  async playSoundDirectly(soundType) {
    switch (soundType) {
      case 'merge':
        return this.playMergeSoundDirectly();
      case 'intermediateMerge':
        return this.playIntermediateMergeSoundDirectly();
      case 'drop':
        return this.playDropSoundDirectly();
      case 'gameOver':
        return this.playGameOverSoundDirectly();
      case 'pauseResume':
        return this.playPauseResumeSoundDirectly();
      default:
        throw new Error(`Unknown sound type: ${soundType}`);
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
        dropVolume: baseVolume * 0.9,
        gameOverVolume: baseVolume * 0.8
      });
      
      if (this.mergePlayer) this.mergePlayer.volume = baseVolume * 0.7;
      if (this.intermediateMergePlayer) this.intermediateMergePlayer.volume = baseVolume * 0.6;
      if (this.dropPlayer) {
        this.dropPlayer.volume = baseVolume * 0.9;
        console.log('🔊 Drop player volume set to:', this.dropPlayer.volume);
      }
      if (this.gameOverPlayer) this.gameOverPlayer.volume = baseVolume * 0.8;
    } catch (error) {
      console.warn('❌ SoundManager: Failed to update volume levels:', error);
    }
  }

  // Direct sound playing methods (without queuing)
  async playMergeSoundDirectly() {
    if (this.isWebPlatform || !this.mergePlayer) {
      return;
    }
    
    try {
      this.mergePlayer.seekTo(0);
      await this.mergePlayer.play();
    } catch (error) {
      console.warn('SoundManager: Failed to play merge sound:', error);
      throw error;
    }
  }

  async playIntermediateMergeSoundDirectly() {
    if (this.isWebPlatform || !this.intermediateMergePlayer) {
      return;
    }
    
    try {
      this.intermediateMergePlayer.seekTo(0);
      await this.intermediateMergePlayer.play();
    } catch (error) {
      console.warn('SoundManager: Failed to play intermediate merge sound:', error);
      throw error;
    }
  }

  async playDropSoundDirectly() {
    console.log('🎵 playDropSoundDirectly called - Debug Info:', {
      isWebPlatform: this.isWebPlatform,
      hasDropPlayer: !!this.dropPlayer,
      dropPlayerStatus: this.dropPlayer ? {
        volume: this.dropPlayer.volume,
        isPlaying: this.dropPlayer.isPlaying,
        status: this.dropPlayer.status,
        duration: this.dropPlayer.duration
      } : 'No drop player'
    });
    
    if (this.isWebPlatform || !this.dropPlayer) {
      console.log('🔇 Drop sound SKIPPED - Web platform or missing drop player');
      return;
    }
    
    try {
      console.log('🔄 Seeking drop sound to beginning...');
      this.dropPlayer.seekTo(0);
      
      console.log('▶️ Starting drop sound playback...');
      const playResult = await this.dropPlayer.play();
      console.log('📊 Drop sound play result:', playResult);
      
      // Check if play was successful
      if (playResult === undefined || playResult === null) {
        console.warn('⚠️ Drop sound play result is undefined - audio player may not be working correctly');
      }
      
      // Check if actually playing after a short delay
      setTimeout(() => {
        console.log('🔍 Post-drop-playback check:', {
          isPlaying: this.dropPlayer.isPlaying,
          status: this.dropPlayer.status,
          volume: this.dropPlayer.volume
        });
        
        // Only trigger fallback if we're certain the drop sound failed
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
      
      console.log('✅ Drop sound playback started successfully');
    } catch (error) {
      console.warn('❌ SoundManager: Failed to play drop sound:', error);
      
      // Only try fallback on actual errors, not undefined play results
      if (error && this.mergePlayer) {
        console.log('🔄 Trying merge sound as fallback due to error...');
        try {
          this.mergePlayer.seekTo(0);
          await this.mergePlayer.play();
          console.log('✅ Fallback merge sound played successfully');
        } catch (fallbackError) {
          console.warn('❌ Fallback merge sound also failed:', fallbackError);
        }
      }
      
      throw error;
    }
  }

  async playGameOverSoundDirectly() {
    if (this.isWebPlatform || !this.gameOverPlayer) {
      return;
    }
    
    try {
      this.gameOverPlayer.seekTo(0);
      await this.gameOverPlayer.play();
    } catch (error) {
      console.warn('SoundManager: Failed to play game over sound:', error);
      throw error;
    }
  }

  async playPauseResumeSoundDirectly() {
    if (this.isWebPlatform || !this.dropPlayer) {
      return;
    }
    
    try {
      this.dropPlayer.seekTo(0);
      await this.dropPlayer.play();
    } catch (error) {
      console.warn('SoundManager: Failed to play pause/resume sound:', error);
      throw error;
    }
  }

  // Public API methods (now use queuing)
  async playMergeSound() {
    await this.queueSound('merge');
  }

  async playIntermediateMergeSound() {
    await this.queueSound('intermediateMerge');
  }

  async playDropSound() {
    await this.queueSound('drop');
  }

  async playGameOverSound() {
    await this.queueSound('gameOver');
  }

  async playPauseResumeSound() {
    await this.queueSound('pauseResume');
  }

  // Legacy methods to maintain compatibility
  async loadMergeSound() {
    // No longer needed with expo-audio, players are created in initialize
  }

  async loadIntermediateMergeSound() {
    // No longer needed with expo-audio, players are created in initialize
  }

  async loadDropSound() {
    // No longer needed with expo-audio, players are created in initialize
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
      
      // Clear sound queue
      this.soundQueue = [];
      this.isProcessingQueue = false;
      
      // Reset all last sound times
      this.lastSoundTimes = {
        merge: 0,
        intermediateMerge: 0,
        drop: 0,
        gameOver: 0,
        pauseResume: 0
      };
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
    
    this.queueSound(soundType);
  }

  checkSoundEnabled() {
    const state = useGameStore.getState();
    return state.soundEnabled;
  }

  isReady() {
    return this.isInitialized && !this.isWebPlatform;
  }

  isAnySoundPlaying() {
    return this.isProcessingQueue || this.soundQueue.length > 0;
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
      queueLength: this.soundQueue.length,
      isProcessingQueue: this.isProcessingQueue,
      lastSoundTimes: this.lastSoundTimes,
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

  // Test queuing system
  async testQueuingSystem() {
    console.log('🧪 Testing sound queuing system...');
    
    // Test rapid sound requests
    for (let i = 0; i < 5; i++) {
      this.queueSound('drop');
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    console.log('📊 Queue status after rapid requests:', {
      queueLength: this.soundQueue.length,
      isProcessing: this.isProcessingQueue
    });
    
    // Wait for queue to process
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('📊 Final queue status:', {
      queueLength: this.soundQueue.length,
      isProcessing: this.isProcessingQueue
    });
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