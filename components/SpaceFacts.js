/**
 * ===========================
 * SPACE FACTS COMPONENT
 * ===========================
 * 
 * Shows educational space facts during gameplay
 * Facts appear based on planets created and game progress
 * FIXED ANIMATION DRIVERS - No conflicts
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { THEME, FONT_SIZES, getPlanetType } from './constants';

const SpaceFacts = ({ currentValue, isVisible, onClose }) => {
  const [planet, setPlanet] = useState(null);

  useEffect(() => {
    if (currentValue && currentValue >= 64) {
      const planetData = getPlanetType(currentValue);
      setPlanet(planetData);
    }
  }, [currentValue]);

  if (!isVisible || !planet) return null;

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.factContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>
          
          <ScrollView style={styles.contentScroll}>
            <Text style={styles.planetName}>{planet.name}</Text>
            <Text style={styles.diameter}>Diameter: {planet.diameter}</Text>
            
            <Text style={styles.sectionTitle}>About This Planet</Text>
            <Text style={styles.description}>{planet.description}</Text>
            
            <Text style={styles.sectionTitle}>Fascinating Facts</Text>
            <Text style={styles.facts}>{planet.facts}</Text>
            
            {planet.moons > 0 && (
              <>
                <Text style={styles.sectionTitle}>Moons</Text>
                <Text style={styles.moonInfo}>
                  {planet.name} has {planet.moons} known moon{planet.moons > 1 ? 's' : ''}.
                  {planet.type === 'earth' && ' Our Moon is the 5th largest in the solar system.'}
                  {planet.type === 'mars' && ' Phobos and Deimos are small, potato-shaped moons.'}
                  {planet.type === 'jupiter' && ' The four largest are Io, Europa, Ganymede, and Callisto.'}
                  {planet.type === 'saturn' && ' Titan is larger than Mercury and has liquid methane lakes.'}
                  {planet.type === 'uranus' && ' Miranda has the most extreme terrain in the solar system.'}
                  {planet.type === 'neptune' && ' Triton orbits backwards and likely came from the Kuiper Belt.'}
                </Text>
              </>
            )}
            
            {planet.atmosphere && (
              <>
                <Text style={styles.sectionTitle}>Atmosphere</Text>
                <Text style={styles.atmosphereInfo}>
                  {planet.type === 'venus' && 'Dense carbon dioxide atmosphere creates extreme greenhouse effect.'}
                  {planet.type === 'earth' && '78% nitrogen, 21% oxygen - perfect for life as we know it.'}
                  {planet.type === 'mars' && 'Thin atmosphere, mostly carbon dioxide with dust storms.'}
                  {planet.type === 'jupiter' && 'Hydrogen and helium with colorful cloud bands.'}
                  {planet.type === 'saturn' && 'Similar to Jupiter but with less mass and density.'}
                  {planet.type === 'uranus' && 'Hydrogen, helium, and methane giving it the blue-green color.'}
                  {planet.type === 'neptune' && 'Hydrogen, helium, and methane with the fastest winds.'}
                </Text>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  factContainer: {
    backgroundColor: THEME.DARK.BACKGROUND_SECONDARY,
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 500,
    shadowColor: THEME.DARK.STELLAR_GLOW,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 10,
  },
  closeText: {
    fontSize: 24,
    color: THEME.DARK.TEXT_SECONDARY,
  },
  contentScroll: {
    marginTop: 20,
  },
  planetName: {
    fontSize: FONT_SIZES.LARGE,
    fontWeight: 'bold',
    color: THEME.DARK.TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: 10,
  },
  diameter: {
    fontSize: FONT_SIZES.MEDIUM,
    color: THEME.DARK.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.MEDIUM,
    fontWeight: 'bold',
    color: THEME.DARK.TEXT_PRIMARY,
    marginBottom: 10,
  },
  description: {
    fontSize: FONT_SIZES.SMALL,
    color: THEME.DARK.TEXT_PRIMARY,
    lineHeight: 20,
    marginBottom: 15,
  },
  facts: {
    fontSize: FONT_SIZES.SMALL,
    color: THEME.DARK.TEXT_PRIMARY,
    lineHeight: 20,
    marginBottom: 15,
  },
  moonInfo: {
    fontSize: FONT_SIZES.SMALL,
    color: THEME.DARK.TEXT_SECONDARY,
    lineHeight: 20,
  },
  atmosphereInfo: {
    fontSize: FONT_SIZES.SMALL,
    color: THEME.DARK.TEXT_SECONDARY,
    lineHeight: 20,
  },
});

export default SpaceFacts; 