/**
 * PLANET MASTER FILE - COMPLETE REGENERATION GUIDE
 * Use this to regenerate the entire planet system in another cursor session
 */

// ===========================
// 1. PLANET TYPES & NAMES
// ===========================

export const PLANET_TYPES = {
  2: { type: 'pluto', name: 'Pluto', primary: '#8DA3B0', accent: '#6B7D87', glow: false, moons: 5 },
  4: { type: 'moon', name: 'Moon', primary: '#C5B89A', accent: '#A69B85', glow: false, moons: 0 },
  8: { type: 'mercury', name: 'Mercury', primary: '#8B6F3D', accent: '#6B5328', glow: false, moons: 0 },
  16: { type: 'mars', name: 'Mars', primary: '#FF6B47', accent: '#CD5C5C', glow: false, moons: 2 },
  32: { type: 'venus', name: 'Venus', primary: '#FFFF99', accent: '#FFC649', glow: false, moons: 0 },
  64: { type: 'earth', name: 'Earth', primary: '#87CEEB', accent: '#6B93D6', glow: false, moons: 1 },
  128: { type: 'neptune', name: 'Neptune', primary: '#4169E1', accent: '#0000FF', glow: false, moons: 14 },
  256: { type: 'uranus', name: 'Uranus', primary: '#4FD0E3', accent: '#48CAE4', glow: false, moons: 27 },
  512: { type: 'saturn', name: 'Saturn', primary: '#FFEAA7', accent: '#FAD5A5', glow: false, moons: 146 },
  1024: { type: 'jupiter', name: 'Jupiter', primary: '#FF8C42', accent: '#FF7538', glow: false, moons: 95 },
  2048: { type: 'polaris', name: 'Polaris', primary: '#FFD700', accent: '#FFA500', glow: true, moons: 0 },
  4096: { type: 'sun', name: 'Sun', primary: '#FFD700', accent: '#FFA500', glow: true, moons: 0 },
  8192: { type: 'sirius', name: 'Sirius', primary: '#87CEEB', accent: '#4169E1', glow: true, moons: 0 },
  16384: { type: 'orion_nebula', name: 'Orion Nebula', primary: '#9370DB', accent: '#8A2BE2', glow: true, moons: 0 },
  32768: { type: 'pleiades', name: 'Pleiades', primary: '#87CEEB', accent: '#00BFFF', glow: true, moons: 0 },
  65536: { type: 'milky_way', name: 'Milky Way', primary: '#483D8B', accent: '#6A5ACD', glow: true, moons: 0 },
  131072: { type: 'quasar', name: 'Quasar', primary: '#FF4500', accent: '#FF6347', glow: true, moons: 0 },
  262144: { type: 'black_hole', name: 'Black Hole', primary: '#000000', accent: '#FFD700', glow: true, moons: 0 },
  524288: { type: 'galaxy_cluster', name: 'Galaxy Cluster', primary: '#4B0082', accent: '#8A2BE2', glow: true, moons: 0 },
  1048576: { type: 'supercluster', name: 'Supercluster', primary: '#2E0854', accent: '#4B0082', glow: true, moons: 0 },
  2097152: { type: 'cosmic_web', name: 'Cosmic Web', primary: '#1B0B3A', accent: '#2E0854', glow: true, moons: 0 },
  4194304: { type: 'multiverse', name: 'Multiverse', primary: '#0A0A1A', accent: '#1B0B3A', glow: true, moons: 0 },
  8388608: { type: 'infinity', name: '∞ Infinity', primary: '#FFD700', accent: '#FFA500', glow: true, moons: 0 }
};

// ===========================
// 2. PLANET COLORS & STYLES
// ===========================

export const PLANET_COLORS = {
  pluto: ['#8DA3B0', '#6B7D87', '#4A5D6B'],
  moon: ['#C5B89A', '#A69B85', '#8B7F6B'],
  mercury: ['#8B6F3D', '#6B5328', '#4A3B1F'],
  mars: ['#FF6B47', '#CD5C5C', '#B22222'],
  venus: ['#FFFF99', '#FFC649', '#DAA520'],
  earth: ['#87CEEB', '#6B93D6', '#4682B4'],
  neptune: ['#4169E1', '#0000FF', '#191970'],
  uranus: ['#4FD0E3', '#48CAE4', '#0077BE'],
  saturn: ['#FFEAA7', '#FAD5A5', '#DDB892'],
  jupiter: ['#FF8C42', '#FF7538', '#E76F51']
};

// ===========================
// 3. ANIMATION CONFIGURATIONS
// ===========================

export const ANIMATION_CONFIG = {
  rotation: {
    duration: 15000,
    useNativeDriver: true
  },
  pulse: {
    duration: 4000,
    useNativeDriver: true
  },
  glow: {
    minOpacity: 0.7,
    maxOpacity: 0.9
  }
};

// ===========================
// 4. HELPER FUNCTIONS
// ===========================

export const getPlanetType = (value) => PLANET_TYPES[value] || PLANET_TYPES[2];
export const getPlanetColor = (value) => getPlanetType(value).primary;
export const getPlanetName = (value) => getPlanetType(value).name;
export const isGlowingPlanet = (value) => getPlanetType(value).glow || false;
export const getPlanetMoons = (value) => getPlanetType(value).moons || 0;

// ===========================
// 5. CSS STYLES
// ===========================

export const PLANET_STYLES = {
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  planet: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    elevation: 8
  },
  info: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  name: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2
  },
  value: {
    color: '#FFD700',
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2
  }
};
