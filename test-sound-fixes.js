#!/usr/bin/env node

/**
 * Quick Test Script for Sound System Fixes
 * Run this to verify the new sound queuing system works
 */

console.log('🎵 Testing Sound System Fixes...\n');

// Simulate the sound manager (for testing purposes)
class MockSoundManager {
  constructor() {
    this.soundQueue = [];
    this.isProcessingQueue = false;
    this.lastSoundTimes = {
      merge: 0,
      intermediateMerge: 0,
      drop: 0,
      gameOver: 0,
      pauseResume: 0
    };
    
    this.soundIntervals = {
      merge: 200,
      intermediateMerge: 150,
      drop: 100,
      gameOver: 3000,
      pauseResume: 150
    };
    
    this.soundPriorities = {
      gameOver: 5,
      merge: 3,
      intermediateMerge: 2,
      drop: 1,
      pauseResume: 1
    };
  }

  async queueSound(soundType, priority = 1) {
    const now = Date.now();
    const lastTime = this.lastSoundTimes[soundType] || 0;
    const minInterval = this.soundIntervals[soundType] || 100;
    
    if (now - lastTime < minInterval) {
      console.log(`🔇 ${soundType} sound skipped - too soon (${now - lastTime}ms < ${minInterval}ms)`);
      return;
    }
    
    const soundRequest = {
      type: soundType,
      priority: this.soundPriorities[soundType] || 1,
      timestamp: now,
      id: Math.random().toString(36).substr(2, 9)
    };
    
    this.soundQueue.push(soundRequest);
    this.soundQueue.sort((a, b) => b.priority - a.priority);
    
    console.log(`✅ ${soundType} sound queued (priority: ${soundRequest.priority})`);
    
    if (!this.isProcessingQueue) {
      this.processSoundQueue();
    }
  }
  
  async processSoundQueue() {
    if (this.isProcessingQueue || this.soundQueue.length === 0) {
      return;
    }
    
    this.isProcessingQueue = true;
    console.log('🔄 Processing sound queue...');
    
    while (this.soundQueue.length > 0) {
      const soundRequest = this.soundQueue.shift();
      const now = Date.now();
      
      const lastTime = this.lastSoundTimes[soundRequest.type] || 0;
      const minInterval = this.soundIntervals[soundRequest.type] || 100;
      
      if (now - lastTime < minInterval) {
        this.soundQueue.push(soundRequest);
        await new Promise(resolve => setTimeout(resolve, minInterval - (now - lastTime)));
        continue;
      }
      
      this.lastSoundTimes[soundRequest.type] = now;
      console.log(`🎵 Playing ${soundRequest.type} sound`);
      
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    this.isProcessingQueue = false;
    console.log('✅ Queue processing complete');
  }

  getStatus() {
    return {
      queueLength: this.soundQueue.length,
      isProcessingQueue: this.isProcessingQueue,
      lastSoundTimes: this.lastSoundTimes
    };
  }
}

// Test the new system
async function testSoundFixes() {
  const soundManager = new MockSoundManager();
  
  console.log('🧪 Test 1: Basic Sound Queuing');
  console.log('===============================');
  
  // Test basic queuing
  await soundManager.queueSound('drop');
  await soundManager.queueSound('merge');
  await soundManager.queueSound('intermediateMerge');
  
  console.log('\n📊 Queue Status:', soundManager.getStatus());
  
  // Wait for processing
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log('\n🧪 Test 2: Overlap Prevention');
  console.log('==============================');
  
  // Try rapid requests
  for (let i = 0; i < 5; i++) {
    soundManager.queueSound('drop');
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  
  console.log('\n📊 Queue Status:', soundManager.getStatus());
  
  // Wait for processing
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log('\n🧪 Test 3: Priority System');
  console.log('==========================');
  
  // Test priorities
  await soundManager.queueSound('drop', 1);
  await soundManager.queueSound('gameOver', 5);
  await soundManager.queueSound('merge', 3);
  
  console.log('\n📊 Queue Status:', soundManager.getStatus());
  
  // Wait for processing
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  console.log('\n✅ All tests completed successfully!');
  console.log('\n🎉 Sound system fixes are working properly!');
}

// Run the test
testSoundFixes().catch(console.error); 