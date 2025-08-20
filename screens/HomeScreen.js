import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import useGameStore from '../store/gameStore';
import ContinuousStarfield from '../components/MovingStarfield';
import SolarSystemView from '../components/SolarSystemView';

import { formatPlanetValue } from '../utils/helpers';
import { getPlanetType } from '../components/constants';
import comprehensiveGameAnalytics from '../utils/comprehensiveGameAnalytics';

const getDimensions = () => {
  if (Platform.OS === 'web') {
    return {
      width: Math.min(window.innerWidth, 400),
      height: Platform.OS === 'web' ? 800 : 800
    };
  } else {
    return Dimensions.get('window');
  }
};

const { width, height } = getDimensions();

// Enhanced Star Field component
const StarField = ({ count = 50 }) => {
  const stars = Array.from({ length: count }, (_, i) => {
    const size = Math.random() * 2 + 0.5;
    const opacity = Math.random() * 0.8 + 0.2;
    return (
      <TwinklingStar
        key={i}
        size={size}
        left={Math.random() * width}
        top={Math.random() * height}
        opacity={opacity}
        duration={Math.random() * 3000 + 2000}
        delay={Math.random() * 2000}
      />
    );
  });

  return <View style={styles.starField}>{stars}</View>;
};

const TwinklingStar = ({ size, left, top, opacity, duration, delay }) => {
  const twinkleAnim = useRef(new Animated.Value(opacity)).current;

  useEffect(() => {
    const twinkleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(twinkleAnim, {
          toValue: Math.min(opacity + 0.4, 1),
          duration: duration,
          useNativeDriver: true,
        }),
        Animated.timing(twinkleAnim, {
          toValue: Math.max(opacity - 0.2, 0.1),
          duration: duration,
          useNativeDriver: true,
        }),
      ])
    );

    setTimeout(() => {
      twinkleAnimation.start();
    }, delay);

    return () => twinkleAnimation.stop();
  }, []);

  return (
    <Animated.View
      style={[
        styles.star,
        {
          width: size,
          height: size,
          left: left,
          top: top,
          opacity: twinkleAnim,
        },
      ]}
    />
  );
};

const HomeScreen = ({ navigation }) => {
  const { 
    highScore, 
    highestBlock, 
    hasSavedGame,
    clearSavedGame 
  } = useGameStore();

  // Refined entrance animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const titleShimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Smooth entrance sequence
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    // Subtle title shimmer effect
    const titleShimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(titleShimmerAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(titleShimmerAnim, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    );
    titleShimmer.start();

    // Track home screen view for analytics
    comprehensiveGameAnalytics.trackScreenView('Home');

    return () => titleShimmer.stop();
  }, []);

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
    if (block === null || block === 0) return 'No celestial bodies yet';
    const planet = getPlanetType(block);
    return `${planet.name} (${formatPlanetValue(block)})`;
  };

  const titleShimmerOpacity = titleShimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a1a" />
      
      {/* Enhanced Deep Space Background */}
      <View style={styles.spaceBackground}>
        {/* Moving starfield for space travel feel - OPTIMIZED */}
        <ContinuousStarfield starCount={25} speed="slow" spawnRate={4000} />
        
        {/* Refined nebula effects */}
        <View style={styles.nebula} />
        <View style={styles.nebula2} />
        <View style={styles.nebula3} />
        
        {/* Static star field */}
        <StarField count={35} />
        
        {/* Realistic Solar System View */}
        <SolarSystemView opacity={0.5} scale={0.8} />
      </View>
      
      <Animated.View 
        style={[
          styles.content, 
          { 
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        {/* Enhanced Cosmic Title */}
        <View style={styles.titleContainer}>
          <Animated.Text 
            style={[
              styles.gameTitle,
              {
                opacity: titleShimmerOpacity,
              }
            ]}
          >
            COSMIC
          </Animated.Text>
          <Animated.Text 
            style={[
              styles.gameSubtitle,
              {
                opacity: titleShimmerOpacity,
              }
            ]}
          >
            FUSION
          </Animated.Text>
        </View>
        
        {/* Enhanced Cosmic Stats */}
        {(highScore > 0 || highestBlock > 0) && (
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>BEST SCORE</Text>
              <Text style={styles.statValue}>{formatScore(highScore)}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>HIGHEST BODY</Text>
              <Text style={styles.statValue}>{formatBlock(highestBlock)}</Text>
            </View>
          </View>
        )}
        
        {/* Enhanced Cosmic Buttons */}
        <View style={styles.buttonContainer}>
          {hasSavedGame ? (
            <>
              <TouchableOpacity 
                style={[styles.button, styles.primaryButton]} 
                onPress={handleResumePress}
                activeOpacity={0.8}
              >
                <View style={styles.buttonGlow} />
                <Text style={styles.buttonText}>RESUME JOURNEY</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, styles.secondaryButton]} 
                onPress={handleNewGamePress}
                activeOpacity={0.8}
              >
                <View style={styles.buttonGlow2} />
                <Text style={styles.secondaryButtonText}>NEW UNIVERSE</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity 
              style={[styles.button, styles.primaryButton]} 
              onPress={handlePlayPress}
              activeOpacity={0.8}
            >
              <View style={styles.buttonGlow} />
              <Text style={styles.buttonText}>ENTER COSMOS</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[styles.button, styles.tertiaryButton]} 
            onPress={handleSettingsPress}
            activeOpacity={0.8}
          >
            <Text style={styles.tertiaryButtonText}>SETTINGS</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
    // Ensure full height usage on iPad
    minHeight: '100%',
    ...(width >= 768 && {
      height: '100%',
    }),
  },
  
  spaceBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #16213e 100%)',
  },
  
  nebula: {
    position: 'absolute',
    width: width * 0.7,
    height: height * 0.5,
    left: width * 0.15,
    top: height * 0.25,
    backgroundColor: 'rgba(138, 43, 226, 0.06)',
    borderRadius: width * 0.35,
    transform: [{ rotate: '45deg' }],
  },
  
  nebula2: {
    position: 'absolute',
    width: width * 0.5,
    height: height * 0.3,
    right: -width * 0.15,
    bottom: height * 0.15,
    backgroundColor: 'rgba(30, 144, 255, 0.04)',
    borderRadius: width * 0.25,
    transform: [{ rotate: '-30deg' }],
  },

  nebula3: {
    position: 'absolute',
    width: width * 0.4,
    height: height * 0.25,
    left: -width * 0.1,
    top: height * 0.05,
    backgroundColor: 'rgba(255, 107, 53, 0.03)',
    borderRadius: width * 0.2,
    transform: [{ rotate: '15deg' }],
  },
  
  starField: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  
  star: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
  },
  
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    zIndex: 10,
  },
  
  titleContainer: {
    alignItems: 'center',
    marginBottom: 60,
    zIndex: 10,
  },
  
  gameTitle: {
    fontSize: 60,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 8,
    textShadowColor: '#4A90E2',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 25,
    marginBottom: -10,
  },
  
  gameSubtitle: {
    fontSize: 24,
    fontWeight: '300',
    color: '#B0C4DE',
    textAlign: 'center',
    letterSpacing: 4,
    textShadowColor: '#9B59B6',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    maxWidth: 320,
    marginBottom: 50,
  },
  
  statBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    paddingVertical: 15,
    paddingHorizontal: 22,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 226, 0.2)',
    minWidth: 120,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    shadowOpacity: 0.2,
  },
  
  statLabel: {
    fontSize: 10,
    color: '#B0C4DE',
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 4,
  },
  
  statValue: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '700',
    textShadowColor: '#4A90E2',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
  },
  
  button: {
    width: '100%',
    borderRadius: 28,
    paddingVertical: 18,
    paddingHorizontal: 30,
    marginVertical: 10,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  
  primaryButton: {
    backgroundColor: 'rgba(74, 144, 226, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(74, 144, 226, 0.6)',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 15,
  },
  
  secondaryButton: {
    backgroundColor: 'rgba(155, 89, 182, 0.15)',
    borderColor: 'rgba(155, 89, 182, 0.6)',
    shadowColor: '#9B59B6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 12,
  },
  
  tertiaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  
  buttonGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(74, 144, 226, 0.08)',
    borderRadius: 28,
  },
  
  buttonGlow2: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(155, 89, 182, 0.08)',
    borderRadius: 28,
  },
  
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 2,
    textShadowColor: '#4A90E2',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 1.5,
    textShadowColor: '#9B59B6',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  
  tertiaryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#B0C4DE',
    letterSpacing: 1,
  },
});

export default HomeScreen;
