/**
 * ===========================
 * CHAIN REACTION SOUND TEST
 * ===========================
 * 
 * Test script to verify that chain reactions use the correct sounds:
 * - Intermediate merge sound for intermediate merges
 * - Final merge sound for final merges
 */

import soundLogger from './utils/soundLogger.js';
import soundManager from './utils/soundManager.js';
import { vibrateOnMerge, vibrateOnIntermediateMerge } from './utils/vibration.js';

console.log('⚡ Testing Chain Reaction Sound Logic...\n');

// Enable logging
soundLogger.setEnabled(true);

// Test 1: Simulate a chain reaction with intermediate and final merges
console.log('🎵 Test 1: Simulating chain reaction sounds...');

async function testChainReactionSounds() {
  console.log('   Playing intermediate merge sound (first merge in chain)...');
  await vibrateOnIntermediateMerge();
  
  console.log('   Playing final merge sound (last merge in chain)...');
  await vibrateOnMerge();
  
  console.log('   ✅ Chain reaction sound test completed');
}

// Test 2: Check sound types in logs
console.log('\n🔍 Test 2: Checking sound types in logs...');

function checkSoundTypes() {
  const soundLogs = soundLogger.getLogsByType('SOUND');
  const mergeSounds = soundLogs.filter(log => log.soundType === 'merge');
  const intermediateSounds = soundLogs.filter(log => log.soundType === 'intermediateMerge');
  
  console.log(`   Total sounds logged: ${soundLogs.length}`);
  console.log(`   Final merge sounds: ${mergeSounds.length}`);
  console.log(`   Intermediate merge sounds: ${intermediateSounds.length}`);
  
  console.log('\n   Sound details:');
  soundLogs.forEach((log, index) => {
    const mergeType = log.mergeType || 'unknown';
    console.log(`     ${index + 1}. ${log.soundType} (${mergeType}) at ${new Date(log.timestamp).toLocaleTimeString()}`);
  });
}

// Test 3: Simulate multiple chain reactions
console.log('\n🔄 Test 3: Simulating multiple chain reactions...');

async function testMultipleChainReactions() {
  console.log('   Chain Reaction 1:');
  console.log('     - Intermediate merge');
  await vibrateOnIntermediateMerge();
  console.log('     - Final merge');
  await vibrateOnMerge();
  
  console.log('   Chain Reaction 2:');
  console.log('     - Intermediate merge');
  await vibrateOnIntermediateMerge();
  console.log('     - Final merge');
  await vibrateOnMerge();
  
  console.log('   ✅ Multiple chain reactions test completed');
}

// Run all tests
async function runAllTests() {
  try {
    await testChainReactionSounds();
    checkSoundTypes();
    await testMultipleChainReactions();
    
    console.log('\n📊 Test Results Summary:');
    soundLogger.printSummary();
    
    console.log('\n🔍 Detailed Sound Analysis:');
    const soundLogs = soundLogger.getLogsByType('SOUND');
    const mergeSounds = soundLogs.filter(log => log.soundType === 'merge');
    const intermediateSounds = soundLogs.filter(log => log.soundType === 'intermediateMerge');
    
    console.log(`   Final merge sounds: ${mergeSounds.length}`);
    mergeSounds.forEach(log => {
      console.log(`     - ${new Date(log.timestamp).toLocaleTimeString()}: ${log.mergeType || 'unknown'}`);
    });
    
    console.log(`   Intermediate merge sounds: ${intermediateSounds.length}`);
    intermediateSounds.forEach(log => {
      console.log(`     - ${new Date(log.timestamp).toLocaleTimeString()}: ${log.mergeType || 'unknown'}`);
    });
    
    console.log('\n✅ Chain reaction sound test completed!');
    console.log('\n🎵 Expected behavior:');
    console.log('   • Intermediate merges should use intermediateMerge sound');
    console.log('   • Final merges should use merge sound');
    console.log('   • Chain reactions should have both types of sounds');
    console.log('   • Regular merges should only use merge sound');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the tests
runAllTests(); 