/**
 * ElementTile component - Now redirects to PlanetTile since we only have planets!
 * All values are now planets, no more elements
 */

import React, { useRef, useEffect } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { THEME, FONT_SIZES, getPlanetType } from './constants';
import PlanetTile from './PlanetTile';

/**
 * ElementTile component - Now redirects to PlanetTile since we only have planets!
 * All values are now planets, no more elements
 */
const ElementTile = ({ value, size, style, position, animatedStyle, onPress, isPaused }) => {
  // Since we only have planets now, redirect everything to PlanetTile
  return (
    <PlanetTile 
      value={value}
      size={size}
      style={style}
      position={position}
      animatedStyle={animatedStyle}
      onPress={onPress}
      isPaused={isPaused}
    />
  );
};

export default ElementTile; 