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
  const chevronAnim = useRef(new Animated.Value(0)).current;
  const handPointerAnim = useRef(new Animated.Value(1)).current;
  const textFadeAnim = useRef(new Animated.Value(1)).current;
  const successTextAnim = useRef(new Animated.Value(0)).current;

  // Start chevron animation loop
  useEffect(() => {
    if (isVisible) {
      const chevronLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(chevronAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(chevronAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      chevronLoop.start();

      // Start hand pointer animation
      const handLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(handPointerAnim, {
            toValue: 1.1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(handPointerAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      handLoop.start();

      return () => {
        chevronLoop.stop();
        handLoop.stop();
      };
    }
  }, [isVisible]);

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

  // Calculate shooter area position (bottom center)
  const shooterAreaTop = screenHeight * 0.8; // 80% down the screen
  const shooterAreaLeft = gameAreaLeft + (allowedLaneIndex * (CELL_SIZE + CELL_MARGIN));

  return (
    <View style={styles.container} testID="tutorial-overlay">
      {/* Lane Separators */}
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

      {/* Animated Chevrons (Runway Lights) */}
      <View
        style={[
          styles.chevronContainer,
          {
            left: shooterAreaLeft + CELL_SIZE / 2 - 15,
            top: shooterAreaTop - 80,
          },
        ]}
        testID="chevrons"
      >
        {[0, 1, 2].map((index) => (
          <Animated.Text
            key={`chevron-${index}`}
            style={[
              styles.chevron,
              {
                opacity: chevronAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 1],
                }),
                transform: [
                  {
                    translateY: chevronAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -10],
                    }),
                  },
                ],
              },
            ]}
          >
            {'>'}
          </Animated.Text>
        ))}
      </View>

      {/* Hand Pointer */}
      <Animated.View
        style={[
          styles.handPointer,
          {
            left: shooterAreaLeft + CELL_SIZE / 2 - 15,
            top: shooterAreaTop - 120,
            transform: [{ scale: handPointerAnim }],
          },
        ]}
        testID="hand-pointer"
      >
        {/* Simple hand pointer using View - TODO: Replace with actual hand image */}
        <View style={styles.handPointerIcon}>
          <View style={styles.handFinger} />
          <View style={styles.handPalm} />
        </View>
      </Animated.View>

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

      {/* Lane Highlight Overlay */}
      <View
        style={[
          styles.laneHighlight,
          {
            left: gameAreaLeft + allowedLaneIndex * (CELL_SIZE + CELL_MARGIN),
            width: CELL_SIZE,
            height: gameAreaHeight,
          },
        ]}
        testID={`lane-highlight-${allowedLaneIndex}`}
      />

      {/* Interactive Lane Areas */}
      {Array.from({ length: COLS }).map((_, laneIndex) => (
        <TouchableOpacity
          key={`lane-${laneIndex}`}
          style={[
            styles.laneTouchArea,
            {
              left: gameAreaLeft + laneIndex * (CELL_SIZE + CELL_MARGIN),
              width: CELL_SIZE,
              height: gameAreaHeight,
            },
          ]}
          testID={`lane-touch-${laneIndex}`}
          onPress={() => onLaneTap(laneIndex)}
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
  },
  
  laneSeparator: {
    position: 'absolute',
    width: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    top: screenHeight * 0.2, // Start below header
  },
  
  chevronContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  chevron: {
    fontSize: 24,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginVertical: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  
  handPointer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  handPointerIcon: {
    alignItems: 'center',
  },
  
  handFinger: {
    width: 8,
    height: 20,
    backgroundColor: 'white',
    borderRadius: 4,
    marginBottom: 2,
  },
  
  handPalm: {
    width: 20,
    height: 12,
    backgroundColor: 'white',
    borderRadius: 6,
  },
  
  stepText: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -100 }, { translateY: -20 }],
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    zIndex: 1001,
  },
  
  successText: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -100 }, { translateY: -20 }],
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    zIndex: 1001,
  },
  
  laneHighlight: {
    position: 'absolute',
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(76, 175, 80, 0.6)',
    borderRadius: 4,
    top: screenHeight * 0.2,
  },
  
  laneTouchArea: {
    position: 'absolute',
    top: screenHeight * 0.2,
    backgroundColor: 'transparent',
  },
});
