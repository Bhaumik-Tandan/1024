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

// Enhanced Celestial Body component with sophisticated animations
const CelestialBody = ({ 
  size, 
  color, 
  initialX, 
  initialY, 
  duration, 
  delay, 
  type = 'drift' // 'drift', 'orbital', 'pulse'
}) => {
  const moveAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    let animations = [];

    if (type === 'drift') {
      // Subtle drift animation - very slow and gentle
      const driftAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(moveAnim, {
            toValue: 1,
            duration: duration * 2,
            useNativeDriver: true,
          }),
          Animated.timing(moveAnim, {
            toValue: 0,
            duration: duration * 2,
            useNativeDriver: true,
          }),
        ])
      );
      animations.push(driftAnimation);

    } else if (type === 'orbital') {
      // Circular orbital motion
      const orbitalAnimation = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: duration * 3,
          useNativeDriver: true,
        })
      );
      animations.push(orbitalAnimation);

    } else if (type === 'pulse') {
      // Gentle pulsing animation
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: duration * 1.5,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: duration * 1.5,
            useNativeDriver: true,
          }),
        ])
      );
      animations.push(pulseAnimation);
    }

    // Subtle glow animation - much more refined
    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.7,
          duration: 4000 + delay,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.4,
          duration: 4000 + delay,
          useNativeDriver: true,
        }),
      ])
    );
    animations.push(glowAnimation);

    // Start animations with delay
    setTimeout(() => {
      animations.forEach(anim => anim.start());
    }, delay);

    return () => {
      animations.forEach(anim => anim.stop());
    };
  }, [type, duration, delay]);

  // Calculate transforms based on animation type
  let transform = [];
  
  if (type === 'drift') {
    const translateX = moveAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 8, 0],
    });
    const translateY = moveAnim.interpolate({
      inputRange: [0, 0.25, 0.75, 1],
      outputRange: [0, -5, 3, 0],
    });
    transform = [{ translateX }, { translateY }];
    
  } else if (type === 'orbital') {
    const radius = 15;
    const translateX = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, radius * 2 * Math.PI],
    });
    const translateY = rotateAnim.interpolate({
      inputRange: [0, 0.25, 0.5, 0.75, 1],
      outputRange: [0, -radius, 0, radius, 0],
    });
    transform = [{ translateX }, { translateY }];
    
  } else if (type === 'pulse') {
    transform = [{ scale: pulseAnim }];
  }

  return (
    <Animated.View
      style={[
        styles.celestialBody,
        {
          width: size,
          height: size,
          left: initialX,
          top: initialY,
          transform,
          opacity: glowAnim,
        },
      ]}
    >
      <View
        style={[
          styles.celestialCore,
          {
            width: size,
            height: size,
            backgroundColor: color,
            shadowColor: color,
            shadowRadius: size * 0.6,
            shadowOpacity: 0.6,
          }
        ]}
      />
      <View
        style={[
          styles.celestialAura,
          {
            width: size * 1.4,
            height: size * 1.4,
            borderColor: color,
            left: -size * 0.2,
            top: -size * 0.2,
          }
        ]}
      />
    </Animated.View>
  );
};

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
    if (block === null || block === 0) return '0';
    return block.toLocaleString();
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
        {/* Moving starfield for space travel feel */}
        <ContinuousStarfield starCount={80} speed="slow" spawnRate={2000} />
        
        {/* Refined nebula effects */}
        <View style={styles.nebula} />
        <View style={styles.nebula2} />
        <View style={styles.nebula3} />
        
        {/* Static star field */}
        <StarField count={35} />
        
        {/* Sophisticated celestial bodies with different animation types */}
        <CelestialBody 
          size={50} 
          color="#FF6B35" 
          initialX={width * 0.08} 
          initialY={height * 0.18} 
          duration={8000} 
          delay={0}
          type="drift"
        />
        <CelestialBody 
          size={40} 
          color="#4A90E2" 
          initialX={width * 0.82} 
          initialY={height * 0.28} 
          duration={6000} 
          delay={1000}
          type="orbital"
        />
        <CelestialBody 
          size={30} 
          color="#9B59B6" 
          initialX={width * 0.12} 
          initialY={height * 0.72} 
          duration={7000} 
          delay={2000}
          type="pulse"
        />
        <CelestialBody 
          size={45} 
          color="#F39C12" 
          initialX={width * 0.88} 
          initialY={height * 0.82} 
          duration={9000} 
          delay={1500}
          type="drift"
        />
        <CelestialBody 
          size={22} 
          color="#E74C3C" 
          initialX={width * 0.04} 
          initialY={height * 0.48} 
          duration={10000} 
          delay={500}
          type="orbital"
        />
        <CelestialBody 
          size={35} 
          color="#1ABC9C" 
          initialX={width * 0.92} 
          initialY={height * 0.58} 
          duration={8500} 
          delay={2500}
          type="pulse"
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
            SPACE
          </Animated.Text>
          <Animated.Text 
            style={[
              styles.gameSubtitle,
              {
                opacity: titleShimmerOpacity,
              }
            ]}
          >
            DROP
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
  
  celestialBody: {
    position: 'absolute',
  },

  celestialCore: {
    borderRadius: 1000,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },

  celestialAura: {
    position: 'absolute',
    borderRadius: 1000,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
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
    borderWidth: 1.5,
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
