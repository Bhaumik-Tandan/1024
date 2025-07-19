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
      console.log('Sound manager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize sound manager:', error);
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
      console.log('Merge sound loaded successfully');
    } catch (error) {
      console.error('Failed to load merge sound:', error);
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
      console.log('Playing merge sound');
    } catch (error) {
      console.error('Failed to play merge sound:', error);
    }
  }

  async updateVolume(volume) {
    try {
      if (this.mergeSound) {
        await this.mergeSound.setVolumeAsync(volume);
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
      this.isInitialized = false;
      console.log('Sound manager cleaned up successfully');
    } catch (error) {
      console.error('Failed to cleanup sound manager:', error);
    }
  }
}

export default new SoundManager(); 