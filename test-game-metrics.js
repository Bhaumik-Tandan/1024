// Test Game Metrics Analytics
// Run this to verify your metrics tracking system

const gameMetricsAnalytics = require('./utils/gameMetricsAnalytics.js').default;

async function testGameMetrics() {
  console.log('🎮 Game Metrics Analytics Test');
  console.log('================================');
  
  try {
    // Test session start
    console.log('\n📊 Starting test session...');
    await gameMetricsAnalytics.startSession();
    
    // Simulate some game events
    console.log('\n🎯 Tracking game events...');
    await gameMetricsAnalytics.trackGameEvent('test_tile_merge', {
      from_value: 2,
      to_value: 4,
      test_mode: true
    });
    
    // Simulate session end
    console.log('\n⏰ Ending test session...');
    await gameMetricsAnalytics.endSession(1024, 64, 300000);
    
    // Get metrics summary
    console.log('\n📈 Getting metrics summary...');
    const summary = await gameMetricsAnalytics.getMetricsSummary();
    
    if (summary) {
      console.log('\n📊 Current Metrics Summary:');
      console.log('User ID:', summary.userId);
      console.log('Total Sessions:', summary.totalSessions);
      console.log('Total Play Time:', (summary.totalPlayTime / (1000 * 60)).toFixed(2), 'minutes');
      console.log('Total Score:', summary.totalScore);
      console.log('Crash Count:', summary.crashCount);
      console.log('Crash Free Rate:', summary.crashFreeRate.toFixed(2) + '%');
      console.log('Average Session Length:', summary.averageSessionLengthMinutes.toFixed(2), 'minutes');
      
      console.log('\n🎯 Target Achievement Status:');
      console.log('D1 Retention:', summary.meetsTargets.d1Retention ? '✅' : '❌');
      console.log('D7 Retention:', summary.meetsTargets.d7Retention ? '✅' : '❌');
      console.log('5+ Min Sessions:', summary.meetsTargets.sessionLength5min ? '✅' : '❌');
      console.log('99% Crash Free:', summary.meetsTargets.crashFree99 ? '✅' : '❌');
    }
    
    console.log('\n✅ Test completed successfully!');
    console.log('\n📋 Next Steps:');
    console.log('1. Check Firebase Console for events');
    console.log('2. Monitor retention metrics over time');
    console.log('3. Track session length improvements');
    console.log('4. Monitor crash-free rates');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testGameMetrics();
