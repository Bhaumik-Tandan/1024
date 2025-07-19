import { Audio } from 'expo-av';
import useGameStore from '../store/gameStore';

class SoundManager {
  constructor() {
    this.mergeSound = null;
    this.dropSound = null;
    this.isInitialized = false;
  }

  async initialize() {
    try {
      // Request audio permissions
      await Audio.requestPermissionsAsync();
      
      // Set audio mode for better performance
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      
      // Load sounds
      await this.loadMergeSound();
      await this.loadDropSound();
      
      this.isInitialized = true;
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
      
      if (!soundEnabled || !this.mergeSound) {
        return;
      }
      
      // Update volume if needed
      await this.mergeSound.setVolumeAsync(soundVolume);
      
      // Play the sound
      await this.mergeSound.replayAsync();
    } catch (error) {
      // Failed to play merge sound
    }
  }

  async playDropSound() {
    try {
      const { soundEnabled, soundVolume } = useGameStore.getState();
      
      if (!soundEnabled || !this.dropSound) {
        return;
      }
      
      // Update volume if needed (slightly lower volume for drop sound)
      await this.dropSound.setVolumeAsync(soundVolume * 0.7);
      
      // Play the sound
      await this.dropSound.replayAsync();
    } catch (error) {
      // Failed to play drop sound
    }
  }

  async updateVolume(volume) {
    try {
      if (this.mergeSound) {
        await this.mergeSound.setVolumeAsync(volume);
      }
      if (this.dropSound) {
        await this.dropSound.setVolumeAsync(volume * 0.7);
      }
    } catch (error) {
      // Failed to update sound volume
    }
  }

  async cleanup() {
    try {
      if (this.mergeSound) {
        await this.mergeSound.unloadAsync();
        this.mergeSound = null;
      }
      if (this.dropSound) {
        await this.dropSound.unloadAsync();
        this.dropSound = null;
      }
      this.isInitialized = false;
    } catch (error) {
      // Failed to cleanup sound manager
    }
  }
}

export default new SoundManager(); 