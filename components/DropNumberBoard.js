import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  PanResponder,
} from 'react-native';

const COLS = 5;
const ROWS = 7;
const CELL_MARGIN = 4;
const { width } = Dimensions.get('window');
const CELL_SIZE = Math.floor((width - 40 - (COLS - 1) * CELL_MARGIN) / COLS);

const getCellLeft = (col) => col * (CELL_SIZE + CELL_MARGIN);
const getCellTop = (row) => row * (CELL_SIZE + CELL_MARGIN);

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
  const [falling, setFalling] = useState(null); // {col, value, anim, toRow, fastDrop}
  const [mergingTiles, setMergingTiles] = useState([]); // Array of merging tile animations
  const [mergeResult, setMergeResult] = useState(null); // {row, col, value, anim}
  const [showGuide, setShowGuide] = useState(true); // Show gesture guide for first tile only

  const boardRef = useRef(null);
  const [boardLeft, setBoardLeft] = useState(0);
  const panStartCol = useRef(null);

  // PanResponder for drag-to-move
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !!falling,
      onMoveShouldSetPanResponder: () => !!falling,
      onPanResponderGrant: (evt) => {
        if (!falling) return;
        const x = evt.nativeEvent.pageX - boardLeft;
        const col = Math.max(0, Math.min(COLS - 1, Math.floor(x / (CELL_SIZE + CELL_MARGIN))));
        if (col !== falling.col) updateFallingCol(col);
      },
      onPanResponderMove: (evt) => {
        if (!falling) return;
        const x = evt.nativeEvent.pageX - boardLeft;
        const col = Math.max(0, Math.min(COLS - 1, Math.floor(x / (CELL_SIZE + CELL_MARGIN))));
        console.log('Dragging, col:', col);
        if (col !== falling.col) updateFallingCol(col);
      },
      onPanResponderRelease: () => {},
      onPanResponderTerminate: () => {},
    })
  ).current;

  // Helper to update falling tile's column and animate to new row if needed
  const updateFallingCol = (col) => {
    if (!falling) return;
    let row = ROWS - 1;
    while (row >= 0 && board[row][col] !== 0) row--;
    if (row < 0) return; // Column full
    falling.col = col;
    falling.toRow = row;
    Animated.timing(falling.anim, {
      toValue: row * (CELL_SIZE + CELL_MARGIN),
      duration: 200,
      useNativeDriver: false,
    }).start();
    setFalling({ ...falling, col, toRow: row });
  };

  const BOARD_PADDING = 8;
  const BOARD_WIDTH = width - 20;
  const GRID_WIDTH = COLS * CELL_SIZE + COLS * 2 * CELL_MARGIN;
  // Start a new slow-falling tile in the middle column
  useEffect(() => {
    if (!falling && !gameOver) {
      const col = Math.floor(COLS / 2);
      let row = ROWS - 1;
      while (row >= 0 && board[row][col] !== 0) row--;
      if (row < 0) {
        setGameOver(true);
        return;
      }
      const anim = new Animated.Value(0);
      setFalling({ col, value: nextBlock, anim, toRow: row, fastDrop: false });
      Animated.timing(anim, {
        toValue: row * (CELL_SIZE + 8),
        duration: 7000, // slow fall
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished) {
          handleBlockLanded(row, col, nextBlock);
          setFalling(null);
          setShowGuide(false); // Hide guide after first drop
        }
      });
    }
    // eslint-disable-next-line
  }, [falling, gameOver]);

  // User taps a column to fast-drop the tile
  const handleColumnTap = (col) => {
    if (!falling || falling.fastDrop || gameOver) return;
    let row = ROWS - 1;
    while (row >= 0 && board[row][col] !== 0) row--;
    if (row < 0) return; // Column full
    falling.fastDrop = true;
    Animated.timing(falling.anim, {
      toValue: row * (CELL_SIZE + 8),
      duration: 250,
      useNativeDriver: false,
    }).start(() => {
      handleBlockLanded(row, col, falling.value);
      setFalling(null);
      setShowGuide(false); // Hide guide after first drop
    });
    setFalling({ ...falling, col, toRow: row, fastDrop: true });
  };

  // Handle block landing and merging
  const handleBlockLanded = (row, col, value) => {
    let newBoard = board.map(r => [...r]);
    let addScore = 0;
    let lastMergePosition = { row, col }; // Track where the last merge happened
    let hasAnimations = false;
    
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
              const originalValue = newBoard[r][c];
              newBoard[r][c] *= 4;
              addScore += newBoard[r][c];
              newBoard[r + 1][c] = 0;
              newBoard[r + 2][c] = 0;
              lastMergePosition = { row: r, col: c };
              merged = true;
              hasAnimations = true;
              
              // Create merge animation
              createMergeAnimation(r, c, originalValue, 3, 'vertical');
            } else {
              // Two blocks merge - multiply by 2
              const originalValue = newBoard[r][c];
              newBoard[r][c] *= 2;
              addScore += newBoard[r][c];
              newBoard[r + 1][c] = 0;
              lastMergePosition = { row: r, col: c };
              merged = true;
              hasAnimations = true;
              
              // Create merge animation
              createMergeAnimation(r, c, originalValue, 2, 'vertical');
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
              const originalValue = newBoard[r][c];
              newBoard[r][c] *= 4;
              addScore += newBoard[r][c];
              newBoard[r][c + 1] = 0;
              newBoard[r][c + 2] = 0;
              lastMergePosition = { row: r, col: c };
              merged = true;
              hasAnimations = true;
              
              // Create merge animation
              createMergeAnimation(r, c, originalValue, 3, 'horizontal');
            } else {
              // Two blocks merge - multiply by 2
              const originalValue = newBoard[r][c];
              newBoard[r][c] *= 2;
              addScore += newBoard[r][c];
              newBoard[r][c + 1] = 0;
              lastMergePosition = { row: r, col: c };
              merged = true;
              hasAnimations = true;
              
              // Create merge animation
              createMergeAnimation(r, c, originalValue, 2, 'horizontal');
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
    
    // Show merge result animation at the last merge position
    if (addScore > 0) {
      showMergeResultAnimation(lastMergePosition.row, lastMergePosition.col, newBoard[lastMergePosition.row][lastMergePosition.col]);
    }
    
    setScore(s => {
      const newScore = s + addScore;
      if (newScore > record) setRecord(newScore);
      return newScore;
    });
    
    // Update board immediately if no animations, otherwise delay
    if (!hasAnimations) {
      setBoard(newBoard);
    } else {
      // Delay board update to let animations complete
      setTimeout(() => {
        setBoard(newBoard);
      }, 350); // Slightly longer than animation duration
    }
    
    setNextBlock(getRandomBlockValue());
    // Check for game over
    if (newBoard[0].every(cell => cell !== 0)) setGameOver(true);
  };

  // Create merge animation for tiles
  const createMergeAnimation = (row, col, value, count, direction) => {
    const mergeAnim = new Animated.Value(1);
    const scaleAnim = new Animated.Value(1);
    
    const mergingTile = {
      row,
      col,
      value,
      count,
      direction,
      anim: mergeAnim,
      scale: scaleAnim,
      id: Date.now() + Math.random(),
    };
    
    setMergingTiles(prev => [...prev, mergingTile]);
    
    // Animate the merging tiles
    Animated.parallel([
      Animated.timing(mergeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.3,
          duration: 150,
          useNativeDriver: false,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: false,
        }),
      ]),
    ]).start(() => {
      setMergingTiles(prev => prev.filter(tile => tile.id !== mergingTile.id));
    });
  };

  // Show merge result animation
  const showMergeResultAnimation = (row, col, value) => {
    const resultAnim = new Animated.Value(0);
    const scaleAnim = new Animated.Value(0.5);
    
    setMergeResult({
      row,
      col,
      value,
      anim: resultAnim,
      scale: scaleAnim,
    });
    
    Animated.parallel([
      Animated.timing(resultAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 100,
          useNativeDriver: false,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: false,
        }),
      ]),
    ]).start(() => {
      setTimeout(() => {
        setMergeResult(null);
      }, 500);
    });
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

      {/* Gesture Guide Overlay (first tile only) */}
      {showGuide && (
        <View style={styles.guideOverlay} pointerEvents="none">
          <Text style={styles.guideText}>Tap a column to drop!</Text>
          {/* You can add an emoji or image for a hand here if you want */}
        </View>
      )}

      {/* Board */}
      <View
        style={styles.board}
        ref={boardRef}
        onLayout={e => setBoardLeft(e.nativeEvent.layout.x)}
        {...panResponder.panHandlers}
      >
        {/* Preview tile above the board, perfectly aligned */}
        {!falling && (
          <View
            style={[
              styles.nextBlockAbsolute,
              {
                left: getCellLeft(Math.floor(COLS / 2)),
                top: -CELL_SIZE - CELL_MARGIN,
                backgroundColor: COLORS[nextBlock] || '#fff',
                width: CELL_SIZE,
                height: CELL_SIZE,
              },
            ]}
          >
            <Text style={styles.nextBlockText}>{nextBlock}</Text>
          </View>
        )}
        {/* Render all cells absolutely */}
        {board.map((row, rowIdx) =>
          row.map((cell, colIdx) => (
            <TouchableOpacity
              key={`${rowIdx}-${colIdx}`}
              style={[
                styles.cell,
                {
                  position: 'absolute',
                  left: getCellLeft(colIdx),
                  top: getCellTop(rowIdx),
                  backgroundColor: COLORS[cell] || COLORS[0],
                },
                cell !== 0 && styles.cellFilled,
              ]}
              onPress={() => handleColumnTap(colIdx)}
              disabled={gameOver || !falling || falling.fastDrop}
            >
              {cell !== 0 && (
                <Text style={styles.cellText}>{cell}</Text>
              )}
            </TouchableOpacity>
          ))
        )}
        {/* Falling block animation */}
        {falling && (
          <Animated.View
            style={[
              styles.fallingBlock,
              {
                position: 'absolute',
                left: getCellLeft(falling.col),
                top: 0,
                backgroundColor: COLORS[falling.value] || COLORS[0],
                width: CELL_SIZE,
                height: CELL_SIZE,
                transform: [{ translateY: falling.anim }],
              },
            ]}
          >
            <Text style={styles.cellText}>{falling.value}</Text>
          </Animated.View>
        )}
        
        {/* Merging tiles animations */}
        {mergingTiles.map((tile) => (
          <Animated.View
            key={tile.id}
            style={[
              styles.mergingTile,
              {
                left: tile.col * (CELL_SIZE + 8) + 8,
                top: tile.row * (CELL_SIZE + 8) + 8,
                backgroundColor: COLORS[tile.value] || COLORS[0],
                opacity: tile.anim,
                transform: [{ scale: tile.scale }],
              },
            ]}
          >
            <Text style={styles.cellText}>{tile.value}</Text>
            {tile.count > 2 && (
              <Text style={styles.mergeCountText}>×4</Text>
            )}
          </Animated.View>
        ))}
        
        {/* Merge result animation */}
        {mergeResult && (
          <Animated.View
            style={[
              styles.mergeResult,
              {
                left: mergeResult.col * (CELL_SIZE + 8) + 8,
                top: mergeResult.row * (CELL_SIZE + 8) + 8,
                backgroundColor: COLORS[mergeResult.value] || COLORS[0],
                opacity: mergeResult.anim,
                transform: [{ scale: mergeResult.scale }],
              },
            ]}
          >
            <Text style={styles.cellText}>{mergeResult.value}</Text>
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
            setShowGuide(true); // Show guide again on restart
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
  board: {
    backgroundColor: '#222',
    borderRadius: 12,
    padding: 0,
    marginTop: 2,
    marginBottom: 10,
    width: COLS * (CELL_SIZE + CELL_MARGIN) - CELL_MARGIN,
    height: ROWS * (CELL_SIZE + CELL_MARGIN) - CELL_MARGIN,
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
  mergingTile: {
    position: 'absolute',
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 15,
    shadowColor: '#ffd700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
  },
  mergeResult: {
    position: 'absolute',
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
    shadowColor: '#ffd700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 12,
  },
  mergeCountText: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ffd700',
    color: '#222',
    fontSize: 12,
    fontWeight: 'bold',
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 2,
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
  nextBlockAbsolute: {
    position: 'absolute',
    top: 0,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    zIndex: 20,
  },
  guideOverlay: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
  guideText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 12,
  },
});

export default DropNumberBoard; 