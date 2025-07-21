import Constants from 'expo-constants';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Platform, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';

import RootNavigator from './navigator';
import soundManager from './utils/soundManager';

// Only import Audio on native platforms
let Audio = null;
if (Platform.OS !== 'web') {
  Audio = require('expo-av').Audio;
}

// Simple test component for web debugging
const TestComponent = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a1a' }}>
    <Text style={{ color: '#ffffff', fontSize: 24, marginBottom: 20 }}>
      1024 Game - Web Test
    </Text>
    <Text style={{ color: '#cccccc', fontSize: 16 }}>
      Platform: {Platform.OS}
    </Text>
    <Text style={{ color: '#cccccc', fontSize: 16 }}>
      If you see this, React is working!
    </Text>
  </View>
);

export default function App() {
  const [showTest, setShowTest] = useState(Platform.OS === 'web');

  useEffect(() => {
    const initializeAudio = async () => {
      try {
        // Skip audio initialization on web
        if (Platform.OS === 'web') {
          // On web, wait a bit then show the full app
          setTimeout(() => {
            setShowTest(false);
          }, 3000);
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

  // Show test component on web first
  if (showTest) {
    return (
      <SafeAreaProvider style={{ paddingTop: Platform.OS === 'web' ? 0 : Constants.statusBarHeight }}>
        <StatusBar style="auto" />
        <TestComponent />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider style={{ paddingTop: Platform.OS === 'web' ? 0 : Constants.statusBarHeight }}>
      <StatusBar style="auto" />
      {RootNavigator}
    </SafeAreaProvider>
  );
}
