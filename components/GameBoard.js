import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
} from 'react-native';

const { width } = Dimensions.get('window');
const BOARD_SIZE = 5;
const CELL_SIZE = (width - 40) / BOARD_SIZE;
const GRID_SIZE = 4;

const GameBoard = () => {
  const [board, setBoard] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [slidingTiles, setSlidingTiles] = useState([]);
  const slideAnimations = useRef({});

  // Initialize the board
  useEffect(() => {
    initializeBoard();
  }, []);

  // Auto-slide effect - periodically add new tiles
  useEffect(() => {
    if (gameOver || won) return;
    
    const autoSlideInterval = setInterval(() => {
      setBoard(currentBoard => {
        const newBoard = currentBoard.map(row => [...row]);
        addRandomTile(newBoard);
        return newBoard;
      });
    }, 3000); // Add new tile every 3 seconds
    
    return () => clearInterval(autoSlideInterval);
  }, [gameOver, won]);

  // Update all logic to use BOARD_SIZE for rows and GRID_SIZE for columns
  // Board initialization
  const initializeBoard = () => {
    const newBoard = Array(BOARD_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
    addRandomTile(newBoard);
    addRandomTile(newBoard);
    setBoard(newBoard);
    setScore(0);
    setGameOver(false);
    setWon(false);
  };

  const addRandomTile = (boardState) => {
    // Find empty cells in the bottom row (BOARD_SIZE - 1)
    const bottomRow = BOARD_SIZE - 1;
    const emptyBottomCells = [];
    
    for (let col = 0; col < GRID_SIZE; col++) {
      if (boardState[bottomRow][col] === 0) {
        emptyBottomCells.push(col);
      }
    }
    
    if (emptyBottomCells.length > 0) {
      const randomCol = emptyBottomCells[Math.floor(Math.random() * emptyBottomCells.length)];
      const newValue = Math.random() < 0.9 ? 2 : 4;
      
      // Add tile at the bottom
      boardState[bottomRow][randomCol] = newValue;
      
      // Add to sliding tiles for animation
      const tileId = `sliding-${Date.now()}-${randomCol}`;
      const newSlidingTile = {
        id: tileId,
        row: bottomRow,
        col: randomCol,
        value: newValue,
        targetRow: findTargetRow(boardState, randomCol),
      };
      
      setSlidingTiles(prev => [...prev, newSlidingTile]);
      
      // Start sliding animation
      startSlideAnimation(newSlidingTile);
    }
  };

  const findTargetRow = (boardState, col) => {
    // Find the highest empty row in the column
    for (let row = 0; row < BOARD_SIZE; row++) {
      if (boardState[row][col] === 0) {
        return row;
      }
    }
    return BOARD_SIZE - 1; // If no empty space, stay at bottom
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
    
    // Check if we can combine with the tile above
    if (row > 0 && boardState[row - 1][col] === value) {
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

    for (let row = 0; row < BOARD_SIZE; row++) {
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

    for (let row = 0; row < BOARD_SIZE; row++) {
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
      
      // Move all non-zero values up
      for (let row = 0; row < BOARD_SIZE; row++) {
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
      
      // Fill remaining spaces with zeros
      while (newCol.length < BOARD_SIZE) {
        newCol.push(0);
      }
      
      // Check if the column changed
      for (let row = 0; row < BOARD_SIZE; row++) {
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
      
      // Move all non-zero values down
      for (let row = BOARD_SIZE - 1; row >= 0; row--) {
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
      
      // Fill remaining spaces with zeros
      while (newCol.length < BOARD_SIZE) {
        newCol.unshift(0);
      }
      
      // Check if the column changed
      for (let row = 0; row < BOARD_SIZE; row++) {
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
    // Check if there are any empty cells
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (boardState[row][col] === 0) {
          return false;
        }
      }
    }
    
    // Check if any moves are possible
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const currentValue = boardState[row][col];
        
        // Check right neighbor
        if (col < GRID_SIZE - 1 && boardState[row][col + 1] === currentValue) {
          return false;
        }
        
        // Check bottom neighbor
        if (row < BOARD_SIZE - 1 && boardState[row + 1][col] === currentValue) {
          return false;
        }
      }
    }
    
    return true;
  };

  const checkWin = (boardState) => {
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (boardState[row][col] >= 1024) {
          return true;
        }
      }
    }
    return false;
  };

  const handleMove = (direction) => {
    if (gameOver) return;
    
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
      
      // Add new tile after a short delay to allow for visual feedback
      setTimeout(() => {
        addRandomTile(newBoard);
      }, 300);
      
      if (checkWin(newBoard) && !won) {
        setWon(true);
      }
      
      if (checkGameOver(newBoard)) {
        setGameOver(true);
      }
    }
  };



  const getTileColor = (value) => {
    const colors = {
      0: '#cdc1b4',
      2: '#eee4da',
      4: '#ede0c8',
      8: '#f2b179',
      16: '#f59563',
      32: '#f67c5f',
      64: '#f65e3b',
      128: '#edcf72',
      256: '#edcc61',
      512: '#edc850',
      1024: '#edc53f',
      2048: '#edc22e',
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
                    { backgroundColor: getTileColor(cell) }
                  ]}
                >
                  {cell !== 0 && (
                    <Text style={[
                      styles.cellText,
                      { color: getTileTextColor(cell) }
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
                    backgroundColor: getTileColor(slidingTile.value),
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
    backgroundColor: '#faf8ef',
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
    color: '#776e65',
  },
  scoreContainer: {
    backgroundColor: '#bbada0',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    minWidth: 80,
  },
  scoreLabel: {
    color: '#eee4da',
    fontSize: 12,
    fontWeight: 'bold',
  },
  scoreValue: {
    color: '#f9f6f2',
    fontSize: 20,
    fontWeight: 'bold',
  },
  boardContainer: {
    alignItems: 'center',
  },
  board: {
    backgroundColor: '#bbada0',
    borderRadius: 8,
    padding: 8,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    margin: 4,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  slidingTile: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
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