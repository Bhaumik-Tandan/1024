/**
 * Background Music Test Script
 * 
 * This script tests the background music manager to help debug
 * why background music isn't playing in the game.
 */

import backgroundMusicManager from './utils/backgroundMusicManager';
import useGameStore from './store/gameStore';

console.log('=== Background Music Test ===');

// Test 1: Check store settings
console.log('\n1. Checking store settings...');
const store = useGameStore.getState();
console.log('Background music enabled:', store.backgroundMusicEnabled);
console.log('Background music volume:', store.backgroundMusicVolume);

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
} catch (error) {
  console.error('Initialization failed:', error);
}

// Test 4: Test play
console.log('\n4. Testing play...');
try {
  await backgroundMusicManager.play();
  console.log('Play result - playing:', backgroundMusicManager.isPlaying);
} catch (error) {
  console.error('Play failed:', error);
}

// Test 5: Check final state
console.log('\n5. Final state...');
console.log('Manager enabled:', backgroundMusicManager.isEnabled);
console.log('Manager initialized:', backgroundMusicManager.isInitialized);
console.log('Manager playing:', backgroundMusicManager.isPlaying);
console.log('Manager volume:', backgroundMusicManager.currentVolume);

console.log('\n=== Test Complete ===');
