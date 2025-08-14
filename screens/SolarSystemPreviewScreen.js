import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import PlanetTile from '../components/PlanetTile';
import { getPlanetType, CELL_SIZE } from '../components/constants';

// Debug import
console.log('Import debug - getPlanetType:', typeof getPlanetType);

const { width, height } = Dimensions.get('window');

// Dynamically generate game tiles using getPlanetType - ensures consistency with game
// Any changes to planet types in constants.js will automatically update this preview
const generateGameTiles = () => {
  try {
    const tiles = [];
    
    // Define the values we want to show (all the planet values from the game)
    const planetValues = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536, 131072, 262144, 1048576];
    
    // Generate tiles using getPlanetType for each value
    planetValues.forEach(value => {
      try {
        const planet = getPlanetType(value);
        if (planet && planet.name && planet.type) {
          tiles.push({
            value: value,
            name: planet.name,
            type: planet.type
          });
        }
      } catch (error) {
        console.log(`Error getting planet type for ${value}:`, error);
      }
    });
    
    // Sort by value to show progression
    tiles.sort((a, b) => a.value - b.value);
    console.log('Successfully generated tiles using getPlanetType:', tiles.length);
    
    return tiles;
  } catch (error) {
    console.log('Error generating tiles:', error);
    return [];
  }
};

// Move tile generation inside component to ensure imports are resolved
let GAME_TILES = [];

const GameTilesPreviewScreen = ({ navigation }) => {
  const [selectedTile, setSelectedTile] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(1);
  const rotationAnimations = useRef({});
  const pulseAnimations = useRef({});

  // Initialize tiles and animations
  useEffect(() => {
    // Generate tiles from constants
    const tiles = generateGameTiles();
    if (tiles && tiles.length > 0) {
      GAME_TILES = tiles;
      console.log('Generated tiles:', GAME_TILES);
    } else {
      // Fallback to ensure we have tiles to display
      console.log('Falling back to hardcoded tiles');
      GAME_TILES = [
        { value: 2, name: 'Pluto', type: 'pluto' },
        { value: 4, name: 'Moon', type: 'moon' },
        { value: 8, name: 'Mercury', type: 'mercury' },
        { value: 16, name: 'Mars', type: 'mars' },
        { value: 32, name: 'Venus', type: 'venus' },
        { value: 64, name: 'Earth', type: 'earth' },
        { value: 128, name: 'Neptune', type: 'neptune' },
        { value: 256, name: 'Uranus', type: 'uranus' },
        { value: 512, name: 'Saturn', type: 'saturn' },
        { value: 1024, name: 'Jupiter', type: 'jupiter' },
        { value: 2048, name: 'Polaris', type: 'polaris' },
        { value: 4096, name: 'Sun', type: 'sun' },
        { value: 8192, name: 'Sirius', type: 'sirius' },
        { value: 16384, name: 'Orion Nebula', type: 'orion_nebula' },
        { value: 32768, name: 'Pleiades', type: 'pleiades' },
        { value: 65536, name: 'Milky Way', type: 'milky_way' },
        { value: 131072, name: 'Quasar', type: 'quasar' },
        { value: 262144, name: 'Supernova', type: 'supernova' },
        { value: 1048576, name: 'Black Hole', type: 'ultimate_black_hole' }
      ];
    }
    
    // Initialize animations for each tile
    GAME_TILES.forEach((tile) => {
      rotationAnimations.current[tile.value] = new Animated.Value(0);
      pulseAnimations.current[tile.value] = new Animated.Value(1);
    });
    startAnimations();
  }, []);

  // Restart animations when speed changes
  useEffect(() => {
    if (!isPaused) {
      stopAnimations();
      startAnimations();
    }
  }, [animationSpeed]);

  const startAnimations = () => {
    GAME_TILES.forEach((tile) => {
      // Rotation animation
      Animated.loop(
        Animated.timing(rotationAnimations.current[tile.value], {
          toValue: 1,
          duration: (8000 / animationSpeed),
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      // Pulse animation for special tiles
      const planet = getPlanetType(tile.value);
      if (planet.glow) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnimations.current[tile.value], {
              toValue: 1.2,
              duration: (2000 / animationSpeed),
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnimations.current[tile.value], {
              toValue: 1,
              duration: (2000 / animationSpeed),
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        ).start();
      }
    });
  };

  const stopAnimations = () => {
    Object.values(rotationAnimations.current).forEach((anim) => {
      anim.stopAnimation();
    });
    Object.values(pulseAnimations.current).forEach((anim) => {
      anim.stopAnimation();
    });
  };

  const togglePause = () => {
    if (isPaused) {
      startAnimations();
    } else {
      stopAnimations();
    }
    setIsPaused(!isPaused);
  };

  const renderGameTile = (tile, index) => {
    const rotation = rotationAnimations.current[tile.value]?.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    }) || '0deg';

    const pulse = pulseAnimations.current[tile.value]?.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.2],
    }) || 1;

    const planet = getPlanetType(tile.value);
    const isSpecial = planet.glow;
    const tileSize = CELL_SIZE * zoomLevel;

    return (
      <TouchableOpacity
        key={tile.value}
        onPress={() => setSelectedTile(selectedTile?.value === tile.value ? null : tile)}
        activeOpacity={0.8}
        style={styles.tileContainer}
      >
        <Animated.View
          style={[
            styles.gameTile,
            {
              width: tileSize,
              height: tileSize,
              transform: [
                { rotate: isSpecial ? rotation : '0deg' },
                { scale: pulse }
              ],
              borderWidth: selectedTile?.value === tile.value ? 4 : 0,
              borderColor: selectedTile?.value === tile.value ? '#FFD700' : 'transparent',
            },
          ]}
        >
          {/* Use the actual PlanetTile component */}
          <PlanetTile 
            value={tile.value}
            size={tileSize}
            isOrbiting={isSpecial}
            orbitSpeed={1}
          />
          
          {/* Glow effect for selected tile */}
          {selectedTile?.value === tile.value && (
            <View style={[
              styles.selectionGlow,
              { width: tileSize + 20, height: tileSize + 20 }
            ]} />
          )}
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000428', '#004e92', '#000428']}
        style={styles.background}
      >
        {/* Starfield background */}
        <View style={styles.starfield}>
          {Array.from({ length: 100 }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.star,
                {
                  left: Math.random() * width,
                  top: Math.random() * height,
                  opacity: Math.random() * 0.8 + 0.2,
                },
              ]}
            />
          ))}
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Solar System Preview</Text>
          <Text style={styles.subtitle}>All celestial bodies from {GAME_TILES[0]?.value || 2} to {GAME_TILES[GAME_TILES.length - 1]?.value || '∞'}</Text>
        </View>

        {/* Game Tiles Grid */}
        <ScrollView 
          style={styles.tilesContainer}
          contentContainerStyle={styles.tilesContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.tilesGrid}>
            {GAME_TILES.map((tile, index) => renderGameTile(tile, index))}
          </View>
        </ScrollView>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={togglePause}
          >
            <Text style={styles.controlButtonText}>
              {isPaused ? '▶️' : '⏸️'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setAnimationSpeed(animationSpeed === 1 ? 2 : animationSpeed === 2 ? 0.5 : 1)}
          >
            <Text style={styles.controlButtonText}>
              {animationSpeed === 1 ? '⚡' : animationSpeed === 2 ? '🐌' : '⚡'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setZoomLevel(zoomLevel === 1 ? 1.5 : zoomLevel === 1.5 ? 0.7 : 1)}
          >
            <Text style={styles.controlButtonText}>
              {zoomLevel === 1 ? '🔍' : zoomLevel === 1.5 ? '🔍' : '🔍'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.controlButtonText}>🔙</Text>
          </TouchableOpacity>
        </View>

        {/* Info Panel */}
        {selectedTile && (
          <View style={styles.infoPanel}>
            <Text style={styles.tileName}>{selectedTile.name}</Text>
            <Text style={styles.tileDescription}>{getPlanetType(selectedTile.value).description}</Text>
            <Text style={styles.tileType}>Type: {getPlanetType(selectedTile.value).type}</Text>
            <Text style={styles.tileValue}>Value: {selectedTile.value}</Text>
            <Text style={styles.tileDiameter}>Diameter: {getPlanetType(selectedTile.value).diameter}</Text>
          </View>
        )}

        {/* Legend */}
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Celestial Types</Text>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#8C7853' }]} />
            <Text style={styles.legendText}>Planets</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#87CEEB' }]} />
            <Text style={styles.legendText}>Stars</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#9370DB' }]} />
            <Text style={styles.legendText}>Nebulae</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#483D8B' }]} />
            <Text style={styles.legendText}>Galaxies</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#000000' }]} />
            <Text style={styles.legendText}>Black Holes</Text>
          </View>
        </View>

        {/* Selection Guide */}
        <View style={styles.selectionGuide}>
          <Text style={styles.guideText}>Tap any tile to see details</Text>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  starfield: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  star: {
    position: 'absolute',
    width: 2,
    height: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
  },
  titleContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 10,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: '#000000',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    color: '#CCCCCC',
    fontSize: 16,
    textAlign: 'center',
    textShadowColor: '#000000',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  tilesContainer: {
    flex: 1,
    marginTop: 150,
  },
  tilesContent: {
    paddingBottom: 100,
  },
  tilesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 20,
  },
  tileContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameTile: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  selectionGlow: {
    position: 'absolute',
    borderRadius: 1000,
    backgroundColor: 'rgba(255, 215, 0, 0.3)',
    top: -10,
    left: -10,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 15,
  },
  controls: {
    position: 'absolute',
    top: 50,
    right: 20,
    flexDirection: 'row',
    gap: 10,
    zIndex: 10,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  controlButtonText: {
    fontSize: 20,
  },
  infoPanel: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    zIndex: 10,
  },
  tileName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  tileDescription: {
    color: '#CCCCCC',
    fontSize: 16,
    marginBottom: 8,
  },
  tileType: {
    color: '#AAAAAA',
    fontSize: 14,
    marginBottom: 4,
  },
  tileValue: {
    color: '#AAAAAA',
    fontSize: 14,
    marginBottom: 4,
  },
  tileDiameter: {
    color: '#AAAAAA',
    fontSize: 14,
  },
  legend: {
    position: 'absolute',
    top: 150,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    minWidth: 120,
    zIndex: 10,
  },
  legendTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    color: '#CCCCCC',
    fontSize: 12,
  },
  selectionGuide: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    zIndex: 10,
  },
  guideText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default GameTilesPreviewScreen;
