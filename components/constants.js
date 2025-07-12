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
export const CELL_MARGIN = 4;
export const { width, height } = Dimensions.get('window');
export const CELL_SIZE = Math.floor((width - 40 - (COLS - 1) * CELL_MARGIN) / COLS);

/**
 * Calculate cell positions on screen
 */
export const getCellLeft = (col) => col * (CELL_SIZE + CELL_MARGIN);
export const getCellTop = (row) => row * (CELL_SIZE + CELL_MARGIN);

/**
 * Tile color scheme - follows 2048 style with modern colors
 */
export const COLORS = {
  // Empty cell
  0: '#3a3a3a',
  
  // Small values (common)
  2: '#eee4da',      // Light beige
  4: '#ede0c8',      // Slightly darker beige
  8: '#8dd3f4',      // Light blue
  16: '#6ec6ff',     // Blue
  32: '#ff8a65',     // Orange
  
  // Medium values
  64: '#fbc02d',     // Yellow
  128: '#ffd54f',    // Bright yellow
  256: '#ffb300',    // Gold
  512: '#ff7043',    // Red-orange
  
  // High values (rare)
  1024: '#d84315',   // Dark red
  2048: '#ad1457',   // Purple-red (WIN!)
  4096: '#6a1b9a',   // Purple
  
  // Ultra high values (if achieved)
  8192: '#1a237e',   // Deep blue
  16384: '#0d47a1',  // Navy
  32768: '#1565c0',  // Blue
};

/**
 * Get appropriate text color for tile background
 */
export const getTextColor = (value) => {
  if (value <= 4) return '#776e65';  // Dark text for light backgrounds
  return '#f9f6f2';                  // Light text for dark backgrounds
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
  
  // Common animation durations (from GameRules)
  DURATION: {
    FAST: 150,
    NORMAL: 250,
    SLOW: 500,
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