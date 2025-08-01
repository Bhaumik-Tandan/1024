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
import { THEME, FONT_SIZES } from '../components/constants';
import { ContinuousStarfield } from '../components/MovingStarfield';

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

// Celestial body component for animated space objects
const CelestialBody = ({ size, color, initialX, initialY, duration, delay }) => {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Floating animation
    const floatingAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: duration,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: duration,
          useNativeDriver: true,
        }),
      ])
    );

    // Glow animation
    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000 + delay,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000 + delay,
          useNativeDriver: true,
        }),
      ])
    );

    // Start with delay
    setTimeout(() => {
      floatingAnimation.start();
      glowAnimation.start();
    }, delay);

    return () => {
      floatingAnimation.stop();
      glowAnimation.stop();
    };
  }, []);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <Animated.View
      style={[
        styles.celestialBody,
        {
          width: size,
          height: size,
          backgroundColor: color,
          left: initialX,
          top: initialY,
          transform: [{ translateY }],
          shadowOpacity: glowOpacity,
          shadowColor: color,
          shadowRadius: size * 0.8,
          elevation: 10,
        },
      ]}
    />
  );
};

// Star field component
const StarField = ({ count = 50 }) => {
  const stars = useRef([]);
  
  // Generate random star positions
  if (stars.current.length === 0) {
    for (let i = 0; i < count; i++) {
      stars.current.push({
        id: i,
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.8 + 0.2,
        twinkleDuration: Math.random() * 3000 + 2000,
      });
    }
  }

  return (
    <View style={styles.starField}>
      {stars.current.map((star) => (
        <TwinklingStar key={star.id} {...star} />
      ))}
    </View>
  );
};

// Individual twinkling star
const TwinklingStar = ({ x, y, size, opacity, twinkleDuration }) => {
  const twinkleAnim = useRef(new Animated.Value(opacity)).current;

  useEffect(() => {
    const twinkle = Animated.loop(
      Animated.sequence([
        Animated.timing(twinkleAnim, {
          toValue: opacity * 0.3,
          duration: twinkleDuration,
          useNativeDriver: true,
        }),
        Animated.timing(twinkleAnim, {
          toValue: opacity,
          duration: twinkleDuration,
          useNativeDriver: true,
        }),
      ])
    );
    
    twinkle.start();
    return () => twinkle.stop();
  }, []);

  return (
    <Animated.View
      style={[
        styles.star,
        {
          left: x,
          top: y,
          width: size,
          height: size,
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

  // Universe entrance animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const titleGlowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance sequence
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Title glow animation
    const titleGlow = Animated.loop(
      Animated.sequence([
        Animated.timing(titleGlowAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(titleGlowAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    );
    titleGlow.start();

    return () => titleGlow.stop();
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
    if (block === null || block === 0) return '0';
    return block.toLocaleString();
  };

  const titleGlowOpacity = titleGlowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a1a" />
      
      {/* Deep Space Background */}
      <View style={styles.spaceBackground}>
        {/* Moving starfield for space travel feel */}
        <ContinuousStarfield starCount={120} speed="medium" spawnRate={1500} />
        
        {/* Nebula effect */}
        <View style={styles.nebula} />
        <View style={styles.nebula2} />
        
        {/* Static star field */}
        <StarField count={40} />
        
        {/* Animated celestial bodies */}
        <CelestialBody 
          size={60} 
          color="#FF6B35" 
          initialX={width * 0.1} 
          initialY={height * 0.15} 
          duration={4000} 
          delay={0} 
        />
        <CelestialBody 
          size={45} 
          color="#4A90E2" 
          initialX={width * 0.8} 
          initialY={height * 0.25} 
          duration={5000} 
          delay={1000} 
        />
        <CelestialBody 
          size={35} 
          color="#9B59B6" 
          initialX={width * 0.15} 
          initialY={height * 0.7} 
          duration={6000} 
          delay={2000} 
        />
        <CelestialBody 
          size={50} 
          color="#F39C12" 
          initialX={width * 0.85} 
          initialY={height * 0.8} 
          duration={3500} 
          delay={1500} 
        />
        <CelestialBody 
          size={25} 
          color="#E74C3C" 
          initialX={width * 0.05} 
          initialY={height * 0.45} 
          duration={7000} 
          delay={500} 
        />
        <CelestialBody 
          size={40} 
          color="#1ABC9C" 
          initialX={width * 0.9} 
          initialY={height * 0.6} 
          duration={4500} 
          delay={2500} 
        />
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
        {/* Cosmic Title */}
        <View style={styles.titleContainer}>
          <Animated.Text 
            style={[
              styles.gameTitle,
              {
                opacity: titleGlowOpacity,
              }
            ]}
          >
            SPACE
          </Animated.Text>
          <Animated.Text 
            style={[
              styles.gameSubtitle,
              {
                opacity: titleGlowOpacity,
              }
            ]}
          >
            DROP
          </Animated.Text>
        </View>
        
        {/* Cosmic Stats */}
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
        
        {/* Cosmic Buttons */}
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
  },
  
  spaceBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #16213e 100%)',
  },
  
  nebula: {
    position: 'absolute',
    width: width * 0.8,
    height: height * 0.6,
    left: width * 0.1,
    top: height * 0.2,
    backgroundColor: 'rgba(138, 43, 226, 0.1)',
    borderRadius: width * 0.4,
    transform: [{ rotate: '45deg' }],
  },
  
  nebula2: {
    position: 'absolute',
    width: width * 0.6,
    height: height * 0.4,
    right: -width * 0.2,
    bottom: height * 0.1,
    backgroundColor: 'rgba(30, 144, 255, 0.08)',
    borderRadius: width * 0.3,
    transform: [{ rotate: '-30deg' }],
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
  
  celestialBody: {
    position: 'absolute',
    borderRadius: 1000,
    shadowOffset: { width: 0, height: 0 },
    elevation: 15,
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
  },
  
  gameTitle: {
    fontSize: 72,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 8,
    textShadowColor: '#4A90E2',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
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
    textShadowRadius: 10,
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
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 226, 0.3)',
    minWidth: 120,
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
    borderRadius: 25,
    paddingVertical: 18,
    paddingHorizontal: 30,
    marginVertical: 10,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  
  primaryButton: {
    backgroundColor: 'rgba(74, 144, 226, 0.2)',
    borderWidth: 2,
    borderColor: '#4A90E2',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 20,
  },
  
  secondaryButton: {
    backgroundColor: 'rgba(155, 89, 182, 0.2)',
    borderWidth: 2,
    borderColor: '#9B59B6',
    shadowColor: '#9B59B6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 15,
  },
  
  tertiaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  
  buttonGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    borderRadius: 25,
  },
  
  buttonGlow2: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(155, 89, 182, 0.1)',
    borderRadius: 25,
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
