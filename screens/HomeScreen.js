import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
  LinearGradient,
} from 'react-native';
import useGameStore from '../store/gameStore';

const { width, height } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const { 
    highScore, 
    highestBlock, 
    darkMode, 
    hasSavedGame,
    clearSavedGame 
  } = useGameStore();

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

  const getBlockColor = (value) => {
    const colors = {
      2: '#eee4da',
      4: '#ede0c8',
      8: '#f2b179',
      16: '#f59563',
      32: '#f67c5f',
      64: '#f65e3b',
      128: '#edcf72',
      256: '#edcc61',
      512: '#edc850',
      1024: '#edc53f',
      2048: '#edc22e',
    };
    return colors[value] || '#3c3a32';
  };

  return (
    <SafeAreaView style={[styles.container, darkMode ? styles.containerDark : styles.containerLight]}>
      <StatusBar 
        barStyle={darkMode ? "light-content" : "dark-content"} 
        backgroundColor={darkMode ? "#1a1a1a" : "#faf8ef"} 
      />
      
      {/* Background Gradient */}
      <View style={[styles.backgroundGradient, darkMode ? styles.backgroundGradientDark : styles.backgroundGradientLight]} />
      
      {/* Header Section */}
      <View style={styles.headerSection}>
        <Text style={[styles.gameTitle, darkMode ? styles.textLight : styles.textDark]}>
          1024
        </Text>
        <Text style={[styles.gameSubtitle, darkMode ? styles.subtitleLight : styles.subtitleDark]}>
          Drop & Merge
        </Text>
      </View>
      
      {/* Score Section */}
      <View style={styles.scoreSection}>
        <View style={[styles.scoreCard, darkMode ? styles.cardDark : styles.cardLight]}>
          <Text style={[styles.scoreLabel, darkMode ? styles.labelLight : styles.labelDark]}>
            HIGH SCORE
          </Text>
          <Text style={[styles.scoreValue, darkMode ? styles.textLight : styles.textDark]}>
            {formatScore(highScore)}
          </Text>
        </View>
      </View>
      
      {/* Highest Block Section */}
      <View style={styles.blockSection}>
        <View style={[styles.blockCard, darkMode ? styles.cardDark : styles.cardLight]}>
          <View style={[styles.blockDisplay, { backgroundColor: getBlockColor(highestBlock) }]}>
            <Text style={styles.blockValue}>{formatBlock(highestBlock)}</Text>
          </View>
          <Text style={[styles.blockLabel, darkMode ? styles.labelLight : styles.labelDark]}>
            HIGHEST BLOCK
          </Text>
        </View>
      </View>
      
      {/* Action Buttons */}
      <View style={styles.actionSection}>
        {hasSavedGame && (
          <TouchableOpacity 
            style={[styles.resumeButton, styles.buttonShadow]} 
            onPress={handleResumePress}
            activeOpacity={0.8}
          >
            <Text style={styles.resumeText}>RESUME GAME</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={[styles.playButton, styles.buttonShadow]} 
          onPress={handlePlayPress}
          activeOpacity={0.8}
        >
          <Text style={styles.playText}>NEW GAME</Text>
        </TouchableOpacity>
        
        {hasSavedGame && (
          <TouchableOpacity 
            style={[styles.newGameButton, styles.buttonShadow]} 
            onPress={handleNewGamePress}
            activeOpacity={0.8}
          >
            <Text style={styles.newGameText}>START FRESH</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* Settings Button */}
      <View style={styles.settingsSection}>
        <TouchableOpacity 
          style={[styles.settingsButton, darkMode ? styles.settingsButtonDark : styles.settingsButtonLight]} 
          onPress={handleSettingsPress}
          activeOpacity={0.7}
        >
          <Text style={[styles.settingsText, darkMode ? styles.textLight : styles.textDark]}>
            SETTINGS
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  containerDark: {
    backgroundColor: '#1a1a1a',
  },
  containerLight: {
    backgroundColor: '#faf8ef',
  },
  
  // Background
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backgroundGradientLight: {
    backgroundColor: '#faf8ef',
  },
  backgroundGradientDark: {
    backgroundColor: '#1a1a1a',
  },
  
  // Header Section
  headerSection: {
    alignItems: 'center',
    paddingTop: height * 0.08,
    paddingBottom: height * 0.04,
  },
  
  gameTitle: {
    fontSize: 72,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 8,
  },
  gameSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 1,
  },
  textLight: {
    color: '#ffffff',
  },
  textDark: {
    color: '#776e65',
  },
  subtitleLight: {
    color: '#cccccc',
  },
  subtitleDark: {
    color: '#8f7a66',
  },
  
  // Score Section
  scoreSection: {
    alignItems: 'center',
    paddingBottom: height * 0.03,
  },
  
  scoreCard: {
    backgroundColor: '#bbada0',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 160,
  },
  cardDark: {
    backgroundColor: '#3c3a32',
  },
  cardLight: {
    backgroundColor: '#bbada0',
  },
  
  scoreLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  labelLight: {
    color: '#cccccc',
  },
  labelDark: {
    color: '#eee4da',
  },
  
  scoreValue: {
    fontSize: 28,
    fontWeight: '900',
  },
  
  // Block Section
  blockSection: {
    alignItems: 'center',
    paddingBottom: height * 0.05,
  },
  
  blockCard: {
    backgroundColor: '#bbada0',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 140,
  },
  
  blockDisplay: {
    width: 80,
    height: 80,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  
  blockValue: {
    color: '#f9f6f2',
    fontSize: 24,
    fontWeight: '900',
  },
  
  blockLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textAlign: 'center',
  },
  
  // Action Section
  actionSection: {
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: height * 0.04,
  },
  
  resumeButton: {
    backgroundColor: '#ff6b35',
    width: width * 0.8,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  resumeText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
  
  playButton: {
    backgroundColor: '#4caf50',
    width: width * 0.8,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  playText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
  
  newGameButton: {
    backgroundColor: 'transparent',
    width: width * 0.8,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#8f7a66',
  },
  
  newGameText: {
    color: '#8f7a66',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  
  buttonShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  
  // Settings Section
  settingsSection: {
    alignItems: 'center',
    paddingBottom: height * 0.05,
  },
  
  settingsButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  
  settingsButtonLight: {
    backgroundColor: 'rgba(143, 122, 102, 0.1)',
  },
  
  settingsButtonDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  
  settingsText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
  },
});

export default HomeScreen;
