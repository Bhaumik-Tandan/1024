import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import soundManager from '../utils/soundManager';

// Web-compatible dimensions
const getDimensions = () => {
  try {
    const dimensions = Dimensions.get('window');
    return {
      width: dimensions?.width || (Platform.OS === 'web' ? 400 : 400),
    };
  } catch (error) {
    return {
      width: Platform.OS === 'web' ? 400 : 400,
    };
  }
};

const { width } = getDimensions();
const BOARD_SIZE = 9; // Changed from 5 to 9 rows
const CELL_SIZE = (width - 40) / 5; // Keep 5 columns
const GRID_SIZE = 5; // Changed from 4 to 5 columns
const VISIBLE_ROWS = 8; // Only 8 rows are visible/playable, bottom row is transparent

const GameBoard = () => {
  const [board, setBoard] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [slidingTiles, setSlidingTiles] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const slideAnimations = useRef({});
  const autoSlideIntervalRef = useRef(null);

  // Initialize the board
  useEffect(() => {
    initializeBoard();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoSlideIntervalRef.current) {
        clearInterval(autoSlideIntervalRef.current);
        autoSlideIntervalRef.current = null;
      }
    };
  }, []);

  // Auto-slide effect - periodically add new tiles
  useEffect(() => {
    if (gameOver || won || !gameStarted) {
      if (autoSlideIntervalRef.current) {
        clearInterval(autoSlideIntervalRef.current);
        autoSlideIntervalRef.current = null;
      }
      return;
    }
    
    // Add a delay before starting auto-slide to prevent immediate execution
    const startDelay = setTimeout(() => {
      autoSlideIntervalRef.current = setInterval(() => {
        // Use callback style to get current state without dependencies
        setBoard(currentBoard => {
          // Check if there are empty cells in bottom row
          const bottomRow = BOARD_SIZE - 1;
          const emptyBottomCells = [];
          
          for (let col = 0; col < GRID_SIZE; col++) {
            if (currentBoard[bottomRow][col] === 0) {
              emptyBottomCells.push(col);
            }
          }
          
          if (emptyBottomCells.length === 0) {
            return currentBoard; // No empty cells
          }
          
          // Create new board with tile added
          const newBoard = currentBoard.map(row => [...row]);
          const randomCol = emptyBottomCells[Math.floor(Math.random() * emptyBottomCells.length)];
          const newValue = Math.random() < 0.9 ? 64 : 128; // Mercury or Mars
          newBoard[bottomRow][randomCol] = newValue;
          
          // Play Mars sound if Mars was generated
          if (newValue === 128) {
            soundManager.playMarsSound();
          }
          
          // Add sliding animation asynchronously to avoid state update conflicts
          setTimeout(() => {
            const targetRow = findTargetRow(newBoard, randomCol);
            const tileId = `sliding-${Date.now()}-${randomCol}`;
            const newSlidingTile = {
              id: tileId,
              row: bottomRow,
              col: randomCol,
              value: newValue,
              targetRow: targetRow,
            };
            
            setSlidingTiles(prev => [...prev, newSlidingTile]);
            startSlideAnimation(newSlidingTile);
          }, 50); // Small delay to prevent conflicts
          
          return newBoard;
        });
      }, 3000); // Add new tile every 3 seconds
    }, 1000); // 1 second delay before starting auto-slide
    
    return () => {
      clearTimeout(startDelay);
      if (autoSlideIntervalRef.current) {
        clearInterval(autoSlideIntervalRef.current);
        autoSlideIntervalRef.current = null;
      }
    };
  }, [gameOver, won, gameStarted]); // Minimal dependencies

  // Update all logic to use BOARD_SIZE for rows and GRID_SIZE for columns
  // Board initialization
  const initializeBoard = () => {
    const newBoard = Array(BOARD_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
    // Add initial tiles without animation during setup
    addInitialTile(newBoard);
    addInitialTile(newBoard);
    setBoard(newBoard);
    setScore(0);
    setGameOver(false);
    setWon(false);
    setGameStarted(true); // Mark game as started after initialization
  };

  // Helper function to add initial tiles to the board
  const addInitialTile = (board) => {
    const emptyPositions = [];
    
    // Find all empty positions
    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[row].length; col++) {
        if (board[row][col] === 0) {
          emptyPositions.push([row, col]);
        }
      }
    }
    
    if (emptyPositions.length === 0) return board;
    
    // Pick random empty position
    const randomIndex = Math.floor(Math.random() * emptyPositions.length);
    const [row, col] = emptyPositions[randomIndex];
    
    // Generate Mercury (2) or Mars (4)
    const newValue = Math.random() < 0.7 ? 2 : 4; // 70% Mercury, 30% Mars
    
    // Play Mars sound if Mars is generated
    if (newValue === 4) {
      soundManager.playMarsSound();
    }
    
    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = newValue;
    return newBoard;
  };

  // Helper function to add random tiles during gameplay
  const addRandomTile = (board) => {
    const emptyPositions = [];
    
    // Find all empty positions  
    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[row].length; col++) {
        if (board[row][col] === 0) {
          emptyPositions.push([row, col]);
        }
      }
    }
    
    if (emptyPositions.length === 0) return board;
    
    // Pick random empty position
    const randomIndex = Math.floor(Math.random() * emptyPositions.length);
    const [row, col] = emptyPositions[randomIndex];
    
    // Generate Mercury (2) or Mars (4)
    const newValue = Math.random() < 0.7 ? 2 : 4; // 70% Mercury, 30% Mars
    
    // Play Mars sound if Mars is generated
    if (newValue === 4) {
      soundManager.playMarsSound();
    }
    
    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = newValue;
    return newBoard;
  };

  const findTargetRow = (boardState, col) => {
    // Find the highest empty row in the column (only check visible rows)
    for (let row = 0; row < VISIBLE_ROWS; row++) {
      if (boardState[row][col] === 0) {
        return row;
      }
    }
    return VISIBLE_ROWS - 1; // If no empty space in visible area, stay at bottom of visible area
  };

  const startSlideAnimation = (slidingTile) => {
    const animation = new Animated.Value(0);
    slideAnimations.current[slidingTile.id] = animation;
    
    Animated.timing(animation, {
      toValue: 1,
      duration: 500,
      useNativeDriver: false,
    }).start(() => {
      // Animation completed, move tile to target position
      completeSlideAnimation(slidingTile);
    });
  };

  const completeSlideAnimation = (slidingTile) => {
    setBoard(currentBoard => {
      const newBoard = currentBoard.map(row => [...row]);
      
      // Remove from current position
      newBoard[slidingTile.row][slidingTile.col] = 0;
      
      // Add to target position
      newBoard[slidingTile.targetRow][slidingTile.col] = slidingTile.value;
      
      // Check for combinations
      checkAndCombine(newBoard, slidingTile.targetRow, slidingTile.col);
      
      return newBoard;
    });
    
    // Remove from sliding tiles
    setSlidingTiles(prev => prev.filter(tile => tile.id !== slidingTile.id));
    delete slideAnimations.current[slidingTile.id];
  };

  const checkAndCombine = (boardState, row, col) => {
    const value = boardState[row][col];
    
    // Check if we can combine with the tile above (only within visible area)
    if (row > 0 && row < VISIBLE_ROWS && boardState[row - 1][col] === value) {
      boardState[row - 1][col] *= 2;
      boardState[row][col] = 0;
      setScore(prev => prev + boardState[row - 1][col]);
    }
  };

  // Helper: Chain merge for a row (left to right)
  function chainMergeRow(rowArr, updateScore) {
    let merged = true;
    while (merged) {
      // Compact row before checking for merges
      let compacted = rowArr.filter(v => v !== 0);
      while (compacted.length < rowArr.length) compacted.push(0);
      for (let i = 0; i < rowArr.length; i++) rowArr[i] = compacted[i];

      merged = false;
      for (let i = 0; i < rowArr.length - 1; i++) {
        if (rowArr[i] !== 0 && rowArr[i] === rowArr[i + 1]) {
          rowArr[i] *= 2;
          updateScore(rowArr[i]);
          rowArr[i + 1] = 0;
          merged = true;
          // After a merge, break to re-compact and re-check from the start
          break;
        }
      }
    }
  }

  // In moveLeft and moveRight, use GRID_SIZE for columns
  const moveLeft = (boardState) => {
    let moved = false;
    let newScore = score;

    for (let row = 0; row < VISIBLE_ROWS; row++) { // Only move visible rows
      let newRow = boardState[row].slice(0, GRID_SIZE); // Always use GRID_SIZE columns
      // Chain merge (handles all compaction and merging)
      chainMergeRow(newRow, val => { newScore += val; });
      // Check if the row changed
      for (let col = 0; col < GRID_SIZE; col++) {
        if (boardState[row][col] !== newRow[col]) {
          moved = true;
        }
        boardState[row][col] = newRow[col];
      }
    }
    setScore(newScore);
    return moved;
  };

  const moveRight = (boardState) => {
    let moved = false;
    let newScore = score;

    for (let row = 0; row < VISIBLE_ROWS; row++) { // Only move visible rows
      let newRow = boardState[row].slice(0, GRID_SIZE).reverse();
      // Chain merge (handles all compaction and merging)
      chainMergeRow(newRow, val => { newScore += val; });
      newRow = newRow.reverse();
      // Check if the row changed
      for (let col = 0; col < GRID_SIZE; col++) {
        if (boardState[row][col] !== newRow[col]) {
          moved = true;
        }
        boardState[row][col] = newRow[col];
      }
    }
    setScore(newScore);
    return moved;
  };

  // In moveUp and moveDown, use BOARD_SIZE for rows and GRID_SIZE for columns
  const moveUp = (boardState) => {
    let moved = false;
    let newScore = score;

    for (let col = 0; col < GRID_SIZE; col++) {
      const newCol = [];
      let lastValue = 0;
      
      // Move all non-zero values up (only from visible rows)
      for (let row = 0; row < VISIBLE_ROWS; row++) {
        if (boardState[row][col] !== 0) {
          if (lastValue === boardState[row][col]) {
            newCol[newCol.length - 1] *= 2;
            newScore += newCol[newCol.length - 1];
            lastValue = 0;
          } else {
            if (lastValue !== 0) {
              newCol.push(lastValue);
            }
            lastValue = boardState[row][col];
          }
        }
      }
      
      if (lastValue !== 0) {
        newCol.push(lastValue);
      }
      
      // Fill remaining spaces with zeros (only for visible rows)
      while (newCol.length < VISIBLE_ROWS) {
        newCol.push(0);
      }
      
      // Check if the column changed
      for (let row = 0; row < VISIBLE_ROWS; row++) {
        if (boardState[row][col] !== newCol[row]) {
          moved = true;
        }
        boardState[row][col] = newCol[row];
      }
    }
    
    setScore(newScore);
    return moved;
  };

  const moveDown = (boardState) => {
    let moved = false;
    let newScore = score;

    for (let col = 0; col < GRID_SIZE; col++) {
      const newCol = [];
      let lastValue = 0;
      
      // Move all non-zero values down (only from visible rows)
      for (let row = VISIBLE_ROWS - 1; row >= 0; row--) {
        if (boardState[row][col] !== 0) {
          if (lastValue === boardState[row][col]) {
            newCol[0] *= 2;
            newScore += newCol[0];
            lastValue = 0;
          } else {
            if (lastValue !== 0) {
              newCol.unshift(lastValue);
            }
            lastValue = boardState[row][col];
          }
        }
      }
      
      if (lastValue !== 0) {
        newCol.unshift(lastValue);
      }
      
      // Fill remaining spaces with zeros (only for visible rows)
      while (newCol.length < VISIBLE_ROWS) {
        newCol.unshift(0);
      }
      
      // Check if the column changed
      for (let row = 0; row < VISIBLE_ROWS; row++) {
        if (boardState[row][col] !== newCol[row]) {
          moved = true;
        }
        boardState[row][col] = newCol[row];
      }
    }
    
    setScore(newScore);
    return moved;
  };

  const checkGameOver = (boardState) => {
    // Check if there are any empty cells in visible area
    for (let row = 0; row < VISIBLE_ROWS; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (boardState[row][col] === 0) {
          return false;
        }
      }
    }
    
    // Check if any moves are possible in visible area
    for (let row = 0; row < VISIBLE_ROWS; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const currentValue = boardState[row][col];
        
        // Check right neighbor
        if (col < GRID_SIZE - 1 && boardState[row][col + 1] === currentValue) {
          return false;
        }
        
        // Check bottom neighbor
        if (row < VISIBLE_ROWS - 1 && boardState[row + 1][col] === currentValue) {
          return false;
        }
      }
    }
    
    return true;
  };



  const handleMove = (direction) => {
    if (gameOver || slidingTiles.length > 0) return; // Prevent moves during animations
    
    const newBoard = board.map(row => [...row]);
    let moved = false;
    
    switch (direction) {
      case 'left':
        moved = moveLeft(newBoard);
        break;
      case 'right':
        moved = moveRight(newBoard);
        break;
      case 'up':
        moved = moveUp(newBoard);
        break;
      case 'down':
        moved = moveDown(newBoard);
        break;
    }
    
    if (moved) {
      setBoard(newBoard);
      
      // Don't add new tile manually - let the auto-slide handle it
      // Remove the setTimeout that was adding tiles after moves
      
      if (checkGameOver(newBoard)) {
        setGameOver(true);
      }
    }
  };



  const getTileColor = (value, row) => {
    // Make bottom row transparent
    if (row === BOARD_SIZE - 1) {
      return 'transparent';
    }
    
    // Use new vibrant colors from constants
    const colors = {
      0: '#2c2c2c',
      2: '#FFE0B2',
      4: '#FFCC80',
      8: '#FFB74D',
      16: '#FF9800',
      32: '#FF7043',
      64: '#FFEB3B',
      128: '#CDDC39',
      256: '#8BC34A',
      512: '#4CAF50',
      1024: '#009688',
      2048: '#00BCD4',
    };
    return colors[value] || '#3c3a32';
  };

  const getTileTextColor = (value) => {
    return value <= 4 ? '#776e65' : '#f9f6f2';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>1024</Text>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>Score</Text>
          <Text style={styles.scoreValue}>{score}</Text>
        </View>
      </View>
      
      <View style={styles.boardContainer}>
        <View style={styles.board}>
          {board.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {row.map((cell, colIndex) => (
                <View
                  key={`${rowIndex}-${colIndex}`}
                  style={[
                    styles.cell,
                    { 
                      backgroundColor: getTileColor(cell, rowIndex),
                      borderWidth: rowIndex === BOARD_SIZE - 1 ? 1 : 0,
                      borderColor: rowIndex === BOARD_SIZE - 1 ? '#bbada0' : 'transparent',
                      borderStyle: rowIndex === BOARD_SIZE - 1 ? 'dashed' : 'solid'
                    }
                  ]}
                >
                  {cell !== 0 && rowIndex !== BOARD_SIZE - 1 && (
                    <Text style={[
                      styles.cellText,
                      { color: getTileTextColor(cell) }
                    ]}>
                      {cell}
                    </Text>
                  )}
                  {cell !== 0 && rowIndex === BOARD_SIZE - 1 && (
                    <Text style={[
                      styles.cellText,
                      { color: '#776e65', opacity: 0.7 }
                    ]}>
                      {cell}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          ))}
          
          {/* Render sliding tiles */}
          {slidingTiles.map((slidingTile) => {
            const animation = slideAnimations.current[slidingTile.id];
            if (!animation) return null;
            
            const animatedStyle = {
              transform: [{
                translateY: animation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, (slidingTile.targetRow - slidingTile.row) * (CELL_SIZE + 8)],
                })
              }]
            };
            
            return (
              <Animated.View
                key={slidingTile.id}
                style={[
                  styles.slidingTile,
                  {
                    position: 'absolute',
                    top: slidingTile.row * (CELL_SIZE + 8) + 8,
                    left: slidingTile.col * (CELL_SIZE + 8) + 8,
                    backgroundColor: getTileColor(slidingTile.value, slidingTile.targetRow),
                  },
                  animatedStyle
                ]}
              >
                <Text style={[
                  styles.cellText,
                  { color: getTileTextColor(slidingTile.value) }
                ]}>
                  {slidingTile.value}
                </Text>
              </Animated.View>
            );
          })}
        </View>
      </View>
      
      <View style={styles.controls}>
        <View style={styles.controlRow}>
          <TouchableOpacity style={styles.controlButton} onPress={() => handleMove('up')}>
            <Text style={styles.controlText}>↑</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.controlRow}>
          <TouchableOpacity style={styles.controlButton} onPress={() => handleMove('left')}>
            <Text style={styles.controlText}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={() => handleMove('down')}>
            <Text style={styles.controlText}>↓</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={() => handleMove('right')}>
            <Text style={styles.controlText}>→</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {(gameOver || won) && (
        <View style={styles.overlay}>
          <View style={styles.messageContainer}>
            <Text style={styles.messageText}>
              {won ? 'You Won!' : 'Game Over!'}
            </Text>
            <Text style={styles.finalScore}>Final Score: {score}</Text>
            <Text style={styles.restartText} onPress={initializeBoard}>
              Tap to restart
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#212529',
  },
  scoreContainer: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dee2e6',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    minWidth: 80,
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  scoreLabel: {
    color: '#6c757d',
    fontSize: 12,
    fontWeight: 'bold',
  },
  scoreValue: {
    color: '#212529',
    fontSize: 20,
    fontWeight: 'bold',
  },
  boardContainer: {
    alignItems: 'center',
  },
  board: {
    backgroundColor: '#e9ecef',
    borderRadius: 8,
    padding: 8,
    borderWidth: 2,
    borderColor: '#dee2e6',
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    margin: 4,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  cellText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  slidingTile: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageContainer: {
    backgroundColor: '#faf8ef',
    padding: 30,
    borderRadius: 8,
    alignItems: 'center',
  },
  messageText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#776e65',
    marginBottom: 10,
  },
  finalScore: {
    fontSize: 18,
    color: '#776e65',
    marginBottom: 20,
  },
  restartText: {
    fontSize: 16,
    color: '#8f7a66',
    textDecorationLine: 'underline',
  },
  controls: {
    marginTop: 30,
    alignItems: 'center',
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 5,
  },
  controlButton: {
    width: 60,
    height: 60,
    backgroundColor: '#bbada0',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  controlText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f9f6f2',
  },
});

export default GameBoard; 