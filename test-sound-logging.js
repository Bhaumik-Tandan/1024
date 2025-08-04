/**
 * ===========================
 * SOUND & MERGE LOGGING TEST
 * ===========================
 * 
 * Test script to demonstrate the comprehensive logging system
 * Shows how to monitor all merges and sounds in real-time
 */

import soundLogger from './utils/soundLogger.js';
import soundManager from './utils/soundManager.js';
import { vibrateOnMerge, vibrateOnIntermediateMerge, vibrateOnTouch } from './utils/vibration.js';

console.log('🎵 Starting Sound & Merge Logging Test...\n');

// Test 1: Simulate a drop event
console.log('📦 Test 1: Simulating a drop event...');
soundLogger.logDrop({
  value: 2,
  column: 3,
  landingRow: 2,
  soundTriggered: true,
  soundEnabled: true
});

// Test 2: Simulate a merge event
console.log('\n🔗 Test 2: Simulating a merge event...');
soundLogger.logMerge({
  numberOfTiles: 3,
  originalValue: 2,
  newValue: 8,
  score: 8,
  isChainReaction: false,
  positions: [
    { row: 2, col: 3, value: 2 },
    { row: 2, col: 4, value: 2 },
    { row: 2, col: 5, value: 2 }
  ],
  resultPosition: { row: 2, col: 4 }
});

// Test 3: Simulate a chain reaction
console.log('\n⚡ Test 3: Simulating a chain reaction...');
soundLogger.logChainReaction({
  mergeCount: 4,
  totalScore: 32,
  duration: 1200,
  originColumn: 3
});

// Test 4: Simulate sound events
console.log('\n🎵 Test 4: Simulating sound events...');
soundLogger.logSound({
  soundType: 'merge',
  priority: 3,
  queueLength: 2,
  isDirectPlay: true,
  estimatedDuration: 300,
  soundEnabled: true,
  volume: 0.7
});

soundLogger.logSound({
  soundType: 'drop',
  priority: 1,
  queueLength: 1,
  isDirectPlay: false,
  estimatedDuration: 150,
  soundEnabled: true,
  volume: 0.7
});

// Test 5: Simulate queue events
console.log('\n📋 Test 5: Simulating queue events...');
soundLogger.logQueueEvent({
  action: 'ADD_TO_QUEUE',
  soundType: 'merge',
  queueLength: 3,
  isProcessing: true,
  priority: 3
});

soundLogger.logQueueEvent({
  action: 'PROCESS_SOUND',
  soundType: 'drop',
  queueLength: 2,
  isProcessing: true,
  priority: 1
});

// Test 6: Simulate sound completion
console.log('\n✅ Test 6: Simulating sound completion...');
soundLogger.logSoundCompletion({
  soundType: 'merge',
  actualDuration: 285,
  estimatedDuration: 300,
  wasSuccessful: true
});

soundLogger.logSoundCompletion({
  soundType: 'drop',
  actualDuration: 0,
  estimatedDuration: 150,
  wasSuccessful: false,
  error: 'Audio player not initialized'
});

// Print comprehensive summary
console.log('\n📊 Printing comprehensive summary...');
soundLogger.printSummary();

// Test 7: Export logs
console.log('\n💾 Test 7: Exporting logs...');
const exportedLogs = soundLogger.exportLogs();
console.log('Exported logs structure:', Object.keys(exportedLogs));
console.log('Total logs exported:', exportedLogs.logs.length);

// Test 8: Get logs by type
console.log('\n🔍 Test 8: Getting logs by type...');
const mergeLogs = soundLogger.getLogsByType('MERGE');
const soundLogs = soundLogger.getLogsByType('SOUND');
const dropLogs = soundLogger.getLogsByType('DROP');

console.log(`Merge logs: ${mergeLogs.length}`);
console.log(`Sound logs: ${soundLogs.length}`);
console.log(`Drop logs: ${dropLogs.length}`);

// Test 9: Clear logs
console.log('\n🗑️ Test 9: Clearing logs...');
soundLogger.clearLogs();
console.log('Logs cleared. New summary:');
soundLogger.printSummary();

console.log('\n✅ Sound & Merge Logging Test completed!');
console.log('\n🎵 To monitor sounds and merges in your game:');
console.log('1. All merges are automatically logged with details');
console.log('2. All sounds are logged with timing and success status');
console.log('3. Chain reactions are tracked with duration and score');
console.log('4. Drop events are logged with sound trigger status');
console.log('5. Use soundLogger.printSummary() to see statistics');
console.log('6. Use soundLogger.exportLogs() to get all data');
console.log('7. Use soundLogger.setEnabled(false) to disable logging'); 