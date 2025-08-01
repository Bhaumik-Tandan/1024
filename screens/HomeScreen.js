import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Platform,
  Animated,
} from 'react-native';
import useGameStore from '../store/gameStore';
import SpaceBackground from '../components/SpaceBackground';
import { THEME, FONT_SIZES } from '../components/constants';

// Web-compatible dimensions
const getDimensions = () => {
  try {
    const dimensions = Dimensions.get('window');
    return {
      width: dimensions?.width || (Platform.OS === 'web' ? 400 : 400),
      height: dimensions?.height || (Platform.OS === 'web' ? 800 : 800)
    };
  } catch (error) {
    return {
      width: Platform.OS === 'web' ? 400 : 400,
      height: Platform.OS === 'web' ? 800 : 800
    };
  }
};

const { width, height } = getDimensions();

const HomeScreen = ({ navigation }) => {
  const { 
    highScore, 
    highestBlock, 
    hasSavedGame,
    clearSavedGame 
  } = useGameStore();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const titleGlowAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Title glow animation
    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(titleGlowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(titleGlowAnim, {
          toValue: 0.5,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    );
    glowAnimation.start();

    return () => glowAnimation.stop();
  }, [fadeAnim, slideAnim, titleGlowAnim]);

  const handlePlayPress = () => {
    navigation.navigate('Drop Number Board');
  };

  const handleResumePress = () => {
    navigation.navigate('Drop Number Board', { resume: true });
  };

  const handleSettingsPress = () => {
    navigation.navigate('Settings');
  };

  const handleNewGamePress = () => {
    clearSavedGame();
    navigation.navigate('Drop Number Board');
  };

  const formatScore = (score) => {
    if (score === null || score === 0) return '0';
    return score.toLocaleString();
  };

  const formatBlock = (block) => {
    if (block === null || block === 0) return '0';
    return block.toLocaleString();
  };

  const getBlockColor = (value) => {
    const colors = {
      2: '#eee4da',
      4: '#ede0c8',
      8: '#f2b179',
      16: '#f59563',
      32: '#f67c5f',
      64: '#f65e3b',
      128: '#edcf72',
      256: '#edcc61',
      512: '#edc850',
      1024: '#edc53f',
      2048: '#edc22e',
    };
    return colors[value] || '#3c3a32';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.DARK.BACKGROUND_PRIMARY} />
      
      {/* Beautiful Space Background */}
      <SpaceBackground />
      
      {/* Main Content with Cosmic Design */}
      <Animated.View 
        style={[
          styles.content, 
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        {/* Cosmic Title */}
        <View style={styles.titleContainer}>
          <Animated.Text 
            style={[
              styles.gameTitle,
              {
                textShadowRadius: titleGlowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [10, 25],
                }),
              }
            ]}
          >
            🌌 UNIVERSE
          </Animated.Text>
          <Text style={styles.gameSubtitle}>PLANET FORGE</Text>
          <Text style={styles.tagline}>Merge cosmic elements to birth new worlds</Text>
        </View>
        
        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>HIGH SCORE</Text>
            <Text style={styles.statValue}>{formatScore(highScore)}</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>HIGHEST BLOCK</Text>
            <Text style={styles.statValue}>{formatBlock(highestBlock)}</Text>
          </View>
        </View>
        
        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {hasSavedGame ? (
            <>
              <TouchableOpacity 
                style={[styles.button, styles.primaryButton]} 
                onPress={handleResumePress}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryButtonText}>🌌 RESUME JOURNEY</Text>
                <Text style={styles.buttonSubtext}>Continue exploring the cosmos</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, styles.secondaryButton]} 
                onPress={handleNewGamePress}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryButtonText}>🌟 NEW UNIVERSE</Text>
                <Text style={styles.buttonSubtext}>Create a fresh cosmic world</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity 
              style={[styles.button, styles.primaryButton]} 
              onPress={handlePlayPress}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>🚀 BEGIN CREATION</Text>
              <Text style={styles.buttonSubtext}>Start forging planets and stars</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[styles.button, styles.settingsButton]} 
            onPress={handleSettingsPress}
            activeOpacity={0.8}
          >
            <Text style={styles.settingsButtonText}>⚙️ COSMIC SETTINGS</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.DARK.BACKGROUND_PRIMARY,
  },
  
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
    zIndex: 1,
  },
  
  titleContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  
  gameTitle: {
    fontSize: Math.min(48, width * 0.12),
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 4,
    textShadowColor: THEME.DARK.COSMIC_ACCENT,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    marginBottom: 5,
  },
  
  gameSubtitle: {
    fontSize: Math.min(24, width * 0.06),
    fontWeight: '700',
    color: THEME.DARK.COSMIC_ACCENT,
    textAlign: 'center',
    letterSpacing: 2,
    textShadowColor: 'rgba(0,191,255,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
    marginBottom: 15,
  },
  
  tagline: {
    fontSize: FONT_SIZES.MEDIUM,
    color: THEME.DARK.TEXT_SECONDARY,
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 1,
  },
  
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 350,
    marginVertical: 20,
  },
  
  statCard: {
    backgroundColor: 'rgba(25, 30, 40, 0.9)',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 226, 0.3)',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  
  statLabel: {
    fontSize: FONT_SIZES.SMALL,
    color: THEME.DARK.TEXT_SECONDARY,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 8,
  },
  
  statValue: {
    fontSize: FONT_SIZES.LARGE,
    color: THEME.DARK.COSMIC_ACCENT,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,191,255,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 5,
  },
  
  buttonContainer: {
    width: '100%',
    maxWidth: 350,
    alignItems: 'center',
  },
  
  button: {
    width: '100%',
    borderRadius: 25,
    paddingVertical: 18,
    paddingHorizontal: 25,
    marginVertical: 8,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 10,
  },
  
  primaryButton: {
    backgroundColor: 'linear-gradient(45deg, #FF6B35, #FF8E53)',
    borderWidth: 2,
    borderColor: '#FF8E53',
    shadowColor: '#FF6B35',
  },
  
  secondaryButton: {
    backgroundColor: 'rgba(46, 204, 113, 0.9)',
    borderWidth: 2,
    borderColor: '#2ECC71',
    shadowColor: '#2ECC71',
  },
  
  tertiaryButton: {
    backgroundColor: 'rgba(155, 89, 182, 0.9)',
    borderWidth: 2,
    borderColor: '#9B59B6',
    shadowColor: '#9B59B6',
  },
  
  settingsButton: {
    backgroundColor: 'rgba(52, 73, 94, 0.8)',
    borderWidth: 1,
    borderColor: '#34495E',
    shadowColor: '#34495E',
    paddingVertical: 12,
  },
  
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  iconText: {
    fontSize: 24,
    marginRight: 10,
  },
  
  primaryButtonText: {
    fontSize: FONT_SIZES.LARGE,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  
  secondaryButtonText: {
    fontSize: FONT_SIZES.LARGE,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  
  tertiaryButtonText: {
    fontSize: FONT_SIZES.LARGE,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  
  settingsButtonText: {
    fontSize: FONT_SIZES.MEDIUM,
    fontWeight: '600',
    color: THEME.DARK.TEXT_SECONDARY,
    letterSpacing: 1,
  },
  
  buttonSubtext: {
    fontSize: FONT_SIZES.SMALL,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
});

export default HomeScreen;
