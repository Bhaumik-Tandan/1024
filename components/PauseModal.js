import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { vibrateOnButtonPress } from '../utils/vibration';
import useGameStore from '../store/gameStore';

const PauseModal = ({ visible, onResume, onHome, onClose, onRestart }) => {
  const { darkMode, vibrationEnabled, soundEnabled, toggleVibration, toggleSound } = useGameStore();

  const handleButtonPress = (action) => {
    // Vibrate on button press
    vibrateOnButtonPress();
    
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
        <View style={[styles.modalContainer, darkMode ? styles.modalContainerDark : styles.modalContainerLight]}>
          <View style={styles.header}>
            <Text style={[styles.title, darkMode ? styles.textLight : styles.textDark]}>Game Paused</Text>
            <TouchableOpacity 
              style={[styles.closeButton, darkMode ? styles.closeButtonDark : styles.closeButtonLight]}
              onPress={() => handleButtonPress('close')}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={24} color={darkMode ? "#ffffff" : "#000000"} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <TouchableOpacity 
              style={styles.mainButton}
              onPress={() => handleButtonPress('resume')}
              activeOpacity={0.7}
            >
              <Ionicons name="play" size={32} color="#ffffff" />
              <Text style={styles.mainButtonText}>Resume Game</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.secondaryButton, darkMode ? styles.secondaryButtonDark : styles.secondaryButtonLight]}
              onPress={() => handleButtonPress('home')}
              activeOpacity={0.7}
            >
              <Ionicons name="home" size={24} color={darkMode ? "#ffffff" : "#000000"} />
              <Text style={[styles.secondaryButtonText, darkMode ? styles.textLight : styles.textDark]}>Back to Menu</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomRow}>
            <TouchableOpacity 
              style={[styles.iconButton, styles.vibrationButton, !vibrationEnabled && styles.disabledButton]}
              onPress={() => {
                vibrateOnButtonPress();
                toggleVibration();
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="phone-portrait" size={24} color="#ffffff" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.iconButton, styles.soundButton, !soundEnabled && styles.disabledButton]}
              onPress={() => {
                vibrateOnButtonPress();
                toggleSound();
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="musical-notes" size={24} color="#ffffff" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.iconButton, styles.refreshButton]}
              onPress={() => handleButtonPress('restart')}
              activeOpacity={0.7}
            >
              <Ionicons name="refresh" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
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
    backgroundColor: '#2c2c2c',
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