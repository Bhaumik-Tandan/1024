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
      
      {/* Distant Starfield - Reduced for performance */}
      <StarField starCount={50} />
      
      {/* Nebula Clouds */}
      <NebulaClouds />
      
      {/* Animated Cosmic Dust - Reduced for performance */}
      <CosmicDust />
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

// Individual animated star - Fixed animation drivers
const AnimatedStar = ({ index }) => {
  const twinkleAnim = useRef(new Animated.Value(0.3)).current;
  const positionAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Twinkling effect - JS Driver
    const twinkleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(twinkleAnim, {
          toValue: 1,
          duration: 2000 + Math.random() * 3000,
          useNativeDriver: false, // JS driver for consistency
        }),
        Animated.timing(twinkleAnim, {
          toValue: 0.3,
          duration: 1000 + Math.random() * 2000,
          useNativeDriver: false, // JS driver for consistency
        }),
      ])
    );
    
    // Slow drift motion - JS Driver
    const positionAnimation = Animated.loop(
      Animated.timing(positionAnim, {
        toValue: 1,
        duration: 30000 + Math.random() * 20000,
        useNativeDriver: false, // JS driver for consistency
      })
    );
    
    // Stagger animations
    setTimeout(() => {
      twinkleAnimation.start();
      positionAnimation.start();
    }, index * 50);
    
    return () => {
      twinkleAnimation.stop();
      positionAnimation.stop();
    };
  }, [index, twinkleAnim, positionAnim]);

  // Random star properties
  const starSize = 1 + Math.random() * 2;
  const initialX = Math.random() * width;
  const initialY = Math.random() * height;
  const driftX = (Math.random() - 0.5) * 15;
  const driftY = (Math.random() - 0.5) * 15;

  const translateX = positionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, driftX],
  });

  const translateY = positionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, driftY],
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: initialX,
        top: initialY,
        width: starSize,
        height: starSize,
        borderRadius: starSize / 2,
        backgroundColor: THEME.DARK.STARFIELD,
        opacity: twinkleAnim, // Opacity animation
        transform: [
          { translateX }, // Transform animation - JS driver
          { translateY },
        ],
      }}
    />
  );
};

// Nebula cloud effects
const NebulaClouds = () => {
  return (
    <>
      {/* Purple Nebula */}
      <NebulaCloud
        color={THEME.DARK.COSMIC_PURPLE}
        size={200}
        position={{ top: height * 0.1, left: -30 }}
        duration={40000}
      />
      
      {/* Pink Nebula */}
      <NebulaCloud
        color={THEME.DARK.NEBULA_PINK}
        size={180}
        position={{ bottom: height * 0.2, right: -20 }}
        duration={35000}
      />
      
      {/* Blue Nebula */}
      <NebulaCloud
        color={THEME.DARK.COSMIC_ACCENT}
        size={150}
        position={{ top: height * 0.6, left: width * 0.4 }}
        duration={45000}
      />
    </>
  );
};

// Individual nebula cloud - Fixed drivers
const NebulaCloud = ({ color, size, position, duration }) => {
  const opacityAnim = useRef(new Animated.Value(0.1)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  
  useEffect(() => {
    // Opacity animation - JS Driver
    const opacityAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.25,
          duration: duration,
          useNativeDriver: false, // Opacity requires JS driver
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.1,
          duration: duration,
          useNativeDriver: false,
        }),
      ])
    );
    
    // Scale animation - JS Driver
    const scaleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: duration * 1.2,
          useNativeDriver: false, // JS driver for consistency
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: duration * 1.2,
          useNativeDriver: false, // JS driver for consistency
        }),
      ])
    );
    
    opacityAnimation.start();
    scaleAnimation.start();
    
    return () => {
      opacityAnimation.stop();
      scaleAnimation.stop();
    };
  }, [opacityAnim, scaleAnim, duration]);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        ...position,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity: opacityAnim, // Opacity animation
        transform: [{ scale: scaleAnim }], // Transform animation
      }}
    />
  );
};

// Cosmic dust particles - Reduced for performance
const CosmicDust = () => {
  const dustParticles = [...Array(8)].map((_, index) => (
    <DustParticle key={index} index={index} />
  ));

  return (
    <View style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    }}>
      {dustParticles}
    </View>
  );
};

// Individual dust particle - Fixed drivers
const DustParticle = ({ index }) => {
  const moveAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    const delay = index * 800;
    
    // Movement animation - JS Driver
    const moveAnimation = Animated.loop(
      Animated.timing(moveAnim, {
        toValue: 1,
        duration: 15000 + Math.random() * 10000,
        useNativeDriver: false, // JS driver for consistency
      })
    );
    
    // Opacity animation - JS Driver  
    const opacityAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.6,
          duration: 4000,
          useNativeDriver: false, // Opacity requires JS driver
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: false,
        }),
      ])
    );
    
    setTimeout(() => {
      moveAnimation.start();
      opacityAnimation.start();
    }, delay);
    
    return () => {
      moveAnimation.stop();
      opacityAnimation.stop();
    };
  }, [index, moveAnim, opacityAnim]);

  const startX = Math.random() * width;
  const startY = height + 10;
  const endX = startX + (Math.random() - 0.5) * 80;
  const endY = -10;

  const translateX = moveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [startX, endX],
  });

  const translateY = moveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [startY, endY],
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: 1.5,
        height: 1.5,
        borderRadius: 0.75,
        backgroundColor: THEME.DARK.STELLAR_GLOW,
        opacity: opacityAnim, // Opacity animation
        transform: [
          { translateX }, // Transform animation
          { translateY },
        ],
      }}
    />
  );
};

export default SpaceBackground; 