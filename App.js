import React, { useEffect } from 'react';
import { View, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Navigator from './navigator';
import soundManager from './utils/soundManager';

// Only import Audio on native platforms
let Audio = null;
if (Platform.OS !== 'web') {
  Audio = require('expo-av').Audio;
}

export default function App() {
  useEffect(() => {
    const initializeAudio = async () => {
      try {
        // Skip audio initialization on web
        if (Platform.OS === 'web') {
          return;
        }
        
        // iOS-specific audio session activation
        if (Platform.OS === 'ios' && Audio) {
          await Audio.setAudioModeAsync({
            playsInSilentModeIOS: true,
            allowsRecordingIOS: false,
            staysActiveInBackground: false,
          });
        }
        
        // Initialize sound manager
        await soundManager.initialize();
      } catch (error) {
        // Audio initialization failed silently - continue without sound
        console.warn('Audio initialization failed:', error);
      }
    };

    initializeAudio();
    
    // Cleanup sound manager when app is unmounted
    return () => {
      soundManager.cleanup();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a1a' }}>
        <StatusBar style="light" backgroundColor="#0a0a1a" />
        <Navigator />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
