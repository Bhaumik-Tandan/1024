import React from 'react';
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

const PauseModal = ({ visible, onResume, onHome, onClose, onRestart }) => {
  const { 
    vibrationEnabled, 
    soundEnabled, 
    backgroundMusicEnabled,
    toggleVibration, 
    toggleSound,
    toggleBackgroundMusic 
  } = useGameStore();

  const handleButtonPress = (action) => {
    vibrateOnButtonPress();
    action();
  };

  const handleContinue = async () => {
    vibrateOnButtonPress();
    try {
      // Resume background music if it was enabled
      if (backgroundMusicEnabled) {
        await backgroundMusicManager.play();
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
    try {
      if (backgroundMusicEnabled) {
        // Music is currently enabled, so pause it
        await backgroundMusicManager.pause();
      } else {
        // Music is currently disabled, so play it
        await backgroundMusicManager.play();
      }
      // Toggle the state in the store
      toggleBackgroundMusic();
    } catch (error) {
      console.warn('Failed to toggle background music:', error);
      // Still toggle the state even if the music control fails
      toggleBackgroundMusic();
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
          <View style={styles.toggleRow}>
              {/* Background Music Toggle */}
              <Pressable
                style={styles.toggleButton}
                onPress={handleBackgroundMusicToggle}
              >
                <View style={styles.toggleIconBackground}>
                  <FontAwesome name="music" size={28} color="#FFFFFF" />
                  {!backgroundMusicEnabled && <View style={styles.disabledLine} />}
                </View>
              </Pressable>
              
              {/* Sound Effects Toggle */}
              <Pressable
                style={styles.toggleButton}
                onPress={() => handleButtonPress(toggleSound)}
              >
                <View style={styles.toggleIconBackground}>
                  <AntDesign name="sound" size={28} color="#FFFFFF" />
                  {!soundEnabled && <View style={styles.disabledLine} />}
                </View>
              </Pressable>

              {/* Vibration Toggle */}
              <Pressable
                style={styles.toggleButton}
                onPress={() => handleButtonPress(toggleVibration)}
              >
                <View style={styles.toggleIconBackground}>
                  <MaterialIcons name="vibration" size={28} color="#FFFFFF" />
                  {!vibrationEnabled && <View style={styles.disabledLine} />}
                </View>
              </Pressable>
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
  

  

  
  toggleButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    backgroundColor: 'transparent',
    borderRadius: 24,
    borderWidth: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  
  toggleIconBackground: {
    width: 56,
    height: 56,
    backgroundColor: '#1a365d',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    gap: 32,
  },
  
  toggleButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    backgroundColor: 'transparent',
    borderRadius: 32,
    borderWidth: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  
  toggleIconBackground: {
    width: 64,
    height: 64,
    backgroundColor: '#1a365d',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    // Premium border effect
    borderWidth: 2,
    borderColor: 'rgba(74, 144, 226, 0.6)',
    // Enhanced shadows for premium look
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  
  disabledLine: {
    position: 'absolute',
    width: 34,
    height: 3,
    backgroundColor: '#FF4444',
    borderRadius: 1.5,
    transform: [{ rotate: '45deg' }],
    shadowColor: '#FF4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 2,
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
  
  buttonGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    shadowColor: 'rgba(255, 255, 255, 0.3)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 5,
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
  

});

export default PauseModal; 