import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import useGameStore from '../store/gameStore';
import SpaceBackground from '../components/SpaceBackground';
import { THEME } from '../components/constants';

const SettingsScreen = ({ navigation }) => {
  const {
    vibrationEnabled,
    soundEnabled,
    soundVolume,
    highScore,
    highestBlock,
    toggleVibration,
    toggleSound,
    setSoundVolume,
    resetAllSettings,
  } = useGameStore();

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetAllSettings();
            Alert.alert('Settings Reset', 'All settings have been reset to default.');
          },
        },
      ]
    );
  };

  // Cosmic gradient alternative using multiple Views
  const CosmicPanel = ({ children, colors = ['primary', 'secondary'], style = {} }) => (
    <View style={[styles.cosmicPanel, style]}>
      <View style={[styles.gradientLayer, { backgroundColor: THEME.DARK.BACKGROUND_SECONDARY }]} />
      <View style={[styles.gradientOverlay, { backgroundColor: THEME.DARK.COSMIC_PURPLE, opacity: 0.15 }]} />
      <View style={styles.panelContent}>
        {children}
      </View>
    </View>
  );

  const VolumeSlider = ({ value, onValueChange, title, enabled, icon }) => (
    <CosmicPanel style={styles.sliderContainer}>
      <View style={styles.sliderHeader}>
        <View style={[styles.cosmicIconContainer, { backgroundColor: THEME.DARK.COSMIC_ACCENT + '40' }]}>
          <Ionicons name={icon} size={20} color={THEME.DARK.STELLAR_GLOW} />
        </View>
        <Text style={[styles.sliderTitle, styles.cosmicText]}>{title}</Text>
      </View>
      <View style={styles.sliderTrack}>
        {[0, 0.25, 0.5, 0.75, 1].map((step) => (
          <TouchableOpacity
            key={step}
            style={[
              styles.sliderStep,
              styles.cosmicSliderStep,
              value >= step && enabled && styles.sliderStepActive,
            ]}
            onPress={() => enabled && onValueChange(step)}
            activeOpacity={0.7}
          />
        ))}
      </View>
      <Text style={[styles.volumeText, styles.cosmicText]}>{Math.round(value * 100)}%</Text>
    </CosmicPanel>
  );

  const SettingRow = ({ icon, label, value, onToggle, color = THEME.DARK.COSMIC_ACCENT }) => (
    <CosmicPanel style={styles.settingRow}>
      <View style={styles.settingLeft}>
        <View style={[styles.cosmicIconContainer, { backgroundColor: color + '40' }]}>
          <Ionicons name={icon} size={20} color={THEME.DARK.STARFIELD} />
        </View>
        <Text style={[styles.settingLabel, styles.cosmicText]}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: THEME.DARK.BACKGROUND_PRIMARY, true: color }}
        thumbColor={value ? THEME.DARK.STARFIELD : THEME.DARK.TEXT_SECONDARY}
        ios_backgroundColor={THEME.DARK.BACKGROUND_PRIMARY}
      />
    </CosmicPanel>
  );

  const StatRow = ({ icon, label, value, color = THEME.DARK.STELLAR_GLOW }) => (
    <CosmicPanel style={styles.statRow}>
      <View style={styles.statLeft}>
        <View style={[styles.cosmicIconContainer, { backgroundColor: color + '40' }]}>
          <Ionicons name={icon} size={20} color={THEME.DARK.STARFIELD} />
        </View>
        <Text style={[styles.statLabel, styles.cosmicText]}>{label}</Text>
      </View>
      <Text style={[styles.statValue, styles.cosmicHighlight]}>{value}</Text>
    </CosmicPanel>
  );

  const formatScore = (score) => {
    if (score === null || score === 0) return '0';
    return score.toLocaleString();
  };

  const formatBlock = (block) => {
    if (block === null || block === 0) return '0';
    return block.toLocaleString();
  };

  return (
    <View style={styles.cosmicContainer}>
      {/* Cosmic Background */}
      <SpaceBackground />
      
      <SafeAreaView style={styles.container}>
        <StatusBar style="light-content" backgroundColor="transparent" translucent />
        
        {/* Cosmic Header */}
        <View style={[styles.header, styles.cosmicHeader]}>
          <View style={[styles.headerGradientLayer, { backgroundColor: THEME.DARK.COSMIC_PURPLE, opacity: 0.6 }]} />
          <View style={[styles.headerGradientLayer, { backgroundColor: THEME.DARK.BACKGROUND_SECONDARY, opacity: 0.8 }]} />
          
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.cosmicBackButton}>
            <View style={styles.backButtonGradient}>
              <View style={[styles.gradientLayer, { backgroundColor: THEME.DARK.COSMIC_ACCENT, opacity: 0.4 }]} />
              <View style={[styles.gradientLayer, { backgroundColor: THEME.DARK.BACKGROUND_SECONDARY }]} />
              <Ionicons name="arrow-back" size={24} color={THEME.DARK.STARFIELD} />
            </View>
          </TouchableOpacity>
          
          <View style={styles.headerTitleContainer}>
            <Text style={[styles.headerTitle, styles.cosmicTitle]}>⚙️ Cosmic Settings</Text>
            <Text style={styles.headerSubtitle}>Space Station Control Panel</Text>
          </View>
          
          <View style={styles.cosmicOrb}>
            <View style={[styles.orbGradient, { backgroundColor: THEME.DARK.STELLAR_GLOW, opacity: 0.8 }]} />
            <View style={[styles.orbGradient, { backgroundColor: THEME.DARK.COSMIC_ACCENT, opacity: 0.6 }]} />
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Sound Systems */}
          <View style={styles.section}>
            <View style={styles.cosmicSectionHeader}>
              <View style={styles.sectionIconBg}>
                <View style={[styles.gradientLayer, { backgroundColor: THEME.DARK.COSMIC_ACCENT, opacity: 0.4 }]} />
                <View style={[styles.gradientLayer, { backgroundColor: THEME.DARK.STELLAR_GLOW, opacity: 0.2 }]} />
                <Ionicons name="volume-high" size={28} color={THEME.DARK.STARFIELD} />
              </View>
              <View>
                <Text style={[styles.sectionTitle, styles.cosmicSectionTitle]}>🔊 Audio Systems</Text>
                <Text style={styles.sectionSubtitle}>Spacecraft Audio Controls</Text>
              </View>
            </View>
            
            <SettingRow
              icon="musical-notes"
              label="Sound Effects"
              value={soundEnabled}
              onToggle={toggleSound}
              color={THEME.DARK.COSMIC_ACCENT}
            />
          </View>

          {/* Navigation Controls */}
          <View style={styles.section}>
            <View style={styles.cosmicSectionHeader}>
              <View style={styles.sectionIconBg}>
                <View style={[styles.gradientLayer, { backgroundColor: THEME.DARK.STELLAR_GLOW, opacity: 0.4 }]} />
                <View style={[styles.gradientLayer, { backgroundColor: THEME.DARK.NEBULA_PINK, opacity: 0.2 }]} />
                <Ionicons name="game-controller" size={28} color={THEME.DARK.STARFIELD} />
              </View>
              <View>
                <Text style={[styles.sectionTitle, styles.cosmicSectionTitle]}>🎮 Navigation</Text>
                <Text style={styles.sectionSubtitle}>Tactile Feedback Systems</Text>
              </View>
            </View>
            
            <SettingRow
              icon="phone-portrait"
              label="Haptic Feedback"
              value={vibrationEnabled}
              onToggle={toggleVibration}
              color={THEME.DARK.STELLAR_GLOW}
            />
          </View>

          {/* Mission Statistics */}
          <View style={styles.section}>
            <View style={styles.cosmicSectionHeader}>
              <View style={styles.sectionIconBg}>
                <View style={[styles.gradientLayer, { backgroundColor: THEME.DARK.NEBULA_PINK, opacity: 0.4 }]} />
                <View style={[styles.gradientLayer, { backgroundColor: THEME.DARK.COSMIC_PURPLE, opacity: 0.2 }]} />
                <Ionicons name="stats-chart" size={28} color={THEME.DARK.STARFIELD} />
              </View>
              <View>
                <Text style={[styles.sectionTitle, styles.cosmicSectionTitle]}>📊 Mission Data</Text>
                <Text style={styles.sectionSubtitle}>Explorer Achievement Records</Text>
              </View>
            </View>
            
            <StatRow
              icon="trophy"
              label="Highest Score"
              value={formatScore(highScore)}
              color={THEME.DARK.STELLAR_GLOW}
            />

            <StatRow
              icon="planet"
              label="Largest Celestial Body"
              value={formatBlock(highestBlock)}
              color={THEME.DARK.NEBULA_PINK}
            />
          </View>

          {/* System Reset */}
          <View style={styles.section}>
            <TouchableOpacity onPress={handleResetSettings}>
              <View style={[styles.resetButton, styles.cosmicResetButton]}>
                <View style={[styles.gradientLayer, { backgroundColor: THEME.DARK.ERROR_COLOR, opacity: 0.2 }]} />
                <View style={[styles.gradientLayer, { backgroundColor: THEME.DARK.BACKGROUND_SECONDARY, opacity: 0.9 }]} />
                <View style={styles.panelContent}>
                  <View style={[styles.cosmicIconContainer, { backgroundColor: THEME.DARK.ERROR_COLOR + '40' }]}>
                    <Ionicons name="refresh" size={20} color={THEME.DARK.STARFIELD} />
                  </View>
                  <View>
                    <Text style={[styles.resetButtonText, styles.cosmicText]}>🔄 Reset All Settings</Text>
                    <Text style={styles.resetSubtext}>Restore factory defaults</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Cosmic Footer */}
          <View style={styles.cosmicFooter}>
            <Text style={styles.footerText}>🌌 Exploring the Infinite Universe 🌌</Text>
            <Text style={styles.footerSubtext}>Version 2.0 - Deep Space Edition</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  cosmicContainer: {
    flex: 1,
    backgroundColor: THEME.DARK.BACKGROUND_PRIMARY,
  },
  container: {
    flex: 1,
  },
  
  // Gradient effect using multiple layers
  gradientLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 15,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 15,
  },
  panelContent: {
    position: 'relative',
    zIndex: 1,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 25,
    paddingTop: 60, // Account for status bar
    position: 'relative',
  },
  cosmicHeader: {
    borderBottomWidth: 1,
    borderBottomColor: THEME.DARK.COSMIC_ACCENT + '30',
    shadowColor: THEME.DARK.COSMIC_PURPLE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerGradientLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  
  cosmicBackButton: {
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    zIndex: 2,
  },
  backButtonGradient: {
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: THEME.DARK.COSMIC_ACCENT + '40',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  headerTitleContainer: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 20,
    position: 'relative',
    zIndex: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  cosmicTitle: {
    color: THEME.DARK.STARFIELD,
    textShadowColor: THEME.DARK.COSMIC_ACCENT,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  headerSubtitle: {
    fontSize: 12,
    color: THEME.DARK.TEXT_SECONDARY,
    marginTop: 2,
    fontStyle: 'italic',
  },
  
  cosmicOrb: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    zIndex: 2,
    borderWidth: 1,
    borderColor: THEME.DARK.STELLAR_GLOW + '60',
  },
  orbGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
  },
  
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  
  section: {
    marginTop: 30,
  },
  
  cosmicSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionIconBg: {
    padding: 12,
    borderRadius: 15,
    marginRight: 15,
    borderWidth: 1,
    borderColor: THEME.DARK.COSMIC_ACCENT + '30',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  cosmicSectionTitle: {
    color: THEME.DARK.STARFIELD,
    textShadowColor: THEME.DARK.COSMIC_ACCENT,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: THEME.DARK.TEXT_SECONDARY,
    fontStyle: 'italic',
    marginTop: 2,
  },
  
  settingRow: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  cosmicPanel: {
    borderRadius: 15,
    borderWidth: 1,
    borderColor: THEME.DARK.COSMIC_ACCENT + '30',
    shadowColor: THEME.DARK.COSMIC_PURPLE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    overflow: 'hidden',
    position: 'relative',
  },
  
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  cosmicIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 1,
    borderColor: THEME.DARK.COSMIC_ACCENT + '40',
  },
  
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  cosmicText: {
    color: THEME.DARK.STARFIELD,
  },
  
  sliderContainer: {
    marginVertical: 16,
    paddingHorizontal: 20,
    paddingVertical: 25,
  },
  
  sliderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  
  sliderTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 15,
  },
  
  sliderTrack: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  
  sliderStep: {
    width: 50,
    height: 10,
    borderRadius: 5,
    backgroundColor: THEME.DARK.BACKGROUND_PRIMARY,
  },
  cosmicSliderStep: {
    borderWidth: 1,
    borderColor: THEME.DARK.COSMIC_ACCENT + '40',
  },
  
  sliderStepActive: {
    backgroundColor: THEME.DARK.COSMIC_ACCENT,
    shadowColor: THEME.DARK.COSMIC_ACCENT,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
  
  volumeText: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
  },
  
  statRow: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  
  statLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  statLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cosmicHighlight: {
    color: THEME.DARK.STELLAR_GLOW,
    textShadowColor: THEME.DARK.STELLAR_GLOW,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  
  resetButton: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    marginTop: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  cosmicResetButton: {
    borderWidth: 1,
    borderColor: THEME.DARK.ERROR_COLOR + '40',
  },
  
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 15,
  },
  resetSubtext: {
    fontSize: 12,
    color: THEME.DARK.TEXT_SECONDARY,
    fontStyle: 'italic',
    marginLeft: 15,
    marginTop: 2,
  },
  
  cosmicFooter: {
    alignItems: 'center',
    paddingVertical: 30,
    marginTop: 20,
  },
  footerText: {
    fontSize: 16,
    color: THEME.DARK.COSMIC_ACCENT,
    fontWeight: '600',
    textAlign: 'center',
    textShadowColor: THEME.DARK.COSMIC_ACCENT,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  footerSubtext: {
    fontSize: 12,
    color: THEME.DARK.TEXT_SECONDARY,
    fontStyle: 'italic',
    marginTop: 5,
  },
});

export default SettingsScreen; 