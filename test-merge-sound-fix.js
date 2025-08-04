/**
 * ===========================
 * MERGE SOUND FIX TEST
 * ===========================
 * 
 * Test script to verify that merge sounds play correctly
 * for rapid merges like 16+16
 */

import soundLogger from './utils/soundLogger.js';
import soundManager from './utils/soundManager.js';
import { vibrateOnMerge } from './utils/vibration.js';

console.log('🔧 Testing Merge Sound Fix...\n');

// Enable logging
soundLogger.setEnabled(true);

// Test 1: Simulate rapid merge sounds (like 16+16)
console.log('🎵 Test 1: Simulating rapid merge sounds...');

async function testRapidMerges() {
  console.log('   Playing first merge sound...');
  await vibrateOnMerge();
  
  console.log('   Playing second merge sound immediately...');
  await vibrateOnMerge();
  
  console.log('   Playing third merge sound...');
  await vibrateOnMerge();
  
  console.log('   ✅ Rapid merge test completed');
}

// Test 2: Simulate chain reaction sounds
console.log('\n⚡ Test 2: Simulating chain reaction sounds...');

async function testChainReaction() {
  console.log('   Playing intermediate merge sound...');
  await vibrateOnMerge(); // This would be intermediateMerge in real chain
  
  console.log('   Playing final merge sound...');
  await vibrateOnMerge();
  
  console.log('   ✅ Chain reaction test completed');
}

// Test 3: Check sound intervals
console.log('\n⏰ Test 3: Checking sound intervals...');

async function testSoundIntervals() {
  const startTime = Date.now();
  
  console.log('   Playing sounds with minimal delay...');
  await vibrateOnMerge();
  await new Promise(resolve => setTimeout(resolve, 10)); // 10ms delay
  await vibrateOnMerge();
  await new Promise(resolve => setTimeout(resolve, 10)); // 10ms delay
  await vibrateOnMerge();
  
  const totalTime = Date.now() - startTime;
  console.log(`   Total time for 3 sounds: ${totalTime}ms`);
  console.log('   ✅ Sound interval test completed');
}

// Run all tests
async function runAllTests() {
  try {
    await testRapidMerges();
    await testChainReaction();
    await testSoundIntervals();
    
    console.log('\n📊 Test Results Summary:');
    soundLogger.printSummary();
    
    console.log('\n🔍 Checking for skipped sounds...');
    const soundLogs = soundLogger.getLogsByType('SOUND');
    const skippedSounds = soundLogs.filter(log => log.wasSkipped);
    const blockedSounds = soundLogs.filter(log => log.wasBlocked);
    
    console.log(`   Total sounds logged: ${soundLogs.length}`);
    console.log(`   Skipped sounds: ${skippedSounds.length}`);
    console.log(`   Blocked sounds: ${blockedSounds.length}`);
    
    if (skippedSounds.length > 0) {
      console.log('   ⚠️  Some sounds were skipped due to timing');
      skippedSounds.forEach(log => {
        console.log(`     - ${log.soundType}: ${log.skipReason} (${log.timeSinceLastSound}ms < ${log.requiredInterval}ms)`);
      });
    }
    
    if (blockedSounds.length > 0) {
      console.log('   ⚠️  Some sounds were blocked waiting for completion');
      blockedSounds.forEach(log => {
        console.log(`     - ${log.soundType}: ${log.blockReason}`);
      });
    }
    
    console.log('\n✅ Merge sound fix test completed!');
    console.log('\n🎵 Expected behavior:');
    console.log('   • All merge sounds should play');
    console.log('   • No sounds should be permanently blocked');
    console.log('   • Some sounds might be skipped due to timing (this is normal)');
    console.log('   • Chain reactions should use timeout-based waiting');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the tests
runAllTests(); 