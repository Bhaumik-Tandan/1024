import { Audio } from 'expo-av';
import useGameStore from '../store/gameStore';

class SoundManager {
  constructor() {
    this.mergeSound = null;
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
      
      // Load the merge sound
      await this.loadMergeSound();
      
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

  async updateVolume(volume) {
    try {
      if (this.mergeSound) {
        await this.mergeSound.setVolumeAsync(volume);
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
      this.isInitialized = false;
    } catch (error) {
      // Failed to cleanup sound manager
    }
  }
}

export default new SoundManager(); 