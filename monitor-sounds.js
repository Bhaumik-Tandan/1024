/**
 * ===========================
 * REAL-TIME SOUND MONITOR
 * ===========================
 * 
 * Monitor sounds and merges in real-time
 * Run this script to see live logging of all game events
 */

import soundLogger from './utils/soundLogger.js';

// Enable detailed logging
soundLogger.setEnabled(true);

// Set up periodic summary printing
let summaryInterval = setInterval(() => {
  const summary = soundLogger.getSummary();
  if (summary.totalLogs > 0) {
    // Show recent sounds by type
    if (summary.sounds.byType && Object.keys(summary.sounds.byType).length > 0) {
      Object.entries(summary.sounds.byType).forEach(([type, count]) => {
      });
    }
  }
}, 10000); // Print summary every 10 seconds

// Set up periodic detailed log printing
let logInterval = setInterval(() => {
  const recentLogs = soundLogger.getAllLogs().slice(-5); // Get last 5 logs
  if (recentLogs.length > 0) {
    recentLogs.forEach(log => {
      const time = new Date(log.timestamp).toLocaleTimeString();
      switch (log.type) {
        case 'MERGE':
          break;
        case 'SOUND':
          break;
        case 'DROP':
          break;
        case 'CHAIN_REACTION':
          break;
        case 'QUEUE_EVENT':
          break;
        case 'SOUND_COMPLETION':
          break;
      }
    });
  }
}, 5000); // Show recent activity every 5 seconds

// Handle cleanup on exit
process.on('SIGINT', () => {
  clearInterval(summaryInterval);
  clearInterval(logInterval);
  
  soundLogger.printSummary();
  
  const finalLogs = soundLogger.exportLogs();
  
  process.exit(0);
}); 