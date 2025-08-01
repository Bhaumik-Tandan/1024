import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Individual moving star component
const MovingStar = ({ initialX, initialY, size, speed, opacity, color }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(opacity)).current;

  useEffect(() => {
    // Create continuous movement downward (simulating forward motion through space)
    const moveAnimation = Animated.loop(
      Animated.timing(translateY, {
        toValue: height + 100,
        duration: speed,
        useNativeDriver: true,
      })
    );

    // Add slight horizontal drift for realism
    const driftAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(translateX, {
          toValue: Math.random() * 20 - 10,
          duration: speed / 3,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: 0,
          duration: speed / 3,
          useNativeDriver: true,
        }),
      ])
    );

    // Twinkling effect
    const twinkleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: opacity * 0.3,
          duration: 1000 + Math.random() * 2000,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: opacity,
          duration: 1000 + Math.random() * 2000,
          useNativeDriver: true,
        }),
      ])
    );

    // Scale pulsing for depth effect
    const scaleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: speed / 2,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: speed / 2,
          useNativeDriver: true,
        }),
      ])
    );

    moveAnimation.start();
    driftAnimation.start();
    twinkleAnimation.start();
    scaleAnimation.start();

    return () => {
      moveAnimation.stop();
      driftAnimation.stop();
      twinkleAnimation.stop();
      scaleAnimation.stop();
    };
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: initialX,
        top: initialY,
        width: size,
        height: size,
        backgroundColor: color,
        borderRadius: size / 2,
        transform: [
          { translateY },
          { translateX },
          { scale: scaleAnim },
        ],
        opacity: opacityAnim,
      }}
    />
  );
};

// Main moving starfield component
export const MovingStarfield = ({ starCount = 100, speed = 'medium' }) => {
  const stars = useRef([]);

  // Generate stars with different properties
  if (stars.current.length === 0) {
    for (let i = 0; i < starCount; i++) {
      const size = 0.5 + Math.random() * 3;
      const baseSpeed = speed === 'fast' ? 8000 : speed === 'slow' ? 20000 : 12000;
      const starSpeed = baseSpeed + Math.random() * 5000;
      const opacity = 0.2 + Math.random() * 0.8;
      const x = Math.random() * width;
      const y = -100 - Math.random() * height; // Start above screen
      
      // Different star colors for variety
      const colors = ['#FFFFFF', '#F0F8FF', '#FFE4E1', '#E6E6FA', '#FFFACD'];
      const color = colors[Math.floor(Math.random() * colors.length)];

      stars.current.push({
        id: i,
        size,
        speed: starSpeed,
        opacity,
        x,
        y,
        color,
      });
    }
  }

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
      }}
      pointerEvents="none"
    >
      {stars.current.map((star) => (
        <MovingStar
          key={star.id}
          initialX={star.x}
          initialY={star.y}
          size={star.size}
          speed={star.speed}
          opacity={star.opacity}
          color={star.color}
        />
      ))}
    </View>
  );
};

// Continuous star spawning component for infinite effect
export const ContinuousStarfield = ({ 
  starCount = 80, 
  spawnRate = 2000, // milliseconds between new star spawns
  speed = 'medium' 
}) => {
  const activeStars = useRef([]);
  const nextId = useRef(0);

  useEffect(() => {
    const spawnStar = () => {
      const size = 0.5 + Math.random() * 2.5;
      const baseSpeed = speed === 'fast' ? 6000 : speed === 'slow' ? 15000 : 10000;
      const starSpeed = baseSpeed + Math.random() * 4000;
      const opacity = 0.3 + Math.random() * 0.7;
      const x = Math.random() * width;
      const y = -20; // Start just above screen
      
      const colors = ['#FFFFFF', '#F0F8FF', '#FFE4E1', '#E6E6FA', '#FFFACD'];
      const color = colors[Math.floor(Math.random() * colors.length)];

      const newStar = {
        id: nextId.current++,
        size,
        speed: starSpeed,
        opacity,
        x,
        y,
        color,
        createdAt: Date.now(),
      };

      activeStars.current.push(newStar);

      // Remove old stars that have moved off screen
      activeStars.current = activeStars.current.filter(
        star => Date.now() - star.createdAt < star.speed + 2000
      );
    };

    // Initial batch of stars
    for (let i = 0; i < starCount; i++) {
      setTimeout(() => spawnStar(), i * (spawnRate / starCount));
    }

    // Continuous spawning
    const interval = setInterval(spawnStar, spawnRate);

    return () => clearInterval(interval);
  }, [starCount, spawnRate, speed]);

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
      }}
      pointerEvents="none"
    >
      {activeStars.current.map((star) => (
        <MovingStar
          key={star.id}
          initialX={star.x}
          initialY={star.y}
          size={star.size}
          speed={star.speed}
          opacity={star.opacity}
          color={star.color}
        />
      ))}
    </View>
  );
};

export default MovingStarfield; 