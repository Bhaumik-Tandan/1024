import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { THEME, FONT_SIZES } from './constants';

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
  gameStats = {} 
}) => {
  const [notifications, setNotifications] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // Check for new achievements based on game stats
  useEffect(() => {
    checkAchievements(gameStats);
  }, [gameStats]);

  const checkAchievements = (stats) => {
    const newAchievements = [];

    // Check each achievement condition
    Object.values(ACHIEVEMENTS).forEach(achievement => {
      if (unlockedAchievements.includes(achievement.id)) return;

      let unlocked = false;

      switch (achievement.id) {
        case 'first_collision':
          unlocked = (stats.totalMerges || 0) >= 1;
          break;
        case 'reach_earth':
          unlocked = (stats.highestTile || 0) >= 16;
          break;
        case 'reach_jupiter':
          unlocked = (stats.highestTile || 0) >= 32;
          break;
        case 'reach_sun':
          unlocked = (stats.highestTile || 0) >= 512;
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
    return unlockedAchievements.reduce((total, achievementId) => {
      const achievement = Object.values(ACHIEVEMENTS).find(a => a.id === achievementId);
      return total + (achievement?.points || 0);
    }, 0);
  };

  const getCompletionPercentage = () => {
    return Math.round((unlockedAchievements.length / Object.keys(ACHIEVEMENTS).length) * 100);
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
              const isUnlocked = unlockedAchievements.includes(achievement.id);
              
              return (
                <View
                  key={achievement.id}
                  style={[
                    styles.achievementItem,
                    isUnlocked && styles.achievementUnlocked
                  ]}
                >
                  <Text style={styles.achievementItemIcon}>
                    {isUnlocked ? achievement.icon : '🔒'}
                  </Text>
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
        {unlockedAchievements.length > 0 && (
          <View style={styles.achievementBadge}>
            <Text style={styles.badgeText}>{unlockedAchievements.length}</Text>
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
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginVertical: 5,
    borderRadius: 12,
    backgroundColor: THEME.DARK.BACKGROUND_SECONDARY + '40',
    borderWidth: 1,
    borderColor: 'transparent',
  },

  achievementUnlocked: {
    backgroundColor: THEME.DARK.COSMIC_ACCENT + '15',
    borderColor: THEME.DARK.COSMIC_ACCENT + '30',
  },

  achievementItemIcon: {
    fontSize: 30,
    marginRight: 15,
    alignSelf: 'center',
  },

  achievementItemContent: {
    flex: 1,
  },

  achievementItemTitle: {
    color: THEME.DARK.TEXT_PRIMARY,
    fontSize: FONT_SIZES.MEDIUM,
    fontWeight: '600',
    marginBottom: 3,
  },

  achievementItemDesc: {
    color: THEME.DARK.TEXT_SECONDARY,
    fontSize: FONT_SIZES.SMALL,
    marginBottom: 5,
  },

  achievementItemPoints: {
    color: THEME.DARK.STELLAR_GLOW,
    fontSize: FONT_SIZES.SMALL,
    fontWeight: '600',
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
});

export default AchievementSystem; 