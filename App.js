import React from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Navigator from './navigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a1a' }}>
        <StatusBar style="light" backgroundColor="#0a0a1a" />
        <Navigator />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
