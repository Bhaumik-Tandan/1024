import React, { useEffect } from 'react';
import { View, Platform, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Navigator from './navigator';
import soundManager from './utils/soundManager';

// Get device dimensions to detect iPad
const { width } = Dimensions.get('window');
const isTablet = width >= 768; // iPad and larger tablets

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
        
        // Test sound system after initialization
        setTimeout(() => {
          soundManager.testSoundSystem();
        }, 1000); // Test after 1 second to ensure everything is loaded
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
        <View style={{ flex: 1, backgroundColor: '#0a0a1a' }}>
          <StatusBar 
            style="light" 
            backgroundColor="#0a0a1a" 
            hidden={false}
            translucent={isTablet}
          />
          <SafeAreaView 
            style={{ 
              flex: 1, 
              backgroundColor: '#0a0a1a',
              // Force full height on tablets
              ...(isTablet && { 
                paddingTop: 0,
                height: '100%'
              })
            }}
            edges={isTablet ? ['left', 'right', 'bottom'] : ['left', 'right', 'top', 'bottom']}
          >
            <Navigator />
          </SafeAreaView>
        </View>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
