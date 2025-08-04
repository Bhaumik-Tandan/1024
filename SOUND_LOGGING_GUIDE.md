# Sound & Merge Logging System

## Overview

This comprehensive logging system tracks all merges and sounds in your 1024 game, providing detailed monitoring of which sounds are played and when. The system automatically logs:

- **All merge events** with tile counts, values, and positions
- **All sound events** with timing, success/failure status, and queue information
- **All drop events** with positions and sound trigger status
- **Chain reactions** with duration, merge count, and total score
- **Queue events** showing sound processing and priorities
- **Sound completion events** with actual vs estimated duration

## How It Works

### Automatic Logging

The system is automatically integrated into your existing code:

1. **Merge Logging**: All merges are logged in `checkAndMergeConnectedGroup()` with:
   - Number of tiles merged
   - Original and new values
   - Score gained
   - Whether it's part of a chain reaction
   - All tile positions and result position

2. **Sound Logging**: All sounds are logged in `soundManager.js` and `vibration.js` with:
   - Sound type (merge, intermediateMerge, drop, gameOver)
   - Priority level
   - Queue length and processing status
   - Success/failure status
   - Actual vs estimated duration

3. **Drop Logging**: All drops are logged in `processTileDrop()` with:
   - Tile value and landing position
   - Whether sound was triggered
   - Sound enabled status

4. **Chain Reaction Logging**: Chain reactions are logged in `processChainReactions()` with:
   - Number of merges in the chain
   - Total score gained
   - Duration of the chain
   - Origin column

### Real-Time Monitoring

You can monitor the logs in real-time using the provided scripts:

```bash
# Run the test script to see the logging system in action
node test-sound-logging.js

# Run the real-time monitor to see live logs
node monitor-sounds.js
```

## Usage Examples

### Basic Logging

```javascript
import soundLogger from './utils/soundLogger.js';

// Log a merge event
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

// Log a sound event
soundLogger.logSound({
  soundType: 'merge',
  priority: 3,
  queueLength: 2,
  isDirectPlay: true,
  estimatedDuration: 300,
  soundEnabled: true,
  volume: 0.7
});
```

### Getting Statistics

```javascript
// Get comprehensive summary
const summary = soundLogger.getSummary();
console.log(`Total merges: ${summary.merges.count}`);
console.log(`Total sounds: ${summary.sounds.count}`);
console.log(`Successful sounds: ${summary.sounds.successful}`);
console.log(`Failed sounds: ${summary.sounds.failed}`);

// Print formatted summary to console
soundLogger.printSummary();
```

### Exporting Data

```javascript
// Export all logs as JSON
const exportedData = soundLogger.exportLogs();
console.log('Summary:', exportedData.summary);
console.log('All logs:', exportedData.logs);
console.log('Export time:', exportedData.exportTime);
```

### Filtering Logs

```javascript
// Get all merge logs
const mergeLogs = soundLogger.getLogsByType('MERGE');

// Get all sound logs
const soundLogs = soundLogger.getLogsByType('SOUND');

// Get all drop logs
const dropLogs = soundLogger.getLogsByType('DROP');

// Get all chain reaction logs
const chainLogs = soundLogger.getLogsByType('CHAIN_REACTION');
```

### Managing Logs

```javascript
// Clear all logs
soundLogger.clearLogs();

// Enable/disable logging
soundLogger.setEnabled(false); // Disable logging
soundLogger.setEnabled(true);  // Enable logging
```

## Log Types

### MERGE Logs
- `numberOfTiles`: Number of tiles merged
- `originalValue`: Original tile value
- `newValue`: New tile value after merge
- `score`: Score gained from merge
- `isChainReaction`: Whether part of a chain reaction
- `positions`: Array of all tile positions
- `resultPosition`: Where the merged tile appears

### SOUND Logs
- `soundType`: Type of sound (merge, intermediateMerge, drop, gameOver)
- `priority`: Sound priority (1-5)
- `queueLength`: Number of sounds in queue
- `isDirectPlay`: Whether played directly or queued
- `estimatedDuration`: Expected sound duration
- `soundEnabled`: Whether sound is enabled
- `volume`: Current volume level
- `wasSuccessful`: Whether sound played successfully

### DROP Logs
- `value`: Tile value dropped
- `column`: Column where tile was dropped
- `landingRow`: Row where tile landed
- `soundTriggered`: Whether drop sound was triggered
- `soundEnabled`: Whether sound is enabled

### CHAIN_REACTION Logs
- `mergeCount`: Number of merges in the chain
- `totalScore`: Total score gained
- `duration`: Duration of the chain reaction
- `originColumn`: Column where the chain started

### QUEUE_EVENT Logs
- `action`: Queue action (ADD_TO_QUEUE, PROCESS_SOUND, etc.)
- `soundType`: Type of sound being queued
- `queueLength`: Current queue length
- `isProcessing`: Whether queue is being processed
- `priority`: Sound priority

### SOUND_COMPLETION Logs
- `soundType`: Type of sound that completed
- `actualDuration`: Actual time sound played
- `estimatedDuration`: Expected duration
- `wasSuccessful`: Whether sound completed successfully
- `error`: Error message if failed

## Console Output

The system provides rich console output with emojis and timestamps:

```
🔗 MERGE #1 at 2:30:45 PM: {
  tiles: 3,
  value: 2,
  newValue: 8,
  score: 8,
  isChainReaction: false,
  positions: [...],
  resultPosition: { row: 2, col: 4 }
}

🎵 SOUND #3 at 2:30:45 PM: {
  soundType: 'merge',
  priority: 3,
  queueLength: 2,
  isDirectPlay: true,
  duration: 300,
  enabled: true,
  volume: 0.7
}

📦 DROP #2 at 2:30:44 PM: {
  value: 2,
  column: 3,
  row: 2,
  soundTriggered: true,
  soundEnabled: true
}
```

## Performance Impact

The logging system is designed to be lightweight:

- **Minimal overhead**: Logs are stored in memory with automatic cleanup
- **Conditional logging**: Can be disabled with `soundLogger.setEnabled(false)`
- **Efficient storage**: Only essential data is logged
- **Non-blocking**: All logging operations are asynchronous

## Troubleshooting

### No logs appearing?
1. Check if logging is enabled: `soundLogger.setEnabled(true)`
2. Verify the game is actually triggering merges and sounds
3. Check console for any error messages

### Too many logs?
1. Use `soundLogger.clearLogs()` to clear old logs
2. Disable logging temporarily: `soundLogger.setEnabled(false)`
3. Filter logs by type: `soundLogger.getLogsByType('MERGE')`

### Performance issues?
1. Disable logging: `soundLogger.setEnabled(false)`
2. Clear logs periodically: `soundLogger.clearLogs()`
3. Export and clear logs: `soundLogger.exportLogs(); soundLogger.clearLogs()`

## Integration with Existing Code

The logging system is automatically integrated into your existing code:

- **No changes needed** to your game logic
- **Backward compatible** with existing sound system
- **Optional logging** that can be enabled/disabled
- **Non-intrusive** design that doesn't affect gameplay

## Advanced Usage

### Custom Logging
You can add custom logging for specific events:

```javascript
// Log a custom game event
soundLogger.logSound({
  soundType: 'custom',
  priority: 1,
  queueLength: 0,
  isDirectPlay: true,
  estimatedDuration: 100,
  soundEnabled: true,
  volume: 0.5,
  customData: { event: 'powerup_activated' }
});
```

### Analytics Integration
Export logs for analytics:

```javascript
// Export logs for analysis
const gameSession = soundLogger.exportLogs();

// Send to analytics service
fetch('/api/game-analytics', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(gameSession)
});
```

### Debug Mode
Enable detailed debugging:

```javascript
// Enable debug mode for more detailed logs
soundLogger.setEnabled(true);
console.log('Debug mode enabled - all events will be logged');
```

This comprehensive logging system gives you complete visibility into your game's sound and merge behavior, making it easy to monitor, debug, and optimize your audio experience. 