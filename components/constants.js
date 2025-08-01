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

// Game configuration
export const ROWS = 5; // Reduced from 6 to 5 to prevent preview overlap
export const COLS = 4;

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
 * REAL PLANETS OF THE UNIVERSE (STARTING FROM SMALLEST)
 * ===========================
 * Ordered by actual size from smallest to largest - NO ELEMENTS!
 * Classic 2048 numbering: 2, 4, 8, 16, 32, 64, 128, 256...
 */
export const PLANET_TYPES = {
  // Mercury - Smallest Planet (starts at 2)
  2: {
    type: 'mercury',
    name: 'Mercury',
    diameter: '4,879 km',
    description: 'The smallest planet in our solar system, closest to the Sun. Mercury has extreme temperature variations and a heavily cratered surface.',
    facts: [
      'A day on Mercury lasts 176 Earth days',
      'Surface temperatures range from -173°C to 427°C',
      'No atmosphere or moons',
      'Fastest orbital speed around the Sun'
    ]
  },
  
  // Mars - The Red Planet
  4: {
    type: 'mars',
    name: 'Mars', 
    diameter: '6,792 km',
    description: 'Known as the Red Planet due to iron oxide on its surface. Mars has the largest volcano in the solar system and evidence of ancient water.',
    facts: [
      'Home to Olympus Mons, largest volcano in solar system',
      'Has two small moons: Phobos and Deimos',
      'Day length similar to Earth (24.6 hours)',
      'Contains frozen water at its polar ice caps'
    ]
  },
  
  // Venus - Earth's Twin
  8: {
    type: 'venus',
    name: 'Venus',
    diameter: '12,104 km', 
    description: 'Often called Earth\'s twin due to similar size, but has a toxic atmosphere and extreme greenhouse effect making it the hottest planet.',
    facts: [
      'Hottest planet with surface temps of 462°C',
      'Thick atmosphere of carbon dioxide',
      'Rotates backwards compared to most planets',
      'Atmospheric pressure 90x stronger than Earth'
    ]
  },
  
  // Earth - Our Home Planet
  16: {
    type: 'earth',
    name: 'Earth',
    diameter: '12,756 km',
    description: 'The only known planet with life. Earth has liquid water, a protective atmosphere, and the perfect distance from the Sun.',
    facts: [
      'Only planet known to support life',
      'Surface is 71% water',
      'Has one natural satellite: the Moon',
      'Magnetic field protects from solar radiation'
    ]
  },
  
  // Neptune - Ice Giant  
  32: {
    type: 'neptune',
    name: 'Neptune',
    diameter: '49,528 km',
    description: 'The windiest planet with speeds up to 2,100 km/h. This ice giant is the farthest planet from the Sun.',
    facts: [
      'Strongest winds in the solar system',
      'Takes 165 Earth years to orbit the Sun',
      'Has 14 known moons, largest is Triton',
      'Made mostly of water, methane, and ammonia'
    ]
  },
  
  // Uranus - The Tilted Planet
  64: {
    type: 'uranus', 
    name: 'Uranus',
    diameter: '51,118 km',
    description: 'The tilted ice giant that rotates on its side. Uranus has a unique ring system and 27 known moons.',
    facts: [
      'Rotates on its side (98° tilt)',
      'Has faint rings discovered in 1977',
      'Coldest planetary atmosphere in solar system',
      'Day lasts about 17 Earth hours'
    ]
  },
  
  // Saturn - Lord of the Rings
  128: {
    type: 'saturn',
    name: 'Saturn', 
    diameter: '120,536 km',
    description: 'Famous for its spectacular ring system. Saturn is a gas giant with 83 known moons, including the large moon Titan.',
    facts: [
      'Has the most spectacular ring system',
      'Less dense than water - would float!',
      'Titan, its largest moon, has lakes of methane',
      'Hexagonal storm at its north pole'
    ]
  },
  
  // Jupiter - King of Planets
  256: {
    type: 'jupiter',
    name: 'Jupiter',
    diameter: '142,984 km', 
    description: 'The largest planet in our solar system. Jupiter\'s Great Red Spot is a storm larger than Earth that has raged for centuries.',
    facts: [
      'Largest planet in our solar system',
      'Great Red Spot is a storm bigger than Earth',
      'Has at least 95 moons including the four Galilean moons',
      'Acts as a cosmic vacuum cleaner, protecting inner planets'
    ]
  },

  // Brown Dwarf - Failed Star
  512: {
    type: 'brown_dwarf',
    name: 'Brown Dwarf',
    diameter: '139,820 km',
    description: 'A failed star that didn\'t accumulate enough mass to sustain nuclear fusion. Brown dwarfs glow with residual heat from their formation.',
    facts: [
      'Too small to sustain hydrogen fusion',
      'Surface temperature: 1,000-2,000°C',
      'Glows with infrared radiation',
      'Bridge between planets and stars'
    ],
    glow: true,
    primary: '#8B4513',
    accent: '#D2691E'
  },

  // Red Dwarf Star - Small Star
  1024: {
    type: 'red_dwarf',
    name: 'Red Dwarf Star',
    diameter: '695,700 km',
    description: 'The most common type of star in the universe. Red dwarfs burn slowly and can live for trillions of years.',
    facts: [
      'Most common stars in the universe',
      'Can live for trillions of years',
      'Surface temperature: 2,500-4,000°C',
      'Much smaller and cooler than our Sun'
    ],
    glow: true,
    primary: '#FF4500',
    accent: '#FF6347'
  },

  // Sun-type Star (Yellow Dwarf)
  2048: {
    type: 'yellow_dwarf',
    name: 'Sun-type Star',
    diameter: '1,391,400 km',
    description: 'A main sequence star similar to our Sun. These stars fuse hydrogen into helium in their cores and provide stable energy.',
    facts: [
      'Similar to our Sun',
      'Surface temperature: 5,500°C',
      'Lifespan of about 10 billion years',
      'Perfect for supporting planetary life'
    ],
    glow: true,
    primary: '#FFD700',
    accent: '#FFA500'
  },

  // Blue Giant Star
  4096: {
    type: 'blue_giant',
    name: 'Blue Giant Star',
    diameter: '6,957,000 km',
    description: 'Massive, hot stars that burn bright and fast. Blue giants have short lifespans but shine with incredible brilliance.',
    facts: [
      'Extremely hot: 20,000-50,000°C surface temp',
      'Short lifespan: only millions of years',
      'Can be 20-90 times more massive than Sun',
      'Shine with intense blue-white light'
    ],
    glow: true,
    primary: '#4169E1',
    accent: '#00BFFF'
  },

  // Red Giant Star
  8192: {
    type: 'red_giant',
    name: 'Red Giant Star',
    diameter: '139,140,000 km',
    description: 'An aging star that has expanded to enormous size. Red giants represent the later stages of stellar evolution.',
    facts: [
      'Expanded to 100x original size',
      'Surface temperature: 3,000-4,000°C',
      'Eventually will shed outer layers',
      'Our Sun will become a red giant'
    ],
    glow: true,
    primary: '#DC143C',
    accent: '#FF6B6B'
  },

  // White Dwarf Star
  16384: {
    type: 'white_dwarf',
    name: 'White Dwarf Star',
    diameter: '12,756 km',
    description: 'The hot, dense core remnant of a dead star. White dwarfs slowly cool over billions of years.',
    facts: [
      'Incredibly dense: mass of Sun in Earth-sized sphere',
      'Surface temperature: 50,000°C',
      'Slowly cools over billions of years',
      'Final fate of stars like our Sun'
    ],
    glow: true,
    primary: '#F8F8FF',
    accent: '#E6E6FA'
  },

  // Neutron Star
  32768: {
    type: 'neutron_star',
    name: 'Neutron Star',
    diameter: '20 km',
    description: 'An incredibly dense stellar remnant composed almost entirely of neutrons. A teaspoon would weigh 6 billion tons.',
    facts: [
      'Density: 1 teaspoon = 6 billion tons',
      'Rotates up to 700 times per second',
      'Magnetic field trillions of times stronger than Earth',
      'Formed from collapsed massive stars'
    ],
    glow: true,
    primary: '#C0C0C0',
    accent: '#B0C4DE'
  },

  // Pulsar
  65536: {
    type: 'pulsar',
    name: 'Pulsar',
    diameter: '20 km',
    description: 'A rotating neutron star that emits beams of radiation. These cosmic lighthouses pulse with incredible precision.',
    facts: [
      'Emits precise radio pulses',
      'Can be more accurate than atomic clocks',
      'Rotates hundreds of times per second',
      'Used for deep space navigation'
    ],
    glow: true,
    primary: '#40E0D0',
    accent: '#00CED1'
  },

  // Stellar Mass Black Hole
  131072: {
    type: 'stellar_black_hole',
    name: 'Stellar Black Hole',
    diameter: '60 km',
    description: 'A black hole formed from the collapse of a massive star. Nothing, not even light, can escape its gravitational pull.',
    facts: [
      'Formed from collapsed massive stars',
      'Event horizon: point of no return',
      'Warps space and time around it',
      'Can be detected by gravitational effects'
    ],
    glow: true,
    primary: '#1a1a1a',
    accent: '#9932CC',
    special: 'black_hole'
  },

  // Intermediate Black Hole
  262144: {
    type: 'intermediate_black_hole',
    name: 'Intermediate Black Hole',
    diameter: '600 km',
    description: 'A medium-sized black hole, more massive than stellar black holes but smaller than supermassive ones.',
    facts: [
      'Bridge between stellar and supermassive black holes',
      'Found in globular clusters',
      'Hundreds to thousands of solar masses',
      'Relatively rare and mysterious'
    ],
    glow: true,
    primary: '#2F4F4F',
    accent: '#8A2BE2',
    special: 'black_hole'
  },

  // Supermassive Black Hole
  524288: {
    type: 'supermassive_black_hole',
    name: 'Supermassive Black Hole',
    diameter: '12,000,000 km',
    description: 'Massive black holes found at the centers of galaxies. They can contain millions to billions of solar masses.',
    facts: [
      'Found at the center of most galaxies',
      'Millions to billions of solar masses',
      'Sagittarius A* is at our galaxy center',
      'Powers quasars and active galactic nuclei'
    ],
    glow: true,
    primary: '#191970',
    accent: '#4B0082',
    special: 'black_hole'
  },

  // Galactic Center Black Hole
  1048576: {
    type: 'galactic_center_black_hole',
    name: 'Galactic Center Black Hole',
    diameter: '24,000,000 km',
    description: 'The supermassive black hole at the heart of a galaxy, controlling the orbital motion of billions of stars.',
    facts: [
      'Controls the motion of entire galaxy',
      'Billions of solar masses',
      'Creates powerful jets of particles',
      'Influences galaxy formation and evolution'
    ],
    glow: true,
    primary: '#0D0D0D',
    accent: '#6A0DAD',
    special: 'black_hole'
  },

  // Primordial Black Hole
  2097152: {
    type: 'primordial_black_hole',
    name: 'Primordial Black Hole',
    diameter: '1 km',
    description: 'Theoretical black holes formed in the early universe from density fluctuations rather than stellar collapse.',
    facts: [
      'Formed in the early universe',
      'Not from stellar collapse',
      'Could explain dark matter',
      'Range from microscopic to stellar masses'
    ],
    glow: true,
    primary: '#483D8B',
    accent: '#9370DB',
    special: 'black_hole'
  },

  // Quantum Black Hole
  4194304: {
    type: 'quantum_black_hole',
    name: 'Quantum Black Hole',
    diameter: '10^-35 m',
    description: 'Theoretical black holes at the quantum scale where general relativity and quantum mechanics intersect.',
    facts: [
      'At the Planck scale',
      'Where quantum effects dominate',
      'Challenge our understanding of physics',
      'May evaporate through Hawking radiation'
    ],
    glow: true,
    primary: '#663399',
    accent: '#9932CC',
    special: 'black_hole'
  },

  // Exotic Black Hole
  8388608: {
    type: 'exotic_black_hole',
    name: 'Exotic Black Hole',
    diameter: 'Variable',
    description: 'Theoretical black holes with unusual properties, possibly existing in higher dimensions or with exotic matter.',
    facts: [
      'May exist in higher dimensions',
      'Could have unusual properties',
      'Theoretical physics predictions',
      'Challenge conventional understanding'
    ],
    glow: true,
    primary: '#800080',
    accent: '#DA70D6',
    special: 'black_hole'
  },

  // Multidimensional Black Hole
  16777216: {
    type: 'multidimensional_black_hole',
    name: 'Multidimensional Black Hole',
    diameter: 'Infinite',
    description: 'Theoretical black holes that exist across multiple dimensions, bending the fabric of reality itself.',
    facts: [
      'Exists across multiple dimensions',
      'Bends space-time in complex ways',
      'Beyond current physics understanding',
      'May connect to parallel universes'
    ],
    glow: true,
    primary: '#4B0082',
    accent: '#8B008B',
    special: 'black_hole'
  },

  // Cosmic String Black Hole
  33554432: {
    type: 'cosmic_string_black_hole',
    name: 'Cosmic String Black Hole',
    diameter: 'Linear',
    description: 'Theoretical linear black holes formed from cosmic strings - one-dimensional defects in spacetime.',
    facts: [
      'One-dimensional defects in spacetime',
      'Remnants from the early universe',
      'Could create closed timelike curves',
      'May enable time travel paradoxes'
    ],
    glow: true,
    primary: '#2E0854',
    accent: '#8A2BE2',
    special: 'black_hole'
  },

  // Wormhole Black Hole
  67108864: {
    type: 'wormhole_black_hole',
    name: 'Wormhole Black Hole',
    diameter: 'Tunnel',
    description: 'Theoretical black holes that form tunnels through spacetime, potentially connecting distant regions of the universe.',
    facts: [
      'Tunnels through spacetime',
      'Could connect distant regions',
      'Einstein-Rosen bridges',
      'May allow faster-than-light travel'
    ],
    glow: true,
    primary: '#1E0342',
    accent: '#9400D3',
    special: 'black_hole'
  },

  // Phantom Black Hole
  134217728: {
    type: 'phantom_black_hole',
    name: 'Phantom Black Hole',
    diameter: 'Spectral',
    description: 'Theoretical black holes powered by phantom dark energy, growing larger as the universe expands.',
    facts: [
      'Powered by phantom dark energy',
      'Grows as universe expands',
      'Could eventually consume everything',
      'Related to Big Rip scenario'
    ],
    glow: true,
    primary: '#0F0230',
    accent: '#7B68EE',
    special: 'black_hole'
  },

  // Vacuum Decay Black Hole
  268435456: {
    type: 'vacuum_decay_black_hole',
    name: 'Vacuum Decay Black Hole',
    diameter: 'Expanding Bubble',
    description: 'Theoretical black holes that could trigger the collapse of the entire universe through vacuum decay.',
    facts: [
      'Could trigger universe collapse',
      'Related to Higgs field instability',
      'Expanding bubble of true vacuum',
      'Ultimate cosmic threat scenario'
    ],
    glow: true,
    primary: '#0A0120',
    accent: '#6A5ACD',
    special: 'black_hole'
  },

  // Infinite Density Black Hole
  536870912: {
    type: 'infinite_density_black_hole',
    name: 'Infinite Density Black Hole',
    diameter: 'Singularity',
    description: 'The theoretical ultimate black hole with infinite density at its core, where all known physics breaks down.',
    facts: [
      'Infinite density at the core',
      'All known physics breaks down',
      'Space and time become meaningless',
      'The ultimate cosmic mystery'
    ],
    glow: true,
    primary: '#050110',
    accent: '#483D8B',
    special: 'black_hole'
  },

  // Ultimate Black Hole
  1073741824: {
    type: 'ultimate_black_hole',
    name: 'Ultimate Black Hole',
    diameter: 'Beyond Comprehension',
    description: 'The ultimate cosmic entity - a black hole that has consumed entire universes and transcends all understanding.',
    facts: [
      'Has consumed entire universes',
      'Transcends all physical laws',
      'The final cosmic entity',
      'Beyond all human comprehension'
    ],
    glow: true,
    primary: '#000000',
    accent: '#301934',
    special: 'ultimate_black_hole'
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
    FALL: 7000, // 7 seconds for normal fall
    FAST_DROP: 150, // 0.15 seconds for fast drop
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