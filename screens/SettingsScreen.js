import React, { useEffect } from 'react';
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
    animationsEnabled,
    darkMode,
    highScore,
    highestBlock,
    toggleAnimations,
    toggleDarkMode,
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

  const SettingRow = ({ icon, label, value, onToggle, color = "#4caf50" }) => (
    <View style={styles.settingRow}>
      <View style={styles.settingLeft}>
        <View style={[styles.iconContainer, { backgroundColor: color }]}>
          <Ionicons name={icon} size={20} color="#ffffff" />
        </View>
        <Text style={styles.settingLabel}>{label}</Text>
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
    <View style={styles.statRow}>
      <View style={styles.statLeft}>
        <View style={[styles.iconContainer, { backgroundColor: color }]}>
          <Ionicons name={icon} size={20} color="#ffffff" />
        </View>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
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
    <SafeAreaView style={styles.container}>
      <StatusBar style="light-content" backgroundColor="#2c2c2c" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Game Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="game-controller" size={24} color="#ff9800" />
            <Text style={styles.sectionTitle}>Game</Text>
          </View>
          
          <SettingRow
            icon="flash"
            label="Animations"
            value={animationsEnabled}
            onToggle={toggleAnimations}
            color="#e91e63"
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
            <Text style={styles.sectionTitle}>Statistics</Text>
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
          <TouchableOpacity style={styles.resetButton} onPress={handleResetSettings}>
            <Ionicons name="refresh" size={20} color="#ffffff" />
            <Text style={styles.resetButtonText}>Reset All Settings</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2c2c2c',
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#444',
  },
  
  headerTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 0.5,
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
    color: '#ffffff',
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
    backgroundColor: '#333',
    borderRadius: 12,
    marginBottom: 12,
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
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  
  sliderContainer: {
    marginVertical: 16,
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#333',
    borderRadius: 12,
  },
  
  sliderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  sliderTitle: {
    color: '#ffffff',
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
    color: '#ffffff',
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
    backgroundColor: '#333',
    borderRadius: 12,
    marginBottom: 12,
  },
  
  statLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  statLabel: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  
  statValue: {
    color: '#4caf50',
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  resetButton: {
    backgroundColor: '#ff4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 20,
    shadowColor: '#ff4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  
  resetButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default SettingsScreen; 