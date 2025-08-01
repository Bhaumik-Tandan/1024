import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { THEME, FONT_SIZES } from './constants';

const { width, height } = Dimensions.get('window');

// Animated floating planet component (using solid colors)
const FloatingPlanet = ({ size, color, initialX, initialY, duration, delay }) => {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Entrance animation
    const entranceAnimation = Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        delay: delay,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        delay: delay,
        useNativeDriver: true,
      }),
    ]);

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

    // Continuous rotation
    const rotationAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 2,
        duration: 15000,
        useNativeDriver: true,
      })
    );

    entranceAnimation.start(() => {
      floatingAnimation.start();
      rotationAnimation.start();
    });

    return () => {
      floatingAnimation.stop();
      rotationAnimation.stop();
    };
  }, []);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -30],
  });

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: ['0deg', '180deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.planet,
        {
          width: size,
          height: size,
          backgroundColor: color,
          left: initialX - size / 2,
          top: initialY - size / 2,
          transform: [
            { translateY },
            { rotate },
            { scale: scaleAnim },
          ],
        },
      ]}
    />
  );
};

// Moving star component
const MovingStars = ({ count = 20 }) => {
  const stars = useRef([]);
  const animatedValues = useRef([]);

  // Generate stars
  if (stars.current.length === 0) {
    for (let i = 0; i < count; i++) {
      const star = {
        id: i,
        x: Math.random() * width,
        y: Math.random() * height,
        size: 1 + Math.random() * 3,
        opacity: 0.3 + Math.random() * 0.7,
        duration: 3000 + Math.random() * 4000,
      };
      
      stars.current.push(star);
      animatedValues.current.push({
        translateY: new Animated.Value(0),
        opacity: new Animated.Value(star.opacity),
        scale: new Animated.Value(1),
      });
    }
  }

  useEffect(() => {
    const animations = stars.current.map((star, index) => {
      const { translateY, opacity, scale } = animatedValues.current[index];
      
      return Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(translateY, {
              toValue: height + 50,
              duration: star.duration,
              useNativeDriver: true,
            }),
            Animated.timing(translateY, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
          Animated.loop(
            Animated.sequence([
              Animated.timing(opacity, {
                toValue: star.opacity * 0.3,
                duration: 1500,
                useNativeDriver: true,
              }),
              Animated.timing(opacity, {
                toValue: star.opacity,
                duration: 1500,
                useNativeDriver: true,
              }),
            ])
          ),
          Animated.loop(
            Animated.sequence([
              Animated.timing(scale, {
                toValue: 1.3,
                duration: 2000,
                useNativeDriver: true,
              }),
              Animated.timing(scale, {
                toValue: 1,
                duration: 2000,
                useNativeDriver: true,
              }),
            ])
          ),
        ])
      );
    });

    animations.forEach((animation, index) => {
      setTimeout(() => animation.start(), index * 200);
    });

    return () => {
      animations.forEach(animation => animation.stop());
    };
  }, []);

  return (
    <View style={styles.starsContainer} pointerEvents="none">
      {stars.current.map((star, index) => {
        const { translateY, opacity, scale } = animatedValues.current[index];
        
        return (
          <Animated.View
            key={star.id}
            style={[
              styles.star,
              {
                left: star.x,
                top: star.y,
                width: star.size,
                height: star.size,
                transform: [{ translateY }, { scale }],
                opacity,
              },
            ]}
          />
        );
      })}
    </View>
  );
};

export const SplashScreenBackup = ({ onComplete }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const titleScaleAnim = useRef(new Animated.Value(0.5)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const splashSequence = Animated.sequence([
      // Initial fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      // Title entrance
      Animated.timing(titleScaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      // Subtitle fade in
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      // Hold for 2 seconds
      Animated.delay(2000),
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]);

    splashSequence.start(() => {
      if (onComplete) onComplete();
    });

    return () => splashSequence.stop();
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Deep space background using simple CSS gradient */}
      <View style={styles.spaceBackground}>
        <View style={styles.gradientLayer1} />
        <View style={styles.gradientLayer2} />
        <View style={styles.gradientLayer3} />
      </View>
      
      {/* Moving stars */}
      <MovingStars count={30} />
      
      {/* Floating planets with solid colors */}
      <FloatingPlanet 
        size={80} 
        color="#CD5C5C" // Mars
        initialX={width * 0.15} 
        initialY={height * 0.3} 
        duration={4000} 
        delay={500} 
      />
      <FloatingPlanet 
        size={120} 
        color="#4169E1" // Earth
        initialX={width * 0.5} 
        initialY={height * 0.4} 
        duration={5000} 
        delay={800} 
      />
      <FloatingPlanet 
        size={60} 
        color="#FFD700" // Venus
        initialX={width * 0.85} 
        initialY={height * 0.25} 
        duration={3500} 
        delay={300} 
      />
      <FloatingPlanet 
        size={90} 
        color="#C0C0C0" // Moon
        initialX={width * 0.2} 
        initialY={height * 0.7} 
        duration={4500} 
        delay={1000} 
      />
      
      {/* Title */}
      <View style={styles.titleContainer}>
        <Animated.Text 
          style={[
            styles.title,
            {
              transform: [{ scale: titleScaleAnim }],
            }
          ]}
        >
          SPACE
        </Animated.Text>
        <Animated.Text 
          style={[
            styles.subtitle,
            {
              transform: [{ scale: titleScaleAnim }],
            }
          ]}
        >
          DROP
        </Animated.Text>
        <Animated.Text 
          style={[
            styles.tagline,
            {
              opacity: subtitleOpacity,
            }
          ]}
        >
          Explore the Universe
        </Animated.Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },

  spaceBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#0a0a1a',
  },

  gradientLayer1: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#16213e',
    opacity: 0.7,
  },

  gradientLayer2: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#1a0a2e',
    opacity: 0.5,
  },

  gradientLayer3: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#0a0a1a',
    opacity: 0.8,
  },

  starsContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },

  star: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 50,
  },

  planet: {
    position: 'absolute',
    borderRadius: 1000,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 15,
  },

  titleContainer: {
    alignItems: 'center',
    zIndex: 10,
  },

  title: {
    fontSize: 84,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 8,
    textShadowColor: '#4A90E2',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    marginBottom: -20,
  },

  subtitle: {
    fontSize: 84,
    fontWeight: '900',
    color: '#4A90E2',
    textAlign: 'center',
    letterSpacing: 8,
    textShadowColor: '#FFFFFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
    marginBottom: 20,
  },

  tagline: {
    fontSize: 24,
    fontWeight: '300',
    color: '#B0C4DE',
    textAlign: 'center',
    letterSpacing: 4,
    textShadowColor: '#9B59B6',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
});

export default SplashScreenBackup; 