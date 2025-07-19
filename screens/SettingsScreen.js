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

const SettingsScreen = ({ navigation }) => {
  const {
    darkMode,
    vibrationEnabled,
    soundEnabled,
    soundVolume,
    highScore,
    highestBlock,
    toggleDarkMode,
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

  const VolumeSlider = ({ value, onValueChange, title, enabled, icon }) => (
    <View style={[styles.sliderContainer, darkMode ? styles.sliderContainerDark : styles.sliderContainerLight]}>
      <View style={styles.sliderHeader}>
        <Ionicons name={icon} size={20} color="#ffffff" />
        <Text style={[styles.sliderTitle, darkMode ? styles.textLight : styles.textDark]}>{title}</Text>
      </View>
      <View style={styles.sliderTrack}>
        {[0, 0.25, 0.5, 0.75, 1].map((step) => (
          <TouchableOpacity
            key={step}
            style={[
              styles.sliderStep,
              value >= step && enabled && styles.sliderStepActive,
            ]}
            onPress={() => enabled && onValueChange(step)}
            activeOpacity={0.7}
          />
        ))}
      </View>
      <Text style={[styles.volumeText, darkMode ? styles.textLight : styles.textDark]}>{Math.round(value * 100)}%</Text>
    </View>
  );

  const SettingRow = ({ icon, label, value, onToggle, color = "#4caf50" }) => (
    <View style={[styles.settingRow, darkMode ? styles.settingRowDark : styles.settingRowLight]}>
      <View style={styles.settingLeft}>
        <View style={[styles.iconContainer, { backgroundColor: color }]}>
          <Ionicons name={icon} size={20} color="#ffffff" />
        </View>
        <Text style={[styles.settingLabel, darkMode ? styles.textLight : styles.textDark]}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#444', true: color }}
        thumbColor={value ? '#ffffff' : '#f4f3f4'}
        ios_backgroundColor="#444"
      />
    </View>
  );

  const StatRow = ({ icon, label, value, color = "#4caf50" }) => (
    <View style={[styles.statRow, darkMode ? styles.statRowDark : styles.statRowLight]}>
      <View style={styles.statLeft}>
        <View style={[styles.iconContainer, { backgroundColor: color }]}>
          <Ionicons name={icon} size={20} color="#ffffff" />
        </View>
        <Text style={[styles.statLabel, darkMode ? styles.textLight : styles.textDark]}>{label}</Text>
      </View>
      <Text style={[styles.statValue, darkMode ? styles.textLight : styles.textDark]}>{value}</Text>
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
    <SafeAreaView style={[styles.container, darkMode ? styles.containerDark : styles.containerLight]}>
      <StatusBar style={darkMode ? "light-content" : "dark-content"} backgroundColor={darkMode ? "#2c2c2c" : "#ffffff"} />
      
      {/* Header */}
      <View style={[styles.header, darkMode ? styles.headerDark : styles.headerLight]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, darkMode ? styles.backButtonDark : styles.backButtonLight]}>
          <Ionicons name="arrow-back" size={24} color={darkMode ? "#ffffff" : "#000000"} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, darkMode ? styles.textLight : styles.textDark]}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Sound Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="volume-high" size={24} color="#4caf50" />
            <Text style={[styles.sectionTitle, darkMode ? styles.textLight : styles.textDark]}>Sound</Text>
          </View>
          
          <SettingRow
            icon="musical-notes"
            label="Sound Effects"
            value={soundEnabled}
            onToggle={toggleSound}
            color="#4caf50"
          />

          <VolumeSlider
            title="Sound Volume"
            value={soundVolume}
            onValueChange={setSoundVolume}
            enabled={soundEnabled}
            icon="volume-high"
          />
        </View>

        {/* Game Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="game-controller" size={24} color="#ff9800" />
            <Text style={[styles.sectionTitle, darkMode ? styles.textLight : styles.textDark]}>Game</Text>
          </View>
          
          <SettingRow
            icon="phone-portrait"
            label="Vibration"
            value={vibrationEnabled}
            onToggle={toggleVibration}
            color="#ff9800"
          />

          <SettingRow
            icon="moon"
            label="Dark Mode"
            value={darkMode}
            onToggle={toggleDarkMode}
            color="#9c27b0"
          />
        </View>

        {/* Statistics */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="stats-chart" size={24} color="#ffd700" />
            <Text style={[styles.sectionTitle, darkMode ? styles.textLight : styles.textDark]}>Statistics</Text>
          </View>
          
          <StatRow
            icon="trophy"
            label="High Score"
            value={formatScore(highScore)}
            color="#ffd700"
          />

          <StatRow
            icon="cube"
            label="Highest Block"
            value={formatBlock(highestBlock)}
            color="#ff5722"
          />
        </View>

        {/* Reset Button */}
        <View style={styles.section}>
          <TouchableOpacity style={[styles.resetButton, darkMode ? styles.resetButtonDark : styles.resetButtonLight]} onPress={handleResetSettings}>
            <Ionicons name="refresh" size={20} color={darkMode ? "#ffffff" : "#000000"} />
            <Text style={[styles.resetButtonText, darkMode ? styles.textLight : styles.textDark]}>Reset All Settings</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerDark: {
    backgroundColor: '#2c2c2c',
  },
  containerLight: {
    backgroundColor: '#ffffff',
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  headerDark: {
    borderBottomColor: '#444',
  },
  headerLight: {
    borderBottomColor: '#e0e0e0',
  },
  
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  backButtonDark: {
    backgroundColor: '#444',
  },
  backButtonLight: {
    backgroundColor: '#f0f0f0',
  },
  
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  textLight: {
    color: '#ffffff',
  },
  textDark: {
    color: '#000000',
  },
  
  placeholder: {
    width: 40,
  },
  
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  
  section: {
    marginTop: 32,
  },
  
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
    letterSpacing: 0.5,
  },
  
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  settingRowDark: {
    backgroundColor: '#333',
  },
  settingRowLight: {
    backgroundColor: '#f8f8f8',
  },
  
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  
  sliderContainer: {
    marginVertical: 16,
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderRadius: 12,
  },
  sliderContainerDark: {
    backgroundColor: '#333',
  },
  sliderContainerLight: {
    backgroundColor: '#f8f8f8',
  },
  
  sliderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  sliderTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  
  sliderTrack: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  sliderStep: {
    width: 44,
    height: 8,
    backgroundColor: '#555',
    borderRadius: 4,
  },
  
  sliderStepActive: {
    backgroundColor: '#4caf50',
  },
  
  volumeText: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  statRowDark: {
    backgroundColor: '#333',
  },
  statRowLight: {
    backgroundColor: '#f8f8f8',
  },
  
  statLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  statLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 16,
  },
  resetButtonDark: {
    backgroundColor: '#444',
  },
  resetButtonLight: {
    backgroundColor: '#f0f0f0',
  },
  
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default SettingsScreen; 