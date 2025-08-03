import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions } from 'react-native';
import { THEME } from './constants';
import { ContinuousStarfield } from './MovingStarfield';

const { width, height } = Dimensions.get('window');

// Photorealistic deep space gradient with authentic colors
const PhotorealisticSpaceGradient = () => {
  return (
    <>
      {/* Deep space base - true black with subtle blue tint */}
      <View style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: '#000306',
      }} />
      
      {/* Distant galaxy glow - very subtle purple/blue */}
      <View style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(4, 6, 20, 0.9)',
      }} />
      
      {/* Milky Way band simulation - diagonal across screen */}
      <View style={{
        position: 'absolute',
        width: width * 1.5,
        height: height * 0.3,
        top: height * 0.2,
        left: -width * 0.25,
        backgroundColor: 'rgba(15, 20, 40, 0.15)',
        transform: [{ rotate: '25deg' }],
      }} />
      
      {/* Interstellar medium - very faint dust */}
      <View style={{
        position: 'absolute',
        width: '100%',
        height: '60%',
        top: 0,
        backgroundColor: 'rgba(8, 12, 25, 0.1)',
      }} />
      
      {/* Bottom stellar nursery glow */}
      <View style={{
        position: 'absolute',
        width: '100%',
        height: '30%',
        bottom: 0,
        backgroundColor: 'rgba(12, 8, 30, 0.08)',
      }} />
    </>
  );
};

// SOLAR SYSTEM TRAVEL: Optimized moving celestial bodies - PERFORMANCE FOCUSED
const MovingCelestialBodies = React.memo(({ intensity = 'medium' }) => {
  const bodies = React.useMemo(() => {
    // PERFORMANCE: Drastically reduced counts
    const bodyCount = intensity === 'high' ? 2 : intensity === 'medium' ? 1 : 0;
    if (bodyCount === 0) return [];
    
    return [...Array(bodyCount)].map((_, index) => ({
      id: index,
      type: ['planet', 'moon'][index % 2], // Removed asteroid type
      initialX: width + 100 + Math.random() * 300, // Start further off-screen
      y: Math.random() * height,
      size: 12 + Math.random() * 18, // Smaller size range
      speed: 20000 + Math.random() * 15000, // Slower movement
      opacity: 0.08 + Math.random() * 0.12, // Lower opacity
      color: [
        'rgba(255, 140, 0, 0.2)',   // Mars-like orange - reduced opacity
        'rgba(100, 149, 237, 0.2)', // Neptune-like blue - reduced opacity
      ][index % 2],
      parallaxSpeed: 0.8 + Math.random() * 0.4, // Less variation
    }));
  }, [intensity]);

  return (
    <View style={{ position: 'absolute', width, height }} pointerEvents="none">
      {bodies.map((body) => (
        <OptimizedCelestialBody key={body.id} body={body} />
      ))}
    </View>
  );
});

// PERFORMANCE: Simplified celestial body with minimal animations
const OptimizedCelestialBody = React.memo(({ body }) => {
  const translateX = useRef(new Animated.Value(body.initialX)).current;
  
  useEffect(() => {
    const moveSequence = () => {
      // Reset position off-screen
      translateX.setValue(body.initialX);
      
      // Simple movement across screen - no complex effects
      Animated.timing(translateX, {
        toValue: -body.size - 150,
        duration: body.speed * body.parallaxSpeed,
        useNativeDriver: true, // PERFORMANCE: Native driver
      }).start(() => {
        // Longer delay between appearances
        setTimeout(moveSequence, Math.random() * 20000 + 15000);
      });
    };

    // Stagger start times with longer delays
    const delay = Math.random() * 15000;
    const timer = setTimeout(() => {
      moveSequence();
    }, delay);

    return () => {
      clearTimeout(timer);
      translateX.stopAnimation();
    };
  }, []);

  return (
    <View>
      {/* Simplified planet - no glow effects */}
      <Animated.View
        style={{
          position: 'absolute',
          left: 0,
          top: body.y,
          width: body.size,
          height: body.size,
          borderRadius: body.size / 2,
          backgroundColor: body.color,
          opacity: body.opacity,
          transform: [{ translateX }],
        }}
      />
    </View>
  );
});

// SOLAR SYSTEM TRAVEL: Simplified solar wind effect - PERFORMANCE FOCUSED
const SolarWindEffect = React.memo(({ intensity = 'medium' }) => {
  // PERFORMANCE: Dramatically reduced particle counts
  const particleCount = intensity === 'high' ? 6 : intensity === 'medium' ? 4 : 2;
  const particles = useRef([]);
  const animatedValues = useRef([]);

  if (particles.current.length === 0) {
    for (let i = 0; i < particleCount; i++) {
      const particle = {
        id: i,
        x: width + Math.random() * 200,
        y: Math.random() * height,
        size: 1 + Math.random() * 1.5, // Smaller particles
        opacity: 0.06 + Math.random() * 0.1, // Much lower opacity
        speed: 12000 + Math.random() * 8000, // Slower movement
        color: ['rgba(255, 255, 255, 0.4)', 'rgba(173, 216, 230, 0.3)'][i % 2], // Simplified colors
      };
      
      particles.current.push(particle);
      animatedValues.current.push({
        translateX: new Animated.Value(particle.x),
        opacity: new Animated.Value(0),
      });
    }
  }

  useEffect(() => {
    const animations = particles.current.map((particle, index) => {
      const { translateX, opacity } = animatedValues.current[index];
      
      const windSequence = () => {
        // Reset position
        translateX.setValue(particle.x);
        opacity.setValue(0);
        
        // Simple animation across screen
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: -particle.size - 100,
            duration: particle.speed,
            useNativeDriver: true, // PERFORMANCE: Native driver
          }),
          Animated.sequence([
            Animated.timing(opacity, {
              toValue: particle.opacity,
              duration: particle.speed * 0.2,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: particle.speed * 0.8,
              useNativeDriver: true,
            }),
          ]),
        ]).start(() => {
          // Longer delays between particles
          setTimeout(windSequence, Math.random() * 8000 + 5000);
        });
      };

      // Stagger start times with longer delays
      setTimeout(windSequence, index * 3000);
      
      return windSequence;
    });

    return () => {
      animations.forEach(anim => {
        // Cleanup handled by useEffect cleanup
      });
    };
  }, []);

  return (
    <View style={{ position: 'absolute', width, height }} pointerEvents="none">
      {particles.current.map((particle, index) => {
        const { translateX, opacity } = animatedValues.current[index];
        
        return (
          <Animated.View
            key={particle.id}
            style={{
              position: 'absolute',
              left: 0,
              top: particle.y,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              borderRadius: particle.size / 2,
              transform: [{ translateX }],
              opacity,
            }}
          />
        );
      })}
    </View>
  );
});

// PERFORMANCE OPTIMIZED: Reduced star count and simplified animations
const OptimizedStarDistribution = ({ intensity = 'medium' }) => {
  const stars = React.useMemo(() => {
    const starArray = [];
    
    // Drastically reduced star counts for performance
    const counts = {
      low: { main: 15, giants: 2, supergiants: 1, binary: 1 },
      medium: { main: 25, giants: 3, supergiants: 1, binary: 2 },
      high: { main: 40, giants: 4, supergiants: 2, binary: 2 }
    };
    
    const config = counts[intensity] || counts.medium;
    
    // Main sequence stars (most common) - small, white/yellow
    for (let i = 0; i < config.main; i++) {
      starArray.push({
        id: `main-${i}`,
        x: Math.random() * width,
        y: Math.random() * height,
        size: 0.3 + Math.random() * 0.5,
        opacity: 0.2 + Math.random() * 0.3,
        color: ['#FFFFFF', '#FFF8DC', '#FFFACD'][Math.floor(Math.random() * 3)],
        twinkleSpeed: 6000 + Math.random() * 8000, // Slower twinkling
        magnitude: Math.random(),
      });
    }
    
    // Red giants - larger, reddish
    for (let i = 0; i < config.giants; i++) {
      starArray.push({
        id: `red-giant-${i}`,
        x: Math.random() * width,
        y: Math.random() * height,
        size: 0.8 + Math.random() * 1.0,
        opacity: 0.3 + Math.random() * 0.3,
        color: ['#FFB6C1', '#FFA07A'][Math.floor(Math.random() * 2)],
        twinkleSpeed: 8000 + Math.random() * 6000,
        magnitude: 0.7 + Math.random() * 0.3,
      });
    }
    
    // Blue supergiants - rare but bright
    for (let i = 0; i < config.supergiants; i++) {
      starArray.push({
        id: `blue-supergiant-${i}`,
        x: Math.random() * width,
        y: Math.random() * height,
        size: 1.0 + Math.random() * 0.6,
        opacity: 0.5 + Math.random() * 0.3,
        color: ['#B0E0E6', '#87CEEB'][Math.floor(Math.random() * 2)],
        twinkleSpeed: 4000 + Math.random() * 4000,
        magnitude: 0.9,
      });
    }
    
    // Binary star systems - simplified
    for (let i = 0; i < config.binary; i++) {
      const baseX = Math.random() * width;
      const baseY = Math.random() * height;
      const separation = 3 + Math.random() * 3;
      
      starArray.push({
        id: `binary-a-${i}`,
        x: baseX,
        y: baseY,
        size: 0.5 + Math.random() * 0.3,
        opacity: 0.4 + Math.random() * 0.2,
        color: '#FFFFFF',
        twinkleSpeed: 3000 + Math.random() * 3000,
        magnitude: 0.8,
      });
      
      starArray.push({
        id: `binary-b-${i}`,
        x: baseX + separation,
        y: baseY + separation * 0.5,
        size: 0.4 + Math.random() * 0.2,
        opacity: 0.3 + Math.random() * 0.2,
        color: '#FFF8DC',
        twinkleSpeed: 3000 + Math.random() * 3000,
        magnitude: 0.6,
      });
    }
    
    return starArray;
  }, [intensity]);

  return (
    <View style={{ position: 'absolute', width, height }} pointerEvents="none">
      {stars.map((star) => (
        <OptimizedStar key={star.id} star={star} />
      ))}
    </View>
  );
};

// PERFORMANCE OPTIMIZED: Simplified star component using native driver
const OptimizedStar = React.memo(({ star }) => {
  const twinkleAnim = useRef(new Animated.Value(star.opacity)).current;
  
  useEffect(() => {
    // Simplified twinkling effect using native driver
    const twinkle = Animated.loop(
      Animated.sequence([
        Animated.timing(twinkleAnim, {
          toValue: star.opacity * 0.4,
          duration: star.twinkleSpeed,
          useNativeDriver: true, // PERFORMANCE: Use native driver
        }),
        Animated.timing(twinkleAnim, {
          toValue: star.opacity,
          duration: star.twinkleSpeed,
          useNativeDriver: true, // PERFORMANCE: Use native driver
        }),
      ])
    );
    
    // Stagger animation starts to distribute load
    const delay = Math.random() * 5000;
    const timer = setTimeout(() => {
      twinkle.start();
    }, delay);
    
    return () => {
      clearTimeout(timer);
      twinkle.stop();
    };
  }, []);

  return (
    <View>
      {/* Star halo for brighter stars - simplified */}
      {star.magnitude > 0.7 && (
        <Animated.View
          style={{
            position: 'absolute',
            left: star.x - star.size,
            top: star.y - star.size,
            width: star.size * 2.5,
            height: star.size * 2.5,
            borderRadius: star.size * 1.25,
            backgroundColor: star.color,
            opacity: twinkleAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, star.opacity * 0.08],
            }),
          }}
        />
      )}
      
      {/* Main star */}
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
    </View>
  );
});

// PERFORMANCE OPTIMIZED: Significantly reduced particle count
const OptimizedDustClouds = ({ particleCount = 8, intensity = 'medium' }) => {
  const particles = useRef([]);
  const animatedValues = useRef([]);

  // Adjust particle count based on intensity
  const actualCount = intensity === 'high' ? particleCount : 
                     intensity === 'medium' ? Math.ceil(particleCount * 0.6) : 
                     Math.ceil(particleCount * 0.3);

  if (particles.current.length === 0) {
    for (let i = 0; i < actualCount; i++) {
      const particle = {
        id: i,
        x: Math.random() * width,
        y: Math.random() * height,
        size: 0.2 + Math.random() * 0.3,
        opacity: 0.03 + Math.random() * 0.04,
        duration: 25000 + Math.random() * 20000, // Slower movement for performance
        color: ['#F5F5DC', '#E6E6FA'][Math.floor(Math.random() * 2)], // Reduced color variety
        driftDirection: Math.random() * Math.PI * 2,
        driftSpeed: 0.2 + Math.random() * 0.4, // Reduced drift speed
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
      const driftX = Math.cos(particle.driftDirection) * particle.driftSpeed * 10;
      const driftY = Math.sin(particle.driftDirection) * particle.driftSpeed * 8;
      
      return Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(translateX, {
              toValue: driftX,
              duration: particle.duration / 2,
              useNativeDriver: true, // PERFORMANCE: Use native driver
            }),
            Animated.timing(translateX, {
              toValue: -driftX,
              duration: particle.duration / 2,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(translateY, {
              toValue: driftY,
              duration: particle.duration / 3,
              useNativeDriver: true, // PERFORMANCE: Use native driver
            }),
            Animated.timing(translateY, {
              toValue: -driftY,
              duration: particle.duration / 3,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(opacity, {
              toValue: particle.opacity * 0.4,
              duration: particle.duration / 5,
              useNativeDriver: true, // PERFORMANCE: Use native driver
            }),
            Animated.timing(opacity, {
              toValue: particle.opacity,
              duration: particle.duration / 5,
              useNativeDriver: true,
            }),
          ]),
        ])
      );
    });

    // Stagger animation starts to distribute load
    animations.forEach((animation, index) => {
      setTimeout(() => animation.start(), index * 1500);
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
              backgroundColor: particle.color,
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

// PERFORMANCE OPTIMIZED: Reduced asteroid count dramatically  
const OptimizedAsteroidField = ({ intensity = 'medium' }) => {
  const asteroids = React.useMemo(() => {
    const counts = { low: 3, medium: 6, high: 10 };
    const count = counts[intensity] || 6;
    
    return [...Array(count)].map((_, index) => {
      const distance = 100 + Math.random() * 150;
      const angle = Math.random() * 360;
      const centerX = width / 2;
      const centerY = height / 2;
      
      return {
        id: index,
        distance: distance,
        angle: angle,
        centerX: centerX,
        centerY: centerY,
        size: 1.0 + Math.random() * 2.5,
        width: 1.0 + Math.random() * 2.5,
        height: (1.0 + Math.random() * 2.5) * (0.6 + Math.random() * 0.8),
        opacity: 0.12 + Math.random() * 0.18,
        color: ['#8B7355', '#696969', '#5F5F5F'][Math.floor(Math.random() * 3)],
        rotationSpeed: 20000 + Math.random() * 60000, // Slower rotation
        orbitalSpeed: 120000 + Math.random() * 180000, // Slower orbit
        borderRadius: Math.random() * 1.5,
        eccentricity: 0.1 + Math.random() * 0.2,
      };
    });
  }, [intensity]);

  return (
    <View style={{ position: 'absolute', width, height }} pointerEvents="none">
      {asteroids.map((asteroid) => (
        <OptimizedOrbitingAsteroid key={asteroid.id} asteroid={asteroid} />
      ))}
    </View>
  );
};

// PERFORMANCE OPTIMIZED: Simplified asteroid animation
const OptimizedOrbitingAsteroid = React.memo(({ asteroid }) => {
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const orbitalAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    const rotation = Animated.loop(
      Animated.timing(rotationAnim, {
        toValue: 1,
        duration: asteroid.rotationSpeed,
        useNativeDriver: true, // PERFORMANCE: Use native driver
      })
    );

    const orbital = Animated.loop(
      Animated.timing(orbitalAnim, {
        toValue: 1,
        duration: asteroid.orbitalSpeed,
        useNativeDriver: true, // PERFORMANCE: Use native driver
      })
    );
    
    // Stagger start times
    const delay = Math.random() * 3000;
    setTimeout(() => {
      rotation.start();
      orbital.start();
    }, delay);
    
    return () => {
      rotation.stop();
      orbital.stop();
    };
  }, []);

  const rotateValue = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const translateX = orbitalAnim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [
      asteroid.centerX + asteroid.distance,
      asteroid.centerX,
      asteroid.centerX - asteroid.distance * (1 + asteroid.eccentricity),
      asteroid.centerX,
      asteroid.centerX + asteroid.distance,
    ],
  });

  const translateY = orbitalAnim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [
      asteroid.centerY,
      asteroid.centerY - asteroid.distance * 0.3,
      asteroid.centerY,
      asteroid.centerY + asteroid.distance * 0.3,
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
});

// Photorealistic distant galaxies - static for performance
const DistantGalaxies = React.memo(() => {
  const galaxies = React.useMemo(() => [
    { 
      x: width * 0.15, 
      y: height * 0.25, 
      width: 8, 
      height: 3, 
      color: 'rgba(220, 220, 255, 0.04)',
      borderRadius: 4,
      type: 'elliptical'
    },
    { 
      x: width * 0.75, 
      y: height * 0.15, 
      width: 6, 
      height: 6, 
      color: 'rgba(255, 235, 205, 0.03)',
      borderRadius: 3,
      type: 'spiral'
    },
    { 
      x: width * 0.85, 
      y: height * 0.70, 
      width: 4, 
      height: 2, 
      color: 'rgba(205, 210, 255, 0.025)',
      borderRadius: 2,
      type: 'irregular'
    },
  ], []);

  return (
    <View style={{ position: 'absolute', width, height }} pointerEvents="none">
      {galaxies.map((galaxy, index) => (
        <View
          key={index}
          style={{
            position: 'absolute',
            left: galaxy.x,
            top: galaxy.y,
            width: galaxy.width,
            height: galaxy.height,
            backgroundColor: galaxy.color,
            borderRadius: galaxy.borderRadius,
          }}
        />
      ))}
    </View>
  );
});

// Realistic nebula formations - static for performance
const RealisticNebulae = React.memo(() => {
  const nebulae = React.useMemo(() => [
    { 
      x: width * 0.08, 
      y: height * 0.35, 
      width: 180, 
      height: 90, 
      color: 'rgba(138, 43, 226, 0.015)', // Slightly more visible
      borderRadius: 45,
      type: 'emission'
    },
    { 
      x: width * 0.65, 
      y: height * 0.55, 
      width: 220, 
      height: 110, 
      color: 'rgba(30, 144, 255, 0.010)', // Slightly more visible
      borderRadius: 55,
      type: 'reflection'
    },
    { 
      x: width * 0.25, 
      y: height * 0.75, 
      width: 150, 
      height: 75, 
      color: 'rgba(255, 69, 0, 0.008)', // Added back with low opacity
      borderRadius: 38,
      type: 'planetary'
    },
  ], []);

  return (
    <View style={{ position: 'absolute', width, height }} pointerEvents="none">
      {nebulae.map((nebula, index) => (
        <View
          key={index}
          style={{
            position: 'absolute',
            left: nebula.x,
            top: nebula.y,
            width: nebula.width,
            height: nebula.height,
            backgroundColor: nebula.color,
            borderRadius: nebula.borderRadius,
          }}
        />
      ))}
    </View>
  );
});

// PERFORMANCE: Subtle occasional meteors - very lightweight
const SubtleMeteorShower = React.memo(({ intensity = 'medium' }) => {
  const meteors = React.useMemo(() => {
    const count = intensity === 'high' ? 2 : intensity === 'medium' ? 1 : 0;
    if (count === 0) return [];
    
    return [...Array(count)].map((_, index) => ({
      id: index,
      startX: -20 + Math.random() * 40,
      startY: Math.random() * height * 0.3,
      endX: width + 20,
      endY: Math.random() * height * 0.2 + height * 0.8,
      length: 15 + Math.random() * 25, // Shorter trails
      width: 1 + Math.random() * 1.5, // Thinner meteors
      opacity: 0.2 + Math.random() * 0.3, // Lower opacity
      color: ['#87CEEB', '#E0FFFF', '#B0E0E6'][Math.floor(Math.random() * 3)],
      duration: 3000 + Math.random() * 4000, // Slower movement
      delay: Math.random() * 15000, // Longer delays between meteors
    }));
  }, [intensity]);

  return (
    <View style={{ position: 'absolute', width, height }} pointerEvents="none">
      {meteors.map((meteor) => (
        <SubtleMeteor key={meteor.id} meteor={meteor} />
      ))}
    </View>
  );
});

// Individual subtle meteor with minimal performance impact
const SubtleMeteor = React.memo(({ meteor }) => {
  const moveAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    const meteorSequence = () => {
      Animated.sequence([
        Animated.delay(meteor.delay),
        Animated.parallel([
          Animated.timing(moveAnim, {
            toValue: 1,
            duration: meteor.duration,
            useNativeDriver: true, // PERFORMANCE: Use native driver
          }),
          Animated.sequence([
            Animated.timing(opacityAnim, {
              toValue: 1,
              duration: meteor.duration * 0.2,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0,
              duration: meteor.duration * 0.8,
              useNativeDriver: true,
            }),
          ]),
        ]),
        Animated.delay(20000 + Math.random() * 30000), // Very long delays
      ]).start(() => {
        moveAnim.setValue(0);
        opacityAnim.setValue(0);
        meteorSequence();
      });
    };

    // Stagger start times
    const delay = Math.random() * 10000;
    const timer = setTimeout(() => {
      meteorSequence();
    }, delay);
    
    return () => {
      clearTimeout(timer);
      moveAnim.stopAnimation();
      opacityAnim.stopAnimation();
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

  const opacity = opacityAnim.interpolate({
    inputRange: [0, 0.2, 0.8, 1],
    outputRange: [0, meteor.opacity, meteor.opacity * 0.6, 0],
  });

  const angle = Math.atan2(meteor.endY - meteor.startY, meteor.endX - meteor.startX) * 180 / Math.PI;

  return (
    <View>
      {/* Simple meteor trail - single segment for performance */}
      <Animated.View
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: meteor.length,
          height: meteor.width,
          backgroundColor: meteor.color,
          opacity: opacity.interpolate({
            inputRange: [0, 1],
            outputRange: [0, meteor.opacity * 0.4],
          }),
          transform: [
            { translateX: translateX.interpolate({
              inputRange: [0, 1],
              outputRange: [meteor.startX - 10, meteor.endX - 10],
            })},
            { translateY: translateY.interpolate({
              inputRange: [0, 1],
              outputRange: [meteor.startY - 5, meteor.endY - 5],
            })},
            { rotate: `${angle}deg` },
          ],
          borderRadius: meteor.width / 2,
        }}
      />
      
      {/* Meteor head */}
      <Animated.View
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: meteor.width * 1.5,
          height: meteor.width * 1.5,
          borderRadius: meteor.width * 0.75,
          backgroundColor: meteor.color,
          opacity,
          transform: [
            { translateX },
            { translateY },
          ],
        }}
      />
    </View>
  );
});

// Enhanced twinkling for distant galaxies - very subtle
const EnhancedDistantGalaxies = React.memo(() => {
  const twinkleAnim = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    const twinkle = Animated.loop(
      Animated.sequence([
        Animated.timing(twinkleAnim, {
          toValue: 0.7,
          duration: 8000,
          useNativeDriver: true,
        }),
        Animated.timing(twinkleAnim, {
          toValue: 1,
          duration: 8000,
          useNativeDriver: true,
        }),
      ])
    );
    
    const delay = Math.random() * 5000;
    const timer = setTimeout(() => {
      twinkle.start();
    }, delay);
    
    return () => {
      clearTimeout(timer);
      twinkle.stop();
    };
  }, []);

  const galaxies = React.useMemo(() => [
    { 
      x: width * 0.15, 
      y: height * 0.25, 
      width: 8, 
      height: 3, 
      color: 'rgba(220, 220, 255, 0.06)', // Slightly more visible
      borderRadius: 4,
      type: 'elliptical'
    },
    { 
      x: width * 0.75, 
      y: height * 0.15, 
      width: 6, 
      height: 6, 
      color: 'rgba(255, 235, 205, 0.05)', // Slightly more visible
      borderRadius: 3,
      type: 'spiral'
    },
    { 
      x: width * 0.85, 
      y: height * 0.70, 
      width: 4, 
      height: 2, 
      color: 'rgba(205, 210, 255, 0.04)', // Slightly more visible
      borderRadius: 2,
      type: 'irregular'
    },
  ], []);

  return (
    <View style={{ position: 'absolute', width, height }} pointerEvents="none">
      {galaxies.map((galaxy, index) => (
        <Animated.View
          key={index}
          style={{
            position: 'absolute',
            left: galaxy.x,
            top: galaxy.y,
            width: galaxy.width,
            height: galaxy.height,
            backgroundColor: galaxy.color,
            borderRadius: galaxy.borderRadius,
            opacity: twinkleAnim,
          }}
        />
      ))}
    </View>
  );
});

// Main photorealistic space background - HEAVILY OPTIMIZED with subtle enhancements
export const EnhancedSpaceBackground = ({ 
  showMovingStars = true, 
  intensity = 'medium' // 'low', 'medium', 'high'
}) => {
  const dustParticleCount = intensity === 'high' ? 12 : intensity === 'medium' ? 8 : 4;
  const starCount = intensity === 'high' ? 20 : intensity === 'medium' ? 12 : 6;

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
      {/* Photorealistic deep space gradient */}
      <PhotorealisticSpaceGradient />

      {/* Enhanced distant galaxies with subtle twinkling */}
      <EnhancedDistantGalaxies />

      {/* Enhanced nebula formations */}
      <RealisticNebulae />

      {/* SOLAR SYSTEM TRAVEL: Moving celestial bodies for parallax */}
      <MovingCelestialBodies intensity={intensity} />

      {/* SOLAR SYSTEM TRAVEL: Directional solar wind effect */}
      <SolarWindEffect intensity={intensity} />

      {/* Optimized star distribution */}
      <OptimizedStarDistribution intensity={intensity} />

      {/* Optimized asteroid field */}
      <OptimizedAsteroidField intensity={intensity} />

      {/* Optimized dust clouds */}
      <OptimizedDustClouds particleCount={dustParticleCount} intensity={intensity} />

      {/* Subtle meteor shower - very occasional */}
      <SubtleMeteorShower intensity={intensity} />

      {/* Moving starfield for space travel - enhanced directional movement */}
      {showMovingStars && (
        <ContinuousStarfield 
          starCount={starCount} 
          speed="medium" 
          spawnRate={2500} // Slightly faster spawn for more movement feeling
        />
      )}
    </View>
  );
};

export default EnhancedSpaceBackground; 