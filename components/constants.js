/**
 * ===========================
 * COSMIC PLANET FUSION - VISUAL CONSTANTS
 * ===========================
 * 
 * Visual styling for the ultimate space puzzle experience
 * Featuring realistic planet physics and cosmic exploration
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
    // Enhanced mobile/tablet sizing with iPad-specific optimizations
    const isTablet = width >= 768; // iPad and larger tablets
    const isLargeTablet = width >= 1024; // iPad Pro and larger
    
    let maxGameWidth;
    let cellMargin;
    
    if (isLargeTablet) {
      // Large tablets (iPad Pro) - limit game width for better UX
      maxGameWidth = Math.min(600, width * 0.7);
      cellMargin = 8;
    } else if (isTablet) {
      // Regular tablets (standard iPad) - moderate sizing
      maxGameWidth = Math.min(500, width * 0.75);
      cellMargin = 6;
    } else {
      // Phones - use most of screen width
      maxGameWidth = width - 40;
      cellMargin = Math.max(2, Math.floor(width * 0.008));
    }
    
    const cellSize = Math.floor((maxGameWidth - (COLS - 1) * cellMargin) / COLS);
    
    // Cap cell size for very large screens
    const maxCellSize = isLargeTablet ? 90 : isTablet ? 80 : 120;
    
    return { 
      cellSize: Math.min(cellSize, maxCellSize), 
      cellMargin: cellMargin 
    };
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
 * ===========================
 * ELEMENT TYPES (2-32)
 * ===========================
 * Basic elements that combine to form planets
 */
export const ELEMENT_TYPES = {
  2: {
    type: 'water',
    name: 'Water',
    primary: '#1E90FF',        // Deep sky blue
    accent: '#87CEEB',         // Sky blue
    symbol: '💧',
    description: 'Essential for life'
  },
  4: {
    type: 'fire',
    name: 'Fire',
    primary: '#FF4500',        // Orange red
    accent: '#FFD700',         // Gold
    symbol: '🔥',
    description: 'Energy and heat'
  },
  8: {
    type: 'earth',
    name: 'Earth',
    primary: '#8B4513',        // Saddle brown
    accent: '#228B22',         // Forest green
    symbol: '🌍',
    description: 'Solid foundation'
  },
  16: {
    type: 'air',
    name: 'Air',
    primary: '#87CEEB',        // Sky blue
    accent: '#F0F8FF',         // Alice blue
    symbol: '💨',
    description: 'Movement and breath'
  },
  32: {
    type: 'energy',
    name: 'Energy',
    primary: '#FFD700',        // Gold
    accent: '#FFFF00',         // Yellow
    symbol: '⚡',
    description: 'Pure cosmic force'
  }
};

/**
 * Get element type for a given value
 */
export const getElementType = (value) => {
  return ELEMENT_TYPES[value] || {
    type: 'unknown',
    name: 'Unknown Element',
    primary: '#666666',
    accent: '#999999',
    symbol: '❓',
    description: 'Mysterious element'
  };
};

/**
 * Check if a value represents an element (not a planet)
 */
export const isElement = (value) => {
  return value <= 32 && value > 0;
};

/**
 * ===========================
 * PLANET TYPES (64+)
 * ===========================
 * Formed when elements combine
 */
export const PLANET_TYPES = {
  // Rocky Planets (Small) - Start from 64
  64: {
    type: 'asteroid',
    name: 'Asteroid',
    primary: '#696969',        // Dim gray
    accent: '#808080',         // Gray
    atmosphere: false,
    rings: false,
    moons: 0,
    glow: false,
    special: 'rocky_surface'
  },
  128: {
    type: 'mars',
    name: 'Mars-type',
    primary: '#CD5C5C',        // Indian red
    accent: '#F4A460',         // Sandy brown
    atmosphere: '#DEB887',     // Burlywood atmosphere
    rings: false,
    moons: 0,
    glow: true,
    special: 'polar_caps'
  },
  256: {
    type: 'venus',
    name: 'Venus-type',
    primary: '#FFA500',        // Orange
    accent: '#FF8C00',         // Dark orange
    atmosphere: '#FFFF00',     // Yellow atmosphere
    rings: false,
    moons: 0,
    glow: true,
    special: 'dense_atmosphere'
  },
  512: {
    type: 'earth',
    name: 'Earth-type',
    primary: '#6B93D6',        // Earth blue
    accent: '#4F7942',         // Green continents
    atmosphere: '#87CEEB',     // Blue atmosphere
    rings: false,
    moons: 1,
    glow: true,
    special: 'life_signs'
  },
  
  // Gas Giants (Medium)
  1024: {
    type: 'neptune',
    name: 'Neptune-type',
    primary: '#4169E1',        // Deep blue
    accent: '#6495ED',         // Lighter blue
    atmosphere: '#00BFFF',     // Bright blue atmosphere
    rings: true,
    moons: 2,
    glow: true,
    special: 'ice_storms'
  },
  2048: {
    type: 'uranus',
    name: 'Uranus-type',
    primary: '#00CED1',        // Cyan
    accent: '#48D1CC',         // Light cyan
    atmosphere: '#E0FFFF',     // Pale cyan atmosphere
    rings: true,
    moons: 3,
    glow: true,
    special: 'tilted_axis'
  },
  4096: {
    type: 'saturn',
    name: 'Saturn-type',
    primary: '#DAA520',        // Golden
    accent: '#FFD700',         // Bright gold
    atmosphere: '#F0E68C',     // Pale golden atmosphere
    rings: true,
    moons: 4,
    glow: true,
    special: 'prominent_rings'
  },
  
  // Gas Giants (Massive)
  8192: {
    type: 'jupiter',
    name: 'Jupiter-type',
    primary: '#D2691E',        // Jupiter orange-brown
    accent: '#CD853F',         // Sandy brown
    atmosphere: '#DEB887',     // Burlywood atmosphere
    rings: true,
    moons: 6,
    glow: true,
    special: 'great_red_spot'
  },
  16384: {
    type: 'brown_dwarf',
    name: 'Brown Dwarf',
    primary: '#8B4513',        // Saddle brown
    accent: '#A0522D',         // Sienna
    atmosphere: '#CD853F',     // Sandy atmosphere
    rings: false,
    moons: 8,
    glow: true,
    special: 'magnetic_field'
  },
  32768: {
    type: 'red_dwarf',
    name: 'Red Dwarf Star',
    primary: '#FF4500',        // Orange red
    accent: '#FF6347',         // Tomato
    atmosphere: '#FF7F50',     // Coral atmosphere
    rings: false,
    moons: 0,
    glow: true,
    special: 'stellar_flares'
  },
  
  // Exotic Stars
  65536: {
    type: 'white_dwarf',
    name: 'White Dwarf',
    primary: '#F8F8FF',        // Ghost white
    accent: '#FFFAFA',         // Snow white
    atmosphere: '#E6E6FA',     // Lavender atmosphere
    rings: false,
    moons: 0,
    glow: true,
    special: 'intense_gravity'
  },
  131072: {
    type: 'neutron_star',
    name: 'Neutron Star',
    primary: '#E6E6FA',        // Lavender
    accent: '#DDA0DD',         // Plum
    atmosphere: '#9370DB',     // Medium purple atmosphere
    rings: false,
    moons: 0,
    glow: true,
    special: 'pulsar_beam'
  },
  262144: {
    type: 'black_hole',
    name: 'Black Hole',
    primary: '#000000',        // Black
    accent: '#4B0082',         // Indigo
    atmosphere: '#8A2BE2',     // Blue violet atmosphere
    rings: false,
    moons: 0,
    glow: true,
    special: 'event_horizon'
  }
};

/**
 * Fallback to dynamic cosmic bodies for ultra-high values
 */
export const generateCosmicBody = (value) => {
  const hue = (Math.log2(value) * 31) % 360;
  const isExotic = value >= 65536;
  
  return {
    type: isExotic ? 'exotic_star' : 'giant_planet',
    name: isExotic ? 'Exotic Star' : 'Super Giant',
    primary: `hsl(${hue}, 75%, ${isExotic ? 60 : 50}%)`,
    accent: `hsl(${hue}, 60%, ${isExotic ? 80 : 70}%)`,
    atmosphere: `hsl(${(hue + 60) % 360}, 50%, 75%)`,
    rings: !isExotic,
    moons: isExotic ? 0 : Math.floor(value / 10000),
    glow: true,
    special: isExotic ? 'cosmic_phenomenon' : 'massive_gravity'
  };
};

/**
 * Get planet properties
 */
export const getPlanetType = (value) => {
  return PLANET_TYPES[value] || generateCosmicBody(value);
};

/**
 * Legacy compatibility
 */
export const getSpinnerMaterial = (value) => {
  const planet = getPlanetType(value);
  return {
    material: planet.type,
    primary: planet.primary,
    accent: planet.accent,
    bearing: planet.atmosphere || planet.accent,
    metallic: planet.rings,
    glow: planet.glow,
    special: planet.special
  };
};

/**
 * Legacy color compatibility (updated to use planet types)
 */
export const COLORS = {};
export const TILE_GRADIENTS = {};

// Generate legacy colors from planet types
Object.keys(PLANET_TYPES).forEach(value => {
  const planet = PLANET_TYPES[value];
  COLORS[value] = planet.primary;
  TILE_GRADIENTS[value] = [planet.primary, planet.accent];
});

/**
 * Enhanced planet styling with cosmic effects
 */
export const getPlanetStyle = (value, rotationAngle = 0, isOrbiting = false) => {
  const planet = getPlanetType(value);
  
  const baseStyle = {
    borderRadius: CELL_SIZE / 2, // Spherical planet shape
    shadowColor: planet.glow ? planet.primary : '#000',
    shadowOffset: { width: 0, height: planet.glow ? 0 : 4 },
    shadowOpacity: planet.glow ? 0.8 : 0.3,
    shadowRadius: planet.glow ? 12 : 6,
    elevation: planet.glow ? 10 : 5,
    transform: [{ rotate: `${rotationAngle}deg` }],
  };

  return {
    ...baseStyle,
    backgroundColor: planet.primary,
    borderColor: planet.accent,
    borderWidth: planet.rings ? 3 : 1,
  };
};

/**
 * Get planet atmosphere style
 */
export const getPlanetAtmosphereStyle = (value) => {
  const planet = getPlanetType(value);
  if (!planet.atmosphere) return null;
  
  const atmosphereSize = CELL_SIZE * 1.2;
  
  return {
    width: atmosphereSize,
    height: atmosphereSize,
    borderRadius: atmosphereSize / 2,
    backgroundColor: planet.atmosphere,
    position: 'absolute',
    top: (CELL_SIZE - atmosphereSize) / 2,
    left: (CELL_SIZE - atmosphereSize) / 2,
    opacity: 0.3,
    zIndex: -1,
  };
};

/**
 * Get planet ring system styling
 */
export const getPlanetRingsStyle = (value, ringIndex = 0) => {
  const planet = getPlanetType(value);
  if (!planet.rings) return null;
  
  const ringSize = CELL_SIZE * (1.4 + ringIndex * 0.3);
  
  return {
    width: ringSize,
    height: ringSize,
    borderRadius: ringSize / 2,
    borderWidth: 2,
    borderColor: planet.accent + '60',
    position: 'absolute',
    top: (CELL_SIZE - ringSize) / 2,
    left: (CELL_SIZE - ringSize) / 2,
    backgroundColor: 'transparent',
    transform: [{ rotateX: '60deg' }], // Tilted rings
  };
};

/**
 * Special cosmic effect configurations
 */
export const COSMIC_EFFECTS = {
  dense_atmosphere: {
    animationType: 'atmosphere_swirl',
    duration: 4000,
    opacity: 0.6
  },
  life_signs: {
    animationType: 'bio_pulse',
    duration: 3000,
    color: '#00FF00'
  },
  ice_storms: {
    animationType: 'storm_bands',
    duration: 2500,
    intensity: 0.7
  },
  tilted_axis: {
    animationType: 'axis_wobble',
    duration: 5000,
    angle: 25
  },
  prominent_rings: {
    animationType: 'ring_sparkle',
    duration: 3500,
    particles: true
  },
  great_red_spot: {
    animationType: 'storm_eye',
    duration: 6000,
    color: '#DC143C'
  },
  magnetic_field: {
    animationType: 'field_lines',
    duration: 4500,
    electric: true
  },
  stellar_flares: {
    animationType: 'solar_flares',
    duration: 2000,
    intensity: 0.9
  },
  intense_gravity: {
    animationType: 'gravity_lens',
    duration: 3000,
    distortion: true
  },
  pulsar_beams: {
    animationType: 'beam_rotation',
    duration: 1000,
    beams: 2
  },
  event_horizon: {
    animationType: 'spacetime_warp',
    duration: 5000,
    accretion: true
  },
  cosmic_phenomenon: {
    animationType: 'reality_distortion',
    duration: 4000,
    quantum: true
  },
  massive_gravity: {
    animationType: 'tidal_forces',
    duration: 3500,
    pull: true
  }
};

/**
 * Legacy function compatibility
 */
export const getTileStyle = (value) => getPlanetStyle(value);
export const getTileColor = (value) => getPlanetType(value).primary;

/**
 * Special milestone planets that get extra visual effects
 */
export const MILESTONE_TILES = [1024, 1048576]; // Jupiter-type and Cosmic phenomena

/**
 * Check if a planet is a milestone that should have special effects
 */
export const isMilestoneTile = (value) => {
  return MILESTONE_TILES.includes(value);
};

/**
 * Get special planet decoration (coronas, halos, etc.)
 */
export const getTileDecoration = (value) => {
  const planet = getPlanetType(value);
  
  if (value >= 32768) { // Black holes and exotic stars
    return { type: 'cosmic_halo', stars: true };
  }
  if (value >= 4096) { // Stars get stellar coronas
    return { type: 'stellar_corona', stars: true };
  }
  if (value >= 1024) { // Gas giants get ring systems
    return { type: 'ring_system', stars: false };
  }
  if (planet.atmosphere) { // Planets with atmosphere get subtle glow
    return { type: 'atmosphere_glow', stars: false };
  }
  return null;
};

/**
 * Get appropriate text color for planet surface
 */
export const getTextColor = (value) => {
  const planet = getPlanetType(value);
  // Use white for dark planets, black for bright ones
  const brightness = parseInt(planet.primary.slice(1), 16);
  return brightness > 0x808080 ? '#000000' : '#FFFFFF';
};

/**
 * Responsive breakpoints - enhanced for tablets
 */
export const BREAKPOINTS = {
  SMALL_PHONE: 320,
  PHONE: 375,
  LARGE_PHONE: 414,
  SMALL_TABLET: 768,  // iPad mini, regular iPad
  TABLET: 820,        // iPad Air
  LARGE_TABLET: 1024, // iPad Pro
  DESKTOP: 1200,
};

/**
 * Get responsive value based on screen size - enhanced for tablets
 */
export const getResponsiveValue = (phone, tablet, desktop) => {
  if (width <= BREAKPOINTS.LARGE_PHONE) return phone;
  if (width <= BREAKPOINTS.LARGE_TABLET) return tablet;
  return desktop;
};

/**
 * UI Layout Dimensions - enhanced for tablets
 */
export const UI_CONFIG = {
  // Spacing
  BOARD_PADDING: 8,
  HEADER_HEIGHT: getResponsiveValue(80, 100, 120),
  FOOTER_HEIGHT: getResponsiveValue(40, 50, 60),
  
  // Board dimensions - responsive for tablets
  BOARD_WIDTH: width >= BREAKPOINTS.SMALL_TABLET ? 
    Math.min(600, width * 0.8) : width - 20,
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
 * Updated theme for deep space aesthetic
 */
export const THEME = {
  // Deep Space Theme
  DARK: {
    BACKGROUND_PRIMARY: '#0A0A1A',      // Deep space
    BACKGROUND_SECONDARY: '#1A1A2E',    // Space station dark
    BACKGROUND_BOARD: '#2D1B69',        // Cosmic purple
    TEXT_PRIMARY: '#F0F8FF',            // Alice blue text
    TEXT_SECONDARY: '#B0C4DE',          // Light steel blue text  
    BORDER_COLOR: '#4169E1',            // Royal blue borders
    SHADOW_COLOR: '#000000',
    COSMIC_ACCENT: '#00BFFF',           // Deep sky blue
    STELLAR_GLOW: '#FFD700',            // Gold stellar glow
    NEBULA_PINK: '#FF69B4',             // Hot pink nebula
    COSMIC_PURPLE: '#8A2BE2',           // Blue violet
    STARFIELD: '#FFFFFF',               // White stars
  },
  
  // Light theme (for day mode)
  LIGHT: {
    BACKGROUND_PRIMARY: '#F0F8FF',      // Alice blue
    BACKGROUND_SECONDARY: '#E6E6FA',    // Lavender
    BACKGROUND_BOARD: '#D8BFD8',        // Thistle
    TEXT_PRIMARY: '#191970',            // Midnight blue
    TEXT_SECONDARY: '#483D8B',          // Dark slate blue
    BORDER_COLOR: '#6495ED',            // Cornflower blue
    SHADOW_COLOR: 'rgba(0,0,0,0.1)',
  },
  
  // Enhanced cosmic colors
  TEXT_ACCENT: '#00BFFF',             // Deep sky blue
  SUCCESS_COLOR: '#32CD32',           // Lime green
  WARNING_COLOR: '#FFD700',           // Gold
  ERROR_COLOR: '#FF6347',             // Tomato
  
  // Space UI elements
  SCORE_BOX_DARK: '#1A1A2E',
  SCORE_BOX_LIGHT: '#F0F8FF', 
  RECORD_BOX: '#00BFFF',              // Cosmic blue record box
  RANK_BOX_DARK: '#2D1B69',
  RANK_BOX_LIGHT: '#E6E6FA',
  
  // Space station materials
  HULL_METAL: '#708090',
  VIEWPORT_GLASS: '#B0E0E6',
  CONTROL_PANEL: '#2F4F4F',
  AMBIENT_LIGHT: '#E0FFFF',
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
 * Font sizes that scale with screen size - enhanced for tablets
 */
export const FONT_SIZES = {
  TINY: getResponsiveValue(10, 12, 14),
  SMALL: getResponsiveValue(12, 14, 16),
  MEDIUM: getResponsiveValue(14, 18, 20),
  LARGE: getResponsiveValue(18, 22, 24),
  XLARGE: getResponsiveValue(22, 28, 32),
  XXLARGE: getResponsiveValue(28, 36, 42),
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