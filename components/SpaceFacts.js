/**
 * ===========================
 * SPACE FACTS COMPONENT
 * ===========================
 * 
 * Shows educational space facts during gameplay
 * Facts appear based on planets created and game progress
 * FIXED ANIMATION DRIVERS - No conflicts
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { THEME, getPlanetType } from './constants';

const { width } = Dimensions.get('window');

const SpaceFacts = ({ currentValue, isVisible, onClose }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-100)).current;
  
  useEffect(() => {
    if (isVisible) {
      // Use separate animations but ensure both are JS driver to avoid conflicts
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: false, // Use JS driver for opacity
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: false, // Use JS driver for consistency
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false, // Use JS driver for opacity
        }),
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 300,
          useNativeDriver: false, // Use JS driver for consistency
        }),
      ]).start();
    }
  }, [isVisible, fadeAnim, slideAnim]);

  const getFactForValue = (value) => {
    const facts = {
      2: {
        title: "💧 Water Element",
        fact: "Water is essential for all known forms of life! It covers 71% of Earth's surface and makes up about 60% of the human body."
      },
      4: {
        title: "🔥 Fire Element",
        fact: "Fire represents energy and transformation! Stars like our Sun are giant nuclear fires, fusing hydrogen into helium and releasing enormous amounts of energy."
      },
      8: {
        title: "🌍 Earth Element",
        fact: "Earth represents solid matter and stability! Rocky planets form from cosmic dust and debris that clumped together over millions of years."
      },
      16: {
        title: "💨 Air Element",
        fact: "Air represents gases and atmosphere! Planetary atmospheres protect life and create weather. Jupiter's atmosphere is mostly hydrogen and helium."
      },
      32: {
        title: "⚡ Energy Element",
        fact: "Energy is the fundamental force of the universe! It can neither be created nor destroyed, only transformed from one form to another."
      },
      64: {
        title: "🌑 Asteroid",
        fact: "Asteroids are rocky objects that orbit the Sun. Most are found in the asteroid belt between Mars and Jupiter!"
      },
      128: {
        title: "🔴 Mars",
        fact: "Mars is called the 'Red Planet' because of iron oxide (rust) on its surface. It has the largest volcano in our solar system - Olympus Mons!"
      },
      256: {
        title: "🌕 Venus",
        fact: "Venus is the hottest planet in our solar system due to its thick atmosphere that traps heat. It's hot enough to melt lead!"
      },
      512: {
        title: "🌍 Earth",
        fact: "Earth is the only known planet with life! It's in the 'Goldilocks Zone' - not too hot, not too cold, just right for liquid water."
      },
      1024: {
        title: "🔵 Neptune",
        fact: "Neptune has the fastest winds in the solar system - up to 1,200 mph! That's faster than the speed of sound on Earth."
      },
      2048: {
        title: "🌀 Uranus",
        fact: "Uranus is tilted on its side at 98 degrees! It essentially rolls around the Sun instead of spinning upright like other planets."
      },
      4096: {
        title: "💫 Saturn",
        fact: "Saturn's rings are made of ice and rock particles. They're so thin that if you could stack them vertically, they'd be only about 30 feet tall!"
      },
      8192: {
        title: "🪐 Jupiter",
        fact: "Jupiter is so massive it could fit all other planets inside it! Its Great Red Spot is a storm larger than Earth that's been raging for centuries."
      },
      16384: {
        title: "🤎 Brown Dwarf",
        fact: "Brown dwarfs are 'failed stars' - they're too small to sustain nuclear fusion but too big to be planets. They're warm from leftover formation heat!"
      },
      32768: {
        title: "⭐ Red Dwarf",
        fact: "Red dwarf stars are the most common type of star in the universe! They burn so slowly they can live for trillions of years."
      },
      65536: {
        title: "⚪ White Dwarf",
        fact: "White dwarfs are incredibly dense! A teaspoon of white dwarf material would weigh as much as an elephant on Earth."
      },
      131072: {
        title: "🌟 Neutron Star",
        fact: "Neutron stars are so dense that a sugar cube sized piece would weigh 100 million tons! They spin up to 700 times per second."
      },
      262144: {
        title: "⚫ Black Hole",
        fact: "Black holes warp space and time so much that time slows down near them. If you fell in, you'd experience 'spaghettification'!"
      }
    };

    return facts[value] || {
      title: "🌌 Cosmic Object",
      fact: "You've created something amazing! The universe is full of incredible objects waiting to be discovered."
    };
  };

  if (!isVisible) return null;

  const factData = getFactForValue(currentValue);
  const planet = getPlanetType(currentValue);

  return (
    <Animated.View style={[
      styles.container,
      {
        opacity: fadeAnim, // Opacity animation (JS driver)
        transform: [{ translateY: slideAnim }], // Transform animation (JS driver)
      }
    ]}>
      <View style={[styles.factCard, { borderColor: planet.accent || THEME.DARK.COSMIC_ACCENT }]}>
        <View style={styles.header}>
          <Text style={styles.title}>{factData.title}</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.factText}>{factData.fact}</Text>
        
        <View style={styles.footer}>
          <Text style={styles.learnMoreText}>
            🧠 Tap "Explore Space" from the home menu to learn more!
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  
  factCard: {
    backgroundColor: THEME.DARK.BACKGROUND_SECONDARY + 'E6',
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    shadowColor: THEME.DARK.STELLAR_GLOW,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.DARK.TEXT_PRIMARY,
    flex: 1,
  },
  
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: THEME.DARK.BACKGROUND_PRIMARY + '80',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  
  closeButtonText: {
    color: THEME.DARK.TEXT_SECONDARY,
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  factText: {
    fontSize: 16,
    lineHeight: 22,
    color: THEME.DARK.TEXT_PRIMARY,
    marginBottom: 15,
  },
  
  footer: {
    borderTopWidth: 1,
    borderTopColor: THEME.DARK.BORDER_COLOR + '40',
    paddingTop: 10,
  },
  
  learnMoreText: {
    fontSize: 12,
    color: THEME.DARK.TEXT_SECONDARY,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default SpaceFacts; 