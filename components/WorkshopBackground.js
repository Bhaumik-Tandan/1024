/**
 * ===========================
 * PREMIUM WORKSHOP BACKGROUND
 * ===========================
 * 
 * Realistic workshop environment with proper lighting, materials, and depth
 */

import React from 'react';
import { View, Dimensions } from 'react-native';
import { THEME } from './constants';

const { width, height } = Dimensions.get('window');

const WorkshopBackground = () => {
  return (
    <View style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: THEME.DARK.BACKGROUND_PRIMARY,
    }}>
      
      {/* Workshop ceiling lighting effect */}
      <View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: height * 0.3,
        background: `linear-gradient(180deg, ${THEME.DARK.WORKSHOP_LIGHT}20 0%, transparent 100%)`,
        opacity: 0.3,
      }} />
      
      {/* Workbench surface gradient */}
      <View style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: height * 0.7,
        backgroundColor: THEME.DARK.BACKGROUND_BOARD,
        // Subtle wood grain texture effect
        backgroundImage: `repeating-linear-gradient(
          90deg,
          ${THEME.DARK.WORKBENCH_WOOD}10 0px,
          transparent 1px,
          transparent 3px,
          ${THEME.DARK.WORKBENCH_WOOD}05 4px
        )`,
      }} />
      
      {/* Workshop tools/equipment silhouettes in corners */}
      <View style={{
        position: 'absolute',
        top: height * 0.1,
        right: 20,
        width: 60,
        height: 80,
        backgroundColor: THEME.DARK.STEEL_FRAME,
        opacity: 0.15,
        borderRadius: 8,
        transform: [{ rotate: '15deg' }],
      }} />
      
      <View style={{
        position: 'absolute',
        top: height * 0.15,
        left: 30,
        width: 40,
        height: 60,
        backgroundColor: THEME.DARK.TOOL_METAL,
        opacity: 0.1,
        borderRadius: 20,
        transform: [{ rotate: '-10deg' }],
      }} />
      
      {/* Subtle grid pattern on workbench */}
      <View style={{
        position: 'absolute',
        bottom: height * 0.2,
        left: 0,
        right: 0,
        height: height * 0.5,
        backgroundImage: `
          repeating-linear-gradient(
            0deg,
            ${THEME.DARK.GRID_LINE} 0px,
            transparent 1px,
            transparent 40px,
            ${THEME.DARK.GRID_LINE} 41px
          ),
          repeating-linear-gradient(
            90deg,
            ${THEME.DARK.GRID_LINE} 0px,
            transparent 1px,
            transparent 40px,
            ${THEME.DARK.GRID_LINE} 41px
          )
        `,
        opacity: 0.3,
      }} />
      
      {/* Ambient workshop lighting spots */}
      {[...Array(3)].map((_, index) => (
        <View
          key={index}
          style={{
            position: 'absolute',
            top: height * 0.2 + index * 100,
            left: (width / 4) * (index + 1),
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: THEME.DARK.NEON_GLOW,
            opacity: 0.03,
          }}
        />
      ))}
    </View>
  );
};

export default WorkshopBackground; 