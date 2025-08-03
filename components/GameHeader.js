import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;
const isTablet = screenWidth >= 768;

const GameHeader = ({ score, record, onPause }) => {
  return (
    <View style={styles.container}>
      {/* Record Display */}
      <View style={styles.recordContainer}>
        <Text style={styles.recordLabel}>RECORD</Text>
        <Text style={styles.recordValue}>{record?.toLocaleString() || '0'}</Text>
      </View>

      {/* Current Score Display */}
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreLabel}>SCORE</Text>
        <Text style={styles.scoreValue}>{score?.toLocaleString() || '0'}</Text>
      </View>

      {/* Pause Button */}
      <TouchableOpacity style={styles.pauseButton} onPress={onPause}>
        <View style={styles.pauseButtonGlow} />
        <MaterialIcons 
          name="pause" 
          size={isTablet ? 32 : 24} 
          color="#E6F3FF" 
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: isTablet ? 30 : 20,
    paddingTop: isTablet ? 25 : 15,
    paddingBottom: isTablet ? 20 : 10,
    backgroundColor: 'transparent',
    zIndex: 100,
  },
  
  // Record section
  recordContainer: {
    alignItems: 'flex-start',
    backgroundColor: 'rgba(26, 42, 78, 0.8)',
    paddingVertical: isTablet ? 12 : 8,
    paddingHorizontal: isTablet ? 18 : 12,
    borderRadius: isTablet ? 16 : 12,
    borderWidth: 1,
    borderColor: 'rgba(155, 89, 182, 0.4)',
    shadowColor: '#9B59B6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    minWidth: isTablet ? 120 : 80,
  },
  recordLabel: {
    color: '#9B59B6',
    fontSize: isTablet ? 13 : 10,
    fontWeight: '600',
    letterSpacing: 1,
    textShadowColor: 'rgba(155, 89, 182, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
    marginBottom: 2,
  },
  recordValue: {
    color: '#FFFFFF',
    fontSize: isTablet ? 22 : 16,
    fontWeight: '700',
    textShadowColor: 'rgba(155, 89, 182, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  
  // Current score section
  scoreContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(26, 42, 78, 0.8)',
    paddingVertical: isTablet ? 12 : 8,
    paddingHorizontal: isTablet ? 18 : 12,
    borderRadius: isTablet ? 16 : 12,
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 226, 0.4)',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    minWidth: isTablet ? 140 : 100,
  },
  scoreLabel: {
    color: '#4A90E2',
    fontSize: isTablet ? 13 : 10,
    fontWeight: '600',
    letterSpacing: 1,
    textShadowColor: 'rgba(74, 144, 226, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
    marginBottom: 2,
  },
  scoreValue: {
    color: '#FFFFFF',
    fontSize: isTablet ? 24 : 18,
    fontWeight: '700',
    textShadowColor: 'rgba(74, 144, 226, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  
  // Pause button
  pauseButton: {
    backgroundColor: 'rgba(26, 42, 78, 0.8)',
    borderRadius: isTablet ? 24 : 20,
    padding: isTablet ? 12 : 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
    position: 'relative',
    overflow: 'hidden',
  },
  pauseButtonGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    borderRadius: isTablet ? 24 : 20,
  },
});

export default GameHeader; 