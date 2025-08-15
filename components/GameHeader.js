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
          size={isTablet ? 28 : 20} 
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
    paddingHorizontal: isTablet ? 20 : 15,
    paddingTop: isTablet ? 15 : 10,
    paddingBottom: isTablet ? 8 : 6,
    backgroundColor: 'transparent',
    zIndex: 100,
    marginTop: 0, // Reverted back to original spacing
  },
  
  // Record section
  recordContainer: {
    alignItems: 'flex-start',
    backgroundColor: 'rgba(26, 42, 78, 0.8)',
    paddingVertical: isTablet ? 8 : 6,
    paddingHorizontal: isTablet ? 14 : 10,
    borderRadius: isTablet ? 12 : 10,
    borderWidth: 1,
    borderColor: 'rgba(155, 89, 182, 0.4)',
    shadowColor: '#9B59B6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
    minWidth: isTablet ? 100 : 70,
  },
  recordLabel: {
    color: '#9B59B6',
    fontSize: isTablet ? 11 : 9,
    fontWeight: '600',
    letterSpacing: 1,
    textShadowColor: 'rgba(155, 89, 182, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
    marginBottom: 1,
  },
  recordValue: {
    color: '#FFFFFF',
    fontSize: isTablet ? 18 : 14,
    fontWeight: '700',
    textShadowColor: 'rgba(155, 89, 182, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  
  // Current score section
  scoreContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(26, 42, 78, 0.8)',
    paddingVertical: isTablet ? 8 : 6,
    paddingHorizontal: isTablet ? 14 : 10,
    borderRadius: isTablet ? 12 : 10,
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 226, 0.4)',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
    minWidth: isTablet ? 120 : 85,
  },
  scoreLabel: {
    color: '#4A90E2',
    fontSize: isTablet ? 11 : 9,
    fontWeight: '600',
    letterSpacing: 1,
    textShadowColor: 'rgba(74, 144, 226, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
    marginBottom: 1,
  },
  scoreValue: {
    color: '#FFFFFF',
    fontSize: isTablet ? 20 : 16,
    fontWeight: '700',
    textShadowColor: 'rgba(74, 144, 226, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  
  // Pause button
  pauseButton: {
    backgroundColor: 'rgba(26, 42, 78, 0.8)',
    borderRadius: isTablet ? 20 : 16,
    padding: isTablet ? 10 : 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
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
    borderRadius: isTablet ? 20 : 16,
  },
});

export default GameHeader; 