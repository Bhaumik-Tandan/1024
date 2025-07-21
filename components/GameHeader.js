import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useGameStore from '../store/gameStore';

const GameHeader = ({ score, record, onPause }) => {
  return (
    <View style={[styles.topBar, styles.topBarDark]}>
      <View style={[styles.scoreBox, styles.scoreBoxDark]}>
        <Text style={[styles.scoreValue, styles.textLight]}>{score}</Text>
        <Text style={[styles.scoreLabel, styles.labelLight]}>Score</Text>
      </View>
      
      <TouchableOpacity style={[styles.pauseButton, styles.pauseButtonDark]} onPress={onPause} activeOpacity={0.7}>
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
    borderBottomWidth: 1,
  },
  topBarDark: {
    backgroundColor: '#1a1a1a',
    borderBottomColor: '#333',
  },
  topBarLight: {
    backgroundColor: '#f8f9fa',
    borderBottomColor: '#dee2e6',
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  scoreBox: {
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
  scoreBoxDark: {
    backgroundColor: '#2a2a2a',
  },
  scoreBoxLight: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dee2e6',
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  textLight: {
    color: '#fff',
  },
  textDark: {
    color: '#212529',
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  labelLight: {
    color: '#aaa',
  },
  labelDark: {
    color: '#6c757d',
  },
  pauseButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  pauseButtonDark: {
    backgroundColor: '#444',
  },
  pauseButtonLight: {
    backgroundColor: '#f0f0f0',
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