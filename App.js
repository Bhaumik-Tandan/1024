import React, { useEffect } from 'react';
import { View, Dimensions, Platform } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Navigator from './navigator';
import soundManager from './utils/soundManager';
import backgroundMusicManager from './utils/backgroundMusicManager';
import envConfig from './env.config';
// Conditional Firebase import - only in production
let firebaseAnalytics = null;
let gameMetricsAnalytics = null;

// Only import Firebase services in production
if (!__DEV__) {
  try {
    firebaseAnalytics = require('./utils/firebaseAnalytics').default;
    gameMetricsAnalytics = require('./utils/gameMetricsAnalytics').default;
  } catch (error) {
    // Firebase services not available
  }
}

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

        
        // Initialize sound manager first (handles audio mode configuration internally)
        await soundManager.initialize();
        
        // Initialize background music manager
        await backgroundMusicManager.initialize();
        
        // Start background music if enabled
        await backgroundMusicManager.play();
        
        // Test sound system after initialization
        setTimeout(async () => {
          try {
            await soundManager.testSoundSystem();
            
            // Also run background music diagnosis
            await backgroundMusicManager.diagnoseSystem();
          } catch (error) {
            // Sound system test failed
          }
        }, 1000); // Test after 1 second to ensure everything is loaded
      } catch (error) {
        // Audio initialization failed
        
        // Try to recover from initialization errors
        try {
          await backgroundMusicManager.recoverFromError();
          await soundManager.recoverFromError();
        } catch (recoveryError) {
          // Audio recovery failed
        }
      }
    };

    initializeAudio();
    
    // Initialize Firebase Analytics (only in production on iOS)
    const initializeAnalytics = async () => {
      try {
        // Only initialize in production mode
        if (__DEV__) {
          return;
        }

        // Check if Firebase services are available
        if (!firebaseAnalytics) {
          return;
        }

        // Only initialize on iOS
        if (Platform.OS !== 'ios') {
          return;
        }

        // Firebase Analytics is auto-initialized in the service
        // Track app launch
        await firebaseAnalytics.trackGameEvent('app_launch', {
          app_version: '1.0.2',
          platform: Platform.OS,
        });
      } catch (error) {
        // Firebase Analytics initialization failed
      }
    };
    
    // Initialize Game Metrics Analytics (always enabled for tracking)
    const initializeGameMetrics = async () => {
      try {
        // Only initialize if service is available
        if (!gameMetricsAnalytics) {
          return;
        }

        // Start the first session
        await gameMetricsAnalytics.startSession();
      } catch (error) {
        // Game Metrics Analytics initialization failed
      }
    };
    
    initializeAnalytics();
    initializeGameMetrics();
    
    // Cleanup sound manager when app is unmounted
    return async () => {
      try {
        soundManager.unloadAllSounds();
        backgroundMusicManager.cleanup();
      } catch (error) {
        // Audio cleanup failed
      }
      
      // End analytics session
      try {
        if (gameMetricsAnalytics) {
          await gameMetricsAnalytics.endSession();
        }
      } catch (error) {
        // Analytics session cleanup failed
      }
    };
  }, []);

  // Debug methods for troubleshooting
  const debugAudio = async () => {
    try {
      await backgroundMusicManager.diagnoseSystem();
      await soundManager.testSoundSystem();
    } catch (error) {
      // Debug failed
    }
  };

  const forcePlayMusic = async () => {
    try {
      await backgroundMusicManager.forcePlay();
    } catch (error) {
      // Force play failed
    }
  };

  // Add debug methods to global scope for console access
  useEffect(() => {
    if (__DEV__) {
      global.debugAudio = debugAudio;
      global.forcePlayMusic = forcePlayMusic;
      global.backgroundMusicManager = backgroundMusicManager;
      global.soundManager = soundManager;
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