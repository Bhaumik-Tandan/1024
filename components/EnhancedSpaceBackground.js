import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions } from 'react-native';
import { THEME } from './constants';
import { ContinuousStarfield } from './MovingStarfield';

const { width, height } = Dimensions.get('window');

// Floating cosmic dust particles
const CosmicDust = ({ particleCount = 30 }) => {
  const particles = useRef([]);
  const animatedValues = useRef([]);

  if (particles.current.length === 0) {
    for (let i = 0; i < particleCount; i++) {
      const particle = {
        id: i,
        x: Math.random() * width,
        y: Math.random() * height,
        size: 0.5 + Math.random() * 1.5,
        opacity: 0.1 + Math.random() * 0.3,
        duration: 8000 + Math.random() * 12000,
      };
      
      particles.current.push(particle);
      animatedValues.current.push({
        translateX: new Animated.Value(0),
        translateY: new Animated.Value(0),
        opacity: new Animated.Value(particle.opacity),
      });
    }
  }

  useEffect(() => {
    const animations = particles.current.map((particle, index) => {
      const { translateX, translateY, opacity } = animatedValues.current[index];
      
      return Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(translateX, {
              toValue: Math.random() * 30 - 15,
              duration: particle.duration / 2,
              useNativeDriver: true,
            }),
            Animated.timing(translateX, {
              toValue: 0,
              duration: particle.duration / 2,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(translateY, {
              toValue: Math.random() * 40 - 20,
              duration: particle.duration / 3,
              useNativeDriver: true,
            }),
            Animated.timing(translateY, {
              toValue: 0,
              duration: particle.duration / 3,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(opacity, {
              toValue: particle.opacity * 0.3,
              duration: particle.duration / 4,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: particle.opacity,
              duration: particle.duration / 4,
              useNativeDriver: true,
            }),
          ]),
        ])
      );
    });

    animations.forEach((animation, index) => {
      setTimeout(() => animation.start(), index * 500);
    });

    return () => {
      animations.forEach(animation => animation.stop());
    };
  }, []);

  return (
    <View style={{ position: 'absolute', width, height }} pointerEvents="none">
      {particles.current.map((particle, index) => {
        const { translateX, translateY, opacity } = animatedValues.current[index];
        
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
              transform: [{ translateX }, { translateY }],
              opacity,
            }}
          />
        );
      })}
    </View>
  );
};

// Distant galaxies (very subtle)
const DistantGalaxies = () => {
  const galaxies = [
    { x: width * 0.1, y: height * 0.2, size: 40, color: 'rgba(138, 43, 226, 0.08)' },
    { x: width * 0.8, y: height * 0.7, size: 60, color: 'rgba(30, 144, 255, 0.06)' },
    { x: width * 0.3, y: height * 0.8, size: 35, color: 'rgba(255, 20, 147, 0.05)' },
  ];

  return (
    <View style={{ position: 'absolute', width, height }} pointerEvents="none">
      {galaxies.map((galaxy, index) => (
        <View
          key={index}
          style={{
            position: 'absolute',
            left: galaxy.x - galaxy.size / 2,
            top: galaxy.y - galaxy.size / 2,
            width: galaxy.size,
            height: galaxy.size,
            backgroundColor: galaxy.color,
            borderRadius: galaxy.size / 2,
            transform: [{ rotate: `${index * 45}deg` }],
          }}
        />
      ))}
    </View>
  );
};

// Pulsing energy field
const EnergyField = () => {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 8000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 8000,
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();

    return () => pulse.stop();
  }, []);

  const opacity = pulseAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.02, 0.08, 0.02],
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: width * 1.5,
        height: height * 1.5,
        left: -width * 0.25,
        top: -height * 0.25,
        backgroundColor: '#4A90E2',
        borderRadius: width * 0.75,
        opacity,
      }}
      pointerEvents="none"
    />
  );
};

// Main enhanced space background
export const EnhancedSpaceBackground = ({ 
  showMovingStars = true, 
  intensity = 'high' // 'low', 'medium', 'high'
}) => {
  const particleCount = intensity === 'high' ? 40 : intensity === 'medium' ? 25 : 15;
  const starCount = intensity === 'high' ? 100 : intensity === 'medium' ? 70 : 50;

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: THEME.DARK.BACKGROUND_PRIMARY,
      }}
      pointerEvents="none"
    >
      {/* Base gradient background */}
      <View
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backgroundColor: 'linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 30%, #16213e 70%, #0e1726 100%)',
        }}
      />

      {/* Energy field */}
      <EnergyField />

      {/* Distant galaxies */}
      <DistantGalaxies />

      {/* Moving starfield for space travel */}
      {showMovingStars && (
        <ContinuousStarfield 
          starCount={starCount} 
          speed="medium" 
          spawnRate={1800} 
        />
      )}

      {/* Floating cosmic dust */}
      <CosmicDust particleCount={particleCount} />
    </View>
  );
};

export default EnhancedSpaceBackground; 