import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import useGameStore from '../store/gameStore';

const HomeScreen = ({ navigation }) => {
  const { highScore, highestBlock } = useGameStore();

  const handlePlayPress = () => {
    navigation.navigate('Drop Number Board');
  };

  const handleSettingsPress = () => {
    navigation.navigate('Settings');
  };

  const formatScore = (score) => {
    if (score === null || score === 0) return '0';
    return score.toLocaleString();
  };

  const formatBlock = (block) => {
    if (block === null || block === 0) return '0';
    return block.toLocaleString();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2c2c2c" />
      
      {/* Top Section - Score */}
      <View style={styles.topSection}>
        <Text style={styles.scoreText}>{formatScore(highScore)}</Text>
      </View>
      
      {/* Middle Section - Game Info and Play Button */}
      <View style={styles.middleSection}>
        <View style={styles.highestBlockContainer}>
          <View style={styles.highestBlock}>
            <Text style={styles.blockValue}>{formatBlock(highestBlock)}</Text>
          </View>
          <Text style={styles.highestBlockText}>HIGHEST BLOCK</Text>
        </View>
        
        <TouchableOpacity style={styles.playButton} onPress={handlePlayPress}>
          <Text style={styles.playText}>PLAY</Text>
        </TouchableOpacity>
      </View>
      
      {/* Bottom Section - Simple Navigation */}
      <View style={styles.bottomSection}>
        <View style={styles.navigationRow}>
          <TouchableOpacity style={styles.navButton} onPress={handleSettingsPress}>
            <Text style={styles.navText}>SETTINGS</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2c2c2c',
  },
  
  // Top Section
  topSection: {
    alignItems: 'center',
    paddingTop: 40,
  },
  
  scoreText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  
  // Middle Section
  middleSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  
  highestBlockContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  
  highestBlock: {
    width: 100,
    height: 100,
    backgroundColor: '#e91e63',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  
  blockValue: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  
  highestBlockText: {
    color: '#ffffff',
    fontSize: 12,
    textAlign: 'center',
  },
  
  playButton: {
    backgroundColor: '#4caf50',
    width: 150,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  playText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  // Bottom Section
  bottomSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  
  navigationRow: {
    alignItems: 'center',
  },
  
  navButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  
  navText: {
    color: '#ffffff',
    fontSize: 14,
  },
});

export default HomeScreen;
