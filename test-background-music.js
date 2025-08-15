/**
 * Enhanced Background Music Test Script
 * 
 * This script tests the updated background music manager with expo-av
 * to verify all fixes are working properly.
 */

const backgroundMusicManager = require('./utils/backgroundMusicManager').default;
const soundManager = require('./utils/soundManager').default;
const useGameStore = require('./store/gameStore').default;

console.log('=== Enhanced Background Music Test ===');
console.log('Testing expo-av implementation and fixes...\n');

// Test 1: Check store settings
console.log('1. Checking store settings...');
const store = useGameStore.getState();
console.log('Background music enabled:', store.backgroundMusicEnabled);
console.log('Background music volume:', store.backgroundMusicVolume);
console.log('Sound enabled:', store.soundEnabled);
console.log('Sound volume:', store.soundVolume);

// Test 2: Check manager state
console.log('\n2. Checking manager state...');
console.log('Manager enabled:', backgroundMusicManager.isEnabled);
console.log('Manager initialized:', backgroundMusicManager.isInitialized);
console.log('Manager playing:', backgroundMusicManager.isPlaying);
console.log('Manager volume:', backgroundMusicManager.currentVolume);

// Test 3: Test initialization
console.log('\n3. Testing initialization...');
try {
  await backgroundMusicManager.initialize();
  console.log('Initialization result:', backgroundMusicManager.isInitialized);
  console.log('Audio mode set:', backgroundMusicManager.audioModeSet);
} catch (error) {
  console.error('Initialization failed:', error);
}

// Test 4: Test sound manager initialization
console.log('\n4. Testing sound manager initialization...');
try {
  await soundManager.initialize();
  console.log('Sound manager initialized:', soundManager.isInitialized);
  console.log('Sound manager audio mode set:', soundManager.audioModeSet);
} catch (error) {
  console.error('Sound manager initialization failed:', error);
}

// Test 5: Test background music play
console.log('\n5. Testing background music play...');
try {
  await backgroundMusicManager.play();
  console.log('Play result - playing:', backgroundMusicManager.isPlaying);
} catch (error) {
  console.error('Play failed:', error);
}

// Test 6: Test volume control
console.log('\n6. Testing volume control...');
try {
  await backgroundMusicManager.setVolume(0.5);
  console.log('Volume set to 0.5, current volume:', backgroundMusicManager.currentVolume);
} catch (error) {
  console.error('Volume control failed:', error);
}

// Test 7: Test sound manager
console.log('\n7. Testing sound manager...');
try {
  const soundStatus = soundManager.getStatus();
  console.log('Sound device status:', soundStatus);
  
  // Test a sound
  await soundManager.playDropSound();
  console.log('Drop sound played successfully');
} catch (error) {
  console.error('Sound manager test failed:', error);
}

// Test 8: Test error recovery
console.log('\n8. Testing error recovery...');
try {
  await backgroundMusicManager.recoverFromError();
  console.log('Error recovery completed successfully');
} catch (error) {
  console.error('Error recovery failed:', error);
}

// Test 9: Check final state
console.log('\n9. Final state...');
console.log('Manager enabled:', backgroundMusicManager.isEnabled);
console.log('Manager initialized:', backgroundMusicManager.isInitialized);
console.log('Manager playing:', backgroundMusicManager.isPlaying);
console.log('Manager volume:', backgroundMusicManager.currentVolume);
console.log('Sound manager initialized:', soundManager.isInitialized);

// Test 10: Performance metrics
console.log('\n10. Performance metrics...');
try {
  const soundMetrics = soundManager.getPerformanceMetrics();
  console.log('Sound performance metrics:', soundMetrics);
} catch (error) {
  console.error('Failed to get performance metrics:', error);
}

console.log('\n=== Enhanced Test Complete ===');
console.log('All fixes have been tested. Check console for results.');
