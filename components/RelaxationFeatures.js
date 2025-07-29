/**
 * ===========================
 * RELAXATION & STRESS RELIEF FEATURES
 * ===========================
 * 
 * Calming background effects, breathing exercises, and mindful visual elements
 * for a truly relaxing cosmic space experience - FIXED ANIMATION DRIVERS
 */

import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions } from 'react-native';
import { THEME } from './constants';

const { width, height } = Dimensions.get('window');

const RelaxationFeatures = ({ isActive = true, intensity = 0.5 }) => {
  const breathingAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (isActive) {
      // Breathing rhythm animation (4 seconds in, 4 seconds out)
      const breathingAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(breathingAnim, {
            toValue: 1,
            duration: 4000, // 4 seconds inhale
            useNativeDriver: false, // Opacity/scale needs JS driver
          }),
          Animated.timing(breathingAnim, {
            toValue: 0,
            duration: 4000, // 4 seconds exhale
            useNativeDriver: false, // Opacity/scale needs JS driver
          }),
        ])
      );
      
      // Gentle ambient glow
      const glowAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 6000,
            useNativeDriver: false, // Opacity needs JS driver
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 6000,
            useNativeDriver: false, // Opacity needs JS driver
          }),
        ])
      );
      
      breathingAnimation.start();
      glowAnimation.start();
      
      return () => {
        breathingAnimation.stop();
        glowAnimation.stop();
      };
    }
  }, [isActive, breathingAnim, glowAnim]);

  if (!isActive) return null;

  const breathingScale = breathingAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05],
  });

  const breathingOpacity = breathingAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.7, 0.3],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.1, 0.3],
  });

  return (
    <View style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: 'none', // Don't interfere with game interactions
    }}>
      {/* Breathing circle - subtle visual breathing guide */}
      <Animated.View
        style={{
          position: 'absolute',
          top: height * 0.15,
          left: width * 0.45,
          width: width * 0.1,
          height: width * 0.1,
          borderRadius: (width * 0.1) / 2,
          borderWidth: 2,
          borderColor: THEME.DARK.STELLAR_GLOW, // Updated for space theme
          opacity: breathingOpacity,
          transform: [{ scale: breathingScale }],
        }}
      />

      {/* Ambient corner glows */}
      <Animated.View
        style={{
          position: 'absolute',
          top: -50,
          left: -50,
          width: 200,
          height: 200,
          borderRadius: 100,
          backgroundColor: THEME.DARK.STELLAR_GLOW, // Updated for space theme
          opacity: glowOpacity * intensity,
        }}
      />
      
      <Animated.View
        style={{
          position: 'absolute',
          bottom: -50,
          right: -50,
          width: 200,
          height: 200,
          borderRadius: 100,
          backgroundColor: THEME.DARK.COSMIC_ACCENT, // Updated for space theme
          opacity: glowOpacity * intensity * 0.7,
        }}
      />

      {/* Subtle animated particles - Reduced for performance */}
      {[...Array(3)].map((_, index) => (
        <AnimatedParticle key={index} index={index} intensity={intensity} />
      ))}
    </View>
  );
};

const AnimatedParticle = ({ index, intensity }) => {
  const particleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    const delay = index * 1200; // Increased stagger
    
    // Movement animation - JS Driver (to match opacity driver)
    const particleAnimation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(particleAnim, {
          toValue: 1,
          duration: 10000 + (index * 800), // Slower, more relaxing
          useNativeDriver: false, // Use JS driver for consistency
        }),
      ])
    );
    
    // Opacity animation - JS Driver (for opacity)
    const opacityAnimation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 5000,
          useNativeDriver: false, // Opacity MUST use JS driver
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 5000,
          useNativeDriver: false, // Opacity MUST use JS driver
        }),
      ])
    );
    
    particleAnimation.start();
    opacityAnimation.start();
    
    return () => {
      particleAnimation.stop();
      opacityAnimation.stop();
    };
  }, [index, particleAnim, opacityAnim]);

  const translateX = particleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [width * (0.1 + index * 0.12), width * (0.2 + index * 0.12)],
  });

  const translateY = particleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [height * 0.9, height * 0.1],
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: THEME.DARK.STELLAR_GLOW,
        opacity: opacityAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 0.4 * intensity], // Reduced intensity for subtlety
        }),
        transform: [
          { translateX }, // Transform animations now use JS driver
          { translateY },
        ],
      }}
    />
  );
};

export default RelaxationFeatures; 