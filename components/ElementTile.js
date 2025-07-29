/**
 * ===========================
 * ELEMENT TILE COMPONENT
 * ===========================
 * 
 * Displays basic elements (water, fire, earth, air, energy) that combine to form planets
 * Simple, clean design focused on the elemental symbols and colors
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { 
  getElementType, 
  CELL_SIZE,
  THEME
} from './constants';

const ElementTile = ({ value, isActive = true, pulseSpeed = 1 }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (isActive && value > 0) {
      // Gentle pulse animation for active elements
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 2000 / pulseSpeed,
            useNativeDriver: false,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2000 / pulseSpeed,
            useNativeDriver: false,
          }),
        ])
      );
      
      // Subtle glow effect
      const glowAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 3000,
            useNativeDriver: false,
          }),
        ])
      );
      
      pulseAnimation.start();
      glowAnimation.start();
      
      return () => {
        pulseAnimation.stop();
        glowAnimation.stop();
      };
    }
  }, [isActive, value, pulseSpeed, pulseAnim, glowAnim]);

  if (value === 0) {
    // Empty space cell
    return (
      <View style={{
        width: CELL_SIZE,
        height: CELL_SIZE,
        backgroundColor: THEME.DARK.BACKGROUND_PRIMARY,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: THEME.DARK.BORDER_COLOR + '30',
      }} />
    );
  }

  const element = getElementType(value);
  const elementSize = CELL_SIZE * 0.9;

  return (
    <View style={{
      width: CELL_SIZE,
      height: CELL_SIZE,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    }}>
      
      {/* Glow effect background */}
      <Animated.View style={{
        position: 'absolute',
        width: elementSize + 10,
        height: elementSize + 10,
        borderRadius: (elementSize + 10) / 2,
        backgroundColor: element.accent,
        opacity: glowAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.1, 0.3],
        }),
      }} />
      
      {/* Main element container */}
      <Animated.View style={{
        width: elementSize,
        height: elementSize,
        borderRadius: elementSize / 2,
        backgroundColor: element.primary,
        borderWidth: 3,
        borderColor: element.accent,
        justifyContent: 'center',
        alignItems: 'center',
        transform: [{ scale: pulseAnim }],
        shadowColor: element.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.6,
        shadowRadius: 8,
        elevation: 8,
      }}>
        
        {/* Element symbol */}
        <Text style={{
          fontSize: elementSize * 0.4,
          color: '#FFFFFF',
          fontWeight: 'bold',
          textAlign: 'center',
          textShadowColor: 'rgba(0,0,0,0.8)',
          textShadowOffset: { width: 1, height: 1 },
          textShadowRadius: 2,
        }}>
          {element.symbol}
        </Text>
        
        {/* Element name */}
        <Text style={{
          fontSize: elementSize * 0.12,
          color: '#FFFFFF',
          fontWeight: '600',
          textAlign: 'center',
          marginTop: 2,
          textShadowColor: 'rgba(0,0,0,0.8)',
          textShadowOffset: { width: 1, height: 1 },
          textShadowRadius: 2,
        }}>
          {element.name}
        </Text>
      </Animated.View>

      {/* Value display in corner */}
      <View style={{
        position: 'absolute',
        bottom: 2,
        right: 2,
        backgroundColor: 'rgba(0,0,0,0.7)',
        borderRadius: 8,
        paddingHorizontal: 4,
        paddingVertical: 2,
      }}>
        <Text style={{
          color: '#FFFFFF',
          fontSize: 10,
          fontWeight: 'bold',
        }}>
          {value}
        </Text>
      </View>
    </View>
  );
};

export default ElementTile; 