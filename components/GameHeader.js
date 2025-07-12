import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const GameHeader = ({ score, record, coins, rank = '#234864th' }) => {
  return (
    <View style={styles.topBar}>
      <View style={styles.rankBox}>
        <Text style={styles.rankLabel}>Rank</Text>
        <Text style={styles.rankValue}>{rank}</Text>
      </View>
      <View style={styles.scoreBox}>
        <Text style={styles.scoreValue}>{score}</Text>
        <Text style={styles.scoreLabel}>Score</Text>
      </View>
      <View style={styles.recordBox}>
        <Text style={styles.recordLabel}>Record</Text>
        <Text style={styles.recordValue}>{record}</Text>
      </View>
      <View style={styles.coinsBox}>
        <Text style={styles.coinsValue}>{coins}</Text>
        <Text style={styles.coinsLabel}>Coins</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  rankBox: {
    backgroundColor: '#444',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    minWidth: 70,
  },
  rankLabel: {
    color: '#aaa',
    fontSize: 10,
    fontWeight: '600',
  },
  rankValue: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 2,
  },
  scoreBox: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 8,
    alignItems: 'center',
    minWidth: 80,
  },
  scoreValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  scoreLabel: {
    color: '#aaa',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  recordBox: {
    backgroundColor: '#4a90e2',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    minWidth: 70,
  },
  recordLabel: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  recordValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 2,
  },
  coinsBox: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    minWidth: 70,
  },
  coinsValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  coinsLabel: {
    color: '#aaa',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
});

export default GameHeader; 