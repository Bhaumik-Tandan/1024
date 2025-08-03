import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// PERFORMANCE: Simplified moving star component for space travel feel
const MovingStar = React.memo(({ initialX, initialY, size, speed, opacity, color, depth = 1 }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(opacity)).current;

  useEffect(() => {
    // PERFORMANCE: Simplified movement - only downward motion
    const moveAnimation = Animated.loop(
      Animated.timing(translateY, {
        toValue: height + 100,
        duration: speed / depth, // Closer stars move faster
        useNativeDriver: true,
      })
    );

    // PERFORMANCE: Reduced twinkling frequency
    const twinkleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: opacity * 0.5,
          duration: 6000 + Math.random() * 4000, // Slower twinkling
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: opacity,
          duration: 6000 + Math.random() * 4000, // Slower twinkling
          useNativeDriver: true,
        }),
      ])
    );

    // Stagger animation starts
    const delay = Math.random() * 3000;
    const timer = setTimeout(() => {
      moveAnimation.start();
      twinkleAnimation.start();
    }, delay);

    return () => {
      clearTimeout(timer);
      moveAnimation.stop();
      twinkleAnimation.stop();
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
        transform: [{ translateY }],
        opacity: opacityAnim,
      }}
    />
  );
});

// PERFORMANCE: Simplified main starfield component  
export const MovingStarfield = React.memo(({ starCount = 60, speed = 'medium' }) => {
  const stars = useRef([]);

  // Generate stars with simple depth
  if (stars.current.length === 0) {
    for (let i = 0; i < starCount; i++) {
      const depth = 1 + Math.random() * 1.5; // Reduced depth variation
      const size = 0.5 + Math.random() * 2;
      const baseSpeed = speed === 'fast' ? 6000 : speed === 'slow' ? 15000 : 10000;
      const starSpeed = baseSpeed + Math.random() * 4000;
      const opacity = 0.3 + Math.random() * 0.5;
      const x = Math.random() * width;
      const y = -100 - Math.random() * height;
      
      // Simple color selection
      const colors = ['#FFFFFF', '#F0F8FF', '#E6E6FA'];
      const color = colors[Math.floor(Math.random() * colors.length)];

      stars.current.push({
        id: i,
        size,
        speed: starSpeed,
        opacity,
        x,
        y,
        color,
        depth,
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
          depth={star.depth}
        />
      ))}
    </View>
  );
});

// PERFORMANCE: Simplified continuous starfield
export const ContinuousStarfield = React.memo(({ 
  starCount = 40, // Reduced default count
  spawnRate = 4000, // Slower spawn rate
  speed = 'medium' 
}) => {
  const activeStars = useRef([]);
  const nextId = useRef(0);
  const cleanupTimerRef = useRef(null);

  useEffect(() => {
    const spawnStar = () => {
      const depth = 1 + Math.random() * 1.2;
      const size = 0.5 + Math.random() * 1.5;
      const baseSpeed = speed === 'fast' ? 6000 : speed === 'slow' ? 12000 : 9000;
      const starSpeed = baseSpeed + Math.random() * 3000;
      const opacity = 0.3 + Math.random() * 0.4;
      const x = Math.random() * width;
      const y = -20 - Math.random() * 30;
      
      const colors = ['#FFFFFF', '#F0F8FF', '#E6E6FA'];
      const color = colors[Math.floor(Math.random() * colors.length)];

      const newStar = {
        id: nextId.current++,
        size,
        speed: starSpeed,
        opacity,
        x,
        y,
        color,
        depth,
        createdAt: Date.now(),
      };

      activeStars.current.push(newStar);
    };

    // Reduced initial batch
    for (let i = 0; i < Math.min(starCount, 10); i++) {
      setTimeout(() => spawnStar(), i * (spawnRate / 5));
    }

    // Slower continuous spawning
    const interval = setInterval(spawnStar, spawnRate);

    // Less frequent cleanup
    const setupCleanup = () => {
      cleanupTimerRef.current = setTimeout(() => {
        if (activeStars.current.length > starCount * 1.3) {
          const now = Date.now();
          activeStars.current = activeStars.current.filter(
            star => now - star.createdAt < star.speed + 1000
          );
        }
        setupCleanup();
      }, 10000); // Cleanup every 10 seconds
    };
    
    setupCleanup();

    return () => {
      clearInterval(interval);
      if (cleanupTimerRef.current) {
        clearTimeout(cleanupTimerRef.current);
      }
    };
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
          depth={star.depth}
        />
      ))}
    </View>
  );
});

export default MovingStarfield; 