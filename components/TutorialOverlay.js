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
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(900), // Show for 900ms
        Animated.timing(successTextAnim, {
          toValue: 0,
          duration: 300,
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
              height: gameAreaHeight,
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
              width: CELL_SIZE,
              height: gameAreaHeight,
              // Ultra-premium and subtle highlighting for allowed lane
              backgroundColor: laneIndex === allowedLaneIndex ? 'rgba(76, 175, 80, 0.04)' : 'transparent',
              borderWidth: laneIndex === allowedLaneIndex ? 1 : 0,
              borderColor: laneIndex === allowedLaneIndex ? 'rgba(76, 175, 80, 0.2)' : 'transparent',
              borderRadius: laneIndex === allowedLaneIndex ? 2 : 0,
            },
          ]}
          testID={`lane-touch-${laneIndex}`}
          onPress={() => {
            console.log(`🎯 Tutorial lane ${laneIndex} tapped`);
            onLaneTap(laneIndex);
          }}
          activeOpacity={laneIndex === allowedLaneIndex ? 0.3 : 1}
        />
      ))}

      {/* Dynamic Tutorial Progress Text - Ultra Minimalistic */}
      {currentStep === 3 && (
        <View style={styles.progressTextContainer}>
          <Text style={styles.progressText}>
            Keep going...
          </Text>
        </View>
      )}
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
    width: 1, // Very thin line
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Very subtle, almost invisible
    top: screenHeight * 0.2, // Start below header
  },
  
  stepText: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -100 }, { translateY: -20 }],
    fontSize: 18, // Smaller text
    fontWeight: 'normal', // Not bold
    color: 'rgba(255, 255, 255, 0.9)', // Slightly transparent white
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    zIndex: 1001,
  },
  
  successText: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -100 }, { translateY: -20 }],
    fontSize: 16, // Smaller text
    fontWeight: 'normal', // Not bold
    color: 'rgba(76, 175, 80, 0.8)', // Subtle green
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    zIndex: 1001,
  },
  
  laneTouchArea: {
    position: 'absolute',
    top: screenHeight * 0.2,
    backgroundColor: 'transparent',
  },
  


  progressTextContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -100 }, { translateY: -50 }],
    backgroundColor: 'rgba(255, 255, 255, 0.02)', // Almost invisible
    padding: 6, // Minimal padding
    borderRadius: 3, // Minimal radius
    borderWidth: 0, // No border
    zIndex: 1001,
  },

  progressText: {
    fontSize: 12, // Very small font
    color: 'rgba(255, 255, 255, 0.3)', // Almost invisible
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)', // Very subtle shadow
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 0.5, // Minimal shadow
  },
});
