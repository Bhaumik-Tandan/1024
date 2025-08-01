import { Audio } from 'expo-av';

class SoundManager {
  constructor() {
    this.soundEnabled = true;
    this.soundVolume = 0.7;
    this.dropSound = null;
    this.mergeSound = null;
    this.intermediateMergeSound = null;
    
    // Load sounds on initialization
    this.loadSounds();
  }

  async loadSounds() {
    try {
      // Configure audio mode with minimal settings to avoid iOS errors
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (audioConfigError) {
      // Audio configuration error
      // Continue without audio mode configuration
    }

    // Load drop sound
    try {
      const { sound: dropSound } = await Audio.Sound.createAsync(
        require('../assets/drop.wav'),
        { shouldPlay: false, volume: this.soundVolume }
      );
      this.dropSound = dropSound;
    } catch (error) {
      // Drop sound loading error
    }

    // Load merge sound
    try {
      const { sound: mergeSound } = await Audio.Sound.createAsync(
        require('../assets/mergeSound.wav'),
        { shouldPlay: false, volume: this.soundVolume }
      );
      this.mergeSound = mergeSound;
    } catch (error) {
      // Merge sound loading error
    }

    // Load intermediate merge sound
    try {
      const { sound: intermediateMergeSound } = await Audio.Sound.createAsync(
        require('../assets/intermediateMerge.wav'),
        { shouldPlay: false, volume: this.soundVolume }
      );
      this.intermediateMergeSound = intermediateMergeSound;
    } catch (error) {
      // Intermediate merge sound loading error
    }
  }

  async playDropSound() {
    if (!this.soundEnabled) return;
    
    try {
      if (this.dropSound) {
        await this.dropSound.replayAsync();
      }
    } catch (error) {
      // Drop sound play error
    }
  }

  async playMergeSound() {
    if (!this.soundEnabled) return;
    
    try {
      if (this.mergeSound) {
        await this.mergeSound.replayAsync();
      }
    } catch (error) {
      // Merge sound play error
    }
  }

  async playIntermediateMergeSound() {
    if (!this.soundEnabled) return;
    
    try {
      if (this.intermediateMergeSound) {
        await this.intermediateMergeSound.replayAsync();
      }
    } catch (error) {
      // Intermediate merge sound play error
    }
  }

  // Note: Mars sound functionality removed as requested

  setSoundEnabled(enabled) {
    this.soundEnabled = enabled;
  }

  setSoundVolume(volume) {
    this.soundVolume = Math.max(0, Math.min(1, volume));
    
    // Update volume for all loaded sounds with error handling
    try {
      if (this.dropSound) {
        this.dropSound.setVolumeAsync(this.soundVolume);
      }
    } catch (error) {
      // Drop sound volume error
    }
    
    try {
      if (this.mergeSound) {
        this.mergeSound.setVolumeAsync(this.soundVolume);
      }
    } catch (error) {
      // Merge sound volume error
    }
    
    try {
      if (this.intermediateMergeSound) {
        this.intermediateMergeSound.setVolumeAsync(this.soundVolume);
      }
    } catch (error) {
      // Intermediate merge sound volume error
    }
  }

  async cleanup() {
    try {
      if (this.dropSound) {
        await this.dropSound.unloadAsync();
      }
    } catch (error) {
      // Drop sound cleanup error
    }
    
    try {
      if (this.mergeSound) {
        await this.mergeSound.unloadAsync();
      }
    } catch (error) {
      // Merge sound cleanup error
    }
    
    try {
      if (this.intermediateMergeSound) {
        await this.intermediateMergeSound.unloadAsync();
      }
    } catch (error) {
      // Intermediate merge sound cleanup error
    }
  }
}

// Create and export singleton instance
const soundManager = new SoundManager();
export default soundManager; 