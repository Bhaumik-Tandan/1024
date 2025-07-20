import Constants from 'expo-constants';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { Audio } from 'expo-av';

import RootNavigator from './navigator';
import soundManager from './utils/soundManager';

export default function App() {
  useEffect(() => {
    const initializeAudio = async () => {
      try {
        // iOS-specific audio session activation
        if (Platform.OS === 'ios') {
          await Audio.setAudioModeAsync({
            playsInSilentModeIOS: true,
            allowsRecordingIOS: false,
            staysActiveInBackground: false,
          });
        }
        
        // Initialize sound manager
        await soundManager.initialize();
      } catch (error) {
        console.error('Failed to initialize audio:', error);
      }
    };

    initializeAudio();
    
    // Cleanup sound manager when app is unmounted
    return () => {
      soundManager.cleanup();
    };
  }, []);

  return (
    <SafeAreaProvider style={{ paddingTop: Constants.statusBarHeight }}>
      <StatusBar style="auto" />
      {RootNavigator}
    </SafeAreaProvider>
  );
}
