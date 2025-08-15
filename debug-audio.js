/**
 * Simple Audio System Diagnostic Script
 * 
 * This script checks the basic audio system status
 * without requiring React Native environment
 */

console.log('=== Audio System Diagnostic ===\n');

// Check package.json for dependencies
try {
  const packageJson = require('./package.json');
  console.log('1. Package Dependencies:');
  console.log('   - expo:', packageJson.dependencies.expo);
  console.log('   - expo-av:', packageJson.dependencies['expo-av']);
  console.log('   - react-native:', packageJson.dependencies['react-native']);
  console.log('');
} catch (error) {
  console.error('Failed to read package.json:', error.message);
}

// Check if audio files exist
const fs = require('fs');
const path = require('path');

console.log('2. Audio Files Check:');
const audioDir = './assets/audio';
const requiredFiles = ['background.mp3', 'drop.wav', 'gameOver.wav', 'intermediateMerge.wav', 'mergeSound.wav'];

requiredFiles.forEach(file => {
  const filePath = path.join(audioDir, file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`   ✅ ${file}: ${(stats.size / 1024).toFixed(1)} KB`);
  } else {
    console.log(`   ❌ ${file}: Missing`);
  }
});

console.log('');

// Check for common issues
console.log('3. Common Issues Check:');
console.log('   - Are you running this in a React Native/Expo environment?');
console.log('   - Is the device/emulator audio enabled?');
console.log('   - Are there any console errors in the app?');
console.log('   - Is the background music toggle enabled in settings?');

console.log('\n4. Troubleshooting Steps:');
console.log('   1. Start the Expo app');
console.log('   2. Check console for audio initialization logs');
console.log('   3. Go to Settings → Background Music');
console.log('   4. Ensure background music is enabled');
console.log('   5. Check device volume is not muted');
console.log('   6. Look for any error messages in console');

console.log('\n=== Diagnostic Complete ===');
console.log('Run the app and check console logs for detailed audio information.');
