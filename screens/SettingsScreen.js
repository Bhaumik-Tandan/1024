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
  Slider,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import useGameStore from '../store/gameStore';
import { EnhancedSpaceBackground } from '../components/EnhancedSpaceBackground';
import { getPlanetType } from '../components/constants';
import soundManager from '../utils/soundManager';

const SettingsScreen = ({ navigation }) => {
  const {
    vibrationEnabled,
    soundEnabled,
    soundVolume,
    highScore,
    highestBlock,
    toggleVibration,
    toggleSound,
    clearAllData,
    setSoundVolume,
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
  }, []);

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
                  onValueChange={toggleSound}
                  trackColor={{ false: "#767577", true: "rgba(74, 144, 226, 0.3)" }}
                  thumbColor={soundEnabled ? "#4A90E2" : "#f4f3f4"}
                  ios_backgroundColor="#3e3e3e"
                />
              </View>

              {/* Volume Slider - Only show when sound is enabled */}
              {soundEnabled && (
                <View style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <View style={styles.settingIconContainer}>
                      <Ionicons 
                        name="volume-medium" 
                        size={22} 
                        color="#4A90E2" 
                      />
                    </View>
                    <View style={styles.settingTextContainer}>
                      <Text style={styles.settingTitle}>Volume Level</Text>
                      <Text style={styles.settingSubtitle}>
                        Adjust cosmic audio intensity
                      </Text>
                    </View>
                  </View>
                  <View style={styles.volumeContainer}>
                    <Slider
                      style={styles.volumeSlider}
                      minimumValue={0}
                      maximumValue={1}
                      value={soundVolume}
                      onValueChange={(value) => {
                        // Update volume in store
                        const { setSoundVolume } = useGameStore.getState();
                        setSoundVolume(value);
                        // Update sound manager volume
                        soundManager.setVolume(value);
                      }}
                      minimumTrackTintColor="#4A90E2"
                      maximumTrackTintColor="#666"
                      thumbStyle={styles.volumeThumb}
                      trackStyle={styles.volumeTrack}
                    />
                    <Text style={styles.volumeText}>
                      {Math.round(soundVolume * 100)}%
                    </Text>
                  </View>
                </View>
              )}

              {/* Sound Test Button - Only show when sound is enabled */}
              {soundEnabled && (
                <View style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <View style={styles.settingIconContainer}>
                      <Ionicons 
                        name="play-circle" 
                        size={22} 
                        color="#4A90E2" 
                      />
                    </View>
                    <View style={styles.settingTextContainer}>
                      <Text style={styles.settingTitle}>Test Audio</Text>
                      <Text style={styles.settingSubtitle}>
                        Preview cosmic sound effects
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.testButton}
                    onPress={() => {
                      // Play a sequence of test sounds
                      soundManager.playMergeSound();
                      setTimeout(() => {
                        soundManager.playIntermediateMergeSound();
                      }, 300);
                      setTimeout(() => {
                        soundManager.playDropSound();
                      }, 600);
                    }}
                  >
                    <Text style={styles.testButtonText}>TEST</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Debug Sound System Button */}
              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <View style={styles.settingIconContainer}>
                    <Ionicons 
                      name="bug" 
                      size={22} 
                      color="#FF6B6B" 
                    />
                  </View>
                  <View style={styles.settingTextContainer}>
                    <Text style={styles.settingTitle}>Debug Audio</Text>
                    <Text style={styles.settingSubtitle}>
                      Check sound system status
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.testButton, { backgroundColor: 'rgba(255, 107, 107, 0.1)', borderColor: 'rgba(255, 107, 107, 0.3)' }]}
                  onPress={() => {
                    // Run comprehensive sound system debug
                    soundManager.testSoundSystem();
                    soundManager.debugDropSound();
                    console.log('🔍 Manual sound system debug triggered');
                  }}
                >
                  <Text style={[styles.testButtonText, { color: '#FF6B6B' }]}>DEBUG</Text>
                </TouchableOpacity>
              </View>

              {/* Test Drop Sound Button */}
              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <View style={styles.settingIconContainer}>
                    <Ionicons 
                      name="volume-high" 
                      size={22} 
                      color="#FF9500" 
                    />
                  </View>
                  <View style={styles.settingTextContainer}>
                    <Text style={styles.settingTitle}>Test Drop Sound</Text>
                    <Text style={styles.settingSubtitle}>
                      Test drop sound specifically
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.testButton, { backgroundColor: 'rgba(255, 149, 0, 0.1)', borderColor: 'rgba(255, 149, 0, 0.3)' }]}
                  onPress={() => {
                    // Test drop sound specifically
                    soundManager.testDropSound();
                    console.log('🧪 Manual drop sound test triggered');
                  }}
                >
                  <Text style={[styles.testButtonText, { color: '#FF9500' }]}>TEST DROP</Text>
                </TouchableOpacity>
              </View>

              {/* Test All Sounds Button */}
              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <View style={styles.settingIconContainer}>
                    <Ionicons 
                      name="musical-notes" 
                      size={22} 
                      color="#34C759" 
                    />
                  </View>
                  <View style={styles.settingTextContainer}>
                    <Text style={styles.settingTitle}>Test All Sounds</Text>
                    <Text style={styles.settingSubtitle}>
                      Test entire audio system
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.testButton, { backgroundColor: 'rgba(52, 199, 89, 0.1)', borderColor: 'rgba(52, 199, 89, 0.3)' }]}
                  onPress={() => {
                    // Test all sounds
                    soundManager.testAudioSystem();
                    console.log('🧪 Manual audio system test triggered');
                  }}
                >
                  <Text style={[styles.testButtonText, { color: '#34C759' }]}>TEST ALL</Text>
                </TouchableOpacity>
              </View>

              {/* Test Basic Audio API Button */}
              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <View style={styles.settingIconContainer}>
                    <Ionicons 
                      name="settings" 
                      size={22} 
                      color="#007AFF" 
                    />
                  </View>
                  <View style={styles.settingTextContainer}>
                    <Text style={styles.settingTitle}>Test Audio API</Text>
                    <Text style={styles.settingSubtitle}>
                      Check basic audio functionality
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.testButton, { backgroundColor: 'rgba(0, 122, 255, 0.1)', borderColor: 'rgba(0, 122, 255, 0.3)' }]}
                  onPress={() => {
                    // Test basic audio API
                    soundManager.testBasicAudioAPI();
                    console.log('🧪 Manual audio API test triggered');
                  }}
                >
                  <Text style={[styles.testButtonText, { color: '#007AFF' }]}>TEST API</Text>
                </TouchableOpacity>
              </View>

              {/* Test Drop Sound Audibility Button */}
              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <View style={styles.settingIconContainer}>
                    <Ionicons 
                      name="volume-high" 
                      size={22} 
                      color="#FF3B30" 
                    />
                  </View>
                  <View style={styles.settingTextContainer}>
                    <Text style={styles.settingTitle}>Test Drop Audibility</Text>
                    <Text style={styles.settingSubtitle}>
                      Check if drop sound is audible
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.testButton, { backgroundColor: 'rgba(255, 59, 48, 0.1)', borderColor: 'rgba(255, 59, 48, 0.3)' }]}
                  onPress={() => {
                    // Test drop sound audibility
                    soundManager.testDropSoundAudibility();
                    console.log('🔊 Manual drop sound audibility test triggered');
                  }}
                >
                  <Text style={[styles.testButtonText, { color: '#FF3B30' }]}>TEST AUDIBLE</Text>
                </TouchableOpacity>
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
                  onValueChange={toggleVibration}
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
          
          {/* Version Information */}
          <View style={styles.footer}>
            <Text style={styles.versionText}>Space Drop v1.0.0</Text>
            <Text style={styles.copyrightText}>Explore the cosmic puzzle universe</Text>
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
  
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 10,
  },

  volumeSlider: {
    flex: 1,
    height: 40,
    marginHorizontal: 10,
  },

  volumeThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4A90E2',
  },

  volumeTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#666',
  },

  volumeText: {
    fontSize: 14,
    color: '#999',
    marginLeft: 10,
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

  testButton: {
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 226, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },

  testButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A90E2',
    letterSpacing: 0.5,
  },
  
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    marginTop: 20,
  },
  
  versionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginBottom: 4,
  },
  
  copyrightText: {
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
  },
});

export default SettingsScreen; 