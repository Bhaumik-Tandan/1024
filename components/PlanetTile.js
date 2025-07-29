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

const PlanetTile = ({ value, isOrbiting = true, orbitSpeed = 1 }) => {
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const pulseOpacityAnim = useRef(new Animated.Value(0.3)).current;
  const pulseScaleAnim = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    if (isOrbiting && value > 0) {
      // Planet rotation animation - Slower for performance
      const rotationAnimation = Animated.loop(
        Animated.timing(rotationAnim, {
          toValue: 1,
          duration: 15000 / orbitSpeed, // Even slower for realistic effect
          useNativeDriver: false,
        })
      );
      
      // Stellar pulse for stars - Only for large celestial bodies
      const planet = getPlanetType(value);
      if (planet.glow && value >= 16384) { // Only pulse for stars and above
        // Opacity pulse - Less frequent for performance
        const opacityPulse = Animated.loop(
          Animated.sequence([
            Animated.timing(pulseOpacityAnim, {
              toValue: 0.7,
              duration: 4000, // Even slower pulse
              useNativeDriver: false,
            }),
            Animated.timing(pulseOpacityAnim, {
              toValue: 0.3,
              duration: 4000,
              useNativeDriver: false,
            }),
          ])
        );
        
        // Scale pulse - Less frequent for performance
        const scalePulse = Animated.loop(
          Animated.sequence([
            Animated.timing(pulseScaleAnim, {
              toValue: 1.03, // Very subtle scale change
              duration: 4000,
              useNativeDriver: false,
            }),
            Animated.timing(pulseScaleAnim, {
              toValue: 1,
              duration: 4000,
              useNativeDriver: false,
            }),
          ])
        );
        
        opacityPulse.start();
        scalePulse.start();
      }
      
      rotationAnimation.start();
      
      return () => {
        rotationAnimation.stop();
        if (planet.glow && value >= 16384) {
          pulseOpacityAnim.stopAnimation();
          pulseScaleAnim.stopAnimation();
        }
      };
    }
  }, [isOrbiting, orbitSpeed, value, rotationAnim, pulseOpacityAnim, pulseScaleAnim]);

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

  // Planet dimensions
  const planetSize = CELL_SIZE * 0.85;

  return (
    <View style={{
      width: CELL_SIZE,
      height: CELL_SIZE,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    }}>
      
      {/* Main Planet Container */}
      <Animated.View style={{
        width: planetSize,
        height: planetSize,
        justifyContent: 'center',
        alignItems: 'center',
        transform: [
          { rotate: rotation },
          { scale: pulseScaleAnim }
        ],
        shadowColor: planet.glow ? planet.primary : '#000',
        shadowOffset: { width: 0, height: planet.glow ? 0 : 4 },
        shadowOpacity: planet.glow ? 0.6 : 0.3,
        shadowRadius: planet.glow ? 12 : 6,
        elevation: planet.glow ? 10 : 6,
      }}>
        
        {/* Enhanced Planet with Realistic Gradients */}
        <RealisticPlanet 
          planet={planet} 
          size={planetSize} 
          value={value}
          pulseScaleAnim={pulseScaleAnim}
        />
        
        {/* Stellar glow for stars */}
        {planet.glow && value >= 16384 && (
          <Animated.View style={{
            position: 'absolute',
            width: planetSize + 12,
            height: planetSize + 12,
            borderRadius: (planetSize + 12) / 2,
            borderWidth: 2,
            borderColor: planet.accent,
            opacity: pulseOpacityAnim,
          }} />
        )}
      </Animated.View>

      {/* Orbiting Moons for planets that have them */}
      {planet.moons > 0 && value < 16384 && (
        <OrbitingMoons 
          planetSize={planetSize}
          moonCount={Math.min(planet.moons, 2)} // Max 2 visible moons for performance
          rotationAnim={rotationAnim}
        />
      )}

      {/* Value display in corner for identification */}
      <View style={{
        position: 'absolute',
        bottom: 2,
        right: 2,
        backgroundColor: 'rgba(0,0,0,0.7)',
        borderRadius: 8,
        paddingHorizontal: 4,
        paddingVertical: 2,
        minWidth: 20,
      }}>
        <Text style={{
          color: '#FFFFFF',
          fontSize: Math.max(8, planetSize * 0.12),
          fontWeight: 'bold',
          textAlign: 'center',
        }}>
          {value >= 1000 ? `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}K` : value}
        </Text>
      </View>
    </View>
  );
};

// Realistic Planet component using gradients and styling
const RealisticPlanet = ({ planet, size, value, pulseScaleAnim }) => {
  const getRadialGradient = () => {
    switch (planet.type) {
      case 'asteroid':
        return {
          colors: ['#B5B5B5', '#8A8A8A', '#5F5F5F'],
          style: { 
            borderWidth: 2, 
            borderColor: '#7A7A7A',
            shadowColor: '#666',
            shadowOpacity: 0.4
          }
        };
      case 'mars':
        return {
          colors: ['#FF9A7B', '#E74C3C', '#C0392B'],
          style: { 
            borderWidth: 3, 
            borderColor: '#A93226',
            shadowColor: '#E74C3C',
            shadowOpacity: 0.6
          }
        };
      case 'venus':
        return {
          colors: ['#FFF5DC', '#FFD700', '#FF8C00'],
          style: { 
            borderWidth: 3, 
            borderColor: '#DAA520',
            shadowColor: '#FFD700',
            shadowOpacity: 0.7
          }
        };
      case 'earth':
        return {
          colors: ['#87CEEB', '#4682B4', '#2F4F4F'],
          style: { 
            borderWidth: 3, 
            borderColor: '#5F9EA0',
            shadowColor: '#4682B4',
            shadowOpacity: 0.8
          }
        };
      case 'neptune':
        return {
          colors: ['#B0E0E6', '#4169E1', '#191970'],
          style: { 
            borderWidth: 3, 
            borderColor: '#6495ED',
            shadowColor: '#4169E1',
            shadowOpacity: 0.7
          }
        };
      case 'uranus':
        return {
          colors: ['#E0FFFF', '#AFEEEE', '#48D1CC'],
          style: { 
            borderWidth: 3, 
            borderColor: '#40E0D0',
            shadowColor: '#48D1CC',
            shadowOpacity: 0.6
          }
        };
      case 'saturn':
        return {
          colors: ['#FFFACD', '#F0E68C', '#DAA520'],
          style: { 
            borderWidth: 4, 
            borderColor: '#FFD700',
            shadowColor: '#DAA520',
            shadowOpacity: 0.8
          }
        };
      case 'jupiter':
        return {
          colors: ['#DEB887', '#CD853F', '#8B4513'],
          style: { 
            borderWidth: 3, 
            borderColor: '#A0522D',
            shadowColor: '#CD853F',
            shadowOpacity: 0.7
          }
        };
      case 'brown_dwarf':
        return {
          colors: ['#D2691E', '#A0522D', '#654321'],
          style: { 
            borderWidth: 4, 
            borderColor: '#8B4513',
            shadowColor: '#A0522D',
            shadowOpacity: 0.8
          }
        };
      case 'red_dwarf':
        return {
          colors: ['#FFB6C1', '#FF6347', '#DC143C'],
          style: { 
            borderWidth: 4, 
            borderColor: '#FF4500',
            shadowColor: '#FF6347',
            shadowOpacity: 0.9
          }
        };
      case 'white_dwarf':
        return {
          colors: ['#FFFFFF', '#F8F8FF', '#E6E6FA'],
          style: { 
            borderWidth: 4, 
            borderColor: '#D8BFD8',
            shadowColor: '#FFFFFF',
            shadowOpacity: 0.9
          }
        };
      case 'neutron_star':
        return {
          colors: ['#E6E6FA', '#DDA0DD', '#9370DB'],
          style: { 
            borderWidth: 4, 
            borderColor: '#BA55D3',
            shadowColor: '#DDA0DD',
            shadowOpacity: 0.9
          }
        };
      case 'black_hole':
        return {
          colors: ['#4B0082', '#2F0040', '#000000'],
          style: { 
            borderWidth: 4, 
            borderColor: '#8A2BE2',
            shadowColor: '#4B0082',
            shadowOpacity: 1.0
          }
        };
      default:
        return {
          colors: [planet.primary, planet.accent || planet.primary, '#333'],
          style: { 
            borderWidth: 2, 
            borderColor: planet.accent || planet.primary,
            shadowColor: planet.primary,
            shadowOpacity: 0.5
          }
        };
    }
  };

  const gradient = getRadialGradient();

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
      
      {/* Enhanced gradient layers for more depth */}
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
      
      <View style={{
        position: 'absolute',
        top: size * 0.25,
        left: size * 0.25,
        width: size * 0.75,
        height: size * 0.75,
        borderRadius: size * 0.375,
        backgroundColor: gradient.colors[2],
        opacity: 0.6,
      }} />
      
      {/* Enhanced highlight for better 3D effect */}
      <View style={{
        position: 'absolute',
        top: size * 0.08,
        left: size * 0.08,
        width: size * 0.45,
        height: size * 0.45,
        borderRadius: size * 0.225,
        backgroundColor: 'rgba(255,255,255,0.4)',
      }} />
      
      {/* Secondary highlight for realism */}
      <View style={{
        position: 'absolute',
        top: size * 0.15,
        left: size * 0.15,
        width: size * 0.25,
        height: size * 0.25,
        borderRadius: size * 0.125,
        backgroundColor: 'rgba(255,255,255,0.2)',
      }} />
      
      {/* Planet-specific features */}
      <PlanetFeatures planet={planet} size={size} value={value} pulseScaleAnim={pulseScaleAnim} />
    </View>
  );
};

// Planet-specific surface features
const PlanetFeatures = ({ planet, size, value, pulseScaleAnim }) => {
  switch (planet.type) {
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
          {/* Clouds */}
          <View style={{
            position: 'absolute',
            width: size * 0.4,
            height: size * 0.15,
            backgroundColor: 'rgba(255,255,255,0.4)',
            borderRadius: size * 0.075,
            top: size * 0.3,
            right: size * 0.1,
          }} />
        </>
      );
    
    case 'mars':
      return (
        <>
          {/* Polar ice cap */}
          <View style={{
            position: 'absolute',
            width: size * 0.2,
            height: size * 0.15,
            backgroundColor: 'rgba(255,255,255,0.8)',
            borderRadius: size * 0.075,
            top: size * 0.05,
            left: size * 0.4,
          }} />
          {/* Surface features */}
          <View style={{
            position: 'absolute',
            width: size * 0.15,
            height: size * 0.1,
            backgroundColor: '#A0522D',
            borderRadius: size * 0.05,
            top: size * 0.4,
            left: size * 0.2,
            opacity: 0.7,
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
          {/* Great Red Spot */}
          <Animated.View style={{
            position: 'absolute',
            width: size * 0.25,
            height: size * 0.15,
            backgroundColor: '#DC143C',
            borderRadius: size * 0.125,
            top: size * 0.4,
            left: size * 0.3,
            opacity: 0.9,
            transform: [{ scale: pulseScaleAnim }],
          }} />
        </>
      );
    
    case 'saturn':
      return (
        <>
          {/* Rings */}
          <View style={{
            position: 'absolute',
            width: size * 1.6,
            height: size * 1.6,
            borderRadius: size * 0.8,
            borderWidth: 3,
            borderColor: '#DDD',
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
            borderColor: '#CCC',
            top: -size * 0.2,
            left: -size * 0.2,
            opacity: 0.6,
          }} />
        </>
      );
    
    case 'black_hole':
      return (
        <>
          {/* Event horizon */}
          <View style={{
            position: 'absolute',
            width: size * 0.5,
            height: size * 0.5,
            borderRadius: size * 0.25,
            backgroundColor: '#000000',
            top: size * 0.25,
            left: size * 0.25,
          }} />
          {/* Accretion disk */}
          <View style={{
            position: 'absolute',
            width: size * 1.3,
            height: size * 1.3,
            borderRadius: size * 0.65,
            borderWidth: 2,
            borderColor: '#FF4500',
            top: -size * 0.15,
            left: -size * 0.15,
            opacity: 0.7,
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