/**
 * ===========================
 * ULTRA-REALISTIC DEEP SPACE BACKGROUND
 * ===========================
 * 
 * Photorealistic cosmic environment with authentic space phenomena
 * Optimized for performance while maintaining visual fidelity
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
      
      {/* Ultra-deep space gradient */}
      <UltraDeepSpaceGradient />
      
      {/* Realistic star field layers */}
      <DistantStarField />
      <MidDistanceStars />
      
      {/* Distant star clusters */}
      <DistantStarClusters />
      
      {/* Main animated starfield */}
      <StarField starCount={55} />
      
      {/* Realistic asteroid field with textures */}
      <RealisticAsteroidField />
      
      {/* Enhanced comets with realistic tails */}
      <EnhancedCometField />
      
      {/* Space debris and micrometeoroids */}
      <SpaceDebrisField />
      
      {/* Distant planetary bodies */}
      <DistantCelestialBodies />
      
      {/* Cosmic dust and particles */}
      <CosmicDustEffect />
      
      {/* Subtle nebula wisps */}
      <SubtleNebulaWisps />
      
    </View>
  );
};

// Ultra-deep space gradient with multiple layers
const UltraDeepSpaceGradient = () => {
  return (
    <>
      <View style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: '#000511',
      }} />
      <View style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 8, 20, 0.8)',
      }} />
      <View style={{
        position: 'absolute',
        width: '100%',
        height: '40%',
        bottom: 0,
        backgroundColor: 'rgba(0, 5, 15, 0.3)',
      }} />
    </>
  );
};

// Multi-layered star field for depth
const DistantStarField = () => {
  const distantStars = React.useMemo(() => {
    return [...Array(120)].map((_, index) => ({
      id: index,
      x: Math.random() * width,
      y: Math.random() * height,
      size: 0.2 + Math.random() * 0.4,
      opacity: 0.1 + Math.random() * 0.15,
      color: ['#FFFFFF', '#F0F8FF', '#FFE4E1', '#FFFACD', '#E6E6FA'][Math.floor(Math.random() * 5)],
    }));
  }, []);

  return (
    <View style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    }}>
      {distantStars.map(star => (
        <View
          key={star.id}
          style={{
            position: 'absolute',
            left: star.x,
            top: star.y,
            width: star.size,
            height: star.size,
            borderRadius: star.size / 2,
            backgroundColor: star.color,
            opacity: star.opacity,
          }}
        />
      ))}
    </View>
  );
};

// Mid-distance stars with subtle twinkling
const MidDistanceStars = () => {
  const midStars = React.useMemo(() => {
    return [...Array(40)].map((_, index) => ({
      id: index,
      x: Math.random() * width,
      y: Math.random() * height,
      size: 0.6 + Math.random() * 0.8,
      baseOpacity: 0.2 + Math.random() * 0.3,
      color: ['#FFFFFF', '#F0F8FF', '#FFE4E1', '#FFFACD'][Math.floor(Math.random() * 4)],
      twinkleSpeed: 3000 + Math.random() * 4000,
    }));
  }, []);

  return (
    <View style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    }}>
      {midStars.map(star => (
        <TwinklingMidStar key={star.id} star={star} />
      ))}
    </View>
  );
};

// Individual twinkling mid-distance star
const TwinklingMidStar = ({ star }) => {
  const twinkleAnim = useRef(new Animated.Value(star.baseOpacity)).current;
  
  useEffect(() => {
    const twinkle = Animated.loop(
      Animated.sequence([
        Animated.timing(twinkleAnim, {
          toValue: star.baseOpacity * 0.3,
          duration: star.twinkleSpeed,
          useNativeDriver: true,
        }),
        Animated.timing(twinkleAnim, {
          toValue: star.baseOpacity,
          duration: star.twinkleSpeed,
          useNativeDriver: true,
        }),
      ])
    );
    
    setTimeout(() => twinkle.start(), Math.random() * 2000);
    
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

// Enhanced star clusters with more realistic distribution
const DistantStarClusters = () => {
  const clusters = React.useMemo(() => {
    return [...Array(6)].map((_, index) => {
      const baseX = Math.random() * width;
      const baseY = Math.random() * height;
      const clusterStars = [...Array(8 + Math.floor(Math.random() * 12))].map((_, starIndex) => {
        const distance = Math.random() * 60;
        const angle = Math.random() * Math.PI * 2;
        return {
          x: baseX + Math.cos(angle) * distance,
          y: baseY + Math.sin(angle) * distance,
          size: 0.3 + Math.random() * 0.6,
          opacity: 0.15 + Math.random() * 0.25,
          color: ['#FFFFFF', '#F0F8FF', '#FFE4E1', '#FFFACD'][Math.floor(Math.random() * 4)],
        };
      });
      
      return { id: index, stars: clusterStars };
    });
  }, []);

  return (
    <View style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    }}>
      {clusters.map(cluster => (
        <View key={cluster.id}>
          {cluster.stars.map((star, starIndex) => (
            <View
              key={`${cluster.id}-${starIndex}`}
              style={{
                position: 'absolute',
                left: Math.max(0, Math.min(width - star.size, star.x)),
                top: Math.max(0, Math.min(height - star.size, star.y)),
                width: star.size,
                height: star.size,
                borderRadius: star.size / 2,
                backgroundColor: star.color,
                opacity: star.opacity,
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
};

// Realistic asteroid field with varied shapes and textures
const RealisticAsteroidField = () => {
  const asteroids = React.useMemo(() => {
    return [...Array(18)].map((_, index) => {
      const size = 2 + Math.random() * 5;
      return {
        id: index,
        x: Math.random() * width,
        y: Math.random() * height,
        size: size,
        width: size,
        height: size * (0.7 + Math.random() * 0.6), // Irregular shapes
        opacity: 0.4 + Math.random() * 0.4,
        color: ['#8B7355', '#A0522D', '#696969', '#778899', '#5F5F5F', '#8B7D6B'][Math.floor(Math.random() * 6)],
        rotationSpeed: 25000 + Math.random() * 50000,
        borderRadius: Math.random() * 2,
      };
    });
  }, []);

  return (
    <View style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    }}>
      {asteroids.map(asteroid => (
        <RealisticRotatingAsteroid key={asteroid.id} asteroid={asteroid} />
      ))}
    </View>
  );
};

// Enhanced rotating asteroid with irregular shape
const RealisticRotatingAsteroid = ({ asteroid }) => {
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const driftAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    const rotation = Animated.loop(
      Animated.timing(rotationAnim, {
        toValue: 360,
        duration: asteroid.rotationSpeed,
        useNativeDriver: true,
      })
    );

    const drift = Animated.loop(
      Animated.sequence([
        Animated.timing(driftAnim, {
          toValue: 1,
          duration: 15000 + Math.random() * 20000,
          useNativeDriver: true,
        }),
        Animated.timing(driftAnim, {
          toValue: 0,
          duration: 15000 + Math.random() * 20000,
          useNativeDriver: true,
        }),
      ])
    );
    
    rotation.start();
    drift.start();
    
    return () => {
      rotation.stop();
      drift.stop();
    };
  }, []);

  const rotateValue = rotationAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  const driftX = driftAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.random() * 20 - 10],
  });

  const driftY = driftAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.random() * 15 - 7],
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: asteroid.x,
        top: asteroid.y,
        width: asteroid.width,
        height: asteroid.height,
        backgroundColor: asteroid.color,
        opacity: asteroid.opacity,
        transform: [
          { rotate: rotateValue },
          { translateX: driftX },
          { translateY: driftY },
        ],
        borderRadius: asteroid.borderRadius,
      }}
    />
  );
};

// Enhanced comets with realistic ice trails
const EnhancedCometField = () => {
  const comets = React.useMemo(() => {
    return [...Array(4)].map((_, index) => ({
      id: index,
      x: Math.random() * width,
      y: Math.random() * height,
      size: 1.8 + Math.random() * 2.5,
      tailLength: 20 + Math.random() * 40,
      tailWidth: 2 + Math.random() * 3,
      opacity: 0.5 + Math.random() * 0.3,
      angle: Math.random() * 360,
      color: ['#87CEEB', '#E0FFFF', '#B0E0E6', '#AFEEEE'][Math.floor(Math.random() * 4)],
      speed: 20000 + Math.random() * 30000,
    }));
  }, []);

  return (
    <View style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    }}>
      {comets.map(comet => (
        <RealisticMovingComet key={comet.id} comet={comet} />
      ))}
    </View>
  );
};

// Realistic moving comet with ice trail
const RealisticMovingComet = ({ comet }) => {
  const moveAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.5)).current;
  
  useEffect(() => {
    const movement = Animated.loop(
      Animated.sequence([
        Animated.timing(moveAnim, {
          toValue: 1,
          duration: comet.speed,
          useNativeDriver: true,
        }),
        Animated.timing(moveAnim, {
          toValue: 0,
          duration: comet.speed,
          useNativeDriver: true,
        }),
      ])
    );

    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.8,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.5,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    
    movement.start();
    glow.start();
    
    return () => {
      movement.stop();
      glow.stop();
    };
  }, []);

  const translateX = moveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.cos(comet.angle * Math.PI / 180) * 120],
  });

  const translateY = moveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.sin(comet.angle * Math.PI / 180) * 120],
  });

  return (
    <View>
      {/* Comet tail - multiple segments for realism */}
      {[...Array(3)].map((_, segmentIndex) => (
        <Animated.View
          key={segmentIndex}
          style={{
            position: 'absolute',
            left: comet.x - (segmentIndex * 8),
            top: comet.y,
            width: comet.tailLength - (segmentIndex * 6),
            height: comet.tailWidth - (segmentIndex * 0.5),
            backgroundColor: comet.color,
            opacity: (comet.opacity * 0.4) / (segmentIndex + 1),
            transform: [
              { translateX },
              { translateY },
              { rotate: `${comet.angle + 180}deg` },
            ],
            borderRadius: comet.tailWidth / 2,
          }}
        />
      ))}
      
      {/* Comet head with glow effect */}
      <Animated.View
        style={{
          position: 'absolute',
          left: comet.x,
          top: comet.y,
          width: comet.size,
          height: comet.size,
          borderRadius: comet.size / 2,
          backgroundColor: comet.color,
          opacity: glowAnim,
          transform: [{ translateX }, { translateY }],
        }}
      />
    </View>
  );
};

// Enhanced space debris field
const SpaceDebrisField = () => {
  const debris = React.useMemo(() => {
    return [...Array(12)].map((_, index) => ({
      id: index,
      x: Math.random() * width,
      y: Math.random() * height,
      size: 0.8 + Math.random() * 2,
      width: 0.8 + Math.random() * 2,
      height: 0.5 + Math.random() * 1.5,
      opacity: 0.25 + Math.random() * 0.35,
      color: ['#C0C0C0', '#D3D3D3', '#B8860B', '#708090', '#A9A9A9'][Math.floor(Math.random() * 5)],
      rotationSpeed: 8000 + Math.random() * 15000,
    }));
  }, []);

  return (
    <View style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    }}>
      {debris.map(piece => (
        <RotatingDebris key={piece.id} debris={piece} />
      ))}
    </View>
  );
};

// Rotating debris piece
const RotatingDebris = ({ debris }) => {
  const rotationAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    const rotation = Animated.loop(
      Animated.timing(rotationAnim, {
        toValue: 360,
        duration: debris.rotationSpeed,
        useNativeDriver: true,
      })
    );
    
    rotation.start();
    
    return () => rotation.stop();
  }, []);

  const rotateValue = rotationAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: debris.x,
        top: debris.y,
        width: debris.width,
        height: debris.height,
        backgroundColor: debris.color,
        opacity: debris.opacity,
        borderRadius: 1,
        transform: [{ rotate: rotateValue }],
      }}
    />
  );
};

// Distant celestial bodies
const DistantCelestialBodies = () => {
  const bodies = React.useMemo(() => {
    return [...Array(3)].map((_, index) => ({
      id: index,
      x: Math.random() * width,
      y: Math.random() * height,
      size: 6 + Math.random() * 16,
      opacity: 0.12 + Math.random() * 0.18,
      color: ['#4169E1', '#8B4513', '#CD853F', '#2F4F4F', '#483D8B'][Math.floor(Math.random() * 5)],
    }));
  }, []);

  return (
    <View style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    }}>
      {bodies.map(body => (
        <View
          key={body.id}
          style={{
            position: 'absolute',
            left: body.x,
            top: body.y,
            width: body.size,
            height: body.size,
            borderRadius: body.size / 2,
            backgroundColor: body.color,
            opacity: body.opacity,
          }}
        />
      ))}
    </View>
  );
};

// Cosmic dust effect
const CosmicDustEffect = () => {
  const dustParticles = React.useMemo(() => {
    return [...Array(25)].map((_, index) => ({
      id: index,
      x: Math.random() * width,
      y: Math.random() * height,
      size: 0.3 + Math.random() * 0.6,
      opacity: 0.08 + Math.random() * 0.12,
      color: '#FFFFFF',
      duration: 8000 + Math.random() * 12000,
    }));
  }, []);

  return (
    <View style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    }}>
      {dustParticles.map(particle => (
        <FloatingDustParticle key={particle.id} particle={particle} />
      ))}
    </View>
  );
};

// Individual floating dust particle
const FloatingDustParticle = ({ particle }) => {
  const floatAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    const float = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: particle.duration,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: particle.duration,
          useNativeDriver: true,
        }),
      ])
    );
    
    float.start();
    
    return () => float.stop();
  }, []);

  const translateX = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.random() * 30 - 15],
  });

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.random() * 40 - 20],
  });

  const opacity = floatAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [particle.opacity, particle.opacity * 0.3, particle.opacity],
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: particle.x,
        top: particle.y,
        width: particle.size,
        height: particle.size,
        borderRadius: particle.size / 2,
        backgroundColor: particle.color,
        opacity,
        transform: [{ translateX }, { translateY }],
      }}
    />
  );
};

// Subtle nebula wisps
const SubtleNebulaWisps = () => {
  const wisps = React.useMemo(() => [
    { 
      x: width * 0.1, 
      y: height * 0.3, 
      width: 100, 
      height: 40, 
      color: 'rgba(138, 43, 226, 0.015)',
      borderRadius: 20
    },
    { 
      x: width * 0.7, 
      y: height * 0.7, 
      width: 130, 
      height: 50, 
      color: 'rgba(30, 144, 255, 0.01)',
      borderRadius: 25
    },
  ], []);

  return (
    <View style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    }}>
      {wisps.map((wisp, index) => (
        <View
          key={index}
          style={{
            position: 'absolute',
            left: wisp.x,
            top: wisp.y,
            width: wisp.width,
            height: wisp.height,
            backgroundColor: wisp.color,
            borderRadius: wisp.borderRadius,
          }}
        />
      ))}
    </View>
  );
};

// Main animated starfield component
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

// Individual animated star
const AnimatedStar = ({ index }) => {
  const twinkleAnim = useRef(new Animated.Value(0.4)).current;
  
  useEffect(() => {
    const twinkleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(twinkleAnim, {
          toValue: 1,
          duration: 2500 + Math.random() * 3500,
          useNativeDriver: true,
        }),
        Animated.timing(twinkleAnim, {
          toValue: 0.3,
          duration: 2000 + Math.random() * 2500,
          useNativeDriver: true,
        }),
      ])
    );
    
    setTimeout(() => {
      twinkleAnimation.start();
    }, index * 180);
    
    return () => {
      twinkleAnimation.stop();
    };
  }, [index, twinkleAnim]);

  const starSize = 0.8 + Math.random() * 2.2;
  const initialX = Math.random() * width;
  const initialY = Math.random() * height;
  
  const starColors = ['#FFFFFF', '#F0F8FF', '#FFE4E1', '#FFFACD', '#E6E6FA', '#FFF8DC'];
  const starColor = starColors[Math.floor(Math.random() * starColors.length)];

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
        opacity: twinkleAnim,
      }}
    />
  );
};

export default SpaceBackground; 