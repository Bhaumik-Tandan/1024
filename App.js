import React, { useEffect } from 'react';
import { View, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Navigator from './navigator';
import soundManager from './utils/soundManager';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Game Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a1a' }}>
          {/* Minimal error fallback - game will restart on next launch */}
        </View>
      );
    }

    return this.props.children;
  }
}

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
    <ErrorBoundary>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a1a' }}>
          <StatusBar style="light" backgroundColor="#0a0a1a" hidden={true} />
          <Navigator />
        </SafeAreaView>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
