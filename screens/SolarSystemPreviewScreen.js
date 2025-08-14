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
  FlatList,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import PlanetTile from '../components/PlanetTile';
import { getPlanetType, CELL_SIZE } from '../components/constants';

const { width, height } = Dimensions.get('window');

// Planet categories for better organization
const PLANET_CATEGORIES = {
  'Solar System': [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024],
  'Deep Space': [2048, 4096, 8192],
  'Cosmic Wonders': [16384, 32768, 65536, 131072, 262144, 1048576]
};

const GameTilesPreviewScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState('Solar System');
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Generate planet data for selected category
  const getPlanetsForCategory = (category) => {
    const values = PLANET_CATEGORIES[category];
    return values.map(value => {
      const planet = getPlanetType(value);
      return {
        value,
        name: planet?.name || `Planet ${value}`,
        type: planet?.type || 'unknown',
        description: planet?.description || 'A mysterious celestial body',
        diameter: planet?.diameter || 'Unknown',
        mass: planet?.mass || 'Unknown'
      };
    });
  };

  // Animate in the selected planet
  const animatePlanetSelection = (planet) => {
    setSelectedPlanet(planet);
    setIsLoading(true);
    
    // Fade in animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start(() => setIsLoading(false));
  };

  // Reset animations when changing category
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setSelectedPlanet(null);
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
  };

  useEffect(() => {
    // Initial animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const renderPlanetItem = ({ item }) => (
    <TouchableOpacity
      style={styles.planetItem}
      onPress={() => animatePlanetSelection(item)}
      activeOpacity={0.7}
    >
      <View style={styles.planetItemContent}>
        <PlanetTile value={item.value} size={CELL_SIZE * 0.6} />
        <View style={styles.planetItemInfo}>
          <Text style={styles.planetName}>{item.name}</Text>
          <Text style={styles.planetValue}>Value: {item.value.toLocaleString()}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCategoryTab = (category) => (
    <TouchableOpacity
      key={category}
      style={[
        styles.categoryTab,
        selectedCategory === category && styles.categoryTabActive
      ]}
      onPress={() => handleCategoryChange(category)}
    >
      <Text style={[
        styles.categoryTabText,
        selectedCategory === category && styles.categoryTabTextActive
      ]}>
        {category}
      </Text>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={['#0B0B2A', '#1A1A3A', '#2D1B69']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0B0B2A" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Solar System Preview</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Category Tabs */}
      <View style={styles.categoryTabs}>
        {Object.keys(PLANET_CATEGORIES).map(renderCategoryTab)}
      </View>

      {/* Content Area */}
      <View style={styles.content}>
        {/* Planet Grid */}
        <View style={styles.planetGrid}>
          <FlatList
            data={getPlanetsForCategory(selectedCategory)}
            renderItem={renderPlanetItem}
            keyExtractor={(item) => item.value.toString()}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.planetGridContent}
            initialNumToRender={6}
            maxToRenderPerBatch={6}
            windowSize={5}
            removeClippedSubviews={true}
          />
        </View>

        {/* Selected Planet Details */}
        {selectedPlanet && (
          <Animated.View
            style={[
              styles.planetDetails,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.planetDetailsHeader}>
              <Text style={styles.planetDetailsTitle}>{selectedPlanet.name}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedPlanet(null)}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.planetDetailsContent}>
              <View style={styles.planetPreview}>
                <PlanetTile value={selectedPlanet.value} size={CELL_SIZE * 1.2} />
              </View>
              
              <View style={styles.planetInfo}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Value:</Text>
                  <Text style={styles.infoValue}>{selectedPlanet.value.toLocaleString()}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Type:</Text>
                  <Text style={styles.infoValue}>{selectedPlanet.type}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Diameter:</Text>
                  <Text style={styles.infoValue}>{selectedPlanet.diameter}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Mass:</Text>
                  <Text style={styles.infoValue}>{selectedPlanet.mass}</Text>
                </View>
              </View>
            </View>
          </Animated.View>
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B2A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  categoryTabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  categoryTab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  categoryTabActive: {
    backgroundColor: '#6A5ACD',
  },
  categoryTabText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  categoryTabTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  planetGrid: {
    flex: 1,
  },
  planetGridContent: {
    paddingBottom: 20,
  },
  planetItem: {
    flex: 1,
    margin: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  planetItemContent: {
    alignItems: 'center',
  },
  planetItemInfo: {
    marginTop: 12,
    alignItems: 'center',
  },
  planetName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  planetValue: {
    color: '#CCCCCC',
    fontSize: 12,
    textAlign: 'center',
  },
  planetDetails: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.95)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  planetDetailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  planetDetailsTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  planetDetailsContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planetPreview: {
    marginRight: 20,
  },
  planetInfo: {
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    color: '#CCCCCC',
    fontSize: 16,
  },
  infoValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GameTilesPreviewScreen;
