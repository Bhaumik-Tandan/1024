import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { THEME, FONT_SIZES, getPlanetType } from './constants';

const { width, height } = Dimensions.get('window');

// Solar system configuration for splash screen
const SPLASH_SOLAR_SYSTEM = {
  sun: {
    value: 8192,
    size: 30,
    x: width / 2,
    y: height / 2,
  },
  planets: [
    {
      value: 8, // Mercury
      size: 8,
      orbitRadius: 60,
      orbitSpeed: 8000,
      initialAngle: 0,
    },
    {
      value: 32, // Venus
      size: 10,
      orbitRadius: 85,
      orbitSpeed: 12000,
      initialAngle: 90,
      hasAtmosphere: true,
      atmosphereColor: 'rgba(255, 255, 102, 0.3)',
    },
    {
      value: 64, // Earth
      size: 11,
      orbitRadius: 110,
      orbitSpeed: 16000,
      initialAngle: 180,
      hasAtmosphere: true,
      atmosphereColor: 'rgba(135, 206, 235, 0.4)',
      moons: [{ size: 3, distance: 18, speed: 6000, color: '#C0C0C0' }],
    },
    {
      value: 16, // Mars
      size: 9,
      orbitRadius: 135,
      orbitSpeed: 20000,
      initialAngle: 270,
    },
    {
      value: 1024, // Jupiter
      size: 22,
      orbitRadius: 180,
      orbitSpeed: 35000,
      initialAngle: 45,
      hasAtmosphere: true,
      atmosphereColor: 'rgba(255, 140, 0, 0.3)',
    },
    {
      value: 512, // Saturn
      size: 18,
      orbitRadius: 210,
      orbitSpeed: 45000,
      initialAngle: 135,
      hasRings: true,
    },
  ],
};

// Enhanced Central Sun Component
const SplashSun = () => {
  const sunGlowAnim = useRef(new Animated.Value(0.8)).current;
  const sunRotationAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(sunGlowAnim, {
          toValue: 1.0,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(sunGlowAnim, {
          toValue: 0.8,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    );

    const rotationAnimation = Animated.loop(
      Animated.timing(sunRotationAnim, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    );

    glowAnimation.start();
    rotationAnimation.start();

    return () => {
      glowAnimation.stop();
      rotationAnimation.stop();
    };
  }, []);

  const sunRotation = sunRotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const sunPlanet = getPlanetType(SPLASH_SOLAR_SYSTEM.sun.value);

  return (
    <View style={{
      position: 'absolute',
      left: SPLASH_SOLAR_SYSTEM.sun.x - SPLASH_SOLAR_SYSTEM.sun.size / 2,
      top: SPLASH_SOLAR_SYSTEM.sun.y - SPLASH_SOLAR_SYSTEM.sun.size / 2,
    }}>
      {/* Corona effects */}
      <Animated.View style={{
        position: 'absolute',
        width: SPLASH_SOLAR_SYSTEM.sun.size + 20,
        height: SPLASH_SOLAR_SYSTEM.sun.size + 20,
        borderRadius: (SPLASH_SOLAR_SYSTEM.sun.size + 20) / 2,
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        left: -10,
        top: -10,
        opacity: sunGlowAnim,
      }} />
      
      {/* Main sun body */}
      <Animated.View
        style={{
          position: 'absolute',
          width: SPLASH_SOLAR_SYSTEM.sun.size,
          height: SPLASH_SOLAR_SYSTEM.sun.size,
          borderRadius: SPLASH_SOLAR_SYSTEM.sun.size / 2,
          backgroundColor: sunPlanet.primary,
          shadowColor: sunPlanet.primary,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: sunGlowAnim,
          shadowRadius: 15,
          elevation: 15,
          transform: [{ rotate: sunRotation }],
        }}
      >
        {/* Sun surface details */}
        <View style={{
          position: 'absolute',
          width: SPLASH_SOLAR_SYSTEM.sun.size * 0.4,
          height: SPLASH_SOLAR_SYSTEM.sun.size * 0.4,
          borderRadius: SPLASH_SOLAR_SYSTEM.sun.size * 0.2,
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          top: SPLASH_SOLAR_SYSTEM.sun.size * 0.1,
          left: SPLASH_SOLAR_SYSTEM.sun.size * 0.1,
        }} />
      </Animated.View>
    </View>
  );
};

// Solar System Planet Component
const SplashPlanet = ({ config }) => {
  const orbitAnim = useRef(new Animated.Value(0)).current;
  const rotationAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    const orbitAnimation = Animated.loop(
      Animated.timing(orbitAnim, {
        toValue: 1,
        duration: config.orbitSpeed,
        useNativeDriver: true,
      })
    );

    const rotationAnimation = Animated.loop(
      Animated.timing(rotationAnim, {
        toValue: 1,
        duration: config.orbitSpeed / 10,
        useNativeDriver: true,
      })
    );

    orbitAnim.setValue(config.initialAngle / 360);
    
    orbitAnimation.start();
    rotationAnimation.start();

    return () => {
      orbitAnimation.stop();
      rotationAnimation.stop();
    };
  }, []);

  const orbitRotation = orbitAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [`${config.initialAngle}deg`, `${config.initialAngle + 360}deg`],
  });

  const planetRotation = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const planet = getPlanetType(config.value);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: config.orbitRadius * 2,
        height: config.orbitRadius * 2,
        left: SPLASH_SOLAR_SYSTEM.sun.x - config.orbitRadius,
        top: SPLASH_SOLAR_SYSTEM.sun.y - config.orbitRadius,
        transform: [{ rotate: orbitRotation }],
      }}
    >
      {/* Atmospheric glow */}
      {config.hasAtmosphere && (
        <View style={{
          position: 'absolute',
          width: config.size * 1.4,
          height: config.size * 1.4,
          borderRadius: config.size * 0.7,
          backgroundColor: config.atmosphereColor,
          left: config.orbitRadius - config.size * 0.7,
          top: -config.size * 0.7,
        }} />
      )}
      
      {/* Main planet body */}
      <Animated.View
        style={{
          position: 'absolute',
          width: config.size,
          height: config.size,
          borderRadius: config.size / 2,
          backgroundColor: planet.primary,
          left: config.orbitRadius - config.size / 2,
          top: -config.size / 2,
          borderWidth: 0.5,
          borderColor: planet.accent || planet.primary,
          shadowColor: planet.glow ? planet.primary : '#000',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: planet.glow ? 0.6 : 0.3,
          shadowRadius: planet.glow ? 8 : 4,
          elevation: planet.glow ? 8 : 4,
          transform: [{ rotate: planetRotation }],
        }}
      >
        {/* Planet surface details */}
        <View style={{
          position: 'absolute',
          width: config.size * 0.3,
          height: config.size * 0.3,
          borderRadius: config.size * 0.15,
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
          top: config.size * 0.1,
          left: config.size * 0.1,
        }} />
        
        {/* Saturn rings */}
        {config.hasRings && (
          <>
            <View style={{
              position: 'absolute',
              width: config.size * 1.6,
              height: config.size * 1.6,
              borderRadius: config.size * 0.8,
              borderWidth: 1,
              borderColor: 'rgba(218, 165, 32, 0.8)',
              left: -config.size * 0.3,
              top: -config.size * 0.3,
            }} />
            <View style={{
              position: 'absolute',
              width: config.size * 1.3,
              height: config.size * 1.3,
              borderRadius: config.size * 0.65,
              borderWidth: 1,
              borderColor: 'rgba(255, 215, 0, 0.6)',
              left: -config.size * 0.15,
              top: -config.size * 0.15,
            }} />
          </>
        )}
      </Animated.View>
      
      {/* Planetary moons */}
      {config.moons && config.moons.map((moon, moonIndex) => (
        <SplashMoon
          key={`moon-${moonIndex}`}
          moon={moon}
          planetPosition={{
            x: config.orbitRadius,
            y: 0,
          }}
        />
      ))}
    </Animated.View>
  );
};

// Moon component for planets
const SplashMoon = ({ moon, planetPosition }) => {
  const moonOrbitAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    const moonAnimation = Animated.loop(
      Animated.timing(moonOrbitAnim, {
        toValue: 1,
        duration: moon.speed,
        useNativeDriver: true,
      })
    );
    
    moonAnimation.start();
    return () => moonAnimation.stop();
  }, []);

  const moonRotation = moonOrbitAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: moon.distance * 2,
        height: moon.distance * 2,
        left: planetPosition.x - moon.distance,
        top: planetPosition.y - moon.distance,
        transform: [{ rotate: moonRotation }],
      }}
    >
      <View
        style={{
          position: 'absolute',
          width: moon.size,
          height: moon.size,
          borderRadius: moon.size / 2,
          backgroundColor: moon.color,
          left: moon.distance - moon.size / 2,
          top: -moon.size / 2,
          borderWidth: 0.5,
          borderColor: 'rgba(255, 255, 255, 0.3)',
        }}
      />
    </Animated.View>
  );
};

// Orbital paths visualization
const OrbitalPaths = () => {
  return (
    <>
      {SPLASH_SOLAR_SYSTEM.planets.map((planet, index) => (
        <View
          key={`orbit-${index}`}
          style={{
            position: 'absolute',
            width: planet.orbitRadius * 2,
            height: planet.orbitRadius * 2,
            borderRadius: planet.orbitRadius,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.08)',
            left: SPLASH_SOLAR_SYSTEM.sun.x - planet.orbitRadius,
            top: SPLASH_SOLAR_SYSTEM.sun.y - planet.orbitRadius,
          }}
        />
      ))}
    </>
  );
};

// Moving stars component
const MovingStars = ({ count = 20 }) => {
  const stars = useRef([]);
  const animatedValues = useRef([]);

  // Generate stars
  if (stars.current.length === 0) {
    for (let i = 0; i < count; i++) {
      const star = {
        id: i,
        x: Math.random() * width,
        y: Math.random() * height,
        size: 1 + Math.random() * 2,
        opacity: 0.3 + Math.random() * 0.7,
        duration: 3000 + Math.random() * 4000,
      };
      
      stars.current.push(star);
      animatedValues.current.push({
        translateY: new Animated.Value(0),
        opacity: new Animated.Value(star.opacity),
        scale: new Animated.Value(1),
      });
    }
  }

  useEffect(() => {
    const animations = stars.current.map((star, index) => {
      const { translateY, opacity, scale } = animatedValues.current[index];
      
      return Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(translateY, {
              toValue: height + 50,
              duration: star.duration,
              useNativeDriver: true,
            }),
            Animated.timing(translateY, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
          Animated.loop(
            Animated.sequence([
              Animated.timing(opacity, {
                toValue: star.opacity * 0.3,
                duration: 1500,
                useNativeDriver: true,
              }),
              Animated.timing(opacity, {
                toValue: star.opacity,
                duration: 1500,
                useNativeDriver: true,
              }),
            ])
          ),
          Animated.loop(
            Animated.sequence([
              Animated.timing(scale, {
                toValue: 1.3,
                duration: 2000,
                useNativeDriver: true,
              }),
              Animated.timing(scale, {
                toValue: 1,
                duration: 2000,
                useNativeDriver: true,
              }),
            ])
          ),
        ])
      );
    });

    animations.forEach((animation, index) => {
      setTimeout(() => animation.start(), index * 200);
    });

    return () => {
      animations.forEach(animation => animation.stop());
    };
  }, []);

  return (
    <View style={styles.starsContainer} pointerEvents="none">
      {stars.current.map((star, index) => {
        const { translateY, opacity, scale } = animatedValues.current[index];
        
        return (
          <Animated.View
            key={star.id}
            style={[
              styles.star,
              {
                left: star.x,
                top: star.y,
                width: star.size,
                height: star.size,
                transform: [{ translateY }, { scale }],
                opacity,
              },
            ]}
          />
        );
      })}
    </View>
  );
};

export const SplashScreen = ({ onComplete }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const titleScaleAnim = useRef(new Animated.Value(0.5)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const solarSystemOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const splashSequence = Animated.sequence([
      // Initial fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      // Solar system entrance
      Animated.timing(solarSystemOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      // Title entrance
      Animated.timing(titleScaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      // Subtitle fade in
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      // Hold for 2.5 seconds to enjoy the solar system
      Animated.delay(2500),
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]);

    splashSequence.start(() => {
      if (onComplete) onComplete();
    });

    return () => splashSequence.stop();
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Deep space background */}
      <LinearGradient
        colors={['#16213e', '#1a0a2e', '#0a0a1a']}
        style={styles.spaceBackground}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      
      {/* Moving stars */}
      <MovingStars count={30} />
      
      {/* Solar System View */}
      <Animated.View style={[styles.solarSystemContainer, { opacity: solarSystemOpacity }]}>
        {/* Orbital paths */}
        <OrbitalPaths />
        
        {/* Central Sun */}
        <SplashSun />
        
        {/* Orbiting Planets */}
        {SPLASH_SOLAR_SYSTEM.planets.map((planetConfig, index) => (
          <SplashPlanet key={`planet-${index}`} config={planetConfig} />
        ))}
      </Animated.View>
      
      {/* Title */}
      <View style={styles.titleContainer}>
        <Animated.Text 
          style={[
            styles.title,
            {
              transform: [{ scale: titleScaleAnim }],
            }
          ]}
        >
          COSMIC
        </Animated.Text>
        <Animated.Text 
          style={[
            styles.subtitle,
            {
              transform: [{ scale: titleScaleAnim }],
            }
          ]}
        >
          FUSION
        </Animated.Text>
        <Animated.Text 
          style={[
            styles.tagline,
            {
              opacity: subtitleOpacity,
            }
          ]}
        >
          Explore the Solar System
        </Animated.Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.DARK.BACKGROUND_PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },

  spaceBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },

  solarSystemContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },

  starsContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },

  star: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 50,
  },

  titleContainer: {
    alignItems: 'center',
    zIndex: 10,
  },

  title: {
    fontSize: 84,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 8,
    textShadowColor: '#4A90E2',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    marginBottom: -20,
  },

  subtitle: {
    fontSize: 84,
    fontWeight: '900',
    color: '#4A90E2',
    textAlign: 'center',
    letterSpacing: 8,
    textShadowColor: '#FFFFFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
    marginBottom: 20,
  },

  tagline: {
    fontSize: 24,
    fontWeight: '300',
    color: '#B0C4DE',
    textAlign: 'center',
    letterSpacing: 4,
    textShadowColor: '#9B59B6',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
});

export default SplashScreen; 