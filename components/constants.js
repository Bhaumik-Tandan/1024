/**
 * ===========================
 * VISUAL CONSTANTS & UI CONFIG
 * ===========================
 * 
 * This file contains all visual styling constants and UI configuration
 * Game logic constants are now in GameRules.js for better organization
 */

import { Dimensions } from 'react-native';
import { GAME_CONFIG } from './GameRules';

// Import game dimensions from rules
export const COLS = GAME_CONFIG.BOARD.COLS;
export const ROWS = GAME_CONFIG.BOARD.ROWS;

// UI Layout Constants
export const { width, height } = Dimensions.get('window');
export const CELL_MARGIN = Math.max(2, Math.floor(width * 0.008)); // Smaller margin for more space
export const CELL_SIZE = Math.floor((width - 40 - (COLS - 1) * CELL_MARGIN) / COLS); // Use more screen width

/**
 * Calculate cell positions on screen
 */
export const getCellLeft = (col) => col * (CELL_SIZE + CELL_MARGIN);
export const getCellTop = (row) => row * (CELL_SIZE + CELL_MARGIN);

/**
 * Tile color scheme - Vibrant, modern colors inspired by popular mobile games
 */
export const COLORS = {
  // Empty cell
  0: '#2c2c2c',
  
  // Small values (common) - warm, inviting colors
  2: '#FFE0B2',      // Light peach
  4: '#FFCC80',      // Peach
  8: '#FFB74D',      // Orange
  16: '#FF9800',     // Vibrant orange
  32: '#FF7043',     // Red-orange
  
  // Medium values - vibrant colors
  64: '#FFEB3B',     // Bright yellow
  128: '#CDDC39',    // Lime green
  256: '#8BC34A',    // Green
  512: '#4CAF50',    // Material green
  
  // High values - rich, exciting colors
  1024: '#009688',   // Teal (special milestone)
  2048: '#00BCD4',   // Cyan
  4096: '#03A9F4',   // Blue
  8192: '#2196F3',   // Material blue
  
  // Ultra high values - premium colors
  16384: '#3F51B5',  // Indigo
  32768: '#673AB7',  // Deep purple
  65536: '#9C27B0',  // Purple
  131072: '#E91E63', // Pink
  262144: '#F44336', // Red
  524288: '#FF5722', // Deep orange
  1048576: '#795548', // Brown (1M milestone)
  2097152: '#607D8B' // Blue grey
};

/**
 * Enhanced gradient colors for tiles - creates depth and visual appeal
 */
export const TILE_GRADIENTS = {
  2: ['#FFE0B2', '#FFCC80'],
  4: ['#FFCC80', '#FFB74D'],
  8: ['#FFB74D', '#FF9800'],
  16: ['#FF9800', '#FF7043'],
  32: ['#FF7043', '#F44336'],
  
  64: ['#FFEB3B', '#FFC107'],
  128: ['#CDDC39', '#8BC34A'],
  256: ['#8BC34A', '#4CAF50'],
  512: ['#4CAF50', '#2E7D32'],
  
  1024: ['#26C6DA', '#00ACC1'], // Special teal gradient for 1024
  2048: ['#29B6F6', '#0288D1'],
  4096: ['#42A5F5', '#1976D2'],
  8192: ['#5C6BC0', '#3949AB'],
  
  16384: ['#7E57C2', '#5E35B1'],
  32768: ['#AB47BC', '#8E24AA'],
  65536: ['#EC407A', '#D81B60'],
  131072: ['#EF5350', '#E53935'],
  262144: ['#FF7043', '#F4511E'],
  524288: ['#A1887F', '#6D4C41'],
  1048576: ['#FFD700', '#FFC107'], // Gold gradient for 1M milestone
  2097152: ['#90A4AE', '#546E7A']
};

/**
 * Special milestone tiles that get crown icons and star effects
 */
export const MILESTONE_TILES = [1024, 1048576]; // 1K and 1M

/**
 * Get tile styling with gradients and special effects
 */
export const getTileStyle = (value) => {
  const baseStyle = {
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  };

  if (TILE_GRADIENTS[value]) {
    const [startColor, endColor] = TILE_GRADIENTS[value];
    return {
      ...baseStyle,
      backgroundColor: startColor,
      // For gradient effect, we'll use a combination approach
      borderColor: endColor,
      borderWidth: 2,
    };
  }

  return {
    ...baseStyle,
    backgroundColor: COLORS[value] || '#3c3a32',
  };
};

/**
 * Get tile color (fallback for basic usage)
 */
export const getTileColor = (value) => {
  // For milestone tiles, use gradient start color
  if (TILE_GRADIENTS[value]) {
    return TILE_GRADIENTS[value][0];
  }
  
  // Return predefined color if it exists
  if (COLORS[value]) {
    return COLORS[value];
  }
  
  // For ultra-high values beyond our definitions, generate a vibrant color
  const hue = (Math.log2(value) * 45) % 360; // More color variation
  const saturation = Math.min(90, 70 + (Math.log2(value) * 2)); // Higher saturation
  const lightness = Math.max(40, 65 - (Math.log2(value) * 1.5)); // Better contrast
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

/**
 * Check if a tile is a milestone tile that should have special effects
 */
export const isMilestoneTile = (value) => {
  return MILESTONE_TILES.includes(value);
};

/**
 * Get special tile decoration (crown, stars, etc.)
 */
export const getTileDecoration = (value) => {
  if (value === 1048576) { // 1M
    return { type: 'crown', stars: true };
  }
  if (value === 1024) { // 1K
    return { type: 'crown', stars: false };
  }
  if (value >= 524288) { // High value tiles get stars
    return { type: 'stars', stars: true };
  }
  return null;
};

/**
 * Get appropriate text color for tile background
 */
export const getTextColor = (value) => {
  return '#fff';  // Always use white text for consistency
};

/**
 * UI Layout Dimensions
 */
export const UI_CONFIG = {
  // Spacing
  BOARD_PADDING: 8,
  HEADER_HEIGHT: 80,
  FOOTER_HEIGHT: 40,
  
  // Board dimensions
  BOARD_WIDTH: width - 20,
  GRID_WIDTH: COLS * CELL_SIZE + (COLS - 1) * CELL_MARGIN,
  GRID_HEIGHT: ROWS * CELL_SIZE + (ROWS - 1) * CELL_MARGIN,
  
  // Animation settings
  BORDER_RADIUS: {
    SMALL: 4,
    MEDIUM: 8,
    LARGE: 12,
  },
  
  // Z-index layers
  Z_INDEX: {
    BACKGROUND: 0,
    BOARD: 1,
    TILES: 5,
    FALLING_TILE: 10,
    MERGE_ANIMATION: 15,
    MERGE_RESULT: 20,
    OVERLAY: 100,
    MODAL: 1000,
  },
};

/**
 * Theme colors for the game
 */
export const THEME = {
  // Background colors
  BACKGROUND_PRIMARY: '#2d2d2d',
  BACKGROUND_SECONDARY: '#1a1a1a',
  BACKGROUND_BOARD: '#2c2c2c',
  
  // Text colors
  TEXT_PRIMARY: '#ffffff',
  TEXT_SECONDARY: '#aaaaaa',
  TEXT_ACCENT: '#ffd700',
  
  // UI element colors
  BORDER_COLOR: '#444444',
  SHADOW_COLOR: '#000000',
  SUCCESS_COLOR: '#4CAF50',
  WARNING_COLOR: '#FF9800',
  ERROR_COLOR: '#F44336',
  
  // Header box colors
  SCORE_BOX: '#2a2a2a',
  RECORD_BOX: '#4a90e2',
  RANK_BOX: '#444444',
  COINS_BOX: '#2a2a2a',
};

/**
 * Animation configuration
 */
export const ANIMATION_CONFIG = {
  // Easing functions
  EASING: {
    EASE_OUT: 'ease-out',
    EASE_IN: 'ease-in',
    BOUNCE: 'bounce',
  },
  
  // Common animation durations (from GameRules) - Faster for better responsiveness
  DURATION: {
    FAST: 100,
    NORMAL: 180,
    SLOW: 350,
    FALL: GAME_CONFIG.TIMING.SLOW_FALL_DURATION,
    FAST_DROP: GAME_CONFIG.TIMING.FAST_DROP_DURATION,
  },
  
  // Scale factors for animations
  SCALE: {
    SHRINK: 0.8,
    NORMAL: 1.0,
    GROW: 1.2,
    BOUNCE: 1.3,
  },
};

/**
 * Responsive breakpoints
 */
export const BREAKPOINTS = {
  SMALL_PHONE: 320,
  PHONE: 375,
  LARGE_PHONE: 414,
  TABLET: 768,
  LARGE_TABLET: 1024,
};

/**
 * Get responsive value based on screen size
 */
export const getResponsiveValue = (small, medium, large) => {
  if (width <= BREAKPOINTS.PHONE) return small;
  if (width <= BREAKPOINTS.LARGE_PHONE) return medium;
  return large;
};

/**
 * Font sizes that scale with screen size
 */
export const FONT_SIZES = {
  TINY: getResponsiveValue(10, 11, 12),
  SMALL: getResponsiveValue(12, 13, 14),
  MEDIUM: getResponsiveValue(14, 16, 18),
  LARGE: getResponsiveValue(18, 20, 22),
  XLARGE: getResponsiveValue(22, 24, 26),
  XXLARGE: getResponsiveValue(28, 32, 36),
};

export default {
  COLS,
  ROWS,
  CELL_MARGIN,
  CELL_SIZE,
  getCellLeft,
  getCellTop,
  COLORS,
  getTextColor,
  UI_CONFIG,
  THEME,
  ANIMATION_CONFIG,
  BREAKPOINTS,
  getResponsiveValue,
  FONT_SIZES,
}; 