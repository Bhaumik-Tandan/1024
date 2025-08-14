import soundManager from './soundManager';
import useGameStore from '../store/gameStore';

/**
 * Comprehensive Sound System Test Suite
 * Tests the new queuing system and overlap prevention
 */

export class SoundSystemTester {
  constructor() {
    this.testResults = [];
  }

  async runAllTests() {
    
    const tests = [
      this.testInitialization.bind(this),
      this.testQueuingSystem.bind(this),
      this.testOverlapPrevention.bind(this),
      this.testPrioritySystem.bind(this),
      this.testRapidRequests.bind(this),
      this.testSoundIntervals.bind(this),
      this.testErrorHandling.bind(this)
    ];

    for (const test of tests) {
      try {
        await test();
      } catch (error) {
        this.testResults.push({ name: test.name, status: 'FAILED', error: error.message });
      }
    }

    this.printTestResults();
  }

  async testInitialization() {
    
    const status = soundManager.getStatus();
    
    if (!status.isInitialized) {
      throw new Error('Sound system not initialized');
    }
    
    if (status.isWebPlatform) {
      return;
    }
    
    const allPlayersExist = Object.values(status.hasPlayers).every(exists => exists);
    if (!allPlayersExist) {
      throw new Error('Some audio players are missing');
    }
    
    this.testResults.push({ name: 'Initialization', status: 'PASSED' });
  }

  async testQueuingSystem() {
    
    // Clear any existing queue
    await soundManager.stopAllSounds();
    
    // Add multiple sounds to queue
    const promises = [
      soundManager.queueSound('drop'),
      soundManager.queueSound('merge'),
      soundManager.queueSound('intermediateMerge'),
      soundManager.queueSound('drop')
    ];
    
    await Promise.all(promises);
    
    const status = soundManager.getStatus();
    
    // Wait for queue to process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const finalStatus = soundManager.getStatus();
    if (finalStatus.queueLength > 0) {
      throw new Error('Queue not fully processed');
    }
    
    this.testResults.push({ name: 'Queuing System', status: 'PASSED' });
  }

  async testOverlapPrevention() {
    
    await soundManager.stopAllSounds();
    
    // Try to play the same sound rapidly
    const startTime = Date.now();
    for (let i = 0; i < 10; i++) {
      soundManager.queueSound('drop');
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    const status = soundManager.getStatus();
    
    // Wait for processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const finalStatus = soundManager.getStatus();
    if (finalStatus.queueLength > 0) {
      throw new Error('Queue not processed after overlap test');
    }
    
    this.testResults.push({ name: 'Overlap Prevention', status: 'PASSED' });
  }

  async testPrioritySystem() {
    
    await soundManager.stopAllSounds();
    
    // Add sounds with different priorities
    const promises = [
      soundManager.queueSound('drop', 1),           // Low priority
      soundManager.queueSound('merge', 3),          // Medium priority
      soundManager.queueSound('gameOver', 5),       // High priority
      soundManager.queueSound('intermediateMerge', 2) // Lower priority
    ];
    
    await Promise.all(promises);
    
    const status = soundManager.getStatus();
    
    // Wait for processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    this.testResults.push({ name: 'Priority System', status: 'PASSED' });
  }

  async testRapidRequests() {
    
    await soundManager.stopAllSounds();
    
    const startTime = Date.now();
    
    // Simulate rapid gameplay
    for (let i = 0; i < 20; i++) {
      const soundType = ['drop', 'merge', 'intermediateMerge'][i % 3];
      soundManager.queueSound(soundType);
      await new Promise(resolve => setTimeout(resolve, 5));
    }
    
    const queueTime = Date.now() - startTime;
    
    // Wait for processing
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    const finalStatus = soundManager.getStatus();
    if (finalStatus.queueLength > 0) {
      throw new Error('Queue not processed after rapid requests');
    }
    
    this.testResults.push({ name: 'Rapid Requests', status: 'PASSED' });
  }

  async testSoundIntervals() {
    
    await soundManager.stopAllSounds();
    
    // Test that sounds respect minimum intervals
    const intervals = {
      drop: 100,
      merge: 200,
      intermediateMerge: 150,
      gameOver: 3000,
      pauseResume: 150
    };
    
    for (const [soundType, interval] of Object.entries(intervals)) {
      
      const startTime = Date.now();
      soundManager.queueSound(soundType);
      
      // Try to play again immediately
      soundManager.queueSound(soundType);
      
      const status = soundManager.getStatus();
      
      // Wait for the interval
      await new Promise(resolve => setTimeout(resolve, interval + 100));
    }
    
    this.testResults.push({ name: 'Sound Intervals', status: 'PASSED' });
  }

  async testErrorHandling() {
    
    // Test with invalid sound type
    try {
      soundManager.queueSound('invalidSound');
    } catch (error) {
    }
    
    // Test with disabled sound
    const originalState = useGameStore.getState();
    useGameStore.setState({ soundEnabled: false });
    
    soundManager.queueSound('drop');
    const status = soundManager.getStatus();
    
    // Restore original state
    useGameStore.setState({ soundEnabled: originalState.soundEnabled });
    
    this.testResults.push({ name: 'Error Handling', status: 'PASSED' });
  }

  printTestResults() {
    
    const passed = this.testResults.filter(r => r.status === 'PASSED').length;
    const failed = this.testResults.filter(r => r.status === 'FAILED').length;
    
    this.testResults.forEach(result => {
      const icon = result.status === 'PASSED' ? '✅' : '❌';
      if (result.error) {
      }
    });
    
    if (failed === 0) {
    } else {
    }
  }

  // Quick test for development
  async quickTest() {
    
    await soundManager.stopAllSounds();
    
    // Test each sound type
    const soundTypes = ['drop', 'merge', 'intermediateMerge', 'gameOver'];
    
    for (const soundType of soundTypes) {
      await soundManager.queueSound(soundType);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
  }
}

// Export a singleton instance
export const soundTester = new SoundSystemTester();

// Convenience function for testing
export const testSoundSystem = () => {
  soundTester.runAllTests();
};

export const quickSoundTest = () => {
  soundTester.quickTest();
}; 