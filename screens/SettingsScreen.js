import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Switch,
  Alert,
  Dimensions,
  Animated,
} from 'react-native';

import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import useGameStore from '../store/gameStore';
import { EnhancedSpaceBackground } from '../components/EnhancedSpaceBackground';
import { getPlanetType } from '../components/constants';
import soundManager from '../utils/soundManager';
import backgroundMusicManager from '../utils/backgroundMusicManager';
import { formatPlanetValue } from '../utils/helpers';
import comprehensiveGameAnalytics from '../utils/comprehensiveGameAnalytics';

const SettingsScreen = ({ navigation }) => {
  const {
    vibrationEnabled,
    soundEnabled,
    backgroundMusicEnabled,
    highScore,
    highestBlock,
    toggleVibration,
    toggleSound,
    toggleBackgroundMusic,
    clearAllData,
    resetOnboarding,
  } = useGameStore();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Track settings screen view for analytics
    comprehensiveGameAnalytics.trackScreenView('Settings');
  }, []);



  useEffect(() => {
    // Use enhanced store methods for better reliability
    try {
      backgroundMusicManager.updateSettings();
    } catch (error) {
      // Failed to update background music settings
    }
  }, [backgroundMusicEnabled]);

  const handleClearData = () => {
    Alert.alert(
      'Reset All Data',
      'This will permanently delete all your progress, scores, and settings. This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: () => {
            clearAllData();
            Alert.alert('Success', 'All data has been reset.');
          },
        },
      ],
      { cancelable: true }
    );
  };

  const formatScore = (score) => {
    if (score === null || score === 0) return '0';
    return score.toLocaleString();
  };

  const formatBlock = (block) => {
    if (block === null || block === 0) return 'None';
    const planet = getPlanetType(block);
    return `${planet.name} (${block.toLocaleString()})`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#0a0a1a" />
      
      {/* Enhanced Deep Space Background */}
      <EnhancedSpaceBackground showMovingStars={true} intensity="medium" />
      
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <View style={styles.backButtonGlow} />
            <Ionicons name="arrow-back" size={24} color="#E6F3FF" />
          </TouchableOpacity>
          <Text style={styles.title}>MISSION CONTROL</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          
          {/* Statistics Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>COSMIC ACHIEVEMENTS</Text>
            
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>HIGHEST SCORE</Text>
                <Text style={styles.statValue}>{formatScore(highScore)}</Text>
              </View>
              
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>LARGEST CELESTIAL BODY</Text>
                <Text style={styles.statValue}>{formatBlock(highestBlock)}</Text>
              </View>
            </View>
          </View>

          {/* Game Settings Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SHIP CONFIGURATION</Text>
            
            <View style={styles.settingsList}>
              {/* Sound Toggle */}
              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <View style={styles.settingIconContainer}>
                    <Ionicons 
                      name={soundEnabled ? "volume-high" : "volume-mute"} 
                      size={22} 
                      color={soundEnabled ? "#4A90E2" : "#666"} 
                    />
                  </View>
                  <View style={styles.settingTextContainer}>
                    <Text style={styles.settingTitle}>Audio Systems</Text>
                    <Text style={styles.settingSubtitle}>
                      Enable cosmic sound effects
                    </Text>
                  </View>
                </View>
                <Switch
                  value={soundEnabled}
                  onValueChange={(newValue) => {
                    // Track sound toggle for analytics
                    comprehensiveGameAnalytics.trackAudioSettingChange('sound', soundEnabled, newValue);
                    toggleSound();
                  }}
                  trackColor={{ false: "#767577", true: "rgba(74, 144, 226, 0.3)" }}
                  thumbColor={soundEnabled ? "#4A90E2" : "#f4f3f4"}
                  ios_backgroundColor="#3e3e3e"
                />
              </View>

              {/* Background Music Toggle */}
              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <View style={styles.settingIconContainer}>
                    <Ionicons 
                      name={backgroundMusicEnabled ? "musical-notes" : "musical-notes-outline"} 
                      size={22} 
                      color={backgroundMusicEnabled ? "#4A90E2" : "#666"} 
                    />
                  </View>
                  <View style={styles.settingTextContainer}>
                    <Text style={styles.settingTitle}>Background Music</Text>
                    <Text style={styles.settingSubtitle}>
                      Cosmic ambient soundtrack
                    </Text>
                  </View>
                </View>
                <Switch
                  value={backgroundMusicEnabled}
                  onValueChange={(newValue) => {
                    // Track background music toggle for analytics
                    comprehensiveGameAnalytics.trackAudioSettingChange('backgroundMusic', backgroundMusicEnabled, newValue);
                    toggleBackgroundMusic();
                  }}
                  trackColor={{ false: "#767577", true: "rgba(74, 144, 226, 0.3)" }}
                  thumbColor={backgroundMusicEnabled ? "#4A90E2" : "#f4f3f4"}
                  ios_backgroundColor="#3e3e3e"
                />
              </View>



              {/* Vibration Toggle */}
              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <View style={styles.settingIconContainer}>
                    <Ionicons 
                      name="phone-portrait" 
                      size={22} 
                      color={vibrationEnabled ? "#4A90E2" : "#666"} 
                    />
                  </View>
                  <View style={styles.settingTextContainer}>
                    <Text style={styles.settingTitle}>Haptic Feedback</Text>
                    <Text style={styles.settingSubtitle}>
                      Feel the cosmic vibrations
                    </Text>
                  </View>
                </View>
                <Switch
                  value={vibrationEnabled}
                  onValueChange={(newValue) => {
                    // Track vibration toggle for analytics
                    comprehensiveGameAnalytics.trackAudioSettingChange('vibration', vibrationEnabled, newValue);
                    toggleVibration();
                  }}
                  trackColor={{ false: "#767577", true: "rgba(74, 144, 226, 0.3)" }}
                  thumbColor={vibrationEnabled ? "#4A90E2" : "#f4f3f4"}
                  ios_backgroundColor="#3e3e3e"
                />
              </View>
            </View>
          </View>

          {/* Data Management Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>DATA MANAGEMENT</Text>
            
            <TouchableOpacity 
              style={styles.dangerButton} 
              onPress={handleClearData}
              activeOpacity={0.8}
            >
              <View style={styles.dangerButtonGlow} />
              <Ionicons name="trash-bin" size={20} color="#FF6B6B" />
              <Text style={styles.dangerButtonText}>Reset All Progress</Text>
            </TouchableOpacity>


          </View>
          

        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
  },
  
  content: {
    flex: 1,
    zIndex: 10,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  
  backButton: {
    backgroundColor: 'rgba(26, 42, 78, 0.8)',
    borderRadius: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    position: 'relative',
    overflow: 'hidden',
  },
  
  backButtonGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    borderRadius: 20,
  },
  
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 2,
    textShadowColor: '#4A90E2',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  
  headerSpacer: {
    width: 44, // Same width as back button to center title
  },
  
  scrollView: {
    flex: 1,
  },
  
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  
  section: {
    marginBottom: 30,
  },
  
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#B0C4DE',
    marginBottom: 15,
    letterSpacing: 1,
    textShadowColor: 'rgba(176, 196, 222, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  
  statsGrid: {
    gap: 15,
  },
  
  statCard: {
    backgroundColor: 'rgba(26, 42, 78, 0.8)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 226, 0.3)',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  
  statLabel: {
    fontSize: 12,
    color: '#9B59B6',
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 8,
    textShadowColor: 'rgba(155, 89, 182, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  
  statValue: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '700',
    textShadowColor: 'rgba(74, 144, 226, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  
  settingsList: {
    backgroundColor: 'rgba(26, 42, 78, 0.6)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  
  settingTextContainer: {
    flex: 1,
  },
  
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  
  settingSubtitle: {
    fontSize: 13,
    color: '#999',
  },
  

  
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 107, 107, 0.3)',
    position: 'relative',
    overflow: 'hidden',
  },
  
  dangerButtonGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 107, 107, 0.05)',
    borderRadius: 12,
  },
  
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B6B',
    marginLeft: 8,
    letterSpacing: 0.5,
  },




});

export default SettingsScreen; 