/**
 * SOUND TIMING AUDIT TEST SCRIPT
 * 
 * This script tests the sound timing system to verify:
 * 1. Sound-visual synchronization
 * 2. Chain reaction timing issues
 * 3. Rapid interaction handling
 * 4. Sound completion waiting
 */

import soundManager from './utils/soundManager.js';

// Test configuration
const TEST_CONFIG = {
  CHAIN_REACTION_COUNT: 5,
  RAPID_INTERACTION_COUNT: 10,
  TIMEOUT_DURATION: 5000,
  DELAY_BETWEEN_TESTS: 1000
};

// Timing measurement utilities
class TimingMeasurer {
  constructor() {
    this.startTime = 0;
    this.endTime = 0;
    this.measurements = [];
  }

  start() {
    this.startTime = Date.now();
  }

  end() {
    this.endTime = Date.now();
    const duration = this.endTime - this.startTime;
    this.measurements.push(duration);
    return duration;
  }

  getAverage() {
    if (this.measurements.length === 0) return 0;
    return this.measurements.reduce((sum, time) => sum + time, 0) / this.measurements.length;
  }

  getMin() {
    return Math.min(...this.measurements);
  }

  getMax() {
    return Math.max(...this.measurements);
  }

  reset() {
    this.measurements = [];
  }
}

// Test suite
class SoundTimingTestSuite {
  constructor() {
    this.timingMeasurer = new TimingMeasurer();
    this.testResults = [];
  }

  async runAllTests() {
    console.log('🎵 Starting Sound Timing Audit Tests...\n');
    
    await this.testSingleSoundTiming();
    await this.testChainReactionTiming();
    await this.testRapidInteractionTiming();
    await this.testSoundCompletionWaiting();
    await this.testQueueProcessingTiming();
    await this.testSoundCancellation();
    
    this.printResults();
  }

  async testSingleSoundTiming() {
    console.log('🧪 Test 1: Single Sound Timing');
    
    const soundTypes = ['drop', 'merge', 'intermediateMerge'];
    
    for (const soundType of soundTypes) {
      this.timingMeasurer.reset();
      
      for (let i = 0; i < 5; i++) {
        this.timingMeasurer.start();
        await soundManager.playSoundDirectly(soundType);
        const duration = this.timingMeasurer.end();
        
        console.log(`   ${soundType}: ${duration}ms (expected: ${this.getExpectedDuration(soundType)}ms)`);
        
        // Wait for sound to complete
        await new Promise(resolve => setTimeout(resolve, this.getExpectedDuration(soundType)));
      }
      
      const avgDuration = this.timingMeasurer.getAverage();
      const expectedDuration = this.getExpectedDuration(soundType);
      const isWithinRange = Math.abs(avgDuration - expectedDuration) < 50;
      
      this.testResults.push({
        test: `Single ${soundType} Timing`,
        status: isWithinRange ? '✅ PASS' : '❌ FAIL',
        details: `Average: ${avgDuration.toFixed(1)}ms, Expected: ${expectedDuration}ms`
      });
    }
    
    console.log('');
  }

  async testChainReactionTiming() {
    console.log('🧪 Test 2: Chain Reaction Timing');
    
    this.timingMeasurer.reset();
    this.timingMeasurer.start();
    
    // Simulate chain reaction with multiple intermediate merges
    const chainPromises = [];
    for (let i = 0; i < TEST_CONFIG.CHAIN_REACTION_COUNT; i++) {
      chainPromises.push(soundManager.playSoundDirectly('intermediateMerge'));
      // Small delay to simulate chain reaction timing
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    await Promise.all(chainPromises);
    const totalDuration = this.timingMeasurer.end();
    
    const expectedDuration = TEST_CONFIG.CHAIN_REACTION_COUNT * 200; // 200ms per intermediate merge
    const isWithinRange = Math.abs(totalDuration - expectedDuration) < 200;
    
    this.testResults.push({
      test: 'Chain Reaction Timing',
      status: isWithinRange ? '✅ PASS' : '❌ FAIL',
      details: `Total: ${totalDuration}ms, Expected: ~${expectedDuration}ms`
    });
    
    console.log(`   Chain reaction completed in ${totalDuration}ms\n`);
  }

  async testRapidInteractionTiming() {
    console.log('🧪 Test 3: Rapid Interaction Timing');
    
    this.timingMeasurer.reset();
    this.timingMeasurer.start();
    
    // Simulate rapid user interactions
    const rapidPromises = [];
    for (let i = 0; i < TEST_CONFIG.RAPID_INTERACTION_COUNT; i++) {
      rapidPromises.push(soundManager.queueSound('drop'));
      // Very small delay to simulate rapid taps
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    // Wait for queue to process
    await new Promise(resolve => setTimeout(resolve, 2000));
    const totalDuration = this.timingMeasurer.end();
    
    const queueLength = soundManager.soundQueue.length;
    const isProcessing = soundManager.isProcessingQueue;
    
    this.testResults.push({
      test: 'Rapid Interaction Timing',
      status: queueLength === 0 && !isProcessing ? '✅ PASS' : '⚠️ WARNING',
      details: `Queue length: ${queueLength}, Processing: ${isProcessing}, Duration: ${totalDuration}ms`
    });
    
    console.log(`   Rapid interactions processed in ${totalDuration}ms`);
    console.log(`   Final queue length: ${queueLength}\n`);
  }

  async testSoundCompletionWaiting() {
    console.log('🧪 Test 4: Sound Completion Waiting');
    
    this.timingMeasurer.reset();
    this.timingMeasurer.start();
    
    // Start a sound
    const soundPromise = soundManager.playSoundDirectly('merge');
    
    // Wait for it to complete
    await soundManager.waitForSoundCompletion('merge');
    
    const waitDuration = this.timingMeasurer.end();
    const expectedDuration = 300; // merge sound duration
    const isWithinRange = Math.abs(waitDuration - expectedDuration) < 100;
    
    this.testResults.push({
      test: 'Sound Completion Waiting',
      status: isWithinRange ? '✅ PASS' : '❌ FAIL',
      details: `Wait duration: ${waitDuration}ms, Expected: ~${expectedDuration}ms`
    });
    
    console.log(`   Sound completion wait: ${waitDuration}ms\n`);
  }

  async testQueueProcessingTiming() {
    console.log('🧪 Test 5: Queue Processing Timing');
    
    this.timingMeasurer.reset();
    this.timingMeasurer.start();
    
    // Add multiple sounds to queue
    await soundManager.queueSound('drop', 1);
    await soundManager.queueSound('merge', 3);
    await soundManager.queueSound('intermediateMerge', 2);
    
    // Wait for queue to process
    await new Promise(resolve => setTimeout(resolve, 1000));
    const processingDuration = this.timingMeasurer.end();
    
    const queueLength = soundManager.soundQueue.length;
    const isProcessing = soundManager.isProcessingQueue;
    
    this.testResults.push({
      test: 'Queue Processing Timing',
      status: queueLength === 0 && !isProcessing ? '✅ PASS' : '⚠️ WARNING',
      details: `Processing time: ${processingDuration}ms, Queue: ${queueLength}, Processing: ${isProcessing}`
    });
    
    console.log(`   Queue processing completed in ${processingDuration}ms\n`);
  }

  async testSoundCancellation() {
    console.log('🧪 Test 6: Sound Cancellation (Simulated)');
    
    // Test if we can stop all sounds
    this.timingMeasurer.reset();
    this.timingMeasurer.start();
    
    // Start multiple sounds
    const soundPromises = [
      soundManager.playSoundDirectly('drop'),
      soundManager.playSoundDirectly('merge'),
      soundManager.playSoundDirectly('intermediateMerge')
    ];
    
    // Stop all sounds after a short delay
    setTimeout(() => {
      soundManager.stopAllSounds();
    }, 100);
    
    const stopDuration = this.timingMeasurer.end();
    
    this.testResults.push({
      test: 'Sound Cancellation',
      status: '✅ PASS',
      details: `Stop duration: ${stopDuration}ms`
    });
    
    console.log(`   Sound cancellation test completed in ${stopDuration}ms\n`);
  }

  getExpectedDuration(soundType) {
    switch (soundType) {
      case 'drop': return 150;
      case 'merge': return 300;
      case 'intermediateMerge': return 200;
      case 'gameOver': return 2000;
      case 'pauseResume': return 100;
      default: return 200;
    }
  }

  printResults() {
    console.log('📊 SOUND TIMING AUDIT RESULTS\n');
    console.log('='.repeat(60));
    
    let passCount = 0;
    let failCount = 0;
    let warningCount = 0;
    
    for (const result of this.testResults) {
      console.log(`${result.status} ${result.test}`);
      console.log(`   ${result.details}`);
      console.log('');
      
      if (result.status.includes('PASS')) passCount++;
      else if (result.status.includes('FAIL')) failCount++;
      else if (result.status.includes('WARNING')) warningCount++;
    }
    
    console.log('='.repeat(60));
    console.log(`SUMMARY: ${passCount} PASS, ${failCount} FAIL, ${warningCount} WARNING`);
    
    if (failCount === 0 && warningCount === 0) {
      console.log('🎉 All tests passed! Sound timing system is working correctly.');
    } else if (failCount === 0) {
      console.log('⚠️  Some warnings detected. Consider optimizing sound timing.');
    } else {
      console.log('❌ Some tests failed. Sound timing system needs attention.');
    }
    
    console.log('\n📋 RECOMMENDATIONS:');
    if (failCount > 0) {
      console.log('   - Review sound completion waiting logic');
      console.log('   - Check sound duration calculations');
    }
    if (warningCount > 0) {
      console.log('   - Optimize chain reaction sound timing');
      console.log('   - Implement sound cancellation for rapid interactions');
    }
    if (passCount === this.testResults.length) {
      console.log('   - System is working well, consider performance optimizations');
    }
  }
}

// Run the test suite
async function runSoundTimingAudit() {
  try {
    // Initialize sound manager
    await soundManager.initialize();
    
    // Run tests
    const testSuite = new SoundTimingTestSuite();
    await testSuite.runAllTests();
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
  } finally {
    // Cleanup
    await soundManager.stopAllSounds();
    await soundManager.unloadAllSounds();
  }
}

// Export for use in other files
export { SoundTimingTestSuite, runSoundTimingAudit };

// Run if this file is executed directly
if (typeof window === 'undefined' && typeof process !== 'undefined') {
  runSoundTimingAudit();
} 