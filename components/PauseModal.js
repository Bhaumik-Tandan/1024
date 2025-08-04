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
import { vibrateOnButtonPress } from '../utils/vibration';
import useGameStore from '../store/gameStore';

const PauseModal = ({ visible, onResume, onHome, onClose, onRestart }) => {
  const { vibrationEnabled, soundEnabled, toggleVibration, toggleSound } = useGameStore();

  const handleButtonPress = (action) => {
    vibrateOnButtonPress();
    action();
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
          
          {/* Settings Section */}
          <View style={styles.settingsSection}>
            <Text style={styles.settingsTitle}>Ship Systems</Text>
            
            {/* Vibration Toggle */}
            <Pressable
              style={[styles.settingItem, vibrationEnabled && styles.settingItemActive]}
              onPress={() => handleButtonPress(toggleVibration)}
            >
              <View style={styles.settingLeft}>
                <MaterialCommunityIcons 
                  name="vibrate" 
                  size={20} 
                  color={vibrationEnabled ? '#4A90E2' : '#666'} 
                />
                <Text style={[styles.settingText, vibrationEnabled && styles.settingTextActive]}>
                  Haptic Feedback
                </Text>
              </View>
              <View style={[styles.toggle, vibrationEnabled && styles.toggleActive]}>
                <View style={[styles.toggleIndicator, vibrationEnabled && styles.toggleIndicatorActive]} />
              </View>
            </Pressable>
            
            {/* Sound Toggle */}
            <Pressable
              style={[styles.settingItem, soundEnabled && styles.settingItemActive]}
              onPress={() => handleButtonPress(toggleSound)}
            >
              <View style={styles.settingLeft}>
                <Ionicons 
                  name={soundEnabled ? "volume-medium" : "volume-mute"} 
                  size={20} 
                  color={soundEnabled ? '#4A90E2' : '#666'} 
                />
                <Text style={[styles.settingText, soundEnabled && styles.settingTextActive]}>
                  Sound Effects
                </Text>
              </View>
              <View style={[styles.toggle, soundEnabled && styles.toggleActive]}>
                <View style={[styles.toggleIndicator, soundEnabled && styles.toggleIndicatorActive]} />
              </View>
            </Pressable>
          </View>
          
          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            {/* Large Resume Button */}
            <Pressable
              style={[styles.button, styles.primaryButton]}
              onPress={() => handleButtonPress(onResume)}
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
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  
  modalContainer: {
    backgroundColor: 'rgba(16, 20, 36, 0.98)',
    borderRadius: 20,
    padding: 30,
    width: '90%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 226, 0.3)',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
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
  
  settingsSection: {
    marginBottom: 30,
  },
  
  settingsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#B0C4DE',
    marginBottom: 15,
    letterSpacing: 1,
    textShadowColor: 'rgba(176, 196, 222, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: 'rgba(26, 42, 78, 0.6)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  
  settingItemActive: {
    backgroundColor: 'rgba(74, 144, 226, 0.15)',
    borderColor: 'rgba(74, 144, 226, 0.3)',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  settingText: {
    fontSize: 16,
    color: '#999',
    marginLeft: 12,
    fontWeight: '500',
  },
  
  settingTextActive: {
    color: '#FFFFFF',
    textShadowColor: 'rgba(74, 144, 226, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  
  toggle: {
    width: 50,
    height: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 13,
    padding: 2,
    justifyContent: 'center',
  },
  
  toggleActive: {
    backgroundColor: 'rgba(74, 144, 226, 0.6)',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 3,
  },
  
  toggleIndicator: {
    width: 22,
    height: 22,
    backgroundColor: '#666',
    borderRadius: 11,
    alignSelf: 'flex-start',
  },
  
  toggleIndicatorActive: {
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-end',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  
  buttonContainer: {
    gap: 8,
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
});

export default PauseModal; 