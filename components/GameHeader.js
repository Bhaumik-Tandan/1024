import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const GameHeader = ({ score, record, onPause }) => {
  return (
    <View style={styles.topBar}>
      <View style={styles.scoreBox}>
        <Text style={styles.scoreValue}>{score}</Text>
        <Text style={styles.scoreLabel}>Score</Text>
      </View>
      
      <TouchableOpacity style={styles.pauseButton} onPress={onPause} activeOpacity={0.7}>
        <Ionicons name="pause" size={24} color="#ffffff" />
      </TouchableOpacity>
      
      <View style={styles.recordBox}>
        <Text style={styles.recordLabel}>Record</Text>
        <Text style={styles.recordValue}>{record}</Text>
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
  scoreBox: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  pauseButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#444',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  recordBox: {
    backgroundColor: '#4a90e2',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
    minWidth: 70,
    shadowColor: '#4a90e2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
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
});

export default GameHeader; 