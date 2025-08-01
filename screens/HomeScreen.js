import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Platform,
  Animated,
} from 'react-native';
import useGameStore from '../store/gameStore';
import { THEME, FONT_SIZES } from '../components/constants';

// Web-compatible dimensions
const getDimensions = () => {
  try {
    const dimensions = Dimensions.get('window');
    return {
      width: dimensions?.width || (Platform.OS === 'web' ? 400 : 400),
      height: dimensions?.height || (Platform.OS === 'web' ? 800 : 800)
    };
  } catch (error) {
    return {
      width: Platform.OS === 'web' ? 400 : 400,
      height: Platform.OS === 'web' ? 800 : 800
    };
  }
};

const { width, height } = getDimensions();

const HomeScreen = ({ navigation }) => {
  const { 
    highScore, 
    highestBlock, 
    hasSavedGame,
    clearSavedGame 
  } = useGameStore();

  // Simple fade animation only
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.DARK.BACKGROUND_PRIMARY} />
      
      <Animated.View 
        style={[
          styles.content, 
          { opacity: fadeAnim }
        ]}
      >
        {/* Simple Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.gameTitle}>2048</Text>
        </View>
        
        {/* Simple Stats */}
        {(highScore > 0 || highestBlock > 0) && (
          <View style={styles.statsContainer}>
            <Text style={styles.statText}>Best: {formatScore(highScore)}</Text>
            <Text style={styles.statText}>Highest: {formatBlock(highestBlock)}</Text>
          </View>
        )}
        
        {/* Clean Buttons */}
        <View style={styles.buttonContainer}>
          {hasSavedGame ? (
            <>
              <TouchableOpacity 
                style={styles.button} 
                onPress={handleResumePress}
                activeOpacity={0.7}
              >
                <Text style={styles.buttonText}>Resume</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.button} 
                onPress={handleNewGamePress}
                activeOpacity={0.7}
              >
                <Text style={styles.buttonText}>New Game</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity 
              style={styles.button} 
              onPress={handlePlayPress}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>Play</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]} 
            onPress={handleSettingsPress}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryButtonText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.DARK.BACKGROUND_PRIMARY,
  },
  
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  
  titleContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  
  gameTitle: {
    fontSize: 64,
    fontWeight: '300',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 2,
  },
  
  statsContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  
  statText: {
    fontSize: 16,
    color: THEME.DARK.TEXT_SECONDARY,
    marginVertical: 4,
    fontWeight: '400',
  },
  
  buttonContainer: {
    width: '100%',
    maxWidth: 280,
    alignItems: 'center',
  },
  
  button: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  
  secondaryButton: {
    backgroundColor: 'transparent',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  
  buttonText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '400',
    color: THEME.DARK.TEXT_SECONDARY,
  },
});

export default HomeScreen;
