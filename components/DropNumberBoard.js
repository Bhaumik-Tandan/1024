import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
} from 'react-native';

const COLS = 5;
const ROWS = 7;
const { width } = Dimensions.get('window');
const CELL_SIZE = (width - 40) / COLS;

const COLORS = {
  0: '#3a3a3a',
  2: '#eee4da',
  4: '#ede0c8',
  8: '#8dd3f4',
  16: '#6ec6ff',
  32: '#ff8a65',
  64: '#fbc02d',
  128: '#ffd54f',
  256: '#ffb300',
  512: '#ff7043',
  1024: '#d84315',
  2048: '#ad1457',
  4096: '#6a1b9a',
};

function getRandomBlockValue() {
  // 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024
  const values = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024];
  return values[Math.floor(Math.random() * Math.min(5, values.length))]; // More likely to get small numbers
}

const DropNumberBoard = () => {
  const [board, setBoard] = useState(
    Array.from({ length: ROWS }, () => Array(COLS).fill(0))
  );
  const [score, setScore] = useState(0);
  const [record, setRecord] = useState(0);
  const [coins, setCoins] = useState(0);
  const [nextBlock, setNextBlock] = useState(getRandomBlockValue());
  const [gameOver, setGameOver] = useState(false);
  const [falling, setFalling] = useState(null); // {col, value, anim}

  // Drop a block in a column
  const dropBlock = (col) => {
    if (falling || gameOver) return;
    // Find the lowest empty row
    let row = ROWS - 1;
    while (row >= 0 && board[row][col] !== 0) row--;
    if (row < 0) return; // Column full

    // Animate falling
    const anim = new Animated.Value(-CELL_SIZE);
    setFalling({ col, value: nextBlock, anim, toRow: row });
    Animated.timing(anim, {
      toValue: row * (CELL_SIZE + 8),
      duration: 200 + row * 60,
      useNativeDriver: false,
    }).start(() => {
      handleBlockLanded(row, col, nextBlock);
      setFalling(null);
    });
  };

  // Handle block landing and merging
  const handleBlockLanded = (row, col, value) => {
    let newBoard = board.map(r => [...r]);
    let addScore = 0;
    
    // Place the initial block
    newBoard[row][col] = value;
    
    // Keep merging until no more merges are possible
    let merged = true;
    while (merged) {
      merged = false;
      
      // Check for vertical merges (upwards)
      for (let r = 0; r < ROWS - 1; r++) {
        for (let c = 0; c < COLS; c++) {
          if (newBoard[r][c] !== 0 && newBoard[r][c] === newBoard[r + 1][c]) {
            // Check if there's a third block below
            if (r + 2 < ROWS && newBoard[r + 2][c] === newBoard[r][c]) {
              // Three blocks merge - multiply by 4
              newBoard[r][c] *= 4;
              addScore += newBoard[r][c];
              newBoard[r + 1][c] = 0;
              newBoard[r + 2][c] = 0;
              merged = true;
            } else {
              // Two blocks merge - multiply by 2
              newBoard[r][c] *= 2;
              addScore += newBoard[r][c];
              newBoard[r + 1][c] = 0;
              merged = true;
            }
          }
        }
      }
      
      // Check for horizontal merges (left to right)
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS - 1; c++) {
          if (newBoard[r][c] !== 0 && newBoard[r][c] === newBoard[r][c + 1]) {
            // Check if there's a third block to the right
            if (c + 2 < COLS && newBoard[r][c + 2] === newBoard[r][c]) {
              // Three blocks merge - multiply by 4
              newBoard[r][c] *= 4;
              addScore += newBoard[r][c];
              newBoard[r][c + 1] = 0;
              newBoard[r][c + 2] = 0;
              merged = true;
            } else {
              // Two blocks merge - multiply by 2
              newBoard[r][c] *= 2;
              addScore += newBoard[r][c];
              newBoard[r][c + 1] = 0;
              merged = true;
            }
          }
        }
      }
      
      // Apply gravity after each merge round
      if (merged) {
        for (let c = 0; c < COLS; c++) {
          let writeRow = ROWS - 1;
          for (let r = ROWS - 1; r >= 0; r--) {
            if (newBoard[r][c] !== 0) {
              if (writeRow !== r) {
                newBoard[writeRow][c] = newBoard[r][c];
                newBoard[r][c] = 0;
              }
              writeRow--;
            }
          }
        }
      }
    }
    
    setScore(s => {
      const newScore = s + addScore;
      if (newScore > record) setRecord(newScore);
      return newScore;
    });
    setBoard(newBoard);
    setNextBlock(getRandomBlockValue());
    // Check for game over
    if (newBoard[0].every(cell => cell !== 0)) setGameOver(true);
  };

  // UI rendering
  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.rankBox}>
          <Text style={styles.rankLabel}>Rank</Text>
          <Text style={styles.rankValue}>#234864th</Text>
        </View>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreValue}>{score}</Text>
          <Text style={styles.scoreLabel}>Score</Text>
        </View>
        <View style={styles.recordBox}>
          <Text style={styles.recordLabel}>Record</Text>
          <Text style={styles.recordValue}>{record}</Text>
        </View>
        <View style={styles.coinsBox}>
          <Text style={styles.coinsValue}>{coins}</Text>
          <Text style={styles.coinsLabel}>Coins</Text>
        </View>
      </View>
      {/* Next Block Preview */}
      <View style={styles.nextBlockBar}>
        <Text style={styles.nextBlockLabel}>Next Block</Text>
        <View style={[styles.nextBlockPreview, { backgroundColor: COLORS[nextBlock] || '#fff' }]}> 
          <Text style={styles.nextBlockText}>{nextBlock}</Text>
        </View>
      </View>
      {/* Column Drop Arrows */}
      <View style={styles.arrowRow}>
        {Array(COLS).fill(0).map((_, col) => (
          <TouchableOpacity
            key={col}
            style={styles.arrowButton}
            onPress={() => dropBlock(col)}
            disabled={gameOver || (falling && falling.col !== col)}
          >
            <Text style={styles.arrowText}>▼</Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* Board */}
      <View style={styles.board}>
        {board.map((row, rowIdx) => (
          <View key={rowIdx} style={styles.row}>
            {row.map((cell, colIdx) => (
              <View
                key={colIdx}
                style={[
                  styles.cell,
                  { backgroundColor: COLORS[cell] || COLORS[0] },
                  cell !== 0 && styles.cellFilled,
                ]}
              >
                {cell !== 0 && (
                  <Text style={styles.cellText}>{cell}</Text>
                )}
              </View>
            ))}
          </View>
        ))}
        {/* Falling block animation */}
        {falling && (
          <Animated.View
            style={[
              styles.fallingBlock,
              {
                left: falling.col * (CELL_SIZE + 8) + 8,
                top: 0,
                backgroundColor: COLORS[falling.value] || COLORS[0],
                transform: [{ translateY: falling.anim }],
              },
            ]}
          >
            <Text style={styles.cellText}>{falling.value}</Text>
          </Animated.View>
        )}
      </View>
      {/* Game Over Overlay */}
      {gameOver && (
        <View style={styles.overlay}>
          <Text style={styles.gameOverText}>Game Over!</Text>
          <TouchableOpacity style={styles.restartBtn} onPress={() => {
            setBoard(Array.from({ length: ROWS }, () => Array(COLS).fill(0)));
            setScore(0);
            setGameOver(false);
            setNextBlock(getRandomBlockValue());
          }}>
            <Text style={styles.restartText}>Restart</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2d2d2d',
    paddingTop: 30,
    alignItems: 'center',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '95%',
    marginBottom: 8,
  },
  rankBox: {
    backgroundColor: '#444',
    borderRadius: 8,
    padding: 6,
    alignItems: 'center',
    minWidth: 60,
  },
  rankLabel: { color: '#bbb', fontSize: 12 },
  rankValue: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  scoreBox: {
    backgroundColor: '#222',
    borderRadius: 8,
    padding: 6,
    alignItems: 'center',
    minWidth: 70,
  },
  scoreValue: { color: '#ffd700', fontWeight: 'bold', fontSize: 22 },
  scoreLabel: { color: '#bbb', fontSize: 12 },
  recordBox: {
    backgroundColor: '#1976d2',
    borderRadius: 8,
    padding: 6,
    alignItems: 'center',
    minWidth: 70,
  },
  recordLabel: { color: '#fff', fontSize: 12 },
  recordValue: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  coinsBox: {
    backgroundColor: '#444',
    borderRadius: 8,
    padding: 6,
    alignItems: 'center',
    minWidth: 60,
  },
  coinsValue: { color: '#ffd700', fontWeight: 'bold', fontSize: 16 },
  coinsLabel: { color: '#bbb', fontSize: 12 },
  nextBlockBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    width: '95%',
    justifyContent: 'center',
  },
  nextBlockLabel: { color: '#fff', fontSize: 16, marginRight: 10 },
  nextBlockPreview: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  nextBlockText: { color: '#222', fontWeight: 'bold', fontSize: 22 },
  arrowRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '95%',
    marginBottom: 4,
  },
  arrowButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 2,
  },
  arrowText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    opacity: 0.7,
  },
  board: {
    backgroundColor: '#222',
    borderRadius: 12,
    padding: 8,
    marginTop: 2,
    marginBottom: 10,
    width: width - 20,
    height: ROWS * (CELL_SIZE + 8),
    position: 'relative',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    margin: 4,
    borderRadius: 8,
    backgroundColor: '#3a3a3a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellFilled: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  cellText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  fallingBlock: {
    position: 'absolute',
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  gameOverText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  restartBtn: {
    backgroundColor: '#ffd700',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  restartText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default DropNumberBoard; 