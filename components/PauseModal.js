import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { vibrateOnButtonPress } from '../utils/vibration';
import useGameStore from '../store/gameStore';
import backgroundMusicManager from '../utils/backgroundMusicManager';
import comprehensiveGameAnalytics from '../utils/comprehensiveGameAnalytics';

const PauseModal = ({ visible, onResume, onHome, onClose, onRestart }) => {
  const { 
    vibrationEnabled, 
    soundEnabled, 
    backgroundMusicEnabled,
    toggleVibration, 
    toggleSound,
    toggleBackgroundMusic 
  } = useGameStore();

  // Local state for immediate visual feedback
  const [localMusicEnabled, setLocalMusicEnabled] = useState(backgroundMusicEnabled);
  const [localSoundEnabled, setLocalSoundEnabled] = useState(soundEnabled);
  const [localVibrationEnabled, setLocalVibrationEnabled] = useState(vibrationEnabled);

  // Press states for immediate visual feedback
  const [musicPressed, setMusicPressed] = useState(false);
  const [soundPressed, setSoundPressed] = useState(false);
  const [vibrationPressed, setVibrationPressed] = useState(false);

  // Sync local state with store state
  useEffect(() => {
    setLocalMusicEnabled(backgroundMusicEnabled);
  }, [backgroundMusicEnabled]);

  useEffect(() => {
    setLocalSoundEnabled(soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    setLocalVibrationEnabled(vibrationEnabled);
  }, [vibrationEnabled]);

  const handleButtonPress = (action) => {
    vibrateOnButtonPress();
    action();
  };

  const handleContinue = async () => {
    vibrateOnButtonPress();
    try {
      // Resume background music if it was enabled by syncing with store
      if (backgroundMusicEnabled) {
        await backgroundMusicManager.forceSyncWithStore();
      }
      // Call the original onResume function
      onResume();
    } catch (error) {
      console.warn('Failed to resume background music:', error);
      // Still continue the game even if music resume fails
      onResume();
    }
  };

  const handleBackgroundMusicToggle = async () => {
    vibrateOnButtonPress();
    
    // Store the current state before toggling for analytics
    const previousState = backgroundMusicEnabled;
    
    // Immediately update local state for instant visual feedback
    const newMusicState = !localMusicEnabled;
    setLocalMusicEnabled(newMusicState);
    
    try {
      // Toggle the state in the store
      const storeNewState = toggleBackgroundMusic();
      
      // Ensure local state matches store state
      if (storeNewState !== newMusicState) {
        setLocalMusicEnabled(storeNewState);
      }
      
      // Track audio setting change for analytics
      comprehensiveGameAnalytics.trackAudioSettingChange('backgroundMusic', previousState, storeNewState);
      
      // Force the music manager to sync with the new store state
      await backgroundMusicManager.forceSyncWithStore();
      
      // Track audio playback for analytics
      if (storeNewState) {
        comprehensiveGameAnalytics.trackAudioPlayback('play', 'background_music', true);
      } else {
        comprehensiveGameAnalytics.trackAudioPlayback('pause', 'background_music', true);
      }
      
    } catch (error) {
      console.warn('Failed to toggle background music:', error);
      // Track error for analytics
      comprehensiveGameAnalytics.trackError('background_music_toggle_failed', error.message);
      
      // Revert both local and store state if music control fails
      setLocalMusicEnabled(previousState);
      // Only revert store if it actually changed
      if (backgroundMusicEnabled !== previousState) {
        toggleBackgroundMusic(); // Toggle back to original state
      }
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>

          
          {/* Enhanced Space-themed Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>JOURNEY PAUSED</Text>
            <View style={styles.titleUnderline} />
          </View>
          
          {/* Toggle Buttons Row */}
          <View style={styles.toggleRowContainer}>
            <View style={styles.toggleRow}>
              {/* Background Music Toggle */}
              <Pressable
                style={[
                  styles.toggleButton,
                  musicPressed && styles.toggleButtonPressed
                ]}
                onPress={handleBackgroundMusicToggle}
                onPressIn={() => setMusicPressed(true)}
                onPressOut={() => setMusicPressed(false)}
              >
                <View style={[styles.toggleIconBackground, localMusicEnabled && styles.toggleIconBackgroundActive]}>
                  <FontAwesome name="music" size={22} color="#FFFFFF" />
                  {!localMusicEnabled && <View style={[styles.disabledLine, { opacity: localMusicEnabled ? 0 : 1 }]} />}
                </View>
              </Pressable>
              
              {/* Sound Effects Toggle */}
              <Pressable
                style={[
                  styles.toggleButton,
                  soundPressed && styles.toggleButtonPressed
                ]}
                onPress={() => {
                  handleButtonPress(() => {
                    // Immediately update local state for instant visual feedback
                    const newSoundState = !localSoundEnabled;
                    setLocalSoundEnabled(newSoundState);
                    
                    try {
                      // Track sound toggle for analytics
                      comprehensiveGameAnalytics.trackAudioSettingChange('sound', soundEnabled, newSoundState);
                      toggleSound();
                    } catch (error) {
                      console.warn('Failed to toggle sound:', error);
                      // Revert local state if toggle fails
                      setLocalSoundEnabled(!newSoundState);
                    }
                  });
                }}
                onPressIn={() => setSoundPressed(true)}
                onPressOut={() => setSoundPressed(false)}
              >
                <View style={[styles.toggleIconBackground, localSoundEnabled && styles.toggleIconBackgroundActive]}>
                  <AntDesign name="sound" size={22} color="#FFFFFF" />
                  {!localSoundEnabled && <View style={[styles.disabledLine, { opacity: localSoundEnabled ? 0 : 1 }]} />}
                </View>
              </Pressable>

              {/* Vibration Toggle */}
              <Pressable
                style={[
                  styles.toggleButton,
                  vibrationPressed && styles.toggleButtonPressed
                ]}
                onPress={() => {
                  handleButtonPress(() => {
                    // Immediately update local state for instant visual feedback
                    const newVibrationState = !localVibrationEnabled;
                    setLocalVibrationEnabled(newVibrationState);
                    
                    try {
                      // Track vibration toggle for analytics
                      comprehensiveGameAnalytics.trackAudioSettingChange('vibration', vibrationEnabled, newVibrationState);
                      toggleVibration();
                    } catch (error) {
                      console.warn('Failed to toggle vibration:', error);
                      // Revert local state if toggle fails
                      setLocalVibrationEnabled(!newVibrationState);
                    }
                  });
                }}
                onPressIn={() => setVibrationPressed(true)}
                onPressOut={() => setVibrationPressed(false)}
              >
                <View style={[styles.toggleIconBackground, localVibrationEnabled && styles.toggleIconBackgroundActive]}>
                  <MaterialIcons name="vibration" size={22} color="#FFFFFF" />
                  {!localVibrationEnabled && <View style={[styles.disabledLine, { opacity: localVibrationEnabled ? 0 : 1 }]} />}
                </View>
              </Pressable>
              

            </View>
          </View>
          
          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            {/* Large Resume Button */}
            <Pressable
              style={[styles.button, styles.primaryButton]}
              onPress={handleContinue}
            >
              <View style={styles.buttonGlow} />
              <Ionicons name="play" size={28} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.primaryButtonText}>Resume Journey</Text>
            </Pressable>
            
            {/* Small Secondary Buttons Container */}
            <View style={styles.smallButtonsContainer}>
              <Pressable
                style={[styles.button, styles.secondaryButton, styles.smallButton]}
                onPress={() => handleButtonPress(onRestart)}
              >
                <View style={styles.secondaryButtonGlow} />
                <MaterialCommunityIcons name="restart" size={16} color="#FFFFFF" style={styles.buttonIcon} />
                <Text style={styles.smallButtonText}>Restart</Text>
              </Pressable>
              
              <Pressable
                style={[styles.button, styles.tertiaryButton, styles.smallButton]}
                onPress={() => handleButtonPress(onHome)}
              >
                <Ionicons name="home" size={16} color="#B0C4DE" style={styles.buttonIcon} />
                <Text style={styles.smallButtonText}>Home</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    // Premium backdrop blur effect
    backdropFilter: 'blur(10px)',
  },
  
  modalContainer: {
    backgroundColor: 'rgba(16, 20, 36, 0.98)',
    borderRadius: 20,
    padding: 30,
    width: '90%',
    maxWidth: 400,
    borderWidth: 2,
    borderColor: 'rgba(74, 144, 226, 0.6)',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 25,
    elevation: 20,
    // Add premium gradient overlay
    position: 'relative',
    overflow: 'hidden',
  },
  
  titleContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 2,
    textShadowColor: '#4A90E2',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  
  titleUnderline: {
    width: '60%',
    height: 2,
    backgroundColor: '#4A90E2',
    borderRadius: 1,
    marginTop: 8,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 5,
  },
  

  

  

  
  toggleRowContainer: {
    backgroundColor: 'rgba(16, 20, 36, 0.3)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 30,
    borderWidth: 1.5,
    borderColor: 'rgba(74, 144, 226, 0.3)',
    // Premium metallic container effect
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  
  toggleButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
    backgroundColor: 'transparent',
    borderRadius: 24,
    borderWidth: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    // Add press effect
    transform: [{ scale: 1 }],
    // Smooth transitions for all properties
    transition: 'all 0.15s ease',
    // Enhanced press feedback
    activeOpacity: 0.7,
  },
  
  toggleButtonPressed: {
    transform: [{ scale: 0.95 }], // Slightly smaller when pressed
    opacity: 0.8, // Slightly transparent when pressed
  },

  toggleIconBackground: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(16, 20, 36, 0.95)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    // Premium metallic border effect
    borderWidth: 2,
    borderColor: 'rgba(74, 144, 226, 0.7)',
    // Enhanced metallic shadows for premium look
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
    // Metallic gradient overlay effect
    overflow: 'hidden',
    // Add subtle metallic texture
    backgroundImage: 'linear-gradient(135deg, rgba(74, 144, 226, 0.1) 0%, rgba(16, 20, 36, 0.95) 50%, rgba(74, 144, 226, 0.05) 100%)',
    // Inner metallic glow
    boxShadow: 'inset 0 1px 3px rgba(255, 255, 255, 0.1), inset 0 -1px 3px rgba(0, 0, 0, 0.3)',
  },
  
  disabledLine: {
    position: 'absolute',
    width: 28,
    height: 2.5,
    backgroundColor: '#FF4444',
    borderRadius: 1.25,
    transform: [{ rotate: '45deg' }],
    shadowColor: '#FF4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 2,
    // Premium disabled indicator
    borderWidth: 0.5,
    borderColor: 'rgba(255, 68, 68, 0.8)',
    // Smooth transitions
    transition: 'opacity 0.15s ease',
  },
  
  buttonContainer: {
    gap: 16,
    marginBottom: 20,
  },
  
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  
  primaryButton: {
    backgroundColor: 'rgba(74, 144, 226, 0.3)',
    borderWidth: 3,
    borderColor: 'rgba(74, 144, 226, 0.8)',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 12,
    paddingVertical: 20,
    paddingHorizontal: 30,
    marginBottom: 20,
  },
  
  secondaryButton: {
    backgroundColor: 'rgba(155, 89, 182, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(155, 89, 182, 0.6)',
    shadowColor: '#9B59B6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  
  tertiaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  
  buttonGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    borderRadius: 12,
  },
  
  secondaryButtonGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(155, 89, 182, 0.1)',
    borderRadius: 12,
  },
  
  buttonIcon: {
    marginRight: 8,
  },
  
  primaryButtonText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(74, 144, 226, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 1,
    textShadowColor: 'rgba(155, 89, 182, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  
  tertiaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#B0C4DE',
    letterSpacing: 1,
  },

  smallButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },

  smallButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },

  smallButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B0C4DE',
    letterSpacing: 0.5,
  },
  

  
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  
  footerLink: {
    fontSize: 14,
    color: '#B0C4DE',
    fontWeight: '600',
    textDecorationLine: 'none',
    letterSpacing: 0.5,
    // Premium text effect
    textShadowColor: 'rgba(176, 196, 222, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  


  toggleIconBackgroundActive: {
    borderColor: 'rgba(74, 144, 226, 1)',
    backgroundColor: 'rgba(74, 144, 226, 0.15)',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
    elevation: 12,
    // Enhanced metallic glow effect
    borderWidth: 2.5,
  },

});

export default PauseModal; 