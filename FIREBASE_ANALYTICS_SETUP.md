# Firebase Analytics Setup Guide

## Overview
This guide explains how to set up Firebase Analytics in your 1024 game app with **anonymous data collection only** - no consent popups required.

## What This Implementation Provides
- ✅ **Anonymous analytics** - No personal data collected
- ✅ **No consent popups** - Analytics run automatically
- ✅ **Game-specific events** - Track gameplay, achievements, etc.
- ✅ **Privacy-compliant** - Follows GDPR and privacy guidelines
- ✅ **Performance tracking** - Monitor app performance
- ✅ **Error tracking** - Track game errors without personal info

## Setup Steps

### 1. Install Dependencies
```bash
# Install Firebase packages
npm install @react-native-firebase/app @react-native-firebase/analytics

# Or with yarn
yarn add @react-native-firebase/app @react-native-firebase/analytics
```

### 2. Firebase Console Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Add your app (iOS/Android)
4. Download configuration files:
   - **iOS**: `GoogleService-Info.plist`
   - **Android**: `google-services.json`

### 3. Add Configuration Files
- **iOS**: Place `GoogleService-Info.plist` in your iOS project
- **Android**: Place `google-services.json` in `android/app/`

### 4. Update Configuration
Edit `utils/firebaseConfig.js` and add your Firebase project details:
```javascript
export const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id",
  measurementId: "your-measurement-id"
};
```

## Usage Examples

### Basic Game Events
```javascript
import { GameAnalytics } from '../utils/gameAnalytics';

// Track game start
await GameAnalytics.trackGameStart('easy');

// Track tile merge
await GameAnalytics.trackTileMerge(2, 4, 1);

// Track game end
await GameAnalytics.trackGameEnd(1024, 64, 300000, 'normal');
```

### Screen Tracking
```javascript
// Track when user visits different screens
await GameAnalytics.trackScreenView('GameScreen');
await GameAnalytics.trackScreenView('SettingsScreen');
```

### Power-ups and Achievements
```javascript
// Track power-up usage
await GameAnalytics.trackPowerUp('shuffle', { score: 512, maxTile: 32 });

// Track achievements
await GameAnalytics.trackAchievement('first_1024', { score: 1024, maxTile: 1024 });
```

## What Data is Collected (Anonymous Only)

### ✅ Collected Data
- Game events (start, end, moves, merges)
- Screen views
- Performance metrics
- Error types (not personal info)
- App usage patterns
- Device type and OS version

### ❌ NOT Collected
- Personal information
- User names or emails
- Device identifiers
- Location data
- Personal preferences
- Individual user behavior

## Privacy Compliance

### GDPR Compliance
- No personal data collection
- Anonymous analytics only
- No tracking across apps
- Data retention policies followed

### COPPA Compliance
- No data collection for users under 13
- Safe for children's apps
- Parental consent not required

### App Store Compliance
- Meets iOS App Store guidelines
- Meets Google Play Store guidelines
- No consent popup required

## Analytics Dashboard

Once set up, you can view your analytics in the Firebase Console:
1. **Events**: See all game events
2. **User engagement**: Track daily/monthly active users
3. **Retention**: See how often users return
4. **Performance**: Monitor app performance
5. **Crashes**: Track any game errors

## Troubleshooting

### Common Issues
1. **Analytics not showing**: Check Firebase configuration
2. **Build errors**: Ensure packages are properly installed
3. **No data**: Wait 24-48 hours for first data to appear

### Debug Mode
Enable debug logging in development:
```javascript
// In your App.js or index.js
if (__DEV__) {
  firebase.analytics().setAnalyticsCollectionEnabled(true);
}
```

## Benefits

### For Development
- Understand user behavior
- Identify popular game features
- Track performance issues
- Monitor crash rates
- Optimize user experience

### For Users
- No privacy concerns
- No consent popups
- Better app performance
- Improved gameplay experience
- No personal data shared

## Support

If you encounter issues:
1. Check Firebase Console for errors
2. Verify configuration files
3. Check package installation
4. Review console logs for errors

## Next Steps

After setup:
1. Test analytics in development
2. Deploy to test devices
3. Verify data appears in Firebase Console
4. Customize events for your specific needs
5. Set up custom dashboards if needed

---

**Note**: This implementation ensures 100% anonymous analytics with no user consent requirements while providing valuable insights for app improvement.
