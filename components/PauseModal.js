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
import { vibrateLight } from '../utils/vibration';
import useGameStore from '../store/gameStore';

const PauseModal = ({ visible, onResume, onHome, onClose, onRestart }) => {
  const { vibrationEnabled, soundEnabled, toggleVibration, toggleSound } = useGameStore();

  const handleButtonPress = (action) => {
    // Vibrate on button press
    vibrateLight();
    
    // Execute the action
    switch (action) {
      case 'resume':
        onResume();
        break;
      case 'home':
        onHome();
        break;
      case 'close':
        onClose();
        break;
      case 'restart':
        onRestart();
        onClose();
        break;
      default:
        break;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, styles.modalContainerDark]}>
          <View style={styles.header}>
            <Text style={[styles.title, styles.textLight]}>🌌 Universe Paused</Text>
                    <Pressable
          style={({ pressed }) => [
            styles.closeButton, 
            styles.closeButtonDark, 
            pressed && { opacity: 0.7 }
          ]}
          onPress={() => handleButtonPress('close')}
                  >
                <Ionicons name="close" size={24} color="#ffffff" />
              </Pressable>
          </View>

          <View style={styles.content}>
            <Pressable 
              style={({ pressed }) => [
                styles.mainButton,
                pressed && { opacity: 0.7 }
              ]}
              onPress={() => handleButtonPress('resume')}
            >
              <Ionicons name="play" size={32} color="#ffffff" />
              <Text style={styles.mainButtonText}>🚀 Continue Creation</Text>
            </Pressable>

            <Pressable 
              style={({ pressed }) => [
                styles.secondaryButton, 
                styles.secondaryButtonDark,
                pressed && { opacity: 0.7 }
              ]}
              onPress={() => handleButtonPress('home')}
            >
              <Ionicons name="home" size={24} color="#ffffff" />
              <Text style={[styles.secondaryButtonText, styles.textLight]}>🏠 Return to Cosmos</Text>
            </Pressable>
          </View>

          <View style={styles.bottomRow}>
            <Pressable 
              style={({ pressed }) => [
                styles.iconButton, 
                styles.vibrationButton, 
                !vibrationEnabled && styles.disabledButton,
                pressed && { opacity: 0.7 }
              ]}
              onPress={() => {
                vibrateLight();
                toggleVibration();
              }}
            >
              <MaterialCommunityIcons 
                name={vibrationEnabled ? "vibrate" : "vibrate-off"} 
                size={24} 
                color="#ffffff" 
              />
            </Pressable>

            <Pressable 
              style={({ pressed }) => [
                styles.iconButton, 
                styles.soundButton, 
                !soundEnabled && styles.disabledButton,
                pressed && { opacity: 0.7 }
              ]}
              onPress={() => {
                vibrateLight();
                toggleSound();
              }}
            >
              <Ionicons 
                name={soundEnabled ? "volume-high" : "volume-mute"} 
                size={24} 
                color="#ffffff" 
              />
            </Pressable>

            <Pressable 
              style={({ pressed }) => [
                styles.iconButton, 
                styles.refreshButton,
                pressed && { opacity: 0.7 }
              ]}
              onPress={() => handleButtonPress('restart')}
            >
              <Ionicons name="refresh" size={24} color="#ffffff" />
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 10, 30, 0.9)', // Deep space overlay
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  modalContainer: {
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalContainerDark: {
    backgroundColor: '#1a1a2e', // Deep space background
    borderWidth: 2,
    borderColor: '#4a4a7a', // Cosmic purple border
    shadowColor: '#6a5acd', // Cosmic purple shadow
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.6,
    shadowRadius: 15,
  },
  modalContainerLight: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  textLight: {
    color: '#ffffff',
  },
  textDark: {
    color: '#212529',
  },
  
  closeButton: {
    padding: 8,
    borderRadius: 20,
  },
  closeButtonDark: {
    backgroundColor: '#444',
  },
  closeButtonLight: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  
  content: {
    alignItems: 'center',
    marginBottom: 32,
  },
  
  mainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4caf50',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#4caf50',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  
  mainButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
    letterSpacing: 0.5,
  },
  
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  secondaryButtonDark: {
    backgroundColor: '#666',
  },
  secondaryButtonLight: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#444',
  },
  
  vibrationButton: {
    backgroundColor: '#ff9800',
  },
  
  soundButton: {
    backgroundColor: '#4caf50',
  },

  disabledButton: {
    backgroundColor: '#666',
    opacity: 0.5,
  },
  
  refreshButton: {
    backgroundColor: '#e91e63',
  },
});

export default PauseModal; 