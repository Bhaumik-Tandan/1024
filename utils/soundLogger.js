/**
 * ===========================
 * SOUND & MERGE LOGGER
 * ===========================
 * 
 * Comprehensive logging system for tracking all merges and sounds
 * Provides detailed monitoring of which sounds are played and when
 */

class SoundLogger {
  constructor() {
    this.logs = [];
    this.mergeCount = 0;
    this.soundCount = 0;
    this.chainReactionCount = 0;
    this.dropCount = 0;
    
    // Performance tracking
    this.startTime = Date.now();
    this.lastLogTime = Date.now();
    
    // Enable/disable logging
    this.isEnabled = true;
    
    // console.log('🎵 SoundLogger initialized');
  }

  // Log a merge event
  logMerge(mergeData) {
    if (!this.isEnabled) return;
    
    const timestamp = Date.now();
    const logEntry = {
      type: 'MERGE',
      timestamp,
      timeSinceStart: timestamp - this.startTime,
      timeSinceLastLog: timestamp - this.lastLogTime,
      mergeNumber: ++this.mergeCount,
      ...mergeData
    };
    
    this.logs.push(logEntry);
    this.lastLogTime = timestamp;
    
    // console.log(`🔗 MERGE #${logEntry.mergeNumber} at ${new Date(timestamp).toLocaleTimeString()}:`, {
    //   tiles: logEntry.numberOfTiles,
    //   value: logEntry.originalValue,
    //   newValue: logEntry.newValue,
    //   score: logEntry.score,
    //   isChainReaction: logEntry.isChainReaction,
    //   positions: logEntry.positions,
    //   resultPosition: logEntry.resultPosition
    // });
  }

  // Log a sound event
  logSound(soundData) {
    if (!this.isEnabled) return;
    
    const timestamp = Date.now();
    const logEntry = {
      type: 'SOUND',
      timestamp,
      timeSinceStart: timestamp - this.startTime,
      timeSinceLastLog: timestamp - this.lastLogTime,
      soundNumber: ++this.soundCount,
      ...soundData
    };
    
    this.logs.push(logEntry);
    this.lastLogTime = timestamp;
    
    // console.log(`🎵 SOUND #${logEntry.soundNumber} at ${new Date(timestamp).toLocaleTimeString()}:`, {
    //   soundType: logEntry.soundType,
    //   priority: logEntry.priority,
    //   queueLength: logEntry.queueLength,
    //   isDirectPlay: logEntry.isDirectPlay,
    //   duration: logEntry.estimatedDuration,
    //   enabled: logEntry.soundEnabled,
    //   volume: logEntry.volume
    // });
  }

  // Log a drop event
  logDrop(dropData) {
    if (!this.isEnabled) return;
    
    const timestamp = Date.now();
    const logEntry = {
      type: 'DROP',
      timestamp,
      timeSinceStart: timestamp - this.startTime,
      timeSinceLastLog: timestamp - this.lastLogTime,
      dropNumber: ++this.dropCount,
      ...dropData
    };
    
    this.logs.push(logEntry);
    this.lastLogTime = timestamp;
    
    // console.log(`📦 DROP #${logEntry.dropNumber} at ${new Date(timestamp).toLocaleTimeString()}:`, {
    //   value: logEntry.value,
    //   column: logEntry.column,
    //   row: logEntry.landingRow,
    //   soundTriggered: logEntry.soundTriggered,
    //   soundEnabled: logEntry.soundEnabled
    // });
  }

  // Log a chain reaction event
  logChainReaction(chainData) {
    if (!this.isEnabled) return;
    
    const timestamp = Date.now();
    const logEntry = {
      type: 'CHAIN_REACTION',
      timestamp,
      timeSinceStart: timestamp - this.startTime,
      timeSinceLastLog: timestamp - this.lastLogTime,
      chainNumber: ++this.chainReactionCount,
      ...chainData
    };
    
    this.logs.push(logEntry);
    this.lastLogTime = timestamp;
    
    // console.log(`⚡ CHAIN REACTION #${logEntry.chainNumber} at ${new Date(timestamp).toLocaleTimeString()}:`, {
    //   mergesInChain: logEntry.mergeCount,
    //   totalScore: logEntry.totalScore,
    //   duration: logEntry.duration,
    //   originColumn: logEntry.originColumn
    // });
  }

  // Log a queue event
  logQueueEvent(queueData) {
    if (!this.isEnabled) return;
    
    const timestamp = Date.now();
    const logEntry = {
      type: 'QUEUE_EVENT',
      timestamp,
      timeSinceStart: timestamp - this.startTime,
      timeSinceLastLog: timestamp - this.lastLogTime,
      ...queueData
    };
    
    this.logs.push(logEntry);
    this.lastLogTime = timestamp;
    
    // console.log(`📋 QUEUE EVENT at ${new Date(timestamp).toLocaleTimeString()}:`, {
    //   action: logEntry.action,
    //   soundType: logEntry.soundType,
    //   queueLength: logEntry.queueLength,
    //   isProcessing: logEntry.isProcessing,
    //   priority: logEntry.priority
    // });
  }

  // Log a sound completion event
  logSoundCompletion(completionData) {
    if (!this.isEnabled) return;
    
    const timestamp = Date.now();
    const logEntry = {
      type: 'SOUND_COMPLETION',
      timestamp,
      timeSinceStart: timestamp - this.startTime,
      timeSinceLastLog: timestamp - this.lastLogTime,
      ...completionData
    };
    
    this.logs.push(logEntry);
    this.lastLogTime = timestamp;
    
    // console.log(`✅ SOUND COMPLETION at ${new Date(timestamp).toLocaleTimeString()}:`, {
    //   soundType: logEntry.soundType,
    //   actualDuration: logEntry.actualDuration,
    //   estimatedDuration: logEntry.estimatedDuration,
    //   wasSuccessful: logEntry.wasSuccessful
    // });
  }

  // Get summary statistics
  getSummary() {
    const now = Date.now();
    const totalDuration = now - this.startTime;
    
    const mergeLogs = this.logs.filter(log => log.type === 'MERGE');
    const soundLogs = this.logs.filter(log => log.type === 'SOUND');
    const dropLogs = this.logs.filter(log => log.type === 'DROP');
    const chainLogs = this.logs.filter(log => log.type === 'CHAIN_REACTION');
    
    const summary = {
      totalDuration: totalDuration,
      totalLogs: this.logs.length,
      merges: {
        count: mergeLogs.length,
        averageTiles: mergeLogs.length > 0 ? 
          mergeLogs.reduce((sum, log) => sum + log.numberOfTiles, 0) / mergeLogs.length : 0,
        totalScore: mergeLogs.reduce((sum, log) => sum + log.score, 0),
        chainReactions: mergeLogs.filter(log => log.isChainReaction).length
      },
      sounds: {
        count: soundLogs.length,
        byType: soundLogs.reduce((acc, log) => {
          acc[log.soundType] = (acc[log.soundType] || 0) + 1;
          return acc;
        }, {}),
        successful: soundLogs.filter(log => log.wasSuccessful !== false).length,
        failed: soundLogs.filter(log => log.wasSuccessful === false).length
      },
      drops: {
        count: dropLogs.length,
        withSound: dropLogs.filter(log => log.soundTriggered).length,
        withoutSound: dropLogs.filter(log => !log.soundTriggered).length
      },
      chainReactions: {
        count: chainLogs.length,
        averageMerges: chainLogs.length > 0 ? 
          chainLogs.reduce((sum, log) => sum + log.mergeCount, 0) / chainLogs.length : 0,
        totalScore: chainLogs.reduce((sum, log) => sum + log.totalScore, 0)
      }
    };
    
    return summary;
  }

  // Print summary to console
  printSummary() {
    const summary = this.getSummary();
    
    // console.log('\n🎵 ===== SOUND & MERGE LOG SUMMARY =====');
    // console.log(`⏱️  Total Duration: ${summary.totalDuration}ms (${(summary.totalDuration / 1000).toFixed(1)}s)`);
    // console.log(`📊 Total Logs: ${summary.totalLogs}`);
    // console.log('');
    
    // console.log('🔗 MERGES:');
    // console.log(`   Count: ${summary.merges.count}`);
    // console.log(`   Average tiles per merge: ${summary.merges.averageTiles.toFixed(1)}`);
    // console.log(`   Total score: ${summary.merges.totalScore}`);
    // console.log(`   Chain reactions: ${summary.merges.chainReactions}`);
    // console.log('');
    
    // console.log('🎵 SOUNDS:');
    // console.log(`   Total: ${summary.sounds.count}`);
    // console.log(`   Successful: ${summary.sounds.successful}`);
    // console.log(`   Failed: ${summary.sounds.failed}`);
    // console.log('   By type:');
    // Object.entries(summary.sounds.byType).forEach(([type, count]) => {
    //   console.log(`     ${type}: ${count}`);
    // });
    // console.log('');
    
    // console.log('📦 DROPS:');
    // console.log(`   Total: ${summary.drops.count}`);
    // console.log(`   With sound: ${summary.drops.withSound}`);
    // console.log(`   Without sound: ${summary.drops.withoutSound}`);
    // console.log('');
    
    // console.log('⚡ CHAIN REACTIONS:');
    // console.log(`   Count: ${summary.chainReactions.count}`);
    // console.log(`   Average merges per chain: ${summary.chainReactions.averageMerges.toFixed(1)}`);
    // console.log(`   Total score: ${summary.chainReactions.totalScore}`);
    // console.log('=====================================\n');
  }

  // Get all logs
  getAllLogs() {
    return [...this.logs];
  }

  // Get logs by type
  getLogsByType(type) {
    return this.logs.filter(log => log.type === type);
  }

  // Clear all logs
  clearLogs() {
    this.logs = [];
    this.mergeCount = 0;
    this.soundCount = 0;
    this.chainReactionCount = 0;
    this.dropCount = 0;
    this.startTime = Date.now();
    this.lastLogTime = Date.now();
    // console.log('🗑️ SoundLogger: All logs cleared');
  }

  // Enable/disable logging
  setEnabled(enabled) {
    this.isEnabled = enabled;
    // console.log(`🎵 SoundLogger: ${enabled ? 'enabled' : 'disabled'}`);
  }

  // Export logs as JSON
  exportLogs() {
    return {
      summary: this.getSummary(),
      logs: this.logs,
      exportTime: new Date().toISOString()
    };
  }
}

// Create singleton instance
const soundLogger = new SoundLogger();
export default soundLogger; 