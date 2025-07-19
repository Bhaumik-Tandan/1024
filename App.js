import Constants from 'expo-constants';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import RootNavigator from './navigator';

export default function App() {
  return (
    <SafeAreaProvider
    style={{
        paddingTop: Constants.statusBarHeight,
    }}>
      <StatusBar style="auto" />
      
        {RootNavigator}
    </SafeAreaProvider>
  );
}
