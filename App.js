import Constants from 'expo-constants';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';

import RootNavigator from './navigator';
import soundManager from './utils/soundManager';

export default function App() {
  useEffect(() => {
    // Initialize sound manager when app starts
    soundManager.initialize();
    
    // Cleanup sound manager when app is unmounted
    return () => {
      soundManager.cleanup();
    };
  }, []);

  return (
    <SafeAreaProvider
    style={{
        paddingTop: Constants.statusBarHeight,
    }}>
      <StatusBar style="auto" />
      
        {RootNavigator}
    </SafeAreaProvider>
  );
}
