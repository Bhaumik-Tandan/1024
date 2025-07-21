/**
 * ===========================
 * VISUAL CONSTANTS & UI CONFIG
 * ===========================
 * 
 * This file contains all visual styling constants and UI configuration
 * Game logic constants are now in GameRules.js for better organization
 */

import { Dimensions, Platform } from 'react-native';
import { GAME_CONFIG } from './GameRules';

// Import game dimensions from rules
export const COLS = GAME_CONFIG.BOARD.COLS;
export const ROWS = GAME_CONFIG.BOARD.ROWS;

// UI Layout Constants - with web fallbacks
const getDimensions = () => {
  try {
    const dimensions = Dimensions.get('window');
    return {
      width: dimensions?.width || (Platform.OS === 'web' ? 400 : 400),
      height: dimensions?.height || (Platform.OS === 'web' ? 800 : 800)
    };
  } catch (error) {
    // Fallback dimensions if Dimensions.get fails
    return {
      width: Platform.OS === 'web' ? 400 : 400,
      height: Platform.OS === 'web' ? 800 : 800
    };
  }
};

export const { width, height } = getDimensions();

// Web-responsive sizing
const getResponsiveSizing = () => {
  if (Platform.OS === 'web') {
    // For web, use smaller fixed sizes for better desktop experience
    const maxGameWidth = 480; // Maximum game width on web
    const cellMargin = 6;
    const cellSize = Math.floor((maxGameWidth - 40 - (COLS - 1) * cellMargin) / COLS);
    return {
      cellSize: Math.min(cellSize, 70), // Cap cell size at 70px for web
      cellMargin: cellMargin
    };
  } else {
    // For mobile, use responsive sizing based on screen width
    const cellMargin = Math.max(2, Math.floor(width * 0.008));
    const cellSize = Math.floor((width - 40 - (COLS - 1) * cellMargin) / COLS);
    return { cellSize, cellMargin };
  }
};

const { cellSize, cellMargin } = getResponsiveSizing();
export const CELL_MARGIN = cellMargin;
export const CELL_SIZE = cellSize;

/**
 * Calculate cell positions on screen
 */
export const getCellLeft = (col) => col * (CELL_SIZE + CELL_MARGIN);
export const getCellTop = (row) => row * (CELL_SIZE + CELL_MARGIN);

/**
 * Tile color scheme - Modern, accessible colors with better contrast
 */
export const COLORS = {
  // Empty cell
  0: '#2c2c2c',
  
  // Small values (common) - vibrant, friendly colors
  2: '#E91E63',      // Vibrant pink/magenta
  4: '#FFD54F',      // Amber
  8: '#FFA726',      // Orange
  16: '#FF5722',     // Bright orange-red
  32: '#F44336',     // Bold red
  
  // Medium values - vibrant but balanced
  64: '#9C27B0',     // Bright purple
  128: '#8D6E63',    // Brown/grey tone  
  256: '#7986CB',    // Indigo
  512: '#64B5F6',    // Blue
  
  // High values - premium gradient feel
  1024: '#4FC3F7',   // Cyan (milestone without crown)
  2048: '#4DD0E1',   // Light cyan
  4096: '#26C6DA',   // Darker cyan
  8192: '#00ACC1',   // Teal
  
  // Ultra high values - rich, luxurious colors
  16384: '#00897B',  // Dark teal
  32768: '#43A047',  // Green
  65536: '#7CB342',  // Light green
  131072: '#C0CA33', // Lime
  262144: '#FDD835', // Yellow
  524288: '#FFB300', // Amber
  1048576: '#FF8F00', // Orange (1M milestone)
  2097152: '#FF6F00' // Deep orange
};

/**
 * Enhanced gradient colors for tiles - creates depth and visual appeal
 */
export const TILE_GRADIENTS = {
  2: ['#E91E63', '#C2185B'],
  4: ['#FFD54F', '#FFC107'],
  8: ['#FFA726', '#FF8F00'],
  16: ['#FF5722', '#E64A19'],
  32: ['#F44336', '#C62828'],
  
  64: ['#9C27B0', '#7B1FA2'],
  128: ['#8D6E63', '#6D4C41'],
  256: ['#7986CB', '#3F51B5'],
  512: ['#64B5F6', '#2196F3'],
  
  1024: ['#4FC3F7', '#29B6F6'], // Beautiful cyan gradient for 1024 (no crown)
  2048: ['#4DD0E1', '#26C6DA'],
  4096: ['#26C6DA', '#00ACC1'],
  8192: ['#00ACC1', '#00838F'],
  
  16384: ['#00897B', '#00695C'],
  32768: ['#43A047', '#2E7D32'],
  65536: ['#7CB342', '#558B2F'],
  131072: ['#C0CA33', '#9E9D24'],
  262144: ['#FDD835', '#F57F17'],
  524288: ['#FFB300', '#FF8F00'],
  1048576: ['#FF8F00', '#FF6F00'], // Rich orange gradient for 1M milestone
  2097152: ['#FF6F00', '#E65100']
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
  if (value === 1048576) { // 1M - Only 1M gets crown now
    return { type: 'crown', stars: true };
  }
  if (value >= 524288) { // High value tiles get stars
    return { type: 'stars', stars: true };
  }
  if (value >= 1024) { // 1K and above get subtle glow effect
    return { type: 'glow', stars: false };
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
  // Dark theme
  DARK: {
    BACKGROUND_PRIMARY: '#1a1a1a',
    BACKGROUND_SECONDARY: '#2c2c2c',
    BACKGROUND_BOARD: '#2a2a2a',
    TEXT_PRIMARY: '#ffffff',
    TEXT_SECONDARY: '#aaaaaa',
    BORDER_COLOR: '#444444',
    SHADOW_COLOR: '#000000',
  },
  
  // Light theme
  LIGHT: {
    BACKGROUND_PRIMARY: '#ffffff',
    BACKGROUND_SECONDARY: '#f8f9fa',
    BACKGROUND_BOARD: '#e9ecef',
    TEXT_PRIMARY: '#212529',
    TEXT_SECONDARY: '#6c757d',
    BORDER_COLOR: '#dee2e6',
    SHADOW_COLOR: 'rgba(0,0,0,0.1)',
  },
  
  // Common colors
  TEXT_ACCENT: '#007bff',
  SUCCESS_COLOR: '#28a745',
  WARNING_COLOR: '#ffc107',
  ERROR_COLOR: '#dc3545',
  
  // Header box colors
  SCORE_BOX_DARK: '#2a2a2a',
  SCORE_BOX_LIGHT: '#f8f9fa',
  RECORD_BOX: '#007bff',
  RANK_BOX_DARK: '#444444',
  RANK_BOX_LIGHT: '#e9ecef',
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