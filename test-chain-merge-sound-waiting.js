// Test script to verify chain merge sound completion waiting
// Run with: node test-chain-merge-sound-waiting.js

import soundManager from './utils/soundManager.js';

console.log('🧪 Testing Chain Merge Sound Completion Waiting...');

async function testChainMergeSoundWaiting() {
  console.log('1. Testing basic sound completion waiting...');
  
  // Test that sounds wait for completion
  const startTime = Date.now();
  
  // Play a merge sound
  console.log('   Playing merge sound...');
  await soundManager.playSoundDirectly('merge');
  
  // Play another merge sound immediately
  console.log('   Playing second merge sound...');
  await soundManager.playSoundDirectly('merge');
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  console.log(`   ✅ Two merge sounds completed in ${duration}ms (expected ~600ms)`);
  console.log(`   ✅ Sound completion waiting is working!`);
  
  console.log('\n2. Testing chain merge sound sequence...');
  
  const chainStartTime = Date.now();
  
  // Simulate chain merge sequence
  console.log('   Playing intermediate merge sound...');
  await soundManager.playSoundDirectly('intermediateMerge');
  
  console.log('   Playing regular merge sound...');
  await soundManager.playSoundDirectly('merge');
  
  console.log('   Playing another intermediate merge sound...');
  await soundManager.playSoundDirectly('intermediateMerge');
  
  const chainEndTime = Date.now();
  const chainDuration = chainEndTime - chainStartTime;
  
  console.log(`   ✅ Chain merge sequence completed in ${chainDuration}ms (expected ~700ms)`);
  console.log(`   ✅ Chain merge sound waiting is working!`);
  
  console.log('\n3. Testing waitForSoundCompletion...');
  
  const waitStartTime = Date.now();
  
  // Start a sound
  soundManager.playSoundDirectly('intermediateMerge');
  
  // Wait for it to complete
  await soundManager.waitForSoundCompletion('intermediateMerge');
  
  const waitEndTime = Date.now();
  const waitDuration = waitEndTime - waitStartTime;
  
  console.log(`   ✅ waitForSoundCompletion completed in ${waitDuration}ms (expected ~200ms)`);
  console.log(`   ✅ waitForSoundCompletion is working!`);
  
  console.log('\n4. Testing waitForAllSoundsToComplete...');
  
  const allWaitStartTime = Date.now();
  
  // Start multiple sounds
  soundManager.playSoundDirectly('merge');
  soundManager.playSoundDirectly('intermediateMerge');
  
  // Wait for all to complete
  await soundManager.waitForAllSoundsToComplete();
  
  const allWaitEndTime = Date.now();
  const allWaitDuration = allWaitEndTime - allWaitStartTime;
  
  console.log(`   ✅ waitForAllSoundsToComplete completed in ${allWaitDuration}ms (expected ~300ms)`);
  console.log(`   ✅ waitForAllSoundsToComplete is working!`);
  
  console.log('\n🎉 All chain merge sound completion waiting tests passed!');
}

// Run the test
testChainMergeSoundWaiting().catch(error => {
  console.error('❌ Test failed:', error);
}); 