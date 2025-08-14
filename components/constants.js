/**
 * ===========================
 * COSMIC PLANET FUSION - VISUAL CONSTANTS
 * ===========================
 * 
 * Visual styling for the ultimate space puzzle experience
 * Featuring real planets ordered by size - NO ELEMENTS, ONLY PLANETS
 */

import { Dimensions, Platform } from 'react-native';
import { GAME_CONFIG } from './GameRules';

// Get current device dimensions and calculate grid config once
const { width, height } = Dimensions.get('window');
const isTablet = width >= 768;
const isLandscape = width > height;

// Calculate static grid configuration to avoid render-time updates
const getStaticGridConfig = () => {
  if (isTablet) {
    if (isLandscape) {
      return { ROWS: 5, COLS: 7 }; // Reduced rows for landscape iPad
    } else {
      return { ROWS: 5, COLS: 5 }; // Reduced rows for portrait iPad
    }
  } else {
    return { ROWS: 5, COLS: 4 }; // Keep original for phones
  }
};

// Static grid configuration
const STATIC_GRID_CONFIG = getStaticGridConfig();

// Export static values to avoid render-time calculations
export const ROWS = STATIC_GRID_CONFIG.ROWS;
export const COLS = STATIC_GRID_CONFIG.COLS;

// Export function for dynamic updates (used only in orientation change handlers)
export const getCurrentGridConfig = () => {
  const { width, height } = Dimensions.get('window');
  const isTablet = width >= 768;
  const isLandscape = width > height;
  
  if (isTablet) {
    if (isLandscape) {
      return { ROWS: 5, COLS: 7 }; // Reduced rows for landscape iPad
    } else {
      return { ROWS: 5, COLS: 5 }; // Reduced rows for portrait iPad
    }
  } else {
    return { ROWS: 5, COLS: 4 }; // Keep original for phones
  }
};

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

export const { width: screenWidth, height: screenHeight } = getDimensions();

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
    const isTablet = screenWidth >= 768; // iPad and larger tablets
    const isLargeTablet = screenWidth >= 1024; // iPad Pro and larger
    const isLandscape = screenWidth > screenHeight;
    
    let maxGameWidth;
    let cellMargin;
    
    if (isTablet) {
      if (isLandscape) {
        // iPad landscape: Use most of the screen width for larger grid
        maxGameWidth = Math.min(1200, screenWidth * 0.95); // Much larger game area
        cellMargin = 8; // Adequate spacing for larger grid
      } else {
        // iPad portrait: Much larger game area for better utilization
        maxGameWidth = Math.min(800, screenWidth * 0.95); // Significantly increased
        cellMargin = 10; // More spacing for larger cells
      }
    } else {
      // Phones - use most of screen width
      maxGameWidth = screenWidth - 40;
      cellMargin = Math.max(2, Math.floor(screenWidth * 0.008));
    }
    
    // Calculate cell size based on grid dimensions
    const availableWidth = maxGameWidth - (COLS - 1) * cellMargin;
    let cellSize = Math.floor(availableWidth / COLS);
    
    // Set much larger min/max cell sizes for iPad
    if (isTablet) {
      if (isLandscape) {
        // Landscape iPad: Larger cells even for bigger grid
        cellSize = Math.min(cellSize, 130); // Increased max for more vertical space
        cellSize = Math.max(cellSize, 90);  // Increased min
      } else {
        // Portrait iPad: Much larger cells for excellent visibility
        cellSize = Math.min(cellSize, 160); // Increased max for more vertical space
        cellSize = Math.max(cellSize, 120); // Increased min
      }
    } else {
      // Phone: Ensure good touch targets
      cellSize = Math.min(cellSize, 120);
      cellSize = Math.max(cellSize, 60);
    }
    
    return { 
      cellSize: cellSize, 
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
 * FAMOUS CELESTIAL BODIES OF THE UNIVERSE (ORDERED BY SIZE)
 * ===========================
 * Using famous astronomical objects that people recognize
 * Classic 2048 numbering: 2, 4, 8, 16, 32, 64, 128, 256...
 */
export const PLANET_TYPES = {
  // 🌑 Famous Small Bodies
  2: {
    type: 'pluto',
    name: 'Pluto',
    diameter: '2,377 km',
    description: 'The famous dwarf planet in our outer solar system, reclassified in 2006 but still beloved by many.',
    facts: [
      'Dwarf planet in the Kuiper Belt',
      'Has five known moons, largest is Charon',
      'Surface temperature: -230°C',
      'Takes 248 Earth years to orbit the Sun'
    ]
  },
  
  4: {
    type: 'moon',
    name: 'Moon',
    diameter: '3,474 km',
    description: 'Earth\'s only natural satellite, the fifth largest moon in the Solar System and crucial for life on Earth.',
    facts: [
      'Responsible for Earth\'s tides',
      'Same side always faces Earth (tidally locked)',
      'Formed 4.5 billion years ago',
      'Gradually moving away from Earth'
    ]
  },
  
  // 🪐 Planets (in size order)
  8: {
    type: 'mercury',
    name: 'Mercury',
    diameter: '4,880 km',
    description: 'The smallest planet in our solar system and closest to the Sun, with extreme temperature variations.',
    facts: [
      'Closest planet to the Sun',
      'No atmosphere or moons',
      'Day lasts 176 Earth days',
      'Surface temperatures: -173°C to 427°C'
    ]
  },
  
  16: {
    type: 'mars',
    name: 'Mars',
    diameter: '6,779 km',
    description: 'The Red Planet, our neighbor that may have once harbored life and is the target of future human missions.',
    facts: [
      'Known as the Red Planet',
      'Home to largest volcano: Olympus Mons',
      'Has polar ice caps',
      'Two small moons: Phobos and Deimos'
    ]
  },
  
  32: {
    type: 'venus',
    name: 'Venus',
    diameter: '12,104 km',
    description: 'Earth\'s twin in size but with a hellish greenhouse atmosphere, the hottest planet in our solar system.',
    facts: [
      'Hottest planet: 462°C surface temperature',
      'Thick carbon dioxide atmosphere',
      'Rotates backwards',
      'Atmospheric pressure 90x Earth\'s'
    ]
  },
  
  64: {
    type: 'earth',
    name: 'Earth',
    diameter: '12,742 km',
    description: 'Our home planet, the only known world with life, featuring liquid water and a protective atmosphere.',
    facts: [
      'Only known planet with life',
      'Surface is 71% water',
      'Protected by magnetic field',
      'Perfect distance from the Sun'
    ]
  },
  
  128: {
    type: 'neptune',
    name: 'Neptune',
    diameter: '49,244 km',
    description: 'The windiest planet with supersonic winds, this ice giant is the outermost planet in our solar system.',
    facts: [
      'Windiest planet: winds up to 2,100 km/h',
      'Farthest planet from the Sun',
      'Takes 165 Earth years to orbit',
      'Has 14 known moons'
    ]
  },
  
  256: {
    type: 'uranus',
    name: 'Uranus',
    diameter: '50,724 km',
    description: 'The tilted ice giant that rotates on its side, with faint rings and 27 known moons.',
    facts: [
      'Rotates on its side (98° tilt)',
      'Coldest planetary atmosphere',
      'Has faint ring system',
      '27 known moons'
    ]
  },
  
  512: {
    type: 'saturn',
    name: 'Saturn',
    diameter: '116,460 km',
    description: 'The ringed planet, famous for its spectacular ring system and 146 known moons including Titan.',
    facts: [
      'Most spectacular ring system',
      'Less dense than water',
      '146 known moons',
      'Hexagonal storm at north pole'
    ]
  },
  
  1024: {
    type: 'jupiter',
    name: 'Jupiter',
    diameter: '139,820 km',
    description: 'The king of planets, largest in our solar system with the famous Great Red Spot storm.',
    facts: [
      'Largest planet in our solar system',
      'Great Red Spot: storm bigger than Earth',
      '95+ known moons',
      'Acts as cosmic vacuum cleaner'
    ]
  },
  
  // ☀️ Famous Stars (in increasing size)
  2048: {
    type: 'polaris',
    name: 'Polaris',
    diameter: '~6.4 million km',
    description: 'The North Star, the brightest star in Ursa Minor and a reliable guide for navigation throughout history.',
    facts: [
      'Known as the North Star',
      'Always points to true north',
      'Used for navigation for centuries',
      'Located 433 light-years away'
    ],
    glow: true,
    primary: '#FFD700',
    accent: '#FFA500'
  },
  
  4096: {
    type: 'sun',
    name: 'Sun',
    diameter: '1.392 million km',
    description: 'Our home star, a yellow dwarf that provides energy for life on Earth and dominates our solar system.',
    facts: [
      'Our home star',
      'Yellow dwarf star',
      'Surface temperature: 5,500°C',
      'Powers all life on Earth'
    ],
    glow: true,
    primary: '#FFD700',
    accent: '#FFA500'
  },
  
  8192: {
    type: 'sirius',
    name: 'Sirius',
    diameter: '~2.38 million km',
    description: 'The brightest star in our night sky, also known as the Dog Star, visible from almost anywhere on Earth.',
    facts: [
      'Brightest star in night sky',
      'Also called the Dog Star',
      'Visible from almost anywhere on Earth',
      'Located 8.6 light-years away'
    ],
    glow: true,
    primary: '#87CEEB',
    accent: '#4169E1'
  },
  
  16384: {
    type: 'orion_nebula',
    name: 'Orion Nebula',
    diameter: '~24 light-years',
    description: 'One of the brightest nebulae visible to the naked eye, a stellar nursery where new stars are born.',
    facts: [
      'Visible to naked eye',
      'Stellar nursery for new stars',
      'Located in Orion constellation',
      '1,344 light-years away'
    ],
    glow: true,
    primary: '#9370DB',
    accent: '#8A2BE2'
  },
  
  32768: {
    type: 'pleiades',
    name: 'Pleiades',
    diameter: '~8 light-years',
    description: 'The Seven Sisters, a beautiful star cluster visible to the naked eye, featured in many cultures and myths.',
    facts: [
      'Also called Seven Sisters',
      'Visible to naked eye',
      'Featured in many cultures',
      '444 light-years away'
    ],
    glow: true,
    primary: '#87CEEB',
    accent: '#00BFFF'
  },
  
  65536: {
    type: 'milky_way',
    name: 'Milky Way',
    diameter: '~105,000 light-years',
    description: 'Our home galaxy, containing 200-400 billion stars and the solar system we call home.',
    facts: [
      'Our home galaxy',
      '200-400 billion stars',
      'Spiral galaxy',
      'Diameter 105,000 light-years'
    ],
    glow: true,
    primary: '#483D8B',
    accent: '#6A5ACD'
  },
  
  131072: {
    type: 'quasar',
    name: 'Quasar',
    diameter: '~1 billion km',
    description: 'The brightest objects in the universe, powered by supermassive black holes at the center of galaxies.',
    facts: [
      'Brightest objects in universe',
      'Powered by black holes',
      'Found in distant galaxies',
      'Emits massive energy'
    ],
    glow: true,
    primary: '#FF4500',
    accent: '#FF6347'
  },
  
  262144: {
    type: 'supernova',
    name: 'Supernova',
    diameter: '~100 million km',
    description: 'The explosive death of a massive star, one of the most powerful events in the universe.',
    facts: [
      'Explosive star death',
      'Brighter than entire galaxies',
      'Creates heavy elements',
      'Most powerful cosmic event'
    ],
    glow: true,
    primary: '#FFD700',
    accent: '#FFA500'
  },
  
  // 🕳️ Ultimate Black Hole (Final Form)
  1048576: {
    type: 'ultimate_black_hole',
    name: 'Black Hole',
    diameter: '∞',
    description: 'The ultimate cosmic entity - a black hole of infinite density that consumes everything and represents the end of all things.',
    facts: [
      'Infinite density and gravity',
      'Consumes all matter and energy',
      'Represents the end of existence',
      'Nothing can escape its pull'
    ],
    glow: true,
    primary: '#000000',
    accent: '#9932CC',
    special: 'ultimate_black_hole',
    infinitySymbol: true
  }
};

/**
 * Get real planet properties - only planets from our solar system
 */
export const getPlanetType = (value) => {
  return PLANET_TYPES[value] || {
    type: 'unknown',
    name: 'Unknown Celestial Body',
    primary: '#666666',
    accent: '#999999',
    atmosphere: false,
    rings: false,
    moons: 0,
    glow: false,
    diameter: 'Unknown',
    description: 'This celestial body is beyond our current knowledge.',
    facts: 'Keep exploring to discover more about the universe!',
    special: 'mysterious'
  };
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
 * Real planetary phenomenon animations
 */
export const COSMIC_EFFECTS = {
  extreme_temperatures: {
    animationType: 'temperature_gradient',
    duration: 4000,
    intensity: 0.8
  },
  polar_ice_caps: {
    animationType: 'ice_shimmer',
    duration: 3000,
    color: '#FFFFFF'
  },
  greenhouse_effect: {
    animationType: 'atmospheric_glow',
    duration: 3500,
    opacity: 0.7
  },
  life_sustaining: {
    animationType: 'bio_aurora',
    duration: 4000,
    color: '#00FF7F'
  },
  supersonic_winds: {
    animationType: 'wind_bands',
    duration: 2000,
    intensity: 0.9
  },
  sideways_rotation: {
    animationType: 'tilted_spin',
    duration: 5000,
    angle: 98
  },
  spectacular_rings: {
    animationType: 'ring_sparkle',
    duration: 3500,
    particles: true
  },
  great_red_spot: {
    animationType: 'storm_swirl',
    duration: 6000,
    color: '#DC143C'
  },
  mysterious: {
    animationType: 'stellar_twinkle',
    duration: 4000,
    quantum: false
  }
};

/**
 * Legacy function compatibility
 */
export const getTileStyle = (value) => getPlanetStyle(value);
export const getTileColor = (value) => getPlanetType(value).primary;

/**
 * Special milestone tiles that trigger celebrations 
 */
export const MILESTONE_TILES = [16, 256]; // Earth and Jupiter - major milestones

/**
 * Check if a planet is a milestone that should have special effects
 */
export const isMilestoneTile = (value) => {
  return MILESTONE_TILES.includes(value);
};

/**
 * Get special planet decoration based on real astronomical features
 */
export const getTileDecoration = (value) => {
  const planet = getPlanetType(value);
  
  if (value >= 4096) { // Saturn and Jupiter get ring systems
    return { type: 'ring_system', astronomical: true };
  }
  if (value >= 1024) { // Ice giants get atmospheric effects
    return { type: 'ice_giant_glow', astronomical: true };
  }
  if (planet.atmosphere) { // Planets with atmosphere get subtle glow
    return { type: 'atmosphere_glow', astronomical: true };
  }
  return { type: 'rocky_surface', astronomical: true };
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
  if (screenWidth <= BREAKPOINTS.LARGE_PHONE) return phone;
  if (screenWidth <= BREAKPOINTS.LARGE_TABLET) return tablet;
  return desktop;
};

/**
 * UI Layout Dimensions - enhanced for tablets and adaptive grids
 */
export const UI_CONFIG = {
  // Spacing
  BOARD_PADDING: 8,
  HEADER_HEIGHT: getResponsiveValue(80, 100, 120),
  FOOTER_HEIGHT: getResponsiveValue(40, 50, 60),
  
  // Board dimensions - much larger for iPad to utilize screen space
  BOARD_WIDTH: screenWidth >= 768 ? 
    Math.min(1200, screenWidth * 0.95) : screenWidth - 20, // Significantly increased for iPad
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
  // Deep Space Theme - Original Dark
  DARK: {
    BACKGROUND_PRIMARY: '#0A0A1A',      // Deep space black
    BACKGROUND_SECONDARY: '#1A1A2E',    // Space station dark
    BACKGROUND_BOARD: '#1A1A2E',        // Dark board background (not purple)
    TEXT_PRIMARY: '#F0F8FF',            // Alice blue text
    TEXT_SECONDARY: '#B0C4DE',          // Light steel blue text  
    BORDER_COLOR: '#4169E1',            // Royal blue borders
    SHADOW_COLOR: '#000000',
    COSMIC_ACCENT: '#00BFFF',           // Deep sky blue
    STELLAR_GLOW: '#FFD700',            // Gold stellar glow
    NEON_GLOW: '#00FFFF',               // Cyan neon glow for score display
    NEBULA_PINK: '#FF69B4',             // Hot pink nebula
    COSMIC_PURPLE: '#8A2BE2',           // Blue violet
    STARFIELD: '#FFFFFF',               // White stars
    SCORE_BOX_DARK: '#1A1A2E',          // Score box background
    RECORD_BOX: '#2D1B69',              // Record box background
    WORKSHOP_ACCENT: '#4169E1',         // Workshop/border accent
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
  
  // Space UI elements - keeping only the ones not in DARK theme
  SUCCESS_COLOR: '#32CD32',           // Lime green
  WARNING_COLOR: '#FFD700',           // Gold
  ERROR_COLOR: '#FF6347',             // Tomato
  
  // Space station materials
  HULL_METAL: '#708090',
  VIEWPORT_GLASS: '#B0E0E6',
  CONTROL_PANEL: '#2F4F4F',
  AMBIENT_LIGHT: '#E0FFFF',
};

/**
 * ===========================
 * MINIMAL iOS-LIKE THEME
 * ===========================
 * Clean, premium design following iOS design principles
 */
export const MINIMAL_THEME = {
  // Background colors
  BACKGROUND_PRIMARY: '#FFFFFF',        // Pure white
  BACKGROUND_SECONDARY: '#F8F9FA',      // Light gray background
  BACKGROUND_TERTIARY: '#F1F3F4',       // Subtle gray
  BACKGROUND_CARD: '#FFFFFF',           // Card background
  
  // Text colors
  TEXT_PRIMARY: '#1D1D1F',              // iOS-style dark text
  TEXT_SECONDARY: '#86868B',            // iOS-style secondary text
  TEXT_TERTIARY: '#C7C7CC',             // iOS-style tertiary text
  TEXT_ACCENT: '#007AFF',               // iOS blue
  
  // Interactive elements
  ACCENT_PRIMARY: '#007AFF',            // iOS blue
  ACCENT_SECONDARY: '#5856D6',          // iOS purple
  SUCCESS: '#34C759',                   // iOS green
  WARNING: '#FF9500',                   // iOS orange
  ERROR: '#FF3B30',                     // iOS red
  
  // Borders and dividers
  BORDER_PRIMARY: '#E5E5EA',            // iOS-style border
  BORDER_SECONDARY: '#F2F2F7',          // Subtle border
  DIVIDER: '#E5E5EA',                   // iOS-style divider
  
  // Shadows and effects
  SHADOW_PRIMARY: 'rgba(0, 0, 0, 0.1)',
  SHADOW_SECONDARY: 'rgba(0, 0, 0, 0.05)',
  OVERLAY: 'rgba(0, 0, 0, 0.4)',
  
  // Game-specific colors (minimal versions)
  TILE_BACKGROUND: '#FFFFFF',
  TILE_BORDER: '#E5E5EA',
  GRID_BACKGROUND: '#F8F9FA',
  NEXT_TILE_BACKGROUND: '#F1F3F4',
};

/**
 * Minimal color palette for game tiles
 * Clean, subtle colors that are easy on the eyes
 */
export const MINIMAL_COLORS = {
  2: '#F8F9FA',     // Light gray
  4: '#E3F2FD',     // Light blue
  8: '#F3E5F5',     // Light purple
  16: '#E8F5E8',    // Light green
  32: '#FFF3E0',    // Light orange
  64: '#FCE4EC',    // Light pink
  128: '#E1F5FE',   // Light cyan
  256: '#F1F8E9',   // Light lime
  512: '#FFF8E1',   // Light yellow
  1024: '#EFEBE9',  // Light brown
  2048: '#ECEFF1',  // Light blue gray
  // Higher values use gradient variations
};

/**
 * Minimal tile gradients - very subtle
 */
export const MINIMAL_TILE_GRADIENTS = {
  2: ['#F8F9FA', '#F1F3F4'],
  4: ['#E3F2FD', '#BBDEFB'],
  8: ['#F3E5F5', '#E1BEE7'],
  16: ['#E8F5E8', '#C8E6C9'],
  32: ['#FFF3E0', '#FFCC80'],
  64: ['#FCE4EC', '#F8BBD9'],
  128: ['#E1F5FE', '#81D4FA'],
  256: ['#F1F8E9', '#DCEDC8'],
  512: ['#FFF8E1', '#FFECB3'],
  1024: ['#EFEBE9', '#D7CCC8'],
  2048: ['#ECEFF1', '#CFD8DC'],
};

/**
 * Typography scale for minimal design
 * Clean hierarchy following iOS design principles
 */
export const MINIMAL_TYPOGRAPHY = {
  // Font weights
  WEIGHT: {
    LIGHT: '300',
    REGULAR: '400',
    MEDIUM: '500',
    SEMIBOLD: '600',
    BOLD: '700',
  },
  
  // Font sizes
  SIZE: {
    CAPTION: 12,
    BODY: 16,
    CALLOUT: 17,
    TITLE3: 20,
    TITLE2: 22,
    TITLE1: 28,
    LARGE_TITLE: 34,
  },
  
  // Line heights
  LINE_HEIGHT: {
    TIGHT: 1.2,
    NORMAL: 1.4,
    RELAXED: 1.6,
  },
};

/**
 * Spacing system for consistent layout
 * Following iOS spacing guidelines
 */
export const MINIMAL_SPACING = {
  XS: 4,
  SM: 8,
  MD: 16,
  LG: 24,
  XL: 32,
  XXL: 48,
};

/**
 * Shadow presets for minimal design
 */
export const MINIMAL_SHADOWS = {
  NONE: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  SUBTLE: {
    shadowColor: MINIMAL_THEME.SHADOW_SECONDARY,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 2,
  },
  SMALL: {
    shadowColor: MINIMAL_THEME.SHADOW_PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  MEDIUM: {
    shadowColor: MINIMAL_THEME.SHADOW_PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 5,
  },
  LARGE: {
    shadowColor: MINIMAL_THEME.SHADOW_PRIMARY,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
};

/**
 * Border radius values for consistent rounded corners
 */
export const MINIMAL_RADIUS = {
  XS: 4,
  SM: 8,
  MD: 12,
  LG: 16,
  XL: 20,
  FULL: 9999,
};

/**
 * Animation configuration for cosmic collisions and astronomical effects
 */
export const ANIMATION_CONFIG = {
  // Easing functions
  EASING: {
    EASE_OUT: 'ease-out',
    EASE_IN: 'ease-in',
    BOUNCE: 'bounce',
    COSMIC_DRIFT: 'ease-in-out', // For weightless space movement
  },
  
  // Common animation durations - Optimized for astronomical drama
  DURATION: {
    FAST: 100,         // Quick UI responses
    NORMAL: 300,       // Standard transitions  
    SLOW: 800,         // Dramatic cosmic movements
    FALL: 2000,        // 2 seconds for celestial bodies falling through space
    FAST_DROP: 1200,   // 1.2 seconds for targeted drops
    COSMIC_COLLISION: 1500, // 1.5 seconds for dramatic astronomical mergers
    ORBITAL_DECAY: 800,     // Time for bodies to spiral into each other
    GRAVITATIONAL_WAVE: 600, // Duration of space-time ripples
  },
  
  // Scale factors for cosmic animations
  SCALE: {
    SHRINK: 0.7,
    NORMAL: 1.0,
    GROW: 1.4,
    BOUNCE: 1.6,
    STELLAR_EXPLOSION: 2.2, // For dramatic stellar collision effects
    GRAVITATIONAL_LENSING: 1.8, // For space-time distortion effects
  },
};

/**
 * Font sizes that scale with screen size - enhanced for tablets
 */
export const FONT_SIZES = {
  TINY: 8,       // Added for very small text
  SMALL: 12,
  MEDIUM: 16,
  LARGE: 20,
  XLARGE: 24,
  TITLE: 32,
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
 * Helper function to check if a value represents a planet
 */
export const isPlanet = (value) => value >= 2; // All values 2+ are planets now

/**
 * Helper function to get starting planet values for new tiles
 */
export const getStartingPlanetValues = () => {
  return [2, 4]; // Mercury and Mars - the two smallest planets
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