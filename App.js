import React, { useEffect } from 'react';
import { View, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Navigator from './navigator';
import soundManager from './utils/soundManager';

export default function App() {
  useEffect(() => {
    const initializeAudio = async () => {
      try {
        // Initialize sound manager (handles audio mode configuration internally)
        await soundManager.initialize();
      } catch (error) {
        // Audio initialization failed silently - continue without sound
        console.warn('Audio initialization failed:', error);
      }
    };

    initializeAudio();
    
    // Cleanup sound manager when app is unmounted
    return () => {
      soundManager.unloadAllSounds();
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
