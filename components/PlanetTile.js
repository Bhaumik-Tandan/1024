/**
 * ===========================
 * COSMIC PLANET TILE COMPONENT
 * ===========================
 * 
 * Realistic planets with enhanced visual styling and orbital motion
 * Using gradients and styling for realistic planet appearance
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { 
  getPlanetType, 
  CELL_SIZE,
  THEME
} from './constants';

const PlanetTile = ({ value, isOrbiting = true, orbitSpeed = 1, size, isColliding = false, gravitationalField = 0 }) => {
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const pulseOpacityAnim = useRef(new Animated.Value(0.3)).current;
  const pulseScaleAnim = useRef(new Animated.Value(1)).current;
  
  // Use provided size or default to CELL_SIZE
  const tileSize = size || CELL_SIZE;
  const planetSize = tileSize * 0.85; // Planet is 85% of tile size
  
  useEffect(() => {
    if (isOrbiting && value > 0) {
      // Simple rotation for normal gameplay
      const rotationAnimation = Animated.loop(
        Animated.timing(rotationAnim, {
          toValue: 1,
          duration: 15000 / orbitSpeed,
          useNativeDriver: true,
        })
      );
      
      // Only add stellar pulse for very large celestial bodies (simplified)
      const planet = getPlanetType(value);
      if (planet.glow && value >= 32768) {
        const opacityPulse = Animated.loop(
          Animated.sequence([
            Animated.timing(pulseOpacityAnim, {
              toValue: 0.6,
              duration: 3000,
              useNativeDriver: true,
            }),
            Animated.timing(pulseOpacityAnim, {
              toValue: 0.3,
              duration: 3000,
              useNativeDriver: true,
            }),
          ])
        );
        opacityPulse.start();
      }
      
      rotationAnimation.start();
      
      return () => {
        rotationAnimation.stop();
        if (planet.glow && value >= 32768) {
          pulseOpacityAnim.stopAnimation();
        }
      };
    }
  }, [isOrbiting, orbitSpeed, value, rotationAnim, pulseOpacityAnim]);

  if (value === 0) {
    // Empty space cell - deep space background
    return (
      <View style={{
        width: CELL_SIZE,
        height: CELL_SIZE,
        backgroundColor: THEME.DARK.BACKGROUND_PRIMARY,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: THEME.DARK.BORDER_COLOR + '20',
        shadowColor: THEME.DARK.STARFIELD,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
      }} />
    );
  }

  const planet = getPlanetType(value);
  const rotation = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={{
      width: tileSize,
      height: tileSize,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    }}>
      
      {/* Main Cosmic Body Container with Gravitational Effects */}
      <Animated.View style={{
        width: planetSize,
        height: planetSize,
        justifyContent: 'center',
        alignItems: 'center',
        transform: [
          { rotate: rotation },
          { scale: pulseScaleAnim },
        ],
        shadowColor: planet.glow ? planet.primary : '#000',
        shadowOffset: { width: 0, height: planet.glow ? 0 : 4 },
        shadowOpacity: planet.glow ? 0.8 : 0.4,
        shadowRadius: planet.glow ? 18 : 8, // Enhanced glow for stars
        elevation: planet.glow ? 15 : 8,
      }}>
        
        {/* Enhanced Cosmic Body with Realistic Gradients */}
        <RealisticPlanet 
          planet={planet} 
          size={planetSize} 
          value={value}
          pulseScaleAnim={pulseScaleAnim}
          isColliding={isColliding}
        />
        
        {/* Enhanced Stellar Corona for massive stars during collisions */}
        {planet.glow && value >= 32768 && (
          <Animated.View style={{
            position: 'absolute',
            width: planetSize + 24,
            height: planetSize + 24,
            borderRadius: (planetSize + 24) / 2,
            borderWidth: 3,
            borderColor: planet.accent,
            opacity: pulseOpacityAnim.interpolate({
              inputRange: [0.3, 0.6],
              outputRange: [0.4, 0.9]
            }),
          }} />
        )}
        
        {/* Stellar flare effects for high-energy collisions */}
        {planet.glow && value >= 32768 && (
          <Animated.View style={{
            position: 'absolute',
            width: planetSize + 16,
            height: planetSize + 16,
            borderRadius: (planetSize + 16) / 2,
            borderWidth: 2,
            borderColor: '#FFD700',
            opacity: pulseOpacityAnim,
            shadowColor: '#FFD700',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 20,
            elevation: 25,
          }} />
        )}
      </Animated.View>

      {/* Simplified Orbiting Moons - only for smaller planets */}
      {planet.moons > 0 && value < 8192 && ( // Reduced threshold for performance
        <OrbitingMoons 
          planetSize={planetSize}
          moonCount={Math.min(planet.moons, 1)} // Max 1 moon for performance
          rotationAnim={rotationAnim}
        />
      )}

      {/* Planet name and value display */}
      <View style={{
        position: 'absolute',
        bottom: 2,
        left: 2,
        right: 2,
        backgroundColor: 'rgba(0,0,0,0.8)', // Darker background for better contrast
        borderRadius: 8,
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
      }}>
        <Text style={{
          color: '#FFFFFF',
          fontSize: Math.max(12, planetSize * 0.16), // Increased font size
          fontWeight: 'bold',
          textAlign: 'center',
          textShadowColor: 'rgba(0,0,0,0.9)',
          textShadowOffset: { width: 1, height: 1 },
          textShadowRadius: 2,
        }}>
          {planet.name}
        </Text>
        <Text style={{
          color: '#FFD700',
          fontSize: Math.max(16, planetSize * 0.20), // Much larger number font
          fontWeight: 'bold',
          textAlign: 'center',
          textShadowColor: 'rgba(0,0,0,0.9)',
          textShadowOffset: { width: 1, height: 1 },
          textShadowRadius: 2,
        }}>
          {value}
        </Text>
      </View>
    </View>
  );
};

// Realistic Planet component for authentic celestial bodies with collision physics
const RealisticPlanet = ({ planet, size, value, pulseScaleAnim, isColliding = false }) => {
  const getRealisticPlanetStyle = () => {
    const baseStyle = getBasePlanetStyle(planet);
    
    // Enhance collision effects for dramatic astronomical mergers
    if (isColliding) {
      return {
        ...baseStyle,
        style: {
          ...baseStyle.style,
          shadowOpacity: Math.min(baseStyle.style.shadowOpacity + 0.4, 1.0),
          shadowRadius: baseStyle.style.shadowRadius + 8,
          borderWidth: baseStyle.style.borderWidth + 1,
        }
      };
    }
    
    return baseStyle;
  };
  
  const getBasePlanetStyle = (planet) => {
    switch (planet.type) {
      case 'mercury':
        return {
          colors: ['#A0A0A0', '#8C7853', '#696969'],
          style: { 
            borderWidth: 1, 
            borderColor: '#808080',
            shadowColor: '#666',
            shadowOpacity: 0.4
          }
        };
      case 'mars':
        return {
          colors: ['#FF6B47', '#CD5C5C', '#B22222'],
          style: { 
            borderWidth: 2, 
            borderColor: '#8B0000',
            shadowColor: '#CD5C5C',
            shadowOpacity: 0.6
          }
        };
      case 'venus':
        return {
          colors: ['#FFFF99', '#FFC649', '#DAA520'],
          style: { 
            borderWidth: 2, 
            borderColor: '#FFD700',
            shadowColor: '#FFC649',
            shadowOpacity: 0.8
          }
        };
      case 'earth':
        return {
          colors: ['#87CEEB', '#6B93D6', '#4682B4'],
          style: { 
            borderWidth: 2, 
            borderColor: '#4F7942',
            shadowColor: '#6B93D6',
            shadowOpacity: 0.7
          }
        };
      case 'neptune':
        return {
          colors: ['#B0E0E6', '#4169E1', '#000080'],
          style: { 
            borderWidth: 2, 
            borderColor: '#6495ED',
            shadowColor: '#4169E1',
            shadowOpacity: 0.7
          }
        };
      case 'uranus':
        return {
          colors: ['#E0FFFF', '#00CED1', '#008B8B'],
          style: { 
            borderWidth: 2, 
            borderColor: '#48D1CC',
            shadowColor: '#00CED1',
            shadowOpacity: 0.6
          }
        };
      case 'saturn':
        return {
          colors: ['#FFFACD', '#DAA520', '#B8860B'],
          style: { 
            borderWidth: 3, 
            borderColor: '#FFD700',
            shadowColor: '#DAA520',
            shadowOpacity: 0.8
          }
        };
      case 'jupiter':
        return {
          colors: ['#DEB887', '#D2691E', '#8B4513'],
          style: { 
            borderWidth: 3, 
            borderColor: '#CD853F',
            shadowColor: '#D2691E',
            shadowOpacity: 0.7
          }
        };
      case 'brown_dwarf':
        return {
          colors: ['#D2691E', '#8B4513', '#654321'],
          style: { 
            borderWidth: 2, 
            borderColor: '#CD853F',
            shadowColor: '#D2691E',
            shadowOpacity: 0.9
          }
        };
      case 'red_dwarf':
        return {
          colors: ['#FF6347', '#FF4500', '#DC143C'],
          style: { 
            borderWidth: 3, 
            borderColor: '#FF6B6B',
            shadowColor: '#FF4500',
            shadowOpacity: 1.0
          }
        };
      case 'yellow_dwarf':
        return {
          colors: ['#FFD700', '#FFA500', '#FF8C00'],
          style: { 
            borderWidth: 3, 
            borderColor: '#FFD700',
            shadowColor: '#FFA500',
            shadowOpacity: 1.0
          }
        };
      case 'blue_giant':
        return {
          colors: ['#87CEEB', '#4169E1', '#0000FF'],
          style: { 
            borderWidth: 4, 
            borderColor: '#00BFFF',
            shadowColor: '#4169E1',
            shadowOpacity: 1.0
          }
        };
      case 'red_giant':
        return {
          colors: ['#FF6B6B', '#DC143C', '#B22222'],
          style: { 
            borderWidth: 4, 
            borderColor: '#FF4500',
            shadowColor: '#DC143C',
            shadowOpacity: 1.0
          }
        };
      case 'white_dwarf':
        return {
          colors: ['#F8F8FF', '#E6E6FA', '#D3D3D3'],
          style: { 
            borderWidth: 3, 
            borderColor: '#FFFFFF',
            shadowColor: '#F8F8FF',
            shadowOpacity: 1.0
          }
        };
      case 'neutron_star':
        return {
          colors: ['#C0C0C0', '#A9A9A9', '#808080'],
          style: { 
            borderWidth: 3, 
            borderColor: '#B0C4DE',
            shadowColor: '#C0C0C0',
            shadowOpacity: 1.0
          }
        };
      case 'pulsar':
        return {
          colors: ['#40E0D0', '#00CED1', '#008B8B'],
          style: { 
            borderWidth: 3, 
            borderColor: '#48D1CC',
            shadowColor: '#40E0D0',
            shadowOpacity: 1.0
          }
        };
      case 'stellar_black_hole':
      case 'intermediate_black_hole':
      case 'supermassive_black_hole':
      case 'galactic_center_black_hole':
      case 'primordial_black_hole':
      case 'quantum_black_hole':
      case 'exotic_black_hole':
      case 'multidimensional_black_hole':
      case 'cosmic_string_black_hole':
      case 'wormhole_black_hole':
      case 'phantom_black_hole':
      case 'vacuum_decay_black_hole':
      case 'infinite_density_black_hole':
        return {
          colors: ['#1a1a1a', '#000000', '#2F4F4F'],
          style: { 
            borderWidth: 4, 
            borderColor: planet.accent || '#9932CC',
            shadowColor: planet.accent || '#9932CC',
            shadowOpacity: 1.0
          }
        };
      case 'ultimate_black_hole':
        return {
          colors: ['#000000', '#000000', '#1a1a1a'],
          style: { 
            borderWidth: 5, 
            borderColor: '#301934',
            shadowColor: '#301934',
            shadowOpacity: 1.0
          }
        };
      default:
        return {
          colors: ['#C0C0C0', '#808080', '#404040'],
          style: { 
            borderWidth: 1, 
            borderColor: '#696969',
            shadowColor: '#808080',
            shadowOpacity: 0.5
          }
        };
    }
  };

  const gradient = getRealisticPlanetStyle();

  return (
    <View style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: gradient.colors[0],
      position: 'relative',
      overflow: 'hidden',
      ...gradient.style,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: planet.glow ? 12 : 8,
      elevation: planet.glow ? 10 : 6,
    }}>
      
      {/* Optimized gradient layers for realistic depth */}
      <View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: gradient.colors[1],
        opacity: 0.8,
      }} />
      
      {/* Core layer */}
      <View style={{
        position: 'absolute',
        top: size * 0.2,
        left: size * 0.2,
        width: size * 0.8,
        height: size * 0.8,
        borderRadius: size * 0.4,
        backgroundColor: gradient.colors[2],
        opacity: 0.6,
      }} />
      
      {/* Stellar illumination - realistic sun lighting */}
      <View style={{
        position: 'absolute',
        top: size * 0.08,
        left: size * 0.08,
        width: size * 0.4,
        height: size * 0.4,
        borderRadius: size * 0.2,
        backgroundColor: 'rgba(255,255,255,0.4)',
      }} />
      
      {/* Atmospheric glow for planets with atmosphere */}
      {planet.atmosphere && (
        <View style={{
          position: 'absolute',
          top: -size * 0.03,
          left: -size * 0.03,
          width: size * 1.06,
          height: size * 1.06,
          borderRadius: size * 0.53,
          backgroundColor: planet.atmosphere,
          opacity: 0.15,
        }} />
      )}
      
      {/* Planet-specific authentic features */}
      <AuthenticPlanetFeatures planet={planet} size={size} value={value} />
    </View>
  );
};

// Authentic planet-specific surface features based on real astronomy
const AuthenticPlanetFeatures = ({ planet, size, value }) => {
  switch (planet.type) {
    case 'mercury':
      return (
        <>
          {/* Impact craters like the real Mercury */}
          <View style={{
            position: 'absolute',
            width: size * 0.15,
            height: size * 0.15,
            backgroundColor: 'rgba(0,0,0,0.3)',
            borderRadius: size * 0.075,
            top: size * 0.3,
            left: size * 0.2,
          }} />
          <View style={{
            position: 'absolute',
            width: size * 0.1,
            height: size * 0.1,
            backgroundColor: 'rgba(0,0,0,0.25)',
            borderRadius: size * 0.05,
            top: size * 0.6,
            right: size * 0.25,
          }} />
        </>
      );
    
    case 'mars':
      return (
        <>
          {/* Polar ice caps */}
          <View style={{
            position: 'absolute',
            width: size * 0.25,
            height: size * 0.15,
            backgroundColor: 'rgba(255,255,255,0.9)',
            borderRadius: size * 0.075,
            top: size * 0.05,
            left: size * 0.375,
          }} />
          {/* Valles Marineris canyon system */}
          <View style={{
            position: 'absolute',
            width: size * 0.4,
            height: size * 0.05,
            backgroundColor: 'rgba(139,69,19,0.8)',
            borderRadius: size * 0.025,
            top: size * 0.45,
            left: size * 0.3,
          }} />
        </>
      );
    
    case 'earth':
      return (
        <>
          {/* Continents */}
          <View style={{
            position: 'absolute',
            width: size * 0.3,
            height: size * 0.25,
            backgroundColor: '#228B22',
            borderRadius: size * 0.1,
            top: size * 0.2,
            left: size * 0.1,
            opacity: 0.9,
          }} />
          <View style={{
            position: 'absolute',
            width: size * 0.25,
            height: size * 0.2,
            backgroundColor: '#228B22',
            borderRadius: size * 0.08,
            bottom: size * 0.15,
            right: size * 0.15,
            opacity: 0.9,
          }} />
          {/* Cloud formations */}
          <View style={{
            position: 'absolute',
            width: size * 0.4,
            height: size * 0.15,
            backgroundColor: 'rgba(255,255,255,0.6)',
            borderRadius: size * 0.075,
            top: size * 0.3,
            right: size * 0.1,
          }} />
        </>
      );
    
    case 'jupiter':
      return (
        <>
          {/* Atmospheric bands */}
          <View style={{
            position: 'absolute',
            width: size,
            height: size * 0.1,
            backgroundColor: 'rgba(139,69,19,0.6)',
            top: size * 0.25,
            left: 0,
          }} />
          <View style={{
            position: 'absolute',
            width: size,
            height: size * 0.08,
            backgroundColor: 'rgba(160,82,45,0.5)',
            top: size * 0.5,
            left: 0,
          }} />
          {/* The Great Red Spot */}
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
        </>
      );
    
    case 'saturn':
      return (
        <>
          {/* Famous ring system */}
          <View style={{
            position: 'absolute',
            width: size * 1.6,
            height: size * 1.6,
            borderRadius: size * 0.8,
            borderWidth: 3,
            borderColor: '#F0E68C',
            top: -size * 0.3,
            left: -size * 0.3,
            opacity: 0.8,
          }} />
          <View style={{
            position: 'absolute',
            width: size * 1.4,
            height: size * 1.4,
            borderRadius: size * 0.7,
            borderWidth: 2,
            borderColor: '#DAA520',
            top: -size * 0.2,
            left: -size * 0.2,
            opacity: 0.6,
          }} />
        </>
      );
    
    case 'uranus':
      return (
        <>
          {/* Vertical rings (unique to Uranus) */}
          <View style={{
            position: 'absolute',
            width: size * 0.05,
            height: size * 1.3,
            backgroundColor: 'rgba(224,255,255,0.6)',
            top: -size * 0.15,
            left: size * 0.475,
            opacity: 0.7,
          }} />
          <View style={{
            position: 'absolute',
            width: size * 0.03,
            height: size * 1.2,
            backgroundColor: 'rgba(224,255,255,0.4)',
            top: -size * 0.1,
            left: size * 0.55,
            opacity: 0.5,
          }} />
        </>
      );
    
    case 'neptune':
      return (
        <>
          {/* Dynamic atmospheric features */}
          <View style={{
            position: 'absolute',
            width: size * 0.2,
            height: size * 0.15,
            backgroundColor: 'rgba(0,0,139,0.8)',
            borderRadius: size * 0.1,
            top: size * 0.3,
            left: size * 0.4,
            opacity: 0.7,
          }} />
        </>
      );
    
    case 'venus':
      return (
        <>
          {/* Thick atmospheric layers */}
          <View style={{
            position: 'absolute',
            width: size * 0.8,
            height: size * 0.1,
            backgroundColor: 'rgba(255,255,153,0.5)',
            borderRadius: size * 0.05,
            top: size * 0.3,
            left: size * 0.1,
          }} />
          <View style={{
            position: 'absolute',
            width: size * 0.7,
            height: size * 0.08,
            backgroundColor: 'rgba(255,204,73,0.4)',
            borderRadius: size * 0.04,
            top: size * 0.6,
            left: size * 0.15,
          }} />
        </>
      );
    
    default:
      return null;
  }
};

// Helper component for orbiting moons
const OrbitingMoons = ({ planetSize, moonCount, rotationAnim }) => {
  return (
    <>
      {[...Array(moonCount)].map((_, index) => {
        const orbitRadius = planetSize * (0.65 + index * 0.2);
        const moonSize = planetSize * 0.12;
        const moonRotation = rotationAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [`${index * 120}deg`, `${index * 120 + 360}deg`],
        });

        return (
          <Animated.View
            key={index}
            style={{
              position: 'absolute',
              width: orbitRadius * 2,
              height: orbitRadius * 2,
              top: (CELL_SIZE - orbitRadius * 2) / 2,
              left: (CELL_SIZE - orbitRadius * 2) / 2,
              transform: [{ rotate: moonRotation }],
            }}
          >
            <View style={{
              position: 'absolute',
              width: moonSize,
              height: moonSize,
              borderRadius: moonSize / 2,
              backgroundColor: '#C0C0C0',
              borderWidth: 1,
              borderColor: '#E0E0E0',
              top: -moonSize / 2,
              left: orbitRadius - moonSize / 2,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.3,
              shadowRadius: 2,
              elevation: 3,
            }} />
          </Animated.View>
        );
      })}
    </>
  );
};

export default PlanetTile; 