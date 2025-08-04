/**
 * ===========================
 * REAL-TIME SOUND MONITOR
 * ===========================
 * 
 * Monitor sounds and merges in real-time
 * Run this script to see live logging of all game events
 */

import soundLogger from './utils/soundLogger.js';

console.log('🎵 Real-Time Sound & Merge Monitor');
console.log('====================================');
console.log('This monitor will show all sounds and merges as they happen');
console.log('Press Ctrl+C to stop monitoring\n');

// Enable detailed logging
soundLogger.setEnabled(true);

// Set up periodic summary printing
let summaryInterval = setInterval(() => {
  const summary = soundLogger.getSummary();
  if (summary.totalLogs > 0) {
    console.log('\n📊 Live Summary (last 10 seconds):');
    console.log(`   Total Events: ${summary.totalLogs}`);
    console.log(`   Merges: ${summary.merges.count}`);
    console.log(`   Sounds: ${summary.sounds.count}`);
    console.log(`   Drops: ${summary.drops.count}`);
    console.log(`   Chain Reactions: ${summary.chainReactions.count}`);
    
    // Show recent sounds by type
    if (summary.sounds.byType && Object.keys(summary.sounds.byType).length > 0) {
      console.log('   Recent Sounds:');
      Object.entries(summary.sounds.byType).forEach(([type, count]) => {
        console.log(`     ${type}: ${count}`);
      });
    }
  }
}, 10000); // Print summary every 10 seconds

// Set up periodic detailed log printing
let logInterval = setInterval(() => {
  const recentLogs = soundLogger.getAllLogs().slice(-5); // Get last 5 logs
  if (recentLogs.length > 0) {
    console.log('\n🔄 Recent Activity:');
    recentLogs.forEach(log => {
      const time = new Date(log.timestamp).toLocaleTimeString();
      switch (log.type) {
        case 'MERGE':
          console.log(`   ${time} 🔗 MERGE: ${log.numberOfTiles} tiles (${log.originalValue}→${log.newValue})`);
          break;
        case 'SOUND':
          console.log(`   ${time} 🎵 SOUND: ${log.soundType} (${log.wasSuccessful ? '✅' : '❌'})`);
          break;
        case 'DROP':
          console.log(`   ${time} 📦 DROP: value ${log.value} in column ${log.column}`);
          break;
        case 'CHAIN_REACTION':
          console.log(`   ${time} ⚡ CHAIN: ${log.mergeCount} merges, ${log.totalScore} points`);
          break;
        case 'QUEUE_EVENT':
          console.log(`   ${time} 📋 QUEUE: ${log.action} ${log.soundType}`);
          break;
        case 'SOUND_COMPLETION':
          console.log(`   ${time} ✅ COMPLETE: ${log.soundType} (${log.actualDuration}ms)`);
          break;
      }
    });
  }
}, 5000); // Show recent activity every 5 seconds

// Handle cleanup on exit
process.on('SIGINT', () => {
  console.log('\n\n🛑 Stopping monitor...');
  clearInterval(summaryInterval);
  clearInterval(logInterval);
  
  console.log('\n📊 Final Summary:');
  soundLogger.printSummary();
  
  console.log('\n💾 Exporting final logs...');
  const finalLogs = soundLogger.exportLogs();
  console.log(`Total events logged: ${finalLogs.logs.length}`);
  console.log(`Session duration: ${finalLogs.summary.totalDuration}ms`);
  
  console.log('\n✅ Monitor stopped. Goodbye!');
  process.exit(0);
});

console.log('🎮 Start playing your game to see live logs!');
console.log('The monitor will show:');
console.log('  • All merge events with tile counts and values');
console.log('  • All sound events with success/failure status');
console.log('  • All drop events with positions');
console.log('  • Chain reactions with duration and score');
console.log('  • Queue events showing sound processing');
console.log('  • Sound completion events with timing');
console.log('\nPress Ctrl+C to stop monitoring and see final summary\n'); 