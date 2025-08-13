import React, { useEffect } from 'react';
import { View, Platform, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Navigator from './navigator';
import soundManager from './utils/soundManager';
import * as Sentry from '@sentry/react-native';
const getEnvVars = require('./env.config');

// Get environment configuration
const envConfig = getEnvVars(__DEV__ ? 'development' : 'production');

// Only initialize Sentry in production mode
if (envConfig.SENTRY_ENABLED) {
  Sentry.init({
    dsn: 'https://f8661e5fbc9058fc89e832f5719fcf29@o4507216589488128.ingest.us.sentry.io/4509838404812800',

    // Adds more context data to events (IP address, cookies, user, etc.)
    // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
    sendDefaultPii: true,

    // Configure Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1,
    integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],

    // uncomment the line below to enable Spotlight (https://spotlightjs.com)
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
        // Initialize sound manager (handles audio mode configuration internally)
        await soundManager.initialize();
        
        // Test sound system after initialization
        setTimeout(() => {
          soundManager.testSoundSystem();
        }, 1000); // Test after 1 second to ensure everything is loaded
      } catch (error) {
        // Audio initialization failed silently - continue without sound
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
};

// Export with conditional Sentry wrapping
export default envConfig.SENTRY_ENABLED ? Sentry.wrap(AppComponent) : AppComponent;