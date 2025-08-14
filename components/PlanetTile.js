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
  const pulseOpacityAnim = useRef(new Animated.Value(0.8)).current; // Start higher to avoid flickering
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
      
      // Only add subtle stellar pulse for very large celestial bodies (less aggressive)
      const planet = getPlanetType(value);
      if (planet.glow && value >= 32768) {
        const opacityPulse = Animated.loop(
          Animated.sequence([
            Animated.timing(pulseOpacityAnim, {
              toValue: 0.9, // Smaller range to prevent flickering
              duration: 4000, // Slower pulse
              useNativeDriver: true,
            }),
            Animated.timing(pulseOpacityAnim, {
              toValue: 0.7, // Higher minimum to prevent brightness drops
              duration: 4000, // Slower pulse
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
    // Empty space cell - completely transparent to remove grid appearance
    return (
      <View style={{
        width: CELL_SIZE,
        height: CELL_SIZE,
        backgroundColor: 'transparent',
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

      {/* Circular clipping mask for text container */}
      <View style={{
        position: 'absolute',
        width: planetSize,
        height: planetSize,
        borderRadius: planetSize / 2,
        overflow: 'hidden', // Clip content at planet circumference
      }}>
        {/* Planet name and value display - Optimized layout with better proportions */}
        <View style={{
          position: 'absolute',
          bottom: -2,  // Move even lower to the very bottom
          left: -18,   // Keep full width extension
          right: -18,  // Keep full width extension
          height: planetSize * 0.55, // Keep reduced height for better proportions
          backgroundColor: 'rgba(0,0,0,0.8)',
          borderTopLeftRadius: planetSize * 0.3,  // Adjust curve for new height
          borderTopRightRadius: planetSize * 0.3, // Adjust curve for new height
          paddingHorizontal: 16,
          paddingTop: 6,  // Further reduced top padding
          paddingBottom: 4,  // Further reduced bottom padding
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.2)',
          justifyContent: 'flex-end', // Push content to bottom
          alignItems: 'center',
        }}>
        <Text style={{
          color: '#FFFFFF',
          fontSize: Math.max(10, planetSize * 0.12), // Slightly smaller font
          fontWeight: 'bold',
          textAlign: 'center',
          textShadowColor: 'rgba(0,0,0,0.9)',
          textShadowOffset: { width: 1, height: 1 },
          textShadowRadius: 2,
          marginBottom: 1, // Minimal space between name and number
        }} numberOfLines={1}>
          {planet.name}
        </Text>
        <Text style={{
          color: '#FFD700',
          fontSize: Math.max(13, planetSize * 0.16), // Slightly smaller font
          fontWeight: 'bold',
          textAlign: 'center',
          textShadowColor: 'rgba(0,0,0,0.9)',
          textShadowOffset: { width: 1, height: 1 },
          textShadowRadius: 2,
          flex: 0, // Prevent text from expanding
          marginBottom: 0, // Remove any bottom margin
        }} numberOfLines={1} adjustsFontSizeToFit={true} minimumFontScale={0.7}>
          {value}
        </Text>
        </View>
      </View>
      
      {/* Infinity Symbol Overlay for Ultimate Black Hole */}
      {value === 8388608 && (
        <View style={{
          position: 'absolute',
          top: -planetSize * 0.3,
          left: 0,
          right: 0,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Text style={{
            color: '#FFD700',
            fontSize: planetSize * 0.4,
            fontWeight: 'bold',
            textAlign: 'center',
            textShadowColor: 'rgba(0,0,0,0.9)',
            textShadowOffset: { width: 2, height: 2 },
            textShadowRadius: 4,
            elevation: 10,
          }}>
            ∞
          </Text>
        </View>
      )}
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
      case 'pluto':
        return {
          colors: ['#8DA3B0', '#6B7D87', '#4A5D6B'], // Darker, muted icy blue-gray
          style: { 
            borderWidth: 2, 
            borderColor: '#5C7A89',
            shadowColor: '#6B7D87',
            shadowOpacity: 0.5
          }
        };
      case 'moon':
        return {
          colors: ['#C5B89A', '#A69B85', '#8B7F6B'], // Darker, muted lunar beige
          style: { 
            borderWidth: 2, 
            borderColor: '#9A8E78',
            shadowColor: '#A69B85',
            shadowOpacity: 0.4
          }
        };
      case 'mercury':
        return {
          colors: ['#8B6F3D', '#6B5328', '#4A3B1F'], // Much darker, muted brownish
          style: { 
            borderWidth: 2, 
            borderColor: '#7A5F32',
            shadowColor: '#6B5328',
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
          colors: ['#4169E1', '#0000FF', '#191970'],
          style: { 
            borderWidth: 2, 
            borderColor: '#87CEEB',
            shadowColor: '#4169E1',
            shadowOpacity: 0.8
          }
        };
      case 'uranus':
        return {
          colors: ['#4FD0E3', '#48CAE4', '#0077BE'],
          style: { 
            borderWidth: 2, 
            borderColor: '#90E0EF',
            shadowColor: '#4FD0E3',
            shadowOpacity: 0.7
          }
        };
      case 'saturn':
        return {
          colors: ['#FFEAA7', '#FAD5A5', '#DDB892'],
          style: { 
            borderWidth: 3, 
            borderColor: '#F4D03F',
            shadowColor: '#FFEAA7',
            shadowOpacity: 0.8
          }
        };
      case 'jupiter':
        return {
          colors: ['#FF8C42', '#FF7538', '#E76F51'],
          style: { 
            borderWidth: 3, 
            borderColor: '#FFA500',
            shadowColor: '#FF8C42',
            shadowOpacity: 0.9
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

  // Normal planet rendering
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