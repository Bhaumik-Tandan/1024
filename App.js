import React from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Navigator from './navigator';

export default function App() {
  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="light" backgroundColor="#0a0a1a" />
      <Navigator />
    </View>
  );
}
