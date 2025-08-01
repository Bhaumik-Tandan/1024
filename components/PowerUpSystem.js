import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { THEME, FONT_SIZES } from './constants';

// Power-up definitions with cosmic theme
export const POWER_UPS = {
  GRAVITY_WELL: {
    id: 'gravity_well',
    name: 'Gravity Well',
    description: 'Attracts all floating planets to the bottom instantly',
    icon: '🌑',
    cooldown: 30000, // 30 seconds
    cost: 50, // points to purchase
    rarity: 'common',
    color: '#9B59B6',
  },
  
  STELLAR_FUSION: {
    id: 'stellar_fusion',
    name: 'Stellar Fusion',
    description: 'Combines two random matching planets automatically',
    icon: '⭐',
    cooldown: 45000, // 45 seconds
    cost: 100,
    rarity: 'rare',
    color: '#FFD700',
  },
  
  COSMIC_BLAST: {
    id: 'cosmic_blast',
    name: 'Cosmic Blast',
    description: 'Destroys the smallest planets to make space',
    icon: '💥',
    cooldown: 60000, // 60 seconds
    cost: 75,
    rarity: 'common',
    color: '#FF6B35',
  },
  
  TIME_WARP: {
    id: 'time_warp',
    name: 'Time Warp',
    description: 'Slows down time for precise planet placement',
    icon: '⏰',
    cooldown: 90000, // 90 seconds
    cost: 150,
    rarity: 'epic',
    color: '#00BFFF',
  },
  
  PLANETARY_SHIELD: {
    id: 'planetary_shield',
    name: 'Planetary Shield',
    description: 'Prevents game over for next 3 moves',
    icon: '🛡️',
    cooldown: 120000, // 2 minutes
    cost: 200,
    rarity: 'epic',
    color: '#1ABC9C',
  },
  
  SUPERNOVA: {
    id: 'supernova',
    name: 'Supernova',
    description: 'Creates a massive explosion, clearing random planets',
    icon: '🌟',
    cooldown: 180000, // 3 minutes
    cost: 300,
    rarity: 'legendary',
    color: '#E74C3C',
  },
};

// Power-up button component
const PowerUpButton = ({ powerUp, isReady, timeLeft, onUse, disabled }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isReady && !disabled) {
      // Pulse animation when ready
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.3,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();

      return () => pulse.stop();
    }
  }, [isReady, disabled]);

  const handlePress = () => {
    if (!isReady || disabled) return;

    // Button press animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onUse(powerUp);
  };

  const formatTime = (ms) => {
    const seconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0 ? `${minutes}:${remainingSeconds.toString().padStart(2, '0')}` : `${seconds}s`;
  };

  return (
    <TouchableOpacity
      style={[
        styles.powerUpButton,
        { borderColor: powerUp.color },
        !isReady && styles.powerUpButtonDisabled,
        disabled && styles.powerUpButtonLocked,
      ]}
      onPress={handlePress}
      disabled={!isReady || disabled}
      activeOpacity={0.8}
    >
      <Animated.View
        style={[
          styles.powerUpButtonInner,
          { backgroundColor: powerUp.color + '20' },
          {
            transform: [{ scale: scaleAnim }],
            opacity: isReady ? Animated.add(0.7, Animated.multiply(glowAnim, 0.3)) : 0.3,
          },
        ]}
      >
        <Text style={styles.powerUpIcon}>{powerUp.icon}</Text>
        {!isReady && timeLeft > 0 && (
          <View style={styles.cooldownOverlay}>
            <Text style={styles.cooldownText}>{formatTime(timeLeft)}</Text>
          </View>
        )}
      </Animated.View>
      
      <Text style={[
        styles.powerUpName,
        { color: powerUp.color },
        (!isReady || disabled) && styles.disabledText
      ]}>
        {powerUp.name}
      </Text>
    </TouchableOpacity>
  );
};

// Main power-up system component
export const PowerUpSystem = ({ 
  score = 0, 
  onPowerUpUse, 
  gameActive = true,
  onScoreChange 
}) => {
  const [powerUpStates, setPowerUpStates] = useState({});
  const [activeEffects, setActiveEffects] = useState({});

  // Initialize power-up states
  useEffect(() => {
    const initialStates = {};
    Object.keys(POWER_UPS).forEach(id => {
      initialStates[id] = {
        lastUsed: 0,
        isReady: true,
        purchased: false,
      };
    });
    setPowerUpStates(initialStates);
  }, []);

  // Update cooldowns
  useEffect(() => {
    const interval = setInterval(() => {
      setPowerUpStates(prev => {
        const newStates = { ...prev };
        let hasChanges = false;

        Object.keys(POWER_UPS).forEach(id => {
          const powerUp = POWER_UPS[id];
          const state = newStates[id];
          
          if (state && state.lastUsed > 0) {
            const timeElapsed = Date.now() - state.lastUsed;
            const isReady = timeElapsed >= powerUp.cooldown;
            
            if (state.isReady !== isReady) {
              newStates[id] = { ...state, isReady };
              hasChanges = true;
            }
          }
        });

        return hasChanges ? newStates : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const usePowerUp = (powerUp) => {
    const state = powerUpStates[powerUp.id];
    if (!state?.isReady || score < powerUp.cost) return;

    // Deduct cost and mark as used
    if (onScoreChange) {
      onScoreChange(-powerUp.cost);
    }

    setPowerUpStates(prev => ({
      ...prev,
      [powerUp.id]: {
        ...prev[powerUp.id],
        lastUsed: Date.now(),
        isReady: false,
      },
    }));

    // Apply power-up effect
    applyPowerUpEffect(powerUp);

    // Notify parent component
    if (onPowerUpUse) {
      onPowerUpUse(powerUp);
    }
  };

  const applyPowerUpEffect = (powerUp) => {
    switch (powerUp.id) {
      case 'gravity_well':
        // Apply gravity to all floating planets
        setActiveEffects(prev => ({ ...prev, gravityWell: Date.now() }));
        break;

      case 'stellar_fusion':
        // Find and merge matching planets
        setActiveEffects(prev => ({ ...prev, stellarFusion: Date.now() }));
        break;

      case 'cosmic_blast':
        // Remove smallest planets
        setActiveEffects(prev => ({ ...prev, cosmicBlast: Date.now() }));
        break;

      case 'time_warp':
        // Slow down game for 10 seconds
        setActiveEffects(prev => ({ ...prev, timeWarp: Date.now() + 10000 }));
        break;

      case 'planetary_shield':
        // Prevent game over for 3 moves
        setActiveEffects(prev => ({ ...prev, planetaryShield: 3 }));
        break;

      case 'supernova':
        // Massive explosion effect
        setActiveEffects(prev => ({ ...prev, supernova: Date.now() }));
        break;
    }
  };

  const getTimeLeft = (powerUpId) => {
    const state = powerUpStates[powerUpId];
    const powerUp = POWER_UPS[powerUpId];
    
    if (!state || state.isReady) return 0;
    
    const timeElapsed = Date.now() - state.lastUsed;
    return Math.max(0, powerUp.cooldown - timeElapsed);
  };

  const canAfford = (powerUp) => score >= powerUp.cost;

  return (
    <View style={styles.powerUpContainer}>
      <View style={styles.powerUpHeader}>
        <Text style={styles.powerUpTitle}>🌌 Cosmic Powers</Text>
        <Text style={styles.scoreText}>Energy: {score}</Text>
      </View>
      
      <View style={styles.powerUpGrid}>
        {Object.values(POWER_UPS).map(powerUp => {
          const state = powerUpStates[powerUp.id];
          const isReady = state?.isReady && canAfford(powerUp);
          const timeLeft = getTimeLeft(powerUp.id);
          const disabled = !gameActive || !canAfford(powerUp);

          return (
            <PowerUpButton
              key={powerUp.id}
              powerUp={powerUp}
              isReady={isReady}
              timeLeft={timeLeft}
              onUse={usePowerUp}
              disabled={disabled}
            />
          );
        })}
      </View>

      {/* Active effects indicator */}
      {Object.keys(activeEffects).length > 0 && (
        <View style={styles.activeEffectsContainer}>
          <Text style={styles.activeEffectsText}>
            🌟 Active: {Object.keys(activeEffects).join(', ')}
          </Text>
        </View>
      )}
    </View>
  );
}; 

const styles = StyleSheet.create({
  powerUpContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: THEME.DARK.BACKGROUND_SECONDARY + 'DD',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: THEME.DARK.COSMIC_ACCENT + '40',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 15,
  },

  powerUpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  powerUpTitle: {
    color: THEME.DARK.TEXT_PRIMARY,
    fontSize: FONT_SIZES.MEDIUM,
    fontWeight: '700',
  },

  scoreText: {
    color: THEME.DARK.NEON_GLOW,
    fontSize: FONT_SIZES.MEDIUM,
    fontWeight: '600',
  },

  powerUpGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  powerUpButton: {
    width: '31%',
    aspectRatio: 1,
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 2,
    overflow: 'hidden',
  },

  powerUpButtonDisabled: {
    opacity: 0.5,
  },

  powerUpButtonLocked: {
    opacity: 0.3,
  },

  powerUpButtonInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  powerUpIcon: {
    fontSize: 24,
    marginBottom: 4,
  },

  powerUpName: {
    position: 'absolute',
    bottom: 2,
    left: 2,
    right: 2,
    fontSize: FONT_SIZES.TINY,
    fontWeight: '600',
    textAlign: 'center',
  },

  disabledText: {
    opacity: 0.5,
  },

  cooldownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  cooldownText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.SMALL,
    fontWeight: '700',
  },

  activeEffectsContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: THEME.DARK.COSMIC_ACCENT + '30',
  },

  activeEffectsText: {
    color: THEME.DARK.STELLAR_GLOW,
    fontSize: FONT_SIZES.SMALL,
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default PowerUpSystem; 