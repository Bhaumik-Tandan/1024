import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import Navigator from './navigator';
import CustomSplashScreen from './components/SplashScreen';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [isAppReady, setIsAppReady] = useState(false);
  const [showCustomSplash, setShowCustomSplash] = useState(true);

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts, make any API calls you need to do here
        // For now, we'll just simulate some loading time
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setIsAppReady(true);
        // Hide the native splash screen
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  const handleSplashComplete = () => {
    setShowCustomSplash(false);
  };

  if (!isAppReady) {
    return null; // Keep showing native splash
  }

  if (showCustomSplash) {
    return (
      <View style={{ flex: 1 }}>
        <StatusBar style="light" backgroundColor="#0a0a1a" />
        <CustomSplashScreen onComplete={handleSplashComplete} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="light" backgroundColor="#0a0a1a" />
      <Navigator />
    </View>
  );
}
