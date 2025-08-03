import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions } from 'react-native';
import { THEME } from './constants';
import { ContinuousStarfield } from './MovingStarfield';

const { width, height } = Dimensions.get('window');

// Ultra-realistic cosmic dust particles
const UltraCosmicDust = ({ particleCount = 35 }) => {
  const particles = useRef([]);
  const animatedValues = useRef([]);

  if (particles.current.length === 0) {
    for (let i = 0; i < particleCount; i++) {
      const particle = {
        id: i,
        x: Math.random() * width,
        y: Math.random() * height,
        size: 0.25 + Math.random() * 0.8,
        opacity: 0.04 + Math.random() * 0.12,
        duration: 15000 + Math.random() * 10000,
        color: ['#FFFFFF', '#F5F5DC', '#E6E6FA'][Math.floor(Math.random() * 3)],
      };
      
      particles.current.push(particle);
      animatedValues.current.push({
        translateX: new Animated.Value(0),
        translateY: new Animated.Value(0),
        opacity: new Animated.Value(particle.opacity),
        scale: new Animated.Value(1),
      });
    }
  }

  useEffect(() => {
    const animations = particles.current.map((particle, index) => {
      const { translateX, translateY, opacity, scale } = animatedValues.current[index];
      
      return Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(translateX, {
              toValue: Math.random() * 25 - 12,
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
              toValue: Math.random() * 30 - 15,
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
              toValue: particle.opacity * 0.1,
              duration: particle.duration / 4,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: particle.opacity,
              duration: particle.duration / 4,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(scale, {
              toValue: 1.3,
              duration: particle.duration / 2,
              useNativeDriver: true,
            }),
            Animated.timing(scale, {
              toValue: 1,
              duration: particle.duration / 2,
              useNativeDriver: true,
            }),
          ]),
        ])
      );
    });

    animations.forEach((animation, index) => {
      setTimeout(() => animation.start(), index * 1000);
    });

    return () => {
      animations.forEach(animation => animation.stop());
    };
  }, []);

  return (
    <View style={{ position: 'absolute', width, height }} pointerEvents="none">
      {particles.current.map((particle, index) => {
        const { translateX, translateY, opacity, scale } = animatedValues.current[index];
        
        return (
          <Animated.View
            key={particle.id}
            style={{
              position: 'absolute',
              left: particle.x,
              top: particle.y,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              borderRadius: particle.size / 2,
              transform: [{ translateX }, { translateY }, { scale }],
              opacity,
            }}
          />
        );
      })}
    </View>
  );
};

// Realistic asteroid belt with orbital mechanics
const RealisticAsteroidBelt = () => {
  const asteroids = React.useMemo(() => {
    return [...Array(20)].map((_, index) => {
      const angle = (index / 20) * 360 + Math.random() * 18; // Slight randomization
      const radius = 110 + Math.random() * 120; // Varied orbital distances
      const centerX = width / 2;
      const centerY = height / 2;
      
      return {
        id: index,
        angle: angle,
        radius: radius,
        centerX: centerX,
        centerY: centerY,
        size: 1.2 + Math.random() * 4,
        width: 1.2 + Math.random() * 4,
        height: (1.2 + Math.random() * 4) * (0.6 + Math.random() * 0.8),
        opacity: 0.25 + Math.random() * 0.35,
        color: ['#8B7355', '#A0522D', '#696969', '#5F5F5F', '#8B7D6B', '#654321'][Math.floor(Math.random() * 6)],
        rotationSpeed: 18000 + Math.random() * 40000,
        orbitalSpeed: 60000 + Math.random() * 80000,
        borderRadius: Math.random() * 2,
      };
    });
  }, []);

  return (
    <View style={{ position: 'absolute', width, height }} pointerEvents="none">
      {asteroids.map((asteroid) => (
        <OrbitingRealisticAsteroid key={asteroid.id} asteroid={asteroid} />
      ))}
    </View>
  );
};

// Orbiting realistic asteroid
const OrbitingRealisticAsteroid = ({ asteroid }) => {
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const orbitalAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    const rotation = Animated.loop(
      Animated.timing(rotationAnim, {
        toValue: 360,
        duration: asteroid.rotationSpeed,
        useNativeDriver: true,
      })
    );

    const orbital = Animated.loop(
      Animated.timing(orbitalAnim, {
        toValue: 360,
        duration: asteroid.orbitalSpeed,
        useNativeDriver: true,
      })
    );
    
    rotation.start();
    orbital.start();
    
    return () => {
      rotation.stop();
      orbital.stop();
    };
  }, []);

  const rotateValue = rotationAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  const orbitalAngle = orbitalAnim.interpolate({
    inputRange: [0, 360],
    outputRange: [asteroid.angle, asteroid.angle + 360],
  });

  const x = orbitalAngle.interpolate({
    inputRange: [0, 360],
    outputRange: [0, 360],
    extrapolate: 'extend',
  });

  const translateX = x.interpolate({
    inputRange: [0, 90, 180, 270, 360],
    outputRange: [
      asteroid.centerX + asteroid.radius,
      asteroid.centerX,
      asteroid.centerX - asteroid.radius,
      asteroid.centerX,
      asteroid.centerX + asteroid.radius,
    ],
  });

  const translateY = x.interpolate({
    inputRange: [0, 90, 180, 270, 360],
    outputRange: [
      asteroid.centerY,
      asteroid.centerY - asteroid.radius * 0.6, // Elliptical orbit
      asteroid.centerY,
      asteroid.centerY + asteroid.radius * 0.6,
      asteroid.centerY,
    ],
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: asteroid.width,
        height: asteroid.height,
        backgroundColor: asteroid.color,
        opacity: asteroid.opacity,
        transform: [
          { translateX },
          { translateY },
          { rotate: rotateValue },
        ],
        borderRadius: asteroid.borderRadius,
      }}
    />
  );
};

// Enhanced meteor shower with realistic physics
const EnhancedMeteorShower = () => {
  const meteors = React.useMemo(() => {
    return [...Array(8)].map((_, index) => ({
      id: index,
      startX: -30 + Math.random() * 60,
      startY: Math.random() * height * 0.6,
      endX: width + 30,
      endY: Math.random() * height * 0.4 + height * 0.6,
      length: 30 + Math.random() * 50,
      width: 1.5 + Math.random() * 2,
      opacity: 0.4 + Math.random() * 0.5,
      color: ['#87CEEB', '#E0FFFF', '#B0E0E6', '#FFFACD', '#F0F8FF'][Math.floor(Math.random() * 5)],
      duration: 2500 + Math.random() * 3500,
      delay: Math.random() * 8000,
    }));
  }, []);

  return (
    <View style={{ position: 'absolute', width, height }} pointerEvents="none">
      {meteors.map((meteor) => (
        <RealisticMeteor key={meteor.id} meteor={meteor} />
      ))}
    </View>
  );
};

// Individual realistic meteor with trail
const RealisticMeteor = ({ meteor }) => {
  const moveAnim = useRef(new Animated.Value(0)).current;
  const intensityAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    const meteorSequence = () => {
      Animated.sequence([
        Animated.delay(meteor.delay),
        Animated.parallel([
          Animated.timing(moveAnim, {
            toValue: 1,
            duration: meteor.duration,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(intensityAnim, {
              toValue: 1,
              duration: meteor.duration * 0.3,
              useNativeDriver: true,
            }),
            Animated.timing(intensityAnim, {
              toValue: 0,
              duration: meteor.duration * 0.7,
              useNativeDriver: true,
            }),
          ]),
        ]),
        Animated.delay(5000 + Math.random() * 15000),
      ]).start(() => {
        moveAnim.setValue(0);
        intensityAnim.setValue(0);
        meteorSequence();
      });
    };

    meteorSequence();
    
    return () => {
      moveAnim.stopAnimation();
      intensityAnim.stopAnimation();
    };
  }, []);

  const translateX = moveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [meteor.startX, meteor.endX],
  });

  const translateY = moveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [meteor.startY, meteor.endY],
  });

  const opacity = intensityAnim.interpolate({
    inputRange: [0, 0.3, 0.7, 1],
    outputRange: [0, meteor.opacity, meteor.opacity * 0.8, 0],
  });

  const scale = intensityAnim.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0.5, 1, 0.3],
  });

  const angle = Math.atan2(meteor.endY - meteor.startY, meteor.endX - meteor.startX) * 180 / Math.PI;

  return (
    <View>
      {/* Meteor trail - multiple segments */}
      {[...Array(4)].map((_, segmentIndex) => (
        <Animated.View
          key={`trail-${segmentIndex}`}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: meteor.length - (segmentIndex * 8),
            height: meteor.width - (segmentIndex * 0.3),
            backgroundColor: meteor.color,
            opacity: opacity.interpolate({
              inputRange: [0, 1],
              outputRange: [0, meteor.opacity * (0.6 / (segmentIndex + 1))],
            }),
            transform: [
              { translateX: translateX.interpolate({
                inputRange: [0, 1],
                outputRange: [meteor.startX - (segmentIndex * 15), meteor.endX - (segmentIndex * 15)],
              })},
              { translateY: translateY.interpolate({
                inputRange: [0, 1],
                outputRange: [meteor.startY - (segmentIndex * 8), meteor.endY - (segmentIndex * 8)],
              })},
              { rotate: `${angle}deg` },
              { scale },
            ],
            borderRadius: meteor.width / 2,
          }}
        />
      ))}
      
      {/* Meteor head */}
      <Animated.View
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: meteor.width * 2,
          height: meteor.width * 2,
          borderRadius: meteor.width,
          backgroundColor: meteor.color,
          opacity,
          transform: [
            { translateX },
            { translateY },
            { scale },
          ],
        }}
      />
    </View>
  );
};

// Deep space gradient with multiple layers
const DeepSpaceGradient = () => {
  return (
    <>
      <View style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: '#000814',
      }} />
      <View style={{
        position: 'absolute',
        width: '100%',
        height: '60%',
        top: 0,
        backgroundColor: 'rgba(0, 5, 15, 0.4)',
      }} />
      <View style={{
        position: 'absolute',
        width: '100%',
        height: '40%',
        bottom: 0,
        backgroundColor: 'rgba(0, 8, 20, 0.6)',
      }} />
    </>
  );
};

// Enhanced distant star field
const EnhancedDistantStarField = () => {
  const stars = React.useMemo(() => {
    return [...Array(80)].map((_, index) => ({
      id: index,
      x: Math.random() * width,
      y: Math.random() * height,
      size: 0.15 + Math.random() * 0.5,
      opacity: 0.08 + Math.random() * 0.15,
      color: ['#FFFFFF', '#F0F8FF', '#FFE4E1', '#FFFACD', '#E6E6FA'][Math.floor(Math.random() * 5)],
      twinkleSpeed: 4000 + Math.random() * 6000,
    }));
  }, []);

  return (
    <View style={{ position: 'absolute', width, height }} pointerEvents="none">
      {stars.map((star) => (
        <EnhancedTwinklingStar key={star.id} star={star} />
      ))}
    </View>
  );
};

// Enhanced twinkling star
const EnhancedTwinklingStar = ({ star }) => {
  const twinkleAnim = useRef(new Animated.Value(star.opacity)).current;
  
  useEffect(() => {
    const twinkle = Animated.loop(
      Animated.sequence([
        Animated.timing(twinkleAnim, {
          toValue: star.opacity * 0.2,
          duration: star.twinkleSpeed,
          useNativeDriver: true,
        }),
        Animated.timing(twinkleAnim, {
          toValue: star.opacity,
          duration: star.twinkleSpeed,
          useNativeDriver: true,
        }),
      ])
    );
    
    setTimeout(() => twinkle.start(), Math.random() * 3000);
    
    return () => twinkle.stop();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: star.x,
        top: star.y,
        width: star.size,
        height: star.size,
        borderRadius: star.size / 2,
        backgroundColor: star.color,
        opacity: twinkleAnim,
      }}
    />
  );
};

// Organic space gas clouds
const OrganicSpaceGasClouds = () => {
  const clouds = React.useMemo(() => [
    { 
      x: width * 0.12, 
      y: height * 0.28, 
      width: 140, 
      height: 70, 
      color: 'rgba(138, 43, 226, 0.008)',
      borderRadius: 35
    },
    { 
      x: width * 0.68, 
      y: height * 0.62, 
      width: 180, 
      height: 90, 
      color: 'rgba(30, 144, 255, 0.006)',
      borderRadius: 45
    },
    { 
      x: width * 0.22, 
      y: height * 0.78, 
      width: 110, 
      height: 55, 
      color: 'rgba(255, 20, 147, 0.005)',
      borderRadius: 28
    },
  ], []);

  return (
    <View style={{ position: 'absolute', width, height }} pointerEvents="none">
      {clouds.map((cloud, index) => (
        <View
          key={index}
          style={{
            position: 'absolute',
            left: cloud.x,
            top: cloud.y,
            width: cloud.width,
            height: cloud.height,
            backgroundColor: cloud.color,
            borderRadius: cloud.borderRadius,
          }}
        />
      ))}
    </View>
  );
};

// Main enhanced space background
export const EnhancedSpaceBackground = ({ 
  showMovingStars = true, 
  intensity = 'high' // 'low', 'medium', 'high'
}) => {
  const particleCount = intensity === 'high' ? 45 : intensity === 'medium' ? 30 : 20;
  const starCount = intensity === 'high' ? 120 : intensity === 'medium' ? 80 : 60;

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
      {/* Deep space gradient layers */}
      <DeepSpaceGradient />

      {/* Enhanced distant star field */}
      <EnhancedDistantStarField />

      {/* Realistic asteroid belt with orbital mechanics */}
      <RealisticAsteroidBelt />

      {/* Organic space gas clouds */}
      <OrganicSpaceGasClouds />

      {/* Enhanced meteor shower with realistic physics */}
      <EnhancedMeteorShower />

      {/* Moving starfield for space travel */}
      {showMovingStars && (
        <ContinuousStarfield 
          starCount={starCount} 
          speed="medium" 
          spawnRate={1600} 
        />
      )}

      {/* Ultra-realistic floating cosmic dust */}
      <UltraCosmicDust particleCount={particleCount} />
    </View>
  );
};

export default EnhancedSpaceBackground; 