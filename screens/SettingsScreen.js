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

  // Simplified cosmic panel
  const CosmicPanel = ({ children, style = {} }) => (
    <View style={[styles.cosmicPanel, style]}>
      {children}
    </View>
  );

  const SettingRow = ({ icon, label, value, onToggle, showDivider = true }) => (
    <View style={styles.settingRow}>
      <View style={styles.settingContent}>
        <View style={styles.settingLeft}>
          <View style={styles.iconContainer}>
            <Ionicons name={icon} size={22} color={THEME.DARK.COSMIC_ACCENT} />
          </View>
          <Text style={styles.settingLabel}>{label}</Text>
        </View>
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: THEME.DARK.BACKGROUND_PRIMARY, true: THEME.DARK.COSMIC_ACCENT }}
          thumbColor={value ? THEME.DARK.STARFIELD : THEME.DARK.TEXT_SECONDARY}
          ios_backgroundColor={THEME.DARK.BACKGROUND_PRIMARY}
        />
      </View>
      {showDivider && <View style={styles.divider} />}
    </View>
  );

  const StatRow = ({ icon, label, value, showDivider = true }) => (
    <View style={styles.statRow}>
      <View style={styles.statContent}>
        <View style={styles.statLeft}>
          <View style={styles.iconContainer}>
            <Ionicons name={icon} size={22} color={THEME.DARK.STELLAR_GLOW} />
          </View>
          <Text style={styles.statLabel}>{label}</Text>
        </View>
        <Text style={styles.statValue}>{value}</Text>
      </View>
      {showDivider && <View style={styles.divider} />}
    </View>
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
    <View style={styles.container}>
      <SpaceBackground />
      
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light-content" backgroundColor="transparent" translucent />
        
        {/* Clean header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={THEME.DARK.STARFIELD} />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Settings</Text>
            <Text style={styles.headerSubtitle}>Cosmic Configuration</Text>
          </View>
          
          <View style={styles.headerRight} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Audio & Controls Section */}
          <CosmicPanel style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="settings" size={20} color={THEME.DARK.COSMIC_ACCENT} />
              <Text style={styles.sectionTitle}>Controls</Text>
            </View>
            
            <SettingRow
              icon="musical-notes"
              label="Sound Effects"
              value={soundEnabled}
              onToggle={toggleSound}
            />
            
            <SettingRow
              icon="phone-portrait"
              label="Haptic Feedback"
              value={vibrationEnabled}
              onToggle={toggleVibration}
              showDivider={false}
            />
          </CosmicPanel>

          {/* Statistics Section */}
          <CosmicPanel style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="stats-chart" size={20} color={THEME.DARK.STELLAR_GLOW} />
              <Text style={styles.sectionTitle}>Mission Records</Text>
            </View>
            
            <StatRow
              icon="trophy"
              label="Highest Score"
              value={formatScore(highScore)}
            />

            <StatRow
              icon="planet"
              label="Largest Celestial Body"
              value={formatBlock(highestBlock)}
              showDivider={false}
            />
          </CosmicPanel>

          {/* Reset Section */}
          <TouchableOpacity onPress={handleResetSettings} style={styles.resetSection}>
            <CosmicPanel style={styles.resetButton}>
              <View style={styles.resetContent}>
                <View style={styles.resetLeft}>
                  <View style={[styles.iconContainer, styles.resetIconContainer]}>
                    <Ionicons name="refresh" size={22} color={THEME.DARK.ERROR_COLOR} />
                  </View>
                  <View>
                    <Text style={styles.resetText}>Reset Settings</Text>
                    <Text style={styles.resetSubtext}>Restore to defaults</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={THEME.DARK.TEXT_SECONDARY} />
              </View>
            </CosmicPanel>
          </TouchableOpacity>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>🌌 Exploring the Infinite Universe</Text>
            <Text style={styles.footerVersion}>Version 2.0 - Deep Space Edition</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.DARK.BACKGROUND_PRIMARY,
  },
  safeArea: {
    flex: 1,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: THEME.DARK.COSMIC_ACCENT + '20',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: THEME.DARK.BACKGROUND_SECONDARY + '80',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.DARK.STARFIELD,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: THEME.DARK.TEXT_SECONDARY,
    marginTop: 2,
  },
  headerRight: {
    width: 40, // Balance the back button
  },
  
  // Content
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  
  // Sections
  section: {
    marginBottom: 20,
  },
  cosmicPanel: {
    backgroundColor: THEME.DARK.BACKGROUND_SECONDARY + '60',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.DARK.COSMIC_ACCENT + '30',
    padding: 20,
    shadowColor: THEME.DARK.COSMIC_PURPLE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.DARK.COSMIC_ACCENT + '20',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.DARK.STARFIELD,
    marginLeft: 10,
    letterSpacing: 0.3,
  },
  
  // Settings
  settingRow: {
    marginBottom: 0,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.DARK.BACKGROUND_PRIMARY + '80',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: THEME.DARK.STARFIELD,
    fontWeight: '500',
  },
  
  // Stats
  statRow: {
    marginBottom: 0,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  statLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 16,
    color: THEME.DARK.STARFIELD,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.DARK.STELLAR_GLOW,
  },
  
  // Divider
  divider: {
    height: 1,
    backgroundColor: THEME.DARK.COSMIC_ACCENT + '15',
    marginVertical: 4,
  },
  
  // Reset
  resetSection: {
    marginBottom: 20,
  },
  resetButton: {
    padding: 16,
  },
  resetContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resetLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  resetIconContainer: {
    backgroundColor: THEME.DARK.ERROR_COLOR + '20',
  },
  resetText: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.DARK.STARFIELD,
  },
  resetSubtext: {
    fontSize: 12,
    color: THEME.DARK.TEXT_SECONDARY,
    marginTop: 2,
  },
  
  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 14,
    color: THEME.DARK.COSMIC_ACCENT,
    fontWeight: '500',
    textAlign: 'center',
  },
  footerVersion: {
    fontSize: 11,
    color: THEME.DARK.TEXT_SECONDARY,
    marginTop: 4,
    textAlign: 'center',
  },
});

export default SettingsScreen; 