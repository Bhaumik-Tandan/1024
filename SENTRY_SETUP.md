# Sentry Setup Documentation

## Overview
Sentry has been configured for this React Native project to provide error tracking and monitoring in production environments.

## Configuration

### Environment-Based Activation
Sentry is configured to only activate in production mode. The activation is controlled by the `env.config.js` file:

- **Development**: Sentry is disabled (`SENTRY_ENABLED: false`)
- **Production**: Sentry is enabled (`SENTRY_ENABLED: true`)
- **Staging**: Sentry is disabled (`SENTRY_ENABLED: false`)

### Automatic Environment Detection
The app automatically detects the environment:
- Uses `__DEV__` flag to determine if running in development or production
- In development: Sentry is completely disabled
- In production: Sentry is fully enabled with all features

## Features Enabled

### Core Features
- Error tracking and crash reporting
- Performance monitoring
- Session replay (10% sample rate for sessions, 100% for errors)
- User feedback widget
- Enhanced context data collection

### Integrations
- Mobile replay integration for session replay
- Feedback integration for user feedback collection

## Project Details
- **Organization**: amigo-o4
- **Project**: 1024-hp
- **DSN**: Configured in App.js (automatically set by Sentry wizard)

## Usage

### Testing Sentry
To test if Sentry is working in production, you can use the test button:

```javascript
<Button 
  title='Test Sentry' 
  onPress={() => { 
    Sentry.captureException(new Error('Test error')) 
  }}
/>
```

### Manual Error Reporting
```javascript
import * as Sentry from '@sentry/react-native';

// Capture an error
Sentry.captureException(new Error('Something went wrong'));

// Capture a message
Sentry.captureMessage('Important event occurred', 'info');

// Set user context
Sentry.setUser({
  id: '12345',
  email: 'user@example.com',
  username: 'username'
});
```

### Feedback Widget
The feedback widget is automatically enabled and can be shown with:
```javascript
Sentry.showFeedbackWidget();
```

## Build Configuration

### Development Builds
- Sentry is completely disabled
- No performance impact
- No data collection

### Production Builds
- Sentry is fully enabled
- All monitoring features active
- Data sent to Sentry dashboard

## Monitoring Dashboard
Access your Sentry dashboard at: https://amigo-o4.sentry.io/issues/?project=4509838404812800

## Troubleshooting

### Sentry Not Working in Production
1. Verify the build is a production build (not development)
2. Check that `__DEV__` is false
3. Verify the DSN is correct
4. Check network connectivity to Sentry servers

### Performance Issues
- Sentry is automatically disabled in development
- In production, Sentry runs on background threads
- Session replay can be disabled by modifying the sample rates

## Dependencies
- `@sentry/react-native`: Core Sentry functionality
- Sentry Expo plugin: Configured in app.json

## Security
- User data collection is configurable via `sendDefaultPii`
- Session replay automatically masks sensitive content
- All data is encrypted in transit to Sentry servers
