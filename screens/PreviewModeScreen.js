import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import PlanetTile from '../components/PlanetTile';
import { ROWS, COLS, CELL_SIZE, CELL_MARGIN } from '../components/constants';

const { width, height } = Dimensions.get('window');

// Create a matrix with blocks above 64
const createPreviewMatrix = () => {
  const matrix = [];
  const values = [128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536, 131072, 262144, 524288, 1048576, 2097152, 4194304, 8388608];
  
  let valueIndex = 0;
  for (let row = 0; row < ROWS; row++) {
    const rowData = [];
    for (let col = 0; col < COLS; col++) {
      if (valueIndex < values.length) {
        rowData.push(values[valueIndex]);
        valueIndex++;
      } else {
        rowData.push(0); // Empty space
      }
    }
    matrix.push(rowData);
  }
  
  return matrix;
};

const PreviewModeScreen = ({ navigation }) => {
  const [previewMatrix, setPreviewMatrix] = useState([]);
  const [selectedTile, setSelectedTile] = useState(null);

  useEffect(() => {
    setPreviewMatrix(createPreviewMatrix());
  }, []);

  const handleTilePress = (value, row, col) => {
    if (value > 0) {
      setSelectedTile({ value, row, col });
    }
  };

  const renderTile = (value, row, col) => {
    if (value === 0) {
      return (
        <View 
          key={`${row}-${col}`}
          style={[
            styles.emptyTile,
            {
              width: CELL_SIZE,
              height: CELL_SIZE,
              margin: CELL_MARGIN / 2,
            }
          ]}
        />
      );
    }

    return (
      <TouchableOpacity
        key={`${row}-${col}`}
        style={[
          styles.tileContainer,
          {
            width: CELL_SIZE,
            height: CELL_SIZE,
            margin: CELL_MARGIN / 2,
          }
        ]}
        onPress={() => handleTilePress(value, row, col)}
        activeOpacity={0.8}
      >
        <PlanetTile 
          value={value}
          size={CELL_SIZE}
          isOrbiting={false}
        />
      </TouchableOpacity>
    );
  };

  const renderRow = (rowData, rowIndex) => (
    <View key={rowIndex} style={styles.row}>
      {rowData.map((value, colIndex) => renderTile(value, rowIndex, colIndex))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <LinearGradient
        colors={['#000428', '#004e92', '#000428']}
        style={styles.background}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← BACK</Text>
          </TouchableOpacity>
          
          <Text style={styles.title}>PREVIEW MODE</Text>
          
          <View style={styles.placeholder} />
        </View>

        {/* Game Board Preview */}
        <View style={styles.boardContainer}>
          <Text style={styles.boardTitle}>Game Board with Blocks Above 64</Text>
          
          <View style={styles.board}>
            {previewMatrix.map((rowData, rowIndex) => renderRow(rowData, rowIndex))}
          </View>
        </View>

        {/* Selected Tile Info */}
        {selectedTile && (
          <View style={styles.infoPanel}>
            <Text style={styles.infoTitle}>Selected Tile</Text>
            <Text style={styles.infoValue}>Value: {selectedTile.value}</Text>
            <Text style={styles.infoPosition}>Position: Row {selectedTile.row + 1}, Col {selectedTile.col + 1}</Text>
            
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={() => setSelectedTile(null)}
            >
              <Text style={styles.clearButtonText}>Clear Selection</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>Instructions</Text>
          <Text style={styles.instructionsText}>
            • This preview shows how blocks above 64 look on the game board{'\n'}
            • Tap any tile to see its details{'\n'}
            • Use this to understand the visual progression of the game{'\n'}
            • Only available in development mode
          </Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000428',
  },
  
  background: {
    flex: 1,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
  placeholder: {
    width: 60, // Same width as back button for centering
  },
  
  boardContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  
  boardTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  
  board: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  
  tileContainer: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  
  emptyTile: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  
  infoPanel: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  
  infoTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  
  infoValue: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  
  infoPosition: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 15,
  },
  
  clearButton: {
    backgroundColor: 'rgba(255, 107, 53, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  
  instructions: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  
  instructionsTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  
  instructionsText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});

export default PreviewModeScreen;
