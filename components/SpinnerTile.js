/**
 * ===========================
 * REALISTIC FIDGET SPINNER COMPONENT
 * ===========================
 * 
 * High-quality fidget spinner with visible arms, metallic materials, and premium effects
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { 
  getSpinnerMaterial, 
  CELL_SIZE,
  THEME
} from './constants';

const SpinnerTile = ({ value, isSpinning = true, spinSpeed = 1 }) => {
  const rotationAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (isSpinning && value > 0) {
      // Continuous spinning animation
      const animation = Animated.loop(
        Animated.timing(rotationAnim, {
          toValue: 1,
          duration: 3000 / spinSpeed, // Adjust speed based on prop
          useNativeDriver: false, // JS driver for consistency
        })
      );
      
      animation.start();
      
      return () => animation.stop();
    }
  }, [isSpinning, spinSpeed, value, rotationAnim]);

  if (value === 0) {
    // Empty cell - workshop grid style
    return (
      <View style={{
        width: CELL_SIZE,
        height: CELL_SIZE,
        backgroundColor: THEME.DARK.BACKGROUND_BOARD,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: THEME.DARK.BORDER_COLOR + '40',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 2,
      }} />
    );
  }

  const material = getSpinnerMaterial(value);
  const rotation = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Spinner dimensions
  const spinnerSize = CELL_SIZE * 0.9;
  const armLength = spinnerSize * 0.4;
  const armWidth = spinnerSize * 0.12;
  const bearingSize = spinnerSize * 0.25;
  const weightSize = armWidth * 1.2;

  return (
    <View style={{
      width: CELL_SIZE,
      height: CELL_SIZE,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    }}>
      
      {/* Outer glow for premium materials */}
      {material.glow && (
        <View style={{
          position: 'absolute',
          width: spinnerSize + 8,
          height: spinnerSize + 8,
          borderRadius: (spinnerSize + 8) / 2,
          backgroundColor: material.primary,
          opacity: 0.3,
          shadowColor: material.primary,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.6,
          shadowRadius: 8,
          elevation: 8,
        }} />
      )}

      {/* Main Spinner Container */}
      <View style={{
        width: spinnerSize,
        height: spinnerSize,
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
      }}>

        {/* Rotating Spinner Arms */}
        <Animated.View
          style={{
            width: spinnerSize,
            height: spinnerSize,
            position: 'absolute',
            transform: [{ rotate: rotation }],
          }}
        >
          {/* Three spinner arms at 120-degree intervals */}
          {[0, 1, 2].map((armIndex) => (
            <View key={armIndex} style={{
              position: 'absolute',
              width: spinnerSize,
              height: spinnerSize,
              top: 0,
              left: 0,
            }}>
              {/* Spinner Arm */}
              <View style={{
                position: 'absolute',
                width: armLength,
                height: armWidth,
                backgroundColor: material.primary,
                borderRadius: armWidth / 2,
                top: (spinnerSize - armWidth) / 2,
                left: (spinnerSize - armLength) / 2,
                transform: [{ rotate: `${armIndex * 120}deg` }],
                // Metallic gradient effect using borders
                borderTopColor: material.accent,
                borderBottomColor: material.primary,
                borderLeftColor: material.accent,
                borderRightColor: material.primary,
                borderWidth: 1,
                shadowColor: '#000',
                shadowOffset: { width: 1, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 3,
                elevation: 4,
              }} />
              
              {/* End Weight/Ball */}
              <View style={{
                position: 'absolute',
                width: weightSize,
                height: weightSize,
                backgroundColor: material.primary,
                borderRadius: weightSize / 2,
                top: (spinnerSize - weightSize) / 2,
                left: spinnerSize - weightSize - 8,
                transform: [{ rotate: `${armIndex * 120}deg` }],
                borderColor: material.accent,
                borderWidth: 1,
                shadowColor: '#000',
                shadowOffset: { width: 1, height: 2 },
                shadowOpacity: 0.4,
                shadowRadius: 3,
                elevation: 5,
              }} />
            </View>
          ))}
        </Animated.View>

        {/* Center Bearing (stationary) */}
        <View style={{
          position: 'absolute',
          width: bearingSize,
          height: bearingSize,
          borderRadius: bearingSize / 2,
          backgroundColor: material.bearing,
          top: (spinnerSize - bearingSize) / 2,
          left: (spinnerSize - bearingSize) / 2,
          borderWidth: 2,
          borderColor: material.accent,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.5,
          shadowRadius: 4,
          elevation: 6,
          // Inner ring effect
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {/* Inner bearing ring */}
          <View style={{
            width: bearingSize * 0.6,
            height: bearingSize * 0.6,
            borderRadius: (bearingSize * 0.6) / 2,
            borderWidth: 1,
            borderColor: material.primary + '80',
          }} />
        </View>

        {/* Number display in center bearing */}
        <View style={{
          position: 'absolute',
          width: bearingSize,
          height: bearingSize,
          top: (spinnerSize - bearingSize) / 2,
          left: (spinnerSize - bearingSize) / 2,
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
        }}>
          <Text style={{
            color: '#FFFFFF',
            fontSize: Math.max(bearingSize * 0.25, 10),
            fontWeight: 'bold',
            textAlign: 'center',
            textShadowColor: 'rgba(0,0,0,0.8)',
            textShadowOffset: { width: 1, height: 1 },
            textShadowRadius: 2,
          }}>
            {value >= 1000 ? `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}K` : value}
          </Text>
        </View>

        {/* Special effects for legendary materials */}
        {material.special && (
          <SpecialEffect effect={material.special} size={spinnerSize} color={material.primary} />
        )}
      </View>
    </View>
  );
};

// Special effect component for legendary materials
const SpecialEffect = ({ effect, size, color }) => {
  const effectAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(effectAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(effectAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    );
    
    animation.start();
    return () => animation.stop();
  }, [effectAnim]);

  if (effect === 'rainbow_shift') {
    // Rainbow color cycling effect
    const backgroundColor = effectAnim.interpolate({
      inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1],
      outputRange: ['#FF0000', '#FF8000', '#FFFF00', '#00FF00', '#0080FF', '#FF0080'],
    });

    return (
      <Animated.View style={{
        position: 'absolute',
        width: size + 4,
        height: size + 4,
        borderRadius: (size + 4) / 2,
        borderWidth: 2,
        borderColor: backgroundColor,
        top: -2,
        left: -2,
        opacity: 0.6,
      }} />
    );
  }

  if (effect === 'plasma_pulse') {
    // Pulsing plasma effect
    const scale = effectAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.1],
    });

    const opacity = effectAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.3, 0.7, 0.3],
    });

    return (
      <Animated.View style={{
        position: 'absolute',
        width: size + 6,
        height: size + 6,
        borderRadius: (size + 6) / 2,
        backgroundColor: color,
        top: -3,
        left: -3,
        opacity: opacity,
        transform: [{ scale }],
        zIndex: -1,
      }} />
    );
  }

  return null;
};

export default SpinnerTile; 