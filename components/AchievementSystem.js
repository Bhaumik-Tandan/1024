import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { THEME, FONT_SIZES } from './constants';
import PlanetTile from './PlanetTile';

// Achievement definitions with cosmic theme
export const ACHIEVEMENTS = {
  // Basic Progression
  FIRST_COLLISION: {
    id: 'first_collision',
    title: 'First Contact',
    description: 'Merge your first two celestial bodies',
    icon: '🌑',
    points: 10,
    type: 'progression',
  },
  REACH_EARTH: {
    id: 'reach_earth',
    title: 'Home Planet',
    description: 'Create Earth (16) for the first time',
    icon: '🌍',
    points: 50,
    type: 'milestone',
  },
  REACH_JUPITER: {
    id: 'reach_jupiter',
    title: 'Gas Giant',
    description: 'Create Jupiter (32) - a massive achievement!',
    icon: '🪐',
    points: 100,
    type: 'milestone',
  },
  REACH_SUN: {
    id: 'reach_sun',
    title: 'Stellar Evolution',
    description: 'Create the Sun (512) - ultimate cosmic power!',
    icon: '☀️',
    points: 500,
    type: 'legendary',
  },

  // Skill-based
  CHAIN_REACTION_5: {
    id: 'chain_reaction_5',
    title: 'Cosmic Chain',
    description: 'Trigger a 5+ collision chain reaction',
    icon: '⚡',
    points: 75,
    type: 'skill',
  },
  PERFECT_COLUMN: {
    id: 'perfect_column',
    title: 'Gravitational Master',
    description: 'Drop 10 planets in the same column perfectly',
    icon: '🎯',
    points: 30,
    type: 'skill',
  },
  SPEED_DEMON: {
    id: 'speed_demon',
    title: 'Cosmic Speed',
    description: 'Score 1000 points in under 2 minutes',
    icon: '💫',
    points: 80,
    type: 'challenge',
  },

  // Score-based
  SCORE_MILESTONE_1K: {
    id: 'score_1k',
    title: 'Asteroid Belt',
    description: 'Reach 1,000 points',
    icon: '🌌',
    points: 25,
    type: 'score',
  },
  SCORE_MILESTONE_10K: {
    id: 'score_10k',
    title: 'Solar System',
    description: 'Reach 10,000 points',
    icon: '🌟',
    points: 100,
    type: 'score',
  },
  SCORE_MILESTONE_100K: {
    id: 'score_100k',
    title: 'Galactic Explorer',
    description: 'Reach 100,000 points',
    icon: '🌌',
    points: 250,
    type: 'score',
  },

  // Celestial Body Achievements
  REACH_MILKY_WAY: {
    id: 'reach_milky_way',
    title: 'Galactic Center',
    description: 'Create the Milky Way (2048) - our home galaxy!',
    icon: '🌌',
    points: 1000,
    type: 'legendary',
    value: 2048,
    requirement: {
      target: 2048,
      current: 0,
    },
  },

  REACH_RIGEL: {
    id: 'reach_rigel',
    title: 'Stellar Giant',
    description: 'Create Rigel (4096) - a magnificent blue supergiant!',
    icon: '⭐',
    points: 1500,
    type: 'legendary',
    value: 4096,
    requirement: {
      target: 4096,
      current: 0,
    },
  },

  REACH_QUASAR: {
    id: 'reach_quasar',
    title: 'Cosmic Power',
    description: 'Create a Quasar (32768) - the brightest objects in the universe!',
    icon: '⚡',
    points: 2500,
    type: 'mythical',
    value: 32768,
    requirement: {
      target: 32768,
      current: 0,
    },
  },

  // Special Events
  DAILY_EXPLORER: {
    id: 'daily_explorer',
    title: 'Daily Explorer',
    description: 'Play for 7 consecutive days',
    icon: '🚀',
    points: 150,
    type: 'daily',
  },
  COLLISION_MASTER: {
    id: 'collision_master',
    title: 'Master of Collisions',
    description: 'Complete 100 total merges',
    icon: '💥',
    points: 200,
    type: 'mastery',
  },
};

// Dedicated Achievement Icon Components - Scale Optimized for 60-80px
const MilkyWayIcon = ({ size }) => (
  <View style={[styles.milkyWayIcon, { width: size, height: size }]}>
    {/* Deep space background */}
    <View style={[styles.milkyWayBackground, { width: size, height: size, borderRadius: size / 2 }]} />
    
    {/* Bright galactic core */}
    <View style={[styles.milkyWayCore, { 
      width: size * 0.3, 
      height: size * 0.3, 
      borderRadius: (size * 0.3) / 2 
    }]} />
    
    {/* Spiral arms - 4 distinct arms */}
    <View style={[styles.spiralArm, { 
      width: size * 0.7, 
      height: size * 0.15, 
      transform: [{ rotate: '45deg' }] 
    }]} />
    <View style={[styles.spiralArm, { 
      width: size * 0.7, 
      height: size * 0.15, 
      transform: [{ rotate: '135deg' }] 
    }]} />
    <View style={[styles.spiralArm, { 
      width: size * 0.7, 
      height: size * 0.15, 
      transform: [{ rotate: '225deg' }] 
    }]} />
    <View style={[styles.spiralArm, { 
      width: size * 0.7, 
      height: size * 0.15, 
      transform: [{ rotate: '315deg' }] 
    }]} />
    
    {/* Star clusters along spiral arms */}
    <View style={[styles.starCluster, { top: size * 0.2, left: size * 0.1 }]} />
    <View style={[styles.starCluster, { top: size * 0.1, right: size * 0.2 }]} />
    <View style={[styles.starCluster, { bottom: size * 0.2, left: size * 0.15 }]} />
    <View style={[styles.starCluster, { bottom: size * 0.1, right: size * 0.1 }]} />
    
    {/* Individual bright stars */}
    <View style={[styles.brightStar, { top: size * 0.15, left: size * 0.25 }]} />
    <View style={[styles.brightStar, { top: size * 0.25, right: size * 0.15 }]} />
    <View style={[styles.brightStar, { bottom: size * 0.15, left: size * 0.2 }]} />
    <View style={[styles.brightStar, { bottom: size * 0.25, right: size * 0.2 }]} />
  </View>
);

const RigelIcon = ({ size }) => (
  <View style={[styles.rigelIcon, { width: size, height: size }]}>
    {/* Energy wave rings - expanding outward */}
    <View style={[styles.energyWave, { 
      width: size, 
      height: size, 
      borderRadius: size / 2,
      borderWidth: size * 0.05
    }]} />
    <View style={[styles.energyWave, { 
      width: size * 0.8, 
      height: size * 0.8, 
      borderRadius: (size * 0.8) / 2,
      borderWidth: size * 0.04
    }]} />
    
    {/* Stellar corona */}
    <View style={[styles.rigelCorona, { 
      width: size * 0.7, 
      height: size * 0.7, 
      borderRadius: (size * 0.7) / 2 
    }]} />
    
    {/* Perfect round star core */}
    <View style={[styles.rigelCore, { 
      width: size * 0.5, 
      height: size * 0.5, 
      borderRadius: (size * 0.5) / 2 
    }]} />
    
    {/* Inner glow */}
    <View style={[styles.rigelGlow, { 
      width: size * 0.3, 
      height: size * 0.3, 
      borderRadius: (size * 0.3) / 2 
    }]} />
  </View>
);

const QuasarIcon = ({ size }) => (
  <View style={[styles.quasarIcon, { width: size, height: size }]}>
    {/* Energy burst background */}
    <View style={[styles.quasarBackground, { width: size, height: size, borderRadius: size / 2 }]} />
    
    {/* Multiple energy rings */}
    <View style={[styles.quasarRing, { 
      width: size, 
      height: size, 
      borderRadius: size / 2,
      borderWidth: size * 0.06
    }]} />
    <View style={[styles.quasarRing, { 
      width: size * 0.7, 
      height: size * 0.7, 
      borderRadius: (size * 0.7) / 2,
      borderWidth: size * 0.05
    }]} />
    <View style={[styles.quasarRing, { 
      width: size * 0.4, 
      height: size * 0.4, 
      borderRadius: (size * 0.4) / 2,
      borderWidth: size * 0.04
    }]} />
    
    {/* Central energy core */}
    <View style={[styles.quasarCore, { 
      width: size * 0.25, 
      height: size * 0.25, 
      borderRadius: (size * 0.25) / 2 
    }]} />
  </View>
);

// Enhanced Celestial Icon component that uses dedicated icon components
const EnhancedCelestialIcon = ({ achievement, size, isUnlocked }) => {
  // Map achievement IDs to icon components
  const achievementToIcon = {
    'reach_earth': 'earth',
    'reach_jupiter': 'jupiter', 
    'reach_sun': 'sun',
    'reach_milky_way': 'milky_way',
    'reach_rigel': 'rigel',
    'reach_quasar': 'quasar',
    'reach_andromeda': 'andromeda'
  };

  const iconType = achievementToIcon[achievement.id];
  
  if (!iconType) {
    // Fallback for non-celestial achievements
    return (
      <View style={styles.fallbackIcon}>
        <Text style={styles.fallbackIconText}>{achievement.icon}</Text>
      </View>
    );
  }

  // Get the value for display
  const achievementToValue = {
    'reach_earth': 2,
    'reach_jupiter': 64,
    'reach_sun': 512,
    'reach_milky_way': 2048,
    'reach_rigel': 4096,
    'reach_quasar': 32768,
    'reach_andromeda': 65536
  };

  const planetValue = achievementToValue[achievement.id];

  // Render the appropriate dedicated icon component with value display
  let iconComponent;
  switch (iconType) {
    case 'milky_way':
      iconComponent = <MilkyWayIcon size={size} />;
      break;
    case 'rigel':
      iconComponent = <RigelIcon size={size} />;
      break;
    case 'quasar':
      iconComponent = <QuasarIcon size={size} />;
      break;
    default:
      // For other planets, use a simplified planet representation
      iconComponent = (
        <View style={[styles.simplePlanet, { 
          width: size, 
          height: size, 
          borderRadius: size / 2,
          backgroundColor: '#4A90E2'
        }]}>
          <View style={[styles.planetGlow, { 
            width: size * 0.6, 
            height: size * 0.6, 
            borderRadius: (size * 0.6) / 2,
            backgroundColor: '#7BB3F0'
          }]} />
        </View>
      );
  }

  return (
    <View style={styles.celestialIcon}>
      {iconComponent}
      
      {/* Value display */}
      <View style={styles.celestialValue}>
        <Text style={styles.celestialValueText}>
          {planetValue.toString()}
        </Text>
      </View>
    </View>
  );
};

// Achievement notification component
const AchievementNotification = ({ achievement, onClose }) => {
  const slideAnim = useRef(new Animated.Value(-200)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 120,
        friction: 7,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -200,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(onClose);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View
      style={[
        styles.notificationContainer,
        {
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      <View style={styles.achievementIcon}>
        <Text style={styles.iconText}>{achievement.icon}</Text>
      </View>
      <View style={styles.achievementContent}>
        <Text style={styles.achievementTitle}>Achievement Unlocked!</Text>
        <Text style={styles.achievementName}>{achievement.title}</Text>
        <Text style={styles.achievementDesc}>{achievement.description}</Text>
        <Text style={styles.achievementPoints}>+{achievement.points} XP</Text>
      </View>
    </Animated.View>
  );
};

// Main achievement system component
export const AchievementSystem = ({ 
  unlockedAchievements = [], 
  onAchievementUnlock,
  gameStats = {},
  debugMode = true // Temporary debug mode to show all achievements unlocked
}) => {
  const [notifications, setNotifications] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // For debug mode, show all achievements as unlocked
  const effectiveUnlockedAchievements = debugMode 
    ? Object.values(ACHIEVEMENTS).map(a => a.id)
    : unlockedAchievements;

  // Check for new achievements based on game stats
  useEffect(() => {
    if (!debugMode) {
      checkAchievements(gameStats);
    }
  }, [gameStats, debugMode]);

  const checkAchievements = (stats) => {
    const newAchievements = [];

    // Check each achievement condition
    Object.values(ACHIEVEMENTS).forEach(achievement => {
      if (effectiveUnlockedAchievements.includes(achievement.id)) return;

      let unlocked = false;

      switch (achievement.id) {
        case 'first_collision':
          unlocked = (stats.totalMerges || 0) >= 1;
          break;
        case 'reach_earth':
          unlocked = (stats.highestTile || 0) >= 2;
          break;
        case 'reach_jupiter':
          unlocked = (stats.highestTile || 0) >= 64;
          break;
        case 'reach_sun':
          unlocked = (stats.highestTile || 0) >= 512;
          break;
        case 'reach_milky_way':
          unlocked = (stats.highestTile || 0) >= 2048;
          break;
        case 'reach_rigel':
          unlocked = (stats.highestTile || 0) >= 4096;
          break;
        case 'reach_quasar':
          unlocked = (stats.highestTile || 0) >= 32768;
          break;
        case 'chain_reaction_5':
          unlocked = (stats.longestChain || 0) >= 5;
          break;
        case 'score_1k':
          unlocked = (stats.bestScore || 0) >= 1000;
          break;
        case 'score_10k':
          unlocked = (stats.bestScore || 0) >= 10000;
          break;
        case 'score_100k':
          unlocked = (stats.bestScore || 0) >= 100000;
          break;
        case 'collision_master':
          unlocked = (stats.totalMerges || 0) >= 100;
          break;
      }

      if (unlocked) {
        newAchievements.push(achievement);
      }
    });

    // Show notifications for new achievements
    newAchievements.forEach(achievement => {
      showNotification(achievement);
      if (onAchievementUnlock) {
        onAchievementUnlock(achievement);
      }
    });
  };

  const showNotification = (achievement) => {
    const notification = {
      id: Date.now() + Math.random(),
      achievement,
    };

    setNotifications(prev => [...prev, notification]);
  };

  const removeNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const getTotalXP = () => {
    return effectiveUnlockedAchievements.reduce((total, achievementId) => {
      const achievement = Object.values(ACHIEVEMENTS).find(a => a.id === achievementId);
      return total + (achievement?.points || 0);
    }, 0);
  };

  const getCompletionPercentage = () => {
    return Math.round((effectiveUnlockedAchievements.length / Object.keys(ACHIEVEMENTS).length) * 100);
  };

  return (
    <>
      {/* Achievement Notifications */}
      <View style={styles.notificationsContainer}>
        {notifications.map(notification => (
          <AchievementNotification
            key={notification.id}
            achievement={notification.achievement}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </View>

      {/* Achievement Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>🏆 Cosmic Achievements</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.statsContainer}>
            <Text style={styles.statsText}>
              XP: {getTotalXP()} | Progress: {getCompletionPercentage()}%
            </Text>
          </View>

          <ScrollView style={styles.achievementsList}>
            {Object.values(ACHIEVEMENTS).map(achievement => {
              const isUnlocked = effectiveUnlockedAchievements.includes(achievement.id);
              
              return (
                <View
                  key={achievement.id}
                  style={[
                    styles.achievementItem,
                    isUnlocked && styles.achievementUnlocked
                  ]}
                >
                  {/* Enhanced Celestial Body Icon */}
                  <View style={styles.achievementItemIcon}>
                    {isUnlocked ? (
                      <EnhancedCelestialIcon 
                        achievement={achievement} 
                        size={80} 
                        isUnlocked={true}
                      />
                    ) : (
                      <View style={styles.lockedIconContainer}>
                        <Text style={styles.lockedIcon}>🔒</Text>
                        <Text style={styles.lockedValue}>{achievement.value || '???'}</Text>
                      </View>
                    )}
                  </View>
                  
                  {/* Enhanced Content */}
                  <View style={styles.achievementItemContent}>
                    <Text style={[
                      styles.achievementItemTitle,
                      !isUnlocked && styles.lockedText
                    ]}>
                      {achievement.title}
                    </Text>
                    <Text style={[
                      styles.achievementItemDesc,
                      !isUnlocked && styles.lockedText
                    ]}>
                      {achievement.description}
                    </Text>
                    <Text style={styles.achievementItemPoints}>
                      {achievement.points} XP
                    </Text>
                    
                    {/* Progress indicator for locked achievements */}
                    {!isUnlocked && achievement.requirement && (
                      <View style={styles.progressContainer}>
                        <Text style={styles.progressText}>
                          Progress: {achievement.requirement.current || 0} / {achievement.requirement.target}
                        </Text>
                        <View style={styles.progressBar}>
                          <View 
                            style={[
                              styles.progressFill, 
                              { width: `${Math.min((achievement.requirement.current || 0) / achievement.requirement.target * 100, 100)}%` }
                            ]} 
                          />
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </Modal>

      {/* Achievement Button */}
      <TouchableOpacity
        style={styles.achievementButton}
        onPress={() => setShowModal(true)}
      >
        <Text style={styles.achievementButtonText}>🏆</Text>
        {effectiveUnlockedAchievements.length > 0 && (
          <View style={styles.achievementBadge}>
            <Text style={styles.badgeText}>{effectiveUnlockedAchievements.length}</Text>
          </View>
        )}
      </TouchableOpacity>
    </>
  );
}; 

const styles = StyleSheet.create({
  notificationsContainer: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    zIndex: 9999,
  },

  notificationContainer: {
    flexDirection: 'row',
    backgroundColor: THEME.DARK.BACKGROUND_SECONDARY,
    borderRadius: 15,
    padding: 15,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 20,
    borderWidth: 1,
    borderColor: THEME.DARK.COSMIC_ACCENT + '40',
  },

  achievementIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: THEME.DARK.COSMIC_ACCENT + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  iconText: {
    fontSize: 24,
  },

  achievementContent: {
    flex: 1,
  },

  achievementTitle: {
    color: THEME.DARK.STELLAR_GLOW,
    fontSize: FONT_SIZES.SMALL,
    fontWeight: '600',
    marginBottom: 2,
  },

  achievementName: {
    color: THEME.DARK.TEXT_PRIMARY,
    fontSize: FONT_SIZES.MEDIUM,
    fontWeight: '700',
    marginBottom: 2,
  },

  achievementDesc: {
    color: THEME.DARK.TEXT_SECONDARY,
    fontSize: FONT_SIZES.SMALL,
    marginBottom: 4,
  },

  achievementPoints: {
    color: THEME.DARK.NEON_GLOW,
    fontSize: FONT_SIZES.SMALL,
    fontWeight: '600',
  },

  modalContainer: {
    flex: 1,
    backgroundColor: THEME.DARK.BACKGROUND_PRIMARY,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: THEME.DARK.COSMIC_ACCENT + '30',
  },

  modalTitle: {
    color: THEME.DARK.TEXT_PRIMARY,
    fontSize: FONT_SIZES.LARGE,
    fontWeight: '700',
  },

  closeButton: {
    color: THEME.DARK.TEXT_SECONDARY,
    fontSize: FONT_SIZES.LARGE,
    padding: 5,
  },

  statsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: THEME.DARK.BACKGROUND_SECONDARY + '60',
  },

  statsText: {
    color: THEME.DARK.NEON_GLOW,
    fontSize: FONT_SIZES.MEDIUM,
    fontWeight: '600',
    textAlign: 'center',
  },

  achievementsList: {
    flex: 1,
    paddingHorizontal: 20,
  },

  achievementItem: {
    flexDirection: 'row',
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginVertical: 8,
    borderRadius: 16,
    backgroundColor: THEME.DARK.BACKGROUND_SECONDARY + '60',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 20,
  },

  achievementUnlocked: {
    backgroundColor: THEME.DARK.COSMIC_ACCENT + '20',
    borderColor: THEME.DARK.COSMIC_ACCENT + '50',
    shadowColor: THEME.DARK.COSMIC_ACCENT,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 25,
  },

  achievementItemIcon: {
    width: 80,
    height: 80,
    marginRight: 20,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },

  achievementItemContent: {
    flex: 1,
  },

  achievementItemTitle: {
    color: THEME.DARK.TEXT_PRIMARY,
    fontSize: FONT_SIZES.MEDIUM,
    fontWeight: '700',
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  achievementItemDesc: {
    color: THEME.DARK.TEXT_SECONDARY,
    fontSize: FONT_SIZES.SMALL,
    marginBottom: 8,
    lineHeight: 18,
    opacity: 0.9,
  },

  achievementItemPoints: {
    color: THEME.DARK.STELLAR_GLOW,
    fontSize: FONT_SIZES.SMALL,
    fontWeight: '700',
    backgroundColor: THEME.DARK.BACKGROUND_SECONDARY + '80',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: THEME.DARK.STELLAR_GLOW + '40',
    shadowColor: THEME.DARK.STELLAR_GLOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },

  lockedText: {
    opacity: 0.5,
  },

  achievementButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: THEME.DARK.BACKGROUND_SECONDARY,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    borderWidth: 2,
    borderColor: THEME.DARK.COSMIC_ACCENT,
    zIndex: 1000,
  },

  achievementButtonText: {
    fontSize: 20,
  },

  achievementBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: THEME.DARK.STELLAR_GLOW,
    justifyContent: 'center',
    alignItems: 'center',
  },

  badgeText: {
    color: THEME.DARK.BACKGROUND_PRIMARY,
    fontSize: 10,
    fontWeight: '700',
  },

  // Enhanced Celestial Icon Styles
  celestialIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  
  celestialValue: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    backgroundColor: '#FFD700',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 2,
    borderColor: '#FFA500',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  
  celestialValueText: {
    color: '#000',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
  fallbackIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  
  fallbackIconText: {
    fontSize: 30,
    color: '#FFFFFF',
  },
  
  // Locked icon container
  lockedIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.DARK.BACKGROUND_SECONDARY,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: THEME.DARK.TEXT_SECONDARY,
    padding: 10,
  },

  lockedIcon: {
    fontSize: 20,
    color: THEME.DARK.TEXT_SECONDARY,
    marginBottom: 2,
  },

  lockedValue: {
    fontSize: 12,
    color: THEME.DARK.TEXT_SECONDARY,
    fontWeight: '600',
  },

  // Progress indicators
  progressContainer: {
    marginTop: 8,
  },

  progressText: {
    color: THEME.DARK.TEXT_SECONDARY,
    fontSize: 10,
    marginBottom: 4,
  },

  progressBar: {
    height: 4,
    backgroundColor: THEME.DARK.BACKGROUND_SECONDARY,
    borderRadius: 2,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: THEME.DARK.COSMIC_ACCENT,
    borderRadius: 2,
  },

  // Dedicated Icon Styles
  milkyWayIcon: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  milkyWayBackground: {
    position: 'absolute',
    backgroundColor: '#0B0B2A', // Deep space blue
    opacity: 0.8,
  },
  milkyWayCore: {
    backgroundColor: '#FFFFFF', // Bright white core
    borderWidth: 2,
    borderColor: '#FFD700', // Golden border
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 10,
  },
  spiralArm: {
    position: 'absolute',
    backgroundColor: '#FFD700', // Golden spiral arms
    borderWidth: 1,
    borderColor: '#FFA500', // Orange border
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 8,
  },
  starCluster: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF', // White star clusters
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 6,
  },
  brightStar: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF', // White bright stars
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 4,
  },

  rigelIcon: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  energyWave: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#FFD700', // Golden energy waves
    borderRadius: 100,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 8,
  },
  rigelCorona: {
    position: 'absolute',
    backgroundColor: '#FFA500', // Orange corona
    borderWidth: 2,
    borderColor: '#FF8C00', // Darker orange border
    shadowColor: '#FFA500',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 6,
    elevation: 10,
  },
  rigelCore: {
    backgroundColor: '#FFD700', // Golden core
    borderWidth: 2,
    borderColor: '#FFA500', // Orange border
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 12,
  },
  rigelGlow: {
    position: 'absolute',
    backgroundColor: '#FFFF00', // Bright yellow inner glow
    borderWidth: 1,
    borderColor: '#FFD700', // Golden border
    shadowColor: '#FFFF00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 6,
  },

  quasarIcon: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quasarBackground: {
    position: 'absolute',
    backgroundColor: '#000000', // Black background for energy burst
    opacity: 0.5,
  },
  quasarRing: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#FF4500', // Red-orange energy rings
    borderRadius: 100,
    shadowColor: '#FF4500',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 10,
  },
  quasarCore: {
    backgroundColor: '#FFD700', // Golden core
    borderWidth: 2,
    borderColor: '#FF4500', // Red-orange border
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 12,
  },

  simplePlanet: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 8,
  },
  planetGlow: {
    position: 'absolute',
    backgroundColor: '#7BB3F0', // Lighter blue glow
    borderRadius: 100,
    shadowColor: '#7BB3F0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 6,
  },
});

export default AchievementSystem; 