/**
 * ===========================
 * REALISTIC SOLAR SYSTEM VIEW
 * ===========================
 * 
 * Accurate representation of our solar system with proper orbital mechanics
 * for the main menu background
 */

import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions } from 'react-native';
import { THEME, getPlanetType } from './constants';

const { width, height } = Dimensions.get('window');

// Enhanced solar system configuration with realistic ratios (scaled for mobile display)
const SOLAR_SYSTEM_CONFIG = {
  sun: {
    value: 8192, // Our Sun
    size: 40, // Increased size for more prominence
    x: width / 2,
    y: height / 2,
    rotationSpeed: 0,
  },
  planets: [
    {
      value: 8, // Mercury
      size: 10,
      orbitRadius: 70,
      orbitSpeed: 10000, // Even faster for dramatic effect
      initialAngle: 0,
      hasAtmosphere: false,
      moons: [],
    },
    {
      value: 32, // Venus
      size: 13,
      orbitRadius: 95,
      orbitSpeed: 16000,
      initialAngle: 45,
      hasAtmosphere: true,
      atmosphereColor: 'rgba(255, 255, 102, 0.3)',
      moons: [],
    },
    {
      value: 64, // Earth
      size: 14,
      orbitRadius: 125,
      orbitSpeed: 22000,
      initialAngle: 90,
      hasAtmosphere: true,
      atmosphereColor: 'rgba(135, 206, 235, 0.4)',
      moons: [{ size: 4, distance: 20, speed: 8000, color: '#C0C0C0' }], // Moon
    },
    {
      value: 16, // Mars
      size: 12,
      orbitRadius: 155,
      orbitSpeed: 32000,
      initialAngle: 135,
      hasAtmosphere: false,
      moons: [
        { size: 2, distance: 15, speed: 5000, color: '#8B7355' }, // Phobos
        { size: 1.5, distance: 25, speed: 12000, color: '#A0522D' }, // Deimos
      ],
    },
    {
      value: 1024, // Jupiter
      size: 32,
      orbitRadius: 220,
      orbitSpeed: 65000,
      initialAngle: 180,
      hasAtmosphere: true,
      atmosphereColor: 'rgba(255, 140, 0, 0.3)',
      moons: [
        { size: 3, distance: 35, speed: 7000, color: '#FFFACD' }, // Io
        { size: 3, distance: 45, speed: 10000, color: '#E6E6FA' }, // Europa
        { size: 4, distance: 55, speed: 14000, color: '#D2B48C' }, // Ganymede
        { size: 4, distance: 65, speed: 18000, color: '#696969' }, // Callisto
      ],
    },
    {
      value: 512, // Saturn
      size: 28,
      orbitRadius: 270,
      orbitSpeed: 85000,
      initialAngle: 225,
      hasAtmosphere: false,
      hasRings: true,
      moons: [
        { size: 3, distance: 40, speed: 9000, color: '#FFA500' }, // Titan
        { size: 2, distance: 50, speed: 12000, color: '#E0E0E0' }, // Enceladus
      ],
    },
    {
      value: 256, // Uranus
      size: 20,
      orbitRadius: 310,
      orbitSpeed: 105000,
      initialAngle: 270,
      hasAtmosphere: true,
      atmosphereColor: 'rgba(79, 208, 227, 0.3)',
      tilt: 98, // Famous for its extreme tilt
      moons: [],
    },
    {
      value: 128, // Neptune
      size: 19,
      orbitRadius: 350,
      orbitSpeed: 130000, // Slowest orbit
      initialAngle: 315,
      hasAtmosphere: true,
      atmosphereColor: 'rgba(65, 105, 225, 0.4)',
      moons: [{ size: 3, distance: 30, speed: 8000, color: '#B0C4DE' }], // Triton
    },
  ],
  // Add dwarf planets and other objects
  dwarfPlanets: [
    {
      value: 2, // Pluto
      size: 8,
      orbitRadius: 380,
      orbitSpeed: 180000,
      initialAngle: 45,
      color: '#8DA3B0',
    },
  ],
  // Add comets for dynamic beauty
  comets: [
    {
      size: 4,
      orbitRadius: 400,
      orbitSpeed: 200000,
      initialAngle: 120,
      tailLength: 30,
      color: '#87CEEB',
    },
    {
      size: 3,
      orbitRadius: 450,
      orbitSpeed: 250000,
      initialAngle: 300,
      tailLength: 25,
      color: '#E0FFFF',
    },
  ],
};

const SolarSystemView = ({ opacity = 0.6, scale = 1 }) => {
  return (
    <View style={{
      position: 'absolute',
      width: '100%',
      height: '100%',
      opacity: opacity,
      transform: [{ scale: scale }],
    }}>
      {/* Enhanced orbital paths */}
      <OrbitalPaths />
      
      {/* Solar wind and corona effects */}
      <SolarWind />
      
      {/* Central Sun with enhanced effects */}
      <CentralSun />
      
      {/* Orbiting Planets with moons */}
      {SOLAR_SYSTEM_CONFIG.planets.map((planetConfig, index) => (
        <OrbitingPlanet key={`planet-${index}`} config={planetConfig} />
      ))}
      
      {/* Asteroid belt representation */}
      <AsteroidBelt />
      
      {/* Dwarf planets */}
      {SOLAR_SYSTEM_CONFIG.dwarfPlanets.map((dwarfPlanet, index) => (
        <DwarfPlanet key={`dwarf-${index}`} config={dwarfPlanet} />
      ))}
      
      {/* Comets with beautiful tails */}
      {SOLAR_SYSTEM_CONFIG.comets.map((comet, index) => (
        <Comet key={`comet-${index}`} config={comet} />
      ))}
      
      {/* Space dust particles */}
      <SpaceDust />
    </View>
  );
};

// Enhanced orbital path visualization
const OrbitalPaths = () => {
  return (
    <>
      {/* Planet orbits */}
      {SOLAR_SYSTEM_CONFIG.planets.map((planet, index) => (
        <View
          key={`planet-orbit-${index}`}
          style={{
            position: 'absolute',
            width: planet.orbitRadius * 2,
            height: planet.orbitRadius * 2,
            borderRadius: planet.orbitRadius,
            borderWidth: index < 4 ? 1 : 2, // Thicker lines for outer planets
            borderColor: index < 4 ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.12)',
            left: SOLAR_SYSTEM_CONFIG.sun.x - planet.orbitRadius,
            top: SOLAR_SYSTEM_CONFIG.sun.y - planet.orbitRadius,
          }}
        />
      ))}
      
      {/* Dwarf planet orbits */}
      {SOLAR_SYSTEM_CONFIG.dwarfPlanets.map((dwarf, index) => (
        <View
          key={`dwarf-orbit-${index}`}
          style={{
            position: 'absolute',
            width: dwarf.orbitRadius * 2,
            height: dwarf.orbitRadius * 2,
            borderRadius: dwarf.orbitRadius,
            borderWidth: 1,
            borderColor: 'rgba(173, 216, 230, 0.1)',
            borderStyle: 'dashed',
            left: SOLAR_SYSTEM_CONFIG.sun.x - dwarf.orbitRadius,
            top: SOLAR_SYSTEM_CONFIG.sun.y - dwarf.orbitRadius,
          }}
        />
      ))}
      
      {/* Comet orbits (elliptical hint) */}
      {SOLAR_SYSTEM_CONFIG.comets.map((comet, index) => (
        <View
          key={`comet-orbit-${index}`}
          style={{
            position: 'absolute',
            width: comet.orbitRadius * 2,
            height: comet.orbitRadius * 2,
            borderRadius: comet.orbitRadius,
            borderWidth: 1,
            borderColor: 'rgba(135, 206, 235, 0.06)',
            left: SOLAR_SYSTEM_CONFIG.sun.x - comet.orbitRadius,
            top: SOLAR_SYSTEM_CONFIG.sun.y - comet.orbitRadius,
          }}
        />
      ))}
    </>
  );
};

// Enhanced central sun component with corona
const CentralSun = () => {
  const sunGlowAnim = useRef(new Animated.Value(0.8)).current;
  const sunRotationAnim = useRef(new Animated.Value(0)).current;
  const coronaAnim = useRef(new Animated.Value(0.3)).current;
  const flareAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Enhanced sun glow animation
    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(sunGlowAnim, {
          toValue: 1.0,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(sunGlowAnim, {
          toValue: 0.8,
          duration: 2500,
          useNativeDriver: true,
        }),
      ])
    );

    // Sun rotation (faster for more dynamic feel)
    const rotationAnimation = Animated.loop(
      Animated.timing(sunRotationAnim, {
        toValue: 1,
        duration: 25000,
        useNativeDriver: true,
      })
    );

    // Corona pulsing
    const coronaAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(coronaAnim, {
          toValue: 0.6,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(coronaAnim, {
          toValue: 0.3,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    );

    // Solar flare effects
    const flareAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(flareAnim, {
          toValue: 1,
          duration: 6000,
          useNativeDriver: true,
        }),
        Animated.timing(flareAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    glowAnimation.start();
    rotationAnimation.start();
    coronaAnimation.start();
    flareAnimation.start();

    return () => {
      glowAnimation.stop();
      rotationAnimation.stop();
      coronaAnimation.stop();
      flareAnimation.stop();
    };
  }, []);

  const sunRotation = sunRotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const sunPlanet = getPlanetType(SOLAR_SYSTEM_CONFIG.sun.value);

  return (
    <View style={{
      position: 'absolute',
      left: SOLAR_SYSTEM_CONFIG.sun.x - SOLAR_SYSTEM_CONFIG.sun.size / 2,
      top: SOLAR_SYSTEM_CONFIG.sun.y - SOLAR_SYSTEM_CONFIG.sun.size / 2,
    }}>
      {/* Outer corona */}
      <Animated.View style={{
        position: 'absolute',
        width: SOLAR_SYSTEM_CONFIG.sun.size + 30,
        height: SOLAR_SYSTEM_CONFIG.sun.size + 30,
        borderRadius: (SOLAR_SYSTEM_CONFIG.sun.size + 30) / 2,
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        left: -15,
        top: -15,
        opacity: coronaAnim,
      }} />
      
      {/* Middle corona */}
      <Animated.View style={{
        position: 'absolute',
        width: SOLAR_SYSTEM_CONFIG.sun.size + 20,
        height: SOLAR_SYSTEM_CONFIG.sun.size + 20,
        borderRadius: (SOLAR_SYSTEM_CONFIG.sun.size + 20) / 2,
        backgroundColor: 'rgba(255, 165, 0, 0.15)',
        left: -10,
        top: -10,
        opacity: coronaAnim,
      }} />
      
      {/* Main sun body */}
      <Animated.View
        style={{
          position: 'absolute',
          width: SOLAR_SYSTEM_CONFIG.sun.size,
          height: SOLAR_SYSTEM_CONFIG.sun.size,
          borderRadius: SOLAR_SYSTEM_CONFIG.sun.size / 2,
          backgroundColor: sunPlanet.primary,
          shadowColor: sunPlanet.primary,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: sunGlowAnim,
          shadowRadius: 25,
          elevation: 20,
          transform: [{ rotate: sunRotation }],
        }}
      >
        {/* Enhanced sun surface details */}
        <View style={{
          position: 'absolute',
          width: SOLAR_SYSTEM_CONFIG.sun.size * 0.4,
          height: SOLAR_SYSTEM_CONFIG.sun.size * 0.4,
          borderRadius: SOLAR_SYSTEM_CONFIG.sun.size * 0.2,
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          top: SOLAR_SYSTEM_CONFIG.sun.size * 0.1,
          left: SOLAR_SYSTEM_CONFIG.sun.size * 0.1,
        }} />
        
        {/* Solar spots */}
        <View style={{
          position: 'absolute',
          width: SOLAR_SYSTEM_CONFIG.sun.size * 0.15,
          height: SOLAR_SYSTEM_CONFIG.sun.size * 0.15,
          borderRadius: SOLAR_SYSTEM_CONFIG.sun.size * 0.075,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          top: SOLAR_SYSTEM_CONFIG.sun.size * 0.6,
          left: SOLAR_SYSTEM_CONFIG.sun.size * 0.3,
        }} />
        
        <View style={{
          position: 'absolute',
          width: SOLAR_SYSTEM_CONFIG.sun.size * 0.1,
          height: SOLAR_SYSTEM_CONFIG.sun.size * 0.1,
          borderRadius: SOLAR_SYSTEM_CONFIG.sun.size * 0.05,
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          top: SOLAR_SYSTEM_CONFIG.sun.size * 0.3,
          right: SOLAR_SYSTEM_CONFIG.sun.size * 0.2,
        }} />
      </Animated.View>
      
      {/* Solar flares */}
      <Animated.View style={{
        position: 'absolute',
        width: SOLAR_SYSTEM_CONFIG.sun.size + 12,
        height: SOLAR_SYSTEM_CONFIG.sun.size + 12,
        borderRadius: (SOLAR_SYSTEM_CONFIG.sun.size + 12) / 2,
        borderWidth: 3,
        borderColor: '#FF4500',
        left: -6,
        top: -6,
        opacity: sunGlowAnim.interpolate({
          inputRange: [0.8, 1.0],
          outputRange: [0.3, 0.7],
        }),
      }} />
      
      {/* Dynamic solar flares */}
      <Animated.View style={{
        position: 'absolute',
        width: SOLAR_SYSTEM_CONFIG.sun.size + 16,
        height: SOLAR_SYSTEM_CONFIG.sun.size + 16,
        borderRadius: (SOLAR_SYSTEM_CONFIG.sun.size + 16) / 2,
        borderWidth: 2,
        borderColor: '#FFD700',
        left: -8,
        top: -8,
        opacity: flareAnim,
        transform: [{ rotate: sunRotation }],
      }} />
    </View>
  );
};

// Individual orbiting planet component
const OrbitingPlanet = ({ config }) => {
  const orbitAnim = useRef(new Animated.Value(0)).current;
  const rotationAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Orbital animation with different speeds for each planet
    const orbitAnimation = Animated.loop(
      Animated.timing(orbitAnim, {
        toValue: 1,
        duration: config.orbitSpeed,
        useNativeDriver: true,
      })
    );

    // Planet rotation (faster than orbit)
    const rotationAnimation = Animated.loop(
      Animated.timing(rotationAnim, {
        toValue: 1,
        duration: config.orbitSpeed / 10, // Much faster rotation
        useNativeDriver: true,
      })
    );

    // Start with initial angle offset
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
        left: SOLAR_SYSTEM_CONFIG.sun.x - config.orbitRadius,
        top: SOLAR_SYSTEM_CONFIG.sun.y - config.orbitRadius,
        transform: [{ rotate: orbitRotation }],
      }}
    >
      {/* Enhanced atmospheric glow */}
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
          borderWidth: 1,
          borderColor: planet.accent || planet.primary,
          shadowColor: planet.glow ? planet.primary : '#000',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: planet.glow ? 0.8 : 0.3,
          shadowRadius: planet.glow ? 12 : 6,
          elevation: planet.glow ? 12 : 6,
          transform: [
            { rotate: planetRotation },
            ...(config.tilt ? [{ rotateZ: `${config.tilt}deg` }] : []),
          ],
        }}
      >
        {/* Enhanced planet surface details */}
        <PlanetSurfaceDetails planet={planet} size={config.size} />
        
        {/* Special features for specific planets */}
        {config.value === 512 && <SaturnRingsMini size={config.size} />}
        {config.value === 64 && <EarthContinents size={config.size} />}
        {config.value === 1024 && <JupiterRedSpot size={config.size} />}
        {config.value === 16 && <MarsPolarCaps size={config.size} />}
        {config.value === 32 && <VenusAtmosphere size={config.size} />}
      </Animated.View>
      
      {/* Planetary moons */}
      {config.moons && config.moons.map((moon, moonIndex) => (
        <PlanetaryMoon
          key={`moon-${moonIndex}`}
          moon={moon}
          planetPosition={{
            x: config.orbitRadius,
            y: 0,
          }}
          orbitRotation={orbitRotation}
          planetRotation={planetRotation}
        />
      ))}
    </Animated.View>
  );
};

// Planet surface details component
const PlanetSurfaceDetails = ({ planet, size }) => {
  return (
    <>
      {/* Atmospheric glow for planets with atmosphere */}
      {planet.atmosphere && (
        <View style={{
          position: 'absolute',
          width: size * 1.2,
          height: size * 1.2,
          borderRadius: size * 0.6,
          backgroundColor: planet.atmosphere,
          left: -size * 0.1,
          top: -size * 0.1,
          opacity: 0.3,
        }} />
      )}
      
      {/* Sun illumination */}
      <View style={{
        position: 'absolute',
        width: size * 0.4,
        height: size * 0.4,
        borderRadius: size * 0.2,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        top: size * 0.1,
        left: size * 0.1,
      }} />
    </>
  );
};

// Mini Saturn rings for the solar system view
const SaturnRingsMini = ({ size }) => {
  return (
    <>
      <View style={{
        position: 'absolute',
        width: size * 1.8,
        height: size * 1.8,
        borderRadius: size * 0.9,
        borderWidth: 1,
        borderColor: 'rgba(218, 165, 32, 0.8)',
        left: -size * 0.4,
        top: -size * 0.4,
      }} />
      <View style={{
        position: 'absolute',
        width: size * 1.5,
        height: size * 1.5,
        borderRadius: size * 0.75,
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.6)',
        left: -size * 0.25,
        top: -size * 0.25,
      }} />
    </>
  );
};

// Earth continents
const EarthContinents = ({ size }) => {
  return (
    <>
      <View style={{
        position: 'absolute',
        width: size * 0.3,
        height: size * 0.25,
        backgroundColor: '#228B22',
        borderRadius: size * 0.1,
        top: size * 0.2,
        left: size * 0.1,
        opacity: 0.8,
      }} />
      <View style={{
        position: 'absolute',
        width: size * 0.25,
        height: size * 0.2,
        backgroundColor: '#228B22',
        borderRadius: size * 0.08,
        bottom: size * 0.15,
        right: size * 0.15,
        opacity: 0.8,
      }} />
    </>
  );
};

// Jupiter's Great Red Spot
const JupiterRedSpot = ({ size }) => {
  return (
    <View style={{
      position: 'absolute',
      width: size * 0.25,
      height: size * 0.15,
      backgroundColor: '#DC143C',
      borderRadius: size * 0.125,
      top: size * 0.4,
      left: size * 0.3,
      opacity: 0.9,
    }} />
  );
};

// Enhanced asteroid belt between Mars and Jupiter
const AsteroidBelt = () => {
  const asteroids = Array.from({ length: 24 }, (_, i) => {
    const angle = (i * 15) + Math.random() * 10; // More asteroids, denser distribution
    const radius = 180 + Math.random() * 30; // Between Mars and Jupiter
    const size = 1.5 + Math.random() * 3;
    const rotationSpeed = 20000 + Math.random() * 15000;
    const colors = ['#696969', '#8B7355', '#A0522D', '#CD853F', '#BC8F8F'];
    
    return {
      angle,
      radius,
      size,
      rotationSpeed,
      color: colors[Math.floor(Math.random() * colors.length)],
      x: SOLAR_SYSTEM_CONFIG.sun.x + Math.cos(angle * Math.PI / 180) * radius,
      y: SOLAR_SYSTEM_CONFIG.sun.y + Math.sin(angle * Math.PI / 180) * radius,
    };
  });

  return (
    <>
      {asteroids.map((asteroid, index) => (
        <AnimatedAsteroid key={`asteroid-${index}`} asteroid={asteroid} />
      ))}
    </>
  );
};

const AnimatedAsteroid = ({ asteroid }) => {
  const rotationAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    const rotationAnimation = Animated.loop(
      Animated.timing(rotationAnim, {
        toValue: 1,
        duration: asteroid.rotationSpeed,
        useNativeDriver: true,
      })
    );
    
    rotationAnimation.start();
    return () => rotationAnimation.stop();
  }, []);

  const rotation = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: asteroid.size,
        height: asteroid.size,
        borderRadius: asteroid.size / 3, // Slightly angular for realistic look
        backgroundColor: asteroid.color,
        left: asteroid.x - asteroid.size / 2,
        top: asteroid.y - asteroid.size / 2,
        opacity: 0.7,
        transform: [{ rotate: rotation }],
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 1,
        elevation: 2,
      }}
    />
  );
};

// Solar wind particle effects
const SolarWind = () => {
  const particles = Array.from({ length: 20 }, (_, i) => {
    const angle = (i * 18) + Math.random() * 18; // Spread around sun
    const distance = 50 + Math.random() * 100;
    const speed = 15000 + Math.random() * 10000;
    
    return { angle, distance, speed, size: 1 + Math.random() };
  });

  return (
    <>
      {particles.map((particle, index) => (
        <SolarWindParticle key={`wind-${index}`} particle={particle} />
      ))}
    </>
  );
};

const SolarWindParticle = ({ particle }) => {
  const windAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    const windAnimation = Animated.loop(
      Animated.timing(windAnim, {
        toValue: 1,
        duration: particle.speed,
        useNativeDriver: true,
      })
    );
    
    windAnimation.start();
    return () => windAnimation.stop();
  }, []);

  const translateX = windAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      SOLAR_SYSTEM_CONFIG.sun.x + Math.cos(particle.angle * Math.PI / 180) * particle.distance,
      SOLAR_SYSTEM_CONFIG.sun.x + Math.cos(particle.angle * Math.PI / 180) * (particle.distance + 300),
    ],
  });

  const translateY = windAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      SOLAR_SYSTEM_CONFIG.sun.y + Math.sin(particle.angle * Math.PI / 180) * particle.distance,
      SOLAR_SYSTEM_CONFIG.sun.y + Math.sin(particle.angle * Math.PI / 180) * (particle.distance + 300),
    ],
  });

  const opacity = windAnim.interpolate({
    inputRange: [0, 0.2, 0.8, 1],
    outputRange: [0, 0.6, 0.4, 0],
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: particle.size,
        height: particle.size,
        borderRadius: particle.size / 2,
        backgroundColor: '#FFD700',
        transform: [
          { translateX },
          { translateY },
        ],
        opacity,
      }}
    />
  );
};

// Planetary moon component
const PlanetaryMoon = ({ moon, planetPosition, orbitRotation, planetRotation }) => {
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
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.3,
          shadowRadius: 2,
          elevation: 3,
        }}
      />
    </Animated.View>
  );
};

// Mars polar caps
const MarsPolarCaps = ({ size }) => (
  <>
    <View style={{
      position: 'absolute',
      width: size * 0.25,
      height: size * 0.15,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderRadius: size * 0.075,
      top: size * 0.05,
      left: size * 0.375,
    }} />
    <View style={{
      position: 'absolute',
      width: size * 0.2,
      height: size * 0.12,
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      borderRadius: size * 0.06,
      bottom: size * 0.05,
      left: size * 0.4,
    }} />
  </>
);

// Venus thick atmosphere effects
const VenusAtmosphere = ({ size }) => (
  <>
    <View style={{
      position: 'absolute',
      width: size * 0.8,
      height: size * 0.1,
      backgroundColor: 'rgba(255, 255, 153, 0.5)',
      borderRadius: size * 0.05,
      top: size * 0.3,
      left: size * 0.1,
    }} />
    <View style={{
      position: 'absolute',
      width: size * 0.7,
      height: size * 0.08,
      backgroundColor: 'rgba(255, 204, 73, 0.4)',
      borderRadius: size * 0.04,
      top: size * 0.6,
      left: size * 0.15,
    }} />
  </>
);

// Dwarf planet component
const DwarfPlanet = ({ config }) => {
  const orbitAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    const orbitAnimation = Animated.loop(
      Animated.timing(orbitAnim, {
        toValue: 1,
        duration: config.orbitSpeed,
        useNativeDriver: true,
      })
    );

    orbitAnim.setValue(config.initialAngle / 360);
    orbitAnimation.start();

    return () => orbitAnimation.stop();
  }, []);

  const orbitRotation = orbitAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [`${config.initialAngle}deg`, `${config.initialAngle + 360}deg`],
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: config.orbitRadius * 2,
        height: config.orbitRadius * 2,
        left: SOLAR_SYSTEM_CONFIG.sun.x - config.orbitRadius,
        top: SOLAR_SYSTEM_CONFIG.sun.y - config.orbitRadius,
        transform: [{ rotate: orbitRotation }],
      }}
    >
      <View
        style={{
          position: 'absolute',
          width: config.size,
          height: config.size,
          borderRadius: config.size / 2,
          backgroundColor: config.color,
          left: config.orbitRadius - config.size / 2,
          top: -config.size / 2,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.3)',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.4,
          shadowRadius: 3,
          elevation: 4,
        }}
      />
    </Animated.View>
  );
};

// Comet component with beautiful tail
const Comet = ({ config }) => {
  const orbitAnim = useRef(new Animated.Value(0)).current;
  const tailAnim = useRef(new Animated.Value(0.5)).current;
  
  useEffect(() => {
    const orbitAnimation = Animated.loop(
      Animated.timing(orbitAnim, {
        toValue: 1,
        duration: config.orbitSpeed,
        useNativeDriver: true,
      })
    );

    const tailAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(tailAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(tailAnim, {
          toValue: 0.5,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    );

    orbitAnim.setValue(config.initialAngle / 360);
    orbitAnimation.start();
    tailAnimation.start();

    return () => {
      orbitAnimation.stop();
      tailAnimation.stop();
    };
  }, []);

  const orbitRotation = orbitAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [`${config.initialAngle}deg`, `${config.initialAngle + 360}deg`],
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: config.orbitRadius * 2,
        height: config.orbitRadius * 2,
        left: SOLAR_SYSTEM_CONFIG.sun.x - config.orbitRadius,
        top: SOLAR_SYSTEM_CONFIG.sun.y - config.orbitRadius,
        transform: [{ rotate: orbitRotation }],
      }}
    >
      {/* Comet tail */}
      <Animated.View
        style={{
          position: 'absolute',
          width: config.tailLength,
          height: 2,
          backgroundColor: config.color,
          borderRadius: 1,
          left: config.orbitRadius - config.tailLength,
          top: -1,
          opacity: tailAnim,
        }}
      />
      
      {/* Comet nucleus */}
      <Animated.View
        style={{
          position: 'absolute',
          width: config.size,
          height: config.size,
          borderRadius: config.size / 2,
          backgroundColor: config.color,
          left: config.orbitRadius - config.size / 2,
          top: -config.size / 2,
          shadowColor: config.color,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: tailAnim,
          shadowRadius: 6,
          elevation: 6,
        }}
      />
    </Animated.View>
  );
};

// Space dust particle effects
const SpaceDust = () => {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    x: Math.random() * width,
    y: Math.random() * height,
    size: 0.5 + Math.random() * 1,
    opacity: 0.2 + Math.random() * 0.3,
    duration: 8000 + Math.random() * 4000,
  }));

  return (
    <>
      {particles.map((particle, index) => (
        <SpaceDustParticle key={`dust-${index}`} particle={particle} />
      ))}
    </>
  );
};

const SpaceDustParticle = ({ particle }) => {
  const driftAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(particle.opacity)).current;
  
  useEffect(() => {
    const driftAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(driftAnim, {
          toValue: 1,
          duration: particle.duration,
          useNativeDriver: true,
        }),
        Animated.timing(driftAnim, {
          toValue: 0,
          duration: particle.duration,
          useNativeDriver: true,
        }),
      ])
    );

    const opacityAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: particle.opacity + 0.2,
          duration: particle.duration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: particle.opacity - 0.1,
          duration: particle.duration / 2,
          useNativeDriver: true,
        }),
      ])
    );

    driftAnimation.start();
    opacityAnimation.start();

    return () => {
      driftAnimation.stop();
      opacityAnimation.stop();
    };
  }, []);

  const translateX = driftAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 5, 0],
  });

  const translateY = driftAnim.interpolate({
    inputRange: [0, 0.25, 0.75, 1],
    outputRange: [0, -3, 2, 0],
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: particle.size,
        height: particle.size,
        borderRadius: particle.size / 2,
        backgroundColor: '#FFFFFF',
        left: particle.x,
        top: particle.y,
        transform: [
          { translateX },
          { translateY },
        ],
        opacity: opacityAnim,
      }}
    />
  );
};

export default SolarSystemView; 