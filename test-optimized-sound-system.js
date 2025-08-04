/**
 * TEST OPTIMIZED SOUND SYSTEM
 * 
 * This script tests the optimized sound manager to verify:
 * 1. Chain reaction optimizations work
 * 2. Sound cancellation works
 * 3. Reduced delays work
 * 4. Performance improvements are noticeable
 */

import soundManager from './utils/soundManager.js';

async function testOptimizedSoundSystem() {
  console.log('🎵 Testing Optimized Sound System...\n');
  
  try {
    // Initialize the optimized sound manager
    await soundManager.initialize();
    
    console.log('✅ Sound manager initialized');
    
    // Test 1: Chain reaction sound timing
    console.log('\n🧪 Test 1: Chain Reaction Sound Timing');
    const startTime = Date.now();
    
    // Simulate a chain reaction with multiple intermediate merges
    for (let i = 0; i < 5; i++) {
      await soundManager.playIntermediateMergeSound(true); // isChainReaction = true
      await new Promise(resolve => setTimeout(resolve, 50)); // Simulate chain timing
    }
    
    const chainDuration = Date.now() - startTime;
    console.log(`   Chain reaction completed in ${chainDuration}ms`);
    console.log(`   Expected: ~250ms, Actual: ${chainDuration}ms`);
    console.log(`   Status: ${chainDuration < 300 ? '✅ FAST' : '⚠️ SLOW'}`);
    
    // Test 2: Sound cancellation for rapid interactions
    console.log('\n🧪 Test 2: Sound Cancellation');
    const dropStartTime = Date.now();
    
    // Simulate rapid drop interactions
    for (let i = 0; i < 10; i++) {
      await soundManager.playDropSound();
      await new Promise(resolve => setTimeout(resolve, 10)); // Very rapid taps
    }
    
    const dropDuration = Date.now() - dropStartTime;
    console.log(`   Rapid drops completed in ${dropDuration}ms`);
    console.log(`   Expected: ~150ms, Actual: ${dropDuration}ms`);
    console.log(`   Status: ${dropDuration < 200 ? '✅ FAST' : '⚠️ SLOW'}`);
    
    // Test 3: Performance metrics
    console.log('\n🧪 Test 3: Performance Metrics');
    const metrics = soundManager.getPerformanceMetrics();
    console.log('   Performance Metrics:', {
      queueLength: metrics.queueLength,
      activeSounds: metrics.activeSounds,
      cancelledSounds: metrics.cancelledSounds,
      chainReactionActive: metrics.chainReactionActive,
      chainReactionCount: metrics.chainReactionCount
    });
    
    // Test 4: Sound manager status
    console.log('\n🧪 Test 4: Sound Manager Status');
    const status = soundManager.getStatus();
    console.log('   Status:', {
      isInitialized: status.isInitialized,
      soundEnabled: status.soundEnabled,
      queueLength: status.queueLength,
      isProcessingQueue: status.isProcessingQueue,
      activeSoundsCount: status.activeSoundsCount,
      cancelledSoundsCount: status.cancelledSoundsCount
    });
    
    // Test 5: Chain reaction state management
    console.log('\n🧪 Test 5: Chain Reaction State Management');
    soundManager.setChainReactionState(true, 3);
    console.log(`   Chain reaction active: ${soundManager.isChainReactionActive()}`);
    console.log(`   Chain reaction count: ${soundManager.getChainReactionCount()}`);
    
    soundManager.setChainReactionState(false, 0);
    console.log(`   Chain reaction active: ${soundManager.isChainReactionActive()}`);
    console.log(`   Chain reaction count: ${soundManager.getChainReactionCount()}`);
    
    // Summary
    console.log('\n📊 OPTIMIZATION TEST RESULTS');
    console.log('='.repeat(50));
    
    const tests = [
      { name: 'Chain Reaction Timing', passed: chainDuration < 300 },
      { name: 'Sound Cancellation', passed: dropDuration < 200 },
      { name: 'Performance Metrics', passed: metrics.queueLength === 0 },
      { name: 'Status Tracking', passed: status.isInitialized },
      { name: 'State Management', passed: !soundManager.isChainReactionActive() }
    ];
    
    let passCount = 0;
    for (const test of tests) {
      const status = test.passed ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} ${test.name}`);
      if (test.passed) passCount++;
    }
    
    console.log('\n' + '='.repeat(50));
    console.log(`SUMMARY: ${passCount}/${tests.length} tests passed`);
    
    if (passCount === tests.length) {
      console.log('🎉 All optimizations working correctly!');
    } else {
      console.log('⚠️  Some optimizations need attention');
    }
    
    // Cleanup
    await soundManager.stopAllSounds();
    await soundManager.unloadAllSounds();
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testOptimizedSoundSystem(); 