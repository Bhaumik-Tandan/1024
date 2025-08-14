/**
 * ===========================
 * COSMIC PLANET TILE COMPONENT
 * ===========================
 * 
 * Realistic planets with enhanced visual styling and orbital motion
 * Using gradients and styling for realistic planet appearance
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { 
  getPlanetType, 
  CELL_SIZE,
  THEME
} from './constants';
import { formatPlanetValue } from '../utils/helpers';

// Dynamic Orion Nebula Component - Living Cloud Cluster
const DynamicOrionNebula = ({ size }) => {
  // Simplified animation values for better compatibility
  const corePulseAnim = useRef(new Animated.Value(1)).current;
  const cloudShiftAnim = useRef(new Animated.Value(0)).current;
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const starTwinkleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Core nebula pulse - like a heartbeat
    const corePulse = Animated.loop(
      Animated.sequence([
        Animated.timing(corePulseAnim, {
          toValue: 1.2,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(corePulseAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    );

    // Cloud shifting - horizontal movement
    const cloudShift = Animated.loop(
      Animated.sequence([
        Animated.timing(cloudShiftAnim, {
          toValue: 1,
          duration: 8000,
          useNativeDriver: true,
        }),
        Animated.timing(cloudShiftAnim, {
          toValue: 0,
          duration: 8000,
          useNativeDriver: true,
        }),
      ])
    );

    // Overall rotation - slow cosmic rotation
    const rotation = Animated.loop(
      Animated.timing(rotationAnim, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    );

    // Star twinkling within nebula
    const starTwinkle = Animated.loop(
      Animated.sequence([
        Animated.timing(starTwinkleAnim, {
          toValue: 0.6,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(starTwinkleAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    // Start all animations
    corePulse.start();
    cloudShift.start();
    rotation.start();
    starTwinkle.start();

    return () => {
      corePulse.stop();
      cloudShift.stop();
      rotation.stop();
      starTwinkle.stop();
    };
  }, []);

  // Interpolate animation values
  const coreScale = corePulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1.2],
  });

  const cloudOffset = cloudShiftAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-size * 0.05, size * 0.05],
  });

  const rotationDeg = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const starOpacity = starTwinkleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1],
  });

  return (
    <View style={{
      width: size,
      height: size,
      backgroundColor: 'transparent',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Main nebula container with rotation */}
      <Animated.View style={{
        position: 'absolute',
        width: size,
        height: size,
        transform: [{ rotate: rotationDeg }],
      }}>
        
        {/* Dynamic core - bright white/pink center that pulses */}
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.3,
          left: size * 0.25,
          width: size * 0.5,
          height: size * 0.5,
          borderRadius: size * 0.25,
          backgroundColor: '#FFE6F2',
          opacity: 0.9,
          transform: [{ scale: coreScale }],
        }} />
        
        {/* Large pink gas cloud - main body that shifts */}
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.1,
          left: size * 0.05,
          width: size * 0.9,
          height: size * 0.8,
          borderRadius: size * 0.4,
          backgroundColor: '#FF69B4',
          opacity: 0.8,
          transform: [{ translateX: cloudOffset }],
        }} />
        
        {/* Magenta swirling arm - rotates with nebula */}
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.15,
          right: size * 0.1,
          width: size * 0.6,
          height: size * 0.4,
          borderRadius: size * 0.2,
          backgroundColor: '#DA70D6',
          opacity: 0.7,
          transform: [{ rotate: '-30deg' }],
        }} />
        
        {/* Purple gas filament - flows and moves */}
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.2,
          left: size * 0.1,
          width: size * 0.3,
          height: size * 0.5,
          borderRadius: size * 0.15,
          backgroundColor: '#9370DB',
          opacity: 0.6,
        }} />
        
        {/* Reddish-orange gas cloud - shifts with main cloud */}
        <Animated.View style={{
          position: 'absolute',
          bottom: size * 0.1,
          right: size * 0.15,
          width: size * 0.5,
          height: size * 0.4,
          borderRadius: size * 0.2,
          backgroundColor: '#FF6347',
          opacity: 0.7,
          transform: [{ translateX: cloudOffset * 0.8 }],
        }} />
        
        {/* Dark dust lanes - swirl in circular motion */}
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.25,
          left: size * 0.2,
          width: size * 0.2,
          height: size * 0.3,
          borderRadius: size * 0.1,
          backgroundColor: 'rgba(139,69,19,0.8)',
          opacity: 0.6,
        }} />
        
        {/* Additional dark dust lane - also swirls */}
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.4,
          right: size * 0.25,
          width: size * 0.15,
          height: size * 0.25,
          borderRadius: size * 0.075,
          backgroundColor: 'rgba(160,82,45,0.7)',
          opacity: 0.5,
        }} />
        
        {/* Bright star-forming region - pulses with core */}
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.35,
          left: size * 0.35,
          width: size * 0.2,
          height: size * 0.2,
          borderRadius: size * 0.1,
          backgroundColor: '#FFFFFF',
          opacity: 0.9,
          transform: [{ scale: coreScale }],
        }} />
        
        {/* Embedded stars within nebula - twinkle independently */}
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.15,
          right: size * 0.3,
          width: size * 0.08,
          height: size * 0.08,
          borderRadius: size * 0.04,
          backgroundColor: '#87CEEB',
          opacity: starOpacity,
        }} />
        
        <Animated.View style={{
          position: 'absolute',
          bottom: size * 0.25,
          left: size * 0.3,
          width: size * 0.06,
          height: size * 0.06,
          borderRadius: size * 0.03,
          backgroundColor: '#F0E68C',
          opacity: starOpacity,
        }} />

        {/* Additional dynamic gas wisps - move in circular patterns */}
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.05,
          left: size * 0.4,
          width: size * 0.25,
          height: size * 0.15,
          borderRadius: size * 0.075,
          backgroundColor: 'rgba(255,105,180,0.5)',
          opacity: 0.6,
        }} />

        <Animated.View style={{
          position: 'absolute',
          bottom: size * 0.05,
          left: size * 0.1,
          width: size * 0.2,
          height: size * 0.12,
          borderRadius: size * 0.06,
          backgroundColor: 'rgba(138,43,226,0.4)',
          opacity: 0.5,
        }} />

        {/* Floating gas particles - move in opposite direction */}
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.6,
          right: size * 0.05,
          width: size * 0.1,
          height: size * 0.1,
          borderRadius: size * 0.05,
          backgroundColor: 'rgba(255,182,193,0.6)',
          opacity: 0.7,
          transform: [{ rotate: rotationDeg }],
        }} />
      </Animated.View>
    </View>
  );
};

// Animated Spiral Galaxy Component - Like the HTML simulation
const DynamicMilkyWay = ({ size }) => {
  // Core rotation animation
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const starTwinkleAnim = useRef(new Animated.Value(1)).current;
  const coreGlowAnim = useRef(new Animated.Value(0.9)).current;
  
  // Star field movement - subtle movement for stars
  const starFieldAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Galaxy rotation - rotates in place like Orion Nebula
    const rotation = Animated.loop(
      Animated.timing(rotationAnim, {
        toValue: 1,
        duration: 45000, // 45 seconds for full rotation
        useNativeDriver: true,
      })
    );

    // Star twinkling effect
    const starTwinkle = Animated.loop(
      Animated.sequence([
        Animated.timing(starTwinkleAnim, {
          toValue: 0.7,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(starTwinkleAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    );

    // Core glow variation
    const coreGlow = Animated.loop(
      Animated.sequence([
        Animated.timing(coreGlowAnim, {
          toValue: 1,
          duration: 8000,
          useNativeDriver: true,
        }),
        Animated.timing(coreGlowAnim, {
          toValue: 0.8,
          duration: 6000,
          useNativeDriver: true,
        }),
      ])
    );

    // Star field movement - subtle movement for stars
    const starField = Animated.loop(
      Animated.timing(starFieldAnim, {
        toValue: 1,
        duration: 35000,
        useNativeDriver: true,
      })
    );

    // Start all animations
    rotation.start();
    starTwinkle.start();
    coreGlow.start();
    starField.start();

    return () => {
      rotation.stop();
      starTwinkle.stop();
      coreGlow.stop();
      starField.stop();
    };
  }, []);

  // Interpolation for smooth animations
  const rotationDeg = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const starOpacity = starTwinkleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1],
  });

  const coreOpacity = coreGlowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  const starFieldOffset = starFieldAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-size * 0.003, size * 0.003],
  });



  return (
    <View style={{
      width: size,
      height: size,
      backgroundColor: 'transparent',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Main galaxy container with rotation */}
      <Animated.View style={{
        position: 'absolute',
        width: size,
        height: size,
        transform: [{ rotate: rotationDeg }],
      }}>
        
        {/* Galactic Core - Bright yellowish-white center like the image */}
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.35,
          left: size * 0.35,
          width: size * 0.3,
          height: size * 0.3,
          borderRadius: size * 0.15,
          backgroundColor: '#FFF8DC', // Creamy white-yellow
          opacity: coreOpacity,
        }} />
        
        {/* Core glow - intense white-hot center */}
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.38,
          left: size * 0.38,
          width: size * 0.24,
          height: size * 0.24,
          borderRadius: size * 0.12,
          backgroundColor: '#FFFFFF', // Pure white hot center
          opacity: coreOpacity * 0.8, // Reduced from 0.95 for more realistic brightness
        }} />
        
        {/* Dust lane effect - obscuring part of the core for realism */}
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.35,
          left: size * 0.35,
          width: size * 0.3,
          height: size * 0.3,
          borderRadius: size * 0.15,
          backgroundColor: '#2F2F2F', // Dark gray dust
          opacity: 0.3,
          transform: [{ rotate: '45deg' }],
        }} />
        
        {/* Interstellar medium - subtle gas clouds */}
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.32,
          left: size * 0.32,
          width: size * 0.36,
          height: size * 0.36,
          borderRadius: size * 0.18,
          backgroundColor: 'rgba(70, 70, 100, 0.2)', // Subtle blue-gray gas
          opacity: 0.15,
        }} />
        
        {/* Overall galaxy blue tint - simulating interstellar medium */}
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.02,
          left: size * 0.02,
          width: size * 0.96,
          height: size * 0.96,
          borderRadius: size * 0.48,
          backgroundColor: 'rgba(176, 196, 222, 0.08)', // Light steel blue tint
          opacity: 0.08,
        }} />
        
        {/* Additional gas clouds in spiral arms */}
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.15,
          left: size * 0.2,
          width: size * 0.3,
          height: size * 0.15,
          borderRadius: size * 0.075,
          backgroundColor: 'rgba(176, 196, 222, 0.1)', // Light steel blue gas
          opacity: 0.1,
          transform: [{ rotate: '35deg' }],
        }} />
        
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.55,
          right: size * 0.1,
          width: size * 0.25,
          height: size * 0.12,
          borderRadius: size * 0.06,
          backgroundColor: 'rgba(176, 196, 222, 0.08)', // Light steel blue gas
          opacity: 0.08,
          transform: [{ rotate: '-40deg' }],
        }} />
        
        {/* SILVERY-WHITE SPIRAL ARMS - Continuous luminous bands like real Milky Way */}
        {/* Primary Spiral Arm 1 - Main arm with continuous glow */}
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.1,
          left: size * 0.1,
          width: size * 0.8,
          height: size * 0.25,
          borderRadius: size * 0.4,
          backgroundColor: '#E6E6FA', // Lavender white - silvery tone
          opacity: 0.9,
          transform: [
            { rotate: '35deg' },
            { translateX: starFieldOffset * 0.3 }
          ],
        }} />
        
        {/* Primary Spiral Arm 2 - Main arm with continuous glow */}
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.6,
          right: size * 0.05,
          width: size * 0.75,
          height: size * 0.22,
          borderRadius: size * 0.35,
          backgroundColor: '#F0F8FF', // Alice blue - bright silvery white
          opacity: 0.85,
          transform: [
            { rotate: '-40deg' },
            { translateX: starFieldOffset * 0.4 }
          ],
        }} />
        
        {/* Secondary Spiral Arm 3 - Thinner silvery arm */}
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.25,
          right: size * 0.15,
          width: size * 0.6,
          height: size * 0.18,
          borderRadius: size * 0.3,
          backgroundColor: '#B0C4DE', // Light steel blue - subtle blue tint
          opacity: 0.7,
          transform: [
            { rotate: '20deg' },
            { translateX: starFieldOffset * 0.2 }
          ],
        }} />
        
        {/* Secondary Spiral Arm 4 - Thinner silvery arm */}
        <Animated.View style={{
          position: 'absolute',
          bottom: size * 0.2,
          left: size * 0.2,
          width: size * 0.55,
          height: size * 0.16,
          borderRadius: size * 0.25,
          backgroundColor: '#E0E6FA', // Light lavender - soft silvery tone
          opacity: 0.65,
          transform: [
            { rotate: '-25deg' },
            { translateX: starFieldOffset * 0.3 }
          ],
        }} />
        
        {/* CONTINUOUS LUMINOUS BANDS - Creating ethereal Milky Way glow */}
        {/* Enhanced glow for Primary Spiral Arm 1 */}
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.08,
          left: size * 0.08,
          width: size * 0.84,
          height: size * 0.29,
          borderRadius: size * 0.42,
          backgroundColor: '#F8F8FF', // Ghost white - brightest glow
          opacity: 0.6,
          transform: [
            { rotate: '35deg' },
            { translateX: starFieldOffset * 0.2 }
          ],
        }} />
        
        {/* Enhanced glow for Primary Spiral Arm 2 */}
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.58,
          right: size * 0.03,
          width: size * 0.79,
          height: size * 0.26,
          borderRadius: size * 0.37,
          backgroundColor: '#F0F8FF', // Alice blue - bright glow
          opacity: 0.55,
          transform: [
            { rotate: '-40deg' },
            { translateX: starFieldOffset * 0.3 }
          ],
        }} />
        
        {/* Enhanced glow for Secondary Spiral Arm 3 */}
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.23,
          right: size * 0.13,
          width: size * 0.64,
          height: size * 0.22,
          borderRadius: size * 0.32,
          backgroundColor: '#E6E6FA', // Lavender white - soft glow
          opacity: 0.45,
          transform: [
            { rotate: '20deg' },
            { translateX: starFieldOffset * 0.15 }
          ],
        }} />
        
        {/* Enhanced glow for Secondary Spiral Arm 4 */}
        <Animated.View style={{
          position: 'absolute',
          bottom: size * 0.18,
          left: size * 0.18,
          width: size * 0.59,
          height: size * 0.2,
          borderRadius: size * 0.27,
          backgroundColor: '#F0F0FF', // Light lavender - subtle glow
          opacity: 0.4,
          transform: [
            { rotate: '-25deg' },
            { translateX: starFieldOffset * 0.25 }
          ],
        }} />
        
        {/* STAR-FORMING REGIONS - Subtle bright spots for realism */}
        {/* Core region bright spots - reduced for continuous glow effect */}
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.42,
          left: size * 0.42,
          width: size * 0.03,
          height: size * 0.03,
          borderRadius: size * 0.015,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.6,
          transform: [{ translateX: starFieldOffset * 0.1 }],
        }} />
        
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.38,
          left: size * 0.48,
          width: size * 0.025,
          height: size * 0.025,
          borderRadius: size * 0.0125,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.5,
          transform: [{ translateX: starFieldOffset * 0.2 }],
        }} />
        
        {/* Spiral arm 1 stars - dense field of small white dots */}
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.08,
          left: size * 0.25,
          width: size * 0.025,
          height: size * 0.025,
          borderRadius: size * 0.0125,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.6,
          transform: [{ translateX: starFieldOffset * 0.3 }],
        }} />
        
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.12,
          left: size * 0.22,
          width: size * 0.02,
          height: size * 0.02,
          borderRadius: size * 0.01,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.5,
          transform: [{ translateX: starFieldOffset * 0.4 }],
        }} />
        
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.16,
          left: size * 0.28,
          width: size * 0.015,
          height: size * 0.015,
          borderRadius: size * 0.0075,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.4,
          transform: [{ translateX: starFieldOffset * 0.2 }],
        }} />
        
        {/* Spiral arm 2 stars - dense field of small white dots */}
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.58,
          right: size * 0.08,
          width: size * 0.025,
          height: size * 0.025,
          borderRadius: size * 0.0125,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.6,
          transform: [{ translateX: starFieldOffset * 0.3 }],
        }} />
        
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.62,
          right: size * 0.12,
          width: size * 0.02,
          height: size * 0.02,
          borderRadius: size * 0.01,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.5,
          transform: [{ translateX: starFieldOffset * 0.4 }],
        }} />
        
        {/* More stars scattered throughout spiral arms */}
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.22,
          right: size * 0.18,
          width: size * 0.02,
          height: size * 0.02,
          borderRadius: size * 0.01,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.4,
          transform: [{ translateX: starFieldOffset * 0.3 }],
        }} />
        
        <Animated.View style={{
          position: 'absolute',
          bottom: size * 0.18,
          left: size * 0.22,
          width: size * 0.02,
          height: size * 0.02,
          borderRadius: size * 0.01,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.5,
          transform: [{ translateX: starFieldOffset * 0.3 }],
        }} />
        
        {/* Additional stars for density */}
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.35,
          left: size * 0.65,
          width: size * 0.015,
          height: size * 0.015,
          borderRadius: size * 0.0075,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.3,
          transform: [{ translateX: starFieldOffset * 0.1 }],
        }} />
        
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.48,
          right: size * 0.35,
          width: size * 0.02,
          height: size * 0.02,
          borderRadius: size * 0.01,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.4,
          transform: [{ translateX: starFieldOffset * 0.3 }],
        }} />
        
        <Animated.View style={{
          position: 'absolute',
          bottom: size * 0.42,
          right: size * 0.28,
          width: size * 0.015,
          height: size * 0.015,
          borderRadius: size * 0.0075,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.3,
          transform: [{ translateX: starFieldOffset * 0.2 }],
        }} />
        
        {/* Dense star field in spiral arms - countless small white dots */}
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.15,
          left: size * 0.4,
          width: size * 0.12,
          height: size * 0.12,
          borderRadius: size * 0.06,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.8,
          transform: [{ translateX: starFieldOffset }],
        }} />
        
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.6,
          right: size * 0.25,
          width: size * 0.08,
          height: size * 0.08,
          borderRadius: size * 0.04,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.7,
          transform: [{ translateX: starFieldOffset * 0.8 }],
        }} />
        
        <Animated.View style={{
          position: 'absolute',
          bottom: size * 0.25,
          left: size * 0.35,
          width: size * 0.06,
          height: size * 0.06,
          borderRadius: size * 0.03,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.8,
          transform: [{ translateX: starFieldOffset * 0.6 }],
        }} />
        
        {/* More stars in spiral arms - creating dense star fields */}
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.1,
          right: size * 0.4,
          width: size * 0.05,
          height: size * 0.05,
          borderRadius: size * 0.025,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.6,
          transform: [{ translateX: starFieldOffset * 0.4 }],
        }} />
        
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.45,
          left: size * 0.1,
          width: size * 0.04,
          height: size * 0.04,
          borderRadius: size * 0.02,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.5,
          transform: [{ translateX: starFieldOffset * 0.3 }],
        }} />
        
        <Animated.View style={{
          position: 'absolute',
          bottom: size * 0.1,
          right: size * 0.35,
          width: size * 0.05,
          height: size * 0.05,
          borderRadius: size * 0.025,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.6,
          transform: [{ translateX: starFieldOffset * 0.5 }],
        }} />
        
        {/* Outer galaxy halo - subtle silvery glow like real Milky Way */}
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.05,
          left: size * 0.05,
          width: size * 0.9,
          height: size * 0.9,
          borderRadius: size * 0.45,
          borderWidth: 2,
          borderColor: '#E6E6FA', // Silvery halo matching new spiral arms
          opacity: 0.4,
        }} />
        
        {/* Spiral arm 2 stars - ultra-dense field */}
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.58,
          right: size * 0.08,
          width: size * 0.025,
          height: size * 0.025,
          borderRadius: size * 0.0125,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.4,
          transform: [{ translateX: starFieldOffset * 0.3 }],
        }} />
        
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.62,
          right: size * 0.12,
          width: size * 0.02,
          height: size * 0.02,
          borderRadius: size * 0.01,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.5,
          transform: [{ translateX: starFieldOffset * 0.4 }],
        }} />
        
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.66,
          right: size * 0.16,
          width: size * 0.015,
          height: size * 0.015,
          borderRadius: size * 0.0075,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.3,
          transform: [{ translateX: starFieldOffset * 0.2 }],
        }} />
        
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.54,
          right: size * 0.2,
          width: size * 0.02,
          height: size * 0.02,
          borderRadius: size * 0.01,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.6,
          transform: [{ translateX: starFieldOffset * 0.5 }],
        }} />
        
        {/* Secondary arm stars */}
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.22,
          right: size * 0.18,
          width: size * 0.02,
          height: size * 0.02,
          borderRadius: size * 0.01,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.4,
          transform: [{ translateX: starFieldOffset * 0.3 }],
        }} />
        
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.26,
          right: size * 0.22,
          width: size * 0.015,
          height: size * 0.015,
          borderRadius: size * 0.0075,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.5,
          transform: [{ translateX: starFieldOffset * 0.4 }],
        }} />
        
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.18,
          right: size * 0.26,
          width: size * 0.02,
          height: size * 0.02,
          borderRadius: size * 0.01,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.3,
          transform: [{ translateX: starFieldOffset * 0.2 }],
        }} />
        
        {/* Bottom arm stars */}
        <Animated.View style={{
          position: 'absolute',
          bottom: size * 0.18,
          left: size * 0.22,
          width: size * 0.02,
          height: size * 0.02,
          borderRadius: size * 0.01,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.4,
          transform: [{ translateX: starFieldOffset * 0.3 }],
        }} />
        
        <Animated.View style={{
          position: 'absolute',
          bottom: size * 0.22,
          left: size * 0.28,
          width: size * 0.015,
          height: size * 0.015,
          borderRadius: size * 0.0075,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.5,
          transform: [{ translateX: starFieldOffset * 0.4 }],
        }} />
        
        <Animated.View style={{
          position: 'absolute',
          bottom: size * 0.26,
          left: size * 0.32,
          width: size * 0.02,
          height: size * 0.02,
          borderRadius: size * 0.01,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.3,
          transform: [{ translateX: starFieldOffset * 0.2 }],
        }} />
        
        {/* Inter-arm region stars - scattered throughout */}
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.35,
          left: size * 0.65,
          width: size * 0.015,
          height: size * 0.015,
          borderRadius: size * 0.0075,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.3,
          transform: [{ translateX: starFieldOffset * 0.1 }],
        }} />
        
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.48,
          right: size * 0.35,
          width: size * 0.02,
          height: size * 0.02,
          borderRadius: size * 0.01,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.4,
          transform: [{ translateX: starFieldOffset * 0.3 }],
        }} />
        
        <Animated.View style={{
          position: 'absolute',
          bottom: size * 0.42,
          right: size * 0.28,
          width: size * 0.015,
          height: size * 0.015,
          borderRadius: size * 0.0075,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.3,
          transform: [{ translateX: starFieldOffset * 0.2 }],
        }} />
        
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.72,
          left: size * 0.45,
          width: size * 0.02,
          height: size * 0.02,
          borderRadius: size * 0.01,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.4,
          transform: [{ translateX: starFieldOffset * 0.4 }],
        }} />
        
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.76,
          left: size * 0.52,
          width: size * 0.015,
          height: size * 0.015,
          borderRadius: size * 0.0075,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.3,
          transform: [{ translateX: starFieldOffset * 0.2 }],
        }} />
        
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.68,
          left: size * 0.38,
          width: size * 0.02,
          height: size * 0.02,
          borderRadius: size * 0.01,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.5,
          transform: [{ translateX: starFieldOffset * 0.3 }],
        }} />
        
        {/* Even more tiny stars for ultra-realistic density */}
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.33,
          left: size * 0.72,
          width: size * 0.012,
          height: size * 0.012,
          borderRadius: size * 0.006,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.25,
          transform: [{ translateX: starFieldOffset * 0.1 }],
        }} />
        
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.37,
          left: size * 0.68,
          width: size * 0.015,
          height: size * 0.015,
          borderRadius: size * 0.0075,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.35,
          transform: [{ translateX: starFieldOffset * 0.2 }],
        }} />
        
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.41,
          left: size * 0.75,
          width: size * 0.01,
          height: size * 0.01,
          borderRadius: size * 0.005,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.2,
          transform: [{ translateX: starFieldOffset * 0.15 }],
        }} />
        
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.52,
          right: size * 0.42,
          width: size * 0.012,
          height: size * 0.012,
          borderRadius: size * 0.006,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.25,
          transform: [{ translateX: starFieldOffset * 0.1 }],
        }} />
        
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.56,
          right: size * 0.38,
          width: size * 0.015,
          height: size * 0.015,
          borderRadius: size * 0.0075,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.35,
          transform: [{ translateX: starFieldOffset * 0.2 }],
        }} />
        
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.6,
          right: size * 0.32,
          width: size * 0.01,
          height: size * 0.01,
          borderRadius: size * 0.005,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.2,
          transform: [{ translateX: starFieldOffset * 0.15 }],
        }} />
        
        <Animated.View style={{
          position: 'absolute',
          bottom: size * 0.38,
          right: size * 0.25,
          width: size * 0.012,
          height: size * 0.012,
          borderRadius: size * 0.006,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.25,
          transform: [{ translateX: starFieldOffset * 0.1 }],
        }} />
        
        <Animated.View style={{
          position: 'absolute',
          bottom: size * 0.42,
          right: size * 0.22,
          width: size * 0.015,
          height: size * 0.015,
          borderRadius: size * 0.0075,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.35,
          transform: [{ translateX: starFieldOffset * 0.2 }],
        }} />
        
        <Animated.View style={{
          position: 'absolute',
          bottom: size * 0.46,
          right: size * 0.28,
          width: size * 0.01,
          height: size * 0.01,
          borderRadius: size * 0.005,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.2,
          transform: [{ translateX: starFieldOffset * 0.15 }],
        }} />
        
        {/* NEW: Outer Galaxy Halo - Subtle silvery glow around entire galaxy */}
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.05,
          left: size * 0.05,
          width: size * 0.9,
          height: size * 0.9,
          borderRadius: size * 0.45,
          borderWidth: 2,
          borderColor: '#E6E6FA', // Silvery halo matching new spiral arms
          opacity: 0.4,
          transform: [{ rotate: rotationDeg }], // Same rotation as main galaxy
        }} />
        
        {/* Additional stars for density - creating the granular texture */}
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.3,
          left: size * 0.05,
          width: size * 0.04,
          height: size * 0.04,
          borderRadius: size * 0.02,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.4,
          transform: [{ translateX: starFieldOffset * 0.2 }],
        }} />
        
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.7,
          left: size * 0.6,
          width: size * 0.05,
          height: size * 0.05,
          borderRadius: size * 0.025,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.5,
          transform: [{ translateX: starFieldOffset * 0.7 }],
        }} />
        
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.25,
          right: size * 0.1,
          width: size * 0.04,
          height: size * 0.04,
          borderRadius: size * 0.02,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.4,
          transform: [{ translateX: starFieldOffset * 0.4 }],
        }} />
        
        {/* Even more stars for realistic density */}
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.18,
          left: size * 0.55,
          width: size * 0.03,
          height: size * 0.03,
          borderRadius: size * 0.015,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.3,
          transform: [{ translateX: starFieldOffset * 0.1 }],
        }} />
        
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.65,
          right: size * 0.45,
          width: size * 0.04,
          height: size * 0.04,
          borderRadius: size * 0.02,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.4,
          transform: [{ translateX: starFieldOffset * 0.6 }],
        }} />
        
        <Animated.View style={{
          position: 'absolute',
          bottom: size * 0.35,
          left: size * 0.15,
          width: size * 0.03,
          height: size * 0.03,
          borderRadius: size * 0.015,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.3,
          transform: [{ translateX: starFieldOffset * 0.2 }],
        }} />
        
        {/* STAR-FORMING REGIONS - Pink/red hints for stellar nurseries */}
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.12,
          left: size * 0.65,
          width: size * 0.08,
          height: size * 0.08,
          borderRadius: size * 0.04,
          backgroundColor: '#FF69B4', // Subtle pink for star-forming regions
          opacity: starOpacity * 0.5,
          transform: [{ translateX: starFieldOffset * 0.3 }],
        }} />
        
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.68,
          right: size * 0.15,
          width: size * 0.06,
          height: size * 0.06,
          borderRadius: size * 0.03,
          backgroundColor: '#FF6347', // Subtle red for stellar nurseries
          opacity: starOpacity * 0.4,
          transform: [{ translateX: starFieldOffset * 0.5 }],
        }} />
        
        {/* Additional star-forming regions for realism */}
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.25,
          right: size * 0.35,
          width: size * 0.05,
          height: size * 0.05,
          borderRadius: size * 0.025,
          backgroundColor: '#FFB6C1', // Light pink
          opacity: starOpacity * 0.3,
          transform: [{ translateX: starFieldOffset * 0.2 }],
        }} />
        
        <Animated.View style={{
          position: 'absolute',
          bottom: size * 0.3,
          left: size * 0.4,
          width: size * 0.04,
          height: size * 0.04,
          borderRadius: size * 0.02,
          backgroundColor: '#FFC0CB', // Pink
          opacity: starOpacity * 0.25,
          transform: [{ translateX: starFieldOffset * 0.4 }],
        }} />
        
        {/* MANY MORE TINY STARS for realistic density - creating the granular Milky Way texture */}
        {/* Core region stars */}
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.42,
          left: size * 0.42,
          width: size * 0.02,
          height: size * 0.02,
          borderRadius: size * 0.01,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.6,
          transform: [{ translateX: starFieldOffset * 0.1 }],
        }} />
        
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.38,
          left: size * 0.48,
          width: size * 0.015,
          height: size * 0.015,
          borderRadius: size * 0.0075,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.5,
          transform: [{ translateX: starFieldOffset * 0.2 }],
        }} />
        
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.45,
          left: size * 0.38,
          width: size * 0.02,
          height: size * 0.02,
          borderRadius: size * 0.01,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.7,
          transform: [{ translateX: starFieldOffset * 0.15 }],
        }} />
        
        {/* Spiral arm 1 stars - dense field */}
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.08,
          left: size * 0.25,
          width: size * 0.025,
          height: size * 0.025,
          borderRadius: size * 0.0125,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.4,
          transform: [{ translateX: starFieldOffset * 0.3 }],
        }} />
        
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.12,
          left: size * 0.22,
          width: size * 0.02,
          height: size * 0.02,
          borderRadius: size * 0.01,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.5,
          transform: [{ translateX: starFieldOffset * 0.4 }],
        }} />
        
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.16,
          left: size * 0.28,
          width: size * 0.015,
          height: size * 0.015,
          borderRadius: size * 0.0075,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.3,
          transform: [{ translateX: starFieldOffset * 0.2 }],
        }} />
        
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.14,
          left: size * 0.32,
          width: size * 0.02,
          height: size * 0.02,
          borderRadius: size * 0.01,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.6,
          transform: [{ translateX: starFieldOffset * 0.5 }],
        }} />
        
        {/* Spiral arm 2 stars - dense field */}
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.58,
          right: size * 0.08,
          width: size * 0.025,
          height: size * 0.025,
          borderRadius: size * 0.0125,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.4,
          transform: [{ translateX: starFieldOffset * 0.3 }],
        }} />
        
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.62,
          right: size * 0.12,
          width: size * 0.02,
          height: size * 0.02,
          borderRadius: size * 0.01,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.5,
          transform: [{ translateX: starFieldOffset * 0.4 }],
        }} />
        
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.66,
          right: size * 0.16,
          width: size * 0.015,
          height: size * 0.015,
          borderRadius: size * 0.0075,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.3,
          transform: [{ translateX: starFieldOffset * 0.2 }],
        }} />
        
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.54,
          right: size * 0.2,
          width: size * 0.02,
          height: size * 0.02,
          borderRadius: size * 0.01,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.6,
          transform: [{ translateX: starFieldOffset * 0.5 }],
        }} />
        
        {/* Secondary arm stars */}
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.22,
          right: size * 0.18,
          width: size * 0.02,
          height: size * 0.02,
          borderRadius: size * 0.01,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.4,
          transform: [{ translateX: starFieldOffset * 0.3 }],
        }} />
        
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.26,
          right: size * 0.22,
          width: size * 0.015,
          height: size * 0.015,
          borderRadius: size * 0.0075,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.5,
          transform: [{ translateX: starFieldOffset * 0.4 }],
        }} />
        
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.18,
          right: size * 0.26,
          width: size * 0.02,
          height: size * 0.02,
          borderRadius: size * 0.01,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.3,
          transform: [{ translateX: starFieldOffset * 0.2 }],
        }} />
        
        {/* Bottom arm stars */}
        <Animated.View style={{
          position: 'absolute',
          bottom: size * 0.18,
          left: size * 0.22,
          width: size * 0.02,
          height: size * 0.02,
          borderRadius: size * 0.01,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.4,
          transform: [{ translateX: starFieldOffset * 0.3 }],
        }} />
        
        <Animated.View style={{
          position: 'absolute',
          bottom: size * 0.22,
          left: size * 0.28,
          width: size * 0.015,
          height: size * 0.015,
          borderRadius: size * 0.0075,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.5,
          transform: [{ translateX: starFieldOffset * 0.4 }],
        }} />
        
        <Animated.View style={{
          position: 'absolute',
          bottom: size * 0.26,
          left: size * 0.32,
          width: size * 0.02,
          height: size * 0.02,
          borderRadius: size * 0.01,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.3,
          transform: [{ translateX: starFieldOffset * 0.2 }],
        }} />
        
        {/* Inter-arm region stars - scattered throughout */}
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.35,
          left: size * 0.65,
          width: size * 0.015,
          height: size * 0.015,
          borderRadius: size * 0.0075,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.3,
          transform: [{ translateX: starFieldOffset * 0.1 }],
        }} />
        
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.48,
          right: size * 0.35,
          width: size * 0.02,
          height: size * 0.02,
          borderRadius: size * 0.01,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.4,
          transform: [{ translateX: starFieldOffset * 0.3 }],
        }} />
        
        <Animated.View style={{
          position: 'absolute',
          bottom: size * 0.42,
          right: size * 0.28,
          width: size * 0.015,
          height: size * 0.015,
          borderRadius: size * 0.0075,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.3,
          transform: [{ translateX: starFieldOffset * 0.2 }],
        }} />
        
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.72,
          left: size * 0.45,
          width: size * 0.02,
          height: size * 0.02,
          borderRadius: size * 0.01,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.4,
          transform: [{ translateX: starFieldOffset * 0.4 }],
        }} />
        
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.76,
          left: size * 0.52,
          width: size * 0.015,
          height: size * 0.015,
          borderRadius: size * 0.0075,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.3,
          transform: [{ translateX: starFieldOffset * 0.2 }],
        }} />
        
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.68,
          left: size * 0.38,
          width: size * 0.02,
          height: size * 0.02,
          borderRadius: size * 0.01,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.5,
          transform: [{ translateX: starFieldOffset * 0.3 }],
        }} />
        
        {/* Even more tiny stars for ultra-realistic density */}
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.33,
          left: size * 0.72,
          width: size * 0.012,
          height: size * 0.012,
          borderRadius: size * 0.006,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.25,
          transform: [{ translateX: starFieldOffset * 0.1 }],
        }} />
        
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.37,
          left: size * 0.68,
          width: size * 0.015,
          height: size * 0.015,
          borderRadius: size * 0.0075,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.35,
          transform: [{ translateX: starFieldOffset * 0.2 }],
        }} />
        
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.41,
          left: size * 0.75,
          width: size * 0.01,
          height: size * 0.01,
          borderRadius: size * 0.005,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.2,
          transform: [{ translateX: starFieldOffset * 0.15 }],
        }} />
        
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.52,
          right: size * 0.42,
          width: size * 0.012,
          height: size * 0.012,
          borderRadius: size * 0.006,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.25,
          transform: [{ translateX: starFieldOffset * 0.1 }],
        }} />
        
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.56,
          right: size * 0.38,
          width: size * 0.015,
          height: size * 0.015,
          borderRadius: size * 0.0075,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.35,
          transform: [{ translateX: starFieldOffset * 0.2 }],
        }} />
        
        <Animated.View style={{
          position: 'absolute',
          top: size * 0.6,
          right: size * 0.32,
          width: size * 0.01,
          height: size * 0.01,
          borderRadius: size * 0.005,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.2,
          transform: [{ translateX: starFieldOffset * 0.15 }],
        }} />
        
        <Animated.View style={{
          position: 'absolute',
          bottom: size * 0.38,
          right: size * 0.25,
          width: size * 0.012,
          height: size * 0.012,
          borderRadius: size * 0.006,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.25,
          transform: [{ translateX: starFieldOffset * 0.1 }],
        }} />
        
        <Animated.View style={{
          position: 'absolute',
          bottom: size * 0.42,
          right: size * 0.22,
          width: size * 0.015,
          height: size * 0.015,
          borderRadius: size * 0.0075,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.35,
          transform: [{ translateX: starFieldOffset * 0.2 }],
        }} />
        
        <Animated.View style={{
          position: 'absolute',
          bottom: size * 0.46,
          right: size * 0.28,
          width: size * 0.01,
          height: size * 0.01,
          borderRadius: size * 0.005,
          backgroundColor: '#FFFFFF',
          opacity: starOpacity * 0.2,
          transform: [{ translateX: starFieldOffset * 0.15 }],
        }} />
      </Animated.View>
    </View>
  );
};

const PlanetTile = ({ value, isOrbiting = true, orbitSpeed = 1, size, isColliding = false, gravitationalField = 0 }) => {
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const pulseOpacityAnim = useRef(new Animated.Value(0.8)).current; // Start higher to avoid flickering
  const pulseScaleAnim = useRef(new Animated.Value(1)).current;
  
  // Use provided size or default to CELL_SIZE
  const tileSize = size || CELL_SIZE;
  const planetSize = tileSize * 0.85; // Planet is 85% of tile size
  
  useEffect(() => {
    if (isOrbiting && value > 0) {
      // Simple rotation for normal gameplay
      const rotationAnimation = Animated.loop(
        Animated.timing(rotationAnim, {
          toValue: 1,
          duration: 15000 / orbitSpeed,
          useNativeDriver: true,
        })
      );
      
      // Only add subtle stellar pulse for very large celestial bodies (less aggressive)
      const planet = getPlanetType(value);
      if (planet.glow && value >= 32768) {
        const opacityPulse = Animated.loop(
          Animated.sequence([
            Animated.timing(pulseOpacityAnim, {
              toValue: 0.9, // Smaller range to prevent flickering
              duration: 4000, // Slower pulse
              useNativeDriver: true,
            }),
            Animated.timing(pulseOpacityAnim, {
              toValue: 0.7, // Higher minimum to prevent brightness drops
              duration: 4000, // Slower pulse
              useNativeDriver: true,
            }),
          ])
        );
        opacityPulse.start();
      }
      
      rotationAnimation.start();
      
      return () => {
        rotationAnimation.stop();
        if (planet.glow && value >= 32768) {
          pulseOpacityAnim.stopAnimation();
        }
      };
    }
  }, [isOrbiting, orbitSpeed, value, rotationAnim, pulseOpacityAnim]);

  if (value === 0) {
    // Empty space cell - completely transparent to remove grid appearance
    return (
      <View style={{
        width: CELL_SIZE,
        height: CELL_SIZE,
        backgroundColor: 'transparent',
      }} />
    );
  }

  const planet = getPlanetType(value);
  const rotation = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={{
      width: tileSize,
      height: tileSize,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    }}>
      
      {/* Main Cosmic Body Container with Gravitational Effects */}
      <Animated.View style={{
        width: planetSize,
        height: planetSize,
        justifyContent: 'center',
        alignItems: 'center',
        transform: [
          { rotate: rotation },
          { scale: pulseScaleAnim },
        ],
        shadowColor: planet.glow ? planet.primary : '#000',
        shadowOffset: { width: 0, height: planet.glow ? 0 : 4 },
        shadowOpacity: planet.glow ? 0.8 : 0.4,
        shadowRadius: planet.glow ? 18 : 8, // Enhanced glow for stars
        elevation: planet.glow ? 15 : 8,
      }}>
        
        {/* Enhanced Cosmic Body with Realistic Gradients */}
        <RealisticPlanet 
          planet={planet} 
          size={planetSize} 
          value={value}
          pulseScaleAnim={pulseScaleAnim}
          isColliding={isColliding}
        />
        
        {/* Enhanced Stellar Corona for massive stars during collisions */}
        {planet.glow && value >= 32768 && (
          <Animated.View style={{
            position: 'absolute',
            width: planetSize + 24,
            height: planetSize + 24,
            borderRadius: (planetSize + 24) / 2,
            borderWidth: 3,
            borderColor: planet.accent,
            opacity: pulseOpacityAnim.interpolate({
              inputRange: [0.3, 0.6],
              outputRange: [0.4, 0.9]
            }),
          }} />
        )}
        
        {/* Stellar flare effects for high-energy collisions */}
        {planet.glow && value >= 32768 && (
          <Animated.View style={{
            position: 'absolute',
            width: planetSize + 16,
            height: planetSize + 16,
            borderRadius: (planetSize + 16) / 2,
            borderWidth: 2,
            borderColor: '#FFD700',
            opacity: pulseOpacityAnim,
            shadowColor: '#FFD700',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 20,
            elevation: 25,
          }} />
        )}
      </Animated.View>

      {/* Simplified Orbiting Moons - only for smaller planets */}
      {planet.moons > 0 && value < 8192 && ( // Reduced threshold for performance
        <OrbitingMoons 
          planetSize={planetSize}
          moonCount={Math.min(planet.moons, 1)} // Max 1 moon for performance
          rotationAnim={rotationAnim}
        />
      )}

      {/* Circular clipping mask for text container */}
      <View style={{
        position: 'absolute',
        width: planetSize,
        height: planetSize,
        borderRadius: planetSize / 2,
        overflow: 'hidden', // Clip content at planet circumference
      }}>
        {/* Planet name and value display - Optimized layout with better proportions */}
        <View style={{
          position: 'absolute',
          bottom: -2,  // Move even lower to the very bottom
          left: -18,   // Keep full width extension
          right: -18,  // Keep full width extension
          height: planetSize * 0.55, // Keep reduced height for better proportions
          backgroundColor: 'rgba(0,0,0,0.8)',
          borderTopLeftRadius: planetSize * 0.3,  // Adjust curve for new height
          borderTopRightRadius: planetSize * 0.3, // Adjust curve for new height
          paddingHorizontal: 16,
          paddingTop: 6,  // Further reduced top padding
          paddingBottom: 4,  // Further reduced bottom padding
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.2)',
          justifyContent: 'flex-end', // Push content to bottom
          alignItems: 'center',
        }}>
        <Text style={{
          color: '#FFFFFF',
          fontSize: Math.max(10, planetSize * 0.12), // Slightly smaller font
          fontWeight: 'bold',
          textAlign: 'center',
          textShadowColor: 'rgba(0,0,0,0.9)',
          textShadowOffset: { width: 1, height: 1 },
          textShadowRadius: 2,
          marginBottom: 1, // Minimal space between name and number
        }} numberOfLines={1}>
          {planet.name}
        </Text>
        <Text style={{
          color: '#FFD700',
          fontSize: Math.max(13, planetSize * 0.16), // Slightly smaller font
          fontWeight: 'bold',
          textAlign: 'center',
          textShadowColor: 'rgba(0,0,0,0.9)',
          textShadowOffset: { width: 1, height: 1 },
          textShadowRadius: 2,
          flex: 0, // Prevent text from expanding
          marginBottom: 0, // Remove any bottom margin
        }} numberOfLines={1} adjustsFontSizeToFit={true} minimumFontScale={0.7}>
          {value === '∞' || value === Infinity ? '∞' : 
           value > 16000 ? Math.floor(value / 1000) + 'k' : value.toString()}
        </Text>
        </View>
      </View>
      
      {/* Infinity Symbol Overlay for Ultimate Black Hole */}
      {(value === 8388608 || value === '∞' || value === Infinity) && (
        <View style={{
          position: 'absolute',
          top: -planetSize * 0.3,
          left: 0,
          right: 0,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Text style={{
            color: '#FFD700',
            fontSize: planetSize * 0.4,
            fontWeight: 'bold',
            textAlign: 'center',
            textShadowColor: 'rgba(0,0,0,0.9)',
            textShadowOffset: { width: 2, height: 2 },
            textShadowRadius: 4,
            elevation: 10,
          }}>
            ∞
          </Text>
        </View>
      )}
    </View>
  );
};

// Realistic Planet component for authentic celestial bodies with collision physics
const RealisticPlanet = ({ planet, size, value, pulseScaleAnim, isColliding = false }) => {
  const getRealisticPlanetStyle = () => {
    const baseStyle = getBasePlanetStyle(planet);
    
    // Enhance collision effects for dramatic astronomical mergers
    if (isColliding) {
      return {
        ...baseStyle,
        style: {
          ...baseStyle.style,
          shadowOpacity: Math.min(baseStyle.style.shadowOpacity + 0.4, 1.0),
          shadowRadius: baseStyle.style.shadowRadius + 8,
          borderWidth: baseStyle.style.borderWidth + 1,
        }
      };
    }
    
    return baseStyle;
  };
  
  const getBasePlanetStyle = (planet) => {
    switch (planet.type) {
      case 'pluto':
        return {
          colors: ['#8DA3B0', '#6B7D87', '#4A5D6B'], // Darker, muted icy blue-gray
          style: { 
            borderWidth: 2, 
            borderColor: '#5C7A89',
            shadowColor: '#6B7D87',
            shadowOpacity: 0.5
          }
        };
      case 'moon':
        return {
          colors: ['#C5B89A', '#A69B85', '#8B7F6B'], // Darker, muted lunar beige
          style: { 
            borderWidth: 2, 
            borderColor: '#9A8E78',
            shadowColor: '#A69B85',
            shadowOpacity: 0.4
          }
        };
      case 'mercury':
        return {
          colors: ['#8B6F3D', '#6B5328', '#4A3B1F'], // Much darker, muted brownish
          style: { 
            borderWidth: 2, 
            borderColor: '#7A5F32',
            shadowColor: '#6B5328',
            shadowOpacity: 0.4
          }
        };
      case 'mars':
        return {
          colors: ['#FF6B47', '#CD5C5C', '#B22222'],
          style: { 
            borderWidth: 2, 
            borderColor: '#8B0000',
            shadowColor: '#CD5C5C',
            shadowOpacity: 0.6
          }
        };
      case 'venus':
        return {
          colors: ['#FFFF99', '#FFC649', '#DAA520'],
          style: { 
            borderWidth: 2, 
            borderColor: '#FFD700',
            shadowColor: '#FFC649',
            shadowOpacity: 0.8
          }
        };
      case 'earth':
        return {
          colors: ['#87CEEB', '#6B93D6', '#4682B4'],
          style: { 
            borderWidth: 2, 
            borderColor: '#4F7942',
            shadowColor: '#6B93D6',
            shadowOpacity: 0.7
          }
        };
      case 'neptune':
        return {
          colors: ['#4169E1', '#0000FF', '#191970'],
          style: { 
            borderWidth: 2, 
            borderColor: '#87CEEB',
            shadowColor: '#4169E1',
            shadowOpacity: 0.8
          }
        };
      case 'uranus':
        return {
          colors: ['#4FD0E3', '#48CAE4', '#0077BE'],
          style: { 
            borderWidth: 2, 
            borderColor: '#90E0EF',
            shadowColor: '#4FD0E3',
            shadowOpacity: 0.7
          }
        };
      case 'saturn':
        return {
          colors: ['#FFEAA7', '#FAD5A5', '#DDB892'],
          style: { 
            borderWidth: 3, 
            borderColor: '#F4D03F',
            shadowColor: '#FFEAA7',
            shadowOpacity: 0.8
          }
        };
      case 'jupiter':
        return {
          colors: ['#DEB887', '#D2B48C', '#F5DEB3'],
          style: { 
            borderWidth: 2, 
            borderColor: '#BC8F8F',
            shadowColor: '#D2B48C',
            shadowOpacity: 0.7
          }
        };
      case 'polaris':
        return {
          colors: ['#87CEEB', '#4169E1', '#E0F6FF'],
          style: { 
            borderWidth: 2, 
            borderColor: '#4169E1',
            shadowColor: '#87CEEB',
            shadowOpacity: 0.8,
            shadowRadius: 15
          }
        };
      case 'sirius':
        return {
          colors: ['#FFFFFF', '#F0F8FF', '#E6E6FA'],
          style: { 
            borderWidth: 2, 
            borderColor: '#E6E6FA',
            shadowColor: '#FFFFFF',
            shadowOpacity: 0.9,
            shadowRadius: 20
          }
        };
      case 'vega':
        return {
          colors: ['#87CEEB', '#4169E1', '#E0F6FF'],
          style: { 
            borderWidth: 2, 
            borderColor: '#4169E1',
            shadowColor: '#87CEEB',
            shadowOpacity: 0.8,
            shadowRadius: 18
          }
        };
      case 'sun':
        return {
          colors: [planet.primary, planet.accent, '#FFD70080'],
          style: { 
            borderWidth: 2, 
            borderColor: planet.accent,
            shadowColor: planet.primary,
            shadowOpacity: 0.9
          }
        };
      case 'ultimate_black_hole':
        return {
          colors: ['#000000', '#000000', '#000000'], // Pure black void
          style: { 
            borderWidth: 0, // No border - it's a void
            borderColor: 'transparent',
            shadowColor: '#9932CC', // Purple glow around the void
            shadowOpacity: 0.8,
            shadowRadius: 20,
            elevation: 15
          }
        };
      case 'orion_nebula':
        return {
          colors: ['#9370DB', '#8A2BE2', '#6A5ACD'], // Purple nebula colors
          style: { 
            borderWidth: 0, // No border - nebulae are gas clouds
            borderColor: 'transparent',
            shadowColor: '#9370DB',
            shadowOpacity: 0.7,
            shadowRadius: 15
          }
        };
      case 'milky_way':
        return {
          colors: ['#E6E6FA', '#F0F8FF', '#B0C4DE'], // New silvery galaxy colors
          style: { 
            borderWidth: 0, // No border - galaxies are star systems
            borderColor: 'transparent',
            shadowColor: '#F0F8FF', // Updated to match new accent color
            shadowOpacity: 0.8,
            shadowRadius: 18
          }
        };
      default:
        // Use actual planet colors from getPlanetType instead of generic gray
        return {
          colors: [planet.primary, planet.accent, planet.primary + '80'],
          style: { 
            borderWidth: planet.rings ? 3 : 1, 
            borderColor: planet.accent,
            shadowColor: planet.glow ? planet.primary : '#808080',
            shadowOpacity: planet.glow ? 0.8 : 0.5
          }
        };
    }
  };

  const gradient = getRealisticPlanetStyle();

  // Special rendering for nebula - it's a gas cloud, not a planet
  if (planet.type === 'orion_nebula') {
    return (
      <DynamicOrionNebula size={size} />
    );
  }

  // Special rendering for Milky Way - it's a spiral galaxy, not a planet
  if (planet.type === 'milky_way') {
    return (
      <DynamicMilkyWay size={size} />
    );
  }

  // Special rendering for black hole - it's a void, not a planet
  if (planet.type === 'ultimate_black_hole') {
    return (
      <View style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: '#000000', // Pure black void
        position: 'relative',
        overflow: 'hidden',
        ...gradient.style,
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 20,
        elevation: 15,
      }}>
        
        {/* Black hole event horizon - pure void */}
        <View style={{
          position: 'absolute',
          top: size * 0.1,
          left: size * 0.1,
          width: size * 0.8,
          height: size * 0.8,
          borderRadius: size / 2,
          backgroundColor: '#000000',
          borderWidth: 0,
        }} />
        
        {/* Purple accretion disk glow around the void */}
        <View style={{
          position: 'absolute',
          top: -size * 0.1,
          left: -size * 0.1,
          width: size * 1.2,
          height: size * 1.2,
          borderRadius: size * 0.6,
          borderWidth: 3,
          borderColor: '#9932CC',
          backgroundColor: 'transparent',
          opacity: 0.6,
        }} />
        
        {/* Inner void - completely black center */}
        <View style={{
          position: 'absolute',
          top: size * 0.25,
          left: size * 0.25,
          width: size * 0.5,
          height: size * 0.5,
          borderRadius: size * 0.25,
          backgroundColor: '#000000',
        }} />
      </View>
    );
  }

  // Normal planet rendering
  return (
    <View style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: gradient.colors[0],
      position: 'relative',
      overflow: 'hidden',
      ...gradient.style,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: planet.glow ? 12 : 8,
      elevation: planet.glow ? 10 : 6,
    }}>
      
      {/* Optimized gradient layers for realistic depth */}
      <View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: gradient.colors[1],
        opacity: 0.8,
      }} />
      
      {/* Core layer */}
      <View style={{
        position: 'absolute',
        top: size * 0.2,
        left: size * 0.2,
        width: size * 0.8,
        height: size * 0.8,
        borderRadius: size * 0.4,
        backgroundColor: gradient.colors[2],
        opacity: 0.6,
      }} />
      
      {/* Stellar illumination - realistic sun lighting */}
      <View style={{
        position: 'absolute',
        top: size * 0.08,
        left: size * 0.08,
        width: size * 0.4,
        height: size * 0.4,
        borderRadius: size * 0.2,
        backgroundColor: 'rgba(255,255,255,0.4)',
      }} />
      
      {/* Planet-specific authentic features */}
      <AuthenticPlanetFeatures planet={planet} size={size} value={value} />
    </View>
  );
};

// Authentic planet-specific surface features based on real astronomy
const AuthenticPlanetFeatures = ({ planet, size, value }) => {
  switch (planet.type) {
    case 'mercury':
      return (
        <>
          {/* Impact craters like the real Mercury */}
          <View style={{
            position: 'absolute',
            width: size * 0.15,
            height: size * 0.15,
            backgroundColor: 'rgba(0,0,0,0.3)',
            borderRadius: size * 0.075,
            top: size * 0.3,
            left: size * 0.2,
          }} />
          <View style={{
            position: 'absolute',
            width: size * 0.1,
            height: size * 0.1,
            backgroundColor: 'rgba(0,0,0,0.25)',
            borderRadius: size * 0.05,
            top: size * 0.6,
            right: size * 0.25,
          }} />
        </>
      );
    
    case 'mars':
      return (
        <>
          {/* Polar ice caps */}
          <View style={{
            position: 'absolute',
            width: size * 0.25,
            height: size * 0.15,
            backgroundColor: 'rgba(255,255,255,0.9)',
            borderRadius: size * 0.075,
            top: size * 0.05,
            left: size * 0.375,
          }} />
          {/* Valles Marineris canyon system */}
          <View style={{
            position: 'absolute',
            width: size * 0.4,
            height: size * 0.05,
            backgroundColor: 'rgba(139,69,19,0.8)',
            borderRadius: size * 0.025,
            top: size * 0.45,
            left: size * 0.3,
          }} />
        </>
      );
    
    case 'earth':
      return (
        <>
          {/* Continents */}
          <View style={{
            position: 'absolute',
            width: size * 0.3,
            height: size * 0.25,
            backgroundColor: '#228B22',
            borderRadius: size * 0.1,
            top: size * 0.2,
            left: size * 0.1,
            opacity: 0.9,
          }} />
          <View style={{
            position: 'absolute',
            width: size * 0.25,
            height: size * 0.2,
            backgroundColor: '#228B22',
            borderRadius: size * 0.08,
            bottom: size * 0.15,
            right: size * 0.15,
            opacity: 0.9,
          }} />
          {/* Cloud formations */}
          <View style={{
            position: 'absolute',
            width: size * 0.4,
            height: size * 0.15,
            backgroundColor: 'rgba(255,255,255,0.6)',
            borderRadius: size * 0.075,
            top: size * 0.3,
            right: size * 0.1,
          }} />
        </>
      );
    
    case 'polaris':
      return (
        <>
          {/* Polaris - North Star with blue-white glow */}
          {/* Central bright core */}
          <View style={{
            position: 'absolute',
            width: size * 0.4,
            height: size * 0.4,
            borderRadius: size * 0.2,
            backgroundColor: '#FFFFFF',
            top: size * 0.3,
            left: size * 0.3,
            opacity: 0.9,
          }} />
          
          {/* Blue outer glow */}
          <View style={{
            position: 'absolute',
            width: size * 0.7,
            height: size * 0.7,
            borderRadius: size * 0.35,
            backgroundColor: '#87CEEB',
            top: size * 0.15,
            left: size * 0.15,
            opacity: 0.6,
          }} />
          
          {/* Royal blue corona */}
          <View style={{
            position: 'absolute',
            width: size * 0.9,
            height: size * 0.9,
            borderRadius: size * 0.45,
            backgroundColor: '#4169E1',
            top: size * 0.05,
            left: size * 0.05,
            opacity: 0.4,
          }} />
          
          {/* Stellar flares - blue spikes */}
          <View style={{
            position: 'absolute',
            width: size * 0.1,
            height: size * 0.3,
            backgroundColor: '#87CEEB',
            top: size * 0.1,
            left: size * 0.45,
            borderRadius: size * 0.05,
          }} />
          <View style={{
            position: 'absolute',
            width: size * 0.1,
            height: size * 0.25,
            backgroundColor: '#87CEEB',
            bottom: size * 0.1,
            left: size * 0.45,
            borderRadius: size * 0.05,
          }} />
        </>
      );
    
    case 'sirius':
      return (
        <>
          {/* Sirius - Brightest star with white brilliance */}
          {/* Intense white core */}
          <View style={{
            position: 'absolute',
            width: size * 0.5,
            height: size * 0.5,
            borderRadius: size * 0.25,
            backgroundColor: '#FFFFFF',
            top: size * 0.25,
            left: size * 0.25,
            opacity: 1,
          }} />
          
          {/* Bright white corona */}
          <View style={{
            position: 'absolute',
            width: size * 0.8,
            height: size * 0.8,
            borderRadius: size * 0.4,
            backgroundColor: '#F0F8FF',
            top: size * 0.1,
            left: size * 0.1,
            opacity: 0.8,
          }} />
          
          {/* Soft lavender outer glow */}
          <View style={{
            position: 'absolute',
            width: size * 0.95,
            height: size * 0.95,
            borderRadius: size * 0.475,
            backgroundColor: '#E6E6FA',
            top: size * 0.025,
            left: size * 0.025,
            opacity: 0.5,
          }} />
          
          {/* Bright stellar rays - white spikes */}
          <View style={{
            position: 'absolute',
            width: size * 0.08,
            height: size * 0.35,
            backgroundColor: '#FFFFFF',
            top: size * 0.05,
            left: size * 0.46,
            borderRadius: size * 0.04,
          }} />
          <View style={{
            position: 'absolute',
            width: size * 0.08,
            height: size * 0.35,
            backgroundColor: '#FFFFFF',
            bottom: size * 0.05,
            left: size * 0.46,
            borderRadius: size * 0.04,
          }} />
          <View style={{
            position: 'absolute',
            width: size * 0.35,
            height: size * 0.08,
            backgroundColor: '#FFFFFF',
            top: size * 0.46,
            left: size * 0.05,
            borderRadius: size * 0.04,
          }} />
          <View style={{
            position: 'absolute',
            width: size * 0.35,
            height: size * 0.08,
            backgroundColor: '#FFFFFF',
            top: size * 0.46,
            right: size * 0.05,
            borderRadius: size * 0.04,
          }} />
        </>
      );
    
    case 'vega':
      return (
        <>
          {/* Vega - Bright blue-white star with stellar brilliance */}
          {/* Intense blue-white core */}
          <View style={{
            position: 'absolute',
            width: size * 0.45,
            height: size * 0.45,
            borderRadius: size * 0.225,
            backgroundColor: '#FFFFFF',
            top: size * 0.275,
            left: size * 0.275,
            opacity: 1,
          }} />
          
          {/* Bright blue corona */}
          <View style={{
            position: 'absolute',
            width: size * 0.75,
            height: size * 0.75,
            borderRadius: size * 0.375,
            backgroundColor: '#87CEEB',
            top: size * 0.125,
            left: size * 0.125,
            opacity: 0.8,
          }} />
          
          {/* Deep blue outer glow */}
          <View style={{
            position: 'absolute',
            width: size * 0.9,
            height: size * 0.9,
            borderRadius: size * 0.45,
            backgroundColor: '#4169E1',
            top: size * 0.05,
            left: size * 0.05,
            opacity: 0.5,
          }} />
          
          {/* Stellar rays - blue-white spikes in 8 directions */}
          <View style={{
            position: 'absolute',
            width: size * 0.08,
            height: size * 0.4,
            backgroundColor: '#87CEEB',
            top: size * 0.05,
            left: size * 0.46,
            borderRadius: size * 0.04,
          }} />
          <View style={{
            position: 'absolute',
            width: size * 0.08,
            height: size * 0.4,
            backgroundColor: '#87CEEB',
            bottom: size * 0.05,
            left: size * 0.46,
            borderRadius: size * 0.04,
          }} />
          <View style={{
            position: 'absolute',
            width: size * 0.4,
            height: size * 0.08,
            backgroundColor: '#87CEEB',
            top: size * 0.46,
            left: size * 0.05,
            borderRadius: size * 0.04,
          }} />
          <View style={{
            position: 'absolute',
            width: size * 0.4,
            height: size * 0.08,
            backgroundColor: '#87CEEB',
            top: size * 0.46,
            right: size * 0.05,
            borderRadius: size * 0.04,
          }} />
          
          {/* Diagonal rays for 8-pointed star effect */}
          <View style={{
            position: 'absolute',
            width: size * 0.08,
            height: size * 0.35,
            backgroundColor: '#87CEEB',
            top: size * 0.15,
            left: size * 0.15,
            borderRadius: size * 0.04,
            transform: [{ rotate: '45deg' }],
          }} />
          <View style={{
            position: 'absolute',
            width: size * 0.08,
            height: size * 0.35,
            backgroundColor: '#87CEEB',
            top: size * 0.15,
            right: size * 0.15,
            borderRadius: size * 0.04,
            transform: [{ rotate: '-45deg' }],
          }} />
          <View style={{
            position: 'absolute',
            width: size * 0.08,
            height: size * 0.35,
            backgroundColor: '#87CEEB',
            bottom: size * 0.15,
            left: size * 0.15,
            borderRadius: size * 0.04,
            transform: [{ rotate: '-45deg' }],
          }} />
          <View style={{
            position: 'absolute',
            width: size * 0.08,
            height: size * 0.35,
            backgroundColor: '#87CEEB',
            bottom: size * 0.15,
            right: size * 0.15,
            borderRadius: size * 0.04,
            transform: [{ rotate: '45deg' }],
          }} />
        </>
      );
    
    case 'jupiter':
      return (
        <>
          {/* Premium Jupiter with refined color palette */}
          {/* Main equatorial band - warm cream */}
          <View style={{
            position: 'absolute',
            width: size * 0.95,
            height: size * 0.2,
            backgroundColor: '#F5DEB3',
            top: size * 0.35,
            left: size * 0.025,
            borderRadius: size * 0.1,
          }} />
          
          {/* North temperate belt - soft beige */}
          <View style={{
            position: 'absolute',
            width: size * 0.9,
            height: size * 0.15,
            backgroundColor: '#DEB887',
            top: size * 0.15,
            left: size * 0.05,
            borderRadius: size * 0.075,
          }} />
          
          {/* South temperate belt - soft beige */}
          <View style={{
            position: 'absolute',
            width: size * 0.88,
            height: size * 0.14,
            backgroundColor: '#DEB887',
            top: size * 0.6,
            left: size * 0.06,
            borderRadius: size * 0.07,
          }} />
          
          {/* North tropical zone - warm tan */}
          <View style={{
            position: 'absolute',
            width: size * 0.92,
            height: size * 0.16,
            backgroundColor: '#D2B48C',
            top: size * 0.25,
            left: size * 0.04,
            borderRadius: size * 0.08,
          }} />
          
          {/* South tropical zone - warm tan */}
          <View style={{
            position: 'absolute',
            width: size * 0.9,
            height: size * 0.15,
            backgroundColor: '#D2B48C',
            top: size * 0.5,
            left: size * 0.05,
            borderRadius: size * 0.075,
          }} />
          
          {/* Great Red Spot - iconic storm with refined color */}
          <View style={{
            position: 'absolute',
            width: size * 0.28,
            height: size * 0.14,
            backgroundColor: '#CD5C5C',
            top: size * 0.45,
            right: size * 0.12,
            borderRadius: size * 0.07,
            transform: [{ rotate: '15deg' }],
          }} />
          
          {/* Subtle atmospheric detail - soft brown */}
          <View style={{
            position: 'absolute',
            width: size * 0.25,
            height: size * 0.08,
            backgroundColor: '#BC8F8F',
            top: size * 0.3,
            left: size * 0.15,
            borderRadius: size * 0.04,
            opacity: 0.7,
          }} />
          
          {/* Elegant storm system - muted white */}
          <View style={{
            position: 'absolute',
            width: size * 0.18,
            height: size * 0.1,
            backgroundColor: '#F5F5DC',
            top: size * 0.2,
            left: size * 0.25,
            borderRadius: size * 0.05,
            opacity: 0.8,
          }} />
        </>
      );
    
    case 'ultimate_black_hole':
      return (
        <>
          {/* Cosmic void effects - no surface features, just emptiness */}
          {/* Event horizon ring */}
          <View style={{
            position: 'absolute',
            width: size * 0.9,
            height: size * 0.9,
            borderRadius: size * 0.45,
            borderWidth: 2,
            borderColor: '#9932CC',
            backgroundColor: 'transparent',
            opacity: 0.4,
          }} />
          
          {/* Inner void - completely empty center */}
          <View style={{
            position: 'absolute',
            width: size * 0.6,
            height: size * 0.6,
            borderRadius: size * 0.3,
            backgroundColor: '#000000',
            top: size * 0.2,
            left: size * 0.2,
          }} />
        </>
      );
    
    case 'orion_nebula':
      return (
        <>
          {/* Gas cloud details - no solid surface */}
          {/* Bright star-forming regions */}
          <View style={{
            position: 'absolute',
            width: size * 0.15,
            height: size * 0.15,
            borderRadius: size * 0.075,
            backgroundColor: '#E6E6FA',
            top: size * 0.25,
            left: size * 0.2,
            opacity: 0.9,
          }} />
          
          {/* Dark dust lanes */}
          <View style={{
            position: 'absolute',
            width: size * 0.2,
            height: size * 0.08,
            borderRadius: size * 0.04,
            backgroundColor: 'rgba(0,0,0,0.6)',
            top: size * 0.45,
            left: size * 0.3,
            opacity: 0.7,
          }} />
        </>
      );
    
    case 'milky_way':
      return (
        <>
          {/* Galaxy details - realistic spiral galaxy features */}
          {/* Central black hole - invisible but present */}
          <View style={{
            position: 'absolute',
            width: size * 0.08,
            height: size * 0.08,
            borderRadius: size * 0.04,
            backgroundColor: 'rgba(0,0,0,0.8)',
            top: size * 0.46,
            left: size * 0.46,
            opacity: 0.9,
          }} />
          
          {/* Molecular clouds - dark dust regions */}
          <View style={{
            position: 'absolute',
            width: size * 0.2,
            height: size * 0.12,
            borderRadius: size * 0.06,
            backgroundColor: 'rgba(139,69,19,0.6)',
            top: size * 0.25,
            left: size * 0.15,
            opacity: 0.7,
          }} />
          
          {/* Additional star-forming regions */}
          <View style={{
            position: 'absolute',
            width: size * 0.1,
            height: size * 0.1,
            borderRadius: size * 0.05,
            backgroundColor: '#FFB6C1',
            top: size * 0.35,
            right: size * 0.15,
            opacity: 0.8,
          }} />
          
          {/* Galactic bulge stars */}
          <View style={{
            position: 'absolute',
            width: size * 0.06,
            height: size * 0.06,
            borderRadius: size * 0.03,
            backgroundColor: '#F0E68C',
            top: size * 0.2,
            left: size * 0.4,
            opacity: 0.9,
          }} />
          
          {/* Spiral arm dust lanes */}
          <View style={{
            position: 'absolute',
            width: size * 0.15,
            height: size * 0.08,
            borderRadius: size * 0.04,
            backgroundColor: 'rgba(160,82,45,0.5)',
            top: size * 0.5,
            right: size * 0.3,
            opacity: 0.6,
          }} />
        </>
      );
    
    default:
      return null;
  }
};

// Helper component for orbiting moons
const OrbitingMoons = ({ planetSize, moonCount, rotationAnim }) => {
  return (
    <>
      {[...Array(moonCount)].map((_, index) => {
        const orbitRadius = planetSize * (0.65 + index * 0.2);
        const moonSize = planetSize * 0.12;
        const moonRotation = rotationAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [`${index * 120}deg`, `${index * 120 + 360}deg`],
        });

        return (
          <Animated.View
            key={index}
            style={{
              position: 'absolute',
              width: orbitRadius * 2,
              height: orbitRadius * 2,
              top: (CELL_SIZE - orbitRadius * 2) / 2,
              left: (CELL_SIZE - orbitRadius * 2) / 2,
              transform: [{ rotate: moonRotation }],
            }}
          >
            <View style={{
              position: 'absolute',
              width: moonSize,
              height: moonSize,
              borderRadius: moonSize / 2,
              backgroundColor: '#C0C0C0',
              borderWidth: 1,
              borderColor: '#E0E0E0',
              top: -moonSize / 2,
              left: orbitRadius - moonSize / 2,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.3,
              shadowRadius: 2,
              elevation: 3,
            }} />
          </Animated.View>
        );
      })}
    </>
  );
};

export default PlanetTile; 