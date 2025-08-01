import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Share, Alert } from 'react-native';
import { THEME, FONT_SIZES } from './constants';

// Leaderboard component
const Leaderboard = ({ playerScore, globalScores = [] }) => {
  const [timeFrame, setTimeFrame] = useState('all'); // 'daily', 'weekly', 'all'

  // Generate mock leaderboard data for demonstration
  const generateMockLeaderboard = () => {
    const mockData = [
      { rank: 1, name: "CosmicMaster", score: 256430, achievement: "🌟 Solar Emperor" },
      { rank: 2, name: "StarCollider", score: 189250, achievement: "🪐 Gas Giant" },
      { rank: 3, name: "PlanetFuser", score: 145890, achievement: "🌍 Earth Creator" },
      { rank: 4, name: "GalaxyExplorer", score: 98760, achievement: "🌕 Moon Walker" },
      { rank: 5, name: "NebulaNavigator", score: 76540, achievement: "⭐ Stellar Fusion" },
    ];

    // Add player if they have a score
    if (playerScore > 0) {
      const playerRank = mockData.findIndex(p => p.score < playerScore);
      if (playerRank === -1) {
        mockData.push({ rank: mockData.length + 1, name: "You", score: playerScore, achievement: "🚀 Space Explorer", isPlayer: true });
      } else {
        mockData.splice(playerRank, 0, { rank: playerRank + 1, name: "You", score: playerScore, achievement: "🚀 Space Explorer", isPlayer: true });
        // Update ranks
        mockData.forEach((player, index) => {
          player.rank = index + 1;
        });
      }
    }

    return mockData.slice(0, 10); // Top 10
  };

  const leaderboardData = generateMockLeaderboard();

  return (
    <View style={styles.leaderboardContainer}>
      <View style={styles.timeFrameSelector}>
        {['daily', 'weekly', 'all'].map(frame => (
          <TouchableOpacity
            key={frame}
            style={[
              styles.timeFrameButton,
              timeFrame === frame && styles.timeFrameButtonActive
            ]}
            onPress={() => setTimeFrame(frame)}
          >
            <Text style={[
              styles.timeFrameText,
              timeFrame === frame && styles.timeFrameTextActive
            ]}>
              {frame.charAt(0).toUpperCase() + frame.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.leaderboardList}>
        {leaderboardData.map((player, index) => (
          <View
            key={index}
            style={[
              styles.leaderboardItem,
              player.isPlayer && styles.playerItem,
              player.rank <= 3 && styles.topThreeItem
            ]}
          >
            <View style={styles.rankContainer}>
              <Text style={[
                styles.rankText,
                player.rank <= 3 && styles.topThreeRank
              ]}>
                {player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : player.rank === 3 ? '🥉' : `#${player.rank}`}
              </Text>
            </View>
            
            <View style={styles.playerInfo}>
              <Text style={[
                styles.playerName,
                player.isPlayer && styles.playerNameHighlight
              ]}>
                {player.name}
              </Text>
              <Text style={styles.playerAchievement}>
                {player.achievement}
              </Text>
            </View>
            
            <Text style={[
              styles.playerScore,
              player.isPlayer && styles.playerScoreHighlight
            ]}>
              {player.score.toLocaleString()}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

// Social sharing component
export const SocialSystem = ({ 
  score = 0, 
  highestTile = 0, 
  achievements = [],
  onShareSuccess 
}) => {
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('leaderboard'); // 'leaderboard', 'share'

  const shareScore = async () => {
    const planetName = getPlanetName(highestTile);
    const message = `🌌 Just scored ${score.toLocaleString()} points in Cosmic Collision! I created ${planetName} (${highestTile}) and unlocked ${achievements.length} cosmic achievements! 🚀\n\nCan you beat my score? ⭐`;

    try {
      await Share.share({
        message: message,
        title: 'Cosmic Collision - My Space Achievement!',
        url: 'https://cosmic-collision.app', // Your app's URL
      });
      
      if (onShareSuccess) {
        onShareSuccess();
      }
    } catch (error) {
      Alert.alert('Sharing Error', 'Unable to share your cosmic achievement right now.');
    }
  };

  const shareAchievement = async (achievement) => {
    const message = `🏆 Achievement Unlocked in Cosmic Collision!\n\n${achievement.icon} ${achievement.title}\n"${achievement.description}"\n\n+${achievement.points} XP earned! Join me in the cosmos! 🌌`;

    try {
      await Share.share({
        message: message,
        title: 'Cosmic Achievement Unlocked!',
        url: 'https://cosmic-collision.app',
      });
    } catch (error) {
      Alert.alert('Sharing Error', 'Unable to share this achievement right now.');
    }
  };

  const challengeFriend = async () => {
    const message = `🌌 I challenge you to beat my cosmic high score!\n\nMy best: ${score.toLocaleString()} points\nHighest creation: ${getPlanetName(highestTile)}\n\nThink you can create bigger planets and score higher? Download Cosmic Collision and prove it! 🚀⭐`;

    try {
      await Share.share({
        message: message,
        title: 'Cosmic Challenge!',
        url: 'https://cosmic-collision.app',
      });
    } catch (error) {
      Alert.alert('Challenge Error', 'Unable to send challenge right now.');
    }
  };

  const getPlanetName = (value) => {
    const planets = {
      2: 'Mercury', 4: 'Mars', 8: 'Venus', 16: 'Earth',
      32: 'Jupiter', 64: 'Saturn', 128: 'Uranus', 256: 'Neptune',
      512: 'Sun', 1024: 'Sirius', 2048: 'Betelgeuse'
    };
    return planets[value] || `Cosmic Body (${value})`;
  };

  return (
    <>
      {/* Social Button */}
      <TouchableOpacity
        style={styles.socialButton}
        onPress={() => setShowModal(true)}
      >
        <Text style={styles.socialButtonText}>🌐</Text>
      </TouchableOpacity>

      {/* Social Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>🌌 Cosmic Community</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Tab Selector */}
          <View style={styles.tabSelector}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'leaderboard' && styles.activeTab
              ]}
              onPress={() => setActiveTab('leaderboard')}
            >
              <Text style={[
                styles.tabText,
                activeTab === 'leaderboard' && styles.activeTabText
              ]}>
                🏆 Leaderboard
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'share' && styles.activeTab
              ]}
              onPress={() => setActiveTab('share')}
            >
              <Text style={[
                styles.tabText,
                activeTab === 'share' && styles.activeTabText
              ]}>
                🚀 Share
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          {activeTab === 'leaderboard' ? (
            <Leaderboard playerScore={score} />
          ) : (
            <View style={styles.shareContainer}>
              <View style={styles.shareStats}>
                <Text style={styles.shareStatsTitle}>Your Cosmic Journey</Text>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>🎯 Best Score:</Text>
                  <Text style={styles.statValue}>{score.toLocaleString()}</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>🪐 Highest Creation:</Text>
                  <Text style={styles.statValue}>{getPlanetName(highestTile)}</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>🏆 Achievements:</Text>
                  <Text style={styles.statValue}>{achievements.length}</Text>
                </View>
              </View>

              <View style={styles.shareButtons}>
                <TouchableOpacity
                  style={[styles.shareButton, styles.shareScoreButton]}
                  onPress={shareScore}
                >
                  <Text style={styles.shareButtonText}>📊 Share My Score</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.shareButton, styles.challengeButton]}
                  onPress={challengeFriend}
                >
                  <Text style={styles.shareButtonText}>⚔️ Challenge Friends</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.shareButton, styles.inviteButton]}
                  onPress={() => Share.share({
                    message: '🌌 Join me in Cosmic Collision - the most epic space puzzle game! Merge planets, create stars, and conquer the universe! 🚀',
                    title: 'Join the Cosmic Adventure!',
                    url: 'https://cosmic-collision.app'
                  })}
                >
                  <Text style={styles.shareButtonText}>👥 Invite Players</Text>
                </TouchableOpacity>
              </View>

              {/* Recent achievements to share */}
              {achievements.length > 0 && (
                <View style={styles.recentAchievements}>
                  <Text style={styles.achievementsTitle}>Recent Achievements to Share:</Text>
                  {achievements.slice(0, 3).map((achievement, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.achievementShareItem}
                      onPress={() => shareAchievement(achievement)}
                    >
                      <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                      <View style={styles.achievementShareInfo}>
                        <Text style={styles.achievementShareTitle}>{achievement.title}</Text>
                        <Text style={styles.achievementShareDesc}>{achievement.description}</Text>
                      </View>
                      <Text style={styles.shareIcon}>📤</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
      </Modal>
    </>
  );
}; 

const styles = StyleSheet.create({
  socialButton: {
    position: 'absolute',
    top: 60,
    left: 20,
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
    borderColor: THEME.DARK.STELLAR_GLOW,
    zIndex: 1000,
  },

  socialButtonText: {
    fontSize: 20,
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

  tabSelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },

  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginHorizontal: 5,
    backgroundColor: THEME.DARK.BACKGROUND_SECONDARY + '60',
    alignItems: 'center',
  },

  activeTab: {
    backgroundColor: THEME.DARK.COSMIC_ACCENT + '30',
    borderWidth: 1,
    borderColor: THEME.DARK.COSMIC_ACCENT,
  },

  tabText: {
    color: THEME.DARK.TEXT_SECONDARY,
    fontSize: FONT_SIZES.MEDIUM,
    fontWeight: '600',
  },

  activeTabText: {
    color: THEME.DARK.COSMIC_ACCENT,
  },

  // Leaderboard Styles
  leaderboardContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },

  timeFrameSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 15,
  },

  timeFrameButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: THEME.DARK.BACKGROUND_SECONDARY + '60',
  },

  timeFrameButtonActive: {
    backgroundColor: THEME.DARK.STELLAR_GLOW + '30',
    borderWidth: 1,
    borderColor: THEME.DARK.STELLAR_GLOW,
  },

  timeFrameText: {
    color: THEME.DARK.TEXT_SECONDARY,
    fontSize: FONT_SIZES.SMALL,
    fontWeight: '600',
  },

  timeFrameTextActive: {
    color: THEME.DARK.STELLAR_GLOW,
  },

  leaderboardList: {
    flex: 1,
  },

  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginVertical: 5,
    borderRadius: 12,
    backgroundColor: THEME.DARK.BACKGROUND_SECONDARY + '40',
  },

  playerItem: {
    backgroundColor: THEME.DARK.COSMIC_ACCENT + '20',
    borderWidth: 1,
    borderColor: THEME.DARK.COSMIC_ACCENT + '40',
  },

  topThreeItem: {
    backgroundColor: THEME.DARK.STELLAR_GLOW + '15',
    borderWidth: 1,
    borderColor: THEME.DARK.STELLAR_GLOW + '30',
  },

  rankContainer: {
    width: 40,
    alignItems: 'center',
  },

  rankText: {
    color: THEME.DARK.TEXT_PRIMARY,
    fontSize: FONT_SIZES.MEDIUM,
    fontWeight: '700',
  },

  topThreeRank: {
    fontSize: FONT_SIZES.LARGE,
  },

  playerInfo: {
    flex: 1,
    marginLeft: 15,
  },

  playerName: {
    color: THEME.DARK.TEXT_PRIMARY,
    fontSize: FONT_SIZES.MEDIUM,
    fontWeight: '600',
    marginBottom: 2,
  },

  playerNameHighlight: {
    color: THEME.DARK.COSMIC_ACCENT,
    fontWeight: '700',
  },

  playerAchievement: {
    color: THEME.DARK.TEXT_SECONDARY,
    fontSize: FONT_SIZES.SMALL,
  },

  playerScore: {
    color: THEME.DARK.STELLAR_GLOW,
    fontSize: FONT_SIZES.MEDIUM,
    fontWeight: '700',
  },

  playerScoreHighlight: {
    color: THEME.DARK.NEON_GLOW,
  },

  // Share Styles
  shareContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },

  shareStats: {
    backgroundColor: THEME.DARK.BACKGROUND_SECONDARY + '60',
    borderRadius: 15,
    padding: 20,
    marginVertical: 15,
    borderWidth: 1,
    borderColor: THEME.DARK.COSMIC_ACCENT + '30',
  },

  shareStatsTitle: {
    color: THEME.DARK.TEXT_PRIMARY,
    fontSize: FONT_SIZES.LARGE,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 15,
  },

  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },

  statLabel: {
    color: THEME.DARK.TEXT_SECONDARY,
    fontSize: FONT_SIZES.MEDIUM,
    fontWeight: '600',
  },

  statValue: {
    color: THEME.DARK.NEON_GLOW,
    fontSize: FONT_SIZES.MEDIUM,
    fontWeight: '700',
  },

  shareButtons: {
    marginVertical: 20,
  },

  shareButton: {
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 25,
    marginVertical: 8,
    alignItems: 'center',
    borderWidth: 2,
  },

  shareScoreButton: {
    backgroundColor: THEME.DARK.COSMIC_ACCENT + '20',
    borderColor: THEME.DARK.COSMIC_ACCENT,
  },

  challengeButton: {
    backgroundColor: THEME.DARK.STELLAR_GLOW + '20',
    borderColor: THEME.DARK.STELLAR_GLOW,
  },

  inviteButton: {
    backgroundColor: THEME.DARK.NEBULA_PINK + '20',
    borderColor: THEME.DARK.NEBULA_PINK,
  },

  shareButtonText: {
    color: THEME.DARK.TEXT_PRIMARY,
    fontSize: FONT_SIZES.MEDIUM,
    fontWeight: '700',
  },

  recentAchievements: {
    marginTop: 20,
  },

  achievementsTitle: {
    color: THEME.DARK.TEXT_PRIMARY,
    fontSize: FONT_SIZES.MEDIUM,
    fontWeight: '700',
    marginBottom: 15,
  },

  achievementShareItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.DARK.BACKGROUND_SECONDARY + '40',
    borderRadius: 12,
    padding: 15,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: THEME.DARK.COSMIC_ACCENT + '20',
  },

  achievementIcon: {
    fontSize: 24,
    marginRight: 12,
  },

  achievementShareInfo: {
    flex: 1,
  },

  achievementShareTitle: {
    color: THEME.DARK.TEXT_PRIMARY,
    fontSize: FONT_SIZES.MEDIUM,
    fontWeight: '600',
    marginBottom: 2,
  },

  achievementShareDesc: {
    color: THEME.DARK.TEXT_SECONDARY,
    fontSize: FONT_SIZES.SMALL,
  },

  shareIcon: {
    fontSize: 20,
    color: THEME.DARK.COSMIC_ACCENT,
  },
});

export default SocialSystem; 