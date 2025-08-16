/**
 * TEST BACKGROUND MUSIC FIXES
 * 
 * This file tests the background music manager fixes
 * to ensure no more null reference errors
 */

import { BackgroundMusicManager } from './utils/backgroundMusicManager';

// Test the background music manager
async function testBackgroundMusic() {
  console.log('🧪 Testing Background Music Manager...');
  
  const manager = new BackgroundMusicManager();
  
  try {
    // Test initialization
    console.log('📱 Initializing...');
    await manager.initialize();
    console.log('✅ Initialization complete');
    
    // Test play
    console.log('🎵 Testing play...');
    await manager.play();
    console.log('✅ Play test complete');
    
    // Test pause
    console.log('⏸️ Testing pause...');
    await manager.pause();
    console.log('✅ Pause test complete');
    
    // Test volume setting
    console.log('🔊 Testing volume...');
    await manager.setVolume(0.5);
    console.log('✅ Volume test complete');
    
    console.log('🎉 All tests passed! Background music is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Cleanup
    manager.cleanup();
  }
}

// Run the test
testBackgroundMusic();
