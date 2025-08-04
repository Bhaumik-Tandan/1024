/**
 * OPTIMIZED SOUND MANAGER
 * 
 * This is an optimized version of the sound manager that implements
 * the recommendations from the sound timing audit:
 * 
 * 1. Optimized chain reaction sound timing
 * 2. Sound cancellation for rapid interactions
 * 3. Reduced queue processing delays
 * 4. Sound completion timeouts
 * 5. Better prioritization for chain reactions
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

class OptimizedSoundManager {
  constructor() {
    this.mergePlayer = null;
    this.intermediateMergePlayer = null;
    this.dropPlayer = null;
    this.gameOverPlayer = null;
    this.isInitialized = false;
    this.isWebPlatform = Platform.OS === 'web';
    
    // Enhanced sound queuing system with optimizations
    this.soundQueue = [];
    this.isProcessingQueue = false;
    this.lastSoundTimes = {
      merge: 0,
      intermediateMerge: 0,
      drop: 0,
      gameOver: 0,
      pauseResume: 0
    };
    
    // Sound completion tracking with timeouts
    this.activeSounds = new Set();
    this.soundCompletionPromises = new Map();
    this.soundTimeouts = new Map();
    
    // OPTIMIZATION 1: Reduced intervals for better responsiveness
    this.soundIntervals = {
      merge: 150,           // Reduced from 180ms
      intermediateMerge: 80, // Reduced from 120ms for chain reactions
      drop: 60,             // Reduced from 80ms
      gameOver: 3000,       // Unchanged
      pauseResume: 100      // Reduced from 150ms
    };
    
    // OPTIMIZATION 2: Enhanced priority system for chain reactions
    this.soundPriorities = {
      gameOver: 5,          // Highest priority
      merge: 3,             // Medium priority
      intermediateMerge: 4,  // Higher priority for chain reactions
      drop: 1,              // Lowest priority
      pauseResume: 1        // Same as drop
    };
    
    // OPTIMIZATION 3: Sound cancellation tracking
    this.cancelledSounds = new Set();
    this.lastDropTime = 0;
    
    // OPTIMIZATION 4: Chain reaction detection
    this.chainReactionActive = false;
    this.chainReactionCount = 0;
  }

  async initialize() {
    console.log('🔧 OptimizedSoundManager: Starting initialization...');
    
    if (this.isWebPlatform) {
      this.isInitialized = true;
      console.log('✅ OptimizedSoundManager: Initialized for web platform (audio disabled)');
      return;
    }

    try {
      await setAudioModeAsync({
        allowsRecording: false,
        shouldPlayInBackground: false,
        playsInSilentMode: true,
        shouldDuckAndroid: true,
        shouldRouteThroughEarpiece: false,
      });
      
      this.createAudioPlayers();
      this.isInitialized = true;
      console.log('✅ OptimizedSoundManager: Audio initialization completed');
    } catch (error) {
      console.warn('❌ OptimizedSoundManager: Failed to initialize audio system:', error);
      this.isInitialized = false;
    }
  }

  // OPTIMIZATION 1: Enhanced sound queuing with chain reaction support
  async queueSound(soundType, priority = 1, isChainReaction = false) {
    if (!this.isInitialized || this.isWebPlatform) {
      return;
    }

    // OPTIMIZATION 3: Sound cancellation for rapid interactions
    if (soundType === 'drop') {
      const now = Date.now();
      if (now - this.lastDropTime < 100) { // 100ms threshold for rapid drops
        console.log('🔄 Cancelling previous drop sound due to rapid interaction');
        this.cancelPreviousSounds('drop');
      }
      this.lastDropTime = now;
    }

    // OPTIMIZATION 2: Enhanced priority for chain reactions
    let finalPriority = priority;
    if (isChainReaction && soundType === 'intermediateMerge') {
      finalPriority = this.soundPriorities.intermediateMerge;
    }

    // Check if enough time has passed since last sound of this type
    const now = Date.now();
    const lastTime = this.lastSoundTimes[soundType] || 0;
    const interval = this.soundIntervals[soundType] || 100;
    
    if (now - lastTime < interval) {
      console.log(`⏰ ${soundType} sound SKIPPED - Too soon since last sound`);
      return;
    }

    // Add to queue with enhanced priority
    const soundRequest = {
      type: soundType,
      priority: finalPriority,
      timestamp: now,
      isChainReaction,
      id: `${soundType}-${now}-${Math.random().toString(36).substr(2, 9)}`
    };

    this.soundQueue.push(soundRequest);
    this.soundQueue.sort((a, b) => b.priority - a.priority);

    if (!this.isProcessingQueue) {
      this.processSoundQueue();
    }
  }

  // OPTIMIZATION 3: Sound cancellation system
  cancelPreviousSounds(soundType) {
    // Remove sounds of this type from queue
    this.soundQueue = this.soundQueue.filter(sound => sound.type !== soundType);
    
    // Mark as cancelled for active sounds
    this.cancelledSounds.add(soundType);
    
    // Clear timeout for this sound type
    const timeout = this.soundTimeouts.get(soundType);
    if (timeout) {
      clearTimeout(timeout);
      this.soundTimeouts.delete(soundType);
    }
    
    console.log(`🚫 Cancelled previous ${soundType} sounds`);
  }

  // OPTIMIZATION 4: Enhanced sound completion waiting with timeout
  async waitForSoundCompletion(soundType, timeoutMs = 500) {
    if (this.activeSounds.has(soundType)) {
      const completionPromise = this.soundCompletionPromises.get(soundType);
      if (completionPromise) {
        try {
          await Promise.race([
            completionPromise,
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Sound completion timeout')), timeoutMs)
            )
          ]);
        } catch (error) {
          console.warn(`⏰ Sound completion timeout for ${soundType}:`, error.message);
          // Clean up the hanging promise
          this.activeSounds.delete(soundType);
          this.soundCompletionPromises.delete(soundType);
        }
      }
    }
  }

  // OPTIMIZATION 5: Chain reaction aware sound waiting
  async waitForChainReactionSounds(isChainReaction = false) {
    if (isChainReaction) {
      // For chain reactions, don't wait for intermediate sounds to complete
      // This prevents delays in chain reaction processing
      console.log('⚡ Chain reaction detected - skipping sound completion wait');
      return;
    }
    
    // For single merges, wait for sounds to complete
    await this.waitForAllSoundsToComplete();
  }

  async waitForAllSoundsToComplete() {
    if (this.activeSounds.size > 0) {
      const promises = Array.from(this.activeSounds).map(soundType => 
        this.soundCompletionPromises.get(soundType)
      ).filter(Boolean);
      
      if (promises.length > 0) {
        try {
          await Promise.race([
            Promise.all(promises),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('All sounds completion timeout')), 1000)
            )
          ]);
        } catch (error) {
          console.warn('⏰ All sounds completion timeout:', error.message);
          // Clean up hanging promises
          this.activeSounds.clear();
          this.soundCompletionPromises.clear();
        }
      }
    }
  }
  
  // OPTIMIZATION 6: Enhanced queue processing with reduced delays
  async processSoundQueue() {
    if (this.isProcessingQueue || this.soundQueue.length === 0) {
      return;
    }
    
    this.isProcessingQueue = true;
    
    while (this.soundQueue.length > 0) {
      const soundRequest = this.soundQueue.shift();
      const now = Date.now();
      
      // Check if sound was cancelled
      if (this.cancelledSounds.has(soundRequest.type)) {
        this.cancelledSounds.delete(soundRequest.type);
        continue;
      }
      
      // Check if enough time has passed
      const lastTime = this.lastSoundTimes[soundRequest.type] || 0;
      const minInterval = this.soundIntervals[soundRequest.type] || 100;
      
      if (now - lastTime < minInterval) {
        // Put it back in queue for later
        this.soundQueue.push(soundRequest);
        await new Promise(resolve => setTimeout(resolve, minInterval - (now - lastTime)));
        continue;
      }
      
      // Update last sound time
      this.lastSoundTimes[soundRequest.type] = now;
      
      // Play the sound
      try {
        await this.playSoundDirectly(soundRequest.type);
      } catch (error) {
        console.warn(`❌ Failed to play queued ${soundRequest.type} sound:`, error);
      }
      
      // OPTIMIZATION 7: Reduced delay between sounds for chain reactions
      const delay = soundRequest.isChainReaction ? 20 : 30; // Reduced from 50ms
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    this.isProcessingQueue = false;
  }
  
  async playSoundDirectly(soundType) {
    // Track sound completion with timeout
    this.activeSounds.add(soundType);
    
    const completionPromise = new Promise((resolve) => {
      const timeout = setTimeout(() => {
        this.activeSounds.delete(soundType);
        this.soundCompletionPromises.delete(soundType);
        this.soundTimeouts.delete(soundType);
        resolve();
      }, this.getSoundDuration(soundType));
      
      this.soundCompletionPromises.set(soundType, completionPromise);
      this.soundTimeouts.set(soundType, timeout);
    });

    try {
      switch (soundType) {
        case 'merge':
          return await this.playMergeSoundDirectly();
        case 'intermediateMerge':
          return await this.playIntermediateMergeSoundDirectly();
        case 'drop':
          return await this.playDropSoundDirectly();
        case 'gameOver':
          return await this.playGameOverSoundDirectly();
        case 'pauseResume':
          return await this.playPauseResumeSoundDirectly();
        default:
          throw new Error(`Unknown sound type: ${soundType}`);
      }
    } finally {
      // Clean up after sound completes
      setTimeout(() => {
        this.activeSounds.delete(soundType);
        this.soundCompletionPromises.delete(soundType);
        this.soundTimeouts.delete(soundType);
      }, this.getSoundDuration(soundType));
    }
  }

  getSoundDuration(soundType) {
    switch (soundType) {
      case 'merge':
        return 300;
      case 'intermediateMerge':
        return 200;
      case 'drop':
        return 150;
      case 'gameOver':
        return 2000;
      case 'pauseResume':
        return 100;
      default:
        return 200;
    }
  }

  createAudioPlayers() {
    if (this.isWebPlatform || !createAudioPlayer) {
      return;
    }
    
    try {
      this.mergePlayer = createAudioPlayer(require('../assets/audio/mergeSound.wav'));
      this.intermediateMergePlayer = createAudioPlayer(require('../assets/audio/intermediateMerge.wav'));
      this.dropPlayer = createAudioPlayer(require('../assets/audio/drop.wav'));
      this.gameOverPlayer = createAudioPlayer(require('../assets/audio/gameOver.wav'));
      
      const { soundVolume } = useGameStore.getState();
      this.updateVolumeLevels(soundVolume);
      
      console.log('✅ OptimizedSoundManager: Audio players created successfully');
    } catch (error) {
      console.warn('❌ OptimizedSoundManager: Failed to create audio players:', error);
    }
  }

  updateVolumeLevels(volume) {
    if (this.isWebPlatform) return;
    
    try {
      const baseVolume = Math.max(0, Math.min(1, volume || 0.7));
      
      if (this.mergePlayer) this.mergePlayer.volume = baseVolume * 0.7;
      if (this.intermediateMergePlayer) this.intermediateMergePlayer.volume = baseVolume * 0.6;
      if (this.dropPlayer) this.dropPlayer.volume = baseVolume * 0.9;
      if (this.gameOverPlayer) this.gameOverPlayer.volume = baseVolume * 0.8;
    } catch (error) {
      console.warn('❌ OptimizedSoundManager: Failed to update volume levels:', error);
    }
  }

  // Direct sound playing methods
  async playMergeSoundDirectly() {
    if (this.isWebPlatform || !this.mergePlayer) return;
    
    try {
      this.mergePlayer.seekTo(0);
      await this.mergePlayer.play();
    } catch (error) {
      console.warn('OptimizedSoundManager: Failed to play merge sound:', error);
      throw error;
    }
  }

  async playIntermediateMergeSoundDirectly() {
    if (this.isWebPlatform || !this.intermediateMergePlayer) return;
    
    try {
      this.intermediateMergePlayer.seekTo(0);
      await this.intermediateMergePlayer.play();
    } catch (error) {
      console.warn('OptimizedSoundManager: Failed to play intermediate merge sound:', error);
      throw error;
    }
  }

  async playDropSoundDirectly() {
    if (this.isWebPlatform || !this.dropPlayer) return;
    
    try {
      this.dropPlayer.seekTo(0);
      await this.dropPlayer.play();
    } catch (error) {
      console.warn('OptimizedSoundManager: Failed to play drop sound:', error);
      throw error;
    }
  }

  async playGameOverSoundDirectly() {
    if (this.isWebPlatform || !this.gameOverPlayer) return;
    
    try {
      this.gameOverPlayer.seekTo(0);
      await this.gameOverPlayer.play();
    } catch (error) {
      console.warn('OptimizedSoundManager: Failed to play game over sound:', error);
      throw error;
    }
  }

  async playPauseResumeSoundDirectly() {
    if (this.isWebPlatform || !this.dropPlayer) return;
    
    try {
      this.dropPlayer.seekTo(0);
      await this.dropPlayer.play();
    } catch (error) {
      console.warn('OptimizedSoundManager: Failed to play pause/resume sound:', error);
      throw error;
    }
  }

  // Public API methods with chain reaction support
  async playMergeSound(isChainReaction = false) {
    await this.queueSound('merge', this.soundPriorities.merge, isChainReaction);
  }

  async playIntermediateMergeSound(isChainReaction = true) {
    await this.queueSound('intermediateMerge', this.soundPriorities.intermediateMerge, isChainReaction);
  }

  async playDropSound() {
    await this.queueSound('drop', this.soundPriorities.drop, false);
  }

  async playGameOverSound() {
    await this.queueSound('gameOver', this.soundPriorities.gameOver, false);
  }

  async playPauseResumeSound() {
    await this.queueSound('pauseResume', this.soundPriorities.pauseResume, false);
  }

  async stopAllSounds() {
    if (this.isWebPlatform) return;
    
    try {
      if (this.mergePlayer) this.mergePlayer.pause();
      if (this.intermediateMergePlayer) this.intermediateMergePlayer.pause();
      if (this.dropPlayer) this.dropPlayer.pause();
      if (this.gameOverPlayer) this.gameOverPlayer.pause();
      
      // Clear sound queue and tracking
      this.soundQueue = [];
      this.isProcessingQueue = false;
      this.activeSounds.clear();
      this.soundCompletionPromises.clear();
      this.cancelledSounds.clear();
      
      // Clear all timeouts
      for (const timeout of this.soundTimeouts.values()) {
        clearTimeout(timeout);
      }
      this.soundTimeouts.clear();
      
      // Reset all last sound times
      this.lastSoundTimes = {
        merge: 0,
        intermediateMerge: 0,
        drop: 0,
        gameOver: 0,
        pauseResume: 0
      };
    } catch (error) {
      console.warn('OptimizedSoundManager: Failed to stop sounds:', error);
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
      console.warn('OptimizedSoundManager: Failed to unload sounds:', error);
    }
  }

  async setVolume(volume) {
    if (this.isWebPlatform) return;
    
    try {
      this.updateVolumeLevels(volume);
    } catch (error) {
      console.warn('OptimizedSoundManager: Failed to set volume:', error);
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
    return this.isProcessingQueue || this.soundQueue.length > 0 || this.activeSounds.size > 0;
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
      activeSoundsCount: this.activeSounds.size,
      cancelledSoundsCount: this.cancelledSounds.size,
      lastSoundTimes: this.lastSoundTimes,
      volume: useGameStore.getState().soundVolume,
    };
  }

  // OPTIMIZATION 8: Chain reaction state management
  setChainReactionState(isActive, count = 0) {
    this.chainReactionActive = isActive;
    this.chainReactionCount = count;
  }

  isChainReactionActive() {
    return this.chainReactionActive;
  }

  getChainReactionCount() {
    return this.chainReactionCount;
  }

  // OPTIMIZATION 9: Performance monitoring
  getPerformanceMetrics() {
    return {
      queueLength: this.soundQueue.length,
      activeSounds: this.activeSounds.size,
      cancelledSounds: this.cancelledSounds.size,
      chainReactionActive: this.chainReactionActive,
      chainReactionCount: this.chainReactionCount,
      lastSoundTimes: this.lastSoundTimes,
    };
  }
}

const optimizedSoundManager = new OptimizedSoundManager();
export default optimizedSoundManager; 