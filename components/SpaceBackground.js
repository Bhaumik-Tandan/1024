/**
 * ===========================
 * DEEP SPACE BACKGROUND
 * ===========================
 * 
 * Mesmerizing cosmic environment with animated stars, nebulas, and space phenomena
 * Fixed animation drivers for smooth performance
 */

import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions } from 'react-native';
import { THEME } from './constants';

const { width, height } = Dimensions.get('window');

const SpaceBackground = () => {
  return (
    <View style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: THEME.DARK.BACKGROUND_PRIMARY,
    }}>
      
      {/* Optimized Starfield - Balanced performance */}
      <StarField starCount={35} />
      
      {/* Simple distant stars - static for performance */}
      <StaticStars starCount={25} />
      
      {/* Reduced Nebula Clouds */}
      <NebulaClouds />
      
      {/* Cosmic dust removed for performance */}
    </View>
  );
};

// Animated starfield component
const StarField = ({ starCount }) => {
  const stars = [...Array(starCount)].map((_, index) => (
    <AnimatedStar key={index} index={index} />
  ));

  return (
    <View style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    }}>
      {stars}
    </View>
  );
};

// Individual animated star - Optimized for performance
const AnimatedStar = ({ index }) => {
  const twinkleAnim = useRef(new Animated.Value(0.4)).current;
  
  useEffect(() => {
    // Simplified twinkling - Native Driver
    const twinkleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(twinkleAnim, {
          toValue: 1,
          duration: 2000 + Math.random() * 2000, // Faster duration
          useNativeDriver: true, // Native driver for better performance
        }),
        Animated.timing(twinkleAnim, {
          toValue: 0.4,
          duration: 1500 + Math.random() * 1500,
          useNativeDriver: true, // Native driver for better performance
        }),
      ])
    );
    
    // Stagger animations for performance
    setTimeout(() => {
      twinkleAnimation.start();
    }, index * 100); // Less frequent staggering
    
    return () => {
      twinkleAnimation.stop();
    };
  }, [index, twinkleAnim]);

  // Simplified star properties
  const starSize = 1 + Math.random() * 1.5; // Smaller range
  const initialX = Math.random() * width;
  const initialY = Math.random() * height;
  
  // Simplified colors for performance
  const starColor = Math.random() > 0.5 ? '#FFFFFF' : '#F0F8FF';

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: initialX,
        top: initialY,
        width: starSize,
        height: starSize,
        borderRadius: starSize / 2,
        backgroundColor: starColor,
        opacity: twinkleAnim, // Simple opacity animation with native driver
      }}
    />
  );
};

// Static background stars for performance
const StaticStars = ({ starCount }) => {
  // Generate static stars only once
  const staticStars = React.useMemo(() => {
    return [...Array(starCount)].map((_, index) => {
      const starSize = 0.5 + Math.random() * 1;
      const x = Math.random() * width;
      const y = Math.random() * height;
      const opacity = 0.3 + Math.random() * 0.4;
      const color = ['#FFFFFF', '#F0F8FF', '#FFE4E1'][Math.floor(Math.random() * 3)];
      
      return (
        <View
          key={`static-${index}`}
          style={{
            position: 'absolute',
            left: x,
            top: y,
            width: starSize,
            height: starSize,
            borderRadius: starSize / 2,
            backgroundColor: color,
            opacity: opacity,
          }}
        />
      );
    });
  }, [starCount]);

  return (
    <View style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    }}>
      {staticStars}
    </View>
  );
};

// Simplified nebula cloud effects
const NebulaClouds = () => {
  return (
    <>
      {/* Reduced to 2 nebulas for performance */}
      <NebulaCloud
        color={THEME.DARK.COSMIC_PURPLE}
        size={150} // Smaller size
        position={{ top: height * 0.15, left: -20 }}
        duration={50000} // Slower animation
      />
      
      <NebulaCloud
        color={THEME.DARK.COSMIC_ACCENT}
        size={120} // Smaller size
        position={{ bottom: height * 0.25, right: -15 }}
        duration={45000} // Slower animation
      />
    </>
  );
};

// Individual nebula cloud - Optimized
const NebulaCloud = ({ color, size, position, duration }) => {
  const opacityAnim = useRef(new Animated.Value(0.1)).current;
  
  useEffect(() => {
    // Simplified opacity animation - Native Driver
    const opacityAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.2, // Reduced max opacity
          duration: duration,
          useNativeDriver: true, // Native driver for performance
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.1,
          duration: duration,
          useNativeDriver: true,
        }),
      ])
    );
    
    opacityAnimation.start();
    
    return () => {
      opacityAnimation.stop();
    };
  }, [opacityAnim, duration]);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        ...position,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity: opacityAnim, // Native driver opacity
      }}
    />
  );
};

export default SpaceBackground; 