import React, { useEffect } from 'react';
import { View, Dimensions } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Navigator from './navigator';
import soundManager from './utils/soundManager';
import backgroundMusicManager from './utils/backgroundMusicManager';
import envConfig from './env.config';

// Initialize Sentry only if enabled
if (envConfig.SENTRY_ENABLED) {
  const Sentry = require('@sentry/react-native');
  Sentry.init({
    dsn: envConfig.SENTRY_DSN,
    // spotlight: __DEV__,
  });
}

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
    // Error logged silently
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

// Conditionally wrap with Sentry only in production
const AppComponent = function App() {
  useEffect(() => {
    const initializeAudio = async () => {
      try {
        console.log('🎵 Initializing audio systems...');
        
        // Initialize sound manager first (handles audio mode configuration internally)
        console.log('🎵 Initializing sound manager...');
        await soundManager.initialize();
        console.log('✅ Sound manager initialized');
        
        // Initialize background music manager
        console.log('🎵 Initializing background music manager...');
        await backgroundMusicManager.initialize();
        console.log('✅ Background music manager initialized');
        
        // Start background music if enabled
        console.log('🎵 Starting background music...');
        await backgroundMusicManager.play();
        console.log('✅ Background music started');
        
        // Test sound system after initialization
        setTimeout(async () => {
          try {
            const soundTestResult = await soundManager.testSoundSystem();
            console.log('🎵 Sound system test result:', soundTestResult);
            
            // Also run background music diagnosis
            await backgroundMusicManager.diagnoseSystem();
          } catch (error) {
            console.warn('🎵 Sound system test failed:', error);
          }
        }, 1000); // Test after 1 second to ensure everything is loaded
        
        console.log('🎵 Audio initialization complete');
      } catch (error) {
        console.warn('🎵 Audio initialization failed:', error);
        
        // Try to recover from initialization errors
        try {
          console.log('🎵 Attempting audio recovery...');
          await backgroundMusicManager.recoverFromError();
          await soundManager.recoverFromError();
        } catch (recoveryError) {
          console.warn('🎵 Audio recovery failed:', recoveryError);
        }
      }
    };

    initializeAudio();
    
    // Cleanup sound manager when app is unmounted
    return () => {
      console.log('🎵 Cleaning up audio systems...');
      try {
        soundManager.unloadAllSounds();
        backgroundMusicManager.cleanup();
        console.log('✅ Audio cleanup complete');
      } catch (error) {
        console.warn('🎵 Audio cleanup failed:', error);
      }
    };
  }, []);

  // Debug methods for troubleshooting
  const debugAudio = async () => {
    console.log('🔍 Debugging audio system...');
    try {
      await backgroundMusicManager.diagnoseSystem();
      await soundManager.testSoundSystem();
    } catch (error) {
      console.error('Debug failed:', error);
    }
  };

  const forcePlayMusic = async () => {
    console.log('🔊 Force playing background music...');
    try {
      await backgroundMusicManager.forcePlay();
    } catch (error) {
      console.error('Force play failed:', error);
    }
  };

  // Add debug methods to global scope for console access
  useEffect(() => {
    if (__DEV__) {
      global.debugAudio = debugAudio;
      global.forcePlayMusic = forcePlayMusic;
      global.backgroundMusicManager = backgroundMusicManager;
      global.soundManager = soundManager;
      console.log('🔧 Debug methods available in console:');
      console.log('  - debugAudio() - Run audio system diagnosis');
      console.log('  - forcePlayMusic() - Force play background music');
      console.log('  - backgroundMusicManager - Access background music manager');
      console.log('  - soundManager - Access sound manager');
    }
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
};

// Export with conditional Sentry wrapping
export default envConfig.SENTRY_ENABLED ? Sentry.wrap(AppComponent) : AppComponent;