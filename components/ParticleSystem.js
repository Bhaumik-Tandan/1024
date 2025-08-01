import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Individual particle component
const Particle = ({ x, y, size, color, duration, direction, distance }) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const endX = Math.cos(direction) * distance;
    const endY = Math.sin(direction) * distance;

    Animated.parallel([
      Animated.timing(translateX, {
        toValue: endX,
        duration: duration,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: endY,
        duration: duration,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: duration,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.2,
        duration: duration,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        backgroundColor: color,
        borderRadius: size / 2,
        transform: [
          { translateX },
          { translateY },
          { scale },
        ],
        opacity,
      }}
    />
  );
};

// Cosmic particle burst effect
export const CosmicParticleBurst = ({ x, y, particleCount = 12, onComplete }) => {
  const particles = [];
  
  for (let i = 0; i < particleCount; i++) {
    const angle = (i / particleCount) * Math.PI * 2;
    const distance = 80 + Math.random() * 40;
    const size = 3 + Math.random() * 4;
    const duration = 800 + Math.random() * 400;
    const colors = ['#FFD700', '#FF6B35', '#00BFFF', '#9B59B6', '#1ABC9C'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    particles.push(
      <Particle
        key={i}
        x={x}
        y={y}
        size={size}
        color={color}
        duration={duration}
        direction={angle}
        distance={distance}
      />
    );
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 1200);
    
    return () => clearTimeout(timer);
  }, []);

  return <View pointerEvents="none">{particles}</View>;
};

// Floating stardust background effect
export const StardustBackground = ({ density = 20 }) => {
  const particles = useRef([]);
  const animatedValues = useRef([]);

  // Generate stardust particles
  if (particles.current.length === 0) {
    for (let i = 0; i < density; i++) {
      const particle = {
        id: i,
        x: Math.random() * width,
        y: Math.random() * height,
        size: 1 + Math.random() * 2,
        initialOpacity: 0.3 + Math.random() * 0.4,
        floatRange: 30 + Math.random() * 20,
        duration: 4000 + Math.random() * 6000,
      };
      
      particles.current.push(particle);
      animatedValues.current.push({
        translateY: new Animated.Value(0),
        opacity: new Animated.Value(particle.initialOpacity),
      });
    }
  }

  useEffect(() => {
    const animations = particles.current.map((particle, index) => {
      const { translateY, opacity } = animatedValues.current[index];
      
      return Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(translateY, {
              toValue: -particle.floatRange,
              duration: particle.duration / 2,
              useNativeDriver: true,
            }),
            Animated.sequence([
              Animated.timing(opacity, {
                toValue: particle.initialOpacity * 0.5,
                duration: particle.duration / 4,
                useNativeDriver: true,
              }),
              Animated.timing(opacity, {
                toValue: particle.initialOpacity,
                duration: particle.duration / 4,
                useNativeDriver: true,
              }),
            ]),
          ]),
          Animated.parallel([
            Animated.timing(translateY, {
              toValue: 0,
              duration: particle.duration / 2,
              useNativeDriver: true,
            }),
            Animated.sequence([
              Animated.timing(opacity, {
                toValue: particle.initialOpacity * 0.3,
                duration: particle.duration / 4,
                useNativeDriver: true,
              }),
              Animated.timing(opacity, {
                toValue: particle.initialOpacity,
                duration: particle.duration / 4,
                useNativeDriver: true,
              }),
            ]),
          ]),
        ])
      );
    });

    animations.forEach(animation => animation.start());

    return () => {
      animations.forEach(animation => animation.stop());
    };
  }, []);

  return (
    <View style={{ position: 'absolute', width, height }} pointerEvents="none">
      {particles.current.map((particle, index) => {
        const { translateY, opacity } = animatedValues.current[index];
        
        return (
          <Animated.View
            key={particle.id}
            style={{
              position: 'absolute',
              left: particle.x,
              top: particle.y,
              width: particle.size,
              height: particle.size,
              backgroundColor: '#FFFFFF',
              borderRadius: particle.size / 2,
              transform: [{ translateY }],
              opacity,
            }}
          />
        );
      })}
    </View>
  );
};

// Energy wave effect for dramatic collisions
export const EnergyWave = ({ x, y, onComplete }) => {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 3,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onComplete) onComplete();
    });
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: x - 50,
        top: y - 50,
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: '#00FFFF',
        transform: [{ scale }],
        opacity,
      }}
    />
  );
};

export default {
  CosmicParticleBurst,
  StardustBackground,
  EnergyWave,
}; 