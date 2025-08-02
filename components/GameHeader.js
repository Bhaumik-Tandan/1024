import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { THEME, FONT_SIZES, screenWidth } from './constants';

const isTablet = screenWidth >= 768;
const isLargeTablet = screenWidth >= 1024;

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
    paddingHorizontal: isTablet ? 32 : 20, // Increased for iPad
    paddingVertical: isTablet ? 12 : 8, // Increased for iPad
    marginTop: 0,
    marginBottom: isTablet ? 8 : 5, // Slightly more space on iPad
    // Premium glass effect
    backgroundColor: THEME.DARK.BACKGROUND_SECONDARY + 'CC',
    borderRadius: isTablet ? 20 : 16, // Larger radius on iPad
    marginHorizontal: isTablet ? 16 : 10, // More margin on iPad
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
    fontSize: isTablet ? FONT_SIZES.MEDIUM * 1.2 : FONT_SIZES.MEDIUM, // Larger on iPad
    fontWeight: '600',
    color: THEME.DARK.TEXT_SECONDARY,
    letterSpacing: 1,
    textAlign: 'center',
  },
  
  scoreValue: {
    fontSize: isTablet ? FONT_SIZES.XLARGE * 1.2 : FONT_SIZES.XLARGE, // Larger on iPad
    fontWeight: 'bold',
    color: THEME.DARK.TEXT_PRIMARY,
    textAlign: 'center',
    textShadowColor: THEME.DARK.ACCENT + '60',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  
  pauseButton: {
    backgroundColor: THEME.DARK.ACCENT + '20',
    borderRadius: isTablet ? 16 : 12, // Larger on iPad
    padding: isTablet ? 14 : 10, // Bigger touch target on iPad
    borderWidth: 1,
    borderColor: THEME.DARK.ACCENT + '40',
    // Enhanced glow
    shadowColor: THEME.DARK.ACCENT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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
    fontSize: isTablet ? FONT_SIZES.MEDIUM * 1.2 : FONT_SIZES.MEDIUM, // Larger on iPad
    fontWeight: '600',
    color: THEME.DARK.TEXT_SECONDARY,
    letterSpacing: 1,
    textAlign: 'center',
  },
  
  recordValue: {
    fontSize: isTablet ? FONT_SIZES.XLARGE * 1.2 : FONT_SIZES.XLARGE, // Larger on iPad
    fontWeight: 'bold',
    color: '#FFD700', // Golden color for record
    textAlign: 'center',
    textShadowColor: '#FFD700' + '60',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
});

export default GameHeader; 