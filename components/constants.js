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

// Game configuration - import from GameRules to avoid circular imports
export const ROWS = GAME_CONFIG.BOARD.ROWS;
export const COLS = GAME_CONFIG.BOARD.COLS;

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
    type: 'proxima_centauri',
    name: 'Proxima Centauri',
    diameter: '~200,000 km',
    description: 'The nearest star to our Sun, a red dwarf that hosts potentially habitable exoplanets.',
    facts: [
      'Nearest star to the Sun (4.24 light-years)',
      'Red dwarf star',
      'Has potentially habitable exoplanet',
      'Will live for trillions of years'
    ],
    glow: true,
    primary: '#FF4500',
    accent: '#FF6347'
  },
  
  4096: {
    type: 'alpha_centauri_a',
    name: 'Alpha Centauri A',
    diameter: '~1.2 million km',
    description: 'Part of the closest star system to Earth, very similar to our Sun in mass and brightness.',
    facts: [
      'Part of closest star system to Earth',
      'Very similar to our Sun',
      'Binary star with Alpha Centauri B',
      'Located 4.37 light-years away'
    ],
    glow: true,
    primary: '#FFD700',
    accent: '#FFA500'
  },
  
  8192: {
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
  
  16384: {
    type: 'sirius_a',
    name: 'Sirius A',
    diameter: '~2.38 million km',
    description: 'The brightest star in our night sky, a hot blue-white star in the constellation Canis Major.',
    facts: [
      'Brightest star in night sky',
      'Blue-white main sequence star',
      'Binary system with white dwarf companion',
      'Located 8.6 light-years away'
    ],
    glow: true,
    primary: '#87CEEB',
    accent: '#4169E1'
  },
  
  32768: {
    type: 'pollux',
    name: 'Pollux',
    diameter: '~9 million km',
    description: 'An orange giant star in Gemini, the brightest star in the constellation and host to an exoplanet.',
    facts: [
      'Orange giant star in Gemini',
      'Brightest star in its constellation',
      'Has a confirmed exoplanet',
      'Located 34 light-years away'
    ],
    glow: true,
    primary: '#FF8C00',
    accent: '#FF7F50'
  },
  
  65536: {
    type: 'arcturus',
    name: 'Arcturus',
    diameter: '~35 million km',
    description: 'A red giant star, the brightest star in the northern celestial hemisphere and fourth brightest in the night sky.',
    facts: [
      'Red giant star',
      'Brightest star in northern sky',
      'Fourth brightest star overall',
      'Located 37 light-years away'
    ],
    glow: true,
    primary: '#FF6B35',
    accent: '#FF4500'
  },
  
  131072: {
    type: 'aldebaran',
    name: 'Aldebaran',
    diameter: '~61 million km',
    description: 'The "Follower of the Pleiades," a red giant star that appears to be the eye of Taurus the Bull.',
    facts: [
      'Red giant in constellation Taurus',
      'Known as the "Eye of the Bull"',
      'Appears to lead the Hyades cluster',
      'Located 65 light-years away'
    ],
    glow: true,
    primary: '#DC143C',
    accent: '#FF6B6B'
  },
  
  262144: {
    type: 'rigel',
    name: 'Rigel',
    diameter: '~97 million km',
    description: 'A blue supergiant in Orion, one of the most luminous stars known and the seventh brightest star in the night sky.',
    facts: [
      'Blue supergiant in Orion',
      'One of most luminous known stars',
      'Seventh brightest star in night sky',
      'Located 860 light-years away'
    ],
    glow: true,
    primary: '#4169E1',
    accent: '#00BFFF'
  },
  
  524288: {
    type: 'antares',
    name: 'Antares',
    diameter: '~1.2 billion km',
    description: 'A red supergiant in Scorpius, one of the largest known stars that would engulf Mars if placed in our solar system.',
    facts: [
      'Red supergiant in Scorpius',
      'Would engulf Mars orbit if in our system',
      'Semi-regular variable star',
      'Located 600 light-years away'
    ],
    glow: true,
    primary: '#B22222',
    accent: '#DC143C'
  },
  
  1048576: {
    type: 'betelgeuse',
    name: 'Betelgeuse',
    diameter: '~1.6 billion km',
    description: 'A red supergiant in Orion, famous for its variability and potential to explode as a supernova.',
    facts: [
      'Red supergiant in Orion',
      'May explode as supernova',
      'Highly variable brightness',
      'Located 700 light-years away'
    ],
    glow: true,
    primary: '#CD5C5C',
    accent: '#F08080'
  },
  
  2097152: {
    type: 'vy_canis_majoris',
    name: 'VY Canis Majoris',
    diameter: '~2 billion km',
    description: 'One of the largest known stars, a red hypergiant that could contain over a billion Suns.',
    facts: [
      'One of largest known stars',
      'Red hypergiant star',
      'Could contain over 1 billion Suns',
      'Located 3,900 light-years away'
    ],
    glow: true,
    primary: '#8B0000',
    accent: '#A52A2A'
  },
  
  4194304: {
    type: 'uy_scuti',
    name: 'UY Scuti',
    diameter: '~2.4 billion km',
    description: 'Currently considered one of the largest known stars by radius, a red supergiant of incredible scale.',
    facts: [
      'One of largest known stars by radius',
      'Red supergiant',
      'Radius 1,700 times larger than Sun',
      'Located 9,500 light-years away'
    ],
    glow: true,
    primary: '#800000',
    accent: '#B22222'
  },
  
  // 🕳️ Supermassive Objects (Non-Stellar)
  8388608: {
    type: 'ton_618',
    name: 'TON 618',
    diameter: '~390 billion km',
    description: 'One of the largest known black holes by event horizon size, a hyperluminous quasar.',
    facts: [
      'One of largest known black holes',
      'Hyperluminous quasar',
      'Event horizon 390 billion km across',
      'Located 18.2 billion light-years away'
    ],
    glow: true,
    primary: '#1a1a1a',
    accent: '#9932CC',
    special: 'black_hole'
  },
  
  16777216: {
    type: 'milky_way_core',
    name: 'Milky Way Core',
    diameter: '~13,000 light-years',
    description: 'The central bulge of our galaxy, containing billions of stars and the supermassive black hole Sagittarius A*.',
    facts: [
      'Central bulge of our galaxy',
      'Contains billions of stars',
      'Home to Sagittarius A* black hole',
      'Diameter about 13,000 light-years'
    ],
    glow: true,
    primary: '#4B0082',
    accent: '#9370DB'
  },
  
  33554432: {
    type: 'milky_way',
    name: 'Milky Way Galaxy',
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
  
  67108864: {
    type: 'andromeda',
    name: 'Andromeda Galaxy',
    diameter: '~220,000 light-years',
    description: 'The nearest major galaxy to the Milky Way, approaching us and will merge with our galaxy in 4.5 billion years.',
    facts: [
      'Nearest major galaxy to Milky Way',
      'Will merge with Milky Way in 4.5 billion years',
      'Contains 1 trillion stars',
      'Diameter 220,000 light-years'
    ],
    glow: true,
    primary: '#2F4F4F',
    accent: '#708090'
  },
  
  134217728: {
    type: 'local_group',
    name: 'Local Group',
    diameter: '~10 million light-years',
    description: 'The galaxy group containing the Milky Way, Andromeda, and about 80 other smaller galaxies.',
    facts: [
      'Contains Milky Way and Andromeda',
      'About 80 galaxies total',
      'Gravitationally bound group',
      'Diameter 10 million light-years'
    ],
    glow: true,
    primary: '#191970',
    accent: '#4169E1'
  },
  
  268435456: {
    type: 'virgo_supercluster',
    name: 'Virgo Supercluster',
    diameter: '~110 million light-years',
    description: 'The galaxy supercluster containing the Local Group and about 1,300 other galaxy groups.',
    facts: [
      'Contains the Local Group',
      'About 1,300 galaxy groups',
      'Part of larger cosmic web',
      'Diameter 110 million light-years'
    ],
    glow: true,
    primary: '#0D0D0D',
    accent: '#4B0082'
  },
  
  536870912: {
    type: 'laniakea_supercluster',
    name: 'Laniakea Supercluster',
    diameter: '~520 million light-years',
    description: 'The galaxy supercluster that contains the Virgo Supercluster and our Local Group of galaxies.',
    facts: [
      'Contains Virgo Supercluster',
      'Contains 100,000 galaxies',
      'Means "immeasurable heaven" in Hawaiian',
      'Diameter 520 million light-years'
    ],
    glow: true,
    primary: '#000080',
    accent: '#6A0DAD'
  },
  
  1073741824: {
    type: 'observable_universe',
    name: 'Observable Universe',
    diameter: '~93 billion light-years',
    description: 'The largest scale we can observe, containing all matter and energy that we can detect from Earth.',
    facts: [
      'Largest scale we can observe',
      'Contains 2 trillion galaxies',
      'Age: 13.8 billion years',
      'Diameter 93 billion light-years'
    ],
    glow: true,
    primary: '#000033',
    accent: '#4B0082'
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