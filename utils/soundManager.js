import { Audio } from 'expo-av';
import { Platform } from 'react-native';
import useGameStore from '../store/gameStore';

class SoundManager {
  constructor() {
    this.mergeSound = null;
    this.intermediateMergeSound = null;
    this.dropSound = null;
    this.isInitialized = false;
  }

  async initialize() {
    try {
      // Request audio permissions
      const { status } = await Audio.requestPermissionsAsync();
      
      if (status !== 'granted') {
        // Audio permissions not granted
        return;
      }
      
      // Simplified iOS audio mode configuration with only valid options
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      
      // Load sounds
      await this.loadMergeSound();
      await this.loadIntermediateMergeSound();
      await this.loadDropSound();
      
      this.isInitialized = true;
      // Sound manager initialized successfully
    } catch (error) {
      // Failed to initialize sound manager
    }
  }

  async loadMergeSound() {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/mergeSound.wav'),
        { 
          shouldPlay: false,
          volume: 0.7,
          isLooping: false,
        }
      );
      
      this.mergeSound = sound;
    } catch (error) {
      // Failed to load merge sound
    }
  }

  async loadIntermediateMergeSound() {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/intermediateMerge.wav'),
        { 
          shouldPlay: false,
          volume: 0.6,
          isLooping: false,
        }
      );
      
      this.intermediateMergeSound = sound;
    } catch (error) {
      // Failed to load intermediate merge sound
    }
  }

  async loadDropSound() {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/drop.wav'),
        { 
          shouldPlay: false,
          volume: 0.5,
          isLooping: false,
        }
      );
      
      this.dropSound = sound;
    } catch (error) {
      // Failed to load drop sound
    }
  }

  async playMergeSound() {
    try {
      const { soundEnabled, soundVolume } = useGameStore.getState();
      
      if (!soundEnabled || !this.mergeSound || !this.isInitialized) {
        return;
      }
      
      // Ensure sound is in playable state
      const status = await this.mergeSound.getStatusAsync();
      if (!status.isLoaded) {
        // Merge sound not loaded
        return;
      }
      
      // Update volume and play
      await this.mergeSound.setVolumeAsync(soundVolume);
      await this.mergeSound.replayAsync();
    } catch (error) {
      // Failed to play merge sound
    }
  }

  async playIntermediateMergeSound() {
    try {
      const { soundEnabled, soundVolume } = useGameStore.getState();
      
      if (!soundEnabled || !this.intermediateMergeSound || !this.isInitialized) {
        return;
      }
      
      const status = await this.intermediateMergeSound.getStatusAsync();
      if (!status.isLoaded) {
        // Intermediate merge sound not loaded
        return;
      }
      
      await this.intermediateMergeSound.setVolumeAsync(soundVolume * 0.85);
      await this.intermediateMergeSound.replayAsync();
    } catch (error) {
      // Failed to play intermediate merge sound
    }
  }

  async playDropSound() {
    try {
      const { soundEnabled, soundVolume } = useGameStore.getState();
      
      if (!soundEnabled || !this.dropSound || !this.isInitialized) {
        return;
      }
      
      const status = await this.dropSound.getStatusAsync();
      if (!status.isLoaded) {
        console.warn('Drop sound not loaded');
        return;
      }
      
      await this.dropSound.setVolumeAsync(soundVolume * 0.7);
      await this.dropSound.replayAsync();
    } catch (error) {
      console.error('Failed to play drop sound:', error);
    }
  }

  async updateVolume(volume) {
    try {
      if (this.mergeSound) {
        await this.mergeSound.setVolumeAsync(volume);
      }
      if (this.intermediateMergeSound) {
        await this.intermediateMergeSound.setVolumeAsync(volume * 0.85);
      }
      if (this.dropSound) {
        await this.dropSound.setVolumeAsync(volume * 0.7);
      }
    } catch (error) {
      console.error('Failed to update sound volume:', error);
    }
  }

  async cleanup() {
    try {
      if (this.mergeSound) {
        await this.mergeSound.unloadAsync();
        this.mergeSound = null;
      }
      if (this.intermediateMergeSound) {
        await this.intermediateMergeSound.unloadAsync();
        this.intermediateMergeSound = null;
      }
      if (this.dropSound) {
        await this.dropSound.unloadAsync();
        this.dropSound = null;
      }
      this.isInitialized = false;
    } catch (error) {
      console.error('Failed to cleanup sound manager:', error);
    }
  }
}

export default new SoundManager(); 