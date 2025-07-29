import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { THEME, FONT_SIZES } from './constants';

const GameHeader = ({ score, record, onPause }) => {
  return (
    <View style={styles.header}>
      {/* Score Section */}
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreLabel}>SCORE</Text>
        <Text style={styles.scoreValue}>{score.toLocaleString()}</Text>
      </View>

      {/* Pause Button */}
      <TouchableOpacity 
        style={styles.pauseButton} 
        onPress={onPause}
        activeOpacity={0.8}
      >
        <View style={styles.pauseIcon}>
          <View style={styles.pauseBar} />
          <View style={styles.pauseBar} />
        </View>
      </TouchableOpacity>

      {/* Record Section */}
      <View style={styles.recordContainer}>
        <Text style={styles.recordLabel}>RECORD</Text>
        <Text style={styles.recordValue}>{record.toLocaleString()}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8, // Further reduced padding
    marginTop: 0, // Remove top margin
    marginBottom: 5, // Small bottom margin for separation
    // Premium glass effect
    backgroundColor: THEME.DARK.BACKGROUND_SECONDARY + 'CC',
    borderRadius: 16,
    marginHorizontal: 10,
    // Enhanced shadows
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    // Subtle border
    borderWidth: 1,
    borderColor: THEME.DARK.BORDER_COLOR + '60',
  },
  
  scoreContainer: {
    alignItems: 'flex-start',
    backgroundColor: THEME.DARK.SCORE_BOX_DARK,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 100,
    // Premium shadow
    shadowColor: THEME.DARK.NEON_GLOW,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    // Border accent
    borderWidth: 1,
    borderColor: THEME.DARK.NEON_GLOW + '40',
  },
  
  scoreLabel: {
    color: THEME.DARK.TEXT_SECONDARY,
    fontSize: FONT_SIZES.SMALL,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 2,
  },
  
  scoreValue: {
    color: THEME.DARK.NEON_GLOW,
    fontSize: FONT_SIZES.LARGE,
    fontWeight: 'bold',
    textShadowColor: THEME.DARK.NEON_GLOW + '60',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  
  pauseButton: {
    backgroundColor: THEME.DARK.BACKGROUND_BOARD,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    // Premium button styling
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: THEME.DARK.BORDER_COLOR,
  },
  
  pauseIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  pauseBar: {
    width: 4,
    height: 16,
    backgroundColor: THEME.DARK.TEXT_PRIMARY,
    marginHorizontal: 2,
    borderRadius: 2,
  },
  
  recordContainer: {
    alignItems: 'flex-end',
    backgroundColor: THEME.DARK.RECORD_BOX,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 100,
    // Premium shadow
    shadowColor: THEME.DARK.RECORD_BOX,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    // Border accent
    borderWidth: 1,
    borderColor: THEME.DARK.WORKSHOP_ACCENT + '60',
  },
  
  recordLabel: {
    color: THEME.DARK.TEXT_PRIMARY + 'DD',
    fontSize: FONT_SIZES.SMALL,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 2,
  },
  
  recordValue: {
    color: THEME.DARK.TEXT_PRIMARY,
    fontSize: FONT_SIZES.LARGE,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
});

export default GameHeader; 