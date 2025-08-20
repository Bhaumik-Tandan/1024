import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { ROWS, COLS, CELL_SIZE, CELL_MARGIN } from './constants';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const TutorialOverlay = ({
  isVisible,
  currentStep,
  allowedLaneIndex,
  stepText,
  successText,
  showSuccessText,
  onLaneTap,
}) => {
  // Animation refs
  const textFadeAnim = useRef(new Animated.Value(1)).current;
  const successTextAnim = useRef(new Animated.Value(0)).current;

  // Animate success text when it should show
  useEffect(() => {
    if (showSuccessText && successText) {
      Animated.sequence([
        Animated.timing(successTextAnim, {
          toValue: 1,
          duration: 400, // Slightly longer for smoother feel
          useNativeDriver: true,
        }),
        Animated.delay(1000), // Show for 1 second
        Animated.timing(successTextAnim, {
          toValue: 0,
          duration: 400, // Slightly longer for smoother feel
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showSuccessText, successText]);



  if (!isVisible) return null;

  // Calculate game area dimensions
  const gameAreaWidth = COLS * (CELL_SIZE + CELL_MARGIN) - CELL_MARGIN;
  const gameAreaHeight = ROWS * (CELL_SIZE + CELL_MARGIN) - CELL_MARGIN;
  const gameAreaLeft = (screenWidth - gameAreaWidth) / 2;
  const gameAreaTop = screenHeight * 0.2; // Start below header

  // Calculate shooter area position (bottom center)
  const shooterAreaTop = screenHeight * 0.8; // 80% down the screen
  const shooterAreaLeft = gameAreaLeft + (allowedLaneIndex * (CELL_SIZE + CELL_MARGIN));


  return (
    <View style={styles.container} testID="tutorial-overlay">
      {/* Enhanced Lane Separators for Better Grid Visibility */}
      {Array.from({ length: COLS - 1 }).map((_, index) => (
        <View
          key={`separator-${index}`}
          style={[
            styles.laneSeparator,
            {
              left: gameAreaLeft + (index + 1) * (CELL_SIZE + CELL_MARGIN) - 1,
              top: screenHeight * 0.15, // Start from higher up (below header)
              height: screenHeight * 0.45, // Stop before the bottom "Next" section
            },
          ]}
          testID={`lane-separator-${index}`}
        />
      ))}
      
      {/* Step Text */}
      <Animated.Text
        style={[
          styles.stepText,
          {
            opacity: textFadeAnim,
          },
        ]}
        testID="step-text"
      >
        {stepText}
      </Animated.Text>

      {/* Success Text */}
      {successText && (
        <Animated.Text
          style={[
            styles.successText,
            {
              opacity: successTextAnim,
            },
          ]}
          testID="success-text"
        >
          {successText}
        </Animated.Text>
      )}

      {/* Interactive Lane Areas with Enhanced Highlighting */}
      {Array.from({ length: COLS }).map((_, laneIndex) => (
        <TouchableOpacity
          key={`lane-${laneIndex}`}
                      style={[
              styles.laneTouchArea,
              {
                left: gameAreaLeft + laneIndex * (CELL_SIZE + CELL_MARGIN),
                top: screenHeight * 0.15, // Start from higher up (below header)
                width: CELL_SIZE,
                height: screenHeight * 0.45, // Stop before the bottom "Next" section
                // Sophisticated blue highlighting - minimal and professional
                backgroundColor: laneIndex === allowedLaneIndex ? 'rgba(64, 156, 255, 0.06)' : 'transparent',
                borderWidth: laneIndex === allowedLaneIndex ? 1 : 0,
                borderColor: laneIndex === allowedLaneIndex ? '#409CFF' : 'transparent',
                borderRadius: laneIndex === allowedLaneIndex ? 0 : 0,
              },
            ]}
          testID={`lane-touch-${laneIndex}`}
          onPress={() => {
            onLaneTap(laneIndex);
          }}
          activeOpacity={laneIndex === allowedLaneIndex ? 0.3 : 1}
        />
      ))}




      

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    backgroundColor: 'transparent', // No screen tinting
  },
  
  laneSeparator: {
    position: 'absolute',
    width: 1, // Thinner for minimalist look
    backgroundColor: 'rgba(64, 156, 255, 0.15)', // Subtle blue
    // Top and height will be set dynamically per separator
    shadowColor: '#409CFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    // Cleaner appearance
    borderLeftWidth: 0,
  },
  
  stepText: {
    position: 'absolute',
    top: '50%', // Center of screen to avoid planet overlap
    left: '50%',
    transform: [{ translateX: -140 }, { translateY: -30 }],
    fontSize: 19, // Slightly larger for better readability
    fontWeight: '600', // Better weight for hierarchy
    color: '#FFFFFF', // Simple white text
    textAlign: 'center',
    textShadowColor: '#000000',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 1,
    zIndex: 1001,
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // Slightly more opaque for better contrast
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 0, // No border for minimal look
    letterSpacing: 0.5,
    minWidth: 250,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  
  successText: {
    position: 'absolute',
    top: '62%', // Slightly higher to avoid overlap
    left: '50%',
    transform: [{ translateX: -140 }, { translateY: -30 }],
    fontSize: 18, // Slightly smaller for better hierarchy
    fontWeight: '600', // Lighter weight for secondary text
    color: '#409CFF', // Sophisticated blue
    textAlign: 'center',
    textShadowColor: '#409CFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 2,
    zIndex: 1001,
    backgroundColor: 'rgba(0, 0, 0, 0.85)', // Better contrast
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#409CFF',
    letterSpacing: 0.6,
    minWidth: 250,
    shadowColor: '#409CFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  
  laneTouchArea: {
    position: 'absolute',
    backgroundColor: 'transparent',
    // Top and height are now calculated dynamically per lane
  },
  





  

});
