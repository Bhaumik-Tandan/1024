import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import DropNumberBoard from './components/DropNumberBoard';

export default function App() {
  return (
    <View style={styles.container}>
      <DropNumberBoard />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2d2d2d',
  },
});
