import Constants from 'expo-constants';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';

import RootNavigator from './navigator';
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
        // Audio initialization failed silently
      }
    };

    initializeAudio();
    
    // Cleanup sound manager when app is unmounted
    return () => {
      soundManager.cleanup();
    };
  }, []);

  return (
    <SafeAreaProvider style={[
      { paddingTop: Platform.OS === 'web' ? 0 : Constants.statusBarHeight },
      Platform.OS === 'web' && styles.webContainer
    ]}>
      <StatusBar style="auto" />
      {RootNavigator}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  webContainer: {
    maxWidth: 600,
    marginHorizontal: 'auto',
    backgroundColor: '#1a1a1a',
  },
});
